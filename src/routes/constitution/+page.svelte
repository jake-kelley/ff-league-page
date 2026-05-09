<script>
    import { onMount } from 'svelte';
    import { dues, leagueName } from '$lib/utils/helper';

    let s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
    let activeSection = $state(1);
    let mobileTocOpen = $state(false);

    let sec1_1, sec1_2;
    let sec2_1, sec2_2, sec2_3;
    let sec3_1, sec3_2, sec3_3;
    let sec4_1, sec4_2, sec4_3;
    let sec5_1, sec5_2, sec5_3, sec5_4, sec5_5;
    let sec7_1, sec7_2;
    let sec9_1, sec9_2, sec9_3;
    let sec10_1, sec10_2, sec10_3, sec10_4, sec10_5, sec10_6;

    const goToSection = (section) => {
        if (!section) return;
        const top = section.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo({ left: 0, top, behavior: 'smooth' });
        mobileTocOpen = false;
    };

    onMount(() => {
        const refs = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10];
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = refs.findIndex((r) => r === entry.target);
                        if (idx !== -1) activeSection = idx + 1;
                    }
                }
            },
            { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
        );
        refs.forEach((r) => r && observer.observe(r));
        return () => observer.disconnect();
    });
</script>

<style>
    .page {
        position: relative;
        z-index: 1;
        max-width: 1180px;
        margin: 4em auto 6em;
        padding: 0 16px;
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 28px;
        align-items: start;
        line-height: 1.55;
    }

    .toc-sidebar {
        position: sticky;
        top: 20px;
        align-self: start;
        max-height: calc(100vh - 40px);
        overflow-y: auto;
        background: linear-gradient(160deg, #1f2a44 0%, #131a2c 100%);
        color: #e8eaf3;
        border-radius: 12px;
        padding: 1.2em 1em;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
    }
    .toc-sidebar h2 {
        margin: 0.2em 0.5em 0.8em;
        font-size: 0.78em;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #ffd166;
    }
    .toc-sidebar ol {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .toc-sidebar li {
        font-size: 0.92em;
        padding: 0.55em 0.8em;
        border-radius: 6px;
        cursor: pointer;
        color: #c8cee0;
        line-height: 1.35em;
        margin: 2px 0;
        border-left: 3px solid transparent;
        transition: background 0.12s, color 0.12s, border-color 0.12s;
        display: flex;
        align-items: baseline;
        gap: 8px;
    }
    .toc-sidebar li:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
    }
    .toc-sidebar li.active {
        background: rgba(255, 209, 102, 0.14);
        color: #fff;
        border-left-color: #ffd166;
    }
    .toc-sidebar .num {
        color: #ffd166;
        font-weight: 700;
        font-size: 0.85em;
        flex-shrink: 0;
        font-variant-numeric: tabular-nums;
    }
    .toc-sidebar .emoji {
        flex-shrink: 0;
    }
    .toc-sidebar .label {
        flex: 1;
    }

    .mobile-toc-toggle {
        display: none;
    }

    .wrap {
        background: #fff;
        color: #333;
        padding: 2em 2.4em 3em;
        border-radius: 12px;
        min-width: 0;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    }
    h1 {
        font-size: 2.2em;
        text-align: center;
        margin: 0.4em 0 0.2em;
        color: #1a1a1a;
        background: linear-gradient(90deg, #1976d2 0%, #00316b 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .subtitle {
        text-align: center;
        color: #888;
        font-style: italic;
        margin: 0 0 2em;
    }

    .wrap h2 {
        font-size: 1.5em;
        line-height: 1.2em;
        margin-top: 2.2em;
        color: #00316b;
        padding-bottom: 0.3em;
        border-bottom: 2px solid #e0e7f3;
    }
    .wrap h3 {
        font-size: 1.15em;
        margin: 1.4em 0 0.4em;
        color: #1a1a1a;
    }
    .wrap p, .wrap li {
        color: #444;
    }

    .subBlock {
        margin-left: 1.6em;
    }

    /* Highlighted cards */
    .summary {
        background: linear-gradient(135deg, #fff5f0 0%, #ffe4d4 100%);
        border-left: 5px solid #ef6c00;
        border-radius: 10px;
        padding: 1em 1.5em;
        margin: 1.5em 0;
        box-shadow: 0 4px 14px rgba(239, 108, 0, 0.12);
    }
    .summary p {
        color: #4a2f1a;
    }
    .summary strong {
        color: #c45a00;
    }

    .callout {
        background: linear-gradient(135deg, #e3f2fd 0%, #cfe5fb 100%);
        border-left: 5px solid #1976d2;
        border-radius: 10px;
        padding: 1em 1.4em;
        margin: 1.2em 0;
        box-shadow: 0 4px 14px rgba(25, 118, 210, 0.10);
        color: #0d2440;
    }
    .callout strong {
        color: #0d47a1;
    }
    .callout p, .callout li {
        color: #0d2440;
        margin: 0.4em 0;
    }

    .callout.tip {
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        border-left-color: #2e7d32;
        box-shadow: 0 4px 14px rgba(46, 125, 50, 0.10);
        color: #1b3d1f;
    }
    .callout.tip strong { color: #1b5e20; }
    .callout.tip p, .callout.tip li { color: #1b3d1f; }

    .callout.warning {
        background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
        border-left-color: #f9a825;
        box-shadow: 0 4px 14px rgba(249, 168, 37, 0.12);
        color: #4a3a0a;
    }
    .callout.warning strong { color: #b06b00; }
    .callout.warning p, .callout.warning li { color: #4a3a0a; }

    table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
        font-size: 0.95em;
    }
    th, td {
        text-align: left;
        padding: 8px 12px;
        border-bottom: 1px solid #e5e5e5;
    }
    th {
        background: linear-gradient(180deg, #f5f9ff 0%, #e8f0fb 100%);
        color: #00316b;
        font-weight: 600;
    }
    tbody tr:hover {
        background: #fafbfd;
    }
    .right { text-align: right; }

    .closing {
        margin-top: 3em;
        padding: 1.2em 1.5em;
        background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
        border-radius: 10px;
        font-style: italic;
        color: #4a2c6a;
        text-align: center;
    }

    .subsec {
        cursor: pointer;
        color: #00316b;
        text-decoration: underline;
        font-size: 0.95em;
        margin: 0.2em 0;
    }
    .subsec:hover {
        color: #1976d2;
    }

    @media (max-width: 900px) {
        .page {
            grid-template-columns: 1fr;
            gap: 0;
        }
        .toc-sidebar {
            position: static;
            max-height: none;
            display: none;
            margin-bottom: 16px;
        }
        .toc-sidebar.open {
            display: block;
        }
        .mobile-toc-toggle {
            display: inline-block;
            padding: 8px 14px;
            margin-bottom: 12px;
            border: 0;
            background: linear-gradient(160deg, #1f2a44 0%, #131a2c 100%);
            color: #ffd166;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
            font-weight: 600;
        }
        .wrap {
            padding: 1.6em 1.4em 2.4em;
        }
    }
</style>

<div class="page">
    <button
        class="mobile-toc-toggle"
        onclick={() => (mobileTocOpen = !mobileTocOpen)}
    >
        {mobileTocOpen ? '📕 Hide' : '📖 Contents'}
    </button>

    <aside class="toc-sidebar" class:open={mobileTocOpen} aria-label="Constitution contents">
        <h2>Sections</h2>
        <ol>
            <li class:active={activeSection === 1} onclick={() => goToSection(s1)}>
                <span class="num">1</span><span class="emoji">📋</span><span class="label">Overview</span>
            </li>
            <li class:active={activeSection === 2} onclick={() => goToSection(s2)}>
                <span class="num">2</span><span class="emoji">🧱</span><span class="label">Roster</span>
            </li>
            <li class:active={activeSection === 3} onclick={() => goToSection(s3)}>
                <span class="num">3</span><span class="emoji">🎯</span><span class="label">Scoring</span>
            </li>
            <li class:active={activeSection === 4} onclick={() => goToSection(s4)}>
                <span class="num">4</span><span class="emoji">✍️</span><span class="label">Drafting</span>
            </li>
            <li class:active={activeSection === 5} onclick={() => goToSection(s5)}>
                <span class="num">5</span><span class="emoji">🤝</span><span class="label">Trading</span>
            </li>
            <li class:active={activeSection === 6} onclick={() => goToSection(s6)}>
                <span class="num">6</span><span class="emoji">📥</span><span class="label">Waivers</span>
            </li>
            <li class:active={activeSection === 7} onclick={() => goToSection(s7)}>
                <span class="num">7</span><span class="emoji">🏆</span><span class="label">Postseason</span>
            </li>
            <li class:active={activeSection === 8} onclick={() => goToSection(s8)}>
                <span class="num">8</span><span class="emoji">⚠️</span><span class="label">Tanking</span>
            </li>
            <li class:active={activeSection === 9} onclick={() => goToSection(s9)}>
                <span class="num">9</span><span class="emoji">🔁</span><span class="label">Replacing Mgrs</span>
            </li>
            <li class:active={activeSection === 10} onclick={() => goToSection(s10)}>
                <span class="num">10</span><span class="emoji">💰</span><span class="label">Finances</span>
            </li>
        </ol>
    </aside>

    <article class="wrap">
        <h1>{leagueName} Constitution</h1>
        <p class="subtitle">A living document — major changes are ratified before each new season.</p>

        <h2 bind:this={s1}>📋 1. League Overview</h2>

        <h3 bind:this={sec1_1}>1.1 Format</h3>
        <p>{leagueName} is a 10-team dynasty fantasy football league with deep rosters and an emphasis on long-term team-building. Format details:</p>
        <ul>
            <li>10 teams, 1.0 PPR scoring</li>
            <li>28 roster spots (11 starters + 17 bench) plus 4 IR slots</li>
            <li>$100 FAAB waiver budget</li>
            <li>4-round rookie draft each offseason</li>
            <li>6-team playoff starting Week 15 (Week 18 is not used)</li>
            <li>Trade deadline: end of Week 11</li>
        </ul>

        <h3 bind:this={sec1_2}>1.2 Divisions</h3>
        <p>The league is split into two divisions:</p>
        <ul>
            <li><strong>Nerd Football Conference (NFC)</strong></li>
            <li><strong>Florida Men Incorporated (FMI)</strong></li>
        </ul>
        <p>Each division winner receives an automatic playoff berth and a first-round bye.</p>


        <h2 bind:this={s2}>🧱 2. Roster</h2>

        <h3 bind:this={sec2_1}>2.1 Starting Lineup</h3>
        <p>11 starters per week:</p>
        <ul>
            <li>1 × QB</li>
            <li>2 × RB</li>
            <li>2 × WR</li>
            <li>1 × TE</li>
            <li>5 × FLEX (RB / WR / TE)</li>
        </ul>
        <p>This league does not roster kickers or team defenses.</p>

        <h3 bind:this={sec2_2}>2.2 Bench &amp; IR</h3>
        <p>17 bench spots and 4 IR slots are available per team (28 active roster spots total, plus 4 reserve).</p>
        <p>A player must be designated as IR, Out, Doubtful, or COVID in the Sleeper app to occupy an IR slot.</p>

        <h3 bind:this={sec2_3}>2.3 Position Maximums</h3>
        <table>
            <thead>
                <tr><th>Position</th><th class="right">Maximum</th></tr>
            </thead>
            <tbody>
                <tr><td>QB</td><td class="right">3 active, 5 total</td></tr>
                <tr><td>RB</td><td class="right">20</td></tr>
                <tr><td>WR</td><td class="right">20</td></tr>
                <tr><td>TE</td><td class="right">10</td></tr>
            </tbody>
        </table>


        <h2 bind:this={s3}>🎯 3. Scoring</h2>

        <p>Full scoring is mirrored from the Sleeper league settings. The headline numbers:</p>

        <h3 bind:this={sec3_1}>3.1 Offensive Scoring</h3>
        <table>
            <thead>
                <tr><th>Stat</th><th class="right">Points</th></tr>
            </thead>
            <tbody>
                <tr><td>Passing yard</td><td class="right">0.04 (1 / 25 yds)</td></tr>
                <tr><td>Passing TD</td><td class="right">4</td></tr>
                <tr><td>Interception thrown</td><td class="right">−2</td></tr>
                <tr><td>Rushing yard</td><td class="right">0.1 (1 / 10 yds)</td></tr>
                <tr><td>Rushing TD</td><td class="right">6</td></tr>
                <tr><td>Reception</td><td class="right">1 (full PPR)</td></tr>
                <tr><td>Receiving yard</td><td class="right">0.1 (1 / 10 yds)</td></tr>
                <tr><td>Receiving TD</td><td class="right">6</td></tr>
                <tr><td>2-point conversion</td><td class="right">2</td></tr>
                <tr><td>Fumble lost</td><td class="right">−1</td></tr>
                <tr><td>Fumble recovery TD</td><td class="right">6</td></tr>
            </tbody>
        </table>

        <h3 bind:this={sec3_2}>3.2 Defensive &amp; Special Teams</h3>
        <p>Although team defenses are not rostered, individual defensive plays scored by offensive players (recovered fumbles, etc.) follow Sleeper's standard 2026 settings. See the Sleeper league page for the complete list.</p>

        <h3 bind:this={sec3_3}>3.3 Voting on Scoring</h3>
        <p>The scoring system will not change without a simple majority league vote prior to the start of the next season.</p>


        <h2 bind:this={s4}>✍️ 4. Drafting</h2>

        <h3 bind:this={sec4_1}>4.1 Startup Auction Draft</h3>
        <p>The startup draft is an auction. Each manager receives an equal budget and bids on the entire player pool. Auction proceeds beyond the standard prize pool fund the inaugural-year prizes and the league trophy (see Section 10.2).</p>

        <h3 bind:this={sec4_2}>4.2 Annual Rookie Draft</h3>
        <p>The annual rookie draft is 4 rounds. Each pick has a 5-minute clock. Rookie pick order in rounds 1–3 is set in reverse order of the previous regular season standings; the 4th-round order may be modified by the commissioners as needed.</p>
        <p>To make room for incoming rookies, bench limits are temporarily expanded between the rookie draft and the start of the regular season. Managers must trim back to the standard bench size before Week 1.</p>

        <h3 bind:this={sec4_3}>4.3 Draft Day Trades</h3>
        <p>If a trade is being negotiated during the draft, either party can ask a commissioner to pause the clock for additional time.</p>


        <h2 bind:this={s5}>🤝 5. Trading</h2>

        <p>Trading of players, draft picks (up to 3 drafts away), and FAAB dollars is allowed. Trades process immediately and will be reversed if vetoed or found to involve collusion. Trade review window is 2 days.</p>

        <h3 bind:this={sec5_1}>5.1 Trade Collusion</h3>
        <div class="callout warning">
            <p>If managers are suspected of accepting bribes, offering bribes, trading non-fantasy assets, or otherwise engaging in collusion*, all parties involved will be subject to penalties:</p>
            <ul>
                <li><strong>First offense</strong> — FAAB budget reduced by 80%.</li>
                <li><strong>Second offense</strong> — All transactions (trades and waivers) frozen for the next 18 weeks of regular-season and playoff games.</li>
                <li><strong>Third offense</strong> — A league meeting of all uninvolved managers will be convened to determine next steps, up to and including removal.</li>
            </ul>
            <p>Any trade found to involve collusion will be reversed, and any affected game results will be revised.</p>
        </div>
        <p><em>*Collusion includes organizing veto votes against an otherwise acceptable trade.</em></p>
        <p>Commissioners err on the side of letting managers run their teams as they see fit. Collusion must be clear before any action is taken. Commissioners reserve the right to ask questions about heavily lop-sided trades before they finalize.</p>

        <h3 bind:this={sec5_2}>5.2 Lending Players Prohibition</h3>
        <p>Any player traded away may not be re-acquired by the original team via trade within 6 weeks. Repeat offenders are subject to the collusion penalties above.</p>

        <h3 bind:this={sec5_3}>5.3 Trade Deadline</h3>
        <p>The trade deadline is the Saturday before Week 11 NFL games kick off.</p>

        <h3 bind:this={sec5_4}>5.4 Trade Restrictions</h3>
        <p>Draft picks may only be traded up to 3 drafts in advance. (E.g., during the 2026 season, the latest picks tradable are 2029 picks.) FAAB may only be traded from the current season.</p>

        <h3 bind:this={sec5_5}>5.5 Veto Process</h3>
        <p>5 veto votes are required to overturn a trade. Vetoes are only appropriate when there is evidence of collusion or an egregious mismatch of value (e.g. a top-15 dynasty asset for a backup with no path to playing time). Disliking a trade is not, by itself, grounds for a veto.</p>


        <h2 bind:this={s6}>📥 6. Waiver Wire</h2>

        <p>FAAB waiver system. Each team begins the season with $100. $0 bids are allowed. Waivers process daily at 9:00 AM ET, with a 2-day clear window after a player is dropped.</p>
        <p>FAAB budgets reset each year ahead of the regular season.</p>


        <h2 bind:this={s7}>🏆 7. Postseason</h2>

        <h3 bind:this={sec7_1}>7.1 Playoffs</h3>
        <p>6 teams qualify for the playoffs. The first round commences in Week 15. Each division winner earns an automatic berth, and the next 4 best records (from either division) earn wild-card spots. The 2 division winners receive byes in the first round. Each round is a single-week matchup; the higher seed advances on a tie. Week 18 is not used.</p>

        <h3 bind:this={sec7_2}>7.2 Seeding Tiebreakers</h3>
        <p>If two teams finish with the same record:</p>
        <ol>
            <li>Total Points For</li>
            <li>Head-to-Head Record</li>
            <li>Division Record</li>
            <li>Total Points Against</li>
            <li>Coin flip</li>
            <li>Duel to the death</li>
        </ol>


        <h2 bind:this={s8}>⚠️ 8. Tanking Policy</h2>

        <p>No team may intentionally leave starting roster spots empty or start clearly inactive players in an effort to lose. Evidence of intentional tanking may result in penalties up to and including forfeiture of draft selections.</p>


        <h2 bind:this={s9}>🔁 9. Replacing Managers</h2>

        <h3 bind:this={sec9_1}>9.1 Removing Managers</h3>
        <p>Aside from repeatedly failing to set a valid lineup, or confirmed collusion, no manager may be removed against their will. Engagement (league chat, trade offers, waiver activity) is strongly encouraged but not, on its own, grounds for removal.</p>

        <h3 bind:this={sec9_2}>9.2 Replacing Managers</h3>
        <p>When a manager needs to be replaced, the commissioners will look for a candidate with some connection to the existing managers. Priority is given to candidates who are eager to commit to the dynasty format and engage with the league.</p>

        <h3 bind:this={sec9_3}>9.3 Replacement Incentive</h3>
        <p>If a manager quits or is removed, the incoming manager receives a 50% reduction on their first-year buy-in.</p>


        <h2 bind:this={s10}>💰 10. League Finances &amp; Prizes</h2>

        <h3 bind:this={sec10_1}>10.1 League Dues</h3>
        <p>Year-1 dues are set at <strong>${dues}</strong>. Dues are collected through <a href="https://www.leaguesafe.com/league/3949641">LeagueSafe</a>, with the deadline being no later than August 1 of the active season. All managers must be paid in full before Week 1. Any manager who fails to pay before the deadline will incur a 10% late penalty, which is added to the postseason payout.</p>

        <h3 bind:this={sec10_2}>10.2 Year 1 Auction Prize Pool &amp; Trophy</h3>
        <div class="summary">
            <p>🏆 Because the startup auction generates a larger-than-normal pool of dues, the Year 1 prize pool is "inflated" relative to typical seasons. That extra money is being put toward a <strong>very nice league trophy</strong> that will be passed manager-to-manager every season.</p>
        </div>
        <p>Auction-driven money may be spread out over the course of a few years, or used to fund additional season-specific prizes (see 10.4) so that the value is felt across multiple seasons rather than only Year 1.</p>

        <h3 bind:this={sec10_3}>10.3 Subsequent-Year Entry Fees</h3>
        <p>After Year 1, ongoing entry fees are anticipated to be very low — likely <strong>$5 or $10 per manager</strong> — unless league sentiment evolves toward a higher buy-in. Any change to ongoing dues requires a vote (see 10.6).</p>

        <h3 bind:this={sec10_4}>10.4 Annual Awards (MVP, OPOY, DPOY)</h3>
        <p>To compensate for the lower ongoing buy-in and to keep things interesting, the league plans to mirror real NFL awards by offering season-long prizes such as:</p>
        <ul>
            <li><strong>MVP</strong> — most valuable player across the league</li>
            <li><strong>OPOY</strong> — Offensive Player of the Year</li>
            <li><strong>DPOY</strong> — Defensive Player of the Year (recognizing standout IDP-style production within our scoring)</li>
        </ul>
        <p>Specific criteria, prize amounts, and any additional awards are <em>TBD</em> as the league experiences its first dynasty seasons. Everything in this section is subject to revision as research and member feedback evolve.</p>

        <h3 bind:this={sec10_5}>10.5 Trophy Engraving &amp; Silver Coin</h3>
        <div class="callout tip">
            <strong>🥇 Each year, the league champion will:</strong>
            <ul>
                <li>Have their name engraved on a plate that is added to the league trophy.</li>
                <li>Have the trophy shipped to them to display until the next champion is crowned.</li>
                <li>Receive a <strong>1 oz silver coin</strong> custom-engraved with the league name and their team name / championship year, to keep forever.</li>
            </ul>
        </div>

        <h3 bind:this={sec10_6}>10.6 Raising Dues</h3>
        <p>A two-thirds majority vote is required to raise league dues. If a manager is no longer financially comfortable with the buy-in, finding a co-manager to split the cost is encouraged.</p>

        <p class="closing">📜 This constitution is a living document. Major changes will be announced in the league chat and ratified before the start of the next season.</p>
    </article>
</div>
