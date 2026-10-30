---
learning_topic: sourcing
content_kind: guide
layout: default
title: "How to Filter 1688 Products by MOQ and Price | Nexscope"
description: "Shortlist 1688 products by minimum order quantity, price and specification. Follow a small search workflow, check SKU tiers and troubleshoot empty results."
permalink: /guides/1688-product-search-api/
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

# How to filter 1688 products by MOQ and price

**Start with the product specification, then use price and minimum order quantity (MOQ) to narrow the offers.** A low listing price is only useful when it applies to the variant and order size you actually need. This guide helps you build a small comparison list with Nexscope, then check the shortlisted offers before contacting suppliers.

> **Quick answer:** Write a Simplified Chinese product keyword, set your price band and maximum acceptable MOQ, and request one small page. Compare specification before price. Keep unknown quantities visible, then open product details to check the intended SKU and pricing tier. A search match is a sourcing lead, not a verified supplier.

## Start with a sourcing brief

For the example below, the brief is a yoga mat with an illustrative listing-price band of 10–50 and a maximum reported MOQ of 50. Confirm currency in the returned data before comparing prices. These are example constraints, not observed offers or a purchasing recommendation.

1. Write the required material, dimensions and pack size before searching.
2. Search one page using the Chinese keyword and the two purchasing filters.
3. Remove accessories and variants that fail the specification, even if they are cheaper.
4. Keep a few eligible offers for a detail check and supplier questions.

**What you will have:** a shortlist with a listing link, observed price, MOQ, unresolved questions and an explicit include/exclude decision. Keep the collection date beside it.

{% include api-guide-entry.html %}

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

The documented REST operation is `POST https://api.nexscope.ai/dl/productSearch`, with bearer authentication and JSON. This article uses a keyword-only query; do not add `goodsUrl` to that same request, because those inputs are mutually exclusive in the documented contract.

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

## A real example: why the cheapest offer needs another check

In the [October 7 portable-blender sourcing test]({{ '/api-evidence/portable-blender-amazon-1688/' | relative_url }}), image search returned ten candidates. The lowest displayed price was ¥28, but that offer had no returned MOQ. Two other offers were checked in detail and each returned a 1+ tier at ¥33.

| Recorded observation | Shortlist decision | Next check |
| --- | --- | --- |
| Offer `957433112906`: ¥28, MOQ unknown | Leave order-size eligibility unresolved | Ask for the intended SKU's quantity and tier conditions |
| Offer `902856167524`: ¥33, MOQ 1; detail returned five SKUs | Consider a sample candidate, subject to specification | Confirm which SKU the tier applies to and request a sample |

This was an **image-search and detail test**, not a keyword-search or filter-accuracy benchmark. The recorded prices are dated observations, not current quotes. It illustrates why an unknown MOQ must not become zero and why a cheap search row does not settle a buying decision.

## Why did the search return no usable products?

| What you see | What to check next |
| --- | --- |
| A successful response with an empty product list | Check the Chinese keyword, then relax only the price band or MOQ cap and compare again |
| Products match the words but not the required item | Refine the material, size or product type; inspect exact versus fuzzy matching |
| A low price changes on the detail page | Check SKU, quantity tier, currency and observation time before comparing |
| An authentication, parameter or provider error | Fix that error before treating it as evidence of no market supply |

## How should pagination and failures be handled?

Increment `pageIndex` from 1 while keeping the original keyword, filters, period and sort. Use `pageSize` from 10 to 100; the documented default is 20. Save page numbers and deduplicate observed candidates by the exact offer identifier. A changing source dataset may shift between requests, so do not describe the collected pages as an atomic marketplace snapshot.

Check HTTP status and the business status and payload documented for the selected route. An empty valid list, a rejected parameter and an upstream timeout require different handling. Do not automatically retry an unbounded number of times or launch detail lookups for missing identifiers. Retain redacted errors and inspect usage before repeating a paid sequence.

## Evidence, access and related guides

Reviewed **October 30, 2026** against the [published Product Search contract](https://www.nexscope.ai/api-docs/1688-product-search?view=api&co-from=learn). This vendor-authored tutorial documents inputs and interpretation; no paid search, accuracy comparison, supplier audit or purchasing outcome was measured for it.

Check [current pricing and access](https://www.nexscope.ai/pricing?co-from=learn) before running the sequence. Budget for each search page and each subsequent detail lookup. Preserve actual charges separately from upstream cost fields and avoid assuming that a signup credit balance grants every endpoint entitlement.

For visual discovery, continue to [1688 search by image]({{ '/ecommerce-trends/1688-image-search-sourcing/' | relative_url }}). For the next comparison step, use [SKU prices and shipping fields]({{ '/guides/1688-product-detail-api/' | relative_url }}). For researching demand in another marketplace first, see [Shopee product research]({{ '/guides/shopee-product-research-api/' | relative_url }}) or [Ozon product research]({{ '/guides/ozon-product-research-api/' | relative_url }}).

{% include api-guide-faq.html %}
