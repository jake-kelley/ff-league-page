<script>
    import { dues, leagueName } from '$lib/utils/helper';

    let sec1, sec1_1, sec1_2;
    let sec2, sec2_1, sec2_2, sec2_3;
    let sec3, sec3_1, sec3_2, sec3_3;
    let sec4, sec4_1, sec4_2, sec4_3;
    let sec5, sec5_1, sec5_2, sec5_3, sec5_4, sec5_5;
    let sec6;
    let sec7, sec7_1, sec7_2;
    let sec8;
    let sec9, sec9_1, sec9_2, sec9_3;
    let sec10, sec10_1, sec10_2, sec10_3, sec10_4, sec10_5, sec10_6;

    const goToSection = (section) => {
        if (!section) return;
        const top = section.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ left: 0, top, behavior: 'smooth' });
    };
</script>

<style>
    .constitution {
        position: relative;
        z-index: 1;
        width: 92%;
        max-width: 800px;
        margin: 8em auto 10em;
    }

    h1 {
        font-size: 2em;
        line-height: 1.2em;
        text-align: center;
        margin: 2em 0 1.5em;
    }

    h2 {
        font-size: 1.5em;
        line-height: 1.2em;
    }

    h3 {
        text-decoration: underline;
        font-size: 1.3em;
        line-height: 1.2em;
    }

    h4 {
        text-decoration: underline;
        margin-left: 2em;
        font-size: 1.2em;
        line-height: 1.2em;
    }

    h5 {
        margin-left: 6em;
        font-size: 0.8em;
        line-height: 1.1em;
    }

    .subBlock {
        margin-left: 2.4em;
    }

    .sectionHeading {
        margin: 4em 0 1.5em;
    }

    .subSectionHeading {
        margin: 1.5em 0 1.5em;
    }

    .underscore {
        text-decoration: underline;
    }

    .right {
        text-align: right;
    }

    .positionMaximums td,
    .scoringTable td {
        min-width: 3em;
        padding: 2px 8px;
    }

    .scoringTable {
        border-collapse: collapse;
        margin-bottom: 1em;
    }

    .scoringTable th {
        text-align: left;
        padding: 4px 8px;
        border-bottom: 1px solid #ccc;
    }

    .noUnderscore {
        text-decoration: none;
    }

    .clickable {
        cursor: pointer;
    }

    .clickable:hover {
        color: #00316b;
    }

    p {
        color: #777;
    }

    .callout {
        background: #f3f3f3;
        border-left: 3px solid #00316b;
        padding: 0.8em 1.2em;
        margin: 1em 0;
        border-radius: 4px;
    }
</style>

