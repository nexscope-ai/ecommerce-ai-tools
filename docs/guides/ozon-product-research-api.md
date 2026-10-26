---
layout: default
title: "Ozon Product Research API: Reports, Keywords & Trends"
description: "Use Ozon product reports, detail, keyword and trend APIs in one research workflow. Check date windows, source IDs and request examples before comparing products."
permalink: /guides/ozon-product-research-api/
date_published: 2026-10-26
date_modified: 2026-10-26
last_modified_at: 2026-10-26
last_reviewed: 2026-10-26
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
faq:
  - question: "Does Ozon Product Report Search use flat pagination fields?"
    answer: "No. It requires a nonempty page object with nested page, pageSize and optional orders. Specify the nested values explicitly rather than assuming they are inserted when omitted."
  - question: "Does searchDate select month-to-date data?"
    answer: "The current report contract says omitting searchDate uses a rolling last-30-day period. A supplied date selects the preceding complete historical month; its example 2026-04-01 selects March 2026. This differs from the keyword back-search historyDate format and trend date range."
  - question: "Can Ozon Product Detail take an array of product IDs?"
    answer: "The current Product Detail input contract takes one productId as an integer or string. It does not accept arrays or productIds. Product Report Search has a separate skus array accepting up to ten identifiers; do not transfer that batch shape to Product Detail."
next_step:
  id: ozon_product_research_api
  title: Inspect an Ozon product report before expanding research
  description: "New users receive 1,000 free credits to get started. Check this endpoint's access and current credit requirements before running a request."
  label: Open Ozon Product Report Playground
  url: https://www.nexscope.ai/api-docs/ozon-product-report-search?view=playground&co-from=learn
---

# Ozon product research API: connect reports, keywords and trends

An **Ozon product research API** helps turn a broad product idea into a dated set of comparable candidates. Nexscope documents separate report, detail, keyword and trend interfaces. Useful integration depends on choosing the right request shape and date window, not simply joining every field named sales. Start with the [API capability map]({{ '/api-capabilities/' | relative_url }}) for other marketplace workflows.

{% include api-guide-entry.html %}

> **Quick answer:** Start Nexscope's Ozon workflow with a bounded product report, retain SKU and source identifiers, then inspect selected products and keyword evidence. Report dates, detail windows, keyword history and daily trends use different controls. Preserve currencies, variant handling and missing data before comparing results or deciding what inventory to test.

## Which Ozon interface answers your question?

Use the report interface to discover candidates, a matching detail route to investigate them, and keyword or trend routes to answer a specific remaining question. Nexscope's Ozon directory contains different source families; similar endpoint names do not establish identical coverage, category IDs or data methods.

