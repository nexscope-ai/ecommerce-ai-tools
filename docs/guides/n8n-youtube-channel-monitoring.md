---
learning_topic: "agents"
related_topics: ["research"]
content_kind: "guide"
layout: "default"
title: "n8n YouTube Channel Monitoring: Track Newly Observed Videos"
description: "Build an n8n channel research workflow, compare video IDs with supplied history and use a local pending/acknowledged queue before scheduling writes."
permalink: "/guides/n8n-youtube-channel-monitoring/"
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
  - question: "Does newly observed mean newly published?"
    answer: "No. It means the video was absent from the history you supplied or maintained; older videos can be newly observed."
  - question: "Does the starter maintain history automatically?"
    answer: "No. The n8n starter compares an explicitly supplied seenVideoIds list. The optional local helper demonstrates persistent pending and acknowledged state."
  - question: "Does the queue guarantee exactly-once Google Sheets delivery?"
    answer: "No. Destination delivery and local acknowledgment are separate; use a stable destination key and verify uncertain writes."
next_step:
  id: n8n_youtube_channel_monitoring
  intent: api-evaluation
  title: "Inspect the matching API"
  description: "Check current request fields, source coverage, execution access and credit rules before running."
  label: "Open API reference and test console"
  url: https://www.nexscope.ai/api-docs/social-youtube-channel-videos?view=api&co-from=learn#online-test
---

# n8n YouTube Channel Monitoring: Track Newly Observed Videos

An **n8n YouTube channel monitoring workflow** can identify videos that are newly observed in your collected sample. Start with a manual channel lookup, compare returned video IDs with an explicit history and prepare a review queue. This guide separates discovery, destination delivery and acknowledgment so an unsuccessful spreadsheet write does not silently lose a video.

{% include api-guide-entry.html %}

> **Quick answer:** Start with one manual request, validate the real supplier structure and preserve source identities before writing rows or asking AI to summarize them.

