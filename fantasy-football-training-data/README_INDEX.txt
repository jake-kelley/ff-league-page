DYNASTY FANTASY FOOTBALL - AI MODEL TRAINING DATA CORPUS
=========================================================
Generated: 2026-05-08 (updated with rookie scouting deep-dive)
Total files: 58
Total size: ~830 KB / ~140,000 words equivalent

PURPOSE
-------
This corpus provides comprehensive coverage of dynasty fantasy football for AI model fine-tuning. It is DYNASTY-FOCUSED, not redraft. Every file is a structured plain-text training document covering one or more aspects of dynasty league strategy, roster construction, trading, evaluation, and meta-game.

USE PRIORITY
------------
Files marked [CORE] are the highest-signal training documents.
Files marked [DEEP] are detailed deep-dives on specific topics.
Files marked [DATA] contain real numerical data (FantasyCalc snapshot).
Files marked [REF] are reference / directory files.
Files marked [REDDIT] are community-sourced wisdom from a sub-agent.

================================================================
FANTASYCALC LIVE DATA SNAPSHOT (2026-05-08)

[DATA] fantasycalc_dynasty_10team_1ppr_RAW_2026-05-08.json
  Raw JSON from api.fantasycalc.com endpoint:
  https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=10&ppr=1
  462 entries; players + picks; full schema.

[DATA] fantasycalc_dynasty_10team_1ppr_PARSED_2026-05-08.txt
  Same data parsed into human-readable columns: rank, position, age, value,
  trend30day, redraft value, tier, trade frequency.

[DATA] fantasycalc_dynasty_QB_only_2026-05-08.txt - QB rankings only.
[DATA] fantasycalc_dynasty_RB_only_2026-05-08.txt - RB rankings only.
[DATA] fantasycalc_dynasty_WR_only_2026-05-08.txt - WR rankings only.
[DATA] fantasycalc_dynasty_TE_only_2026-05-08.txt - TE rankings only.
[DATA] fantasycalc_dynasty_PICK_only_2026-05-08.txt - Rookie/future pick values.

[CORE] fantasycalc_methodology_and_context.txt
  How to read FantasyCalc values, what the columns mean, and how to use them
  for trade evaluation. Includes adjustments for SF, TEP, league size.

================================================================
CORE STRATEGY FILES

[CORE] dynasty_best_practices_overview.txt
  The "operating system" of dynasty: 8 core principles, 4 laws of roster mgmt,
  what beginners get wrong, what winners do, the 3-year horizon rule.

[CORE] dynasty_startup_draft_strategy.txt
  Complete guide to the most consequential event in any dynasty league:
  approaches (BPA, anchor youth, PSS, zero-RB, win-now), position-by-position,
  rookie pick handling, post-startup actions.

[CORE] dynasty_roster_construction.txt
  3 pillars (productive core, appreciating assets, liquidity), insulating risk,
  allocation by phase, depth philosophy by position, rhythm calendar.

[CORE] dynasty_trade_analysis.txt
  5-factor trade matrix, value tiers, "studs win" rule, asymmetric value,
  buy-low/sell-high signals, negotiation tactics, calc usage guardrails.

[CORE] dynasty_win_now_vs_rebuild.txt
  Decision framework, signals for each phase, the worst position (middle),
  6-step rebuild execution, win-now playbook, when to re-pivot.

[CORE] dynasty_quick_decision_heuristics.txt
  ~80 condensed rules of thumb covering roster, trades, rookies, lineups,
  waivers, value, negotiation, communication. The "cheat sheet" of the corpus.

================================================================
POSITION-SPECIFIC STRATEGY

[DEEP] dynasty_qb_strategy.txt - QB archetypes, 1QB vs SF strategy, age curves, buy/sell signals.
[DEEP] dynasty_rb_strategy.txt - RB depreciation, age 27-28 cliff, archetypes, depth philosophy, draft strategies.
[DEEP] dynasty_wr_strategy.txt - The core dynasty position. Life cycle, archetypes, draft strategies, breakout windows.
[DEEP] dynasty_te_strategy.txt - The "stud or stream" position, TE life cycle, TEP strategy.

[DEEP] dynasty_age_curves.txt
  Detailed peak/cliff data by position. Mortality table concept.
  Position-specific decision points table.

================================================================
SCORING / FORMAT FILES

