---
title: "Only 3.5% of Repos in Our Catalog Were Committed to in the Last 30 Days. Here's the Full Breakdown."
date: "2026-07-26"
slug: github-repo-commit-recency-histogram-2026
category: devops
tags: [data, maintenance, benchmarks]
---

# Only 3.5% of Repos in Our Catalog Were Committed to in the Last 30 Days. Here's the Full Breakdown.

We took a snapshot of "time since last commit" across all 34,787 repos in our catalog and bucketed it. The result: activity drops off fast. Just **3.5%** had a commit in the last month. By the 3-6 month mark, you're already looking at the single largest bucket in the entire dataset.

## The full histogram

| Time Since Last Commit | Repos | % of Total |
|---|---|---|
| 0–1 month | 1,220 | 3.5% |
| 1–3 months | 9,529 | 27.4% |
| 3–6 months | 8,382 | 24.1% |
| 6–12 months | 3,804 | 10.9% |
| 1–2 years | 4,998 | 14.4% |
| 2–3 years | 4,695 | 13.5% |
| 3–5 years | 2,159 | 6.2% |

Read this as a snapshot, not a decay curve; we have one measurement per repo (how long ago its last commit was), not a running history of commit frequency over time. But the shape is still informative: over half the catalog (54.9%) has been quiet for more than 3 months, and nearly 20% haven't seen a commit in 2+ years.

## Where this gets genuinely useful: freshness by curation tier

We score every repo in our catalog into one of four tiers (0 through 3, tier 3 being our most selective, highest-signal shelf). When we check what percentage of each tier was committed to within the last 90 days, the pattern is exactly what a scoring system should produce:

| Tier | Repo Count | % Committed Within 90 Days |
|---|---|---|
| Layer 0 | 25,787 | 25.0% |
| Layer 1 | 7,000 | 43.1% |
| Layer 2 | 1,750 | 62.1% |
| Layer 3 | 250 | 77.6% |

That's a clean, monotonic climb: each tier up is meaningfully fresher than the one below it, more than tripling from Layer 0 to Layer 3. This is essentially a sanity check on our own scoring methodology: if "maintenance recency" is one of the signals feeding the score (it is), the top tier should look measurably more active than the bottom tier. It does, by a wide margin.

## What this means if you're picking a dependency

A repo sitting in the "3-6 months since last commit" bucket, the single biggest bucket in our data, isn't necessarily a red flag. Plenty of genuinely stable, feature-complete libraries go quiet for months between point releases. The real inflection point in our data is the 1-year mark. Past that, a repo shifts from "stable" to "probably not actively maintained" territory, and past 2 years, you should assume you won't get support if something breaks.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories.*
