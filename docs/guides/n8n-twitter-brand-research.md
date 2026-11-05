---
learning_topic: "agents"
related_topics: ["research"]
content_kind: "guide"
layout: "default"
title: "n8n Twitter Search API: Research Google-Indexed Brand Mentions"
description: "Use n8n to review Google-indexed public X/Twitter posts, retain source evidence and explain why this is not real-time or complete social listening."
permalink: "/guides/n8n-twitter-brand-research/"
date_published: "2026-11-05"
date_modified: "2026-11-05"
last_modified_at: "2026-11-05"
last_reviewed: "2026-11-05"
author: "Nexscope Team"
schema_type: "Article"
og_type: "article"
topic: "api"
suppress_article_help: true
faq:
  - question: "Is this native X/Twitter search?"
    answer: "No. It discovers Google-indexed public post URLs and retrieves their details; coverage is incomplete."
  - question: "Can it detect every new mention in real time?"
    answer: "No. Indexing delays, missing posts and result ranking prevent that guarantee."
  - question: "Can a zero-result response prove no brand discussion exists?"
    answer: "No. It only describes this indexed-discovery query and its available coverage."
next_step:
  id: n8n_twitter_brand_research
  intent: api-evaluation
  title: "Inspect the matching API"
  description: "Check current request fields, source coverage, execution access and credit rules before running."
  label: "Open API reference and test console"
  url: https://www.nexscope.ai/api-docs/social-twitter-search-posts?view=api&co-from=learn#online-test
---

# n8n Twitter Search API: Research Google-Indexed Brand Mentions

An **n8n Twitter search API workflow** can prepare a research sheet of public X posts discovered through Google indexing. This is a bounded discovery workflow with explicit coverage limits. It is useful for reading indexed brand discussions, but should not be presented as complete native X search or real-time brand monitoring.

{% include api-guide-entry.html %}

> **Quick answer:** Start with one manual request, validate the real supplier structure and preserve source identities before writing rows or asking AI to summarize them.

