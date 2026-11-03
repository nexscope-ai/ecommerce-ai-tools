---
learning_topic: visibility
content_kind: guide
layout: default
title: "Keyword Search Volume API: Python to CSV"
description: "Export keyword search volume with Python. Check processing states, retrieve stored results and preserve missing metrics in a CSV for content planning."
permalink: /ecommerce-trends/seo-keyword-api-content-plan/
last_reviewed: 2026-11-03
date_published: 2026-10-20
date_modified: 2026-11-03
last_modified_at: 2026-11-03
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
keywords: [keyword search volume api, keyword research api, keyword data api, keyword metrics python]
next_step:
  id: seo_keyword_metrics_api
  title: Inspect keyword metrics for a real content decision
  description: Open the current SEO keyword endpoint, review its request and response fields, and use the feature-page authentication flow.
  label: View SEO Keyword Metrics API
  url: "https://www.nexscope.ai/api-docs/seo-keyword-metrics?view=playground&co-from=learn&content=seo-keyword-api-content-plan&signup_module=api-docs&signup_entry=play"
image: /assets/images/ecommerce-product-page-seo-audit-1440w.webp
image_small: /assets/images/ecommerce-product-page-seo-audit-720w.webp
image_alt: SEO keyword evidence connected to a prioritized ecommerce content plan
image_caption: "Illustration: connect keyword evidence, page intent, and the next measurable product action."
suppress_article_help: true
faq:
  - question: "Does missing search volume mean zero searches?"
    answer: "No. Missing data, a NO_COVERAGE item or an omitted input is not a measured zero. Preserve the returned state and missing reasons."
  - question: "Should I rerun a processing keyword request?"
    answer: "Use the returned callId to retrieve the stored result. The starter makes one explicit lookup and does not automatically repeat the paid run."
  - question: "Were these keyword metrics collected in a live test?"
    answer: "No paid keyword request was made for this update. The code is verified with synthetic offline responses; configure the sample request for your own decision."
---

# Keyword search volume API: export a reviewed CSV with Python

**Use a keyword search volume API to check a prepared list, then export the returned metrics with their scope and missing-data information.** This guide provides a Python starter for Nexscope Keyword Metrics: one request, the original JSON, a CSV and a manifest. It also explains how to retrieve an existing processing result without starting another paid run.

{% include api-guide-entry.html %}

> **Quick answer:** Prepare 1–20 US English phrases, run the starter once, and inspect both the envelope `code` and `data.status`. Export completed results for review; use the returned `callId` for a later result lookup when the status is `PROCESSING`. An unavailable metric is not zero, and monthly search volume is not a forecast of clicks to your page.

## Which keyword API fits your task?

**Use Keyword Metrics for a list you already have, and a separate discovery endpoint when you need ideas.** This distinction keeps a content plan from treating a suggestion as verified demand.

