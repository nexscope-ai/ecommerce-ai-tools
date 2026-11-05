---
learning_topic: "agents"
related_topics: ["research"]
content_kind: "guide"
layout: "default"
title: "n8n Meta Ad Library API: Create a Creative Review Queue"
description: "Use n8n and the Meta Ad Library API to save a bounded search checkpoint, inspect the supplier payload and build a reviewed creative evidence queue."
permalink: "/guides/n8n-meta-ad-library-creative-review/"
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
  - question: "Does the starter export individual Meta ads?"
    answer: "No. It creates one review-metadata row and retains the supplier response in the HTTP execution output for schema inspection."
  - question: "Which field contains the supplier payload?"
    answer: "The documented wrapper places the supplier object under data.data. Its inner ad collection must be inspected before configuring an iterator."
  - question: "Can an active or long-running ad prove profitability?"
    answer: "No. Public activity and creative evidence do not establish spend, conversions, ROAS or profit."
next_step:
  id: n8n_meta_ad_library_creative_review
  intent: api-evaluation
  title: "Inspect the matching API"
  description: "Check request fields, response shape, execution access and credits before your first run."
  label: "Open API reference and test console"
  url: https://www.nexscope.ai/api-docs/social-facebook-ad-library-search-ads?view=api&co-from=learn#online-test
---

# n8n Meta Ad Library API: Create a Creative Review Queue

An **n8n Meta Ad Library API workflow** can prepare a creative-research checkpoint from one public ad search. The important first step is inspecting the returned supplier payload before mapping individual ads. This starter writes one review-metadata item and keeps the raw response in the HTTP execution output; it does not pretend that every Meta response has a normalized `data.items` array.

{% include api-guide-entry.html %}

> **Quick answer:** Import the inactive manual starter, select your own HTTP credential and inspect the mapped output before enabling the disabled Sheets writer. This Meta starter exports review metadata; individual ads require a verified supplier mapping.

*Reviewed November 5, 2026 against public contracts, official platform documentation and production-account API tests. Vendor-authored tutorial. The dated example below records real paid API observations; n8n/Make platform import, live Sheets writes and AI drafts were not executed.*

## What does the downloadable workflow produce?

**It produces one search-review record, not one row per ad.** The record contains the query, country, requested activity state, returned resource state, execution ID and an explicit `mapping_required` flag. The HTTP node retains the actual response for inspection. This lets a reviewer associate a source payload with the exact search conditions before configuring creative extraction.

The distinction matters because this API wraps the supplier result under `data.data`. The public contract describes that inner value as an object, rather than promising a universal ads array. Guessing `data.items` or `data.data.ads` would create a workflow that can appear to succeed while collecting no usable evidence. The starter stops on an invalid wrapper and leaves ad-level mapping to a verified sample.


## Production-account test: what actually returned?

The exact `insulated travel mug` / US / EN / ACTIVE request returned AVAILABLE at **07:12:23 UTC on November 5, 2026**. Its supplier object contained **30 records at `data.data.searchResults`**, `searchResultsCount: 130` and a continuation cursor. The settled response charge was **10 credits**, confirmed in the account ledger.

| Observed field | Meaning for this sample |
| --- | --- |
| `data.data.searchResults` | Actual array path in this response |
| `ad_archive_id`, `page_id`, `page_name`, `url` | Available identity/source fields on returned records |
| `snapshot.cards`, `snapshot.body` | Creative structure to inspect, not assumed flat text |
| 30 returned / 130 supplier-reported | This response was not the whole reported collection |

One returned advertiser identity was `Swig Life`, page ID `334164846957933`; we used that observed ID for the separate company-ad example in the Make guide. Search relevance still needs review: a match does not establish that every advertiser is a direct competitor. The downloadable n8n starter deliberately remains a metadata checkpoint. If you add extraction, validate this observed array path against your own response; it is not a universal wrapper guarantee.

These are observations from Nexscope Online test using an existing production account. They validate the API example, not a complete execution inside n8n. See the [sanitized live-case record]({{ '/assets/downloads/social-workflow-live-cases-20261105.json' | relative_url }}) for inputs and selected fields. Counts, availability and prices can change.

- [Download the tested meta search request JSON]({{ '/assets/downloads/social-live-meta-search-request-20261105.json' | relative_url }})

These request files contain the real public inputs used for the dated case, without credentials. Executing them again can consume credits.

## How do you import and configure the n8n starter?

**Import the workflow JSON into your own n8n instance and configure it before executing.** It uses core Manual Trigger, Code, HTTP Request and Google Sheets nodes. The workflow is inactive, has no schedule and disables the Sheets writer. The HTTP nodes do not retry automatically. This is a Nexscope-authored HTTP workflow, not a claim of a native platform integration.

1. Edit **Research input** with a real input and inspect the JSON body below. Placeholder handles, video IDs and page IDs must be replaced.
2. Create an HTTP Header Auth credential: header name `Authorization`, value `Bearer YOUR_ACTUAL_KEY`. Select that credential on each Nexscope HTTP node. Keep the key out of Code nodes, request files and exported workflow JSON.
3. Leave Sheets disabled. Run manually only when ready for the stated API calls, then inspect the HTTP response and **Validate and map** output.
4. Create a scratch spreadsheet using the companion CSV headings. Select your Google credential, spreadsheet and sheet in the disabled writer; its configured cell format is RAW.
5. Enable the writer only after checking the mapped rows. Append can duplicate records on another execution; no cross-run lookup is included.

The mapping preserves zero and false values, records missing fields and escapes text that could be interpreted as a spreadsheet formula. Review your installed node versions if n8n requests a migration. The download has no saved credentials or pinned sample data.

### Request body

