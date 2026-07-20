---
title: "The Median GitHub Repo Gains 276 Stars a Year. OpenClaw Is Gaining 578,632."
date: "2026-05-31"
slug: github-repo-momentum-score-2026
category: ai-ml
tags: [data, stars, growth, ai-agents]
---

# The Median GitHub Repo Gains 276 Stars a Year. OpenClaw Is Gaining 578,632.

Star counts alone are misleading: a 10-year-old repo with 5,000 stars and a 6-month-old repo with 5,000 stars are not the same kind of project. To fix that, we computed a **momentum score** across our catalog of 34,787 repos: stars divided by years since creation. It separates repos that are actually accelerating right now from repos that just accumulated stars slowly over a long time.

## The direct answer

Across 33,640 repos old enough to measure meaningfully (excluding anything under 6 months old, where the math gets noisy), the **median momentum score is 276 stars per year**. The **mean is 1,067**, pulled up hard by a small number of extreme outliers, which is exactly what you'd expect from a power-law distribution.

The single highest-momentum repo in our entire dataset is **openclaw/openclaw**, created November 24, 2025, currently at 356,447 stars, a momentum score of **578,632 stars per year**. That's over 2,000x the median.

## The full distribution

| Percentile | Stars/Year |
|---|---|
| 50th (median) | 276.3 |
| 75th | 770.9 |
| 90th | 2,040.7 |
| 95th | 3,773.5 |
| 99th | 13,745.3 |

If your side project is gaining 300 stars a year, you're not underperforming. You're sitting almost exactly at the median of the entire open-source ecosystem. If you're gaining 2,000+ a year, you're already in the top 10%.

## The top 15 by momentum right now

| Momentum (★/yr) | Age | Stars | Repo | Language |
|---|---|---|---|---|
| 578,632 | 0.6y | 356,447 | openclaw/openclaw | TypeScript |
| 202,401 | 0.7y | 150,173 | obra/superpowers | Shell |
| 147,810 | 0.8y | 116,548 | anthropics/skills | Python |
| 120,274 | 1.2y | 142,583 | anomalyco/opencode | TypeScript |
| 108,574 | 0.7y | 79,368 | msitarzewski/agency-agents | Shell |
| 107,183 | 0.6y | 64,266 | nextlevelbuilder/ui-ux-pro-max-skill | Python |
| 100,002 | 0.9y | 87,613 | github/spec-kit | Python |
| 92,558 | 0.6y | 51,949 | gsd-build/get-shit-done | JavaScript |
| 89,431 | 0.6y | 54,601 | 666ghj/MiroFish | Python |
| 86,268 | 0.6y | 51,253 | code-yeongyu/oh-my-openagent | TypeScript |
| 82,870 | 1.4y | 113,443 | anthropics/claude-code | Shell |
| 82,822 | 1.2y | 101,132 | google-gemini/gemini-cli | TypeScript |
| 79,520 | 1.0y | 76,200 | NousResearch/hermes-agent | Python |
| 74,317 | 0.7y | 53,512 | ComposioHQ/awesome-claude-skills | Python |
| 72,395 | 0.9y | 65,805 | earendil-works/pi | TypeScript |

## What the top 15 actually tells you

Every single one of them is AI-agent or AI-coding-tool tooling, created within the last 18 months. This isn't a fluke of our sample. It's the clearest possible signal of where developer attention is concentrated in 2026. Compare this to the top-10-oldest list we published separately (static analyzers, ORMs, real-time editors, all pre-2013): the contrast is the entire story of how open source priorities shift generation to generation.

## The honest caveat

This is a snapshot metric, not a growth curve. We have one data point per repo (current stars, current age), not month-by-month history, so "578,632 stars/year" doesn't mean OpenClaw is gaining that many stars *every single year going forward*. It means that's the average rate since creation. Early viral spikes get averaged the same as steady growth. Treat this as a momentum signal, not a forecast.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories.*
