<script>
    let s1, s2, s3, s4, s5, s6, s7, s8, s9;

    const goToSection = (section) => {
        if (!section) return;
        const top = section.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ left: 0, top, behavior: 'smooth' });
    };
</script>

<style>
    .wrap {
        position: relative;
        z-index: 1;
        width: 92%;
        max-width: 820px;
        margin: 6em auto 8em;
        line-height: 1.55;
    }
    h1 {
        font-size: 2.2em;
        text-align: center;
        margin: 1em 0 0.2em;
    }
    .subtitle {
        text-align: center;
        color: #888;
        font-style: italic;
        margin: 0 0 2em;
    }
    h2 {
        font-size: 1.5em;
        line-height: 1.2em;
        margin-top: 2.2em;
    }
    h3 {
        font-size: 1.15em;
        margin: 1.4em 0 0.4em;
    }
    p, li {
        color: #555;
    }
    .toc {
        background: #f3f3f3;
        border-radius: 8px;
        padding: 1.2em 1.6em;
        margin: 2em 0;
    }
    .toc h2 {
        margin-top: 0;
        font-size: 1.2em;
    }
    .toc ol {
        margin: 0;
        padding-left: 1.4em;
    }
    .toc li {
        margin: 0.3em 0;
        cursor: pointer;
        color: #00316b;
    }
    .toc li:hover {
        text-decoration: underline;
    }
    .summary {
        border-left: 3px solid #920505;
        padding: 0.8em 1.2em;
        background: #fff8f8;
        border-radius: 4px;
        margin: 1.5em 0 2em;
    }
    .summary p {
        color: #444;
    }
    .callout {
        background: #f3f3f3;
        border-left: 3px solid #00316b;
        padding: 0.8em 1.2em;
        border-radius: 4px;
        margin: 1em 0;
    }
    table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
        font-size: 0.95em;
    }
    th, td {
        text-align: left;
        padding: 6px 10px;
        border-bottom: 1px solid #ddd;
    }
    th { background: #f8f8f8; }
    .glossary dt {
        font-weight: 700;
        margin-top: 0.6em;
        color: #444;
    }
    .glossary dd {
        margin: 0 0 0.4em 1.2em;
        color: #666;
    }
    .readtime {
        text-align: center;
        color: #888;
        font-size: 0.9em;
        margin: -0.5em 0 2em;
    }
</style>

<div class="wrap">
    <h1>Dynasty 101</h1>
    <p class="subtitle">A primer for new and incoming managers</p>
    <p class="readtime">~10 minute read</p>

    <div class="summary">
        <h2 style="margin: 0 0 0.4em; font-size: 1.2em;">How Dynasty Differs from Redraft</h2>
        <p>
            In a standard <strong>redraft</strong> league, every roster resets to zero each summer — you draft a team, ride it for one season, and start over. Dynasty is the opposite: you keep your full roster across seasons, every year. Trades, draft picks, and roster spots compound. A 22-year-old WR you draft this year is potentially a starter on your team for the next decade. A 30-year-old RB you trade for might be unstartable in 18 months. Dynasty rewards the long view in a way redraft simply does not.
        </p>
        <p>
            That changes everything. Instead of optimizing for this Sunday, you're managing a multi-year asset portfolio. The dynasty market behaves like a stock market — players appreciate and depreciate, "buy low, sell high" is a real edge, and the worst place to be isn't last place; it's stuck in the middle. Each year you add a rookie draft (4 rounds in MFFGA), and rookie picks themselves are tradable assets. The owners who win dynasty leagues over time aren't necessarily the ones with the best lineups; they're the ones who manage their roster like a portfolio: ruthlessly selling aging assets, accumulating youth and picks, and being honest about which phase their team is in.
        </p>
    </div>

    <div class="toc">
        <h2>Table of Contents</h2>
        <ol>
            <li onclick={() => goToSection(s1)}>Dynasty Format Overview</li>
            <li onclick={() => goToSection(s2)}>Core Operating Principles</li>
            <li onclick={() => goToSection(s3)}>Age Curves by Position</li>
            <li onclick={() => goToSection(s4)}>The Three Phases: Win-Now, Reload, Rebuild</li>
            <li onclick={() => goToSection(s5)}>Rookie Drafts</li>
            <li onclick={() => goToSection(s6)}>Trading Philosophy</li>
            <li onclick={() => goToSection(s7)}>Roster Construction</li>
            <li onclick={() => goToSection(s8)}>Common Mistakes to Avoid</li>
            <li onclick={() => goToSection(s9)}>Glossary of Dynasty Terms</li>
        </ol>
    </div>

    <h2 bind:this={s1}>1. Dynasty Format Overview</h2>
    <p>
        A dynasty league keeps your full roster across multiple seasons. There's no annual reset — players, picks, and FAAB are real long-term assets. The league we run is a 10-team, 1.0 PPR dynasty with deep rosters (28 active spots + 4 IR), 11 starters (1 QB, 2 RB, 2 WR, 1 TE, 5 FLEX), $100 FAAB waivers, and a 4-round rookie draft each spring. There are no team defenses or kickers in this format.
    </p>
    <p>
        A few format facts that shape strategy here:
    </p>
    <ul>
        <li><strong>10-team league</strong> &mdash; rosters go deep, talent is concentrated, and waiver options matter less than in shallow formats. Quality is more available than in 12+ team leagues, but bench rot is the real enemy.</li>
        <li><strong>1.0 PPR</strong> &mdash; pass-catching backs and high-volume slot WRs gain value relative to standard scoring.</li>
        <li><strong>5 FLEX slots</strong> &mdash; this is an unusually flexible lineup. WR depth and pass-catching RBs win starting spots over committee backs and TE2s.</li>
        <li><strong>Rookie picks are tradable up to 3 drafts in advance.</strong> A 2029 1st can change hands today.</li>
        <li><strong>Trade deadline is end of Week 11.</strong> The window to flip vets to a contender or pick up a stud closes earlier than redraft leagues.</li>
    </ul>

    <h2 bind:this={s2}>2. Core Operating Principles</h2>
    <p>
        Across every dynasty resource (DLF, Dynasty Nerds, Footballguys, FantasyPros, the better Reddit threads), a handful of principles repeat. Internalize these and you're ahead of half the league.
    </p>
    <ol>
        <li><strong>Dynasty is a multi-year asset management game, not a season-by-season game.</strong> Every move should be evaluated on a 2-3 year horizon, not "what helps me this week."</li>
        <li><strong>The dynasty market behaves like a stock market.</strong> "Buy low, sell high" is a real edge, not a cliché. Identifying a player's peak value and selling at that point can turn one stud into two or three.</li>
        <li><strong>There are three valid postures: contend, retool, rebuild.</strong> Pick one explicitly each offseason. The single worst place to be is the murky middle &mdash; "I'm pretty good but not great" &mdash; because you accumulate aging vets without ever cashing them in for picks.</li>
        <li><strong>Studs win trades.</strong> In nearly every multi-for-one swap, the side getting the best single player wins long-term, because elite players are the hardest assets to find. Quantity feels good and bleeds value.</li>
        <li><strong>Veterans are systematically undervalued; youth is systematically overvalued.</strong> The market chases shiny new things. Smart owners exploit this every year.</li>
        <li><strong>Talent endures, situation evaporates.</strong> A player's underlying talent is far more durable than the offense, coordinator, or QB throwing him the ball. Bias toward elite talent in bad situations over mediocre talent in elite situations.</li>
        <li><strong>Rookie picks are options on future production.</strong> Round-1 rookie picks have meaningfully higher hit rates (50-65%) than round 2 (25-35%) or round 3 (12-18%). NFL Draft capital is the single best pre-rookie-season predictor of fantasy success.</li>
        <li><strong>Asymmetric pick value.</strong> A contender's late 1st is roughly worth a rebuilder's early 2nd. This asymmetry is the engine of most positive-EV dynasty trades.</li>
    </ol>

    <div class="callout">
        <strong>The "So What?" Question.</strong> After every trade or roster move, ask: "Does this make me materially better at my actual goal (championship now or future championship)?" If the answer is "kinda" or "marginally," don't do it. Dynasty rewards big, decisive moves more than tiny optimizations.
    </div>

    <h2 bind:this={s3}>3. Age Curves by Position</h2>
    <p>
        Age affects dynasty value <em>more</em> than current production for borderline players. A player with the same projection but two years younger is meaningfully more valuable. Age is a one-way decay tax: every year, the asset depreciates unless production rises faster.
    </p>

    <h3>Quarterback &mdash; longest shelf life</h3>
    <ul>
        <li>Peak: 28-32. Most elite QBs hold up through 35.</li>
        <li>Cliff: ~36-37 for arm-talent QBs; ~33-34 for run-first QBs.</li>
        <li>A top-12 QB can be a startable asset for 8-12 years &mdash; the longest shelf life of any position.</li>
        <li>Dual-threat QBs (Allen, Hurts, Jackson types) age slightly worse than pocket passers due to rushing wear, but ceilings are enormous.</li>
    </ul>

    <h3>Running Back &mdash; the fast-decaying asset</h3>
    <ul>
        <li>Established by year 2 or it's likely never happening. RBs need to be in workhorse roles by their second year for the market to believe.</li>
        <li>Peak: 23-26. Production stays high through 27 for elite talents.</li>
        <li>Cliff: ages 27-29 for most. The "Age 27 cliff" is a real, well-documented phenomenon.</li>
        <li>Decline rate post-peak: ~15% YOY. Worst aging curve of any fantasy position.</li>
        <li><strong>Sell triggers:</strong> 27th birthday, contract approaching free agency, snap share dropping for younger backs in the same backfield.</li>
    </ul>

    <h3>Wide Receiver &mdash; the benchmark asset</h3>
    <ul>
        <li>Established window is wider: 22-25 typical breakout. Late breakouts (26+) exist but are rare.</li>
        <li>Peak: 25-28. The "WR3 year" (third NFL season) is when most non-elite WRs hit their stride.</li>
        <li>Decline: gradual; ~10% YOY post-peak. WRs hold value into ages 29-31.</li>
        <li>Cliff: most WRs see their first WR1/WR2 finish probabilities crater after 30. Truly elite WRs push that cliff to 31-32.</li>
        <li>24-and-under WRs are the single most appreciable asset class in fantasy.</li>
    </ul>

    <h3>Tight End &mdash; the confusing curve</h3>
    <ul>
        <li>Late developing position. Most TEs don't peak until age 25-28.</li>
        <li>Peak age: 26-28 average; 29-30 for elite (Kelce/Gronk types).</li>
        <li>After age 30, only ~17% chance of a TE1 finish in a given year. Cliff hits hard at 32.</li>
        <li>TE values lag WR/RB hype curves &mdash; waiting on year-2 TEs is profitable since many can be bought cheap during their year-2/3 trough.</li>
    </ul>

    <table>
        <thead>
            <tr><th>Pos</th><th>Buy-Low Sweet Spot</th><th>Sell-High Window</th><th>Last-Chance Sell</th></tr>
        </thead>
        <tbody>
            <tr><td>QB</td><td>22-24 ascending</td><td>27-30 prime</td><td>35-36</td></tr>
            <tr><td>RB</td><td>22-23 (year-1 bust)</td><td>24-26 producing</td><td>27-28</td></tr>
            <tr><td>WR</td><td>22-24 year-2 trough</td><td>25-28 producing</td><td>29-30</td></tr>
            <tr><td>TE</td><td>23-25 cheap</td><td>27-29 producing</td><td>30-31</td></tr>
        </tbody>
    </table>

    <div class="callout">
        <strong>The "Two Year" rule.</strong> When projecting an asset's dynasty value, picture them at +2 years. RB at 25 = solid; +2 = 27, getting risky. WR at 25 = peaking; +2 = 27, still elite. The two-year delta tells you whether you're buying or selling.
    </div>

    <h2 bind:this={s4}>4. The Three Phases: Win-Now, Reload, Rebuild</h2>
    <p>
        Every offseason, every team is in one of three states. Be honest about which one and act accordingly.
    </p>

    <h3>Win-Now (Contender)</h3>
    <ul>
        <li>You expect to compete for the title in the next 12-18 months.</li>
        <li>Signals: 3+ top-12 starters at WR/RB combined, top-5 QB, average starter age &lt;28, real bench depth at WR, top-3 in total roster value.</li>
        <li><strong>Action:</strong> Trade picks for missing pieces. The 1.04-1.08 in next year's draft is a depreciating asset for you because you'll never be picking that high.</li>
    </ul>

    <h3>Reload (Retool)</h3>
    <ul>
        <li>You expect to compete in the next 24-30 months. Roster value top-5 but aging.</li>
        <li>Signals: 1-2 elite young pieces + several 28+ vets. Realistic championship odds 10-20%.</li>
        <li><strong>Action:</strong> Identify 2-3 vets to flip for ascending youth, but don't do a full teardown. Maintain enough current production to be playoff competitive in year 2.</li>
    </ul>

    <h3>Rebuild</h3>
    <ul>
        <li>You don't expect to compete this season; you're building for 2-3+ years out.</li>
        <li>Signals: more 30+ year-old starters than 25-and-under stars, missing rookie picks, no QB-of-the-future, bottom-3 roster value.</li>
        <li><strong>Action:</strong> Trade everything 28+ for picks/youth. Plan an explicit 2-year window with milestones. Don't dump 2-years-out 1sts &mdash; those are your best assets.</li>
    </ul>

    <div class="callout">
        <strong>The 50% Delta Rule.</strong> Estimate your roster's total value vs the league average. If you're 50%+ below average, you're a rebuilder. If you're 30%+ above, you're a contender. Anything in between &mdash; you're a reloader, and the call is hardest.
    </div>

    <h3>The 5-Week Assessment</h3>
    <p>
        By Weeks 4-6 you have enough data to know your team. If you're 1-4 with old vets and middling production &mdash; sell. If 4-1 with surging young pieces &mdash; hold and stockpile next year's picks. If 2-3 &mdash; <em>decide within two weeks</em>: contender or seller. The middle is the most expensive place to be.
    </p>

    <h2 bind:this={s5}>5. Rookie Drafts</h2>
    <p>
        Each spring (typically late April through May, after the NFL Draft), this league runs a 4-round rookie-only draft. Pick order in rounds 1-3 is reverse standings; round 4 may be commissioner-adjusted. Every pick has a 5-minute clock.
    </p>

    <h3>Pick Hit Rates</h3>
    <ul>
        <li>Round 1: 50-65% hit rate (top-24 finish at position within 3 years).</li>
        <li>Round 2: 25-35% hit rate.</li>
        <li>Round 3: 12-18%.</li>
        <li>Round 4: 5-10%. Mostly lottery tickets.</li>
    </ul>
    <p>
        Hoarding round-1 picks is mathematically the best strategy. Three round-2s is <em>not</em> equivalent to one round-1 in expected outcome.
    </p>

    <h3>NFL Draft Capital is King</h3>
    <p>
        The single most predictive variable of fantasy success in rookie drafts is where the player went in the actual NFL Draft. NFL R1 picks become fantasy starters at roughly 45-55% rates. NFL R4+ picks rarely produce. Don't draft against NFL Draft capital without a strong reason.
    </p>

    <h3>Quick Position Heuristics</h3>
    <ul>
        <li><strong>WR:</strong> College breakout age &lt;20 is elite. Final-season market share &gt;35% is elite. Top-50 NFL pick is the capital signal you want.</li>
        <li><strong>RB:</strong> Landing spot dominates. Avoid RBs whose teams just signed a vet RB or have an entrenched starter. Pass-catching ability is critical in PPR.</li>
        <li><strong>QB (1QB league):</strong> Don't reach early. The position is deep enough that a rookie QB at 1.04 in 1QB rarely justifies the slot.</li>
        <li><strong>TE:</strong> Slowest position to develop. Year 2-3 breakouts are normal. Don't draft a TE in round 1 unless he's NFL R1 with elite athletic profile.</li>
    </ul>

    <h3>Pick Trading Strategies</h3>
    <ul>
        <li><strong>Trade Back:</strong> 1.04 for 1.07 + 2.05. Good when only 3 elite players are on your board.</li>
        <li><strong>Trade Up:</strong> 1.06 + 2.02 for 1.02. Good when there's a clear tier break and the gap to your current slot is large.</li>
        <li><strong>Pick for Production:</strong> 1.06 + 2.04 for a productive vet. Good if you're a contender and the vet has a 2+ year window.</li>
        <li><strong>Future Pick Arbitrage:</strong> Trade this year's mid-1st for next year's 1st when the next year's class projects stronger. You also don't yet know your slot, which is upside.</li>
    </ul>

    <h2 bind:this={s6}>6. Trading Philosophy</h2>
    <p>
        Active trading is the single most-cited difference between owners who win multi-year titles and owners who don't. Passive owners lose 10-20% of relative roster value yearly &mdash; not from any one mistake, but from the compounding cost of <em>never</em> moving aging vets, never converting depth into upside, never exploiting another manager's panic.
    </p>

    <h3>What Winners Do</h3>
    <ul>
        <li>Trade frequently. Target 5-10 trades per season minimum.</li>
        <li>Always know their next 2-3 trade candidates on their roster &mdash; the players they'd actively shop.</li>
        <li>Talk to opponents. Asking is free; a refused trade is data, not a loss.</li>
        <li>Use the league chat as a marketing channel. Hyping a player you're shopping is legal and effective.</li>
        <li>Read up on rookies year-round, not just March-April. The owner who can identify a year-2 breakout in February buys him for a 3rd; the lazy owner pays a 1st in October.</li>
    </ul>

    <h3>The Three-Year Horizon Rule</h3>
    <p>
        Before any trade or move, ask: "How will this asset look in 2 and 3 years?" If you can't answer that confidently for the player you're acquiring, you're gambling, not investing.
    </p>

    <h3>Trade Etiquette</h3>
    <ul>
        <li>Don't lowball. Open at fair-or-slight-tilt. Lowballs poison negotiations and kill future deals.</li>
        <li>Don't complain publicly about other people's trades. It tanks your own future trade activity.</li>
        <li>Don't attack rejected offers ("Why would you reject that?"). Move on; revisit later.</li>
        <li>Research your trade partner's roster needs before sending an offer. Generic blasts are mostly noise.</li>
    </ul>

    <h2 bind:this={s7}>7. Roster Construction</h2>

    <h3>The Four Laws</h3>
    <ol>
        <li><strong>You cannot win a championship with your bench.</strong> Allocate scarce roster spots to upside, not redundancy. Two RB4-types on the bench is worse than one RB4 + one lottery-ticket young WR.</li>
        <li><strong>Every roster spot has an opportunity cost.</strong> Holding a 28-year-old RB you'll never start when you could hold a 22-year-old project WR is a slow value leak.</li>
        <li><strong>Aging assets must be cashed in <em>before</em> the cliff, not after.</strong> The market will not pay you for "he's only 28." It will pay you for "he just put up RB1 production at age 27."</li>
        <li><strong>The waiver wire is a free asset generator.</strong> Active managers gain 1-3 hits per year vs passive managers. Over a 5-year window, that compounds.</li>
    </ol>

    <h3>Position Allocation Rules of Thumb</h3>
    <ul>
        <li><strong>QB (1QB league):</strong> 2-3 active QBs is plenty. 4+ is wasteful unless you're flipping one.</li>
        <li><strong>RB:</strong> 6-9 RBs is the sweet spot. Avoid carrying 4+ aging RBs &mdash; they're all depreciating.</li>
        <li><strong>WR:</strong> Depth at WR pays. 8-12 WRs including young upside picks is healthy.</li>
        <li><strong>TE:</strong> 2-3 TEs is enough. Carrying 5+ TEs eats roster spots that should be young WRs.</li>
        <li><strong>Mix old + young at every position.</strong> An all-vet starting lineup means a 2-year window before collapse. An all-22-year-old roster means 1-2 years before competing.</li>
    </ul>

    <h2 bind:this={s8}>8. Common Mistakes to Avoid</h2>
    <p>
        Across every analyst writeup, the same mistakes keep appearing. The five most common, and the five most uniquely dynasty:
    </p>

    <h3>Top 5 Most Common Mistakes</h3>
    <ol>
        <li><strong>Undervaluing rookie picks</strong> &mdash; especially future picks. 2027's 1st in May 2026 is a discount asset.</li>
        <li><strong>Over-trading for youth</strong> at the expense of a competing roster. Rebuilding without a plan to ever compete.</li>
        <li><strong>Stuck in the middle</strong> &mdash; neither contender nor rebuilder. The most expensive place to be.</li>
        <li><strong>Not trading.</strong> Passive owners lose ground every year.</li>
        <li><strong>Ignoring the offseason.</strong> Winners work year-round. The biggest value shifts happen March-May (free agency, NFL Draft, rookie drafts).</li>
    </ol>

    <h3>Five Mistakes Most Unique to Dynasty</h3>
    <ol>
        <li>Falling in love with your startup picks. "I drafted him" is not a holding strategy.</li>
        <li>Hoarding old RBs. The market gives you almost nothing once a back is 28+ &mdash; sell at peak production, not after.</li>
        <li>Refusing to rebuild after aging out. "Two more years" syndrome.</li>
        <li>Skipping rookie drafts to chase vets. You lose the option value entirely.</li>
        <li>Treating each season as redraft. One-year mentality on a multi-year roster.</li>
    </ol>

    <h3>Other Frequent Errors</h3>
    <ul>
        <li>Accepting lowball offers because "it's better than nothing." Wait. Markets correct.</li>
        <li>Trading the wrong pieces &mdash; sending an ascending young player when you should be sending a productive vet.</li>
        <li>Same-team concentration. 3+ starters from the same NFL team = correlated injury risk.</li>
        <li>Roster handcuffs without owning the lead back &mdash; that's just a lottery ticket diluting depth.</li>
        <li>Setting lineups late or forgetting to check inactives 90 minutes before kickoff.</li>
        <li>Panicking and trading at the bottom &mdash; selling a star after one bad game is almost always a value loss.</li>
        <li>Premature teardown &mdash; selling stars at the first sign of struggle. You're often closer to contention than you think.</li>
        <li>Eternal rebuild &mdash; 5+ years of "rebuilding" without ever pivoting to contend. Set milestones; pivot when met.</li>
    </ul>

    <h2 bind:this={s9}>9. Glossary of Dynasty Terms</h2>
    <dl class="glossary">
        <dt>ADP</dt><dd>Average Draft Position. Where a player gets drafted on average across leagues.</dd>
        <dt>Age Cliff</dt><dd>The age at which a player's production sharply drops. RB ~27-28; WR ~30; TE ~31-32; QB ~36-37.</dd>
        <dt>Asset</dt><dd>Any tradable resource: player or pick.</dd>
        <dt>Bell Cow</dt><dd>An RB getting the majority of touches. Workhorse role.</dd>
        <dt>Blue Chip</dt><dd>Top-tier elite player with proven production and long career window.</dd>
        <dt>BPA</dt><dd>Best Player Available drafting strategy.</dd>
        <dt>Buy Low</dt><dd>Acquiring a player at a temporarily depressed value.</dd>
        <dt>Calc</dt><dd>Trade calculator (KTC, FantasyCalc, DLF, etc.). The Trade Calculator on this site uses FantasyCalc values.</dd>
        <dt>Consolidation</dt><dd>Trading multiple pieces for one better player. 2-for-1, 3-for-1.</dd>
        <dt>Contender</dt><dd>Team with realistic championship odds in the current/next season.</dd>
        <dt>Dominator Rating</dt><dd>Market share metric for college players. Measures how much of a college team's offense the player accounted for.</dd>
        <dt>Dump Truck</dt><dd>A rebuilder unloading vets en masse. The owner you want to call when you're a contender.</dd>
        <dt>Early 1st / Mid 1st / Late 1st</dt><dd>1.01-1.04 / 1.05-1.08 / 1.09-1.12 rookie pick slots.</dd>
        <dt>FAAB</dt><dd>Free Agent Acquisition Budget. The bidding system for waivers (this league: $100 per season).</dd>
        <dt>Glue Guy</dt><dd>Mid-tier reliable starter without star power.</dd>
        <dt>Handcuff</dt><dd>Backup RB whose value depends on the starter getting hurt.</dd>
        <dt>Hero RB</dt><dd>Strategy of taking one elite RB and waiting on the others.</dd>
        <dt>KTC</dt><dd>KeepTradeCut, a popular crowdsourced player-value site.</dd>
        <dt>Liquidity</dt><dd>How easily an asset can be traded at fair value. A liquid star is more useful than a "stuck" calc-rich player nobody will trade for.</dd>
        <dt>Lottery Ticket</dt><dd>Cheap stash with high upside potential.</dd>
        <dt>NFL Draft Capital</dt><dd>Where a player was drafted by their NFL team. Strongest pre-rookie predictor of fantasy success.</dd>
        <dt>Orphan</dt><dd>Dynasty team abandoned by a previous owner; needs a new manager.</dd>
        <dt>Pick Capital</dt><dd>Quantity and quality of picks owned.</dd>
        <dt>Pivot</dt><dd>Switching from one phase to another (contender to rebuilder, or vice versa).</dd>
        <dt>Post-Hype Sleeper</dt><dd>A year-3-to-5 player who hasn't broken out but might. Often available cheap.</dd>
        <dt>Rebuild</dt><dd>Strategic teardown for a future championship.</dd>
        <dt>Reload</dt><dd>Mid-pack retooling for near-term contention without a full teardown.</dd>
        <dt>Rookie Pick</dt><dd>A draft slot in an upcoming rookie draft. Tradable up to 3 drafts in advance in this league.</dd>
        <dt>Sell High</dt><dd>Trading at peak value &mdash; usually right after a player's best run.</dd>
        <dt>Studs Win Trades</dt><dd>The mantra: in a 2-for-1 or 3-for-1, the side getting the best single player almost always wins long-term.</dd>
        <dt>Tier</dt><dd>Group of similarly-valued players. The gaps between tiers (tier breaks) signal trade timing.</dd>
        <dt>Tilt</dt><dd>Emotional state after losses; a bad time to trade.</dd>
        <dt>Trade Back / Trade Up</dt><dd>Trading down for additional picks (back) or trading multiple picks for a higher slot (up).</dd>
        <dt>Workhorse</dt><dd>RB getting 80%+ of his team's touches.</dd>
        <dt>YAC</dt><dd>Yards After Catch.</dd>
        <dt>YPRR</dt><dd>Yards per Route Run. Top efficiency metric for WRs.</dd>
        <dt>Zero RB</dt><dd>Strategy of skipping RB early in the draft and loading up on WRs/TE.</dd>
    </dl>

    <p style="margin-top: 3em; font-style: italic; color: #888;">
        That's Dynasty 101. The biggest takeaway: this is a long game. Know your phase, trade often, sell aging assets before the cliff, and treat every roster spot as currency. Good luck.
    </p>
</div>
