// Backfill blank player_name/position/nfl_team (from Sleeper) and set blank
// fc_value to 0 for player rows, so unranked players are labeled and read as
// "valued at zero" rather than "not yet processed". Picks are left untouched.
//
//   node scripts/backfill-player-meta.mjs <target-csv>

import { readFileSync, writeFileSync } from 'node:fs';

const csvPath = process.argv[2];
if (!csvPath) { console.error('usage: node scripts/backfill-player-meta.mjs <csv>'); process.exit(1); }

const raw = readFileSync(csvPath, 'utf8');
const eol = raw.match(/\r\n|\n/)?.[0] ?? '\r\n';
const lines = raw.split(/\r?\n/);
const header = lines[0].split(',');
const I = (n) => header.indexOf(n);
const idx = { type: I('asset_type'), sid: I('sleeper_id'), name: I('player_name'), pos: I('position'), team: I('nfl_team'), val: I('fc_value') };

console.log('Fetching Sleeper players…');
const players = await (await fetch('https://api.sleeper.app/v1/players/nfl')).json();
const csvCell = (s) => (/[",\n]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s));

let namesFilled = 0, valuesZeroed = 0, notFound = 0;
const out = [lines[0]];
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { out.push(line); continue; }
    const c = line.split(',');
    if ((c[idx.type] || '').trim().toLowerCase() !== 'player') { out.push(line); continue; }

    const sid = (c[idx.sid] || '').trim();
    // Backfill name/pos/team when name is blank.
    if (sid && !(c[idx.name] || '').trim()) {
        const p = players[sid];
        if (p) {
            const nm = p.full_name || `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
            if (nm) { c[idx.name] = csvCell(nm); namesFilled++; }
            if (!(c[idx.pos] || '').trim() && p.position) c[idx.pos] = p.position;
            if (!(c[idx.team] || '').trim() && p.team) c[idx.team] = p.team;
        } else { notFound++; console.log(`NOT FOUND on Sleeper: ${sid}`); }
    }
    // Set blank value to 0.
    if (!(c[idx.val] || '').trim()) { c[idx.val] = '0'; valuesZeroed++; }
    out.push(c.join(','));
}

writeFileSync(csvPath, out.join(eol) + (raw.endsWith(eol) ? eol : ''), 'utf8');
console.log('---');
console.log(`Names backfilled: ${namesFilled}`);
console.log(`Values set to 0:  ${valuesZeroed}`);
console.log(`Not found:        ${notFound}`);
console.log(`Wrote ${csvPath}`);
