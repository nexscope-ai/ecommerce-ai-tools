---
learning_topic: "agents"
related_topics: ["research"]
content_kind: "guide"
layout: "default"
title: "n8n Reddit API Workflow: Build a Google Sheets Research Log"
description: "Connect the Reddit API to n8n with a manual starter. Save source-linked posts to Google Sheets, preserve missing counts and control paid requests."
permalink: "/guides/n8n-reddit-api-google-sheets/"
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
  - question: "Does this download collect every Reddit result?"
    answer: "No. It makes one search request without following cursors and exports at most 20 rows. The row cap is applied after retrieval."
  - question: "Will importing the workflow write to Google Sheets?"
    answer: "No. The workflow is inactive and the Sheets node is disabled until you configure and enable it."
  - question: "Can Reddit post scores measure product demand?"
    answer: "No. Scores and comments describe observed discussions, not representative buyer demand or verified sales."
next_step:
  id: n8n_reddit_api_google_sheets
  intent: api-evaluation
  title: "Inspect the matching API"
  description: "Check request fields, response shape, execution access and credits before your first run."
  label: "Open API reference and test console"
  url: https://www.nexscope.ai/api-docs/social-reddit-search?view=api&co-from=learn#online-test
---

# n8n Reddit API Workflow: Build a Google Sheets Research Log

An **n8n Reddit API workflow** can turn one search into a Google Sheets research log with post URLs, discussion context and review decisions. This tutorial uses Nexscope to retrieve a single page of public Reddit posts, then prepares up to 20 rows for a human researcher. The downloadable workflow starts manually and keeps the Google Sheets writer disabled until you configure it.

{% include api-guide-entry.html %}

> **Quick answer:** Import the inactive manual starter, select your own HTTP credential and inspect the mapped output before enabling the disabled Sheets writer. Keep source IDs, URLs, resource states and missing fields with the evidence.

*Reviewed November 5, 2026 against public API contracts and official platform documentation. Vendor-authored tutorial. Downloads were checked offline; no paid production call, authenticated platform import, live Sheets write or AI draft was tested.*

## What should the research log answer?

**Choose one product question before searching.** “Why do travel mugs leak in a backpack?” is a useful research question because a reviewer can distinguish lid seals, closure habits and damaged parts. A broad query such as “best products” mixes unrelated intentions and makes the sheet harder to interpret. Write the question in a review column before judging any posts.

Use `filter: posts` for this starter. `sort: relevance` and `timeframe: year` define the search context; they do not create a representative sample of buyers. A discussion with a high score is a useful reading lead, not proof of product demand. Keep complaint examples alongside posts that describe successful use so the final brief does not select only negative evidence.


## How do you import and configure the n8n starter?

**Import the workflow JSON into your own n8n instance and configure it before executing.** It uses core Manual Trigger, Code, HTTP Request and Google Sheets nodes. The workflow is inactive, has no schedule and disables the Sheets writer. The HTTP nodes do not retry automatically. This is a Nexscope-authored HTTP workflow, not a claim of a native platform integration.

1. Edit **Research input** with a real input and inspect the JSON body below. Placeholder handles, video IDs and page IDs must be replaced.
2. Create an HTTP Header Auth credential: header name `Authorization`, value `Bearer YOUR_ACTUAL_KEY`. Select that credential on each Nexscope HTTP node. Keep the key out of Code nodes, request files and exported workflow JSON.
3. Leave Sheets disabled. Run manually only when ready for the stated API calls, then inspect the HTTP response and **Validate and map** output.
4. Create a scratch spreadsheet using the companion CSV headings. Select your Google credential, spreadsheet and sheet in the disabled writer; its configured cell format is RAW.
5. Enable the writer only after checking the mapped rows. Append can duplicate records on another execution; no cross-run lookup is included.

The mapping preserves zero and false values, records missing fields and escapes text that could be interpreted as a spreadsheet formula. Review your installed node versions if n8n requests a migration. The download has no saved credentials or pinned sample data.

### Request body

`POST https://api.nexscope.ai/reddit/search`

```json
{
  "keyword": "travel coffee mug leaking",
  "filter": "posts",
  "sort": "relevance",
  "timeframe": "year",
  "trim": true
}
```

## How do you configure the Reddit request in n8n?

**Edit the Research input Code node, then inspect the HTTP node.** The request goes to `/reddit/search`; the complete JSON body is below. The starter validates that the keyword is nonempty and sets no cursor. Its 20-row cap limits exported rows after the response arrives. It does not limit upstream collection or establish a credit budget.

The API returns posts in `data.items`. The mapping node checks numeric `code: 0`, an AVAILABLE or PARTIAL resource state and an actual array before creating rows. It requires each exported record to have an ID and HTTPS source URL. A malformed record stops the run for inspection rather than silently manufacturing a source. Repeated IDs inside this response are collapsed; that is only in-run deduplication.


