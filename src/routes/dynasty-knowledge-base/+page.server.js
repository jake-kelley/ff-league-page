import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import { kvGet } from '$lib/server/contentStore';

marked.setOptions({ gfm: true, breaks: false });

// Cannot prerender now that overrides are read at request time.
export const prerender = false;

const KB_DIR = join(process.cwd(), 'fantasy-football-training-data');

const SKIP = new Set([
    'COMBINED_dynasty_fantasy_football_training_corpus.md',
    'DATASET_README.md',
]);

const CATEGORIES = [
    { name: 'Foundations', match: /(best_practices|format_quick|glossary|common_mistakes|quick_decision|README_INDEX)/i },
    { name: 'Drafting & Rookies', match: /(startup_draft|rookie_draft|rookie_scouting|nfl_draft_capital|pick_value|2026_rookie)/i },
    { name: 'Position Strategy', match: /(qb_strategy|rb_strategy|wr_strategy|te_strategy|superflex|zero_rb|idp_strategy|2nd_year_breakouts|handcuffs)/i },
    { name: 'Roster Construction', match: /(roster_construction|age_curves|taxi_squad)/i },
    { name: 'Trading', match: /(trade_analysis|2for1|buy_low|market_inefficiencies|trade_calculator|psychology|keeptradecut)/i },
    { name: 'Player Evaluation', match: /(player_evaluation|advanced_metrics|landing_spot)/i },
    { name: 'League Phase', match: /(win_now|tanking|post_championship)/i },
    { name: 'In-Season', match: /(sit_start|waiver_wire|offseason)/i },
    { name: 'League Setup', match: /(league_setup|orphan|sleeper_platform|contract_salary|devy_leagues|scoring_formats)/i },
    { name: 'Community Wisdom', match: /(reddit|analyst_writeups|podcasts)/i },
    { name: 'FantasyCalc Reference', match: /^fantasycalc/i },
];

const CATEGORY_ORDER = CATEGORIES.map((c) => c.name).concat(['Other']);

function categorize(filename) {
    for (const c of CATEGORIES) {
        if (c.match.test(filename)) return c.name;
    }
    return 'Other';
}

const ACRONYMS = /\b(qb|rb|wr|te|nfl|ppr|adp|ktc|faab|idp|sf|tep|dst|udfa|yac|ypc|yprr|ir|tprr|fpg|edp|dlf|ftn|pff|mfl|ffpc)\b/gi;

function deriveTitle(filename, content) {
    const firstLine = content
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l && !/^[-=]+$/.test(l));
    let t = firstLine ?? filename;
    t = t
        .replace(/^#+\s*/, '')
        .replace(/^DYNASTY\s+FANTASY\s+FOOTBALL\s*[-—]?\s*/i, '')
        .replace(/^DYNASTY\s+/i, '')
        .replace(/\s*-\s*/g, ' — ')
        .replace(/^[^A-Za-z0-9]+/, '');
    t = t.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    t = t.replace(ACRONYMS, (m) => m.toUpperCase());
    return t;
}

export async function load() {
    const files = readdirSync(KB_DIR)
        .filter((f) => f.endsWith('.md') && !SKIP.has(f))
        .sort();

    const articles = await Promise.all(
        files.map(async (f) => {
            const slug = f.replace(/\.md$/i, '').toLowerCase();
            const baseContent = readFileSync(join(KB_DIR, f), 'utf-8');
            const override = await kvGet(`content:kb:${slug}`);
            const content = override ?? baseContent;
            return {
                slug,
                filename: f,
                title: deriveTitle(f, content),
                category: categorize(f),
                content,
                hasOverride: !!override,
                contentHtml: marked.parse(content),
                wordCount: content.trim().split(/\s+/).length,
            };
        })
    );

    return { articles, categoryOrder: CATEGORY_ORDER };
}
