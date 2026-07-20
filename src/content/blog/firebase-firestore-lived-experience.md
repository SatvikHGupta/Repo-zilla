---
title: "I've Shipped Three Firebase Apps Now. Here's What Actually Breaks."
date: "2026-10-04"
slug: firebase-firestore-lived-experience-2026
category: personal
tags: firebase, firestore, auth, lived-experience
---

# I've Shipped Three Firebase Apps Now. Here's What Actually Breaks.

I've now built three separate apps on Firebase Auth and Firestore: Atlas (a full-stack DSA and competitive programming tracker), a fee management app for a tutor in Lucknow, and BuyO, an e-commerce SPA I refactored heavily. Same core stack every time: Firebase Auth for identity, Firestore for data, security rules doing the access-control work a backend would normally do. Here's what actually goes wrong when you use this combination in practice, not what a tutorial tells you to expect.

## The deprecated persistence API thing nobody warns you about

On the Anjali Classes fee app, I hit a wall with Firebase's persistence API being deprecated mid-project. Firebase's SDK evolves fast enough that a pattern you copy from a two-year-old Stack Overflow answer can silently be on its way out by the time you're debugging it in production. The fix wasn't hard once I found it, but the actual lesson was: check the current SDK version's migration notes before you copy persistence-setup code from anywhere older than a few months. Firebase's API surface moves faster than most backend-as-a-service platforms I've touched.

## Security rules are your backend now, and they don't feel like one

The single biggest mental shift going from a traditional Express/Postgres backend to Firestore is that your authorization logic lives in security rules instead of route handlers. That's genuinely powerful once it clicks: you get real-time sync and access control enforced at the data layer instead of the API layer, but it's also the easiest place to accidentally leave a hole. On Atlas, getting the rules right for per-user problem-tracking data (where a user should only ever read/write their own progress records, but public problem metadata needs to stay globally readable) took more iteration than I expected, because testing security rules thoroughly requires the Firebase emulator suite, and it's easy to skip that step under time pressure and just test against production.

## `color-mix()` and CSS nesting are Firebase-adjacent pain, but they show up together

This one's not strictly a Firebase issue, but it consistently showed up in the same projects: modern CSS features like `color-mix()` and native CSS nesting have inconsistent support across the browser versions your actual users show up with, especially on the Anjali Classes app where users skew toward whatever browser came pre-installed on their phone. The pattern I've settled into: don't reach for a CSS feature just because it shipped in the latest Chrome. Check real support numbers for your actual user base first, because Firebase apps skew toward being used by non-technical end users (students, parents, customers) who are far less likely to be running a bleeding-edge browser than a developer testing locally.

## `window.confirm()` breaks in ways you won't see until iOS Safari

Also on the Anjali Classes app: `window.confirm()` for delete/destructive-action confirmations works fine everywhere I tested it locally, and then breaks in specific ways on iOS Safari that don't show up in desktop testing at all. The fix was building a custom confirmation modal instead of relying on the browser-native dialog, which is more work up front but removes an entire class of "works on my machine" bugs. The broader lesson: if an app has real non-developer users on real phones, browser-native UI primitives (confirm, alert, prompt) are worth replacing early rather than debugging late.

## Where Firestore genuinely earns its keep

None of this is "don't use Firestore." For all three of these projects, the actual value proposition held up: auth and data access rules tightly coupled together, real-time sync without building a websocket layer myself, and not having to stand up and maintain a separate database server for a tutor's fee-tracking app that a few hundred people use. Firestore's weak spot is genuinely relational, joined-across-collections data (complex reporting queries, anything that needs a real transaction across many documents), and I haven't hit that wall yet on any of these three projects, because none of them actually needed that shape of data model. If I ever build something that does, a reporting-heavy admin dashboard, real financial ledgers, that's the point where I'd reach for Postgres instead, not before.

## The honest takeaway

Firebase/Firestore is a genuinely good choice for the class of app it's built for: real-time, auth-coupled, moderate-complexity data models, especially when you don't want to run your own database server. The failure modes I've actually hit haven't been "Firestore can't handle this." They've been SDK API churn, browser compatibility with non-technical users, and getting security rules right the first time instead of the third time. Those are solvable with process (check migration notes, test on real devices, use the emulator suite for rules), not reasons to avoid the platform.
