---
title: "We Checked 34,787 Repos. The Oldest One Still Getting Commits Is From 2009."
date: "2026-05-24"
slug: oldest-github-repo-still-active-2026
category: backend
tags: [data, open-source, longevity, c++]
---

# We Checked 34,787 Repos. The Oldest One Still Getting Commits Is From 2009.

The oldest actively maintained repository in our catalog of 34,787 GitHub projects is **cppcheck-opensource/cppcheck**, created on March 4, 2009, and it received a commit as recently as June 26, 2026. That's over 17 years of continuous maintenance on the same static analysis tool for C and C++ code, currently sitting at 6,660 stars.

## The methodology

We filtered our full dataset down to repos with a commit in the last 30 days, then sorted by creation date, oldest first. No survivorship bias trick here; we didn't cherry-pick "famous old projects," we asked the data directly: of everything still receiving code today, what's the oldest?

## The top 10, oldest to "recent"

| Created | Repo | Stars | Last Commit | Language |
|---|---|---|---|---|
| 2009-03-04 | cppcheck-opensource/cppcheck | 6,660 | 2026-06-26 | C++ |
| 2010-04-16 | herumi/xbyak | 2,252 | 2026-06-19 | C |
| 2010-10-28 | inspire-js/inspire.js | 1,752 | 2026-06-10 | JavaScript |
| 2011-02-12 | django-commons/django-polymorphic | 1,824 | 2026-06-24 | Python |
| 2011-03-26 | ether/etherpad | 18,414 | 2026-06-25 | TypeScript |
| 2011-10-05 | spiculedata/saiku | 1,305 | 2026-06-26 | Java |
| 2011-12-02 | AxonIQ/AxonFramework | 3,590 | 2026-06-26 | Java |
| 2011-12-20 | hiddentao/squel | 1,568 | 2026-06-17 | TypeScript |
| 2011-12-23 | FasterXML/jackson-annotations | 1,066 | 2026-06-23 | Java |
| 2012-03-16 | DSpace/DSpace | 1,077 | 2026-06-25 | Java |

## What's actually interesting here

None of these are the repos you'd guess from memory. The famous names, Linux, jQuery, Rails, aren't on it. What's actually here is a static analysis tool, a JIT assembler library, an ORM extension, a real-time collaborative editor, and a Java event-sourcing framework: the unglamorous infrastructure layer that quietly outlives every framework hype cycle built on top of it.

**Etherpad** is the standout for relevance: an open-source real-time collaborative text editor from 2011, still shipping commits in 2026, with 18,414 stars, proof that "old" and "niche" aren't the same thing.

**cppcheck** is the standout for pure longevity: a single-purpose C/C++ linter that's been maintained through 17 years of language spec changes, compiler updates, and at least three separate hype waves of "AI will replace static analysis," and it's still here, still getting real commits.

## The pattern across the top 10

Every single one of these predates the framework it's most often compared against today. Etherpad predates Google Docs' real collaborative editing polish. AxonFramework predates most of the current event-sourcing/CQRS tooling ecosystem. That's the actual lesson: **the tools that survive longest tend to solve one narrow problem precisely**, not the ones chasing whatever's trending.

## Why this matters if you're picking a dependency today

Age alone isn't a quality signal; plenty of old repos are abandoned husks. But age *combined with* an active commit in the last 30 days is a much stronger signal than stars alone. A repo that's survived 15+ years of maintainer turnover, ecosystem shifts, and changing best practices has already been stress-tested in a way a trendy six-month-old project simply hasn't.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories, refreshed as part of our ongoing curation pipeline.*
