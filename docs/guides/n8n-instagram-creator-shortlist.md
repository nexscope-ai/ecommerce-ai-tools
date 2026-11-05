---
learning_topic: "agents"
related_topics: ["research"]
content_kind: "guide"
layout: "default"
title: "n8n Instagram API Workflow: Build a Creator Shortlist"
description: "Use n8n to check an Instagram profile, retrieve posts for the same handle and prepare a source-linked creator review sheet with missing metrics preserved."
permalink: "/guides/n8n-instagram-creator-shortlist/"
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
  - question: "How many Nexscope requests can the starter make?"
    answer: "A successful full run makes two requests: one profile request and one posts request. The profile gate can stop the second call."
  - question: "Does the workflow contact Instagram creators?"
    answer: "No. It prepares evidence for a reviewed shortlist and contains no outreach or publishing steps."
  - question: "Can it verify audience demographics or future sales?"
    answer: "No. Public profile and post evidence does not establish private audience composition, buyer authenticity or campaign conversion."
next_step:
  id: n8n_instagram_creator_shortlist
  intent: api-evaluation
  title: "Inspect the matching API"
  description: "Check request fields, response shape, execution access and credits before your first run."
  label: "Open API reference and test console"
  url: https://www.nexscope.ai/api-docs/social-instagram-profile?view=api&co-from=learn#online-test
---

# n8n Instagram API Workflow: Build a Creator Shortlist

An **n8n Instagram API workflow** can assemble a creator review sheet from a public profile and a bounded page of posts. This starter checks profile identity before requesting posts for the same handle. It then joins profile context to up to 20 post rows, keeping unavailable metrics visible so a shortlist is based on evidence rather than an invented creator score.

{% include api-guide-entry.html %}

> **Quick answer:** Import the inactive manual starter, select your own HTTP credential and inspect the mapped output before enabling the disabled Sheets writer. Keep source IDs, URLs, resource states and missing fields with the evidence.

*Reviewed November 5, 2026 against public contracts, official platform documentation and production-account API tests. Vendor-authored tutorial. The dated example below records real paid API observations; n8n/Make platform import, live Sheets writes and AI drafts were not executed.*

## Why check the profile before collecting posts?

**The profile establishes which account you are reviewing.** Enter a handle, optionally prefixed with `@`, rather than a profile URL. The first HTTP node sends that handle to `/instagram/profile`. Its gate checks numeric business success, an AVAILABLE or PARTIAL state, a matching returned handle and a profile that is explicitly public before allowing the posts request.

If privacy is unknown, the gate stops for review; it does not interpret the absence of a privacy field as permission to collect private content. Profile name and biography can help a reviewer identify topic fit, but they do not verify audience demographics. A similarly named account is not a safe substitute for the requested creator.


## Production-account test: what actually returned?

