# FANTASYCALC DYNASTY VALUE METHODOLOGY AND CONTEXT
Date pulled: 2026-05-08 (snapshot only - values change daily)
Endpoint:    https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=10&ppr=1
Format:      Dynasty, 10-team, 1QB (NOT superflex), 1.0 PPR

## WHAT THE NUMBERS MEAN
- value: FantasyCalc's current dynasty trade value for the player or pick. Higher = more valuable. The scale is internally consistent: a player worth 10,000 is roughly twice as valuable as one worth 5,000 in a trade context.
- overallRank: Where the asset sits across the entire pool (players + rookie picks + future picks).
- positionRank: Rank within position group (RB1, WR1, etc.) or pick rank.
- trend30Day: Net change in value over last 30 days. Positive = value rising; negative = value falling. Use this to spot buy-low and sell-high windows.
- redraftValue: What the same player is worth in a one-year redraft league. Lower than dynasty value typically only for very young ascending players.
- redraftDynastyValueDifference: dynasty value - redraft value. Large positive number = young player whose dynasty value is mostly future-driven. Large negative number = aging veteran whose redraft value exceeds dynasty (sell-high candidate for rebuilders).
- redraftDynastyValuePercDifference: same difference expressed as percent.
- maybeMovingStandardDeviation: Rough volatility measure - bigger = more disagreement / faster price movement.
- maybeTier: FantasyCalc tier grouping. Players in the same tier are roughly interchangeable on value.
- maybeTradeFrequency: How often this player has been involved in tracked trades recently. High = liquid asset (easy to move). Low = "stuck" asset (hard to find takers at calc value).
- starter: Whether the player profiles as a weekly fantasy starter in this format.

## HOW TO USE THIS DATA AS A TRADE BASELINE
1. The market follows these values loosely; they are crowdsourced + algorithmic but not gospel. Real trades often clear at +/- 10-15% of calc.
2. For trades, sum each side's player values and compare. A net difference under ~5% is roughly even. 5-15% is "small win" territory. >15% is meaningful.
3. The party giving up the BEST single asset usually still loses the trade in dynasty - "studs win trades." Two 4,000-value players for one 8,000-value player is rarely a fair deal even though math says so.
4. Account for roster context. A WR2 worth 5,000 to a contender (who needs to start him) is worth more than 5,000 to a tanking team (who can't use him).
5. Trend30Day is leverage. If a player's value just spiked +500, they're priced AT or ABOVE actual market in real trades; if they cratered -500, the market often hasn't caught up yet and you can sell at calc.
6. Picks: Calc treats picks as a single value. In real-life, expected pick = midpoint of expected slot in your league's standings. A "1st" from a contender is worth less than a "1st" from a tanker.

## KEY DIFFERENCES BETWEEN 1QB and SUPERFLEX (this dataset is 1QB)
- 1QB: Only top ~12 QBs are weekly startable. QB scarcity is low, so QBs are devalued vs SF.
- SF: Two QB starters per team => 24+ are startable. QB1 prices roughly double, top-12 QBs occupy most of the top-24 overall.
- If the user's league is SF, multiply QB values by ~1.7-2.2x as a rough adjustment, and de-value RB/WR slightly.

## KEY DIFFERENCES 10-TEAM vs 12-TEAM
- 10-team: Shallower pool, only ~ top-50 RBs and ~top-60 WRs are starters. Bench depth is less valuable. Streamers and bye-week fillers are easier on waivers.
- 12-team: More starters needed, depth players are worth more, late-round fliers and rookie 3rds carry meaningful value.

## PPR SCALING
- 1.0 PPR (this dataset): WRs and pass-catching RBs are inflated; possession TEs gain.
- 0.5 PPR: Top-tier WRs lose ~5-10% relative value, between-the-tackles RBs gain.
- Standard (0 PPR): TD-dependent RBs spike, pass-catchers drop further.
- TE Premium (1.5 PPR for TEs): Elite TEs shoot up multiple tiers. Add ~25-40% to top TEs.

## NOTABLE BEHAVIORS IN DYNASTY VALUE CURVES
- Rookie 1.01 typically prices around the late RB1/early WR1 range early in offseason and drifts up as the rookie class crystallizes post-NFL Draft.
- Veteran RBs (28+) collapse fast. A 27 yo RB1 is often worth half a 24 yo RB2.
- Elite WRs (Justin Jefferson type) hold value latest because of position longevity + scarcity at the top.
- TEs have long careers but flat aging curves; values mostly track current production.
- QBs in 1QB hold value into mid-30s; in SF, even mid-30s QBs hold meaningful trade weight.

## WARNINGS / LIMITS OF THIS DATA
- One snapshot. Use it as a marker, not eternal truth.
- League-context blind: doesn't know your roster, scoring tweaks, payouts, contracts/cap rules.
- Trade-frequency outliers: a player with very low maybeTradeFrequency may be hard to actually trade at the listed value because nobody is buying.
