import { json } from '@sveltejs/kit';

const FANTASY_CALC_URL = 'https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=10&ppr=1';

// 12h CDN cache: upstream (FantasyCalc) is hit at most twice per day.
// A vercel.json cron pings this endpoint at 06:00 and 18:00 UTC to keep the cache warm,
// so the data is also refreshed twice per day even if no users visit.
const TWELVE_HOURS = 60 * 60 * 12;

export async function GET() {
    let upstream;
    try {
        upstream = await fetch(FANTASY_CALC_URL);
    } catch (err) {
        return json({ error: `Failed to reach FantasyCalc: ${err.message}` }, { status: 502 });
    }

    if (!upstream.ok) {
        return json({ error: `FantasyCalc responded ${upstream.status}` }, { status: 502 });
    }

    const raw = await upstream.json();

    const players = (Array.isArray(raw) ? raw : []).map((row) => {
        const p = row?.player ?? {};
        return {
            id: String(p.id ?? p.sleeperId ?? p.mflId ?? p.name ?? ''),
            sleeperId: p.sleeperId ?? null,
            name: p.name ?? '',
            position: (p.position ?? '').toUpperCase(),
            team: p.maybeTeam ?? p.team ?? '',
            age: p.maybeAge ?? null,
            value: typeof row?.value === 'number' ? row.value : 0,
            overallRank: row?.overallRank ?? null,
            positionRank: row?.positionRank ?? null,
            trend30Day: row?.trend30Day ?? null,
        };
    });

    return json(
        { players, fetchedAt: Date.now() },
        {
            headers: {
                'cache-control': `public, s-maxage=${TWELVE_HOURS}, stale-while-revalidate=3600`,
            },
        }
    );
}
