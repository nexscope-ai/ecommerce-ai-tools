---
layout: default
title: "OpenAI Decisions API vs Jev: Did OpenAI Kill Jev?"
description: "OpenAI Decisions API vs Jev, fact-checked: early latency tests, unknown pricing, $10B valuation claims, feature differences, and a builder benchmark plan."
permalink: /ecommerce-trends/openai-decisions-api-vs-jev/
last_reviewed: 2026-09-30
date_published: 2026-09-30
date_modified: 2026-09-30
last_modified_at: 2026-09-30
author: Nexscope Team
schema_type: Article
og_type: article
topic: agents
editorial_only: true
keywords:
  - OpenAI Decisions API
  - OpenAI Decisions API vs Jev
  - Jev AI
  - TypeSafe AI Jev
  - GPT-6 Luna API
  - AI decision model
  - agent routing API
  - structured AI decisions
faq:
  - question: Did OpenAI's Decisions API kill Jev?
    answer: "No. OpenAI validated the same fixed-choice decision category and has a major distribution advantage, but Decisions remains in limited preview with no public pricing or complete API documentation. Early third-party tests are mixed and too small to establish a winner."
  - question: Is TypeSafe AI valued at $10 billion?
    answer: "Not on the public evidence reviewed. The Information reported early fundraising discussions and offers from unnamed investors at a valuation of $10 billion or more. That is not the same as a completed financing round at that valuation."
  - question: Is OpenAI Decisions API faster than Jev?
    answer: "There is no general answer yet. One early Every test favored Decisions at roughly 230 ms versus 500 ms, while another test cited by the same publication favored Jev at median latency of 161 ms versus 309 ms. Workload, batching, region, concurrency, and measurement method all matter."
  - question: What is the difference between OpenAI Decisions API and Jev?
    answer: "Both turn context and predefined options into software-ready choices. OpenAI's preview is powered by GPT-6 Luna and accepts text or images. Jev is a dedicated TypeSafe decision model with documented Choice, Score, and Noul primitives, published pricing, and company-claimed calibrated probabilities."
---

# OpenAI Decisions API vs Jev: did OpenAI kill Jev in two weeks?

**By Nexscope Team · Published and last verified September 30, 2026**

**No—OpenAI has not proved that Jev is dead. It has proved that fast, fixed-choice AI decisions are important enough to become a platform feature.** OpenAI announced the Decisions API at DevDay on September 29, two weeks after TypeSafe AI introduced Jev on September 15. The overlap is real, but the strongest “Jev is dead” claims run ahead of the available evidence: OpenAI's product is still a limited preview, its price and complete API contract are not public, and the first small third-party comparisons point in different directions.

> **Key takeaways**
>
> - Decisions API and Jev both target classification, routing, and agent branching without a long generated answer.
> - OpenAI brings multimodal input, distribution, and an existing developer ecosystem; Jev brings documented decision primitives and public pricing.
> - The reported $10 billion TypeSafe figure describes early fundraising talks, not a completed valuation.
> - OpenAI's reported 150 ms launch figure is not a public p50/p95 production benchmark.
> - The first two third-party comparisons split their results, so neither product has established a general performance lead.

## Fact check: what is verified, and what is still a claim?

**The product launch and competitive overlap are verified; the “$10 billion company killed in 15 days” conclusion is not.** The dates, product descriptions, funding report, and early tests support a narrower story: OpenAI entered the same decision-API category while the decisive commercial and technical evidence remains incomplete.