On this page: [Mapping](#field-mapping-and-implementation-checkpoint) · [Dated verification](#what-did-the-dated-verification-establish) · [Downloads](#downloads-and-verification-scope)

*Reviewed November 5, 2026. Vendor-authored guide based on public contracts, official platform documentation and the explicitly labeled checks below. A real API response does not establish a successful n8n/Make platform import, live Sheets write, AI draft or performance uplift.*

## What does newly observed mean?

**It means the video ID was absent from your supplied history.** It does not prove that the video was just published. A first execution has no history and can observe many older videos. A changed result order or a previously uncollected page can also expose an older video for the first time.

The starter requests one channel with `sort: latest`. It does not guarantee an exhaustive channel archive and follows no continuation token. Preserve the channel identity, collection time and source pagination indicators. A missing result in a later first page is not evidence that the creator deleted it.


## How do you configure the n8n starter?

**Import the inactive manual workflow and inspect it before execution.** It uses core Manual Trigger, Code, HTTP Request and a disabled Google Sheets writer. Select your own Header Auth credential on the HTTP node: header `Authorization`, value `Bearer YOUR_ACTUAL_KEY`. The exported JSON contains no credential IDs or keys.

Edit Research input, leave the writer disabled and make one deliberate API request. Review Validate and map before creating a scratch sheet with the companion headings. Configure your Google credential and destination, then enable writes only when ready. The node uses RAW cell formatting and escapes formula-like source text. It does not implement an automatic schedule, cursor loop or HTTP retry.

The 20-row review cap is downstream of collection. In-run duplicate removal does not maintain persistent history or prevent retrieval charges. A repeated append can create duplicate rows across executions. Use the task-specific history and recovery instructions below before expanding.

### Request body

`POST https://api.nexscope.ai/social/youtube/channel-videos`

```json
{
  "handle": "jameshoffmann",
  "sort": "latest"
}
```

## How do you configure the n8n history input?

**Use `seenVideoIds` as an explicit local comparison input.** It is not sent to the API. The HTTP body contains only the documented channel handle and sort settings. The mapper reads `data.data.videos`, removes repeated video IDs within the page and excludes IDs already present in the supplied list.

The imported workflow starts manually and does not maintain an automatic database connection. An empty history means every valid returned video is new to that supplied history. Do not describe the JSON download as a fully deployed monitoring service. A persistent destination and acknowledgment policy must be configured before scheduling it.


## Why use a pending queue instead of marking everything seen first?

**Marking an item delivered before the destination succeeds can lose it.** A workflow can collect a video, add its ID to history, fail to write the sheet and then skip the video on the next run. Conversely, a successful append followed by a failed acknowledgment can lead to a duplicate delivery attempt.

The companion local helper keeps a SQLite pending queue. It inserts channel/video identities once, exports pending items and marks them acknowledged only when you explicitly confirm delivery. This is a bounded local demonstration, not a distributed exactly-once guarantee. A destination should also support a stable-key lookup or upsert to make re-delivery safe.


{% include article-action.html placement="article-middle" %}

## How do you test the queue without another paid request?

**Replay a saved successful response locally.** Run the helper's channel command with the saved API response and a new local state database. Export the pending rows, inspect them and rerun the same saved file. The second ingestion should not create additional queue identities.

After a verified scratch-sheet write, acknowledge only the video IDs that actually arrived. If delivery is uncertain, inspect the destination before acknowledging or appending again. The helper never calls the API or connects to Sheets. It demonstrates state handling while avoiding another paid retrieval for the same test input.


## What belongs in a channel update report?

**Keep identity, title, URL and the observation scope.** Available view counts can help prioritize reading, but a count change is not a measure of content quality or a direct sale. Preserve source date labels and do not turn an approximate publication label into an exact launch time.

Only add scheduled polling after choosing cadence, source limits, a call budget and a recovery owner. This endpoint does not establish paid-promotion status for every video. If that question requires a separate detail operation, make it a deliberate additional call. For source-linked narration evidence, use [the transcript workflow]({{ '/guides/n8n-youtube-transcript-review-evidence/' | relative_url }}).


## How do you handle cost, incomplete data and failures?

**Check business status, resource scope and billing separately.** HTTP success alone does not establish useful data. AVAILABLE and PARTIAL should remain distinguishable in the sheet; a partial page must not become a complete report. Reject unusable, private, restricted or unknown states before creating a speculative brief.

Each API request can consume credits. A source's supplier-price description is not necessarily the Nexscope gateway charge. Check returned `usage.billingStatus`, `usage.chargedCredits` and the account credit ledger; the retained cases below label observed prices rather than promising fixed fees. Where the wrapper includes `cost`, it describes processing time, not a credit price.

Retain a successful response before downstream writes. If delivery fails, inspect that saved evidence before repeating retrieval. Keep collection time, source date precision and pagination scope visible. Choose execution-log retention appropriate to the content. No template sends messages, posts creative or publishes an AI draft automatically.

## What did the dated verification establish?

The `jameshoffmann` / latest request returned **30 videos**, AVAILABLE state and **10 settled credits**. The actual collection was `data.data.videos`. One source was [video `cFdTzo6fVec`](https://www.youtube.com/watch?v=cFdTzo6fVec). Its explicit `publishDate` and relative-label-derived `publishedTime` differed, so the workflow preserves both instead of choosing an exact launch second. The n8n starter caps review output at 20; the separate local queue helper can ingest the full saved page. Only one live channel observation was collected, so change detection is demonstrated by local replay, not a second paid snapshot.

The retained response was collected at **2026-11-05T07:38:25.695322202Z**. See the [sanitized batch evidence record]({{ '/assets/downloads/social-batch2-live-evidence-20261105.json' | relative_url }}) for scope and billing metadata. Full comments, author profiles, keys and account identifiers are not published. API tests do not establish authenticated n8n/Make execution, a successful Sheets write or an AI-generated report.


## Field mapping and implementation checkpoint

| Evidence | Field or state | Handling |
| --- | --- | --- |
| Collection | `data.data.videos` | 30 returned; n8n review cap 20 |
| Identity | `id`, `channel.handle` | Validate handle when returned |
| Dates | `publishDate`, `publishedTime`, `publishedTimeText` | Retain distinct provenance |
| History | Local `seenVideoIds` | Not an API argument or connected database |

**Node order:** Manual Trigger → Research input → HTTP Request → Validate and map → disabled Sheets writer.

### Test persistent queue state locally

Save the real channel response from your execution, then run:

```shell
python social-workflow-evidence-ops.py channel --response channel-response.json --channel jameshoffmann --state channel-state.sqlite --output pending.csv
```

Replaying that saved file should add zero new identities. After confirming delivery to your chosen destination, acknowledge only the delivered IDs:

```shell
python social-workflow-evidence-ops.py ack --state channel-state.sqlite --channel jameshoffmann --ids=REPLACE_WITH_CONFIRMED_VIDEO_IDS
```

The helper does not write Sheets or check that delivery occurred. An uncertain write requires destination inspection before acknowledgment. Use the original video IDs from the saved response, separated by commas. The equals-sign form of `--ids=` also handles IDs beginning with a hyphen. CSV text can carry a protective apostrophe for spreadsheet safety; that apostrophe is not part of the original ID.


## Downloads and verification scope

- [Inactive n8n starter]({{ '/assets/downloads/n8n-youtube-channel-monitoring-workflow.json' | relative_url }})
- [Request JSON]({{ '/assets/downloads/n8n-youtube-channel-monitoring-request.json' | relative_url }})
- [Review sheet headings]({{ '/assets/downloads/n8n-youtube-channel-monitoring-headers.csv' | relative_url }})
- [Local evidence, queue and budget helper]({{ '/assets/downloads/social-workflow-evidence-ops.py' | relative_url }})

The helper runs without API credentials and makes no network or model requests. n8n Code logic and local state behavior are checked with saved or constructed inputs as labeled. Make recipes are manual configuration notes, not authenticated scenario exports. Configure and test a scratch destination before enabling writes.

Read the related [research guide]({{ '/guides/youtube-transcript-api-mcp/' | relative_url }}) and [workflow recovery guide]({{ '/guides/paid-api-workflow-retries-deduplication/' | relative_url }}) for context.

## Sources

- [Nexscope: matching API contract](https://www.nexscope.ai/api-docs/social-youtube-channel-videos?view=api) — current operation and source limits.
- [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) and [Google Sheets operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/) — request and destination configuration.
- [n8n duplicate handling](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.removeduplicates/) — in-run and history-based behavior are different.

{% include api-guide-faq.html %}
