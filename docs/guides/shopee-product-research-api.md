---
learning_topic: agents
content_kind: guide
layout: default
title: "How to Compare Shopee Products and Sales Metrics | Nexscope"
description: "Compare Shopee products within one market using price, variants and separate sales metrics. Build a shortlist and avoid treating historical sales as monthly demand."
permalink: /guides/shopee-product-research-api/
date_published: 2026-10-26
date_modified: 2026-10-30
last_modified_at: 2026-10-30
last_reviewed: 2026-10-30
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
faq:
  - question: "Does Nexscope's Shopee research API require connecting my seller account?"
    answer: "The documented search and detail interfaces research public marketplace products using Nexscope API authentication. They do not establish seller-account authorization, order management or listing publication. Inspect access requirements for the route you choose."
  - question: "Are sold, estimateSold and historicalSold the same metric?"
    answer: "No. The search contract describes sold as previous-30-day units, estimateSold as estimated previous-30-day units, and historicalSold as historical units. Keep separate columns and retain the source observation date."
  - question: "What input does Shopee Product Detail require?"
    answer: "It requires a validated HTTPS productUrl on a supported Shopee host with a path ending in -i.<shopId>.<itemId>. A search pid alone is not the documented detail request, and a shortened or unsupported URL may not qualify."
next_step:
  id: shopee_product_research_api
  title: Explore Shopee candidates for one market
  description: "New users receive 1,000 free credits to get started. Check this endpoint's access and current credit requirements before running a request."
  label: Open Shopee Product Search Playground
  url: https://www.nexscope.ai/api-docs/shopee-product-search?view=playground&co-from=learn
---

# How to compare Shopee products without mixing sales metrics

**Compare products in one Shopee market, with the same function, size and bundle.** Then check price and sales fields separately. A larger historical sales count does not automatically mean stronger demand this month, and the cheapest variant may be an accessory rather than the product you need.

> **Quick answer:** Choose one station and product brief, collect a small search page, and shortlist comparable listings. Keep reported 30-day units, estimated 30-day units and historical units in separate columns. Inspect the exact variant and currency before comparing price. Use product details to resolve missing specifications before making a decision.

## Build a comparison you can actually use

This guide uses a storage-box search in Singapore (`SG`) as an **input example**, not a live market test. Start with a brief such as a single lidded storage box of a specified capacity, then check each returned listing against that brief.

| Record for each candidate | Why it matters |
| --- | --- |
| Station, currency, product URL and collection date | Keeps the comparison tied to its market and observation |
| Capacity, dimensions, material and pack count | Separates similar products from accessories and bundles |
| Variant price and the applicable SKU | Avoids comparing an accessory price with a complete item |
| `sold`, `estimateSold`, `historicalSold` in separate columns | Preserves their different periods and estimate status |
| Missing facts and the next verification step | Makes uncertainty visible before a buying decision |

**Finish with a few comparable candidates and the questions still to resolve**, rather than a ranked list built from unrelated numbers.

{% include api-guide-entry.html %}

## Which Shopee API should you start with?

Use search when you need candidates and detail when you have one eligible listing. The interfaces do not accept an identical input object. Search requires `station`; detail requires a validated `productUrl`.