`POST https://api.nexscope.ai/social/facebook/adLibrary/search/ads`

```json
{
  "query": "insulated travel mug",
  "country": "US",
  "language": "EN",
  "status": "ACTIVE",
  "trim": true
}
```

## How do you define a bounded ad search?

**Use a product phrase, country and activity state deliberately.** This starter sends one query with country `US`, language `EN`, status `ACTIVE` and `trim: true`. Active is a visibility filter, not a performance rating. A search for “insulated travel mug” can help a reviewer compare promises, demonstrations and objections addressed in public creative.

No cursor is followed and no ad detail or transcription request is triggered. Adding those stages can create additional charges and more data to review. Inspect current access and pricing before expanding. If your starting point is a known advertiser rather than a keyword, use the [Make company-ad snapshot guide]({{ '/guides/make-meta-ad-library-competitor-snapshot/' | relative_url }}) and a verified advertiser page ID.


## How do you map actual creative evidence?

**Open the successful HTTP response and identify its real record collection.** Confirm the array path, ad identity fields, advertiser identity, source links and creative variants. An ad can have several cards or variants; one visible body field may not describe all of them. Field naming can differ between search and detail responses, so record the path you tested rather than copying a guessed expression.

Only after that inspection should you add an extraction Code node or loop. Keep an ad ID and public source URL for every creative observation. If a source link or creative text is unavailable, leave it unresolved. The companion header file is for review metadata, not an advertised complete creative-export schema. The starter's Sheets output should not be presented as a finished competitor report.


### Field mapping checkpoint

| Evidence | Documented source | Mapping decision |
| --- | --- | --- |
| Supplier object | `data.data` | Inspect in HTTP execution output |
| Resource state | `data.resourceStatus` | One review-metadata row |
| Ad array and identity | Not standardized by the wrapper | Verify before adding extraction |

**Node order:** Manual Trigger → Research input → HTTP Request → Validate and map → disabled Sheets writer.

{% include article-action.html placement="article-middle" %}

## What should a creative reviewer record?

**Record the visible promise, proof format and audience situation.** A useful reviewed table might contain ad ID, advertiser, country, observed date, hook, demonstration type, objection handled and the evidence URL. Label each row with the actual creative variant examined. A reviewer can then compare messages without treating repeated variants as independent competitors.

Activity status and apparent longevity do not establish spend, conversions or profitability. A competitor may be testing, running a narrow campaign or using an ad for a reason not visible publicly. Keep your hypothesis—such as testing a clearer leak demonstration—in a separate column from the observed creative. Do not copy a competitor's assets into your campaign or use this workflow to access private ad-account reporting.


## When should you add an AI review stage?

**After extraction is verified and source IDs are preserved.** An optional AI module can classify a selected creative sample by promise or demonstration style. Supply only the reviewed fields, require source IDs in the output and ask it to identify missing evidence. Do not ask it to infer ROAS, budget or a winning ad from an activity flag.

The starter includes no LLM request, ad launcher or social publisher. Keep that boundary visible when sharing the workflow with a team. The most useful first deliverable is a correctly scoped review queue with a verified mapping plan, rather than a polished automatic report whose underlying collection path was never checked.


## How do you control cost and handle failures?

**Budget API calls, platform execution and optional AI separately.** Inspect current Nexscope access and credit rules before running. In the retained November 5 tests, each API response reported 10 settled credits. That is an observed charge, not a permanent price quote. Pagination, retries and repeated manual runs can add calls. Local row or segment caps act after collection and do not define the supplier charge. An optional model request adds its own usage, and workflow-platform charging depends on your plan.

Stop on a business error, unexpected shape or unusable resource state and inspect the retained response. AVAILABLE and PARTIAL are different: label partial evidence rather than presenting it as complete. PRIVATE, RESTRICTED, NOT_FOUND, NO_TRANSCRIPT and UNKNOWN should not feed a speculative report. A failed downstream write does not justify blindly repeating the paid retrieval.

Keep returned collection dates separate from the client observation time; an older source timestamp is not fresh activity. Preserve pagination indicators when returned. API response `cost`, where present as processing time, is not a credit-price field. During these tests, Call Details showed “Not charged” for social calls while response usage and the account credit ledger showed charges. If those views disagree, reconcile the account credit ledger before assuming a call is free. Store credentials only in the platform's credential manager and choose execution-log retention appropriate to the public content you collect.

## Downloads and verification scope

- [Inactive n8n workflow JSON]({{ '/assets/downloads/n8n-meta-ad-library-creative-review-workflow.json' | relative_url }})
- [Exact request body]({{ '/assets/downloads/n8n-meta-ad-library-creative-review-request.json' | relative_url }})
- [Review sheet headings]({{ '/assets/downloads/n8n-meta-ad-library-creative-review-headers.csv' | relative_url }})

The n8n Code logic was exercised with constructed offline fixtures for valid, partial, empty and rejected responses. Graph checks confirm manual execution, absent embedded credentials, disabled Sheets writes and no automatic HTTP retry. Those offline checks do not establish compatibility with every installed n8n version. Live API access was checked separately for the dated example; the complete n8n workflow was not executed.

Read the underlying [API and MCP research guide]({{ '/guides/meta-ad-library-api-mcp-creative-research/' | relative_url }}) for broader source interpretation. These workflow articles focus on implementation; they do not promise search rankings, citations or campaign results.

## Sources

- [Nexscope: matching API contract](https://www.nexscope.ai/api-docs/social-facebook-ad-library-search-ads?view=api) — request and response fields reviewed for this guide.
- [n8n HTTP Request documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) — HTTP node configuration.
- [n8n Google Sheets operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/) — row operations and mapping.

{% include api-guide-faq.html %}
