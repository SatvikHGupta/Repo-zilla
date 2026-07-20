---
title: "C++ Has Higher Momentum Than Rust in Our Catalog. That's Not the Story You'd Expect."
date: "2026-08-09"
slug: github-language-momentum-vs-legacy-stars-2026
category: systems
tags: [data, languages, rust, cpp, python]
---

# C++ Has Higher Momentum Than Rust in Our Catalog. That's Not the Story You'd Expect.

Using the same momentum score from our repo-velocity analysis (stars divided by years since creation), we broke it down by language. The result cuts against the popular "Rust is eating C++" narrative: **C++ repos in our catalog have a higher median momentum (610.8 stars/year) than Rust (395.8 stars/year)**, despite C++ repos being, on average, nearly twice as old.

## The full table

| Language | Sample Size | Median Momentum (★/yr) | Median Stars | Median Age (yrs) |
|---|---|---|---|---|
| C++ | 1,186 | 610.8 | 4,840 | 9.1 |
| C | 1,125 | 417.0 | 3,598 | 10.2 |
| Rust | 2,172 | 395.8 | 1,860 | 5.6 |
| Shell | 1,128 | 351.9 | 2,318 | 7.7 |
| Python | 6,362 | 341.8 | 1,751 | 5.4 |
| TypeScript | 5,105 | 313.6 | 1,530 | 4.8 |
| Go | 3,070 | 305.0 | 1,703 | 7.3 |
| Jupyter Notebook | 318 | 245.0 | 863 | 3.1 |
| Java | 2,753 | 210.8 | 1,631 | 9.2 |
| JavaScript | 5,180 | 193.3 | 1,638 | 8.9 |
| Kotlin | 89 | 166.4 | 566 | 4.6 |
| Vue | 179 | 158.8 | 603 | 4.7 |
| Swift | 123 | 140.3 | 591 | 5.5 |
| Dart | 736 | 133.1 | 704 | 6.2 |
| C# | 283 | 103.5 | 623 | 6.9 |
| Ruby | 171 | 98.2 | 925 | 10.3 |
| PHP | 346 | 73.5 | 530 | 8.8 |
| Dockerfile | 467 | 64.6 | 388 | 7.4 |

## The important caveat before you draw conclusions

This measures momentum *within our curated catalog*, not the language's overall popularity across all of GitHub. Our catalog already filters for quality/activity signals, so what this table actually shows is: **among C++ projects good enough to get curated, they tend to accumulate stars faster (relative to their age) than the median curated Rust project does.** That's a real, specific finding, but it's not the same claim as "C++ adoption is accelerating faster than Rust's" industry-wide. Survivorship bias is doing real work here: a 9-year-old C++ repo that's still getting curated today has already proven itself for nearly a decade, which is a different selection process than a 5-year-old Rust repo riding current hype.

## What's actually going on with the C++/Rust numbers

The honest read: C++ isn't "winning" against Rust in adoption. What's happening is that the C++ repos that survive long enough to be widely recognized (build systems, game engines, high-performance libraries) tend to be foundational infrastructure that keeps attracting stars steadily for a decade-plus, while Rust, being younger as an ecosystem, has a wider spread between its handful of breakout projects and everything else. Rust's *median age* (5.6 years) is nearly half of C++'s (9.1 years), so Rust is still earlier in its adoption curve; give it another 5 years and this comparison could look very different.

## The bigger, less controversial pattern

Ignore the C++/Rust head-to-head for a second and look at the bottom of the table: **PHP and Dockerfile have the lowest median momentum**, and Dockerfile's low number makes sense structurally. Dockerfiles are rarely standalone "projects" chasing stars; they're usually reference configs bundled inside larger repos. PHP's low number is more of a genuine signal: it's a mature, still-widely-deployed language whose GitHub visibility has clearly cooled relative to Python, TypeScript, and Go.

## What This Number Actually Measures

Star velocity by language isn't a proxy for "which language to learn next." It's a proxy for "which curated projects in this language are currently earning fresh attention." Both are useful signals. They're just not the same signal.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories.*
