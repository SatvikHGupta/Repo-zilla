---
title: "3,795 Repos in Our Catalog Have 1,000+ Stars and Haven't Been Touched in 2+ Years. Atom Is One of Them."
date: "2026-06-07"
slug: zombie-github-repos-high-stars-stale-2026
category: devops
tags: [data, dependencies, maintenance, risk]
---

# 3,795 Repos in Our Catalog Have 1,000+ Stars and Haven't Been Touched in 2+ Years. Atom Is One of Them.

Of the 23,243 repos in our catalog with 1,000 or more stars, **3,795 of them - 16.3%** - haven't had a commit in over two years. That's not a rounding error. That's roughly **1 in 6** popular, trusted-looking repos sitting completely dormant while still accumulating stars, forks, and dependents who may not realize nobody's home.

## The direct answer

We define a "zombie repo" as: 1,000+ stars (a real trust signal) combined with 730+ days since the last commit (genuinely abandoned, not just quiet). By that definition, 3,795 repos in our dataset qualify - 10.9% of our entire catalog.

## The top 20 by stars

| Stars | Stale For | Repo | Language | Last Commit |
|---|---|---|---|---|
| 79,955 | 2.2 yr | fighting41love/funNLP | Python | 2024-05-10 |
| 76,658 | 2.9 yr | MisterBooo/LeetCodeAnimation | Java | 2023-08-14 |
| 67,572 | 3.2 yr | prakhar1989/awesome-courses | - | 2023-05-04 |
| 62,825 | 3.4 yr | resume/resume.github.com | JavaScript | 2023-02-15 |
| 60,869 | 3.5 yr | atom/atom | JavaScript | 2023-01-03 |
| 58,748 | 2.2 yr | angular/angular.js | JavaScript | 2024-04-12 |
| 57,311 | 2.0 yr | scutan90/DeepLearning-500-questions | JavaScript | 2024-06-26 |
| 56,229 | 2.2 yr | tiimgreen/github-cheat-sheet | - | 2024-04-15 |
| 55,826 | 2.0 yr | wasabeef/awesome-android-ui | - | 2024-07-06 |
| 53,608 | 2.1 yr | necolas/normalize.css | CSS | 2024-06-12 |
| 50,518 | 2.5 yr | Avik-Jain/100-Days-Of-ML-Code | - | 2023-12-29 |
| 49,450 | 2.7 yr | NARKOZ/hacker-scripts | JavaScript | 2023-10-23 |
| 48,486 | 2.1 yr | algorithm-visualizer/algorithm-visualizer | JavaScript | 2024-06-09 |
| 47,621 | 2.2 yr | minimaxir/big-list-of-naughty-strings | Python | 2024-04-18 |
| 46,440 | 2.1 yr | dypsilon/frontend-dev-bookmarks | - | 2024-05-21 |
| 44,022 | 2.2 yr | astaxie/build-web-application-with-golang | Go | 2024-05-12 |
| 41,492 | 2.6 yr | dylanaraps/pure-bash-bible | Shell | 2023-11-28 |
| 41,168 | 2.0 yr | zai-org/ChatGLM-6B | Python | 2024-06-27 |
| 40,194 | 2.5 yr | wg/wrk | C | 2023-12-30 |
| 39,480 | 3.6 yr | floodsung/Deep-Learning-Papers-Reading-Roadmap | Python | 2022-11-27 |

## Why this list is actually reassuring, not alarming

Look closely at the pattern: **atom/atom** and **angular/angular.js** are on this list for a completely legitimate reason - both were officially deprecated (Atom by GitHub in favor of VS Code, AngularJS 1.x in favor of modern Angular). Their star counts are historical credit, not a current recommendation. The zombie-detection method works exactly as intended here - it correctly flags "this used to matter and doesn't get updates anymore," without needing to know *why*.

Others on the list are reference material that was never meant to be "maintained" in the traditional sense - **normalize.css**, **pure-bash-bible**, **awesome-courses**, various "roadmap" and cheat-sheet repos. A reference doc doesn't need weekly commits to stay useful. Stale ≠ useless here; it just means don't expect support.

The genuinely risky ones on this kind of list are **libraries meant to be actively depended upon** in production - that's where 2+ years of silence should actually change your evaluation, not documentation or educational content.

## Forks tell a slightly different story than stars

Median forks among zombie repos: **371**. Median forks across the whole catalog: **210**. Zombie repos are actually *more* forked than average - which makes sense: people fork dead-but-useful projects specifically because they plan to maintain their own patch on top, since the original clearly isn't coming back.

## The actual takeaway for picking dependencies

Before adding any library with impressive stars, check two things, not one: the star count *and* the last-commit date. A repo with 40,000 stars and no commits in 3 years isn't automatically bad - but it means you're the maintainer now, whether you signed up for that or not.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories.*