[CORE] dynasty_scoring_formats.txt
  Standard, Half-PPR, Full PPR, TEP, SF, 2QB, Best Ball.
  Position scarcity multipliers by format.

[CORE] dynasty_superflex_strategy.txt
  How SF rewires every value. Draft strategy, archetypes, arbitrage.

[REF] dynasty_format_quick_reference.txt
  Quick-reference card: league sizes, roster sizes, format combinations.
  Multi-format value-shift comparison table.

================================================================
ROOKIE DRAFT FILES

[CORE] dynasty_rookie_scouting_guide.txt
  THE COMPREHENSIVE ROOKIE SCOUTING DEEP-DIVE. 4 parts:
  (1) How to read college production by position (WR/RB/QB/TE) - metrics,
      film cues, sneaky-pick signals, archetype types.
  (2) How to gauge NFL Draft landing spot - 6-dimension scoring,
      position-specific checklists, post-draft repricing.
  (3) How to choose between similar rookies - 12 hierarchical tie-breakers,
      production-denial question, opportunity-weighted view, floor-vs-ceiling.
  (4) Which rookies for which picks (1.01, 1.02-1.04, 1.05-1.08, 1.09-1.12,
      Round 2, Round 3, Round 4+) plus SF/TEP/contender/rebuilder tweaks.
  Plus appendices: tier-building workflow, scouting mistakes, archetype
  cheat sheet by position with dynasty-grade scales.

[CORE] dynasty_nfl_draft_capital_reference.txt
  Hit-rate tables by NFL Draft slot (Top-10, R1 rest, R2 early/late, R3-R7,
  UDFA) for WR/RB/QB/TE. Position-specific interpretation, exceptions,
  decay over time, practical application checklist.

[CORE] dynasty_rookie_drafts.txt
  Strategic framework. Pick valuation, prospect evaluation, format effects,
  pick trading strategies, board construction, post-draft maintenance.

[DEEP] dynasty_2026_rookie_class_breakdown.txt
  Specific 2026 NFL Draft class evaluation: top tiers, landing spot analysis,
  position-by-position breakdown, format-specific 1.01 candidates.

[DEEP] dynasty_landing_spot_evaluation.txt
  Methodology for evaluating rookie landing spots. Tier system.
  Talent endures principle. Market over-corrections.

[DEEP] dynasty_pick_value_chart_concepts.txt
  Pick valuation: slot value, year value, standings-expected value.
  Pick value table (1.01 = 100 baseline). Trade strategies.

[DEEP] dynasty_2nd_year_breakouts_post_hype.txt
  Year 2-3 breakout windows, post-hype sleeper analysis, predictive factors.

================================================================
TRADING FILES

[CORE] dynasty_trade_analysis.txt (also listed in CORE STRATEGY)
[DEEP] dynasty_2for1_trade_strategy.txt
  Why 2-for-1s win long-term, profile framework, 3-for-1 plays,
  position-specific patterns, timing, execution.

[DEEP] dynasty_buy_low_sell_high_signals.txt
  5 perception gap types, position-by-position buy and sell profiles,
  pick timing windows, calendar-based inefficiencies.

[DEEP] dynasty_psychology_negotiation.txt
  Game-theoretic framework, opponent profiles, opening tactics,
  closing tactics, ethical boundaries, reputation management.

[DEEP] dynasty_market_inefficiencies_arbitrage.txt
  12 categories of market arbitrage, compound strategies, tracking,
  expected payoff data.

[REF] dynasty_trade_calculator_comparison.txt
  All 13 major calc tools compared. Triangulation method.
  Position-specific accuracy tendencies.

[REF] dynasty_keeptradecut_methodology.txt
  KTC explained, advantages and limitations, league-sync features.

================================================================
LEAGUE / PLATFORM FILES

[CORE] dynasty_league_setup_commissioner.txt
  Full commissioner guide: constitution, league size, rosters, scoring,
  trade rules, payouts, orphan protocol, league health signals.

[DEEP] dynasty_sleeper_platform.txt
  Sleeper-specific dynasty features. Recommended modern setup.
  Common mistakes when configuring leagues.

[DEEP] dynasty_taxi_squad_strategy.txt
  How taxi squads work, optimal usage, eligibility, common mistakes.

[DEEP] dynasty_orphan_team_takeover.txt
  Pre-commitment due diligence, decision framework, year-1 playbook,
  success patterns, mistakes.

