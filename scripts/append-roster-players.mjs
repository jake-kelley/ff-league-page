// One-off: append players listed in a roster.txt to a vacant_teams_assets CSV as
// `player` rows with sleeper_id populated (fc_value left blank for refresh-fc-values.mjs).
//
//   node scripts/append-roster-players.mjs <roster.txt> <target-csv>
//
// roster.txt lines look like: "Darren Waller TE -" or "Jawhar Jordan RB - HOU"
// Matching mirrors build-dispersal-csv.mjs (normalized name, disambiguate by position).
// Players already present in the CSV (by sleeper_id) are skipped.

import { readFileSync, writeFileSync } from 'node:fs';

const [, , rosterPath, csvPath] = process.argv;
if (!rosterPath || !csvPath) {
    console.error('usage: node scripts/append-roster-players.mjs <roster.txt> <target-csv>');
    process.exit(1);
}

const norm = (s) => (s || '')
    .toLowerCase()
    .replace(/[.'`]/g, '')
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Parse roster.txt -> [{name, position, team}]
const POSSET = new Set(['QB', 'RB', 'WR', 'TE', 'K', 'DEF']);
const wanted = [];
for (const rawLine of readFileSync(rosterPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    // Separator is whitespace + dash + optional team (handles "RB - HOU" and "TE -").
    const [left, right = ''] = line.split(/\s+-\s*/);
    const tokens = left.trim().split(/\s+/);
    const position = tokens[tokens.length - 1].toUpperCase();
    if (!POSSET.has(position)) { console.log(`SKIP (no position): ${line}`); continue; }
    const name = tokens.slice(0, -1).join(' ');
    const team = right.trim();
    wanted.push({ name, position, team });
}
console.log(`Parsed ${wanted.length} players from roster.txt`);

console.log('Fetching Sleeper players…');
const players = await (await fetch('https://api.sleeper.app/v1/players/nfl')).json();
const byNorm = new Map();
for (const id of Object.keys(players)) {
    const p = players[id];
    if (!p || p.position == null) continue;
    const nm = p.full_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
    if (!nm) continue;
    const key = norm(nm);
    if (!byNorm.has(key)) byNorm.set(key, []);
    byNorm.get(key).push({ id, name: nm, position: p.position, team: p.team });
}

// Read target CSV, learn column count + existing sleeper_ids.
const raw = readFileSync(csvPath, 'utf8');
const eol = raw.match(/\r\n|\n/)?.[0] ?? '\r\n';
const lines = raw.split(/\r?\n/);
const header = lines[0].split(',');
const colCount = header.length;
const sidIdx = header.indexOf('sleeper_id');
const existing = new Set();
for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const sid = (lines[i].split(',')[sidIdx] || '').trim();
    if (sid) existing.add(sid);
}

const csvCell = (s) => (/[",\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s));
const newRows = [];
let skipped = 0;
for (const w of wanted) {
    const key = norm(w.name);
    let cands = byNorm.get(key) || [];
    if (!cands.length) {
        for (const [k, list] of byNorm) {
            if (k.startsWith(key) || key.startsWith(k)) cands = cands.concat(list);
        }
    }
    const byPos = cands.filter((c) => c.position === w.position);
    const pick = (byPos.length ? byPos : cands);
    if (!pick.length) { console.log(`NO MATCH: ${w.name} (${w.position})`); continue; }
    if (pick.length > 1) console.log(`AMBIGUOUS: ${w.name} (${w.position}) -> ${pick.map((c) => `${c.name}#${c.id}/${c.team}`).join(', ')} [using first]`);
    const c = pick[0];
    if (existing.has(c.id)) { console.log(`ALREADY PRESENT: ${c.name} #${c.id}`); skipped++; continue; }
    existing.add(c.id);
    // asset_type, sleeper_id, player_name, position, nfl_team, fc_value, then blanks to colCount
    const row = ['player', c.id, csvCell(c.name), c.position, (w.team || c.team || ''), ''];
    while (row.length < colCount) row.push('');
    newRows.push(row.join(','));
    console.log(`ADD: ${c.name} #${c.id} ${c.position} ${w.team || c.team || ''}`);
}

// Append, preserving a single trailing EOL.
const body = lines.slice();
while (body.length && !body[body.length - 1].trim()) body.pop();
const outLines = body.concat(newRows);
writeFileSync(csvPath, outLines.join(eol) + eol, 'utf8');
console.log('---');
console.log(`Added ${newRows.length} new player rows; skipped ${skipped} already-present.`);
console.log(`Wrote ${csvPath}`);
