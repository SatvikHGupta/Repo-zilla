---
title: "HTMX Is the Most Admired Tool in JavaScript Surveys Two Years Running. Almost Nobody Ships It."
date: "2026-11-15"
slug: htmx-satisfaction-vs-adoption-2026
category: frontend
tags: htmx, react, state-of-js, frontend-frameworks
---

# HTMX Is the Most Admired Tool in JavaScript Surveys Two Years Running. Almost Nobody Ships It.

The State of JavaScript 2025 survey (run by Devographics, fielded in November 2025, and published in February 2026) puts a genuinely odd number next to each other. React remains the most-used front-end framework by a wide margin, at 83.6% usage. It also shows real dissatisfaction among the people using it, with Next.js in particular drawing sharp criticism over Server Components complexity and generating more written comments than any other project in the survey. Meanwhile, HTMX, a tiny library that lets you do AJAX, WebSockets, and server-sent events straight from HTML attributes, has held the "most admired" spot among developers who've actually tried it for two years running, and its numbers on the interest and appreciation axes keep climbing.

If satisfaction predicted adoption, HTMX would be everywhere by now. It isn't.

## What "most admired" actually measures

State of JS separates "used it" from "would use it again" for a reason: a library can be adored by a small, self-selected group of people who tried it and loved it, while still being invisible to the much larger population who never tried it at all. HTMX sits at roughly 47,000-48,000 GitHub stars and around 150,000 weekly npm downloads, genuinely healthy numbers for a focused library, but tiny next to React's footprint across the ecosystem. The people who use HTMX rate it extremely well. The number of people who use HTMX is still a rounding error next to React.

## Why the gap exists (this part is opinion)

The honest explanation isn't that HTMX is secretly worse than its satisfaction score suggests. It's that HTMX and React aren't actually competing for the same job most of the time. HTMX's architecture assumes the server owns state and every meaningful interaction round-trips to it. That's a genuinely pleasant model for CRUD-heavy, server-rendered apps: forms, dashboards, admin panels, content sites. It falls apart fast for anything that needs real client-side state, like a drag-and-drop interface, a canvas editor, an app that needs to function offline, or anything with high-frequency, low-latency interaction like collaborative editing or a game. Those aren't edge cases you can work around with a library extension; they're architectural mismatches. HTMX is architecturally incompatible with an app that needs to run without a network connection, because every interaction requires a server round-trip by design.

React, meanwhile, got adopted for years by teams building all of those things and also every simple CRUD app, because it was the safe, hireable, ecosystem-rich default, regardless of whether a given project actually needed client-side state ownership. A lot of React's dissatisfaction in surveys like this one is really dissatisfaction with accumulated complexity (Server Components, the App Router, build tooling) on projects that arguably never needed a client-heavy framework in the first place. HTMX's satisfaction score partly reflects selection bias: the developers reaching for it tend to already have a server-rendered, CRUD-shaped problem where it's a great fit, so of course they're happy.

## The actual signal worth paying attention to

The more interesting data point isn't HTMX vs. React directly. It's the pattern State of JS's own write-up describes: JavaScript libraries commonly show a "boomerang" trajectory, where early positivity drives adoption, and then real-world edge cases pull satisfaction back down once a tool has enough scale and enough hard cases thrown at it. HTMX hasn't been tested at React's scale or breadth of use case yet. It's entirely possible its satisfaction score holds up because it hasn't yet been forced into the messy, high-complexity scenarios that erode goodwill for bigger, more broadly-adopted tools. That's not a knock on HTMX; it's just a reason to treat "highest satisfaction" and "best tool for your specific app" as two different questions.

## Use It Where It Fits, Not Everywhere

Use HTMX where it fits: server-rendered, CRUD-shaped applications where you want to shed client-side JavaScript complexity. Don't read "most admired two years running" as "should replace React everywhere." The survey data doesn't say that, and the architectural mismatch for client-heavy apps is real, not a tooling gap that'll get patched next release.

*Source: State of JavaScript 2025 (2025.stateofjs.com), fielded November 2025, published February 2026.*
