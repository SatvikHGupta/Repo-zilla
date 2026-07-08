---
title: "5 Things the MERN Stack Still Tells You to Do That You Should Probably Stop Doing"
date: "2026-06-28"
slug: mern-stack-cargo-cult-2026
category: opinion
tags: mern, react, state-management, best-practices, opinion
---

# 5 Things the MERN Stack Still Tells You to Do That You Should Probably Stop Doing

Every stack accumulates folklore - practices that made sense when they were adopted and kept getting repeated long after the reason stopped applying. MERN has had over a decade to build up its own pile of this. Here are five specific things that get taught as "best practice" that deserve a harder look in 2026, and where I actually land on each.

This is opinion, not data - but it's opinion grounded in what's actually shipping in production apps right now, not what a 2018 tutorial says.

## 1. "You need Redux for global state"

You don't, and haven't for a while. The honest 2026 consensus among people actually shipping React apps is that most projects should reach for TanStack Query (or SWR) for anything that originates from a server, and something lighter - Zustand, or just Context for slow-changing values like theme or auth - for actual client-side state. Redux Toolkit is still a legitimate choice, but the bar for needing it is genuinely high: large teams, deeply interconnected state, a real need for time-travel debugging or strict architectural enforcement. If your app has fewer than, say, ten screens and a small team, adding Redux is adding bundle size and ceremony for a problem you don't have yet.

**My stance:** default to TanStack Query for server state and Zustand for the rest. Only escalate to Redux Toolkit if you hit an actual, specific pain point Redux solves - not because a tutorial says every "real" app needs it.

## 2. "Prop drilling is always bad, so lift everything up"

Prop drilling gets treated as an automatic code smell, and the fix everyone reaches for is lifting state up or reaching for global state management. But two or three levels of prop drilling is often just... fine. It's explicit, it's traceable, and it doesn't require jumping into a store or a context provider to understand what's happening. The actual problem isn't prop drilling - it's prop drilling five-plus levels deep through components that don't care about the data, just to hand it off to one that does.

**My stance:** don't reach for global state the moment you have to pass a prop through one intermediate component. Reach for it when you're threading the same value through four or five layers of components that have no business knowing about it, or when genuinely unrelated parts of the tree need the same data.

## 3. "REST is basically settled, GraphQL is for people with weird needs"

This one's more contested than tutorials let on. REST remains the default for a reason - it's simple, cacheable, and every tool understands it out of the box. GraphQL earns its complexity in specific situations: when your frontend needs to shape wildly different views of the same underlying data (a mobile app and a dashboard hitting the same API very differently), or when over-fetching/under-fetching is a real, measured performance problem, not a hypothetical one. What tutorials rarely say out loud: GraphQL brings its own tax - caching gets harder, and you now need to think about query complexity and N+1 problems on the backend.

**My stance:** start with REST unless you already know, concretely, that your data-shaping needs vary enough across clients to justify GraphQL's overhead. Don't add GraphQL because it's on the resume-driven-development checklist.

## 4. "Firestore/Firebase doesn't scale, use Postgres for anything serious"

This gets repeated as gospel in threads that compare NoSQL and relational databases, but it's really a "wrong tool, wrong job" story dressed up as "NoSQL bad." Firestore genuinely struggles with complex relational queries, joins across collections, and anything that needs real transactional guarantees across many documents. But for the class of app it's actually built for - real-time sync, auth tightly coupled to data access rules, rapid prototyping where you don't want to stand up and manage a database server - it holds up fine. The mistake isn't choosing Firestore, it's choosing it for a workload that's fundamentally relational (financial ledgers, deeply joined reporting queries) and then blaming the database when it groans.

**My stance:** the "Postgres for anything serious" framing conflates two separate questions - whether your data model is relational, and whether you want to manage your own database infrastructure. Answer those honestly first, then pick.

## 5. "Every component needs to be 'reusable' from day one"

Tutorials love pushing atomic-design-style component libraries from the very first commit - build your Button, your Input, your Card as fully generic, prop-driven, storybook-documented components before you've even shipped a feature. In practice, premature abstraction is one of the most common ways small projects rack up complexity debt. You end up guessing at an API surface for a component that's used in exactly one place, and you guess wrong, and now you're threading extra props through a "reusable" component to handle a case you didn't anticipate.

**My stance:** write the component for the place it's used. Extract it into something genuinely reusable the second time you need the same thing somewhere else, when you actually know what varies and what doesn't - not before.

## The actual point

None of this is "best practices are bad." It's that a lot of what gets taught as MERN best practice was calcified at a specific point in time and kept getting copy-pasted into new tutorials without anyone re-checking whether the tradeoffs still hold. The tools have moved - TanStack Query didn't exist in its current form when "always use Redux" became dogma - but a lot of the advice hasn't caught up.

*This is opinion, informed by current tooling and ecosystem consensus, not a claim to universal best practice. Your team, your codebase, and your constraints might reasonably land you somewhere different on any of these five.*
