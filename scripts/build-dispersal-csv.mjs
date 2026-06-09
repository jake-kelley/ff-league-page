// One-off: builds a dispersal-draft CSV from Sleeper rosters 6/7/8 plus a hard-coded
// free-agent pool, with sleeper_id populated so refresh-fc-values.mjs can fill fc_value.
//
//   node scripts/build-dispersal-csv.mjs <out-csv-path>
//
// fc_value is left blank; run refresh-fc-values.mjs afterward to populate it.

import { writeFileSync } from 'node:fs';

const LEAGUE_ID = '1317629034393276416';
const ROSTERS = [6, 7, 8];

// Listed free-agent pool: [name, position, nfl_team]. Position disambiguates name clashes.
const FREE_AGENTS = [
    ['Tyrone Tracy', 'RB', 'NYG'],
    ['Jordan James', 'RB', 'SF'],
    ['Ollie Gordon', 'RB', 'MIA'],
    ['Cam Ward', 'QB', 'TEN'],
    ['Travis Hunter', 'WR', 'JAX'],
    ['Efton Chism', 'WR', 'NE'],
    ['Geno Smith', 'QB', 'NYJ'],
    ['Davante Adams', 'WR', 'LAR'],
    ['Mike Evans', 'WR', 'SF'],
    ['Stefon Diggs', 'WR', ''],
    ['David Njoku', 'TE', 'LAC'],
    ['James Conner', 'RB', 'ARI'],
    ['Matthew Stafford', 'QB', 'LAR'],
    ['Christian Kirk', 'WR', 'SF'],
    ['Calvin Ridley', 'WR', 'TEN'],
    ['Dallas Goedert', 'TE', 'PHI'],
    ['Josh Jacobs', 'RB', 'GB'],
    ['Jonathan Taylor', 'RB', 'IND'],
    ['Michael Pittman', 'WR', 'PIT'],
    ['Cole Kmet', 'TE', 'CHI'],
    ['Jalen Hurts', 'QB', 'PHI'],
    ['Amon-Ra St. Brown', 'WR', 'DET'],
    ['Joshua Palmer', 'WR', 'BUF'],
    ['Tyler Allgeier', 'RB', 'ARI'],
    ['Khalil Shakir', 'WR', 'BUF'],
    ['Rachaad White', 'RB', 'WAS'],
    ['Alec Pierce', 'WR', 'IND'],
    ['John Metchie', 'WR', 'CAR'],
];

const out = process.argv[2];
if (!out) { console.error('usage: node scripts/build-dispersal-csv.mjs <out-csv-path>'); process.exit(1); }

const norm = (s) => (s || '')
    .toLowerCase()
    .replace(/[.'`]/g, '')
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

console.log('Fetching rosters and players…');
const [rostersRes, playersRes] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`),
    fetch('https://api.sleeper.app/v1/players/nfl'),
]);
const rosters = await rostersRes.json();
const players = await playersRes.json();

// Index players for free-agent name matching.
const byNorm = new Map();
for (const id of Object.keys(players)) {
    const p = players[id];
    if (!p || p.position == null) continue;
    const name = p.full_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
    if (!name) continue;
    const key = norm(name);
    if (!byNorm.has(key)) byNorm.set(key, []);
    byNorm.get(key).push({ id, name, position: p.position, team: p.team });
}

const rows = []; // {asset_type, sleeper_id, player_name, position, nfl_team}
const seen = new Set();
const pushPlayer = (id, name, position, team) => {
    if (seen.has(id)) return;
    seen.add(id);
    rows.push({ asset_type: 'player', sleeper_id: id, player_name: name, position: position || '', nfl_team: team || '' });
};

// Roster players (full lists, including bench).
for (const r of rosters) {
    if (!ROSTERS.includes(r.roster_id)) continue;
    for (const id of r.players || []) {
        const p = players[id];
        if (!p) { console.log(`ROSTER ${r.roster_id}: unknown player id ${id}`); continue; }
        const name = p.full_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
        pushPlayer(id, name, p.position, p.team);
    }
}
const rosterCount = rows.length;

// Free agents: match by normalized name, disambiguate by position, prefer exact-norm match.
for (const [name, pos, team] of FREE_AGENTS) {
    const key = norm(name);
    let cands = byNorm.get(key) || [];
    // Fall back to startsWith for suffix/short-name variants (e.g. "Cam" -> "Cameron").
    if (!cands.length) {
        for (const [k, list] of byNorm) {
            if (k.startsWith(key) || key.startsWith(k)) cands = cands.concat(list);
        }
    }
    const byPos = cands.filter((c) => c.position === pos);
    const pick = (byPos.length ? byPos : cands);
    if (!pick.length) { console.log(`NO MATCH: ${name} (${pos})`); continue; }
    if (pick.length > 1) console.log(`AMBIGUOUS: ${name} (${pos}) -> ${pick.map((c) => `${c.name}#${c.id}/${c.team}`).join(', ')} [using first]`);
    const c = pick[0];
    pushPlayer(c.id, c.name, c.position, team || c.team);
}

const header = 'asset_type,sleeper_id,player_name,position,nfl_team,fc_value,pick_year,pick_round,pick_spot';
const csvCell = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const lines = [header];
for (const r of rows) {
    lines.push([r.asset_type, r.sleeper_id, csvCell(r.player_name), r.position, r.nfl_team, '', '', '', ''].join(','));
}
writeFileSync(out, lines.join('\r\n') + '\r\n', 'utf8');
console.log('---');
console.log(`Wrote ${out}`);
console.log(`Roster 6/7/8 players: ${rosterCount}`);
console.log(`Free agents added:    ${rows.length - rosterCount}`);
console.log(`Total rows:           ${rows.length}`);
