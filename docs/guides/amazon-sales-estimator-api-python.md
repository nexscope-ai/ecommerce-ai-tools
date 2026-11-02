---
layout: default
learning_topic: agents
related_topics: [research, evidence]
content_kind: guide
title: "Amazon Sales Estimator API: Python & Daily Data Checks"
description: "Query daily Amazon sales estimates with Python, preserve ASIN and variant scope, flag missing dates and export CSV without confusing estimates with real orders."
permalink: /guides/amazon-sales-estimator-api-python/
date_published: 2026-11-02
date_modified: 2026-11-02
last_modified_at: 2026-11-02
last_reviewed: 2026-11-02
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
next_step:
  id: amazon_daily_sales_python
  intent: api_evaluation
  title: Inspect daily estimates for one ASIN
  description: Review the market, past date range, parent or variant scope and current credits. Check coverage before using a returned series in research.
  label: Open Amazon Sales Estimates in the playground
  url: "https://www.nexscope.ai/api-docs/amazon-sales-estimates?view=api#online-test"
keywords: [amazon sales estimator api, amazon sales api python, amazon sales estimator, amazon daily sales estimates]
faq:
  - question: Is an Amazon sales estimate the same as an actual order count?
    answer: "No. This interface returns estimates. Actual account order metrics require an appropriately authorized seller data source with matching definitions and date scope."
  - question: Can missing dates be replaced with zero sales?
    answer: "No. A missing date is missing coverage, while an explicit estimatedUnitsSold value of zero is a returned estimate. The starter preserves zero and records missing dates separately."
  - question: Can I add parent and child ASIN estimates together?
    answer: "Not without verifying the provider's aggregation scope. Parent and variant records may overlap. Preserve relationship fields and avoid summing records that could count the same demand twice."
---

# Amazon sales estimator API: Python and daily data checks

**Query a bounded past date range for one ASIN, then validate the dates and listing scope before interpreting estimated sales.** This Amazon sales estimator API tutorial exports a daily table with raw evidence and a coverage manifest. It keeps missing days separate from zero estimates and avoids adding overlapping parent and child records.

{% include api-guide-entry.html %}

> **Quick answer:** Use an ASIN, marketplace and past date range to request daily estimates. Save the response, verify the returned ASIN and dates, and retain variant relationships. Treat the result as a research signal. It is neither audited seller orders nor a forecast of what your next launch will sell.

*Reviewed November 2, 2026 by Nexscope Team. The script is checked using synthetic responses offline. No chargeable production run, order reconciliation or estimator accuracy study was conducted for this article.*

## How do sales estimates differ from BSR and actual orders?

**They answer different questions.** A sales estimate describes inferred units for a defined scope and period. BSR describes relative sales position in a category. Authorized order metrics describe account activity under their own definitions. Mixing them into one “sales” column hides the source and changes what the result can support.

Amazon's [BSR explanation](https://sell.amazon.com/blog/amazon-best-sellers-rank) describes category-relative rankings influenced by sales history. Its [Selling Partner Sales API](https://developer-docs.amazon/sp-api/docs/sales-api) documents aggregated order metrics for authorized sellers. Neither establishes the accuracy of a third-party estimate for an arbitrary competitor ASIN.

| Data | Useful question | What it cannot establish alone |
| --- | --- | --- |
| Daily estimated units | How does the provider's demand signal change over time? | Exact competitor orders |
| BSR | Where does this product sit relative to others in its category? | A universal rank-to-units conversion |
| Authorized order metrics | What happened in the authorized seller account? | Another seller's private performance |
| Last known price | What price context accompanies the estimate? | Actual transaction revenue or profit |

Use this tutorial for a small research pilot, an evidence table or integration validation. Use an appropriate authorized source for account reconciliation, tax records or operational order reporting. The existing [price-history guide]({{ '/amazon-price-history/' | relative_url }}) covers price and ranking context; this page focuses on the daily estimate export.

## How do you query the Amazon sales estimator API in Python?

**Start with one ASIN and a few completed days.** Download [commerce-evidence-export.py]({{ '/assets/downloads/commerce-evidence-export.py' | relative_url }}) and use Python 3.10 or later. Save this illustrative input as `amazon-sales-request.json`; replace the ASIN and dates with your selected research scope:

```json
{
  "marketplace": "us",
  "asin": "B072MQ5BRX",
  "startDate": "2026-10-20",
  "endDate": "2026-10-22"
}
```

Set your Nexscope Key locally, using a masked prompt in PowerShell 7 if available:

```powershell
$env:NEXSCOPE_API_KEY = Read-Host 'Nexscope API key' -MaskInput
```

