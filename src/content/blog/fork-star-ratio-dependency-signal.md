---
title: "The Median Repo Has 1 Fork for Every 8 Stars. The Extremes Aren't What We Expected."
date: "2027-06-06"
slug: github-fork-star-ratio-dependency-signal-2027
category: data
tags: [data, forks, stars, methodology]
---

# The Median Repo Has 1 Fork for Every 8 Stars. The Extremes Aren't What We Expected.

We went into this expecting a clean story: high fork-to-star ratio means people are actually using the repo as a dependency (forking to patch, vendor, or contribute), low ratio means people just starred it and moved on. Across our catalog of 34,787 repos, the **median fork:star ratio is 0.127**, roughly 1 fork for every 8 stars. The extremes told a messier, more honest story than that hypothesis.

## The full distribution

| Percentile | Fork:Star Ratio |
|---|---|
| 10th | 0.045 |
| 25th | 0.074 |
| 50th (median) | 0.127 |
| 75th | 0.217 |
| 90th | 0.362 |
| 95th | 0.504 |
| 99th | 1.206 |

Mean sits at 0.197, pulled up by the same kind of long tail we see in every metric on this dataset. A repo at the 99th percentile has more forks than stars entirely, which sounds like a red flag until you look at what's actually driving it.

## By project type

| Project Type | Sample | Median Ratio |
|---|---|---|
| Boilerplate | 146 | 0.195 |
| Fullstack | 483 | 0.190 |
| Auth/Security | 654 | 0.164 |
| Mobile | 1,571 | 0.152 |
| DevOps | 2,552 | 0.143 |
| Database | 1,325 | 0.142 |
| Systems | 1,611 | 0.139 |
| Frontend | 4,178 | 0.127 |
| Backend | 10,035 | 0.125 |
| AI/ML | 4,570 | 0.124 |
| Learning/Docs | 1,216 | 0.108 |
| UI/CSS | 802 | 0.095 |
| CLI/Tools | 319 | 0.070 |

This part actually matches intuition: **CLI/Tools has the lowest fork ratio of any category (0.070)**. You install a CLI tool; you don't fork it, since there's nothing to vendor or patch for daily use. Boilerplate and Fullstack sit highest, which also makes sense: starter templates are *designed* to be forked as a first step, not just admired.

## The counterintuitive part

We split the dataset into fork-ratio quartiles and checked what percentage of each quartile had a commit in the last 90 days:

| Quartile | Ratio Range | Active Rate (commit ≤90d) |
|---|---|---|
| Q1 (lowest ratio) | 0.000 - 0.074 | 42.9% |
| Q2 | 0.074 - 0.127 | 42.1% |
| Q3 | 0.127 - 0.217 | 38.0% |
| Q4 (highest ratio) | 0.217 - 30.6 | 35.3% |

If a high fork ratio meant "people depend on this and are actively working with it," you'd expect Q4 to be the most actively maintained group. It's the opposite: **the lowest fork-ratio quartile is the most actively maintained one**, by a gap of nearly 8 points. Fork ratio isn't tracking dependency usage. It's tracking something else entirely, and the top and bottom of the distribution show what.

## What's actually driving the high end

Top 10 fork:star ratios in the dataset, minimum 500 stars to filter out noise:

| Repo | Stars | Forks | Ratio | Type |
|---|---|---|---|---|
| TheOdinProject/javascript-exercises | 1,601 | 46,059 | 28.77 | Learning exercises |
| yankils/Simple-DevOps-Project | 943 | 16,894 | 17.92 | DevOps |
| samqin123/MoonTV | 1,903 | 30,978 | 16.28 | JS/General |
| UseInterstellar/Interstellar | 1,971 | 23,208 | 11.78 | JS/General |
| wukongdaily/DockerTarBuilder | 1,712 | 18,535 | 10.83 | DevOps |
| stacksimplify/azure-aks-kubernetes-masterclass | 834 | 8,382 | 10.05 | DevOps |
| solana-labs/token-list | 1,660 | 15,072 | 9.08 | Backend |
| FIRST-Tech-Challenge/FtcRobotController | 1,213 | 8,848 | 7.29 | Backend |
| titaniumnetwork-dev/Ultraviolet | 798 | 5,816 | 7.29 | JS/General |
| Guru322/GURU-Ai | 1,157 | 8,337 | 7.21 | AI/ML |

The #1 result explains the whole pattern: **TheOdinProject/javascript-exercises** has 46,059 forks against 1,601 stars because it's a coding-bootcamp curriculum, and students are *instructed* to fork it to do the exercises. It's not being used as a dependency, it's being used as a workbook. The DevOps masterclass repo and the FIRST Robotics repo are the same shape: forking is the literal onboarding step, not a signal of ongoing technical reliance.

A few of these (proxy/tunnel tools like Interstellar and Ultraviolet, and repos with generic "build your own X" naming) also match the profile of repos that get mass-forked as part of "fork this to claim a reward" schemes that circulate on crypto and gaming Discords, where forking costs nothing and the instructions spread fast. We can't verify intent from star/fork counts alone, but the shape of the data is consistent with that pattern, not with organic dependency adoption.

## What's driving the low end

Lowest fork:star ratio, minimum 5,000 stars to isolate repos where the imbalance is actually notable:

| Repo | Stars | Forks | Ratio |
|---|---|---|---|
| QuipNetwork/hashsigs-py | 10,081 | 22 | 0.0022 |
| QuipNetwork/hashsigs-ts | 10,089 | 25 | 0.0025 |
| QuipNetwork/xquad | 5,610 | 17 | 0.0030 |
| Max-Eee/NeoPass | 25,239 | 92 | 0.0036 |
| QuipNetwork/hashsigs-rs | 10,101 | 38 | 0.0038 |
| QuipNetwork/cpp-sdk | 10,154 | 42 | 0.0041 |
| unicity-astrid/sdk-js | 8,238 | 36 | 0.0044 |
| probelabs/goreplay | 19,277 | 86 | 0.0045 |
| QuipNetwork/ethereum-sdk | 10,237 | 68 | 0.0066 |
| avgupta456/github-trends | 16,072 | 117 | 0.0073 |

Five of the ten lowest-ratio repos in the entire dataset belong to a single organization, **QuipNetwork**, each sitting around 10,000 stars with only 20-90 forks. A star count that consistent across multiple unrelated SDK repos from one small org, with almost nobody forking any of them, is the signature we'd expect from purchased or campaign-driven stars rather than organic popularity. We're not accusing anyone of anything here (we don't have the data to prove intent), but it's worth flagging as exactly the kind of number a "top repos by stars" listicle would present at face value without ever checking the fork count next to it.

## The actual takeaway

Fork:star ratio isn't a clean proxy for "this is depended upon" in either direction. High ratios are more often explained by fork-to-participate workflows (exercises, templates, farming schemes) than by genuine downstream usage. Low ratios at high star counts are a reasonable, if not conclusive, flag for inorganic star inflation, especially when it clusters by organization the way it does here. If you want a real dependency signal, fork ratio alone isn't it; you'd need to cross-reference against actual package registry download counts, which is outside what star/fork data alone can tell you.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories.*
