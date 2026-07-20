---
title: "I Checked Whether 'Awesome' Lists Are Full of Rotting Links. They Mostly Aren't."
date: "2026-09-06"
slug: awesome-lists-rot-check-2026
category: data
tags: github, awesome-lists, data, open-source
---

# I Checked Whether "Awesome" Lists Are Full of Rotting Links. They Mostly Aren't.

The "awesome-*" list format (a single curated README linking out to hundreds of tools in a category) is one of GitHub's most-copied conventions, and also one people love to be cynical about: surely a list with 500+ entries, most added years apart by different contributors, is full of dead projects nobody's pruned. I checked this against real data instead of assuming it. The short version: at least for the lists I checked, it isn't nearly as bad as the reputation suggests.

## The method

I pulled the full READMEs from three well-known, actively-used awesome-lists, `awesome-selfhosted/awesome-selfhosted`, `enaqx/awesome-react`, and `vinta/awesome-python`, and extracted every unique GitHub repo link across all three, after filtering out non-project links (GitHub's own pages, sponsor links, and the awesome-list repos themselves). That gave 1,777 unique linked repositories across the three lists combined.

Rather than live-check all 1,777 links against the GitHub API (which was rate-limited during this session), I cross-referenced them against our own already-scraped catalog of 34,787 GitHub repositories, gathered independently for an unrelated project. 909 of the 1,777 links, just over half, matched a repo already in that catalog, giving real stars, license, and last-commit data for that matched subset without needing fresh scraping.

**The honest limitation up front:** this covers roughly 51% of the links across the three lists, not all of them. The other 49% are repos that fell below our dataset's own inclusion criteria (typically smaller or newer projects): genuinely unknown status, not assumed-dead. Treat these findings as a solid sample, not a full census.

## What the matched subset actually shows

| List | Matched repos | Stale >1yr | Stale >2yr |
|---|---|---|---|
| awesome-selfhosted | 463 | 3 (0.6%) | 1 (0.2%) |
| awesome-react | 120 | 5 (4.2%) | 0 (0.0%) |
| awesome-python | 326 | 16 (4.9%) | 2 (0.6%) |
| **Combined** | **909** | **24 (2.6%)** | **3 (0.3%)** |

That's a strikingly low rot rate: 2.6% stale by our one-year threshold, compared to the 29.4% staleness rate we found across the general population of 1,000+ star repos in our full catalog. Awesome-lists, at least these three, are considerably healthier than a random sample of popular GitHub repos.

## Why this makes sense, not just a fluke

This isn't as surprising as it looks once you check how these lists are actually run. `awesome-selfhosted` specifically ships with automated CI workflows that check for dead links and flag unmaintained projects; the README itself displays live badges for both checks. A list with active tooling doing continuous link-rot detection should obviously have a lower rot rate than the general population, and that's the entire point of the automation. The other two lists don't advertise the same explicit tooling, but active, well-known lists tend to get pull requests removing dead entries simply because enough people use them to notice when something's broken.

## The stale entries that do exist

The handful that were stale skew toward smaller, narrower-purpose tools rather than anything load-bearing: a schedule library, a speed-test self-hosted tool, a network emulator, a few narrow utility libraries. Even `nvbn/thefuck`, at nearly 100,000 stars, showed up in the stale group, quiet for about two years at the time of this check, joining the same "famous but dormant" pattern we found across the broader dataset with projects like Vue 2 and create-react-app.

## The Cynical Take Doesn't Hold Up Here

The cynical prior, "awesome-lists are full of rot nobody's pruned," doesn't hold up against actual data, at least for well-known, actively-maintained lists like these three. The lists that earn a reputation for staying current tend to actually be current, likely because visibility itself creates pressure (and sometimes literal CI) to prune dead entries. The caveat worth carrying forward: this says nothing about smaller, less-visited awesome-lists that don't get the same maintenance attention. A list with 40 stars and one contributor almost certainly rots faster than one with thousands of watchers actively filing "this is dead" issues.

*Methodology: three popular awesome-lists' READMEs fetched directly, cross-referenced against our own independently-scraped catalog of 34,787 GitHub repositories for last-commit and star data on the matched subset.*
