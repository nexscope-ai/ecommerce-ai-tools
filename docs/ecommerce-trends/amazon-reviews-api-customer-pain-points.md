---
learning_topic: agents
content_kind: guide
layout: default
title: "Amazon Reviews API: Python, Deduplication and CSV"
description: "Collect an Amazon review sample with Python, retain variant ASINs, check duplicate IDs and export a CSV with source evidence and human-review columns."
permalink: /ecommerce-trends/amazon-reviews-api-customer-pain-points/
last_reviewed: 2026-11-03
date_published: 2026-10-20
date_modified: 2026-11-03
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
keywords: [amazon review api, amazon reviews api python, amazon review sentiment analysis, export amazon reviews csv]
next_step:
  id: amazon_reviews_list_api
  title: Retrieve a review sample for one ASIN
  description: Open the current endpoint schema, authentication steps, and usage details before running your own request.
  label: View Amazon Reviews List API
  url: "https://www.nexscope.ai/api-docs/amazon-reviews-list?view=api&co-from=learn&content=amazon-reviews-api-customer-pain-points&signup_module=api-docs&signup_entry=key"
image: /assets/images/amazon-review-product-insights-1440w.webp
image_small: /assets/images/amazon-review-product-insights-720w.webp
image_alt: Amazon review evidence grouped into product pain points and validation questions
image_caption: "Illustration: preserve review evidence before turning recurring complaints into product or listing tests."
last_modified_at: 2026-11-03
suppress_article_help: true
faq:
  - question: "Can the returned ASIN differ from the requested ASIN?"
    answer: "Yes. The documented review example includes variant ASINs. Preserve the requested ASIN, returned ASIN and variation fields rather than rewriting them."
  - question: "Can this script detect fake reviews?"
    answer: "No. It prepares a bounded evidence worksheet. A sentiment label, verified flag or repeated phrase does not by itself establish authenticity."
  - question: "Was a paid review collection run for this article?"
    answer: "No. The starter is checked with synthetic offline responses. The request is illustrative; historical case-study evidence retains its own date and limitations."
---

# Amazon Reviews API: collect and export evidence with Python

**Use the Amazon Reviews API to collect a bounded sample, retain the original response and export review evidence for human analysis.** This Python tutorial adds a reproducible collection step to the research workflow: one ASIN and marketplace, an explicit star-rating sample, duplicate checks and a CSV with blank annotation columns.

{% include api-guide-entry.html %}

> **Quick answer:** Request a small review sample, check the outer business code and returned records, then preserve requested and returned ASINs separately. Remove identical repeated review IDs, investigate conflicting duplicates and keep missing identifiers visible. Use the sample to form product questions, not to estimate a population-wide defect rate or detect fake reviews.

## What does this review workflow produce?

**It produces source JSON, a manifest and a review worksheet; classification remains a separate decision.** The script does not ask an LLM to invent themes, assign a sentiment score or summarize records it did not receive.

This article covers the API collection stage. The [Amazon Review Analyzer guide]({{ '/amazon-negative-review-analysis/' | relative_url }}) covers grouping complaints and planning product tests. The [reviews-to-listing brief guide]({{ '/amazon-reviews-to-listing-brief/' | relative_url }}) explains how to distinguish a product issue from unclear presentation or a service problem.

Choose one research question before requesting data. “What should we investigate about cleaning?” produces a more useful worksheet than “tell us whether this product is good.” A competitor's complaint can suggest a question about your own item; it does not establish that your product solves the problem.

## How do you collect Amazon reviews with Python?

