---
title: "7 Things to Check Before You Run npm install, With Real Examples of Each Failure"
date: "2026-06-21"
slug: npm-install-checklist-real-examples-2026
category: practical
tags: npm, dependencies, github, checklist, security
---

# 7 Things to Check Before You Run npm install, With Real Examples of Each Failure

Running a scoring pipeline across 34,787 repositories surfaces the same handful of red flags over and over. Here's a practical checklist, with real, named repos from our catalog that illustrate each specific failure mode: not hypothetical warnings, actual examples you can go look at.

## 1. Check the last commit date, not the star count

Star count tells you a project mattered at some point. It tells you nothing about right now. In our catalog, 29.4% of repos with over 1,000 stars haven't had a commit in more than a year. **Real example:** `facebook/create-react-app` sits at 103,533 stars with no commit since February 2025. It's recognizable, widely recommended by older tutorials, and quietly stale while React's own tooling ecosystem has moved on.

## 2. Check the fork-to-star ratio

Forking requires actual intent to use or modify the code. Starring takes one click and two seconds of interest. A large gap between the two, thousands of stars against a tiny fraction of that in forks, suggests a lot of passive attention and comparatively little real engagement. In our data, a project can sit at 25,000+ stars with under 100 forks, a ratio under half a percent. That's not automatically disqualifying (some tools are genuinely "install and forget," not "fork and modify"), but it's a signal worth checking against what the tool is actually for.

## 3. Don't take a "NOASSERTION" license field at face value

GitHub's automated license detection frequently returns "NOASSERTION" when a repo's LICENSE file doesn't exactly match its standard-format parser, even when a real, valid license clearly applies. **Real example:** `torvalds/linux` shows NOASSERTION in raw GitHub API license data. Linux is obviously GPL-2.0; the detection gap is a parsing quirk, not evidence the project is unlicensed. The lesson isn't "ignore the license field." It's "if a repo you're relying on shows NOASSERTION, go read the actual LICENSE file yourself before assuming anything, in either direction."

## 4. Check the open-issues-to-stars ratio, and read a few of them

A huge open-issue count sounds alarming, but it's often a proxy for usage volume more than project health. What's actually informative is the ratio combined with a quick skim of what the issues say. **Real example:** `bambulab/BambuStudio` runs at roughly 1.5 open issues per star (4,248 stars, 6,274 open issues), a genuinely high ratio worth a closer look before depending on it for anything critical, though a quick skim can tell you whether those are feature requests piling up or genuine unresolved bugs.

## 5. Check who's actually committing, not just who owns the repo

A repo with one name behind nearly all recent commits is a single point of failure, regardless of star count. This isn't visible from the README; you have to check the commit history or contributor graph directly. The Booklore shutdown in early 2026 is the sharpest recent example: a self-hosted app with 10,000+ stars and thousands of daily users, built almost entirely by one contributor, vanished (repo, Discord, and website, all of it) in an afternoon when that one person walked away.

## 6. Check release/tag cadence, not just commit frequency

Commits happening on a `dev` or `main` branch don't necessarily mean anything is actually being shipped to the version you'd install. A project can have active commits and no tagged release in a long time, which means npm/pip installs are pulling an old, frozen version regardless of how lively the repo looks. Check when the last actual version tag was cut, not just when the last commit landed.

## 7. Check for a security policy and recent CVE response, if the package touches anything sensitive

For anything handling auth, payments, file uploads, or user data, check whether the repo has a `SECURITY.md` or documented vulnerability-disclosure process, and whether past reported vulnerabilities got patched in a reasonable window. A project can be perfectly well-maintained for feature work and still have a slow, informal process for security reports specifically, which is worth knowing before you depend on it for anything sensitive.

## The actual takeaway

None of these checks take more than a couple of minutes each, and together they catch most of what star count alone hides: staleness, low real engagement, single-maintainer risk, and security-response gaps. Star count is the easiest number to see and the least useful one for this specific question.

*Real examples pulled directly from our own catalog of 34,787 scored and categorized GitHub repositories.*
