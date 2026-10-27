---
learning_topic: sourcing
content_kind: guide
layout: default
title: "1688 Product Search API: Filters, MOQ & Supplier Leads"
description: "Build a 1688 product shortlist with Chinese keywords, price and MOQ filters, sorting and pagination. Inspect Nexscope request examples and supplier-data limits."
permalink: /guides/1688-product-search-api/
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
  - question: "Can I search 1688 with an English keyword?"
    answer: "The current Product Search contract specifies Simplified Chinese for keyWord, with a maximum of 50 characters. Translate the product specification carefully and check its meaning; do not assume an English example establishes supported English search."
  - question: "Which pagination fields does 1688 Product Search use?"
    answer: "Use pageIndex starting from 1 and pageSize from 10 to 100. The documented default pageSize is 20. Keep the keyword, filters, period and sort unchanged while paging through one research query."
  - question: "Does the factory filter verify a manufacturer?"
    answer: "No. companyType and seller-type filters narrow the source's reported classification. Independently verify the company's identity, manufacturing role, sample quality and terms before a purchasing decision."
next_step:
  id: 1688_product_search_api
  title: Build your first bounded 1688 shortlist
  description: "New users receive 1,000 free credits to get started. Check this endpoint's access and current credit requirements before running a request."
  label: Open 1688 Product Search Playground
  url: https://www.nexscope.ai/api-docs/1688-product-search?view=playground&co-from=learn
---

# 1688 product search API: filter products before comparing suppliers

The **1688 product search API** is useful when you know a product specification and need candidates you can compare. Start with a Simplified Chinese keyword, then narrow by price, minimum order quantity and relevant seller signals. Use the [API capability map]({{ '/api-capabilities/' | relative_url }}) for broader discovery, or this tutorial for a reproducible keyword-to-shortlist request.

{% include api-guide-entry.html %}

> **Quick answer:** Nexscope's 1688 Product Search API supports Simplified Chinese keywords, price and minimum-quantity filters, seller classifications, sorting and pagination. Keep the statistical period with every sales metric. Search produces candidate offers; query product details for exact variants and tiers, then verify commercial terms directly before sourcing.

## Which 1688 API matches your starting point?

Use keyword search for a written specification, image search for visual discovery, and product details for a known offer. They answer different questions and should not be treated as interchangeable responses.

