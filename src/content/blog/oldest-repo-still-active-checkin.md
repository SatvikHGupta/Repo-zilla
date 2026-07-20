---
title: "We Re-Ran the 'Oldest Active Repo' Query. cppcheck Still Wins. The Rest of the List Moved."
date: "2027-03-07"
slug: oldest-github-repo-still-active-checkin-2027
category: data
tags: [data, open-source, longevity, c++]
---

# We Re-Ran the "Oldest Active Repo" Query. cppcheck Still Wins. The Rest of the List Moved.

Back in our [original oldest-active-repo post](/blog/oldest-github-repo-still-active-2026), **cppcheck-opensource/cppcheck** topped the list as the oldest repo in our catalog still receiving commits, created March 4, 2009. We pulled the exact same query again against our current catalog to see if that held up, and whether anything in the rest of the top 10 had shifted. cppcheck is still #1. Two other repos are not where they used to be.

## The same methodology, run again

Filter to repos with a commit in the last 30 days, sort by creation date, oldest first. No new tricks, no changed thresholds, same query as the original post, run fresh.

## The current top 10

| Created | Repo | Stars | Last Commit | Language |
|---|---|---|---|---|
| 2009-03-04 | cppcheck-opensource/cppcheck | 6,660 | 2026-06-26 | C++ |
| 2010-04-16 | herumi/xbyak | 2,252 | 2026-06-19 | C |
| 2010-09-26 | **shacker/django-todo** | 849 | 2026-05-28 | Python |
| 2010-10-28 | inspire-js/inspire.js | 1,752 | 2026-06-10 | JavaScript |
| 2011-02-12 | django-commons/django-polymorphic | 1,824 | 2026-06-24 | Python |
| 2011-03-26 | ether/etherpad | 18,414 | 2026-06-25 | TypeScript |
| 2011-10-05 | spiculedata/saiku | 1,305 | 2026-06-26 | Java |
| 2011-12-02 | AxonIQ/AxonFramework | 3,590 | 2026-06-26 | Java |
| 2011-12-20 | hiddentao/squel | 1,568 | 2026-06-17 | TypeScript |
| 2011-12-23 | FasterXML/jackson-annotations | 1,066 | 2026-06-23 | Java |

## What actually changed

**cppcheck holds #1.** 17+ years old, still getting commits, still the answer to "what's the oldest repo in our catalog that's genuinely still alive."

**shacker/django-todo is new to the top 10.** A multi-user Django todo/ticketing app, created September 26, 2010, with a commit as recently as May 28, 2026. It wasn't on our radar in the original post; it slots in at #3, ahead of inspire.js.

**DSpace/DSpace fell out of the top 10 entirely.** It held the #10 spot originally (created March 16, 2012). It's been pushed down by both django-todo and trustmaster/goflow (created February 8, 2012, last commit June 5, 2026), which now sit at positions 11 and 12 just outside this list.

We don't have a confirmed explanation for why previously-missed repos surface on a re-run of an identical filter against the same kind of data pull. The most likely explanation is coverage differences between crawl passes (a repo that had gone quiet briefly and picked back up, or simply wasn't captured cleanly in the earlier snapshot). We're not going to guess past what the data tells us. What we can say directly: the ranking is not perfectly static, and treating any "top 10 oldest" list as a permanently fixed answer would be wrong.

## Why cppcheck keeps winning

Nothing about cppcheck's story changed since the original post, and that consistency is itself the point. It's a single-purpose static analysis tool for C/C++, low glamour, zero hype cycles attached to it, and it just keeps getting maintained because people still run C/C++ in production and still need a linter for it. Compare that to how much churn happened in positions 3 and 10-12 of this same list in what's likely been under a year between pulls. The top spot is stable specifically because the software underneath it isn't chasing anything.

## What Changed and What Didn't

The headline claim from the original post survives a re-check: cppcheck is still the oldest continuously active repo in our catalog, still going after 17+ years. What didn't survive is the assumption that the rest of a "top 10" list like this is static once published. Two positions moved in a single re-run. If you're citing a "top N oldest/most X" list from any source, ours included, treat it as a snapshot with a pull date attached, not a permanent ranking, and go check the freshest version before you rely on it.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories, refreshed as part of our ongoing curation pipeline.*
