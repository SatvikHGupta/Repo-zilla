---
title: "IBM Owns Terraform Now. Here's Why That Actually Matters for Your Infra Stack."
date: "2026-11-29"
slug: ibm-hashicorp-opentofu-2026
category: devops
tags: terraform, opentofu, iac, hashicorp, ibm
---

# IBM Owns Terraform Now. Here's Why That Actually Matters for Your Infra Stack.

IBM completed its acquisition of HashiCorp in February 2025, an all-cash deal valued at $6.4 billion, or $35 a share, covering all of HashiCorp's outstanding common stock. It's the second-largest acquisition in IBM's history, trailing only its $34 billion purchase of Red Hat in 2019. HashiCorp's flagship products, Terraform and Vault, are now sitting inside IBM's hybrid cloud portfolio rather than operating as an independent company.

## Why this deal happened when it did

The timing isn't a coincidence. Back in August 2023, HashiCorp relicensed Terraform from the permissive open-source Mozilla Public License to the more restrictive Business Source License, a move that alienated a chunk of the open-source community and triggered a community-driven fork called OpenTofu, now governed by the Linux Foundation. Reporting on the acquisition points out that this license change likely made HashiCorp a more attractive acquisition target in the first place, since the BSL gives whoever owns HashiCorp significantly more control over how Terraform gets used commercially than the old open-source license ever did. IBM buying the company essentially completes the move from "open infrastructure standard" to "IBM-controlled commercial product with an open-source-flavored license."

## What actually changes day to day

For most teams, surprisingly little changes immediately. Terraform still works the same way, HCL syntax is unchanged, and the Terraform Registry with its provider ecosystem hasn't gone anywhere. IBM has said it plans to integrate Terraform with Red Hat's Ansible Automation Platform for a combined infrastructure-provisioning-plus-configuration story, and Vault is getting folded into Red Hat OpenShift's security tooling.

The part worth watching is HashiCorp's cloud platform pricing. HashiCorp announced in December 2025 that the legacy free tier for HCP Terraform reaches end-of-life on March 31, 2026, with existing organizations moving to an "enhanced free" tier capped at 500 managed resources. Paid tiers scale from there, and one practitioner cited an example where a 5,000-resource stack on the Premium tier runs roughly $59,400 a year just for the workflow tooling layer. That pricing shift, more than the acquisition news itself, is what's actually pushing teams to look seriously at alternatives.

## Where OpenTofu actually stands right now

This is the part that gets oversold in either direction. OpenTofu is not a toy fork. It hit general availability back in January 2024, it's backed by a dedicated Linux Foundation engineering team, and by mid-2026 its registry counts more than 3,900 providers and 23,600-plus modules, mirroring and in places extending Terraform's own ecosystem. It's also shipped genuine technical differentiators ahead of Terraform's open binary: native state encryption, early variable evaluation, provider iteration with `for_each`, and OCI registry support.

Real companies are running it in production. Oracle and VMware adopted OpenTofu partly to reduce dependency on IBM specifically, and Boeing and AMD get cited as large-scale, regulation-conscious users, which matters, because companies with that risk profile don't run unproven tooling.

That said, current adoption numbers put OpenTofu at roughly 12% of IaC practitioners as of early-to-mid 2026, with another 27% evaluating or planning to expand its use. Terraform still holds the largest share by a wide margin, somewhere between a third and roughly two-thirds depending on how you measure it. Migration itself is close to a binary swap for most existing Terraform code: same HCL, same state format, `terraform init` becomes `tofu init`. One honest caveat from practitioners, though: the moment you write an OpenTofu-only feature like native state encryption into your state file, Terraform can no longer read it back. That's the point past which the swap stops being trivially reversible.

## The honest read

If you're starting a greenfield infrastructure project today with no existing Terraform investment and no hard dependency on HCP-specific features like Sentinel policy enforcement, OpenTofu is a genuinely low-regret default: same skills, same provider ecosystem, no BSL ambiguity, and a foundation-governed roadmap. If you're already deep into HCP Terraform with Sentinel policies wired into your compliance process, the calculus is different. You're not swapping a binary at that point, you're replacing a platform, and that's a real migration project, not an afternoon's work.

*Sources: IBM's official newsroom announcement of the completed acquisition, TechCrunch and SiliconANGLE coverage of the deal closing, and current OpenTofu adoption data from OpenTofu.org and independent 2026 practitioner comparisons.*