| Task | Interface | Main input |
| --- | --- | --- |
| Discover and filter products | [Shopee Product Search](https://www.nexscope.ai/api-docs/shopee-product-search?view=api&co-from=learn) | Supported station, keyword and optional filters |
| Inspect a selected listing | [Shopee Product Detail](https://www.nexscope.ai/api-docs/shopee-product-detail?view=api&co-from=learn) | Supported HTTPS product URL |
| Plan store setup and first orders | [Shopee seller introduction](https://www.nexscope.ai/blog/how-to-sell-in-shopee-and-get-your-first-orders) | Your business and operating plan |

The last article covers selling decisions. This tutorial concentrates on request fields, comparable records and integration boundaries. Neither public research call establishes permission to edit listings or retrieve a seller's private orders.

## How do you search products in one Shopee market?

Choose the station before interpreting price or demand. The current reference accepts supported site names or codes; the example below uses `SG`. Repeating the same price band in another station does not create a currency-adjusted or economically equivalent comparison.

This is an **illustrative request body**, not a live search result. Its keyword and ten-result page define a small first check, not a recommended niche.

```json
{
  "station": "SG",
  "keyword": "storage box",
  "keywordType": 2,
  "orderBy": "sold",
  "orderByType": "DESC",
  "page": 1,
  "pageSize": 10
}
```

The current REST reference documents this operation with a Nexscope bearer API key and JSON:

```text
POST https://api.nexscope.ai/yy/shopee/getProductInfos
```

Keep credentials server-side and record the station, query, filters, sorting, page and observation date with the response.

`keywordType` documents `1` for exact phrase, `2` for multi-word AND and `3` for multi-word OR. The example requires both words. If it yields too little useful evidence, change one condition at a time rather than combining a new market, keyword and price range in the same comparison.

## Which filters make products comparable?

Start with product function, size and bundle, then apply supported numerical filters. A cheap accessory and a full product can share a keyword. A large result count does not establish a coherent competitor set.

| Decision | Search fields | Keep in your research record |
| --- | --- | --- |
| Price band | `priceMin`, `priceMax` | Station, local currency and variant/pack context |
| Recent reported activity | `soldMin`, `soldMax` | The documented previous-30-day meaning |
| Estimated activity | `estimateSoldStart`, `estimateSoldEnd` | An explicit estimate label |
| Historical scale | `historicalSoldStart`, `historicalSoldEnd` | Lifetime/history scope, not a monthly label |
| Rating context | `ratingMin`, `ratingMax`, rating-count ranges | Score and count separately |
| Seller or assortment | Shop, category and store-type filters | Source category and shop identifiers |

The response documents `products`, `total` and `totalSize`. Here, `total` is the current returned count and `totalSize` is the overall result count. Preserve that distinction before deciding whether you collected the whole query result. Pagination uses `page` starting at 1, with `pageSize` in the documented range of 1–1000; a small page is more useful for an initial contract check than immediately requesting the maximum.

{% include article-action.html placement="article-middle" %}

## How do you move from search to product details?

Retain `pid`, product links, shop identifiers and station from the search result. Product Detail currently takes **`productUrl`**, not a bare search `pid`. Check the returned URL against the detail reference before making the next call.

The documented URL must use HTTPS on a supported Shopee host and have a path ending in `-i.<shopId>.<itemId>`. Supported hosts listed in that contract include `shopee.sg`, `shopee.co.id`, `shopee.com.my`, `shopee.ph`, `shopee.co.th`, `shopee.tw`, `shopee.vn` and `shopee.com.br`; the accepted port is omitted or 443. Do not assume a short link, unrelated host or a search-results URL is accepted.

Open the [Product Detail Playground](https://www.nexscope.ai/api-docs/shopee-product-detail?view=playground&co-from=learn), substitute your eligible listing URL and inspect the current schema. Its documented upstream success payload contains one product in a `data` array and `total: 1`. Read the selected route's envelope and business status rather than assuming that every Nexscope search and detail response nests product rows the same way.

## How should sales, price and missing values be interpreted?

Keep `sold`, `estimateSold` and `historicalSold` in separate columns. The contract describes them as previous-30-day units, estimated previous-30-day units and historical units respectively. They are source research signals, not your authorized seller-account sales report or proof of future demand.

Compare `price`, `minPrice` and `maxPrice` with the actual variation and pack size. Preserve the local currency and collection date. A product's lowest variant price can describe a small accessory, and an estimate can differ from another field without proving that either is a measured merchant figure.

For a storage-box study, retain capacity, dimensions, bundle count, station, price range, reported and estimated activity, rating, rating count and unresolved questions. Missing attributes remain unknown. Do not have an AI fill missing dimensions or substitute a Google search-volume number for a Shopee sales metric.

## Worked example: historical scale is not monthly demand

The following numbers are **illustrative only**, not API results or actual Shopee listings. Assume both candidates already match the same storage-box specification, market, currency and pack count.

| Candidate | Reported 30-day units (`sold`) | Estimated 30-day units (`estimateSold`) | Historical units (`historicalSold`) |
| --- | ---: | ---: | ---: |
| A | 40 | 55 | 2,000 |
| B | 80 | 90 | 500 |

Candidate A has the larger historical total; B has the larger reported 30-day value. For a recent-activity question, comparing A's 2,000 historical units with B's 80 monthly units would be invalid. Keep estimates in their own column, and use the same metric for both rows. Neither row establishes future sales or the private sales performance of a merchant account.

## What if the comparison looks wrong?

| Problem | Next action |
| --- | --- |
| Prices appear unusually far apart | Check station, currency, variant and bundle before interpreting demand |
| The response is valid but the list is empty | Keep the station fixed and relax one keyword or filter at a time |
| A detail request rejects the selected item | Use the documented supported HTTPS product URL rather than a bare `pid` or short link |
| A sales or specification field is missing | Mark it unknown; do not invent a value or rank it as zero |

## Evidence, access and the next research step

Reviewed **October 30, 2026** against the public [search](https://www.nexscope.ai/api-docs/shopee-product-search?view=api&co-from=learn) and [detail](https://www.nexscope.ai/api-docs/shopee-product-detail?view=api&co-from=learn) contracts. This vendor-authored guide contains request templates, not fresh API results, an independent accuracy benchmark or customer testimonials. No paid search or detail call was executed for it.

Inspect [current pricing and access](https://www.nexscope.ai/pricing?co-from=learn), and budget search pages and selected detail requests separately. Check HTTP and business errors before retrying, and keep actual charged credits with the pilot record.

After marketplace research, investigate sourcing separately through [1688 product search]({{ '/guides/1688-product-search-api/' | relative_url }}). Compare another marketplace with the [Temu research guide]({{ '/guides/temu-product-research-api/' | relative_url }}) or [Ozon research guide]({{ '/guides/ozon-product-research-api/' | relative_url }}). A visual or keyword match across platforms is a lead to inspect, not proof of an identical product or achievable margin.

{% include api-guide-faq.html %}
