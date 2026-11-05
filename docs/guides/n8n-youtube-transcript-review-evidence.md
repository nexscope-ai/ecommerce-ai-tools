---
learning_topic: "agents"
related_topics: ["research"]
content_kind: "guide"
layout: "default"
title: "n8n YouTube Transcript API: Create Timestamped Review Evidence"
description: "Build an n8n YouTube transcript workflow with source timestamps, caption-language checks and an optional Google Sheets evidence table."
permalink: "/guides/n8n-youtube-transcript-review-evidence/"
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
  - question: "Does the workflow transcribe videos without captions?"
    answer: "No. It retrieves available public captions and stops when no usable transcript is returned."
  - question: "Are YouTube segment timestamps in seconds?"
    answer: "The documented startMs and endMs fields are milliseconds. The starter converts the start time to seconds only for the video jump link."
  - question: "Is the downloadable workflow connected to an AI service?"
    answer: "No. AI extraction is an optional additional step that requires its own configuration and review."
next_step:
  id: n8n_youtube_transcript_review_evidence
  intent: api-evaluation
  title: "Inspect the matching API"
  description: "Check request fields, response shape, execution access and credits before your first run."
  label: "Open API reference and test console"
  url: https://www.nexscope.ai/api-docs/social-youtube-transcript?view=api&co-from=learn#online-test
---

# n8n YouTube Transcript API: Create Timestamped Review Evidence

An **n8n YouTube transcript workflow** can prepare a timestamped evidence table from the public captions of one product review. Nexscope retrieves the available transcript; n8n keeps each segment attached to its video URL and millisecond boundaries. The starter prepares up to 100 segments for review, with an optional Google Sheets writer that stays disabled on import.

{% include api-guide-entry.html %}

> **Quick answer:** Import the inactive manual starter, select your own HTTP credential and inspect the mapped output before enabling the disabled Sheets writer. Keep source IDs, URLs, resource states and missing fields with the evidence.

*Reviewed November 5, 2026 against public contracts, official platform documentation and production-account API tests. Vendor-authored tutorial. The dated example below records real paid API observations; n8n/Make platform import, live Sheets writes and AI drafts were not executed.*

## What does this workflow retrieve?

**It retrieves available captions, not a new transcription of the audio.** Supply one public YouTube URL and a requested language. The body uses the documented camel-case `originalAudio` option. A video without usable captions can return NO_TRANSCRIPT; stop there rather than asking a model to invent the missing narration.

The normalized transcript is under `data.transcript`. Keep its `language` and `kind` fields alongside the segments: MANUAL, AUTOMATIC or UNKNOWN describe different evidence conditions. A requested language is not proof that the returned captions are in that language. The starter validates exact language codes or an explicit alias (`English` to `en`), preserves the returned language and stops on unknown or mismatched values.


## Production-account test: what actually returned?