[DEEP] dynasty_contract_salary_cap_leagues.txt
  Contract dynasty mechanics, auction startup, contract length strategy,
  position-specific guidance, common mistakes.

[DEEP] dynasty_idp_strategy.txt
  IDP league formats, scoring systems, position value, draft strategies,
  metrics, mistakes, resources.

[DEEP] dynasty_devy_leagues.txt
  Devy variants, evaluation framework, position-by-position, top devy assets,
  trading strategies, mistakes.

================================================================
PHASE-SPECIFIC FILES

[CORE] dynasty_win_now_vs_rebuild.txt (already listed)

[DEEP] dynasty_post_championship_strategy.txt
  Post-title playbook. How you won analysis, position audits,
  short window vs reload decision, repeat-championship checklist,
  post-title traps.

[DEEP] dynasty_offseason_calendar.txt
  12-month month-by-month playbook. NFL FA, NFL Draft, rookie drafts,
  pre-camp, mid-season trade deadlines.

[DEEP] dynasty_zero_rb_hero_rb_strategies.txt
  Zero RB / Hero RB / Anchor RB / Robust RB compared.
  When each works in dynasty. Mistakes by strategy.

[DEEP] dynasty_tanking_ethics_strategy.txt
  Tanking forms, anti-tanking mechanisms, rebuild without tanking,
  late-season strategy, integrity-vs-ethics balance.

================================================================
WEEK-TO-WEEK MANAGEMENT

[CORE] dynasty_sit_start_decisions.txt
  Dynasty-specific lineup decisions: development reps, injury risk,
  perception management, late-season tank/win calculus.

[CORE] dynasty_waiver_wire_strategy.txt
  FAAB philosophy, weekly priorities, season-long allocation,
  lottery ticket strategy, waiver wire mistakes.

[DEEP] dynasty_handcuffs_lottery_tickets.txt
  Handcuff theory, lottery ticket profiles, taxi/bench mix,
  drop decisions, FAAB allocation.

================================================================
EVALUATION & METRICS

[CORE] dynasty_player_evaluation_framework.txt
  8-factor evaluation system, archetype templates, decision tree,
  tracking habits, scaling.

[DEEP] dynasty_advanced_metrics.txt
  Metric dictionary: TPRR, RYOE, EPA, CPOE, RAS, dominator rating, etc.
  Position-by-position metrics. Top 5 metrics to track.

[DEEP] dynasty_common_mistakes_full.txt
  60 common dynasty mistakes across 8 categories: roster, trade, rookie,
  startup, lineup, phase, commissioner, psychology.

================================================================
COMMUNITY / META FILES

[REDDIT] dynasty_reddit_community_wisdom.txt (51 KB)
  1,058 lines of community-developed wisdom from r/DynastyFF, Footballguys
  forums, DLF forum, etc. 25 sections covering mantras, beginner advice,
  win-now/rebuild playbooks, calculator skepticism, league rules battles,
  tanking ethics, orphan takeover, megathread calendar.

[REDDIT] dynasty_reddit_advanced_threads_summary.txt (29 KB)
  632 lines of advanced thread-concept summaries. Age pyramid, two-year RB
  rule, superflex QB index, trade-back EV math, WR longevity edge, etc.
  Plus meta-observations on the dynasty discourse genre.

[REF] dynasty_analyst_writeups_aggregated.txt
  Distilled consensus + individual takes from major analysts:
  Pat Fitzmaurice, Hayden Winks, Rich Hribar, Mike Clay, Justin Boone,
  Dynasty Nerds crew, DLF crew, PFF crew, Fantasy Footballers crew.

[REF] dynasty_podcasts_resources_directory.txt
  Tier-1 + Tier-2 podcasts, websites, tools, Reddit communities,
  Discord, YouTube, Twitter accounts, newsletters.

[REF] dynasty_glossary_terms.txt
  Comprehensive glossary of dynasty terms, mantras, platform-specific terms.

================================================================
TOPIC INDEX (cross-reference by topic)

ROSTER CONSTRUCTION:
  dynasty_roster_construction.txt
  dynasty_zero_rb_hero_rb_strategies.txt
  dynasty_handcuffs_lottery_tickets.txt
  dynasty_format_quick_reference.txt

