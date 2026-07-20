---
title: "5 Real Signals That Tell You a Repo Is Actually Maintained (Not Just Popular)"
date: "2026-09-20"
slug: repo-maintained-vs-life-support-signals-2026
category: practical
tags: github, open-source, dependency-health, data
---

# 5 Real Signals That Tell You a Repo Is Actually Maintained (Not Just Popular)

Running our own scoring system across 34,787 catalogued repositories, a few signals turned out to correlate with our internal quality score far more strongly than raw popularity alone. Here's the actual checklist that comes out of that: plain-English, no need to read the scoring code to use it.

## 1. Star count, log-scaled (correlation: 0.96)

This is the single strongest signal in our dataset, but the important detail is the log-scaling: the difference between 100 and 1,000 stars matters a lot more than the difference between 50,000 and 51,000. Raw star count on its own overweights old, famous, possibly-abandoned projects. Log-scaled stars still capture "this project earned real attention," without letting a decade-old mega-project's absolute number drown out everything else.

## 2. Fork count, log-scaled (correlation: 0.92)

Forks turned out to correlate almost as strongly as stars, and for a good structural reason: forking is a much stronger signal of intent than starring. Someone stars a repo because they thought it looked interesting for two seconds. Someone forks a repo because they plan to actually read, modify, or build on the code. A healthy fork-to-star ratio is a genuinely useful gut check: a repo with 10,000 stars and 40 forks got a lot of passive attention and very little real engagement.

## 3. Momentum: stars accumulated per year since creation (correlation: 0.78)

Raw star count doesn't tell you whether a project is still gaining attention or coasting on reputation from five years ago. Dividing star count by age in years gives you a rough velocity number, and it correlates strongly with actual project health in our data. The caveat here matters: this is a snapshot proxy for velocity, not a real historical growth curve. A project that got 40,000 stars in one viral week two years ago and then flatlined will still show high momentum on this metric, because the math doesn't distinguish "steady growth" from "one spike a while back." Pair it with signal #5 below to catch that case.

## 4. Time since last commit (correlation: -0.28, i.e. inverse)

This one has a weaker raw correlation than you might expect, and that's actually informative: a repo can go quiet for a while and still be fine, especially small, focused utility libraries that are simply feature-complete. Where recency really matters is in combination with high stars and low fork counts. A well-starred repo that hasn't been touched in two-plus years and has never earned many forks is the closest thing to a genuine red flag pattern in our data.

## 5. Open issue count (correlation: 0.29)

This one surprised us going in, because a huge open-issue count sounds like a bad sign, but in this dataset it correlates positively, weakly, with our quality score. The reason isn't that issues are good; it's that open issues are also a proxy for usage volume. A project with zero open issues either has a tiny user base that never files anything, or a maintainer who's aggressively closing everything (which cuts the other way; see the Lodash "issue bankruptcy" story). The number worth watching isn't the count itself, it's the ratio of open issues to stars: a project with thousands of stars and near-zero open issues is often either extremely mature and stable, or quietly abandoned and nobody's bothering to file anything anymore. Context, not the raw number, tells you which.

## The actual checklist

Put together, before depending on a repo for something real:
- Check log-scaled stars and forks together, not stars alone; a low fork-to-star ratio is a real yellow flag.
- Check momentum (stars ÷ years) to see if it's still gaining or coasting.
- Check last-commit recency, but weight it more heavily when forks are also low.
- Check the open-issues-to-stars ratio, and if it's suspiciously low on a popular repo, go look at whether that's healthy maturity or a maintainer who's stopped engaging.

None of these signals alone tells the whole story, and that's exactly why relying on star count in isolation, which is what most "is this repo good" heuristics default to, misses so much. The combination is what actually separates "maintained" from "on life support but still getting stars from people who don't check."

*Correlations computed directly against our own 34,787-repository quality score across the full catalog.*
