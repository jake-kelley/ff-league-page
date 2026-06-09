// Minimal CSV parser that handles quoted fields and embedded commas/newlines.
// Returns { headers: string[], rows: string[][] }.
export const parseCSV = (text) => {
    const rows = [];
    let row = [];
    let field = '';
    let inQuotes = false;
    let i = 0;
    // strip UTF-8 BOM if present
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    while (i < text.length) {
        const ch = text[i];
        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i += 2;
                    continue;
                }
                inQuotes = false;
                i++;
                continue;
            }
            field += ch;
            i++;
            continue;
        }
        if (ch === '"') {
            inQuotes = true;
            i++;
            continue;
        }
        if (ch === ',') {
            row.push(field);
            field = '';
            i++;
            continue;
        }
        if (ch === '\r') {
            i++;
            continue;
        }
        if (ch === '\n') {
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
            i++;
            continue;
        }
        field += ch;
        i++;
    }
    // flush last field/row
    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }
    if (rows.length === 0) return { headers: [], rows: [] };
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const body = rows.slice(1).filter((r) => r.some((c) => c && c.trim().length > 0));
    return { headers, rows: body };
};

const REQUIRED_COLUMNS = ['asset_type', 'player_name', 'position', 'nfl_team', 'fc_value', 'pick_year', 'pick_round', 'pick_spot'];

export const csvToAssets = (text) => {
    const { headers, rows } = parseCSV(text);
    if (headers.length === 0) throw new Error('CSV is empty');
    const idx = {};
    for (const col of REQUIRED_COLUMNS) {
        const i = headers.indexOf(col);
        if (i < 0) throw new Error(`Missing required column: ${col}`);
        idx[col] = i;
    }
    return rows.map((r, n) => {
        const asset_type = (r[idx.asset_type] || '').trim().toLowerCase();
        const player_name = (r[idx.player_name] || '').trim();
        const position = (r[idx.position] || '').trim().toUpperCase();
        const nfl_team = (r[idx.nfl_team] || '').trim().toUpperCase();
        const fc_value = parseFloat(r[idx.fc_value]) || 0;
        const pick_year = (r[idx.pick_year] || '').trim();
        const pick_round = (r[idx.pick_round] || '').trim();
        const pick_spot = (r[idx.pick_spot] || '').trim();
        const isPick = asset_type === 'pick' || (!!pick_year && !!pick_round);
        return {
            id: `a${n}_${(player_name || `pick-${pick_year}-${pick_round}-${pick_spot}`).replace(/\s+/g, '_').toLowerCase()}`,
            asset_type: isPick ? 'pick' : 'player',
            player_name,
            position: isPick ? 'PICK' : position,
            nfl_team,
            fc_value,
            pick_year: isPick ? pick_year : null,
            pick_round: isPick ? pick_round : null,
            pick_spot: isPick ? pick_spot : null,
        };
    });
};

const ordinal = (n) => {
    const v = parseInt(n);
    if (!Number.isFinite(v)) return String(n);
    const mod100 = v % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${v}th`;
    switch (v % 10) {
        case 1: return `${v}st`;
        case 2: return `${v}nd`;
        case 3: return `${v}rd`;
        default: return `${v}th`;
    }
};

export const formatPickLabel = (a) => {
    if (a.asset_type !== 'pick') return a.player_name;
    const year = a.pick_year || '';
    const round = a.pick_round || '';
    const spot = a.pick_spot ? String(a.pick_spot).padStart(2, '0') : '';
    if (spot) return `${year} ${round}.${spot}`.trim();
    return `${year} ${ordinal(round)}`.trim();
};

// FC pick-name candidates in priority order: specific spot first, then generic round.
// Future-year drafts in FantasyCalc usually only carry the generic "{year} {ordinal}" entry,
// so we fall back to that when the spot-specific name isn't present.
export const fantasyCalcPickCandidates = (a) => {
    if (a.asset_type !== 'pick') return [];
    const year = a.pick_year;
    const round = a.pick_round;
    const spot = a.pick_spot;
    if (!year || !round) return [];
    const candidates = [];
    if (spot) candidates.push(`${year} Pick ${round}.${String(spot).padStart(2, '0')}`);
    candidates.push(`${year} ${ordinal(round)}`);
    return candidates;
};

// Apply FC values onto pick rows. Returns a new array.
export const applyFantasyCalcValues = (assets, fcPlayers) => {
    const byName = new Map();
    for (const p of fcPlayers || []) {
        if (p && p.name) byName.set(p.name, p.value);
    }
    return assets.map((a) => {
        if (a.asset_type !== 'pick') return a;
        for (const key of fantasyCalcPickCandidates(a)) {
            const fc = byName.get(key);
            if (fc != null) return { ...a, fc_value: fc };
        }
        return a;
    });
};
