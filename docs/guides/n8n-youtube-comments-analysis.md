---
learning_topic: "agents"
related_topics: ["research"]
content_kind: "guide"
layout: "default"
title: "n8n YouTube Comments API: Find Unanswered Buyer Questions"
description: "Build an n8n YouTube comments research workflow with source IDs, explicit reply limits and careful handling of approximate publication timestamps."
permalink: "/guides/n8n-youtube-comments-analysis/"
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
  - question: "Are publishedTime timestamps exact source timestamps?"
    answer: "No. They can be derived from relative YouTube labels. Preserve publishedTimeText and avoid second-level timing claims."
  - question: "Does reply count mean all replies were retrieved?"
    answer: "No. Counts and reply bodies are separate evidence; additional reply requests require their own scope."
  - question: "Does the workflow publish FAQ answers automatically?"
    answer: "No. It prepares a research sheet; any proposed answer needs source checking and human review."
next_step:
  id: n8n_youtube_comments_analysis
  intent: api-evaluation
  title: "Inspect the matching API"
  description: "Check current request fields, source coverage, execution access and credit rules before running."
  label: "Open API reference and test console"
  url: https://www.nexscope.ai/api-docs/social-youtube-video-comments?view=api&co-from=learn#online-test
---

# n8n YouTube Comments API: Find Unanswered Buyer Questions

An **n8n YouTube comments workflow** can reveal questions that a product review leaves unanswered. This guide retrieves one comments page, prepares at most 20 source-linked rows and keeps reader questions separate from the claims made in the video. It complements the existing transcript workflow instead of treating captions and comments as the same source.

{% include api-guide-entry.html %}

> **Quick answer:** Start with one manual request, validate the real supplier structure and preserve source identities before writing rows or asking AI to summarize them.

