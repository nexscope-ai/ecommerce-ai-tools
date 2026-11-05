---
learning_topic: "agents"
related_topics: ["research"]
content_kind: "guide"
layout: "default"
title: "n8n TikTok API: Build a Video Research Sheet"
description: "Build an n8n TikTok video research workflow with keyword search, source links, duplicate checks and a manual Google Sheets starter."
permalink: "/guides/n8n-tiktok-video-research/"
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
  - question: "Does this workflow report TikTok Shop sales?"
    answer: "No. General video search supplies public video evidence, not attributed product sales or revenue."
  - question: "Does deduplication prevent repeated paid searches?"
    answer: "No. Removing repeated video IDs after retrieval does not prevent the retrieval charge or provide persistent cross-run deduplication."
  - question: "Does the starter reuse or publish TikTok videos?"
    answer: "No. It prepares a source-linked research sheet and contains no asset reuse or publishing step."
next_step:
  id: n8n_tiktok_video_research
  intent: api-evaluation
  title: "Inspect the matching API"
  description: "Check current request fields, source coverage, execution access and credit rules before running."
  label: "Open API reference and test console"
  url: https://www.nexscope.ai/api-docs/social-tiktok-search-keyword?view=api&co-from=learn#online-test
---

# n8n TikTok API: Build a Video Research Sheet

An **n8n TikTok API workflow** can prepare a source-linked video research sheet from a keyword search. Start with a product-use question, retrieve one page and review demonstrations, captions and available interactions. The manual starter exports at most 20 unique video records and leaves Google Sheets writes disabled until you configure them.

{% include api-guide-entry.html %}

> **Quick answer:** Start with one manual request, validate the real supplier structure and preserve source identities before writing rows or asking AI to summarize them.

