---
layout: default
title: "OpenAI Decisions API vs Jev: Pricing & Ecommerce Evaluation"
description: "Compare current Decisions API and Jev pricing, typed outputs and evidence limits. Use a review-triage evaluation sheet before choosing a decision model."
permalink: /ecommerce-trends/openai-decisions-api-vs-jev/
last_reviewed: 2026-10-26
date_published: 2026-09-30
date_modified: 2026-10-26
last_modified_at: 2026-10-26
author: Nexscope Team
schema_type: Article
og_type: article
topic: agents
editorial_only: true
suppress_article_help: true
next_step:
  id: decision_model_jev_workflows
  intent: api_evaluation
  title: Explore the Jev workflows available through Nexscope
  description: Review Jev use cases and the supported Evaluate and Route APIs. Check each documented preset and current credit cost before running it; the review-triage design below is a separate evaluation plan.
  label: Explore Jev use cases and API access
  url: "https://www.nexscope.ai/jev?co-from=learn"
keywords:
  - OpenAI Decisions API vs Jev
  - OpenAI Decisions API pricing
  - Jev AI
  - ecommerce review classification
faq:
  - question: Is OpenAI Decisions API still a limited preview?
    answer: "No. The OpenAI Decisions guide checked October 26, 2026 labels it generally available and documents POST /v1/decisions. Earlier preview descriptions on this page have been replaced."
  - question: Is Decisions API cheaper than Jev?
    answer: "The reviewed sources list $0.10 per million uncached input tokens for Decisions and $0.042 per million input tokens in TypeSafe's Jev launch post, with output free for both. At those base rates, Jev has the lower input-token price; accepted-decision cost also depends on retries, caching, review and errors."
  - question: Did OpenAI kill Jev?
    answer: "A competing product does not establish that another vendor has failed. Choose using a shared labeled workload, accuracy, escalation rate, latency and total accepted-decision cost. This page reports no independent head-to-head test."
---

# OpenAI Decisions API vs Jev: pricing and an ecommerce evaluation plan

**OpenAI Decisions API and TypeSafe Jev both target typed decisions. Neither can be selected responsibly from a launch-speed headline.** For an ecommerce team, the useful question is whether a model can classify the same review evidence accurately, escalate ambiguous cases and reduce the cost of an accepted decision.

**Updated October 26, 2026:** our September version described Decisions as a limited preview with no public price or API reference. That description is outdated. The comparison below uses the current official guide and labels the remaining evidence gaps.

{% include api-guide-entry.html %}

## Decisions API vs Jev: what is documented now?

OpenAI's [current Decisions guide](https://developers.openai.com/api/docs/guides/decisions) marks the API generally available. It documents `POST /v1/decisions`, the `gpt-6-luna` model, text/image/JSON evidence, and `predicate`, `choice` and `score` questions. Choice answers include probabilities and confidence. The published base price is $0.10 per million uncached input tokens, with output uncharged; caching and processing conditions affect the bill.