| What you have | Starting point | Next useful step |
| --- | --- | --- |
| Material, function and product terms | Product Search | Inspect a small set of returned offers |
| A reference photo | [Image-search sourcing guide]({{ '/ecommerce-trends/1688-image-search-sourcing/' | relative_url }}) | Screen visual matches against a written brief |
| A selected offer ID | [Product Detail tutorial]({{ '/guides/1688-product-detail-api/' | relative_url }}) | Compare SKU, price tier, MOQ and logistics |
| A ranking question | [1688 Product Billboard](https://www.nexscope.ai/api-docs/1688-product-billboard?view=api&co-from=learn) | Preserve the requested chart period and category |

## How do you write a useful search request?

The [current Product Search reference](https://www.nexscope.ai/api-docs/1688-product-search?view=api&co-from=learn) specifies `keyWord` in Simplified Chinese, up to 50 characters. Prefer terms for the product's function, material and size over a brand name. Review a translation before using it to select inventory.

This **illustrative request body** searches for yoga mats and requests ten candidates. It is not a live result or a recommendation of a product category. The price and MOQ limits are hypothetical buyer constraints.

```json
{
  "keyWord": "瑜伽垫",
  "cycle": "30",
  "searchType": 1,
  "beginPrice": 10,
  "endPrice": 50,
  "endStartQuantity": 50,
  "sortField": "saleCount30d",
  "sortType": "desc",
  "pageIndex": 1,
  "pageSize": 10
}
```

The documented REST operation is `POST https://api.nexscope.ai/dl/productSearch`, with bearer authentication and JSON. MCP users should inspect `nexscope_1688_product_search` and its tool schema. This article uses a keyword-only query; do not add `goodsUrl` to that same request, because those inputs are mutually exclusive in the documented contract.

Start with a small allowed page and only the filters that matter to your decision. If nothing matches, relax one filter at a time. That makes it possible to distinguish a restrictive price band from an irrelevant keyword or an upstream failure.

## Which filters and sort rules should you use?

Select filters from your intended purchase, rather than copying every available option into one request. The current schema exposes separate wholesale, dropship, sales, quantity and supplier-related criteria.

| Decision | Relevant fields | Interpretation |
| --- | --- | --- |
| Match product wording | `keyWord`, `searchType` | `1` fuzzy match; `3` exact match |
| Bound displayed wholesale prices | `beginPrice`, `endPrice` | Screening prices, not a negotiated final quote |
| Bound minimum purchase quantity | `beginStartQuantity`, `endStartQuantity` | Filter the MOQ field, not available stock |
| Compare reported activity | `cycle`, order/unit/revenue ranges | Preserve the selected 7-day or 30-day period |
| Narrow seller classifications | `companyType`, `shiLiType` | Reported source labels, not independent verification |
| Retrieve the next results | `pageIndex`, `pageSize` | One-based pages; 10–100 results per page |

`companyType` documents `0` for no restriction, `1` for store and `2` for factory. Use that classification to select leads for investigation, not to describe the response as a list of verified factories.

Sort fields include order count, units sold and sales amount for 7-day and 30-day windows, as well as price and listing time. Keep `cycle` and the named sort window aligned with your question. Fifty orders, fifty units and a sales amount of fifty are different measurements; do not label all three “sales.”

{% include article-action.html placement="article-middle" %}

## How do you turn results into a defensible shortlist?

Read the returned `products` and retain the string `offerId`, product title, listing link, image, price, currency, `quantityBegin` and the available sales-period fields. `total` describes matching records rather than evidence that every record has been retrieved. Store the request and observation date with each page.

Screen for comparable specification before ranking by price. A thinner yoga mat, a smaller pack or an accessory can be cheaper while failing the same buyer need. Record a specific reason for including or excluding each candidate, and keep missing values as unknown.

Then query [Product Detail]({{ '/guides/1688-product-detail-api/' | relative_url }}) for a bounded number of selected offers. That step can expose variants and quantity-tier conditions that a search row does not resolve. Compare the intended SKU and order size, and separate the supplier's quoted terms from the API's observed fields.

## How should pagination and failures be handled?

Increment `pageIndex` from 1 while keeping the original keyword, filters, period and sort. Use `pageSize` from 10 to 100; the documented default is 20. Save page numbers and deduplicate observed candidates by the exact offer identifier. A changing source dataset may shift between requests, so do not describe the collected pages as an atomic marketplace snapshot.

Check HTTP status and the business status and payload documented for the selected route. An empty valid list, a rejected parameter and an upstream timeout require different handling. Do not automatically retry an unbounded number of times or launch detail lookups for missing identifiers. Retain redacted errors and inspect usage before repeating a paid sequence.

## Evidence, access and related guides

Reviewed **October 26, 2026** against the [published Product Search contract](https://www.nexscope.ai/api-docs/1688-product-search?view=api&co-from=learn). This vendor-authored tutorial documents inputs and interpretation; no paid search, accuracy comparison, supplier audit or purchasing outcome was measured for it.

Check [current pricing and access](https://www.nexscope.ai/pricing?co-from=learn) before running the sequence. Budget for each search page and each subsequent detail lookup. Preserve actual charges separately from upstream cost fields and avoid assuming that a signup credit balance grants every endpoint entitlement.

For visual discovery, continue to [1688 search by image]({{ '/ecommerce-trends/1688-image-search-sourcing/' | relative_url }}). For the next comparison step, use [SKU prices and shipping fields]({{ '/guides/1688-product-detail-api/' | relative_url }}). For researching demand in another marketplace first, see [Shopee product research]({{ '/guides/shopee-product-research-api/' | relative_url }}) or [Ozon product research]({{ '/guides/ozon-product-research-api/' | relative_url }}).

{% include api-guide-faq.html %}
