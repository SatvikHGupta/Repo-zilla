---
title: "We Re-Ran Our C++ vs. Rust Momentum Numbers. The Ranking Didn't Move an Inch."
date: "2027-04-04"
slug: github-language-momentum-recheck-2027
category: data
tags: [data, languages, rust, cpp, methodology]
---

# We Re-Ran Our C++ vs. Rust Momentum Numbers. The Ranking Didn't Move an Inch.

Our [language momentum comparison](/blog/github-language-momentum-vs-legacy-stars-2026) made a claim that got pushback: C++ repos in our catalog have higher median momentum (stars divided by years since creation) than Rust, despite being nearly twice as old on average. Claims like that are worth re-checking rather than just defending, so we pulled the exact same query again against our current catalog. Every language's number moved by less than 1%. The ranking is identical, position for position.

## Same methodology, run again

Momentum score = stars ÷ years since creation. Repos under 6 months old excluded (too noisy to measure meaningfully). Minimum sample of 80 repos per language to appear in the table.

## Then vs. now, side by side

| Language | Original Median (★/yr) | Current Median (★/yr) | Change |
|---|---|---|---|
| C++ | 610.8 | 612.8 | +0.3% |
| C | 417.0 | 418.7 | +0.4% |
| Rust | 395.8 | 395.1 | -0.2% |
| Shell | 351.9 | 353.4 | +0.4% |
| Python | 341.8 | 342.4 | +0.2% |
| TypeScript | 313.6 | 314.2 | +0.2% |
| Go | 305.0 | 306.5 | +0.5% |
| Jupyter Notebook | 245.0 | 247.2 | +0.9% |
| Java | 210.8 | 211.8 | +0.5% |
| JavaScript | 193.3 | 193.6 | +0.2% |
| Kotlin | 166.4 | 168.4 | +1.2% |
| Vue | 158.8 | 159.8 | +0.6% |
| Swift | 140.3 | 141.8 | +1.1% |
| Dart | 133.1 | 133.2 | +0.1% |
| C# | 103.5 | 103.2 | -0.3% |
| Ruby | 98.2 | 98.8 | +0.6% |
| PHP | 73.5 | 73.8 | +0.4% |
| Dockerfile | 64.6 | 65.2 | +0.9% |

Not a single language changed rank position. C++ is still #1, Dockerfile is still last, and everything in between sits in the exact same order it did the first time. The largest single move was Kotlin at +1.2%, well within what you'd expect from normal catalog growth (new repos clearing the curation bar, existing repos gaining stars) rather than any structural shift in the underlying pattern.

## Why we're publishing this instead of just moving on

A single snapshot claiming "C++ beats Rust on this metric" is easy to dismiss as a fluke of whatever day the data was pulled: maybe a few high-momentum Rust repos got flagged or removed, maybe C++ had a lucky week. Running the identical query again and getting a stable ranking is a cheap, honest way to answer that objection with evidence instead of an argument. It doesn't prove the underlying interpretation is right (we're still measuring "momentum within our curated catalog," not industry-wide adoption), but it does rule out "this was noise" as an explanation.

## What this does and doesn't prove

This confirms the *measurement* is stable, not that the *interpretation* is complete. The original caveat still applies in full: C++'s advantage here is a survivorship story (median C++ age 9+ years vs. Rust's 5.6 years, what's left after a decade of C++ projects is what proved durable), not evidence that C++ is "winning" adoption today. What this re-run adds is confidence that the numbers themselves aren't an artifact of one bad pull. If you're going to disagree with the conclusion, the disagreement needs to be with the interpretation, not the arithmetic.

## Why We're Publishing the Same Table Twice

Most data blogs publish a number once and never look at it again, which quietly trains readers not to trust any single-snapshot stat too far, fairly, since there's no way to tell a real number from a one-off fluke without a second look. Re-running your own claims and showing the receipts, even when the answer is "nothing changed," is a small thing that costs us one afternoon and costs the reader nothing but two minutes of reading. We'll keep doing this periodically for our bigger claims, not just this one.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories.*
