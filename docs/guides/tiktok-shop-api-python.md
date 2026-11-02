---
layout: default
learning_topic: agents
related_topics: [research]
content_kind: guide
title: "TikTok Shop API Python: Batch Products to Checked CSV"
description: "Look up TikTok Shop product IDs with Python, match returned records by ID, flag missing products and export a CSV with regions, prices and sales windows."
permalink: /guides/tiktok-shop-api-python/
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
  id: tiktok_batch_python_export
  intent: api_evaluation
  title: Inspect a small batch of known product IDs
  description: Review the batch inputs and current credits. Keep the returned IDs and regions beside the original shortlist before using any product metrics.
  label: Open TikTok Batch Product Detail in the playground
  url: "https://www.nexscope.ai/api-docs/tiktok-batch-product-detail?view=api#online-test"
keywords: [tiktok shop api python, tiktok shop scraper, tiktok shop product data api, tiktok shop product scraper]
faq:
  - question: Is this TikTok Shop API tutorial an official seller integration?
    answer: "No. It uses Nexscope's product-research API and a Nexscope Key. It does not authorize TikTok seller-account changes, private orders or payouts."
  - question: Should I match returned products to inputs by array position?
    answer: "No. Match by productId and keep source market context. The starter reports missing requested IDs and stops on duplicate or unrequested returned IDs rather than silently joining by position."
  - question: Why does the starter accept only five product IDs?
    answer: "Five is a deliberate starter limit for review and spend control, not the service's maximum. The public reference reviewed November 2, 2026 documents larger batches. Evaluate current access, cost and coverage before increasing the limit."
---

# TikTok Shop API in Python: batch products to a checked CSV

**Look up known TikTok Shop product IDs, match the response by ID and record what did not return.** This TikTok Shop API Python tutorial turns a small Nexscope batch request into raw JSON, a CSV and a coverage manifest. It keeps regions and sales windows visible instead of treating every returned number as comparable.

{% include api-guide-entry.html %}

> **Quick answer:** Start with product IDs from a defined market shortlist. Send one small batch, validate the business result and compare returned IDs with requested IDs. Keep missing records explicit, inspect each returned region and preserve metric windows. A partial batch is evidence about returned products, not proof that missing products do not exist.

*Reviewed November 2, 2026 by Nexscope Team. The downloadable code is checked with synthetic offline responses. No paid production request or product-performance experiment was run for this article.*

## When is a batch product API useful?

**Use it after you have a shortlist.** Batch detail helps an analyst inspect a few candidates, a developer prototype a research export or a team enrich known product records. It does not itself discover every product in a category, establish a complete leaderboard or manage a seller account.

If you need candidates first, the [existing product-and-creator workflow]({{ '/ecommerce-trends/tiktok-product-creator-research-api/' | relative_url }}) explains the broader research process. Nexscope's [Product Discovery reference](https://www.nexscope.ai/api-docs/tiktok-product-discovery?view=api) documents a separate query operation. Do not carry that operation's fields into another endpoint because the names look related.