Execute one request:

```bash
python commerce-evidence-export.py amazon-sales amazon-sales-request.json --output amazon-sales-run
```

Inspect the [current Sales Estimates reference](https://www.nexscope.ai/api-docs/amazon-sales-estimates?view=api) and credits before running. The endpoint requires a marketplace, ASIN and date bounds, with the end date before the current date. The starter further limits the range to 31 days to make coverage review manageable; that is a code choice, not an advertised provider maximum.

Each live execution makes one POST. It does not retry, fill historical gaps or request additional ASINs automatically. A new output directory is required. The sample input is not evidence that estimates are available for that ASIN and period.

{% include article-action.html placement="article-middle" %}

## What does the script check before exporting?

**It validates the response contract used by this starter and stops on ambiguous scope.** A successful HTTP request is not enough: the script checks the business code, nested arrays, returned ASIN, duplicate dates and requested range before writing `rows.csv`. It preserves raw JSON even when interpretation fails.

The date and units checks include:

```python
day = date.fromisoformat(point["date"])
if not start <= day <= end or point["date"] in seen:
    raise ValueError("Duplicate or out-of-range returned date")
units = point.get("estimatedUnitsSold")
if units is not None and (type(units) is not int or units < 0):
    raise ValueError("Estimated units must be a nonnegative integer or missing")
```

The complete download defines `date`, `start`, `end` and `seen`. It expects the documented `salesEstimateList` and each record's `dailyEstimates`. A different or expanded response should be reviewed before adapting the parser, rather than forced into this example's assumptions.

Read these outputs together:

| File | What to inspect |
| --- | --- |
| `response.json` | Original estimate records and fields excluded from the table |
| `rows.csv` | One returned day per row, ASIN, marketplace and relationship context |
| `manifest.json` | Request scope, export status, row count and missing dates |

Client observation time is not the date the provider refreshed every estimate. CSV also loses types. Blank exported values are listed in `missing_fields`; the JSON distinguishes absent fields from explicit nulls.

## How should you handle missing dates and parent ASINs?

**Keep gaps and relationships visible.** Do not invent zero-sales days to make a chart continuous. Likewise, do not sum parent and child estimates without verifying whether their underlying scope overlaps. A tidy spreadsheet should make uncertainty easier to see, not erase it.

**Synthetic example:** request October 20–22, receive October 20 with estimated units `0`, October 22 with `4`, and no October 21. The exported table preserves `0` and `4`; the manifest lists October 21 as missing. Those two values do not establish a complete three-day total. This is an offline conversion example, not observed demand.

The script retains `parentAsin`, `isParent`, `isVariant`, `isStandalone` and `variants` when returned. It rejects a result for a different ASIN so you can inspect the scope before flattening it. It does not infer that a child sold a fixed proportion of its parent's units or that all siblings are present.

## How accurate are Amazon sales estimators?

**This tutorial cannot supply an accuracy percentage.** A functioning API or agreement between two estimates does not establish truth. A defensible accuracy study needs permission to use a real order baseline, comparable dates, marketplace, product/variant scope and a consistent definition of units.

For a future pilot, predefine the sample and evaluation period. Record which days have both an estimate and a baseline, and publish missing coverage separately from error on matched days. Explain how cancellations, returns, parent aggregation and time zones are handled. Report results only for that evaluated scope, with enough methodology for someone else to review them.

Do not estimate revenue simply by multiplying every day's units by the last known price and calling it actual sales. Transaction prices, discounts, taxes, currency and item scope may differ. An estimate can help decide what to investigate next; it does not establish a purchasing or inventory decision by itself.

## Can you inspect a saved response without another API call?

**Yes. Use offline mode with the same request file and a new output directory.** It checks the response against the supplied scope without a Key or network request:

```bash
python commerce-evidence-export.py amazon-sales amazon-sales-request.json --from-response amazon-sales-run/response.json --output amazon-sales-offline
```

Offline export cannot prove current service availability or estimate quality. After a timeout, inspect usage history before repeating the POST. For a broader research acceptance plan, use the [API pilot guide]({{ '/amazon-product-research-api-pilot/' | relative_url }}).

## Frequently asked questions

### Is an Amazon sales estimate the same as an actual order count?

No. The interface returns estimates. Use an appropriately authorized source with aligned scope when actual account order metrics are required.

### Can missing dates be replaced with zero sales?

No. Preserve an explicit returned zero and list missing dates separately. Do not draw a continuous series or compute a complete-period total from incomplete coverage.

### Can I add parent and child ASIN estimates together?

Only after verifying nonoverlapping aggregation scope. Keep the relationship fields and avoid counting the same demand twice.
