---
learning_topic: agents
content_kind: guide
layout: default
title: "Etsy Scraper Python: Product Research API to CSV"
description: "Export Etsy product research to CSV with a Python starter. Query one small page, preserve listing URLs and check missing prices, reviews and sales signals."
permalink: /guides/etsy-product-research-api/
date_published: 2026-10-23
date_modified: 2026-11-04
last_modified_at: 2026-11-04
last_reviewed: 2026-11-04
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
faq:
  - question: "Can I use this Etsy API to edit listings or read private orders?"
    answer: "These Nexscope interfaces are public-marketplace research tools, not an Etsy shop-management integration. Private orders and listing changes require a suitable authorized seller integration."
  - question: "Do favorites or reported sales prove an Etsy product will sell?"
    answer: "No. Favorites, reviews and sales-related fields describe different signals. Check each metric's source and period, then validate demand, margin and product rights separately."
  - question: "Which Etsy request should I use for a known listing?"
    answer: "Inspect Product Detail and provide the documented public listing URL through productUrl. Check access and current cost first, and retain returned identity fields and missing-value indicators."
next_step:
  id: etsy_product_research_api
  title: Inspect an Etsy product query
  description: "Review the supported filters, current cost and returned evidence before requesting a bounded shortlist."
  label: View Etsy Product Query API
  url: https://www.nexscope.ai/api-docs/etsy-product-query?view=api&co-from=learn
---

# Etsy scraper Python: export a product-research shortlist to CSV

An **Etsy product research API** is useful when a team needs repeatable listing and shop comparisons, not another unverified list of winning products. A public research result can help narrow the questions to investigate. It cannot prove future demand, a seller's profit or permission to copy a design.

{% include api-guide-entry.html %}

> **Quick answer:** Nexscope's Etsy research APIs help teams compare public listings and shops through category search, product queries and listing details. Use them for a reproducible shortlist, not shop management or sales forecasts. Retain dates, currencies and missing fields. For private orders or listing updates, evaluate an authorized seller integration instead.

*Reviewed November 4, 2026. Documentation-based guide by Nexscope Team. No paid API requests or live listing tests were run for this article; the executable starter was checked with constructed offline fixtures.*

## Is this API workflow right for you?

| Assessment | Your task | Recommended approach |
| --- | --- | --- |
| Fit | Compare similar listings in a defined niche | Keep product type, currency and filters consistent. |
| Fit | Add shop context to a product shortlist | Inspect shop evidence without confusing shop totals with listing sales. |
| Fit | Review a known public Etsy listing | Validate its URL before requesting Product Detail. |
| Not a fit | Read private orders or update your listings | Use a suitable authorized seller integration. |
| Not a fit | Prove demand, profit or rights to copy a design | Validate economics, buyer response and intellectual-property rights separately. |

## Which Etsy API should you start with?

Start with the smallest endpoint that answers your question. Nexscope's current catalog separates four research tasks instead of treating every search as a complete market study.