A production-account request for [James Hoffmann's AeroPress Premium review](https://www.youtube.com/watch?v=0Ds0pgSLT4I), with `language: en` and `originalAudio: false`, returned **626 caption segments** at **07:04:32 UTC on November 5, 2026**. The state was AVAILABLE; the settled charge was **10 credits**, checked against the credit ledger.

| Field | Actual response |
| --- | --- |
| `data.transcript.language` | `English` |
| `data.transcript.kind` | `UNKNOWN` |
| First segment boundaries | `startMs: 0`, `endMs: 1380` |
| Returned segments / starter review cap | 626 / 100 |

This exposed a real starter incompatibility: comparing `English` directly with the requested `en` rejected valid evidence. The revised mapping accepts the explicit alias `English → en` for validation and keeps the returned `English` value in the sheet. Unknown labels and genuinely different requested codes still stop for review. It does not silently label UNKNOWN captions as manual or automatic. The first 100 selected segments would cover only part of this 626-segment response; this test does not validate any product claim in the video.

These are observations from Nexscope Online test using an existing production account. They validate the API example, not a complete execution inside n8n. See the [sanitized live-case record]({{ '/assets/downloads/social-workflow-live-cases-20261105.json' | relative_url }}) for inputs and selected fields. Counts, availability and prices can change.

- [Download the tested youtube request JSON]({{ '/assets/downloads/social-live-youtube-request-20261105.json' | relative_url }})

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

`POST https://api.nexscope.ai/youtube/transcript`

```json
{
  "url": "https://www.youtube.com/watch?v=REPLACE_VIDEO_ID",
  "language": "en",
  "originalAudio": false
}
```

## How do you preserve timestamped evidence in n8n?

**Map `data.transcript.segments` only after the envelope checks.** Each segment supplies `text`, `startMs` and `endMs`. The mapping validates finite, nonnegative boundaries and rejects an end before its start. The source link points to the same video with `t` set to the floored start time in seconds; the sheet retains the original millisecond values for more precise review.

Use the evidence key `video URL + startMs + endMs` to identify a segment within the reviewed sample. The 100-segment output cap is a local review limit, not an API request parameter or a claim that the entire video has been processed. A long video can contain important caveats after the exported portion. Keep the returned and exported counts to make that limitation visible.


## How should a reviewer annotate a product claim?

**Separate the caption text, the interpreted claim and the verification decision.** Add columns for the feature discussed, the claimed benefit, the test conditions, a counterexample and a reviewer note. A caption saying “lasts all day” does not reveal a controlled battery-test protocol. Watch the linked passage before treating it as measured performance.

Segments often cut across sentences. Read neighboring segments when a negation, unit or product name is ambiguous. Automatic captions can miss model numbers and quantities; the API cannot repair those errors by making the response structured. Mark an unclear statement as unresolved. If you quote the reviewer in public content, check the original wording, context and your rights to reproduce it.


### Field mapping checkpoint

| Evidence | Documented source | Mapping decision |
| --- | --- | --- |
| Caption collection | `data.transcript.segments` | One row per selected segment |
| Timestamp boundaries | `startMs`, `endMs` on each segment | `start_ms`, `end_ms`; keep milliseconds |
| Caption provenance | `data.transcript.language`, `data.transcript.kind` | Repeat with each row |

**Node order:** Manual Trigger → Research input → HTTP Request → Validate and map → disabled Sheets writer.

{% include article-action.html placement="article-middle" %}

## Can you add AI extraction after the mapping node?

**Yes, after selecting evidence and defining a narrow output contract.** Pass the reviewed segment IDs, text and timestamps to a separately configured AI step. Ask for a table of claims with source IDs and an explicit `needs_review` flag. Ask the model to leave unsupported fields empty instead of inferring specifications from general product knowledge.

The starter itself contains no AI node and sends no content to an LLM. Adding one changes both cost and data handling. For a source-linked FAQ instead of a review table, use the [Make YouTube FAQ tutorial]({{ '/guides/make-youtube-transcript-faq/' | relative_url }}). Neither workflow should automatically publish claims extracted from an unreviewed transcript.


## How do you handle missing captions and long reviews?

**Inspect the state and scope before expanding the workflow.** A NO_TRANSCRIPT response is different from a server error, and a PARTIAL transcript is different from a complete caption set. Keep the original response in the execution history while applying a suitable retention policy. Do not retry the same paid request simply because a spreadsheet is empty.

For long reviews, increase the local review cap deliberately after checking the returned segment count. This may increase downstream rows and AI input length without changing the original API request. Preserve language, caption kind and source dates in every exported row so a later editor can understand where the evidence came from, even if the row is copied into another workbook.


## How do you control cost and handle failures?

**Budget API calls, platform execution and optional AI separately.** Inspect current Nexscope access and credit rules before running. In the retained November 5 tests, each API response reported 10 settled credits. That is an observed charge, not a permanent price quote. Pagination, retries and repeated manual runs can add calls. Local row or segment caps act after collection and do not define the supplier charge. An optional model request adds its own usage, and workflow-platform charging depends on your plan.

Stop on a business error, unexpected shape or unusable resource state and inspect the retained response. AVAILABLE and PARTIAL are different: label partial evidence rather than presenting it as complete. PRIVATE, RESTRICTED, NOT_FOUND, NO_TRANSCRIPT and UNKNOWN should not feed a speculative report. A failed downstream write does not justify blindly repeating the paid retrieval.

Keep returned collection dates separate from the client observation time; an older source timestamp is not fresh activity. Preserve pagination indicators when returned. API response `cost`, where present as processing time, is not a credit-price field. During these tests, Call Details showed “Not charged” for social calls while response usage and the account credit ledger showed charges. If those views disagree, reconcile the account credit ledger before assuming a call is free. Store credentials only in the platform's credential manager and choose execution-log retention appropriate to the public content you collect.

## Downloads and verification scope

- [Inactive n8n workflow JSON]({{ '/assets/downloads/n8n-youtube-transcript-review-evidence-workflow.json' | relative_url }})
- [Exact request body]({{ '/assets/downloads/n8n-youtube-transcript-review-evidence-request.json' | relative_url }})
- [Review sheet headings]({{ '/assets/downloads/n8n-youtube-transcript-review-evidence-headers.csv' | relative_url }})

The n8n Code logic was exercised with constructed offline fixtures for valid, partial, empty and rejected responses. Graph checks confirm manual execution, absent embedded credentials, disabled Sheets writes and no automatic HTTP retry. Those offline checks do not establish compatibility with every installed n8n version. Live API access was checked separately for the dated example; the complete n8n workflow was not executed.

Read the underlying [API and MCP research guide]({{ '/guides/youtube-transcript-api-mcp/' | relative_url }}) for broader source interpretation. These workflow articles focus on implementation; they do not promise search rankings, citations or campaign results.

## Sources

- [Nexscope: matching API contract](https://www.nexscope.ai/api-docs/social-youtube-transcript?view=api) — request and response fields reviewed for this guide.
- [n8n HTTP Request documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) — HTTP node configuration.
- [n8n Google Sheets operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/) — row operations and mapping.

{% include api-guide-faq.html %}