On this page: [Mapping](#field-mapping-and-implementation-checkpoint) · [Dated verification](#what-did-the-dated-verification-establish) · [Downloads](#downloads-and-verification-scope)

*Reviewed November 5, 2026. Vendor-authored guide based on public contracts, official platform documentation and the explicitly labeled checks below. A real API response does not establish a successful n8n/Make platform import, live Sheets write, AI draft or performance uplift.*

## Why analyze comments separately from a transcript?

**A transcript records the video's narration; comments record selected audience responses.** A reviewer may explain brewing performance while viewers ask about cleaning, replacement parts or regional availability. Those are different evidence types. A comment question can motivate a support article or product test, but it does not establish an official specification.

Keep the video URL and the collection order with the sample. The starter requests `order: top`. Top-ranked and newest comments can yield different questions, so a later collection using another order should not be compared as if the sampling method were unchanged. Never describe this first page as all viewer feedback.


## How do you configure the n8n starter?

**Import the inactive manual workflow and inspect it before execution.** It uses core Manual Trigger, Code, HTTP Request and a disabled Google Sheets writer. Select your own Header Auth credential on the HTTP node: header `Authorization`, value `Bearer YOUR_ACTUAL_KEY`. The exported JSON contains no credential IDs or keys.

Edit Research input, leave the writer disabled and make one deliberate API request. Review Validate and map before creating a scratch sheet with the companion headings. Configure your Google credential and destination, then enable writes only when ready. The node uses RAW cell formatting and escapes formula-like source text. It does not implement an automatic schedule, cursor loop or HTTP retry.

The 20-row review cap is downstream of collection. In-run duplicate removal does not maintain persistent history or prevent retrieval charges. A repeated append can create duplicate rows across executions. Use the task-specific history and recovery instructions below before expanding.

### Request body

`POST https://api.nexscope.ai/social/youtube/video/comments`

```json
{
  "url": "https://www.youtube.com/watch?v=0Ds0pgSLT4I",
  "order": "top"
}
```

## How does the n8n comments mapping work?

**Read the supplier array at `data.data.comments`.** The starter validates the business envelope, resource state and array shape before mapping. Retain each comment's `id`, `content`, `engagement.likes`, `engagement.replies`, `replyLevel`, `publishedTime` and `publishedTimeText` when available. The original video URL remains the source context.

The mapping can create a YouTube comment link using the video URL and comment ID, while retaining both fields for verification. A missing identity or invalid source URL stops export rather than generating an invented citation. Deduplication applies to IDs within this response only. The writer is disabled until you configure your own Google credential and scratch sheet.


## Are returned publication dates exact?

**Do not treat a derived timestamp as an exact source time.** The API describes `publishedTime` as a best-effort ISO value calculated from YouTube's relative date label. Preserve `publishedTimeText`, such as a relative year label, next to it. The apparent precision of an ISO string does not make the underlying date exact.

This matters for new-comment alerts and trend charts. A relative label can map to a different timestamp when collected on another day. Use comment ID for identity and collection time for observation history. Avoid claiming that a question was posted at a particular second or that a small date shift proves an edit or renewed activity.


{% include article-action.html placement="article-middle" %}

## How should you review questions and replies?

**Keep the evidence and the interpretation in separate columns.** Suggested reviewer fields are product version, question theme, whether the video answered it, whether another comment supplied a correction and what additional documentation is needed. Read the linked source before writing a definitive FAQ answer.

A reply count does not establish that all reply bodies were collected. Retain `replyLevel` and any reply continuation token as scope metadata. Do not silently fetch replies for every parent: that fans out paid requests and may still leave an incomplete thread. A first review can list unresolved reply context without trying to fill it in.


## How do you draft a useful next article?

**Choose a question you can answer with independent evidence.** If comments ask about a cleaning procedure, verify the current manufacturer guidance and test the steps where appropriate. Cite the comment as the source of the question, not as proof that an untested cleaning method works.

An optional AI step can group selected questions and cite comment IDs. It should preserve disagreements and leave unsupported answers unresolved. For an evidence table from the narration itself, use [the timestamped transcript guide]({{ '/guides/n8n-youtube-transcript-review-evidence/' | relative_url }}). Neither route publishes an FAQ or sends messages automatically.


## How do you handle cost, incomplete data and failures?

**Check business status, resource scope and billing separately.** HTTP success alone does not establish useful data. AVAILABLE and PARTIAL should remain distinguishable in the sheet; a partial page must not become a complete report. Reject unusable, private, restricted or unknown states before creating a speculative brief.

Each API request can consume credits. A source's supplier-price description is not necessarily the Nexscope gateway charge. Check returned `usage.billingStatus`, `usage.chargedCredits` and the account credit ledger; the retained cases below label observed prices rather than promising fixed fees. Where the wrapper includes `cost`, it describes processing time, not a credit price.

Retain a successful response before downstream writes. If delivery fails, inspect that saved evidence before repeating retrieval. Keep collection time, source date precision and pagination scope visible. Choose execution-log retention appropriate to the content. No template sends messages, posts creative or publishes an AI draft automatically.

## What did the dated verification establish?

The request for [the AeroPress Premium review](https://www.youtube.com/watch?v=0Ds0pgSLT4I), ordered by top comments, returned **20 comments**, AVAILABLE state and **10 settled credits**. The actual array was `data.data.comments`; engagement used nested `likes` and `replies`. A returned date label was “1 year ago (edited)”, with a derived ISO timestamp. That confirms why the raw relative label must remain visible. We did not fetch all replies or verify product answers.

The retained response was collected at **2026-11-05T07:36:36.268627926Z**. See the [sanitized batch evidence record]({{ '/assets/downloads/social-batch2-live-evidence-20261105.json' | relative_url }}) for scope and billing metadata. Full comments, author profiles, keys and account identifiers are not published. API tests do not establish authenticated n8n/Make execution, a successful Sheets write or an AI-generated report.


## Field mapping and implementation checkpoint

| Evidence | Field or state | Handling |
| --- | --- | --- |
| Collection | `data.data.comments` | One item per selected comment |
| Comment text / identity | `content`, `id` | Keep with original video URL |
| Interactions | `engagement.likes`, `engagement.replies` | Do not guess other key names |
| Date evidence | `publishedTime`, `publishedTimeText` | Preserve approximate-label caveat |

**Node order:** Manual Trigger → Research input → HTTP Request → Validate and map → disabled Sheets writer.


## Downloads and verification scope

- [Inactive n8n starter]({{ '/assets/downloads/n8n-youtube-comments-analysis-workflow.json' | relative_url }})
- [Request JSON]({{ '/assets/downloads/n8n-youtube-comments-analysis-request.json' | relative_url }})
- [Review sheet headings]({{ '/assets/downloads/n8n-youtube-comments-analysis-headers.csv' | relative_url }})
- [Local evidence, queue and budget helper]({{ '/assets/downloads/social-workflow-evidence-ops.py' | relative_url }})

The helper runs without API credentials and makes no network or model requests. n8n Code logic and local state behavior are checked with saved or constructed inputs as labeled. Make recipes are manual configuration notes, not authenticated scenario exports. Configure and test a scratch destination before enabling writes.

Read the related [research guide]({{ '/guides/youtube-transcript-api-mcp/' | relative_url }}) and [workflow recovery guide]({{ '/guides/paid-api-workflow-retries-deduplication/' | relative_url }}) for context.

## Sources

- [Nexscope: matching API contract](https://www.nexscope.ai/api-docs/social-youtube-video-comments?view=api) — current operation and source limits.
- [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) and [Google Sheets operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/) — request and destination configuration.

{% include api-guide-faq.html %}