TRADING:
  dynasty_trade_analysis.txt
  dynasty_2for1_trade_strategy.txt
  dynasty_psychology_negotiation.txt
  dynasty_buy_low_sell_high_signals.txt
  dynasty_market_inefficiencies_arbitrage.txt
  dynasty_trade_calculator_comparison.txt
  dynasty_keeptradecut_methodology.txt

ROOKIES:
  dynasty_rookie_scouting_guide.txt        [scouting deep-dive]
  dynasty_nfl_draft_capital_reference.txt  [hit-rate tables]
  dynasty_rookie_drafts.txt
  dynasty_2026_rookie_class_breakdown.txt
  dynasty_landing_spot_evaluation.txt
  dynasty_pick_value_chart_concepts.txt
  dynasty_2nd_year_breakouts_post_hype.txt

VALUATION:
  fantasycalc_methodology_and_context.txt
  fantasycalc_dynasty_10team_1ppr_PARSED_2026-05-08.txt
  dynasty_advanced_metrics.txt
  dynasty_player_evaluation_framework.txt

LEAGUE OPERATIONS:
  dynasty_league_setup_commissioner.txt
  dynasty_sleeper_platform.txt
  dynasty_taxi_squad_strategy.txt
  dynasty_orphan_team_takeover.txt
  dynasty_contract_salary_cap_leagues.txt
  dynasty_idp_strategy.txt
  dynasty_devy_leagues.txt
  dynasty_format_quick_reference.txt
  dynasty_tanking_ethics_strategy.txt

PHASE MANAGEMENT:
  dynasty_win_now_vs_rebuild.txt
  dynasty_post_championship_strategy.txt
  dynasty_offseason_calendar.txt

POSITION-SPECIFIC:
  dynasty_qb_strategy.txt
  dynasty_rb_strategy.txt
  dynasty_wr_strategy.txt
  dynasty_te_strategy.txt
  dynasty_age_curves.txt

WEEK-TO-WEEK:
  dynasty_sit_start_decisions.txt
  dynasty_waiver_wire_strategy.txt

COMMUNITY/META:
  dynasty_reddit_community_wisdom.txt
  dynasty_reddit_advanced_threads_summary.txt
  dynasty_analyst_writeups_aggregated.txt
  dynasty_podcasts_resources_directory.txt
  dynasty_glossary_terms.txt
  dynasty_common_mistakes_full.txt
  dynasty_quick_decision_heuristics.txt

================================================================
TRAINING DATA NOTES

1. VOLATILE vs DURABLE CONTENT
- Volatile (dates fast): FantasyCalc 2026-05-08 snapshot, 2026 rookie class file.
- Durable (multi-year value): Strategy files, mistakes, evaluation, formats.

2. FORMAT FOCUS: This corpus assumes 12-team or 10-team leagues, 1QB or SF, 1.0 PPR
or TEP. Heavy 14-team / IDP / contract leagues are covered but lighter.

3. SCORING / LEAGUE BIAS: Modern dynasty norms (Sleeper-centric, FAAB waivers,
1.0 PPR, taxi squads) are assumed unless otherwise noted.

4. SOURCE TRIANGULATION: Most strategic claims are synthesized from 3+ sources.
Where analyst-specific takes are included, they are tagged.

5. NO PLAYER NAME OBSESSION: The corpus avoids over-relying on specific player
names (which date quickly). Instead it focuses on archetypes, age tiers, and
patterns. Where players are mentioned, they're current as of May 2026.

6. EXPLICIT GAPS: This corpus does NOT cover:
- IDP rankings player-by-player.
- Specific bid history for FAAB strikes.
- College football scouting at scale.
- NFL Draft prospect-by-prospect grades.
- These can be added as future training data.

================================================================
RECOMMENDED TRAINING APPROACH

If fine-tuning an LLM on this corpus:

PHASE 1 (foundation): train on CORE files first to establish dynasty mental model.

PHASE 2 (depth): add DEEP files for specialized knowledge.

PHASE 3 (community): add REDDIT files for natural-language style and consensus.

PHASE 4 (evaluation): add DATA + REF files for grounded numerical reasoning.

The corpus is structured so each file is self-contained but cross-references
related files at the head. Section headers are uniform for parsing.

================================================================
GENERATED 2026-05-08
Pulled FantasyCalc API at this date for live values.
All other content reflects mid-2026 dynasty consensus.
Training data version 1.0.