TypeSafe's [Jev launch post](https://typesafe.ai/blog/introducing-system-one-models-and-jev) describes an early-access model with Choice, Score and Noul primitives, probabilistic outputs, and a $0.042-per-million input-token price with free output. That dated launch source is not a promise that every current account has identical terms; check [TypeSafe's documentation](https://docs.typesafe.ai/) before procurement.

| Selection question | Decisions API | Jev |
| --- | --- | --- |
| Public interface | Official Decisions guide and endpoint | TypeSafe documentation and dedicated decision primitives |
| Listed base input price | $0.10 / million uncached tokens | $0.042 / million tokens in launch post |
| Public output pricing in reviewed sources | No output-token charge | No output-token charge |
| Same-workload result measured by Nexscope | Not tested | Not tested |
| Production decision | Validate on your labeled inputs | Validate on the same labeled inputs |

Documentation establishes an interface, not a quality ranking. A probability field is not proof of calibration on your catalog. A syntactically valid category can still be wrong. These are direct-provider base prices, not Nexscope credit prices; check the Nexscope API documentation for its supported workflows and charges.

## Which should you try first?

**Choose the first candidate by your integration constraint, then test the other against it.** These are evaluation priorities, not a measured vendor ranking.

| Your constraint | First evaluation step | What would change the decision? |
| --- | --- | --- |
| Existing OpenAI application | Try Decisions on a saved, labeled workload | Jev materially improves accepted-result cost or quality |
| Large volume of text classifications | Include Jev because its listed base input price is lower | Review, retries or errors erase the input-price advantage |
| Need a written explanation or extracted object | Specify that output separately from the classifier | A decision label alone cannot meet the user-facing task |
| Need calibrated escalation | Measure accuracy by confidence band | High-confidence errors invalidate automatic acceptance |
| No representative labels yet | Build a reviewed sample first | A speed test cannot fill an unknown quality denominator |

Record the exact model, version where exposed, account terms and test date. Do not assume an old comparison describes today's deployed services.

## Worked design: classify Amazon review evidence

**Collect the reviews once, preserve their IDs and run each candidate on that saved input.** Fetching a different set for each model would mix collection differences with classification performance.

In this design, review collection provides the research input and a separate decision call supplies the classification. The [Amazon review evidence record]({{ '/api-evidence/amazon-reviews-list/' | relative_url }}) demonstrates why requested and returned counts must remain separate. Inspect the [Amazon Reviews List API](https://www.nexscope.ai/api-docs/amazon-reviews-list?view=api&co-from=learn) for collection. The custom label task below does not imply that every label is a supported preset in Nexscope's Jev wrapper.

Define the coding rules before testing:

| Allowed label | Coding rule | Synthetic example, not a customer quote |
| --- | --- | --- |
| product_fit | Explicit size, capacity or compatibility complaint | The case cannot hold the cards I intended to carry. |
| product_failure | Explicit physical or functional failure | The zip stopped closing after normal use. |
| delivery | Arrival timing or transit condition | The parcel arrived after the promised date. |
| other_or_unclear | Mixed topics, missing context or no supported category | It was disappointing. |

These labels are an editorial starting point. If delivery and product damage overlap, define a primary-topic rule or make them separate binary questions. Have two reviewers adjudicate ambiguous cases before scoring the models. Apply identical translation and data-cleaning steps to both candidates.

## What should the benchmark record?

Download the [review-triage evaluation CSV]({{ '/assets/downloads/decision-model-evaluation.csv' | relative_url }}). **This is an empty worksheet, not benchmark results.** Use one row per model and input, linked to saved evidence.

| Measure | Calculation or inspection | Failure it reveals |
| --- | --- | --- |
| Per-label precision | Correct predictions of a label / all predictions of that label | False positives hidden by a large class |
| Escalation rate | Refused, ambiguous or rejected cases / all cases | Accuracy inflated by declining work |
| Accepted-result accuracy | Correct accepted decisions / accepted decisions | Incorrect answers reaching the workflow |
| Confidence-band accuracy | Observed accuracy within each confidence band | Overconfident automation |
| p50 and p95 latency | Same concurrency and region | Tail delays hidden by an average |
| Accepted-decision cost | Model, retries and review cost / accepted decisions | Cheap input with an expensive review path |

Keep timeouts and refusals in the denominator. Separate cold and cached requests. Select an acceptance threshold on held-out examples rather than the examples used to design the labels.

{% include article-action.html placement="article-middle" %}

## A cost example that changes the buying decision

**A cheaper input price can lose after review costs.** In this hypothetical calculation, assume 1,000 input tokens per request with no caching or processing premiums. The listed input charges become $0.0001 for Decisions and $0.000042 for Jev. For 10,000 requests that is $1.00 versus $0.42.

If one pipeline needs one additional review minute valued at $1, that review cost exceeds the $0.58 token-price difference. This arithmetic is not a production benchmark. Replace the assumptions with measured input length, billing and review effort, and track serious errors separately.

## When should a decision remain a suggestion?

Start in shadow mode while the existing process still determines outcomes. Inspect disagreements by language, variant and topic. A classifier can propose a research queue; changing a listing claim requires product verification, and changing a price or issuing a refund requires a separate authorized workflow.

The useful next step is a reproducible dataset. For the wider pipeline, see [ecommerce APIs for AI agents]({{ '/ecommerce-api-for-ai-agents/' | relative_url }}).

{% include api-guide-faq.html %}

## Sources and verification scope

Product facts come from the linked OpenAI guide and TypeSafe launch post, checked October 26, 2026. The labels, worksheet, selection rules and cost illustration are Nexscope editorial methods. We did not run an independent head-to-head benchmark. The earlier launch-only comparisons and fundraising discussion have been removed from the buying recommendation.
