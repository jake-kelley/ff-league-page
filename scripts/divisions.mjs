// Compute each roster's total FantasyCalc value (players + draft picks) and
// produce several balanced random splits into two divisions of five.
//
//   node scripts/divisions.mjs [numOptions]

const LEAGUE = '1317629034393276416';
const numOptions = parseInt(process.argv[2] || '4', 10);

const [rosters, users, players, tp, fc] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE}/rosters`).then((r) => r.json()),
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE}/users`).then((r) => r.json()),
    fetch('https://api.sleeper.app/v1/players/nfl').then((r) => r.json()),
    fetch(`https://api.sleeper.app/v1/league/${LEAGUE}/traded_picks`).then((r) => r.json()),
    fetch('https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=10&ppr=1').then((r) => r.json()),
]);
const uName = {}; for (const u of users) uName[u.user_id] = u.display_name;
const rName = {}; for (const r of rosters) rName[r.roster_id] = uName[r.owner_id];

// FantasyCalc lookups
const valBySid = new Map();
const valByPickName = new Map();
for (const e of fc) {
    const p = e?.player ?? {};
    if (p.sleeperId != null) valBySid.set(String(p.sleeperId), e.value);
    if (p.name) valByPickName.set(p.name, e.value);
}
const ORD = (n) => ({ 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }[n]);
const genericPickValue = (season, round) => valByPickName.get(`${season} ${ORD(round)}`) ?? 0;

// Pick ownership: base = own picks, override with traded_picks. Seasons 2026-2028, rounds 1-4.
const SEASONS = ['2026', '2027', '2028'], ROUNDS = [1, 2, 3, 4];
const owner = new Map();
for (const r of rosters) for (const s of SEASONS) for (const rd of ROUNDS) owner.set(`${s}-${rd}-${r.roster_id}`, r.roster_id);
for (const t of tp) { const k = `${t.season}-${t.round}-${t.roster_id}`; if (owner.has(k)) owner.set(k, t.owner_id); }

// Per-roster totals
const totals = {};
for (const r of rosters) totals[r.roster_id] = { rid: r.roster_id, mgr: rName[r.roster_id], players: 0, picks: 0, npick: 0 };
for (const r of rosters) for (const id of r.players || []) totals[r.roster_id].players += valBySid.get(String(id)) ?? 0;
for (const [k, cur] of owner) { const [s, rd] = k.split('-'); totals[cur].picks += genericPickValue(s, +rd); totals[cur].npick++; }
for (const t of Object.values(totals)) t.total = t.players + t.picks;

const list = Object.values(totals).sort((a, b) => b.total - a.total);
console.log('=== Roster values (FantasyCalc, players + picks) ===');
console.log('roster  manager           players    picks   #pk     TOTAL');
for (const t of list) console.log(
    `${String(t.rid).padStart(2)}     ${(t.mgr || '').padEnd(16)} ${String(t.players).padStart(7)} ${String(t.picks).padStart(7)} ${String(t.npick).padStart(4)}  ${String(t.total).padStart(8)}`);
const grand = list.reduce((s, t) => s + t.total, 0);
console.log(`Total league value: ${grand} | avg/team: ${Math.round(grand / 10)} | avg/division: ${Math.round(grand / 2)}`);

// Optional constraints: one or more groups that must each stay intact within a
// division. Repeat --together=a,b,c for independent groups (they may land in
// different divisions; each group just can't be split).
const togetherArgs = process.argv.filter((a) => a.startsWith('--together=')).map((a) => a.split('=')[1]);
const groups = togetherArgs.map((arg) => {
    const names = arg.split(',').map((s) => s.trim().toLowerCase());
    return rosters.filter((r) => names.includes((rName[r.roster_id] || '').toLowerCase())).map((r) => r.roster_id);
});
for (const g of groups) console.log(`\nConstraint: keep together -> ${g.map((i) => rName[i]).join(', ')}`);

// Optional "not all together" groups: --notall=a,b,c  (the group may not be entirely in one division)
const notallArgs = process.argv.filter((a) => a.startsWith('--notall=')).map((a) => a.split('=')[1]);
const notallGroups = notallArgs.map((arg) => {
    const names = arg.split(',').map((s) => s.trim().toLowerCase());
    return rosters.filter((r) => names.includes((rName[r.roster_id] || '').toLowerCase())).map((r) => r.roster_id);
});
for (const g of notallGroups) console.log(`Constraint: NOT all in one division -> ${g.map((i) => rName[i]).join(', ')}`);

// Enumerate all C(10,5) splits; dedupe mirrors; optionally require togetherIds in one division.
const ids = rosters.map((r) => r.roster_id);
const valOf = (rid) => totals[rid].total;
const combos = [];
const seen = new Set();
const choose = (start, picked) => {
    if (picked.length === 5) {
        const a = picked, b = ids.filter((x) => !a.includes(x));
        const key = [...a].sort((x, y) => x - y).join(',');
        const mirror = [...b].sort((x, y) => x - y).join(',');
        if (seen.has(key) || seen.has(mirror)) return;
        seen.add(key);
        // constraint: each "together" group must be entirely in A or entirely in B
        for (const g of groups) {
            const inA = g.filter((t) => a.includes(t)).length;
            if (inA !== 0 && inA !== g.length) return;
        }
        // constraint: each "notall" group must be split across divisions
        for (const g of notallGroups) {
            const inA = g.filter((t) => a.includes(t)).length;
            if (inA === 0 || inA === g.length) return;
        }
        const va = a.reduce((s, x) => s + valOf(x), 0), vb = b.reduce((s, x) => s + valOf(x), 0);
        combos.push({ a: [...a], b, gap: Math.abs(va - vb), va, vb });
        return;
    }
    for (let i = start; i < ids.length; i++) choose(i + 1, [...picked, ids[i]]);
};
choose(0, []);
combos.sort((x, y) => x.gap - y.gap);
console.log(`Valid splits under constraint: ${combos.length}`);

// Pick `numOptions` distinct, well-balanced random splits from the most-balanced pool.
const chosen = [];
const usedKey = new Set();
// Always include the single tightest split first.
if (combos.length) { chosen.push(combos[0]); usedKey.add(combos[0].a.slice().sort((x, y) => x - y).join(',')); }
const pool = combos.slice(1, Math.min(Math.max(numOptions * 3, 10), combos.length)); // next-tightest splits
while (chosen.length < numOptions && pool.length) {
    const idx = Math.floor(Math.random() * pool.length);
    const c = pool.splice(idx, 1)[0];
    const key = c.a.slice().sort((x, y) => x - y).join(',');
    if (usedKey.has(key)) continue;
    usedKey.add(key); chosen.push(c);
}

const fmt = (group) => group.map((rid) => `${rName[rid]} (${totals[rid].total})`).join(', ');
console.log(`\n=== ${chosen.length} balanced random division options ===`);
chosen.forEach((c, i) => {
    console.log(`\nOption ${i + 1}  (value gap: ${c.gap})`);
    console.log(`  Division A [${c.va}]: ${fmt(c.a)}`);
    console.log(`  Division B [${c.vb}]: ${fmt(c.b)}`);
});
