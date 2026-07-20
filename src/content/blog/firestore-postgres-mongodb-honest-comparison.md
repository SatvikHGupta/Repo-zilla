---
title: "Firestore, Postgres, or Mongo: What Actually Breaks, According to the People Who Migrated Away"
date: "2026-12-13"
slug: firestore-postgres-mongodb-what-breaks-2026
category: backend
tags: [firebase, firestore, postgresql, mongodb, database]
---

# Firestore, Postgres, or Mongo: What Actually Breaks, According to the People Who Migrated Away

A quick honesty note before this one: every other data-driven post in this series comes straight from our own 34,787-repo dataset. This one doesn't. We haven't personally shipped production apps on all three of these databases, so instead of faking a "we tried all three" narrative, this is a synthesis of the specific, recurring complaints from developers who actually did migrate off one of these, sourced from their own public write-ups. Less "trust us," more "here's who to trust instead."

## The pattern that shows up in almost every migration story

Search for "why I switched away from Firestore" and you'll find the same complaint structure repeated by developers years apart: it starts great, then breaks down exactly when the data stops being simple. One widely-read account put it directly: most real application data is relational (users, and things that relate to users, and things that relate to those things), and Firestore's document model handles that "okay" until the relationships get one layer deeper than trivial. At that point the fixes are all the same: duplicate data across documents, maintain it by hand on every write, or give up and fetch far more than you need.

## Where each one actually breaks, specifically

**Firestore's breaking point is nested, multi-condition queries.** Firestore is built for exact-match and range queries on flat fields. Filter by two unrelated conditions across nested subcollections and you're either restructuring your data model around the query you wish you could run, or fetching a broad set client-side and filtering in code, an approach that's both slower and more expensive than it sounds since Firestore bills per document read.

**Firestore's other breaking point is the bill.** The free tier is genuinely generous until a bad query loop or an inefficient listener runs at scale, and multiple developers describe the same story: everything's fine, then a query pattern that seemed harmless multiplies reads by orders of magnitude and the invoice reflects it. This isn't a hypothetical edge case in the write-ups; it's the single most commonly cited reason people start looking at alternatives.

**MongoDB's breaking point is SQL absence, not flexibility.** MongoDB's flexible schema is usually framed as a strength, and for document-shaped data it is. But teams using MongoDB for data that's actually relational report the same tax repeatedly: the aggregation pipeline can do what a SQL join does, but it's meaningfully more work to write and reason about, especially for analytics and ad-hoc reporting, exactly the use case where a few lines of SQL would've been trivial.

**MongoDB's other breaking point is cost at scale.** Atlas pricing compared to a self-hosted Postgres instance is a recurring complaint once usage grows past hobby-project size. The flexibility that made MongoDB easy to start with doesn't offset the operational cost difference later.

**Postgres's breaking point is upfront effort, not runtime pain.** Nobody in these migration stories complains about Postgres breaking in production the way they complain about Firestore's query limits or Mongo's aggregation pipeline. The complaints about Postgres are all front-loaded: more backend setup, real schema design work before you write your first query, and, if you're migrating *from* a schemaless database *to* Postgres, a genuinely significant one-time engineering effort to map flexible documents onto strict tables.

## The migration direction that's actually well-documented

If you're moving data between these systems, the difficulty isn't symmetric. MongoDB-to-PostgreSQL migrations are common enough to have established playbooks and tooling built around them. Firestore-to-anything migrations are consistently described as the hardest of the three, because Firestore's hierarchical collection structure doesn't map cleanly onto either a relational schema or MongoDB's flatter document model. It's not a data export problem; it's a full data-model redesign.

## What's actually converging in 2026

The interesting shift isn't "Postgres wins" or "Firestore is bad." It's that Postgres has spent the last two years absorbing the exact feature that used to be NoSQL's main advantage. With `pgvector` maturing and tools like Supabase layering real-time subscriptions and auto-generated APIs on top of plain Postgres, the "I want Firebase's simplicity" and "I want Postgres's query power" tradeoff isn't as sharp as it used to be. That's the real reason so many of these migration write-ups end at the same destination.

## What's Actually Worth Doing With This

None of this means Firestore or MongoDB are bad choices. Plenty of real, successful products run on both, and for a genuinely document-shaped, non-relational dataset, either can be the right call from day one. What these migration stories actually converge on is a planning question, not a technology verdict: if your data is going to end up relational as the product grows, and for most apps with users, permissions, and anything connecting them, it eventually does, that's worth deciding on before month eighteen, not after the query you need turns out to be the one your database can't do cleanly.

*This post is a synthesis of publicly documented migration experiences, not our own production usage; treat it as a map of where to look closer, not a verdict.*
