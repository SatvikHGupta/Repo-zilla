---
title: "29.4% of Repos With 1,000+ Stars Haven't Been Touched in Over a Year"
date: "2026-08-23"
slug: stars-dont-predict-maintenance-2026
category: data
tags: github, data, maintenance, dependency-health
---

# 29.4% of Repos With 1,000+ Stars Haven't Been Touched in Over a Year

Running the numbers directly on our own catalog of 34,787 scored repositories: among the 23,233 repos with more than 1,000 stars, 6,822 of them, 29.4%, haven't had a commit in over a year. Nearly a third of what most people would consider "popular enough to trust" is sitting quiet.

## The number holds even at the very top

The obvious objection: maybe this is a long tail effect, and the truly famous repos are still actively maintained. It isn't, and they aren't, uniformly:

| Star threshold | Repos in this tier | Stale (no commit in 1+ year) | Percentage stale |
|---|---|---|---|
| 1,000+ | 23,233 | 6,822 | 29.4% |
| 5,000+ | 8,288 | 1,957 | 23.6% |
| 10,000+ | 4,024 | 778 | 19.3% |
| 50,000+ | 362 | 38 | 10.5% |

The stale percentage does drop as you climb toward the very top-tier, mega-popular repos, which makes intuitive sense, since a project needs sustained relevance to reach 50,000+ stars in the first place. But even in that most-famous tier, better than 1 in 10 is stale. And the drop from "1,000+ stars" to "50,000+ stars" only takes you from roughly 3-in-10 stale to roughly 1-in-10. Star count is a weak filter for maintenance status at every level, not just among mid-tier repos.

## What "stale" actually looks like at the top

Some of the specific repos sitting in the stale-but-massively-starred bucket are genuinely recognizable names: Vue 2 (vuejs/vue, 209,809 stars, no commit since October 2024), Facebook's create-react-app (103,533 stars, no commit since February 2025), and animate.css (82,549 stars, quiet since July 2024). None of these are obscure. They're exactly the kind of repo a newer developer would reach for on reputation alone, without checking commit history first.

This isn't necessarily a problem for every one of these; a CSS animation library or a well-established utility can genuinely be feature-complete and not need constant commits. But `create-react-app` specifically is a case where staleness matters a lot: React's own ecosystem has moved on to Vite-based tooling, and a beginner following an old tutorial that still recommends `create-react-app` is being pointed at something the maintainers themselves have effectively stepped back from.

## Why this happens

The mechanism isn't mysterious. Stars accumulate and never decrease; once a repo earns a star, it keeps it forever, regardless of whether the project is still active. Commit activity, by contrast, reflects only the present. A repo can spend years accumulating stars from its peak relevance and then coast on that reputation indefinitely, showing up in every "top starred repos" list while doing nothing under the hood. Star count measures historical impact. It was never designed to measure current maintenance status, and using it as a proxy for "is this safe to depend on right now" is a category error that's easy to make because it's the most visible number GitHub shows you.

## Check the Commit Date, Not the Star Count

If you're evaluating whether to add a dependency, star count tells you whether a project mattered at some point. It tells you almost nothing about whether it's actively maintained today. Check the last commit date directly. It takes one click, and roughly 3 in 10 popular repos will surprise you.

*Computed directly from our own catalog of 34,787 scored and categorized GitHub repositories.*
