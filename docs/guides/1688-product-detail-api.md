---
learning_topic: sourcing
related_topics: [agents]
content_kind: guide
layout: default
title: "1688 Product Detail API: SKU Prices, MOQ & Shipping"
description: "Read 1688 SKU prices, quantity tiers, MOQ and shipping fields with Nexscope. See a request example and learn what to verify before comparing supplier offers."
permalink: /guides/1688-product-detail-api/
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
  - question: "Does the 1688 Product Detail API accept a product URL?"
    answer: "The documented request requires offerId as a positive-integer string. Extract and check the offer identifier from the product URL, or keep it from a search result. Do not substitute a URL for offerId."
  - question: "Which price should I use for a one-piece order?"
    answer: "Inspect retailPrice where available and check the documented pricing model, exact SKU and applicable quantity. Missing retail prices are unknown. A wholesale tier or legacy consignPrice field does not establish a confirmed one-piece quote."
  - question: "Does companyName prove that a seller is a factory?"
    answer: "No. A supplier or store name is listing evidence. Verify company identity, manufacturing role, samples, commercial terms and relevant product requirements separately before purchasing."
next_step:
  id: 1688_product_detail_api
  title: Inspect the SKU and price fields for your offer
  description: "New users receive 1,000 free credits to get started. Check this endpoint's access and current credit requirements before running a request."
  label: Open 1688 Product Detail Playground
  url: https://www.nexscope.ai/api-docs/1688-product-detail?view=playground&co-from=learn
---

# 1688 product detail API: compare SKU prices, MOQ and shipping

A **1688 product detail API** helps answer a question that search results leave open: what does this exact offer say about the variant and quantity you want to buy? Nexscope documents product, SKU, pricing, shipping and seller fields for a supplied offer identifier. Begin with the [API capability map]({{ '/api-capabilities/' | relative_url }}) if you still need to choose a research task.

{% include api-guide-entry.html %}

> **Quick answer:** Nexscope's 1688 Product Detail API retrieves a selected offer using a string `offerId`. Inspect `skuList`, `saleInfo`, `shippingInfo` and seller fields together. Keep single-piece prices, wholesale tiers, currencies and weight units separate. The result supports an offer comparison; it does not confirm a purchase quote or certify a supplier.

## What do you need before requesting product details?

You need the offer identifier, not a screenshot or a loosely similar product name. Keep `offerId` from [1688 product search]({{ '/guides/1688-product-search-api/' | relative_url }}) or an eligible listing URL. For visual discovery, use the [1688 image-search workflow]({{ '/ecommerce-trends/1688-image-search-sourcing/' | relative_url }}) first, then inspect the shortlisted offers individually.

The current request requires `offerId` as a positive-integer **string**. Preserve it from input through storage and export. Converting long IDs into floating-point numbers can change the identifier. A spreadsheet should also treat the field as text.

| Input | Documented use | Practical choice |
| --- | --- | --- |
| `offerId` | Required offer identifier as a string | Keep the exact ID from the source |
| `currency` | Optional three-letter currency code | Record the requested currency alongside returned converted fields |
| `country` | Optional upstream compatibility field | Usually omit; it is not a promise of translated product content |

## How do you call the 1688 Product Detail API?

The [current reference](https://www.nexscope.ai/api-docs/1688-product-detail?view=api&co-from=learn) documents this REST operation with bearer authentication:

```text
POST https://api.nexscope.ai/alibaba1688/productDetail
```

The following is a **request template**, using an identifier from the documentation, not a fresh test or a supplier recommendation. Replace it with the offer you intend to inspect.

```bash
curl -X POST 'https://api.nexscope.ai/alibaba1688/productDetail' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"offerId":"1040473674152","currency":"USD"}'
```

For MCP, inspect the `nexscope_1688_product_detail` tool and its own input schema. Do not assume an SDK method or response nesting from another provider. Keep your API key in a server-side secret store, inspect both HTTP and business status, and retain a redacted error and trace identifier if returned. HTTP 200 alone does not prove usable product data.

## How should you read SKU prices and quantity tiers?

Choose the exact variant and intended order size before comparing any price. The contract separates `skuList` from product-level `saleInfo`. A product headline price, a SKU price and a one-piece price can describe different purchase conditions.

| Field or group | What to inspect | Comparison mistake to avoid |
| --- | --- | --- |
| `skuList` | Variant attributes, SKU identifiers, available stock and documented price fields | Comparing different materials or pack sizes |
| `retailPrice` | Single-piece RMB price when supplied | Replacing a missing retail price with a wholesale minimum |
| `saleInfo.priceRanges` | Quantity thresholds and their associated prices | Applying a large-order tier to a small trial order |
| `minOrderQuantity`, `batchNumber` | Minimum quantity and lot information when returned | Assuming every offer permits a one-piece purchase |
| Foreign-currency fields | Converted values for the requested currency where supplied | Relabeling the original RMB price as USD |
| `consignPrice` | Legacy compatibility information that may be absent | Treating it as a guaranteed dropshipping quote |

The documented newer pricing model distinguishes a one-piece retail price from a wholesale SKU price for quantities of at least two. Older offers still require their own tier interpretation. Check the selected offer rather than applying that newer rule to every response.

For a proposed 50-unit test, save the exact SKU, pack size, applicable quantity threshold and currency in the same row. If the requested tier is absent, mark the price **pending supplier confirmation**. This comparison procedure is an example, not an executed order or a measured sourcing result.

{% include article-action.html placement="article-middle" %}

## Which shipping fields need special care?

Shipping weights do not all share one unit. The current contract documents product-level `weight` and `officialWeight` in kilograms, `skuShippingInfoList` weights in grams, and `skuShippingDetails` weight fields in kilograms. Keep the field path and unit with each value before converting it for a freight estimate.

Retain the dispatch location, delivery-time information and available SKU dimensions. Missing dimensions or packaging information should remain unknown. Do not derive a binding international shipping quote from a bare product weight; packaging, route, destination and carrier rules still matter.

## What can supplier fields establish?

`companyName`, `sellerOpenId` and `sellerDataInfo` provide identity and service signals where available. They help organize follow-up questions. A trading medal, service score or certificate image is not an independent audit of the business or product.

Ask finalists to confirm the SKU, material, quantity, price tier, production role, sample process and dispatch terms. Preserve replies alongside the API observation date. If the decision depends on a product certificate, verify its scope and relevance rather than treating the presence of a returned field as approval.

For each shortlisted offer, keep one comparison row: source URL, observation date, string offer ID, SKU, intended quantity, applicable price, currency, MOQ, weight source and unresolved questions. Keep estimated landed costs in separate columns with your assumptions. The API does not negotiate, place an order or calculate your final margin.

## Evidence, cost and next steps

Reviewed **October 26, 2026** against the [public Product Detail reference](https://www.nexscope.ai/api-docs/1688-product-detail?view=api&co-from=learn) and its published request and response contracts. This is a vendor-authored documentation guide. No paid detail request, supplier verification, latency benchmark or purchase was performed for this article.

Check [current pricing and access](https://www.nexscope.ai/pricing?co-from=learn) before execution. Search, detail and any separate analysis request can be separate actions; an upstream `costToken` field is not a substitute for your account's actual credit record.

Continue with the [1688 search and filtering tutorial]({{ '/guides/1688-product-search-api/' | relative_url }}) to find alternatives, or the [dated image-search evidence]({{ '/api-evidence/1688-image-search/' | relative_url }}) to see the limits of one observed visual search.

{% include api-guide-faq.html %}

