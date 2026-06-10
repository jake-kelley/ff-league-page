// Set pick_original_owner_team on every pick row from the authoritative
// Sleeper roster_id -> (team_name || display_name) map, keyed by the existing
// pick_original_owner (roster id) column. Replaces "VACANT"/blank with the real
// original owner; leaves active-team labels unchanged (they already match).
//
//   node scripts/fill-pick-original-owner.mjs <target-csv>

import { readFileSync, writeFileSync } from 'node:fs';

const LEAGUE = '1317629034393276416';
const csvPath = process.argv[2];
if (!csvPath) { console.error('usage: node scripts/fill-pick-original-owner.mjs <csv>'); process.exit(1); }

const [rosters, users] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE}/rosters`).then((r) => r.json()),
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE}/users`).then((r) => r.json()),
]);
const uinfo = {};
for (const u of users) uinfo[u.user_id] = u.metadata?.team_name || u.display_name;
const nameByRoster = {};
for (const r of rosters) nameByRoster[r.roster_id] = uinfo[r.owner_id] || `roster${r.roster_id}`;
console.log('roster -> original-owner label:', JSON.stringify(nameByRoster));

const raw = readFileSync(csvPath, 'utf8');
const eol = raw.match(/\r\n|\n/)?.[0] ?? '\r\n';
const lines = raw.split(/\r?\n/);
const header = lines[0].split(',');
const I = (n) => header.indexOf(n);
const idx = { type: I('asset_type'), origRoster: I('pick_original_owner'), origTeam: I('pick_original_owner_team') };
if (idx.origTeam < 0) throw new Error('Missing pick_original_owner_team column');

const csvCell = (s) => (/[",\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s));
let changed = 0, unchanged = 0, noRoster = 0;
const out = [lines[0]];
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { out.push(line); continue; }
    const c = line.split(',');
    if ((c[idx.type] || '').trim().toLowerCase() !== 'pick') { out.push(line); continue; }
    const rid = (c[idx.origRoster] || '').trim();
    const label = nameByRoster[rid];
    if (!label) { noRoster++; console.log(`NO ROSTER for pick row: ${line}`); out.push(line); continue; }
    const before = c[idx.origTeam] ?? '';
    const after = csvCell(label);
    if (before !== after) { changed++; if (before !== label) console.log(`  ${rid}: "${before}" -> "${label}"`); }
    else unchanged++;
    c[idx.origTeam] = after;
    out.push(c.join(','));
}

writeFileSync(csvPath, out.join(eol) + (raw.endsWith(eol) ? eol : ''), 'utf8');
console.log('---');
console.log(`Pick labels changed:   ${changed}`);
console.log(`Pick labels unchanged: ${unchanged}`);
console.log(`Pick rows w/o roster:  ${noRoster}`);
console.log(`Wrote ${csvPath}`);