We made the two deliberate production-account calls for the public handle [`fellowproducts`](https://www.instagram.com/fellowproducts/). The profile response at **07:05:28 UTC on November 5, 2026** was AVAILABLE and explicitly reported `isPrivate: false`. The posts response at **07:05:54 UTC** returned **12 posts** with `hasMore: true`. Both responses reported SETTLED and 10 credits; the ledger confirmed **20 credits for these two calls**.

| Evidence | Observed value |
| --- | --- |
| Returned profile identity | `788609950`, handle `fellowproducts` |
| Follower count at collection | 345,515 |
| [One returned post](https://www.instagram.com/p/DbD5TG7O4Zu/) | Media type `REEL` |
| Its views / likes / comments at collection | 139,693 / 3,722 / 150 |

The page contained 12 posts, so a 20-row cap should not manufacture eight extra rows. The matching profile and post-author handles support identity checks; the counts do not prove audience quality, creator fees or future campaign sales. These are dated public observations, not an endorsement or a ranking. No creator was contacted.

These are observations from Nexscope Online test using an existing production account. They validate the API example, not a complete execution inside n8n. See the [sanitized live-case record]({{ '/assets/downloads/social-workflow-live-cases-20261105.json' | relative_url }}) for inputs and selected fields. Counts, availability and prices can change.

- [Download the tested instagram profile request JSON]({{ '/assets/downloads/social-live-instagram-profile-request-20261105.json' | relative_url }})
- [Download the tested instagram posts request JSON]({{ '/assets/downloads/social-live-instagram-posts-request-20261105.json' | relative_url }})

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

`POST https://api.nexscope.ai/instagram/profile`

```json
{
  "handle": "REPLACE_HANDLE",
  "trim": true
}
```

## How many API calls does this n8n workflow make?

**A successful full run deliberately makes two HTTP requests.** The first retrieves the profile; the second calls `/instagram/posts` using the validated input handle. If the profile gate fails, the second call is not reached. Each request can use Nexscope credits under current account access and billing rules, so budget the two stages separately.

The posts request uses `handle` and `trim` without a cursor. It does not retrieve every historical post. The mapping node checks the returned author handle when present and stops on a mismatch. Missing author metadata stays visible rather than being treated as verified identity. You can inspect the profile stage alone before choosing to run the full chain.


## What should the creator review sheet contain?

**Keep profile context and post evidence in different columns.** The output includes requested handle, profile source URL, follower count, post ID, post URL, caption, media type, publication date and available interaction counts. The starter also preserves profile and post resource states and dates, because the two responses can have different freshness and completeness.

Create reviewer columns for category relevance, demonstration quality, language, potential campaign use and unresolved questions. Do not convert a missing view count to zero or compare every format with a single ratio. Reels, images and carousels have different available metrics. The sheet should help someone decide what to investigate next, not assign a definitive price or predict sales.


### Field mapping checkpoint

| Evidence | Documented source | Mapping decision |
| --- | --- | --- |
| Profile identity | `data.profile.handle`, `data.profile.url` in first response | Validate before requesting posts |
| Post collection | `data.items` in second response | Up to 20 selected post rows |
| View count | `data.items[].viewCount` | Unknown stays empty, with missing-field marker |

**Node order:** Manual Trigger → Research input → Profile HTTP → Validate profile → Posts HTTP → Validate and map → disabled Sheets writer.

{% include article-action.html placement="article-middle" %}

## How do you make a shortlist without misleading rankings?

**Start with a fit rubric and review comparable examples.** For a travel mug campaign, look for actual use demonstrations, clear explanations and relevant buyer questions. A large follower count alone says little about whether the creator regularly covers commuting, hiking or homeware. Record the evidence URL for each fit decision.

If you calculate an interaction ratio later, state its numerator, denominator, media types and observation date. A follower-based public ratio is not reach or purchase conversion. Do not fill missing counts from memory or claim that this workflow detects fake followers. An optional AI assistant can summarize reviewed captions with post IDs; audience verification and campaign negotiation require separate evidence.


## What stays outside the workflow?

**Outreach, agreements and publishing remain separate decisions.** The starter contains no message sender, campaign launcher or social publishing node. Public account information should not become an unsolicited contact list. Keep only fields relevant to the shortlist and choose an execution-retention policy appropriate for the content you collect.

The Google Sheets writer appends rows if you enable it. Re-running the same creator can duplicate posts across executions. Choose a stable post-ID key for a current inventory or include observation dates for a historical research log. For a planning-oriented workflow using one posts call instead, see [Make Instagram content research]({{ '/guides/make-instagram-content-planning/' | relative_url }}).


## How do you control cost and handle failures?

**Budget API calls, platform execution and optional AI separately.** Inspect current Nexscope access and credit rules before running. In the retained November 5 tests, each API response reported 10 settled credits. That is an observed charge, not a permanent price quote. Pagination, retries and repeated manual runs can add calls. Local row or segment caps act after collection and do not define the supplier charge. An optional model request adds its own usage, and workflow-platform charging depends on your plan.

Stop on a business error, unexpected shape or unusable resource state and inspect the retained response. AVAILABLE and PARTIAL are different: label partial evidence rather than presenting it as complete. PRIVATE, RESTRICTED, NOT_FOUND, NO_TRANSCRIPT and UNKNOWN should not feed a speculative report. A failed downstream write does not justify blindly repeating the paid retrieval.

Keep returned collection dates separate from the client observation time; an older source timestamp is not fresh activity. Preserve pagination indicators when returned. API response `cost`, where present as processing time, is not a credit-price field. During these tests, Call Details showed “Not charged” for social calls while response usage and the account credit ledger showed charges. If those views disagree, reconcile the account credit ledger before assuming a call is free. Store credentials only in the platform's credential manager and choose execution-log retention appropriate to the public content you collect.

## Downloads and verification scope

- [Inactive n8n workflow JSON]({{ '/assets/downloads/n8n-instagram-creator-shortlist-workflow.json' | relative_url }})
- [Exact request body]({{ '/assets/downloads/n8n-instagram-creator-shortlist-request.json' | relative_url }})
- [Review sheet headings]({{ '/assets/downloads/n8n-instagram-creator-shortlist-headers.csv' | relative_url }})

The n8n Code logic was exercised with constructed offline fixtures for valid, partial, empty and rejected responses. Graph checks confirm manual execution, absent embedded credentials, disabled Sheets writes and no automatic HTTP retry. Those offline checks do not establish compatibility with every installed n8n version. Live API access was checked separately for the dated example; the complete n8n workflow was not executed.

Read the underlying [API and MCP research guide]({{ '/guides/instagram-api-mcp-creator-research/' | relative_url }}) for broader source interpretation. These workflow articles focus on implementation; they do not promise search rankings, citations or campaign results.

## Sources

- [Nexscope: matching API contract](https://www.nexscope.ai/api-docs/social-instagram-profile?view=api) — request and response fields reviewed for this guide.
- [n8n HTTP Request documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) — HTTP node configuration.
- [n8n Google Sheets operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/) — row operations and mapping.

{% include api-guide-faq.html %}
