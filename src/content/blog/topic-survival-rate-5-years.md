---
title: "52.2% of Repos Older Than 5 Years Are Still Active. The Topic Tag Tells You Which Side You're On."
date: "2027-02-07"
slug: github-topic-survival-rate-5-years-2027
category: data
tags: [data, longevity, topics, mern]
---

# 52.2% of Repos Older Than 5 Years Are Still Active. The Topic Tag Tells You Which Side You're On.

Across our catalog, **22,315 repos are 5+ years old**, and of those, **52.2% have had a commit in the last 180 days**. That's the baseline. But that number swings hard depending on what the repo is tagged as: some topics sit at 80%+ survival past the 5-year mark, others fall below 20%. We broke it down by GitHub topic tag to see exactly where that line falls.

## The baseline, stated plainly

- **22,315** repos in our catalog are 5+ years old
- **11,651** of them (52.2%) have committed in the last 180 days, genuinely still maintained
- **5,267** of them (23.6%) haven't committed in 2+ years, functionally abandoned, regardless of star count

That means almost a quarter of everything that survived 5 years in a curated catalog has since gone quiet. Surviving 5 years and staying maintained are two different achievements, and most of the gap between them is explained by what kind of project it was in the first place.

## Topics with the highest 5-year survival rate

Minimum sample of 40 old-enough repos per topic to avoid noise:

| Topic | Sample (5yr+) | Survival Rate |
|---|---|---|
| analytics | 73 | 84.9% |
| cncf | 66 | 84.8% |
| linter | 51 | 84.3% |
| sqlserver | 44 | 84.1% |
| oidc | 43 | 83.7% |
| gitops | 54 | 83.3% |
| apache | 46 | 82.6% |
| self-hosted | 127 | 81.9% |
| mariadb | 82 | 81.7% |
| terraform-provider | 67 | 80.6% |
| cloud-native | 152 | 80.3% |
| helm | 79 | 79.7% |
| observability | 54 | 79.6% |
| tls | 49 | 79.6% |
| oracle | 68 | 79.4% |

Every single one of these is infrastructure-layer software: linters, identity protocols, cloud-native tooling, database drivers, observability stacks. None of it is trend-driven. These are the categories of software that keep needing patches for as long as they're deployed anywhere. A linter doesn't become obsolete because a framework got popular; it becomes obsolete when the language itself does.

## Topics with the lowest 5-year survival rate

Same minimum sample threshold:

| Topic | Sample (5yr+) | Survival Rate |
|---|---|---|
| deep-neural-networks | 56 | 28.6% |
| portfolio | 60 | 28.3% |
| interview-preparation | 62 | 27.4% |
| express | 249 | 27.3% |
| clean-architecture | 59 | 27.1% |
| redux | 237 | 25.7% |
| interview-questions | 100 | 24.0% |
| interview | 197 | 21.8% |
| react-router | 51 | 21.6% |
| mongoose | 102 | 20.6% |
| bootstrap4 | 53 | 18.9% |
| flutter-apps | 58 | 17.2% |
| flutter-ui | 47 | 17.0% |
| android-library | 53 | 17.0% |
| flutter-examples | 48 | 12.5% |

If you've read our [MERN stack cargo-cult piece](/blog/mern-stack-cargo-cult-2026), this table is the data behind it: **express (27.3%), redux (25.7%), and mongoose (20.6%) all land in the bottom 15 survival rates in our entire catalog.** These aren't obscure tags. They're three of the four letters in MERN, and repos carrying those topic labels are almost four times more likely to be abandoned past the 5-year mark than the baseline. The pattern isn't that Express/Redux/Mongoose are bad tools; it's that most repos tagged with them are tutorial projects, bootcamp portfolios, and course-follow-alongs that were never meant to be maintained past the point the author got hired.

The "interview" cluster (interview, interview-questions, interview-preparation) tells the same story from a different angle: these are almost always one-time-use repos, abandoned the moment the interview season that motivated them ends.

## The category-level version of the same pattern

Same analysis, but using our top-level category field instead of raw topic tags:

| Category | Sample (5yr+) | Survival Rate |
|---|---|---|
| Rust Backend | 1,215 | 72.0% |
| LLM/GenAI | 142 | 68.3% |
| Systems | 1,387 | 67.8% |
| Kubernetes | 286 | 62.2% |
| Go Backend | 2,202 | 61.6% |
| CI/CD | 41 | 61.0% |
| Docker | 456 | 59.9% |
| CLI/Tools | 240 | 58.8% |
| ... | | |
| Vue Ecosystem | 281 | 42.3% |
| IaC | 106 | 41.5% |
| Boilerplate | 104 | 41.3% |
| UI/CSS | 600 | 41.2% |
| Mobile | 1,139 | 40.6% |
| Computer Vision | 122 | 37.7% |
| Fullstack | 223 | 37.7% |
| NLP | 99 | 30.3% |

Rust Backend leads at 72% survival, consistent with the language's reputation for attracting projects meant to run in production for a long time, not weekend experiments. Fullstack sits near the bottom at 37.7%, which lines up with the topic-level MERN finding above: "fullstack" as a category label correlates heavily with tutorial-driven, learn-by-building projects that get abandoned once the learning goal is met.

## The honest caveat

Topic tags are self-applied by repo owners, not verified by us or by GitHub. A repo tagged "portfolio" is self-identifying as a portfolio piece, which already selects for lower long-term maintenance intent going in. We're partly measuring "what did the author call this project" rather than a pure structural property of the technology. That said, the sample sizes here are large enough (40-250+ repos per topic) that this isn't noise, and the pattern holds consistently across both the granular topic level and the broader category level, which is a reasonable sign it's real.

## Why Backend Infra Topics Keep Winning

The common thread across every high-survival topic isn't the language or the framework. It's whether the software has a reason to exist independent of who's currently learning to code with it. Linters, observability tools, and identity protocols get maintained because someone somewhere has them running in production and needs the next CVE patched. Tutorial-shaped topics (express, redux, mongoose, interview-prep, flutter-examples) get abandoned because the project's job was to teach the author something, and once that's done, so is the repo. If you're picking a topic tag to signal what your project is, this table is a reasonable proxy for how long the ecosystem around that tag tends to keep caring.

*Data pulled from our own catalog of 34,787 scored and categorized GitHub repositories.*
