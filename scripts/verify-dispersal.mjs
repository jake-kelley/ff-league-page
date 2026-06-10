// Compare a dispersal draft-results CSV to the live Sleeper rosters and flag any
// player or pick that didn't end up where it was drafted.
//
//   node scripts/verify-dispersal.mjs <draft-results.csv>

import { readFileSync } from 'node:fs';

const LEAGUE = '1317629034393276416';
const csvPath = process.argv[2];
if (!csvPath) { console.error('usage: node scripts/verify-dispersal.mjs <csv>'); process.exit(1); }

const norm = (s) => (s || '').toLowerCase()
    .replace(/[.'`]/g, '').replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '')
    .replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

// ---- Sleeper data ----
const [rosters, users, players, tp] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE}/rosters`).then((r) => r.json()),
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE}/users`).then((r) => r.json()),
    fetch('https://api.sleeper.app/v1/players/nfl').then((r) => r.json()),
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE}/traded_picks`).then((r) => r.json()),
]);
const uName = {}; for (const u of users) uName[u.user_id] = u.metadata?.team_name || u.display_name;
const rosterLabel = {}; for (const r of rosters) rosterLabel[r.roster_id] = uName[r.owner_id] || `roster${r.roster_id}`;
const labelToRoster = {}; for (const r of rosters) labelToRoster[uName[r.owner_id]] = r.roster_id;
// also allow username->roster (vacant teams labelled by username)
for (const u of users) for (const r of rosters) if (r.owner_id === u.user_id) labelToRoster[u.display_name] = r.roster_id;

// current player -> roster (normalized name)
const playerRoster = new Map();
const nameById = (id) => { const p = players[id]; return p ? (p.full_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()) : id; };
for (const r of rosters) for (const id of r.players || []) playerRoster.set(norm(nameById(id)), { roster: r.roster_id, id });

// current pick ownership: base = original owner, override with traded_picks
const SEASONS = ['2026', '2027', '2028'], ROUNDS = [1, 2, 3, 4];
const pickOwner = new Map(); // `${season}-${round}-${origRoster}` -> current roster
for (const r of rosters) for (const s of SEASONS) for (const rd of ROUNDS) pickOwner.set(`${s}-${rd}-${r.roster_id}`, r.roster_id);
for (const t of tp) { const k = `${t.season}-${t.round}-${t.roster_id}`; if (pickOwner.has(k)) pickOwner.set(k, t.owner_id); }

// ---- Parse draft CSV ----
const lines = readFileSync(csvPath, 'utf8').split(/\r?\n/).filter((l) => l.trim());
const head = lines[0].split(',');
const ci = (n) => head.indexOf(n);
const c = { team: ci('team'), asset: ci('asset'), type: ci('asset_type'), orig: ci('pick_original_owner') };
const ORD = { '1st': 1, '2nd': 2, '3rd': 3, '4th': 4 };

const draftPlayers = {};   // drafter -> [normName]
const draftPicks = {};     // drafter -> [{season, round, origRoster, label}]
const unmatchedPickOwner = [];
for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(',');
    const drafter = cells[c.team].trim();
    const asset = cells[c.asset].trim();
    if (cells[c.type].trim().toLowerCase() === 'pick') {
        let m = asset.match(/(\d{4})\s+(\d)\.(\d+)/) || asset.match(/(\d{4})\s+(\d)(?:st|nd|rd|th)/i);
        let season, round;
        if (m) { season = m[1]; round = parseInt(m[2], 10); }
        else { const mm = asset.match(/(\d{4})\s+(\d(?:st|nd|rd|th))/i); season = mm?.[1]; round = ORD[mm?.[2]?.toLowerCase()]; }
        const origLabel = (cells[c.orig] || '').trim();
        const origRoster = labelToRoster[origLabel];
        if (origRoster == null) unmatchedPickOwner.push(`${asset} (orig="${origLabel}")`);
        (draftPicks[drafter] ??= []).push({ season, round, origRoster, label: asset, origLabel });
    } else {
        (draftPlayers[drafter] ??= []).push(norm(asset));
    }
}

// ---- Infer drafter -> roster by player overlap ----
const drafters = Object.keys(draftPlayers);
const map = {};
for (const d of drafters) {
    const counts = {};
    for (const nm of draftPlayers[d]) { const pr = playerRoster.get(nm); if (pr) counts[pr.roster] = (counts[pr.roster] || 0) + 1; }
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    map[d] = best ? parseInt(best[0], 10) : null;
}
console.log('Inferred drafter -> roster:');
for (const d of drafters) console.log(`  ${d} -> roster ${map[d]} (${rosterLabel[map[d]]})`);
if (unmatchedPickOwner.length) console.log(`\n!! Unmapped pick original-owner labels: ${[...new Set(unmatchedPickOwner)].join(' | ')}`);

// ---- Compare ----
let problems = 0;
for (const d of drafters) {
    const R = map[d];
    const issues = [];
    // players: each drafted player should currently be on roster R
    for (const nm of draftPlayers[d]) {
        const pr = playerRoster.get(nm);
        if (!pr) issues.push(`PLAYER not on ANY roster (free agent / name?): "${nm}"`);
        else if (pr.roster !== R) issues.push(`PLAYER misassigned: "${nm}" is on roster ${pr.roster} (${rosterLabel[pr.roster]}), expected ${R}`);
    }
    // picks: each drafted pick should currently be owned by roster R
    for (const pk of draftPicks[d]) {
        if (pk.origRoster == null || !pk.season || !pk.round) { issues.push(`PICK unparseable/owner: "${pk.label}" orig="${pk.origLabel}"`); continue; }
        const key = `${pk.season}-${pk.round}-${pk.origRoster}`;
        const cur = pickOwner.get(key);
        if (cur == null) issues.push(`PICK not found in ownership map: ${pk.label} (${pk.origLabel}) [${key}]`);
        else if (cur !== R) issues.push(`PICK misassigned: ${pk.label} (orig ${pk.origLabel}) owned by roster ${cur} (${rosterLabel[cur]}), expected ${R}`);
    }
    console.log(`\n=== ${d} -> roster ${R} (${rosterLabel[R]}) | ${draftPlayers[d].length} players, ${draftPicks[d].length} picks ===`);
    if (!issues.length) console.log('  ✓ all drafted assets correctly assigned');
    else { problems += issues.length; for (const x of issues) console.log('  ✗ ' + x); }
}

// ---- Reverse check: roster players that were NOT drafted by the mapped drafter ----
console.log('\n=== Reverse check: players on rosters 5-8 not matching their drafter ===');
const rosterToDrafter = {}; for (const d of drafters) rosterToDrafter[map[d]] = d;
for (const r of rosters) {
    if (!(r.roster_id in rosterToDrafter)) continue;
    const d = rosterToDrafter[r.roster_id];
    const drafted = new Set(draftPlayers[d]);
    const extras = [];
    for (const id of r.players || []) { const nm = norm(nameById(id)); if (!drafted.has(nm)) extras.push(nameById(id)); }
    if (extras.length) { problems += extras.length; console.log(`  roster ${r.roster_id} (${d}) has ${extras.length} player(s) NOT drafted by ${d}: ${extras.join(', ')}`); }
}

console.log(`\n---\nTotal problems flagged: ${problems}`);