On this page: [Mapping](#field-mapping-and-implementation-checkpoint) · [Dated verification](#what-did-the-dated-verification-establish) · [Downloads](#downloads-and-verification-scope)

*Reviewed November 5, 2026. Vendor-authored guide based on public contracts, official platform documentation and the explicitly labeled checks below. A real API response does not establish a successful n8n/Make platform import, live Sheets write, AI draft or performance uplift.*

## What does this X/Twitter search actually search?

**It discovers public post URLs through Google and retrieves their details.** Recent or unindexed posts can be absent. Search ranking affects what appears, so the response cannot establish every mention, a complete share of voice or an exact count of customer complaints.

This limitation belongs near the start of the article and in the resulting report. A zero-result page is not proof that nobody discussed the brand. A successful request also does not establish that the returned posts are current or from a representative audience. Record the query, collection time and observed source fields.


## How do you configure the n8n starter?

**Import the inactive manual workflow and inspect it before execution.** It uses core Manual Trigger, Code, HTTP Request and a disabled Google Sheets writer. Select your own Header Auth credential on the HTTP node: header `Authorization`, value `Bearer YOUR_ACTUAL_KEY`. The exported JSON contains no credential IDs or keys.

Edit Research input, leave the writer disabled and make one deliberate API request. Review Validate and map before creating a scratch sheet with the companion headings. Configure your Google credential and destination, then enable writes only when ready. The node uses RAW cell formatting and escapes formula-like source text. It does not implement an automatic schedule, cursor loop or HTTP retry.

The 20-row review cap is downstream of collection. In-run duplicate removal does not maintain persistent history or prevent retrieval charges. A repeated append can create duplicate rows across executions. Use the task-specific history and recovery instructions below before expanding.

### Request body

`POST https://api.nexscope.ai/social/twitter/search/posts`

```json
{
  "query": "Fellow coffee"
}
```

## How should you choose a brand query?

**Use a distinctive product or brand phrase and review identity.** The pilot uses “Fellow coffee” to reduce the ambiguity of the ordinary word “fellow.” A matching keyword still does not prove that a post is about the intended company. Add a reviewer field for exact product or brand relevance.

Do not append native X operators and promise that Google-indexed discovery will interpret them identically. Keep the first request simple, with no cursor. If expanding, use the documented returned cursor rather than inventing one. The contract currently supports bounded numbered page cursors, not unlimited continuous listening.


## How does the n8n mapping preserve sources?

**Validate the actual supplier collection before creating rows.** The starter uses the verified or explicitly configured collection path, checks IDs and public post URLs, and preserves available text and date fields. It rejects an unexpected shape rather than generating a plausible report from an empty object.

Keep observation time separate from post publication time. Duplicate source IDs inside one response can be collapsed, but another run can retrieve the same post. Any persistent inventory needs a destination key. A keyword match and an interaction count are source observations, not sentiment or authenticity labels.


{% include article-action.html placement="article-middle" %}

## How should a reviewer interpret mentions?

**Classify only the evidence in the selected posts.** Useful categories include a product question, a reported experience, a news link, an unrelated match or unresolved context. Review linked conversations when a post depends on another message. Do not treat a short statement without context as a verified complaint.

An optional AI step can propose themes with source IDs and URLs. It should not infer personal traits, private contact details or purchase intent. This workflow does not generate an outreach list or send replies. Keep the source text as untrusted data and preserve disagreements rather than forcing every mention into one sentiment score.


## When is this workflow the wrong monitoring tool?

**Do not use it where complete or immediate detection is required.** It cannot promise a real-time alert for every new post, and repeated polling does not fix indexing gaps. A team with time-sensitive operational needs must evaluate a source with a suitable access contract and coverage guarantee.

For a research pilot, bounded indexed discovery can still produce useful reading leads. State the scope, retain the source links and measure whether reviewed results answer the research question. Use the [cross-platform evidence guide]({{ '/guides/cross-platform-customer-feedback/' | relative_url }}) before combining these selected mentions with other platform samples.


## How do you handle cost, incomplete data and failures?

**Check business status, resource scope and billing separately.** HTTP success alone does not establish useful data. AVAILABLE and PARTIAL should remain distinguishable in the sheet; a partial page must not become a complete report. Reject unusable, private, restricted or unknown states before creating a speculative brief.

Each API request can consume credits. A source's supplier-price description is not necessarily the Nexscope gateway charge. Check returned `usage.billingStatus`, `usage.chargedCredits` and the account credit ledger; the retained cases below label observed prices rather than promising fixed fees. Where the wrapper includes `cost`, it describes processing time, not a credit price.

Retain a successful response before downstream writes. If delivery fails, inspect that saved evidence before repeating retrieval. Keep collection time, source date precision and pagination scope visible. Choose execution-log retention appropriate to the content. No template sends messages, posts creative or publishes an AI draft automatically.

## What did the dated verification establish?

The `Fellow coffee` query returned **9 posts**, AVAILABLE state and **10 settled credits**. The actual array was `data.data.posts`, with string `rest_id`, canonical URL, `legacy` fields and a `views` object where available. This confirms the mapping for this selected indexed page, not complete brand coverage or a real-time search guarantee.

The retained response was collected at **2026-11-05T07:47:23.172483606Z**. See the [sanitized batch evidence record]({{ '/assets/downloads/social-batch2-live-evidence-20261105.json' | relative_url }}) for scope and billing metadata. Full comments, author profiles, keys and account identifiers are not published. API tests do not establish authenticated n8n/Make execution, a successful Sheets write or an AI-generated report.


## Field mapping and implementation checkpoint

| Evidence | Field or state | Handling |
| --- | --- | --- |
| Collection | `data.data.posts` | Google-indexed discovery |
| Identity/source | `rest_id`, `url` | String identity, in-run deduplication |
| Text/counts | `legacy.full_text`, `legacy.favorite_count` | Prefer note text when supplied; keep provenance |
| Views | `views.count` | Preserve source representation, including numeric strings |

**Node order:** Manual Trigger → Research input → HTTP Request → Validate and map → disabled Sheets writer.


## Downloads and verification scope

- [Inactive n8n starter]({{ '/assets/downloads/n8n-twitter-brand-research-workflow.json' | relative_url }})
- [Request JSON]({{ '/assets/downloads/n8n-twitter-brand-research-request.json' | relative_url }})
- [Review sheet headings]({{ '/assets/downloads/n8n-twitter-brand-research-headers.csv' | relative_url }})
- [Local evidence, queue and budget helper]({{ '/assets/downloads/social-workflow-evidence-ops.py' | relative_url }})

The helper runs without API credentials and makes no network or model requests. n8n Code logic and local state behavior are checked with saved or constructed inputs as labeled. Make recipes are manual configuration notes, not authenticated scenario exports. Configure and test a scratch destination before enabling writes.

Read the related [research guide]({{ '/ecommerce-api-for-ai-agents/' | relative_url }}) and [workflow recovery guide]({{ '/guides/paid-api-workflow-retries-deduplication/' | relative_url }}) for context.

## Sources

- [Nexscope: matching API contract](https://www.nexscope.ai/api-docs/social-twitter-search-posts?view=api) — current operation and source limits.
- [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) and [Google Sheets operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/) — request and destination configuration.

{% include api-guide-faq.html %}