**Download the standard-library starter and an explicit request file.** Use Python 3.10 or later, replace the illustrative ASIN and check the [current Amazon Reviews List reference](https://www.nexscope.ai/api-docs/amazon-reviews-list?view=api) before a live request.

Save [research-api-export.py]({{ '/assets/downloads/research-api-export.py' | relative_url }}) and [amazon-review-request.json]({{ '/assets/downloads/amazon-review-request.json' | relative_url }}) together. The starter request is:

```json
{
  "asin": "B08N5WRWNW",
  "domainCode": "com",
  "sortBy": "recent",
  "reviewerType": "all_reviews",
  "star1Num": 3,
  "star2Num": 2,
  "star3Num": 0,
  "star4Num": 0,
  "star5Num": 0
}
```

This is an illustrative low-star sampling request, not a statement about the product. The requested mix is deliberately biased toward objections. It cannot describe the proportion of satisfied buyers. The starter accepts an explicitly specified total of 1–20 reviews as a small pilot; the API's documented per-star limits are different and should not be confused with this script's limit.

In PowerShell 7, set the key locally without putting its literal value in command history:

```powershell
$env:NEXSCOPE_API_KEY = Read-Host 'Nexscope API key' -MaskInput
```

Then run:

```bash
python research-api-export.py reviews amazon-review-request.json --output review-run-01
```

The script sends one POST to `https://api.nexscope.ai/amazon/reviews/list`. A live run uses credits. It does not retry, collect more pages or top up a short response automatically. The output directory must be new. For a response you already saved, use `--from-response your-response.json` with a new output directory to inspect it offline without a key or network request.

## What should you check before using the CSV?

**Compare the requested sample, raw returned count and exported count.** The script saves `response.json` before interpreting the body, then writes `manifest.json` with the request and client observation time.

The documented review container is `data.data`. A business error, missing review array or unexpected shape stops the export for inspection. A record with a reported non-200 `statusCode` is skipped and counted. An empty array produces an empty worksheet; it does not trigger another paid collection.

| Manifest item | What it tells you |
| --- | --- |
| `requested_reviews` | Sum of the explicit requested star counts |
| `raw_returned_records` | Number of records in the returned array |
| `reported_total` | The upstream total, preserved separately |
| `duplicate_records_removed` | Identical repeated IDs removed from the worksheet |
| `error_records_skipped` | Returned error records excluded from analysis |
| `missing_review_ids` | Exported records without an ID; no automatic identity guess |

The response may contain fewer reviews than requested. A reported total is not proof that your saved sample contains every review. Keep the original filters, sorting choice and observation date with any analysis you share.

{% include article-action.html placement="article-middle" %}

## How are duplicate reviews and variant ASINs handled?

**Deduplicate only when the returned identity supports it, and retain both the requested product and returned variant information.** Amazon review material can include variation ASINs that differ from the ASIN used to request the sample.

The CSV includes `requestedAsin`, returned `asin`, `variationId` and `variationList`. A different returned variant is not silently rewritten to the input ASIN. Check those fields before comparing complaints across sizes, colors or bundles. A returned domain, when present, must match the requested domain.

Within this response, identical records with the same `reviewId` are collapsed. If the same ID appears with conflicting content, the script stops so you can inspect the source. Records without an ID remain in the worksheet, marked through `missing_fields`; similar wording alone does not prove they are duplicates.

The starter also preserves rating text, review date, verified/Vine flags, helpful count, filters and locale when present. It leaves absent values blank and preserves numeric zero and boolean false. Spreadsheet-sensitive text is escaped in the CSV; the raw JSON remains unchanged.

## How do you analyze review sentiment without losing the evidence?

**Read the saved records and annotate evidence, interpretation and next action separately.** The blank worksheet columns are `theme`, `evidence_note`, `next_question` and `human_review`.

Start with a small coding scheme that fits your question: setup, cleaning, dimensions, durability, packaging or delivery. Keep the source `reviewId` beside each annotation. If a review discusses several issues, keep that complexity in the note rather than forcing it into one positive or negative label.

If you later add an LLM classifier, treat review text as untrusted source material, not instructions. Require the model to cite returned IDs and use an unknown category when the evidence is insufficient. Review disagreements manually. This tutorial's script does not make an LLM request or add an extra analysis charge.

A hypothetical cleaning complaint may lead to checking the product's actual access points, instructions and listing images. It does not justify a claim that a specified percentage of all buyers cannot clean the product. Validate the proposed product or listing change separately.

## What are the limits of an Amazon review sample?

**Review samples describe observed feedback under chosen collection settings.** They omit buyers who did not review, and sorting, star selection, variants and available coverage can affect the result.

The sample does not establish defect rate, market share, review authenticity or future sales lift. The request's `recent` setting is a collection choice, not proof that every returned review represents the latest buyer cohort. Preserve returned dates and inspect the actual records.

For a documented historical example, see the [Amazon review case study]({{ '/amazon-review-case-study/' | relative_url }}). For putting product-detail evidence into a sheet, use the separate [n8n Amazon workflow]({{ '/guides/n8n-amazon-google-sheets/' | relative_url }}). Product-detail data and review evidence answer different questions.

## Frequently asked questions

### Can the returned ASIN differ from the requested ASIN?

Yes. The documented review example includes variant ASINs. Preserve the input, returned ASIN and variation fields rather than treating every difference as an error or rewriting it.

### Can this script detect fake reviews?

No. It preserves a bounded source sample and prepares a worksheet. A sentiment label, verified flag or repeated phrase does not by itself establish authenticity.

### Was a paid review collection run for this article?

No. The starter is checked with synthetic offline responses. The sample request is illustrative, and pre-existing case-study evidence retains its own date and limitations.