On this page: [Mapping](#field-mapping-and-implementation-checkpoint) · [Dated verification](#what-did-the-dated-verification-establish) · [Downloads](#downloads-and-verification-scope)

*Reviewed November 5, 2026. Vendor-authored guide based on public contracts, official platform documentation and the explicitly labeled checks below. A real API response does not establish a successful n8n/Make platform import, live Sheets write, AI draft or performance uplift.*

## What should TikTok video research answer?

**Use a product situation that a reviewer can recognize.** “Travel coffee mug” can help a team inspect commuting demonstrations, lid explanations and cleaning questions. It does not identify a winning product by itself. Write the intended buyer and use situation beside the query so a visually popular result does not automatically become a relevant competitor.

This guide uses general public TikTok keyword search. It differs from the existing TikTok Shop product tutorials, which cover commerce records and product metrics. A public video's views and likes are not sales, attributed revenue or proof that the depicted product is available from a particular seller. Keep those conclusions out of the worksheet unless another verified source supplies them.


## How do you configure the n8n starter?

**Import the inactive manual workflow and inspect it before execution.** It uses core Manual Trigger, Code, HTTP Request and a disabled Google Sheets writer. Select your own Header Auth credential on the HTTP node: header `Authorization`, value `Bearer YOUR_ACTUAL_KEY`. The exported JSON contains no credential IDs or keys.

Edit Research input, leave the writer disabled and make one deliberate API request. Review Validate and map before creating a scratch sheet with the companion headings. Configure your Google credential and destination, then enable writes only when ready. The node uses RAW cell formatting and escapes formula-like source text. It does not implement an automatic schedule, cursor loop or HTTP retry.

The 20-row review cap is downstream of collection. In-run duplicate removal does not maintain persistent history or prevent retrieval charges. A repeated append can create duplicate rows across executions. Use the task-specific history and recovery instructions below before expanding.

### Request body

`POST https://api.nexscope.ai/social/tiktok/search/keyword`

```json
{
  "query": "travel coffee mug",
  "trim": true
}
```

## How does the n8n TikTok request work?

**Send `query` and `trim` to the documented keyword endpoint.** The first request has no cursor and no automatic loop. Inspect the wrapper before opening the supplier object under `data.data`. The documented video collection is `search_item_list`, with video fields nested inside each item's `aweme_info`; this is not the normalized `data.items` used by some other social APIs.

The starter requires numeric business success, an AVAILABLE or PARTIAL resource state and the expected array. It stops on a changed shape. Each video needs a source identity; the mapping deduplicates video IDs within the returned page. The export cap is applied after retrieval and does not reduce the upstream request or establish a maximum charge.


## Which fields make a useful creative research row?

**Keep source facts separate from creative judgments.** Store the video ID, available public URL, caption and available `statistics` counts. Review `play_count`, `digg_count`, `comment_count` and `share_count` independently. A missing count stays unknown; it is not a reason to substitute zero or copy a value from a neighboring video.

If the payload lacks a usable public URL or author identity needed to construct one, the starter stops for mapping review. It does not fabricate an account handle. Add reviewer columns for hook, use situation, demonstration method, unanswered question and original experiment. Watch the linked video before labeling a technique or claiming that the caption accurately describes what is demonstrated.


{% include article-action.html placement="article-middle" %}

## How should you compare the returned videos?

**Compare evidence under a shared research question.** A short product demonstration, a general lifestyle clip and a paid-looking endorsement may appear in the same search. The API does not make those formats interchangeable. Record relevance and exclude unrelated rows from any theme summary while retaining the reason for exclusion.

Video IDs can repeat in search results. The starter removes repeated IDs in this execution, but there is no persistent cross-run store. The same video can reappear in tomorrow's query. Use the [workflow operations guide]({{ '/guides/paid-api-workflow-retries-deduplication/' | relative_url }}) before adding schedules or repeated writes. Repeated observations and newly discovered videos are different records.


## How do you turn research into an original content test?

**Choose one observed question and design your own demonstration.** If reviewed videos repeatedly leave lid cleaning unexplained, a useful next experiment might be an original cleaning walkthrough. Record which source videos motivated the question, what you will demonstrate and what outcome you will measure in your own test.

Do not copy captions, footage or creator identities into a campaign. A source link is not an asset license. An optional AI step can propose theme labels from selected rows with source IDs, but publication requires editorial review. For audience questions, use the [Make TikTok comments guide]({{ '/guides/make-tiktok-comments-analysis/' | relative_url }}) rather than assuming the video caption represents its viewers' needs.


## How do you handle cost, incomplete data and failures?

**Check business status, resource scope and billing separately.** HTTP success alone does not establish useful data. AVAILABLE and PARTIAL should remain distinguishable in the sheet; a partial page must not become a complete report. Reject unusable, private, restricted or unknown states before creating a speculative brief.

Each API request can consume credits. A source's supplier-price description is not necessarily the Nexscope gateway charge. Check returned `usage.billingStatus`, `usage.chargedCredits` and the account credit ledger; the retained cases below label observed prices rather than promising fixed fees. Where the wrapper includes `cost`, it describes processing time, not a credit price.

Retain a successful response before downstream writes. If delivery fails, inspect that saved evidence before repeating retrieval. Keep collection time, source date precision and pagination scope visible. Choose execution-log retention appropriate to the content. No template sends messages, posts creative or publishes an AI draft automatically.

## What did the dated verification establish?

The request for `travel coffee mug` was submitted at **07:35:04 UTC on November 5, 2026**. Call history reported SUCCESS and the account ledger recorded a **10-credit** deduction. The browser connection failed before the response body could be retained, so this guide makes **no claim about its result count or actual inner fields**. The starter mapping follows the published `search_item_list → aweme_info` contract and is tested with constructed fixtures only. The successful charge is not presented as proof that this n8n mapping ran end to end.

See the [sanitized batch evidence record]({{ '/assets/downloads/social-batch2-live-evidence-20261105.json' | relative_url }}) for scope and billing metadata. Full comments, author profiles, keys and account identifiers are not published. API tests do not establish authenticated n8n/Make execution, a successful Sheets write or an AI-generated report.


## Field mapping and implementation checkpoint

| Evidence | Field or state | Handling |
| --- | --- | --- |
| Collection | `data.data.search_item_list` | Documented path; live body not retained |
| Video identity | `aweme_info.aweme_id` | String ID; deduplicate within page |
| Source link | `aweme_info.share_url` or returned author handle + video ID | Stop if identity/link cannot be established |
| Interactions | `aweme_info.statistics` | Keep counts separately; no sales inference |

**Node order:** Manual Trigger → Research input → HTTP Request → Validate and map → disabled Sheets writer.


## Downloads and verification scope

- [Inactive n8n starter]({{ '/assets/downloads/n8n-tiktok-video-research-workflow.json' | relative_url }})
- [Request JSON]({{ '/assets/downloads/n8n-tiktok-video-research-request.json' | relative_url }})
- [Review sheet headings]({{ '/assets/downloads/n8n-tiktok-video-research-headers.csv' | relative_url }})
- [Local evidence, queue and budget helper]({{ '/assets/downloads/social-workflow-evidence-ops.py' | relative_url }})

The helper runs without API credentials and makes no network or model requests. n8n Code logic and local state behavior are checked with saved or constructed inputs as labeled. Make recipes are manual configuration notes, not authenticated scenario exports. Configure and test a scratch destination before enabling writes.

Read the related [research guide]({{ '/guides/tiktok-shop-api-guide/' | relative_url }}) and [workflow recovery guide]({{ '/guides/paid-api-workflow-retries-deduplication/' | relative_url }}) for context.

## Sources

- [Nexscope: matching API contract](https://www.nexscope.ai/api-docs/social-tiktok-search-keyword?view=api) — current operation and source limits.
- [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) and [Google Sheets operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/) — request and destination configuration.

{% include api-guide-faq.html %}
