---
layout: default
learning_topic: agents
related_topics: [visibility]
content_kind: guide
title: "Google SERP API: Search Results, Ranks & JSON Handling"
description: "Use a Google SERP API to inspect ranking pages and result types. Includes Nexscope inputs, JSON status checks and a practical search-intent review workflow."
permalink: /guides/google-serp-api/
date_published: 2026-10-28
date_modified: 2026-10-28
last_modified_at: 2026-10-28
last_reviewed: 2026-10-28
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
next_step:
  id: google_serp_api_evaluation
  intent: api_evaluation
  title: Inspect the results for one search query
  description: Review the US English desktop scope and current cost. Use one keyword to inspect result types, original ranks and missing fields before designing a larger workflow.
  label: Open the Google SERP API tester
  url: "https://www.nexscope.ai/api-docs/seo-serp?view=api#online-test"
keywords: [serp api, google serp api, google search results api, serp api json]
faq:
  - question: Is a SERP API the same as SerpApi?
    answer: "No. SERP API is a general description of an interface for search-result data. SerpApi is a specific provider. Nexscope uses its own endpoints, request fields, authentication and billing."
  - question: Does this Nexscope SERP route support every country and device?
    answer: "No. The public contract reviewed October 28, 2026 supports US, English and desktop, with a result limit from one to ten. Other scopes require separately documented capabilities."
  - question: Does a missing URL mean the site has no ranking?
    answer: "No. A URL absent from a bounded or partial result has not been observed in that returned sample. That does not prove the site is unindexed or ranks nowhere."
---

# Google SERP API: inspect search results without confusing the metrics

**Use a Google SERP API to inspect ranking pages and result formats before planning content.** This guide shows Nexscope's current request, response-status checks and a practical search-intent review. Keep query snapshots separate from domain keyword databases, search-volume estimates and recurring rank tracking.

{% include api-guide-entry.html %}

> **Quick answer:** Choose the query and supported search scope, collect a bounded result, preserve result types and original ranks, and inspect the returned URLs. A partial response stays partial. A missing target is “not observed in this sample,” not proof that it has no Google visibility.

*Reviewed October 28, 2026 by Nexscope Team against the live public reference. No chargeable SERP request or ranking experiment was run. Examples below describe inputs and application logic.*

## What does a SERP API return?

A useful search-result record identifies the query, market, language, device, collection time and returned entries. Nexscope's [Google SERP reference](https://www.nexscope.ai/api-docs/seo-serp?view=api) documents entries with `title`, `url`, `domain`, `description`, `type`, `rankGroup` and `rankAbsolute`, subject to missing-field and coverage indicators.

The phrase **SERP API** also has a brand-navigation ambiguity: [SerpApi](https://serpapi.com/organic-results) is a specific provider with its own response definitions. Its examples are not Nexscope's contract. Translate schemas deliberately when changing providers instead of replacing only the host in a code sample.

| Your starting question | Data to use |
| --- | --- |
| Which pages appear for this phrase? | Query-first SERP result |
| Which keywords appear for this competitor domain? | [Domain ranked-keyword research]({{ '/guides/competitor-keyword-traffic-api/' | relative_url }}) |
| How many monthly searches are estimated? | Keyword metrics with a named database and period |
| When does interest rise? | [Google Trends data]({{ '/guides/google-trends-api/' | relative_url }}) |
| How did my position change every day? | A monitoring system with comparable saved observations |

## What search scope does Nexscope currently support?

**The reviewed route supports US English desktop results, with one to ten returned entries.** It is a bounded request, not an assertion of unlimited search depth or worldwide coverage.

| Input | Current documented rule |
| --- | --- |
| `keyword` | Required; trimmed, at most 80 characters and ten whitespace-separated words |
| `market` | Required; `US` |
| `language` | Required; `en` |
| `device` | Optional; `desktop` |
| `limit` | Optional; default 10, minimum 1, maximum 10 |

If your application needs mobile results in another country, establish a supported route before designing the dashboard. A field with one allowed value is not a promise of arbitrary geographic targeting.

## How do you request a Google search snapshot?

The live reference documents the following route:

```text
POST https://api.nexscope.ai/seo/serp
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

This **unexecuted input example** asks a research question relevant to a product team:

```json
{
  "keyword": "portable blender for travel",
  "market": "US",
  "language": "en",
  "device": "desktop",
  "limit": 10
}
```

Review current access and credit use before sending it. The [MCP entry](https://www.nexscope.ai/mcp-map/seo-serp) provides a compatible agent route; do not assume its argument wrapper is identical to the REST payload.

## How should your application handle the JSON response?

**Check transport, business status, execution state and coverage separately.** The public contract can return HTTP 200 for business errors. Outer `code: 0` may also indicate acceptance while data is still being prepared.

| Response condition | Application behavior |
| --- | --- |
| HTTP error | Preserve the status; honor documented backoff signals |
| Nonzero outer `code` | Stop the success path and retain the error or trace identifier |
| `data.status` is `PROCESSING` | Retain `data.callId` and retrieve that request's result |
| `SUCCESS` with usable result | Validate scope and fields before presenting them |
| `PARTIAL` | Expose coverage and missing reasons alongside available entries |
| `EMPTY`, `UNKNOWN` or `FAILED` | Keep that state explicit; do not fabricate a completed ranking table |

The documented processing-result lookup is:

```text
GET https://api.nexscope.ai/seo/serp/calls/{callId}
Authorization: Bearer YOUR_API_KEY
```

Read the same accepted request instead of submitting a new POST as a status check. The reference describes stored-result retrieval as not spending credits. This does not make a new execution free. The outer `cost` field describes elapsed processing time, not the credit price; use documented usage fields and account records for billing.

## Why do absolute rank and group rank differ?

**Keep both fields and the result type.** A position among one result group and a position across the search layout need not be the same. A UI that labels both as “Google position” discards information needed to explain the result.

In a **synthetic illustration**, an entry might be first within its group while appearing after other result types in the overall layout. Display its group and absolute values as supplied. Do not renumber an organic-only filtered list and store the new row number as the original absolute rank.

| Preserve | Why it matters |
| --- | --- |
| Original result type | Distinguishes unlike groups |
| `rankAbsolute` and `rankGroup` | Avoids treating different position definitions as interchangeable |
| Original URL | Keeps the observed destination available for review |
| Collection time and scope | Makes later comparisons interpretable |
| Coverage and missing reasons | Separates absent evidence from a measured negative |

{% include article-action.html placement="article-middle" %}

## How do you turn the returned pages into a content brief?

**Review the reader task served by the pages before selecting a format.** For each relevant returned URL, record whether it is a product page, tutorial, comparison, category or discussion. Inspect the page itself; a title alone is not enough to establish its content.

A practical review sheet contains:

1. The query and exact search scope.
2. The returned URL, type and original ranks.
3. The task the page helps the reader complete.
4. The evidence or example the page provides.
5. A question your existing content leaves unanswered.
6. A specific contribution you can support with documentation or observed results.

For an ecommerce data provider, a working response-validation example may help a developer more than another broad “best tools” list. Check the existing URL inventory before creating a new page. Shared search terms do not require separate articles when the reader's task is the same.

## What is required for recurring rank monitoring?

Add scheduling, saved observations, matching rules and failure handling in your own application. Use comparable queries, locales, devices and result depth. Keep the last successful observation when a new request fails, with a stale-data label.

A domain absent from a ten-entry sample has an unknown position beyond that sample. A movement between two observations does not establish that an article edit caused the change. Measure your own search clicks and qualified product actions separately from positions.

{% include api-guide-faq.html %}