| Starting point | Next operation | What to check |
| --- | --- | --- |
| One seed phrase | [Keyword Expansion](https://www.nexscope.ai/api-docs/seo-keyword-expand?view=api) | Suggested phrases and their relevance |
| A prepared list | [Keyword Metrics](https://www.nexscope.ai/api-docs/seo-keyword-metrics?view=api) | Available volume, difficulty, advertising metrics and missing fields |
| Several seeds for ideas | [Category-based Keyword Ideas](https://www.nexscope.ai/api-docs/seo-keyword-ideas?view=api) | Supported inputs and categories |
| A competitor domain | [Keyword ranking API guide]({{ '/guides/competitor-keyword-traffic-api/' | relative_url }}) | Returned ranking terms and URLs |

The current Keyword Metrics reference supports `market: US` and `language: en`, with 1–20 phrases. Each phrase is limited to 80 characters and ten whitespace-separated words. The downloadable starter rejects duplicate normalized inputs so a repeated phrase cannot create an ambiguous join. It does not split a large list into repeated paid requests.

For a browser-based research task, use the [SEO Keyword Planner guide]({{ '/seo-keyword-planner/' | relative_url }}). The workflow below is for developers who want the returned data in their own review sheet.

## How do you query search volume with Python?

**Download the starter and request example, set your key locally, then execute one bounded request.** The script uses Python 3.10 or later and the standard library.

Save [research-api-export.py]({{ '/assets/downloads/research-api-export.py' | relative_url }}) and [keyword-metrics-request.json]({{ '/assets/downloads/keyword-metrics-request.json' | relative_url }}) in the same working directory. The request contains:

```json
{
  "keywords": ["keyword research api", "keyword search volume api"],
  "language": "en",
  "market": "US"
}
```

These are illustrative inputs, not a report of current search demand. Replace them with the distinct phrases you need for one decision. In PowerShell 7, set your key through a masked prompt:

```powershell
$env:NEXSCOPE_API_KEY = Read-Host 'Nexscope API key' -MaskInput
```

Run:

```bash
python research-api-export.py keywords keyword-metrics-request.json --output keyword-run-01
```

The live mode sends one POST to `https://api.nexscope.ai/seo/keywordMetrics`. Review the current documentation, access requirements and estimate before running. The output directory must be new; this prevents overwriting earlier evidence and stops an accidental repeat with the same directory before a network request is sent.

The script saves the original body as `response.json` and records the endpoint, input and client observation time in `manifest.json`. It does not print or save your Authorization header. Keep those files in your own working environment rather than committing research responses to a public repository.

## What happens if the keyword request is still processing?

**Retrieve the existing result using its returned identifier. Do not repeat the POST merely because a completed table has not appeared.** A successful HTTP response and outer `code: 0` can mean acceptance rather than completion.

| `data.status` | Starter behavior | Your next step |
| --- | --- | --- |
| `SUCCESS` or `PARTIAL` with a valid result | Export rows and preserve coverage | Inspect the CSV and missing fields |
| `EMPTY` with a valid empty result | Preserve the empty coverage | Check whether the input has usable coverage |
| `PROCESSING` | Save response and identifier; no CSV | Query the same result later |
| `UNKNOWN`, `FAILED` or an unrecognized state | Preserve the response; no CSV | Inspect the reason before deciding what to do |

For an existing keyword call, copy the UUID from `data.callId` and run a separate lookup:

```bash
python research-api-export.py keywords keyword-metrics-request.json --call-id YOUR_CALL_UUID --output keyword-result-01
```

This sends one GET to `/seo/keywordMetrics/calls/{callId}`. The [current API reference](https://www.nexscope.ai/api-docs/seo-keyword-metrics?view=api) describes this lookup as reading the stored result without spending credits. Use the same account key and the original request file. If it is still processing, inspect the saved status and look it up later; the starter does not poll or automatically start a replacement request. An `EMPTY` response without a usable result object also stops for inspection.

{% include article-action.html placement="article-middle" %}

## How do you interpret the exported CSV?

**Match records by their returned `inputKeyword`, preserve the request scope and leave missing metrics blank.** The starter does not join records by their position in the returned array or guess whether `inputIndex` is zero-based or one-based.

| CSV field | How to use it |
| --- | --- |
| `inputKeyword`, `normalizedKeyword`, `inputIndex` | Retain the requested phrase and returned identity fields |
| `itemStatus` | Distinguish available data, no coverage and an input not returned |
| `searchVolume` | Compare the provider's volume estimate within the stated market |
| `keywordDifficulty` | Use as a provider-defined screening signal |
| `competition`, `competitionLevel`, `cpcUsd` | Inspect the documented advertising metrics separately |
| `monthlySearches` | Retain the returned monthly observations as JSON |
| `dataUpdatedAt`, `missing`, `missing_fields` | Review freshness and gaps before making a decision |

If a requested input is absent from the result, the script adds a clearly labeled `NOT_RETURNED` row and lists the omission in the manifest. It preserves numeric zero and records field absence separately. Returned phrases that cannot be matched, or duplicate returned labels, stop the export for inspection.

Do not add volume estimates for close variants and call the sum an article's expected traffic. The same page can answer multiple queries, searchers can choose other results, and demand metrics do not establish ranking or click-through rate. The CSV is evidence for a page brief, not an acquisition report.

## How do you turn keyword data into an article decision?

**Group by search intent first, then choose an existing page or a genuinely different task.** A prepared list can include informational, comparison and implementation terms, even when the phrases share the same product noun.

For each candidate, write the question the reader needs answered, the page already covering it, the missing evidence and the closest next product action. A phrase about search-volume integration belongs with an API example; a phrase about discovering ideas may fit the browser planner. Keep competitor rankings, Google Trends interest and search-volume estimates as separate evidence sources.

If the task is to put product data into a spreadsheet, the [n8n Amazon-to-Sheets tutorial]({{ '/guides/n8n-amazon-google-sheets/' | relative_url }}) demonstrates a different implementation intent. For the relationship between interest and volume, read the [Google Trends API guide]({{ '/guides/google-trends-api/' | relative_url }}).

## Frequently asked questions

### Does missing search volume mean zero searches?

No. Missing data, a `NO_COVERAGE` item or an omitted input is not a measured zero. Preserve the returned state and missing reasons rather than inventing a value.

### Should I rerun a processing keyword request?

Use the returned `callId` to retrieve the stored result. The starter makes one explicit lookup and does not automatically repeat the paid run.

### Were these keyword metrics collected in a live test?

No paid keyword request was made for this update. The downloadable code is verified with labeled synthetic responses; the sample request is for you to configure and run.