| Research question | Interface | Input distinction |
| --- | --- | --- |
| Which products meet my criteria? | [Product Report Search](https://www.nexscope.ai/api-docs/ozon-product-report-search?view=api&co-from=learn) | Nested `page`, optional filters and `searchDate` |
| What do a selected SKU's period metrics show? | [Product Detail Search](https://www.nexscope.ai/api-docs/ozon-product-detail-search?view=api&co-from=learn) | String `sku` and supported `dateRange` |
| What does another source report for a product? | [Product Detail](https://www.nexscope.ai/api-docs/ozon-product-detail?view=api&co-from=learn) | One `productId`, optional dates and FBS choice |
| Which search terms describe the market? | [Market Keyword Search](https://www.nexscope.ai/api-docs/ozon-market-keyword-search?view=api&co-from=learn) | Nested `page`, keyword filters and its own period controls |
| Which terms are associated with selected SKUs? | [Keyword Back Search](https://www.nexscope.ai/api-docs/ozon-keyword-back-search?view=api&co-from=learn) | `skuIds`, `hasVariant`, nested `page` |
| Is activity sustained across days? | [Product Trend](https://www.nexscope.ai/api-docs/ozon-product-trend?view=api&co-from=learn) | Integer `productId`, start/end dates and optional source flags |

## How do you request a small product report?

The current report reference documents this REST operation with Nexscope bearer authentication and JSON:

```text
POST https://api.nexscope.ai/sr/ozon/productReportSearch
```

MCP users should inspect `nexscope_ozon_product_report_search`. The **illustrative body** below filters titles around a Russian storage-product term and asks for ten rows. No live response or profitable niche is claimed.

```json
{
  "page": {
    "page": 1,
    "pageSize": 10,
    "orders": [
      {"field": "sales", "direction": "DESC"}
    ]
  },
  "keywords": ["органайзер"],
  "variationsMerge": 1
}
```

`page` is a required, nonempty object. Explicitly provide nested pagination values: omitted nested defaults are not inserted automatically according to the published MCP contract. Sorting directions are uppercase `ASC` or `DESC`; do not copy the lowercase sort convention from 1688.

Add only the filters your decision requires. Documented report criteria include seller, brand, fulfillment, category IDs and numerical ranges such as `monthlySales`, `monthlyRevenue`, `price` and `reviewRating`. Range objects use `min` and/or `max`; use finite bounds and keep the lower bound no greater than the upper one. Category IDs must belong to the selected route's source rather than being translated category names.

## How do Ozon dates and variant settings affect comparisons?

The report's date is not a universal parameter for the whole directory. Omitting `searchDate` selects the documented rolling last-30-day period. Supplying a date selects the preceding complete historical month: the reference uses `2026-04-01` for March 2026. Do not describe that as April month-to-date.

| Route | Date or scope controls | What to preserve |
| --- | --- | --- |
| Product Report Search | `searchDate`, `variationsMerge` | Requested month/rolling period and whether variants merge |
| Product Detail Search | `dateRange`, such as `past_30_days` | Returned `startDate` and `endDate` where provided |
| Keyword Back Search | `historyDate` in `yyyy-MM`, `hasVariant` | Historical month and whether variants are excluded |
| Product Trend | `startDate`, `endDate`, `includeFbs` | Daily range and selected fulfillment scope |

The Product Trend contract documents a T-1 delay, with yesterday as the latest date. Do not present an incomplete current day as a measured zero. A merged variant report and an unmerged SKU list also have different counting units; record the choice before summing or comparing them.

{% include article-action.html placement="article-middle" %}

## How do you inspect shortlisted products?

Retain the report's SKU, product URL, title, source, currency and observation date. Review its `total` as the total matching records, not the number on your current page. The report documents `data` and `products` as equivalent product arrays; choose one instead of counting both copies.

For source-consistent follow-up, Product Detail Search accepts a string `sku` and a supported `dateRange`: `past_7_days`, `past_30_days`, `past_60_days`, `past_90_days`, `past_180_days` or `past_365_days`. Inspect returned dates before comparing its totals with a report period.

The separate Product Detail route currently takes **one `productId`**, as an integer or string, and does not accept arrays or `productIds`. Product Report Search separately supports up to ten integer `skus`. Those are different contracts. Where a directory summary and input details differ, inspect the route's current input contract and validate one bounded request before implementing a batch job.

## How do keyword research and trends add useful evidence?

Use Market Keyword Search to investigate a term, and Keyword Back Search when starting from known SKUs. Back Search requires an integer `skuIds` array, `hasVariant` and nested `page`; it allows up to 20 SKUs. Its optional `type` uses string values `"0"` for organic terms and `"1"` for ad terms. These are different from integer platform codes returned with some keyword rows.

Retain the returned platform, query language, period and metric definition. Keyword popularity is not the same measurement as merchant sales, and a source ranking is not a guarantee of future traffic. Review relevant Russian terms before using a translated label in a listing or product brief.

Product Trend can help inspect daily activity and missing coverage for one candidate. Its `hasData: false` means the day is missing, which differs from an observed `sales: 0`. Keep that flag when charting. `includeSearchStats` is not supported for every niche, so an absent visibility value should not become a generated ranking.

## What should a reproducible Ozon pilot save?

Write one comparison question, request one small report page, and inspect a few relevant products. Save request parameters, source IDs, period, currency, variant treatment, page number, raw response and actual charge. Add a detail, keyword or trend request only when it resolves a named uncertainty.

For a storage-product comparison, check dimensions, materials, bundle count and fulfillment before comparing sales or ruble prices. Source-reported gross margins and conversion ratios do not establish your own profit. Keep your acquisition, freight, fee and return assumptions in a separate calculation rather than implying the API knows your economics.

## Evidence, access and related research

Reviewed **October 26, 2026** against the linked public report, detail, keyword and trend contracts. This is a vendor-authored documentation review. No paid Ozon request, independent accuracy study, customer testimonial or achieved profit was measured for this guide.

Inspect [current pricing and access](https://www.nexscope.ai/pricing?co-from=learn) before starting. Search pages, detail lookups and trend requests can be separately charged. Keep API keys server-side and distinguish transport failures, business errors, valid empty results and missing fields when handling retries.

Continue with [Shopee product research]({{ '/guides/shopee-product-research-api/' | relative_url }}) or [Temu product research]({{ '/guides/temu-product-research-api/' | relative_url }}) for platform-specific comparisons. For subsequent supplier discovery, use [1688 product search]({{ '/guides/1688-product-search-api/' | relative_url }}); a keyword or image match still requires product and supplier verification.

{% include api-guide-faq.html %}