| Claim circulating after DevDay | Verdict | Evidence and limitation |
| --- | --- | --- |
| OpenAI announced Decisions API after Jev launched | **Verified** | TypeSafe announced Jev on September 15; OpenAI announced Decisions at DevDay on September 29. That is 14 elapsed days, or 15 calendar dates when both endpoints are counted. |
| Decisions API overlaps with Jev | **Verified, with differences** | Both select from bounded answers for routing and classification. Jev also documents Choice, Score, and Noul; OpenAI's preview accepts text and images. |
| Decisions responds in 150 ms instead of 1.6 seconds | **Launch claim, not independently established** | The figure was reported from the announcement. OpenAI has not published a latency distribution, workload definition, region, concurrency level, or reproducible benchmark. |
| OpenAI publicly documents confidence-score calibration | **Not yet verified** | No complete public Decisions response schema or calibration evaluation was available when this page was reviewed. |
| TypeSafe is a $10 billion company | **Misleading as a completed valuation** | The Information reported early talks and offers from unnamed investors at $10 billion or more, not a closed financing round. |
| “Jev is dead” | **Opinion, not a factual result** | The phrase came from a Reddit discussion. Pricing, broad-release reliability, independent calibration, and production retention are still unknown. |

## What did OpenAI actually announce?

**The Decisions API lets a developer supply context and a finite set of answers, then asks GPT-6 Luna to select an answer that software can use directly.** [Axios described it](https://www.axios.com/2026/09/29/openai-dev-day-2026-dots-space-sol) as an API for narrow, repetitive choices. [Every's DevDay report](https://every.to/vibe-check/vibe-check-openai-devday-2026) says the preview accepts both text and images and can be used for tasks such as choosing a computer control or deciding whether an email needs a reply.

That is a meaningful change in interface. A normal chat request asks a model to generate text and then relies on prompts, parsing, validation, or retries to turn that text into a program action. A decision interface starts from the narrower contract: here is the state, here are the allowed answers, choose one.

OpenAI has not yet published a complete public Decisions API reference, endpoint schema, rate-limit table, or separate price. Its [GPT-6 Luna model page](https://developers.openai.com/api/docs/models/gpt-6-luna) documents Luna, but Luna's standard token price should not be assumed to be the final Decisions API price. Reports from the announcement describe very low latency, yet a stage number is not a p50/p95 production benchmark across regions and concurrent workloads.

## Is Decisions API basically the same as Jev?

**They address the same core job, but the public products are not identical.** [TypeSafe launched Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev/) as an early-access “System One Model”: unstructured state goes in, typed probabilistic decisions come out. Its documented interface includes `Choice` for selecting among alternatives, `Score` for a bounded numerical judgment, and `Noul` for a binary probability. TypeSafe says Jev is trained with Reinforcement Learning for Calibrated Decisions and returns all outputs in parallel.

| Question | OpenAI Decisions API | TypeSafe Jev |
| --- | --- | --- |
| Primary job | Choose from developer-defined finite answers | Return typed decisions through Choice, Score, or Noul |
| Public status on September 30 | Limited preview | Early access |
| Input described publicly | Text and images | Structured or unstructured text state; TypeSafe says image input is not available yet |
| Underlying approach | A Decisions interface powered by GPT-6 Luna | A dedicated model and training stack, according to TypeSafe |
| Public pricing | Not announced | $0.042 per million input tokens; output free, according to TypeSafe |
| Public documentation | No complete public Decisions API reference found | Public API documentation and decision primitives are available |
| Confidence and calibration | Exact public response schema and calibration evidence are not yet available | Probabilities and confidence are central product claims; independent task-specific validation is still needed |

The common denominator is **bounded inference**. Instead of asking “What should the agent do?” and accepting any string, an application asks “Which of these allowed actions should the agent take?” That smaller output space can improve speed and integration reliability. It does not guarantee that the selected action is correct.

For a deeper explanation of the decision-model pattern, read [Jev AI for ecommerce: structured decisions, not a chatbot](../jev-ai-ecommerce-structured-decisions/).

## What do the first Decisions API vs Jev tests show?

**They show that either system can win on a particular workflow—not that one has won the category.** Every published two early comparisons:

| Early test reported by Every | Quality result | Latency result |
| --- | --- | --- |
| Text-only replay of computer-use steps | Decisions selected the correct control on 76 of 78 scored steps; Jev scored 73 | Decisions typically took about 230 ms; Jev about 500 ms |
| Conversation-thread classification at Cora | Effectively tied on accuracy | Jev median 161 ms; Decisions median 309 ms |

These numbers are useful signals, not a universal leaderboard. The samples are small, the tasks differ, and the report does not establish how results change with long context, many choices, batching, concurrency, geographic distance, or a team's own labels. It is also too early to compare cost per accepted decision because OpenAI has not announced Decisions pricing.

A Reddit commenter reported an internal 800-record test in which batched GPT-6 Luna was 1.6 times as fast as Jev, 1.2 times the cost, and roughly equal in accuracy. The [comment provides no dataset, code, prompt, raw results, or reproducible method](https://www.reddit.com/r/AI_Agents/comments/1wtiicr/jev_is_dead/). It should be labeled as an anecdote, not an independent benchmark.

## Was Jev really a $10 billion company when OpenAI responded?

**No completed $10 billion financing has been established by the public reporting reviewed for this article.** [The Information reported](https://www.theinformation.com/newsletters/dealmaker/jev-fervor-leads-talk-big-valuation-boost) on September 24 that TypeSafe had begun discussing a raise of $1 billion or more and that unnamed investors had offered to invest at a valuation of $10 billion or more. The same report said the talks were early and could change.

This distinction matters:

- **Verified reporting:** early fundraising discussions and investor offers at $10 billion or more.
- **Not established:** a signed and closed round that values TypeSafe at $10 billion.
- **Misleading shorthand:** “OpenAI killed a $10 billion company” treats an unclosed financing discussion and a one-day product announcement as settled outcomes.

The valuation story explains why the comparison is attracting attention. It does not measure Jev's accuracy, retention, revenue, or technical moat.

## Where could Jev still have a moat?

**Jev's defensible advantage would have to appear in calibrated accuracy, economics, and production reliability—not merely in the idea of choosing from a list.** OpenAI can distribute Decisions through an API platform that many teams already use. If it becomes accurate enough, similarly fast, competitively priced, and easier to procure, fewer developers will add a second vendor solely for routing or classification.

Jev can still matter if it repeatedly demonstrates one or more of the following on independent, reproducible workloads:

1. **Better calibration:** a claimed 80% probability should correspond to roughly 80% accuracy for the relevant task and data distribution.
2. **Lower cost per accepted decision:** token price alone is incomplete; retries, abstentions, human review, and serious errors belong in the denominator.
3. **Predictable latency at load:** p50 looks good in demos, but p95/p99 and throughput under concurrency determine whether a model fits a real-time path.
4. **Richer decision primitives:** Choice, Score, and binary probability may be more useful than a single fixed-choice interface if they remain reliable.
5. **Provider independence:** some teams will deliberately avoid concentrating generation, routing, evaluation, and agent control in one model provider.

TypeSafe's own launch post is unusually explicit about evaluation limits. It says its published workflow evaluations were produced by its model-capabilities team, use the average of large external models as reference probabilities, and may contain bias. Its quoted 40–200x speed and 40–400x cost advantages are therefore **vendor claims for selected workflows**, not independent guarantees for every application.

## What does this mean for ecommerce and AI agents?

**The immediate opportunity is a fast decision layer inside an existing workflow, not an autonomous replacement for product data or human approval.** Ecommerce systems contain many bounded questions:

| Workflow | Finite decision | Evidence still required |
| --- | --- | --- |
| Review triage | Product issue, delivery issue, packaging issue, unclear | Original review, source ID, date, and mixed-topic handling |
| Support routing | Refund, compatibility, shipping, fraud review, other | Authorized ticket text and account context |
| Catalog quality control | Publish-ready, missing attribute, conflicting attribute | Merchant-approved product record and current listing |
| Agent navigation | Click, scroll, go back, stop, request help | Current screenshot or page state and allowed-action policy |
| Research prioritization | Investigate now, monitor, ignore | Dated marketplace evidence and a documented threshold |

These are candidate workflows, not built-in ecommerce features promised by either vendor. A fixed output type prevents an unexpected label; it does not prevent a wrong label. Pricing changes, refunds, product claims, customer messages, and account actions should remain behind explicit approval until a team has measured the relevant failure modes.

## How should developers compare Decisions API and Jev?

**Use the same recorded workload, the same allowed answers, and business-weighted error costs.** Do not select a decision model from a launch latency number alone.

1. Save a representative set of real decisions with timestamps, source IDs, and human-reviewed outcomes.
2. Define identical answer sets and an `unclear` or human-review path where the interface permits it.
3. Run both systems on the same inputs without silently changing the task-specific instructions.
4. Measure per-class precision and recall, calibration, abstention or escalation rate, p50/p95 latency, throughput, and total cost.
5. Weight high-impact errors separately. Misrouting a newsletter is not equivalent to approving a refund or changing a listing.
6. Shadow the workflow before granting write access, then re-test when the model, prompt, label set, or source distribution changes.

Until OpenAI publishes the Decisions schema and price, teams should design this evaluation now but avoid making a procurement conclusion from incomplete information.

## So, did OpenAI kill Jev?

**No. OpenAI compressed Jev's novelty window and raised the standard of proof for TypeSafe.** The idea of a fast AI decision primitive is no longer a startup-only pitch. Jev must now prove that its probability calibration, price, latency, or reliability creates enough value to justify another provider. OpenAI must prove that its preview works consistently, is priced for high-volume calls, and exposes a dependable contract.

The most defensible headline is not “Jev is dead.” It is: **OpenAI validated Jev's market two weeks after launch, and the real competition has only just started.**

## Frequently asked questions

### Did OpenAI's Decisions API kill Jev?

No. The feature overlap and OpenAI's distribution create serious competitive pressure, but Decisions is still in limited preview and has no public price or complete API reference. Early third-party tests are mixed.

### Is TypeSafe AI valued at $10 billion?

The public report describes early fundraising talks and offers from unnamed investors at $10 billion or more. It does not establish a completed funding round at that valuation.

### Is OpenAI Decisions API faster than Jev?

It depends on the task. One early Every test favored Decisions, while another favored Jev on median latency. Teams need workload-specific p50, p95, throughput, accuracy, and cost measurements.

### What is the difference between Decisions API and Jev?

Both make bounded decisions from predefined options. OpenAI's Luna-powered preview accepts text or images and benefits from OpenAI's ecosystem. Jev documents Choice, Score, and Noul primitives, publishes pricing, and makes probability calibration a core product claim.

## Sources and verification scope

- **Primary vendor sources:** [OpenAI DevDay 2026](https://devday.openai.com/), September 29, 2026 — event date and launch context; [OpenAI GPT-6 Luna documentation](https://developers.openai.com/api/docs/models/gpt-6-luna), reviewed September 30, 2026 — base-model positioning and standard Luna pricing context, not Decisions API pricing.
- **Primary TypeSafe sources:** [Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev/), September 15, 2026 — vendor claims, methodology, pricing, latency, and disclosed limitations; [TypeSafe API documentation](https://api.typesafe.ai/docs), reviewed September 30, 2026 — public request and response schemas.
- **Independent reporting and early tests:** [Axios: OpenAI DevDay announcements](https://www.axios.com/2026/09/29/openai-dev-day-2026-dots-space-sol), September 29, 2026 — independent launch confirmation; [Every: Vibe Check, OpenAI DevDay 2026](https://every.to/vibe-check/vibe-check-openai-devday-2026), September 29, 2026 — preview details and two early comparisons; [The Information: Jev Fervor Leads to Talk of Big Valuation Boost](https://www.theinformation.com/newsletters/dealmaker/jev-fervor-leads-talk-big-valuation-boost), September 24, 2026 — early fundraising discussions and reported offers.
- **Community reaction, not independent evidence:** [Reddit: “Jev Is Dead” discussion](https://www.reddit.com/r/AI_Agents/comments/1wtiicr/jev_is_dead/), September 30, 2026 — the viral claim and an unreproducible anecdotal benchmark.

**Scope note:** We did not have access to OpenAI's limited-preview endpoint and did not run an independent Decisions-vs-Jev benchmark. Product behavior, latency, accuracy, pricing, and availability can change after broad release. The comparisons above separate vendor statements, third-party tests, reporting, and anonymous community claims.