This guide uses the [Batch Product Detail contract](https://www.nexscope.ai/api-docs/tiktok-batch-product-detail?view=api). It is a Nexscope interface, not an official TikTok seller authorization tutorial. For a broad comparison of the platform's research routes, use the [TikTok Shop API guide]({{ '/guides/tiktok-shop-api-guide/' | relative_url }}).

## How do you run the Python batch request?

**Use Python 3.10 or later and a short ID-only request.** Download [commerce-evidence-export.py]({{ '/assets/downloads/commerce-evidence-export.py' | relative_url }}) and save `tiktok-request.json` beside it. Replace the following documentation-style IDs with candidates you have actually selected:

```json
{
  "productIds": [
    "1729382310407603945",
    "1729382310407603946"
  ]
}
```

Keep IDs as strings. Converting long identifiers to spreadsheet numbers or JavaScript floating-point values can change them. Preserve the original shortlist's market and collection time in your research notes.

Set your Key in the terminal environment. PowerShell 7 users can enter it through a masked prompt:

```powershell
$env:NEXSCOPE_API_KEY = Read-Host 'Nexscope API key' -MaskInput
```

Execute one batch:

```bash
python commerce-evidence-export.py tiktok-batch tiktok-request.json --output tiktok-batch-run
```

The script sends one POST to the documented batch endpoint. **A live execution uses credits.** Check the tester's current access and cost before running. The script accepts at most five distinct IDs as a deliberate starter limit; the service reference documents up to 1,000 IDs, which is not a promise about charge, latency or completeness for a large request.

The starter only supports the ID input. The service also documents product URLs, but adding URL extraction and merged inputs requires a separate identity check. No region argument is added to this batch request; inspect returned regions instead.

{% include article-action.html placement="article-middle" %}

## How do you reconcile requested and returned products?

**Use identifiers, not array positions.** A provider may return records in a different order or return fewer than requested. Pairing the first response row with the first input can attach one product's price or sales to another product. The downloadable script validates the returned set before writing a CSV.

Its core reconciliation rule is:

```python
pid = identifier(product.get("productId"))
if pid not in wanted or pid in seen:
    raise ValueError("Unexpected or duplicate product ID")
seen.add(pid)
```

The full script defines `identifier`, `wanted` and `seen`. It reports `missing_requested_ids` in the manifest and keeps returned rows in provider order. It does not invent placeholder sales for absent products.

**Synthetic example:** request IDs A and B, receive only B. The CSV contains B, while the manifest lists A as missing. This demonstrates a join rule; it is not an observed coverage rate. A might be missing because of coverage, an input error or a service issue. The response alone cannot establish which explanation is true.

## Which metrics can you compare in the CSV?

**Compare matching scopes and windows.** The starter includes region, seller identity, price bounds, ratings and separate seven-day and thirty-day sales fields when returned. Missing values remain missing. It does not create a composite “winning product” score or a revenue forecast.

| Comparison | Check before using it |
| --- | --- |
| Minimum versus maximum price | Whether the values represent different SKUs |
| Two products' sales | Same market, window and collection context |
| Seven-day versus thirty-day fields | Different windows; do not add overlapping periods |
| Returned region versus shortlist region | A mismatch needs review, not silent relabeling |
| Ratings and reviews | Product identity and available sample context |

Do not infer that a USD price display makes products from different markets directly comparable. Shipping, variant and offer conditions may differ. Likewise, a thirty-day sales field is not an authorized merchant order ledger, and a high value is not a prediction that your product will achieve it.

## What files and failures should you inspect?

**Read all three files together.** `response.json` retains the body, `rows.csv` is the smaller review view and `manifest.json` preserves the request, returned regions, row count and missing requested IDs. Client observation time records when the export ran, not a guaranteed upstream refresh time.

| Observation | Script behavior and next step |
| --- | --- |
| Non-success HTTP or nonzero business code | Stops; inspect the saved response before retrying |
| Product array is absent | Stops; do not turn a shape error into zero products |
| Product array is explicitly empty | Exports no product rows and lists all requested IDs as missing |
| Returned ID is unexpected or duplicated | Stops; review the identity discrepancy |
| A metric is zero | Preserves zero |
| A metric is null or absent | Leaves it blank and lists it in `missing_fields` |

CSV is a convenience format: it loses types, and a blank cell cannot distinguish absent from null. The script prefixes formula-like text for spreadsheet review while retaining the raw JSON. It makes no automatic follow-up requests or LLM calls.

To check transformation of a saved response without spending more credits:

```bash
python commerce-evidence-export.py tiktok-batch tiktok-request.json --from-response tiktok-batch-run/response.json --output tiktok-offline-review
```

Offline review cannot validate current product availability. Check usage records after timeouts before deciding to submit another batch. Keep larger batches behind an explicit call and spend limit.

## Frequently asked questions

### Is this TikTok Shop API tutorial an official seller integration?

No. It uses Nexscope research data and a Nexscope Key. It does not authorize private order access or account changes.

### Should I match returned products to inputs by array position?

No. Match by `productId`, preserve market context and record missing requested IDs. Investigate duplicate or unrequested IDs before joining data.

### Why does the starter accept only five product IDs?

Five is a review and spend-control choice for this example, not the provider maximum. Verify current limits and actual costs before enlarging it.