## Which columns belong in the sheet?

**Separate retrieved evidence from your interpretation.** The starter writes post identity, URL, title, body, subreddit, publication time, score and comment count. It also records the query, resource state, source dates, pagination state and number returned. Add your own columns for `problem_theme`, `contradicting_evidence`, `reviewer` and `decision` after testing the import.

Do not replace a missing score or comment count with zero. The `missing_fields` column records absent values; a measured zero remains numeric zero. Preserve the source URL even when a title seems sufficient. If a reviewer later changes a theme, the original discussion remains accessible. Avoid placing account names or personal details into a marketing contact list just because they appear in a public discussion.


### Field mapping checkpoint

| Evidence | Documented source | Mapping decision |
| --- | --- | --- |
| Post ID and link | `data.items[].id`, `data.items[].url` | `source_id`, `source_url` |
| Discussion evidence | `title`, `body`, `subreddit` on each item | Separate source fields |
| Observed counts | `score`, `commentCount` on each item | Preserve null versus numeric zero |

**Node order:** Manual Trigger → Research input → HTTP Request → Validate and map → disabled Sheets writer.

{% include article-action.html placement="article-middle" %}

## How do you turn rows into a useful product brief?

**Review the discussion before turning it into a requirement.** For each relevant row, record the use context, the reported failure and whether a workaround was described. Read the source thread to check replies and corrections. This workflow does not fetch thread comments automatically; use the separate [Make Reddit comments guide]({{ '/guides/make-reddit-comments-buyer-needs/' | relative_url }}) when the question requires comment context.

An optional AI summary should receive only selected rows and their IDs. Ask it to group reported problems, identify disagreements and cite row IDs for every finding. A group of similar posts can justify an interview question or a prototype check. It cannot establish market size, customer prevalence or a validated product claim. Keep suggested next experiments separate from source facts.


## What happens on a second run?

**Append is not persistent deduplication.** The same post can appear in another search or another execution. Decide whether the sheet is an observation history or a current-post inventory before enabling writes. For history, use an observation key containing the source ID and execution date. For current records, add a reviewed lookup or update step using the source ID; the starter does not implement that step.

Keep `hasMore` and `nextCursor` visible. If more posts exist, the sheet is a first-page sample even when fewer than 20 rows were exported. Schedule changes, pagination and additional queries each need a fresh call budget. Test the first search with the writer disabled, inspect its usefulness and only then decide whether another query is worth running.


## How do you control cost and handle failures?

**Budget API calls, platform execution and optional AI separately.** Inspect current Nexscope access and credit rules before running. Each HTTP request can consume credits; pagination, retries and repeated manual runs can add calls. Local row or segment caps act after collection and do not define the supplier charge. An optional model request adds its own usage, and workflow-platform charging depends on your plan.

Stop on a business error, unexpected shape or unusable resource state and inspect the retained response. AVAILABLE and PARTIAL are different: label partial evidence rather than presenting it as complete. PRIVATE, RESTRICTED, NOT_FOUND, NO_TRANSCRIPT and UNKNOWN should not feed a speculative report. A failed downstream write does not justify blindly repeating the paid retrieval.

Keep returned collection dates separate from the client observation time; an older source timestamp is not fresh activity. Preserve pagination indicators when returned. API response `cost`, where present as processing time, is not a credit-price field. Store credentials only in the platform's credential manager and choose execution-log retention appropriate to the public content you collect.

## Downloads and verification scope

- [Inactive n8n workflow JSON]({{ '/assets/downloads/n8n-reddit-api-google-sheets-workflow.json' | relative_url }})
- [Exact request body]({{ '/assets/downloads/n8n-reddit-api-google-sheets-request.json' | relative_url }})
- [Review sheet headings]({{ '/assets/downloads/n8n-reddit-api-google-sheets-headers.csv' | relative_url }})

The n8n Code logic was exercised with constructed offline fixtures for valid, partial, empty and rejected responses. Graph checks confirm manual execution, absent embedded credentials, disabled Sheets writes and no automatic HTTP retry. This does not establish compatibility with every installed n8n version or prove live account access.

Read the underlying [API and MCP research guide]({{ '/guides/reddit-api-mcp-product-research/' | relative_url }}) for broader source interpretation. These workflow articles focus on implementation; they do not promise search rankings, citations or campaign results.

## Sources

- [Nexscope: matching API contract](https://www.nexscope.ai/api-docs/social-reddit-search?view=api) — request and response fields reviewed for this guide.
- [n8n HTTP Request documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) — HTTP node configuration.
- [n8n Google Sheets operations](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/sheet-operations/) — row operations and mapping.

{% include api-guide-faq.html %}
