---
title: "GitHub Says 4.3 Million Repos Are 'AI-Related.' The Real Number Doing Actual Work Is 1.1 Million."
date: "2026-12-27"
slug: github-octoverse-ai-repo-growth-corrected-2026
category: industry
tags: github, octoverse, ai, data, developer-trends
---

# GitHub Says 4.3 Million Repos Are "AI-Related." The Real Number Doing Actual Work Is 1.1 Million.

GitHub's Octoverse 2025 report (covering September 2024 through August 2025) headlines with a genuinely striking figure: AI-related repositories on GitHub now exceed 4.3 million, nearly doubling in less than two years. That number gets repeated across dozens of blog posts and LinkedIn takes as evidence of an unstoppable AI-coding wave. It's real, but it's also the vaguer of two numbers GitHub reported, and the vagueness matters.

## The number that actually tells you something

Buried in the same report is a much more specific figure: more than 1.1 million public repositories now import an actual LLM SDK (a real, functioning connection to a model provider's API, not just a topic tag), and that's up 178% year-over-year comparing August 2025 to August 2024. Of those, 693,867 were created in just the past 12 months, sharply outpacing 2024's total of roughly 400,000.

That's the number worth trusting more. GitHub's own glossary defines an "AI-related repository" as anything tagged with AI-adjacent topics like "AI," "ML," or "LLM," or anything that falls under their broader AI classification methodology, which explicitly captures general experimentation and projects merely adjacent to AI. A repo that mentions machine learning in its README, forks a tutorial, or gets auto-tagged by a topic classifier counts toward the 4.3 million. A repo that actually imports the OpenAI, Anthropic, Llama, or another provider's SDK and does something with it counts toward the 1.1 million.

## Why the gap matters

The contrast is the real story here: one number measures intent or adjacency, the other measures shipped integration. Nearly 3.2 million repositories sit in the gap between "tagged as AI-related" and "actually calling a model." Some of that gap is legitimate (research repos, coursework, forks that never got built out), but it also means the "AI is eating GitHub" headline number is roughly four times larger than the number of repos actually doing AI work in production or prototype form.

## The context that makes the real number credible

The 178% growth figure isn't a standalone claim. GitHub backs it with supporting metrics that all move in the same direction: 1.05 million-plus distinct contributors to these SDK-importing repos, and 1.75 million monthly commits, which is roughly 4.8x what it was in 2023. Monthly contributors to generative-AI projects specifically climbed from about 68,000 in January 2024 to a peak of nearly 207,000 in May 2025, before settling into a steadier plateau through the rest of the year. The report frames this as evidence of a shift from experimentation to shipping, not a spike that's about to reverse.

Six of GitHub's ten fastest-growing open source projects by contributor count in 2025 were AI infrastructure projects, things like vLLM (an inference engine) and RAGflow (a retrieval-augmented-generation framework), which is a much stronger signal than repo-count alone, since contributor growth means people are actively building on these tools, not just forking them once.

## The honest takeaway

If you're citing Octoverse to argue AI adoption in software development is real and accelerating, use the 1.1 million / 178% YoY figure. It's specific, well-corroborated by contributor and commit data, and measures actual usage. If you see someone citing "4.3 million AI repositories" as evidence of the same thing, that number is real too, but it's a much blunter instrument: closer to "AI is a topic people are tagging" than "AI is infrastructure people are shipping." Both are true. They're just answering different questions, and only one of them tells you how many repos are actually calling a model.

*Source: GitHub's official Octoverse 2025 report (github.blog), published October 28, 2025, updated February 28, 2026.*
