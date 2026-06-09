// Refreshes the fc_value column of a CSV using FantasyCalc's current values.
//
// CSV columns expected:
//   asset_type, sleeper_id, player_name, position, nfl_team, fc_value,
//   pick_year, pick_round, pick_spot, ...
//
// Players (asset_type=player) are matched by sleeper_id against FantasyCalc's sleeperId.
// Picks (asset_type=pick) are matched by (pick_year, pick_round, pick_spot) → "{year} Pick {round}.{spot}"
// with a fallback to the generic "{year} {ordinal}" entry (e.g. "2027 1st") when the
// spot-specific value isn't in FantasyCalc.
//
// Usage:
//   node scripts/refresh-fc-values.mjs <path-to-csv> [--keep-existing] [--picks-only] [--players-only]
//
// Flags:
//   --keep-existing   skip rows that already have a non-empty fc_value
//   --picks-only      only update pick rows
//   --players-only    only update player rows

import { readFileSync, writeFileSync } from 'node:fs';
import { fantasyCalcPickCandidates, formatPickLabel } from '../src/lib/DraftTool/csv.js';

const FANTASY_CALC_URL = 'https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=10&ppr=1';

const args = process.argv.slice(2);
const path = args.find((a) => !a.startsWith('--'));
if (!path) {
    console.error('usage: node scripts/refresh-fc-values.mjs <csv-path> [--keep-existing] [--picks-only] [--players-only]');
    process.exit(1);
}
const keepExisting = args.includes('--keep-existing');
const picksOnly = args.includes('--picks-only');
const playersOnly = args.includes('--players-only');
if (picksOnly && playersOnly) {
    console.error('--picks-only and --players-only are mutually exclusive');
    process.exit(1);
}

const raw = readFileSync(path, 'utf8');
const eol = raw.match(/\r\n|\n/)?.[0] ?? '\n';
const lines = raw.split(/\r?\n/);

const header = lines[0].split(',');
const colIndex = (name) => {
    const i = header.indexOf(name);
    if (i < 0) throw new Error(`Missing required column: ${name}`);
    return i;
};
const idx = {
    asset_type: colIndex('asset_type'),
    sleeper_id: colIndex('sleeper_id'),
    fc_value: colIndex('fc_value'),
    pick_year: colIndex('pick_year'),
    pick_round: colIndex('pick_round'),
    pick_spot: colIndex('pick_spot'),
};

console.log(`Fetching FantasyCalc values…`);
const res = await fetch(FANTASY_CALC_URL);
if (!res.ok) {
    console.error(`FantasyCalc responded ${res.status}`);
    process.exit(1);
}
const fc = await res.json();

const byName = new Map();
const bySleeperId = new Map();
for (const r of fc) {
    const p = r?.player ?? {};
    if (p.name) byName.set(p.name, r.value);
    if (p.sleeperId != null) bySleeperId.set(String(p.sleeperId), r.value);
}
console.log(`Loaded ${byName.size} FantasyCalc entries (${bySleeperId.size} with sleeperId).`);

let playerUpdated = 0;
let pickUpdated = 0;
let kept = 0;
let unmatched = 0;
const out = [lines[0]];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { out.push(line); continue; }
    const cells = line.split(',');
    const type = (cells[idx.asset_type] || '').trim().toLowerCase();
    const currentValue = (cells[idx.fc_value] || '').trim();

    if (keepExisting && currentValue !== '') {
        kept++;
        out.push(line);
        continue;
    }

    if (type === 'player' && !picksOnly) {
        const sid = (cells[idx.sleeper_id] || '').trim();
        if (!sid) { out.push(line); continue; }
        const v = bySleeperId.get(sid);
        if (v == null) { unmatched++; console.log(`NO MATCH: player sleeper_id=${sid}`); out.push(line); continue; }
        cells[idx.fc_value] = String(v);
        out.push(cells.join(','));
        playerUpdated++;
    } else if (type === 'pick' && !playersOnly) {
        const asset = {
            asset_type: 'pick',
            pick_year: (cells[idx.pick_year] || '').trim(),
            pick_round: (cells[idx.pick_round] || '').trim(),
            pick_spot: (cells[idx.pick_spot] || '').trim(),
        };
        let v = null;
        for (const key of fantasyCalcPickCandidates(asset)) {
            const found = byName.get(key);
            if (found != null) { v = found; break; }
        }
        if (v == null) { unmatched++; console.log(`NO MATCH: ${formatPickLabel(asset)}`); out.push(line); continue; }
        cells[idx.fc_value] = String(v);
        out.push(cells.join(','));
        pickUpdated++;
    } else {
        out.push(line);
    }
}

writeFileSync(path, out.join(eol), 'utf8');
console.log('---');
console.log(`Wrote ${path}`);
console.log(`Players updated: ${playerUpdated}`);
console.log(`Picks updated:   ${pickUpdated}`);
console.log(`Kept existing:   ${kept}`);
console.log(`Unmatched:       ${unmatched}`);