| Task | API | How it helps |
| --- | --- | --- |
| Define a category | [Category Search](https://www.nexscope.ai/api-docs/etsy-category-search?view=api) | Find category identifiers for later filtering |
| Find competing products | [Product Query](https://www.nexscope.ai/api-docs/etsy-product-query?view=api) | Filter a candidate set using the supported product criteria |
| Compare shops | [Store Query](https://www.nexscope.ai/api-docs/etsy-store-query?view=api) | Add shop context without assuming every shop is comparable |
| Inspect one listing | [Product Detail](https://www.nexscope.ai/api-docs/etsy-product-detail?view=api) | Retrieve public details from a validated marketplace URL |

Keep those jobs separate. A category match does not establish demand, and an attractive shop does not establish that one listing is a sound launch opportunity.

## Etsy scraper Python tutorial: export one research page to CSV

**Use Python to call the product-research API and export a small, reviewable shortlist.** This approach avoids maintaining an HTML parser in your own script. It still depends on the provider's coverage and access conditions. If you need private orders or listing edits, choose an authorized Etsy seller integration instead.

Download the [Python 3.10+ starter]({{ '/assets/downloads/etsy-ranking-export.py' | relative_url }}) and [Etsy request template]({{ '/assets/downloads/etsy-shortlist-request.json' | relative_url }}). Both use the standard library; no package installation is required. Save the two files together. The starter intentionally supports a smaller request surface than the full endpoint: one search phrase, page 1, USD and at most 10 items. The supplied template requests five.

```json
{
  "searchKey": "desk organizer",
  "page": 1,
  "pageSize": 5,
  "currencyCode": "USD"
}
```

This is an input example, not a tested profitable niche. Review the [current Etsy Product Query contract](https://www.nexscope.ai/api-docs/etsy-product-query?view=api#online-test), access and charge estimate before execution. Each invocation below makes one POST to `https://api.nexscope.ai/eh/etsy/productQuery`. It does not request subsequent pages or retry a paid call.

Set `NEXSCOPE_API_KEY` in your local environment using your normal secret-management method. Do not put it in the JSON file, source control or exported spreadsheet. Then run:

```shell
python etsy-ranking-export.py etsy etsy-shortlist-request.json --output etsy-run-001
```

Choose a new output directory for each run. A completed export writes:

| File | What it preserves | How to use it |
| --- | --- | --- |
| `response.json` | The original response bytes | Inspect the envelope and marketplace evidence before interpreting rows |
| `manifest.json` | Inputs, endpoint, client observation time and reported counts | Establish the scope; collection time does not establish source freshness |
| `rows.csv` | Listing URL, title, shop, price and available research metrics | Review candidates; blank values remain unknown |

## What should you check before using the Etsy CSV?

**Check listing identity first, then comparability.** The starter reads `data.products`, derives a listing ID from each returned Etsy listing URL and stops on missing, invalid or duplicate identities. It does not silently merge conflicting records. Reported `productNum` can describe matching products beyond the fetched page; it is not the number exported.

The CSV retains `requestedCurrency`, not a claim that every returned price was independently currency-verified. Confirm item type, bundle size, shipping and currency before comparing offers. `salesWeekly` and `salesTotal` remain provider-reported signals with the limitations discussed below. A zero stays zero; an absent field stays blank and appears in `missing_fields`. Returned titles and tags are escaped when they could be interpreted as spreadsheet formulas.

Add your own notes in `comparable` and `research_note`. Select a few candidates for Product Detail rather than treating the whole first page as a recommendation. The starter performs no detail calls, shop lookups or AI analysis automatically.

To reprocess an existing saved response without a key or network call:

```shell
python etsy-ranking-export.py etsy etsy-shortlist-request.json --from-response etsy-run-001/response.json --output etsy-offline-001
```

Use the original request file for that response. An empty `products` array creates a header-only CSV with zero rows; a missing array or failed envelope stops the export. Check the manifest rather than treating the existence of a CSV as proof of a useful shortlist. These checks were exercised with constructed offline fixtures, not paid live Etsy results.

## How do you choose useful product-query filters?

Begin with product function and buyer context, then add only the filters that clarify the decision. Product Query documents criteria including keyword or URL, price, sales signals, favorites, reviews, listing dates, category and product type. Check the current schema for exact field names and allowed values.

For a hypothetical handmade desk-organizer study, first define materials, approximate size and intended buyer. Compare genuinely similar candidates rather than grouping a digital template with a physical item merely because the title uses the same phrase. Keep digital, handmade and vintage distinctions explicit where the response supports them.

Add a filter only when you can explain what it excludes. Very narrow thresholds can hide early listings or small shops; broad searches can mix unlike products. Save the selected filters so another reviewer can reproduce the shortlist's scope.

## What can favorites, reviews and sales fields establish?

They are different signals and should not be substituted for one another. Favorites can suggest attention; reviews describe a self-selected response history. A reported sales-related value needs its documented source, period and definition before it can support a comparison.

Do not label every number as verified first-party Etsy sales. Keep observed, estimated and missing values distinct. If a period is unclear, say so rather than treating it as a monthly total. A missing field does not mean the product has no customers.

{% include article-action.html placement="article-middle" %}

## How do you turn candidates into a research brief?

Use a bounded search first, then inspect a few candidates in detail. This avoids spending on many detail requests before establishing whether the initial products belong in the same comparison.

1. Record the niche definition, country/currency scope and collection date.
2. Find the relevant category and inspect a small Product Query result.
3. Retain listing identifiers or URLs and the exact filters, including pagination.
4. Use Store Query when shop context changes your interpretation.
5. Retrieve the selected public listings with Product Detail and compare the returned facts with the product question.
6. Write a brief separating evidence, interpretation and unresolved checks.

Useful brief columns include listing URL, item type, comparable price, materials, observed review/favorite signals, date, missing information and reason for inclusion. Do not total different currencies or compare a single item with a bundle without marking the difference.

## What about cost, permissions and automation?

Inspect the current price before each request; one API's displayed charge is not the cost of a complete multi-step study. Count product searches, shop queries and detail calls separately, and retain the actual charged credits. Check documented pagination rather than assuming one response contains every matching listing.

For REST or MCP, use the interface and authentication described on that API page. Keep keys server-side and use permitted public URLs. These research interfaces do not, by themselves, create or edit listings, read private orders or authorize access to another seller's account.

## When is the research ready to use?

When the candidates are comparable and the remaining uncertainty is visible. Product quality, sourcing, intellectual-property rights, margins and buyer response still require separate validation. Treat a promising result as a reason for a controlled test, not a prediction that a new listing will sell.

For another marketplace, compare the [Walmart research workflow]({{ '/guides/walmart-product-keyword-api/' | relative_url }}) or [Temu research workflow]({{ '/guides/temu-product-research-api/' | relative_url }}). The structure can carry across platforms; the identifiers and metric meanings cannot be assumed to match.

## Evidence checked and what remains untested

Documentation review date: **November 4, 2026**. This is a vendor-authored contract review, not an independent benchmark or customer testimonial.

The [Etsy Product Detail contract](https://www.nexscope.ai/api-docs/etsy-product-detail?view=api) requires `productUrl`, a validated public Etsy listing URL. Its response schema includes `productId`, `shopId`, `shopUrl` and `productUrl`. Use these as identity checks when connecting listing and shop evidence, not as a claim that every optional metric will be populated.

| Check | Documented evidence or review status | Limitation |
| --- | --- | --- |
| Input check | Provide productUrl for one public listing | A listing URL is not permission to access private seller data. |
| Response check | Compare returned product and shop identifiers with the requested listing | Keep missing fields and source scope visible. |
| Unmeasured | No live listing was requested | Sales accuracy, freshness, latency and actual credits were not benchmarked. |

Check [current Nexscope pricing and access](https://www.nexscope.ai/pricing?co-from=learn) alongside the endpoint's current estimate. Plan the whole workflow, not just one request; no measured total is available from this article.

{% include api-guide-faq.html %}