<div class="constitution">
    <h1 class="noUnderscore">{leagueName} CONSTITUTION</h1>

    <h2 class="noUnderscore">TABLE OF CONTENTS</h2>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec1)}>Section 1: League Overview</h3>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec1_1)}>1.1 Format</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec1_2)}>1.2 Divisions</h4>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec2)}>Section 2: Roster</h3>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec2_1)}>2.1 Starting Lineup</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec2_2)}>2.2 Bench &amp; IR</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec2_3)}>2.3 Position Maximums</h4>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec3)}>Section 3: Scoring</h3>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec3_1)}>3.1 Offensive Scoring</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec3_2)}>3.2 Defensive &amp; Special Teams</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec3_3)}>3.3 Voting on Scoring</h4>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec4)}>Section 4: Drafting</h3>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec4_1)}>4.1 Startup Auction Draft</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec4_2)}>4.2 Annual Rookie Draft</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec4_3)}>4.3 Draft Day Trades</h4>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec5)}>Section 5: Trading</h3>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec5_1)}>5.1 Trade Collusion</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec5_2)}>5.2 Lending Players Prohibition</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec5_3)}>5.3 Trade Deadline</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec5_4)}>5.4 Trade Restrictions</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec5_5)}>5.5 Veto Process</h4>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec6)}>Section 6: Waiver Wire</h3>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec7)}>Section 7: Postseason</h3>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec7_1)}>7.1 Playoffs</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec7_2)}>7.2 Seeding Tiebreakers</h4>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec8)}>Section 8: Tanking Policy</h3>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec9)}>Section 9: Replacing Managers</h3>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec9_1)}>9.1 Removing Managers</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec9_2)}>9.2 Replacing Managers</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec9_3)}>9.3 Replacement Incentive</h4>

    <h3 class="noUnderscore clickable" onclick={() => goToSection(sec10)}>Section 10: League Finances &amp; Prizes</h3>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec10_1)}>10.1 League Dues</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec10_2)}>10.2 Year 1 Auction Prize Pool &amp; Trophy</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec10_3)}>10.3 Subsequent-Year Entry Fees</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec10_4)}>10.4 Annual Awards (MVP, OPOY, DPOY)</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec10_5)}>10.5 Trophy Engraving &amp; Silver Coin</h4>
        <h4 class="noUnderscore clickable" onclick={() => goToSection(sec10_6)}>10.6 Raising Dues</h4>

    <hr />

    <h2 class="sectionHeading" bind:this={sec1}>Section 1 — League Overview</h2>

    <h3 class="subSectionHeading" bind:this={sec1_1}>1.1 Format</h3>
    <p>{leagueName} is a 10-team dynasty fantasy football league with deep rosters and an emphasis on long-term team-building. Format details:</p>
    <ul>
        <li>10 teams, 1.0 PPR scoring</li>
        <li>28 roster spots (11 starters + 17 bench) plus 4 IR slots</li>
        <li>$100 FAAB waiver budget</li>
        <li>4-round rookie draft each offseason</li>
        <li>6-team playoff starting Week 15 (Week 18 is not used)</li>
        <li>Trade deadline: end of Week 11</li>
    </ul>

    <h3 class="subSectionHeading" bind:this={sec1_2}>1.2 Divisions</h3>
    <p>The league is split into two divisions:</p>
    <ul>
        <li><strong>Nerd Football Conference (NFC)</strong></li>
        <li><strong>Florida Men Incorporated (FMI)</strong></li>
    </ul>
    <p>Each division winner receives an automatic playoff berth and a first-round bye.</p>


    <h2 class="sectionHeading" bind:this={sec2}>Section 2 — Roster</h2>

    <h3 class="subSectionHeading" bind:this={sec2_1}>2.1 Starting Lineup</h3>
    <p>11 starters per week:</p>
    <ul>
        <li>1 &times; QB</li>
        <li>2 &times; RB</li>
        <li>2 &times; WR</li>
        <li>1 &times; TE</li>
        <li>5 &times; FLEX (RB / WR / TE)</li>
    </ul>
    <p>This league does not roster kickers or team defenses.</p>

    <h3 class="subSectionHeading" bind:this={sec2_2}>2.2 Bench &amp; IR</h3>
    <p>17 bench spots and 4 IR slots are available per team (28 active roster spots total, plus 4 reserve).</p>
    <p>A player must be designated as IR, Out, Doubtful, or COVID in the Sleeper app to occupy an IR slot.</p>

    <h3 class="subSectionHeading" bind:this={sec2_3}>2.3 Position Maximums</h3>
    <div class="subBlock">
        <table class="positionMaximums">
            <tbody>
                <tr><td>QB</td><td class="right">3 active, 5 total</td></tr>
                <tr><td>RB</td><td class="right">20</td></tr>
                <tr><td>WR</td><td class="right">20</td></tr>
                <tr><td>TE</td><td class="right">10</td></tr>
            </tbody>
        </table>
    </div>


    <h2 class="sectionHeading" bind:this={sec3}>Section 3 — Scoring</h2>

    <p>Full scoring is mirrored from the Sleeper league settings. The headline numbers:</p>

    <h3 class="subSectionHeading" bind:this={sec3_1}>3.1 Offensive Scoring</h3>
    <div class="subBlock">
        <table class="scoringTable">
            <thead>
                <tr><th>Stat</th><th>Points</th></tr>
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
    </div>

    <h3 class="subSectionHeading" bind:this={sec3_2}>3.2 Defensive &amp; Special Teams</h3>
    <p>Although team defenses are not rostered, individual defensive plays scored by offensive players (recovered fumbles, etc.) follow Sleeper's standard 2026 settings. See the Sleeper league page for the complete list.</p>

    <h3 class="subSectionHeading" bind:this={sec3_3}>3.3 Voting on Scoring</h3>
    <p>The scoring system will not change without a simple majority league vote prior to the start of the next season.</p>


    <h2 class="sectionHeading" bind:this={sec4}>Section 4 — Drafting</h2>

    <h3 class="subSectionHeading" bind:this={sec4_1}>4.1 Startup Auction Draft</h3>
    <p>The startup draft is an auction. Each manager receives an equal budget and bids on the entire player pool. Auction proceeds beyond the standard prize pool fund the inaugural-year prizes and the league trophy (see Section 10.2).</p>

    <h3 class="subSectionHeading" bind:this={sec4_2}>4.2 Annual Rookie Draft</h3>
    <p>The annual rookie draft is 4 rounds. Each pick has a 5-minute clock. Rookie pick order in rounds 1–3 is set in reverse order of the previous regular season standings; the 4th-round order may be modified by the commissioners as needed.</p>
    <p>To make room for incoming rookies, bench limits are temporarily expanded between the rookie draft and the start of the regular season. Managers must trim back to the standard bench size before Week 1.</p>

    <h3 class="subSectionHeading" bind:this={sec4_3}>4.3 Draft Day Trades</h3>
    <p>If a trade is being negotiated during the draft, either party can ask a commissioner to pause the clock for additional time.</p>


    <h2 class="sectionHeading" bind:this={sec5}>Section 5 — Trading</h2>

    <p>Trading of players, draft picks (up to 3 drafts away), and FAAB dollars is allowed. Trades process immediately and will be reversed if vetoed or found to involve collusion. Trade review window is 2 days.</p>

    <h3 class="subSectionHeading" bind:this={sec5_1}>5.1 Trade Collusion</h3>
    <div class="subBlock">
        <p>If managers are suspected of accepting bribes, offering bribes, trading non-fantasy assets, or otherwise engaging in collusion*, all parties involved will be subject to penalties:</p>
        <ul>
            <li><strong>First offense</strong> — FAAB budget reduced by 80%.</li>
            <li><strong>Second offense</strong> — All transactions (trades and waivers) frozen for the next 18 weeks of regular-season and playoff games.</li>
            <li><strong>Third offense</strong> — A league meeting of all uninvolved managers will be convened to determine next steps, up to and including removal.</li>
        </ul>
        <p>Any trade found to involve collusion will be reversed, and any affected game results will be revised.</p>
        <p>*Collusion includes organizing veto votes against an otherwise acceptable trade.</p>
        <p>Commissioners err on the side of letting managers run their teams as they see fit. Collusion must be clear before any action is taken. Commissioners reserve the right to ask questions about heavily lop-sided trades before they finalize.</p>
    </div>

    <h3 class="subSectionHeading" bind:this={sec5_2}>5.2 Lending Players Prohibition</h3>
    <div class="subBlock">
        <p>Any player traded away may not be re-acquired by the original team via trade within 6 weeks. Repeat offenders are subject to the collusion penalties above.</p>
    </div>

    <h3 class="subSectionHeading" bind:this={sec5_3}>5.3 Trade Deadline</h3>
    <div class="subBlock">
        <p>The trade deadline is the Saturday before Week 11 NFL games kick off.</p>
    </div>

    <h3 class="subSectionHeading" bind:this={sec5_4}>5.4 Trade Restrictions</h3>
    <div class="subBlock">
        <p>Draft picks may only be traded up to 3 drafts in advance. (E.g., during the 2026 season, the latest picks tradable are 2029 picks.) FAAB may only be traded from the current season.</p>
    </div>

    <h3 class="subSectionHeading" bind:this={sec5_5}>5.5 Veto Process</h3>
    <div class="subBlock">
        <p>5 veto votes are required to overturn a trade. Vetoes are only appropriate when there is evidence of collusion or an egregious mismatch of value (e.g. a top-15 dynasty asset for a backup with no path to playing time). Disliking a trade is not, by itself, grounds for a veto.</p>
    </div>


    <h2 class="sectionHeading" bind:this={sec6}>Section 6 — Waiver Wire</h2>

    <p>FAAB waiver system. Each team begins the season with $100. $0 bids are allowed. Waivers process daily at 9:00 AM ET, with a 2-day clear window after a player is dropped.</p>
    <p>FAAB budgets reset each year ahead of the regular season.</p>


    <h2 class="sectionHeading" bind:this={sec7}>Section 7 — Postseason</h2>

    <h3 class="subSectionHeading" bind:this={sec7_1}>7.1 Playoffs</h3>
    <p>6 teams qualify for the playoffs. The first round commences in Week 15. Each division winner earns an automatic berth, and the next 4 best records (from either division) earn wild-card spots. The 2 division winners receive byes in the first round. Each round is a single-week matchup; the higher seed advances on a tie. Week 18 is not used.</p>

    <h3 class="subSectionHeading" bind:this={sec7_2}>7.2 Seeding Tiebreakers</h3>
    <p>If two teams finish with the same record:</p>
    <ol>
        <li>Total Points For</li>
        <li>Head-to-Head Record</li>
        <li>Division Record</li>
        <li>Total Points Against</li>
        <li>Coin flip</li>
        <li>Duel to the death</li>
    </ol>


    <h2 class="sectionHeading" bind:this={sec8}>Section 8 — Tanking Policy</h2>

    <p>No team may intentionally leave starting roster spots empty or start clearly inactive players in an effort to lose. Evidence of intentional tanking may result in penalties up to and including forfeiture of draft selections.</p>


    <h2 class="sectionHeading" bind:this={sec9}>Section 9 — Replacing Managers</h2>

    <h3 class="subSectionHeading" bind:this={sec9_1}>9.1 Removing Managers</h3>
    <p>Aside from repeatedly failing to set a valid lineup, or confirmed collusion, no manager may be removed against their will. Engagement (league chat, trade offers, waiver activity) is strongly encouraged but not, on its own, grounds for removal.</p>

    <h3 class="subSectionHeading" bind:this={sec9_2}>9.2 Replacing Managers</h3>
    <p>When a manager needs to be replaced, the commissioners will look for a candidate with some connection to the existing managers. Priority is given to candidates who are eager to commit to the dynasty format and engage with the league.</p>

    <h3 class="subSectionHeading" bind:this={sec9_3}>9.3 Replacement Incentive</h3>
    <p>If a manager quits or is removed, the incoming manager receives a 50% reduction on their first-year buy-in.</p>


    <h2 class="sectionHeading" bind:this={sec10}>Section 10 — League Finances &amp; Prizes</h2>

    <h3 class="subSectionHeading" bind:this={sec10_1}>10.1 League Dues</h3>
    <p>Year-1 dues are set at <strong>${dues}</strong>. Dues are collected through <a href="https://www.leaguesafe.com/league/3949641">LeagueSafe</a>, with the deadline being no later than August 1 of the active season. All managers must be paid in full before Week 1. Any manager who fails to pay before the deadline will incur a 10% late penalty, which is added to the postseason payout.</p>

    <h3 class="subSectionHeading" bind:this={sec10_2}>10.2 Year 1 Auction Prize Pool &amp; Trophy</h3>
    <div class="callout">
        <p>Because the startup auction generates a larger-than-normal pool of dues, the Year 1 prize pool is "inflated" relative to typical seasons. That extra money is being put toward a <strong>very nice league trophy</strong> that will be passed manager-to-manager every season.</p>
    </div>
    <p>Auction-driven money may be spread out over the course of a few years, or used to fund additional season-specific prizes (see 10.4) so that the value is felt across multiple seasons rather than only Year 1.</p>

    <h3 class="subSectionHeading" bind:this={sec10_3}>10.3 Subsequent-Year Entry Fees</h3>
    <p>After Year 1, ongoing entry fees are anticipated to be very low — likely <strong>$5 or $10 per manager</strong> — unless league sentiment evolves toward a higher buy-in. Any change to ongoing dues requires a vote (see 10.6).</p>

    <h3 class="subSectionHeading" bind:this={sec10_4}>10.4 Annual Awards (MVP, OPOY, DPOY)</h3>
    <p>To compensate for the lower ongoing buy-in and to keep things interesting, the league plans to mirror real NFL awards by offering season-long prizes such as:</p>
    <ul>
        <li><strong>MVP</strong> — most valuable player across the league</li>
        <li><strong>OPOY</strong> — Offensive Player of the Year</li>
        <li><strong>DPOY</strong> — Defensive Player of the Year (recognizing standout IDP-style production within our scoring)</li>
    </ul>
    <p>Specific criteria, prize amounts, and any additional awards are <em>TBD</em> as the league experiences its first dynasty seasons. Everything in this section is subject to revision as research and member feedback evolve.</p>

    <h3 class="subSectionHeading" bind:this={sec10_5}>10.5 Trophy Engraving &amp; Silver Coin</h3>
    <div class="callout">
        <p>Each year, the league champion will:</p>
        <ul>
            <li>Have their name engraved on a plate that is added to the league trophy.</li>
            <li>Have the trophy shipped to them to display until the next champion is crowned.</li>
            <li>Receive a <strong>1 oz silver coin</strong> custom-engraved with the league name and their team name / championship year, to keep forever.</li>
        </ul>
    </div>

    <h3 class="subSectionHeading" bind:this={sec10_6}>10.6 Raising Dues</h3>
    <p>A two-thirds majority vote is required to raise league dues. If a manager is no longer financially comfortable with the buy-in, finding a co-manager to split the cost is encouraged.</p>

    <p style="margin-top: 3em; font-style: italic;">This constitution is a living document and is subject to change as the league matures. Major changes will be announced in the league chat and ratified before the start of the next season.</p>

</div>
