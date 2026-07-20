---
title: "The Median Repo in Our Catalog Has 1,674 Stars. Most 'Top Repo' Lists Never Show You This Number."
date: "2026-07-19"
slug: median-github-repo-stats-2026
category: learning
tags: [data, benchmarks, stars, methodology]
---

# The Median Repo in Our Catalog Has 1,674 Stars. Most "Top Repo" Lists Never Show You This Number.

Every "best GitHub repos" listicle shows you outliers: React, TensorFlow, freeCodeCamp, things with six-figure star counts. Nobody publishes the boring middle of the distribution. So here it is: across our catalog of 34,787 curated repos, the **median star count is 1,674**, median forks are **210**, and the median repo hasn't been touched in **143 days**.

## The important caveat first

This is the median of our *curated catalog*, not a random sample of all public GitHub repositories. Our catalog is pre-filtered toward repos that already cleared a verification bar (real activity, real usage signals), so these numbers describe "a repo good enough to make a curated list," not "a typical repo on GitHub," which would skew dramatically lower (most public repos have single-digit stars or none at all). Keep that scope in mind for every number below.

## The full breakdown

| Metric | Median | Mean |
|---|---|---|
| Stars | 1,674 | 4,978 |
| Forks | 210 | 778 |
| Open issues | 24 | - |
| Repo size (KB) | 7,625 | - |
| Age | 6.71 years | - |

The gap between median and mean stars (1,674 vs. 4,978) is the whole story in one line: a small number of mega-popular repos are dragging the average far above what a "typical" well-regarded repo actually looks like. If you've ever felt like your 800-star project is a failure next to some 80,000-star tool, it isn't. It's within normal range.

## Star count by percentile

| Percentile | Stars |
|---|---|
| 10th | 278 |
| 25th | 619 |
| 50th (median) | 1,674 |
| 75th | 4,697 |
| 90th | 11,283 |
| 95th | 19,482 |
| 99th | 51,357 |

Notice how much the curve steepens after the 90th percentile. Going from median to 90th percentile is roughly a 7x jump. Going from 90th to 99th is another 4.5x. Popularity on GitHub isn't linear; it's a power law, and the "famous" repos everyone references are drawn almost entirely from that top 1%.

## Maintenance activity: the number that actually matters more than stars

- **30.9%** of repos in our catalog had a commit within the last 90 days
- **34.1%** haven't been touched in over a year
- **19.7%** haven't been touched in over two years

That last number is worth sitting with: roughly **1 in 5** repos that were good enough to clear our curation bar in the first place have gone quiet for 2+ years. Stars don't expire. Maintenance does.

## Language and license breakdown, for context

**Top languages:** Python (19.3%), TypeScript (15.6%), JavaScript (15.1%), Go (9.1%), Java (7.9%), Rust (6.6%)

**Top licenses:** MIT (42.0%), Apache-2.0 (19.2%), no license specified (11.5%), GPL-3.0 (5.9%)

That 11.5% with no license at all is worth flagging if you're evaluating dependencies: a repo with real stars and real activity but zero license file is a legal gray area for production use, regardless of how good the code is.

## Why this number matters

If you're building something and comparing your repo's traction against the wrong reference point (the 80,000-star outliers instead of the actual median), you're measuring yourself against survivorship bias, not reality. 1,674 stars isn't a modest number. In the context of everything that's ever been good enough to get curated, it's exactly the middle of the pack.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories.*
