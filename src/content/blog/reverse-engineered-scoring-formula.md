---
title: "I Reverse-Engineered My Own Scoring Formula Because I'd Lost the Source"
date: "2026-06-14"
slug: reverse-engineered-repo-scoring-formula-2026
category: data
tags: github, scoring, regression, methodology, data
---

# I Reverse-Engineered My Own Scoring Formula Because I'd Lost the Source

Every repo in our 34,787-repository catalog carries a computed quality score, but the frontend package I had on hand only shipped the pre-computed scores, not the actual scoring logic that produced them. Rather than guess at the weights from memory, I ran a proper regression against the data itself to reconstruct the formula empirically. Here's what came out, and how confident you should actually be in it.

## The method

I pulled five features that plausibly feed into a "how good is this repo" score: log-scaled star count, log-scaled fork count, log-scaled open issue count, years since the last commit, and years since the repo was created. Log-scaling stars and forks matters because raw counts are wildly skewed: a handful of repos have hundreds of thousands of stars while the median sits in the low hundreds, and a linear model on raw counts would just be a star-count detector wearing a trenchcoat.

I fit a straightforward multivariate linear regression against the actual stored score field across all 34,787 repos, then checked how well it reconstructed the real scores.

## The result: R² of 0.977

The regression explains 97.7% of the variance in the actual scores using just those five features. That's an unusually clean fit for something reverse-engineered from output alone. It strongly suggests the real scoring formula is a fairly simple, linear-ish combination of these same signals, not something exotic with hidden nonlinear terms or extra hand-tuned category-specific adjustments.

As a sanity check on a specific repo: cppcheck-opensource/cppcheck has an actual stored score of 3.8854. The reconstructed formula predicts 3.8895, off by about 0.004, well within noise.

## What's actually driving the score

Breaking the fitted coefficients down by their relative contribution to the model's predictions:

| Signal | Relative weight |
|---|---|
| Log-scaled star count | ~52% |
| Log-scaled fork count | ~36% |
| Time since last commit (years, negative) | ~10% |
| Repo age (years, negative) | ~2% |
| Log-scaled open issue count | ~0.3% |

Stars and forks together account for roughly 88% of what drives the score, with stars mattering somewhat more than forks. Recency has a real but comparatively modest negative effect: a repo loses some score for going quiet, but it doesn't dominate the formula the way star/fork popularity does. Open issue count, despite showing up as a variable I expected to matter, turned out to have essentially no independent weight once stars and forks are already accounted for, which makes sense, since issue count itself correlates with popularity and is largely redundant with the star/fork signal once that's in the model.

## The honest caveats

This is a reconstruction, not the actual source code, and a few things could make the real formula differ from this approximation even with a 97.7% fit:

- **Category-specific adjustments.** If the real scoring logic applies different weights or bonuses per project category (frontend vs. backend vs. ML, say), a single global regression would average those differences away rather than detect them.
- **Nonlinear terms or thresholds.** A formula with a hard cutoff or a nonlinear interaction between two features (e.g., "boost score if stars AND forks both exceed some threshold together") can still fit reasonably well under a linear approximation without matching the real mechanism.
- **Features not included here.** Anything not in my five inputs (language, license type, presence of documentation, contributor count) could be folded into the real score in ways this regression can't detect, especially if their effect is small enough not to hurt the overall fit much.

## The Mental Model, Not the Exact Formula

If you're trying to understand what makes a repo score well in a system like this without access to the underlying code, star and fork count (log-scaled, not raw) explain the overwhelming majority of it, and recency plays a real but secondary role. That's a genuinely useful mental model for eyeballing any repo's likely quality signal even without a formal scoring pipeline, though treat the specific percentages here as a well-fitted approximation, not a verified ground truth.

*Computed directly against our own catalog of 34,787 scored and categorized GitHub repositories via linear regression.*
