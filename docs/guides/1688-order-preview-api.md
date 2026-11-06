---
learning_topic: "sourcing"
related_topics: ["agents"]
content_kind: "guide"
layout: "default"
title: "1688 Order Preview API: SKU and Freight | Nexscope"
description: "Use the 1688 order preview API to check SKU, quantity, address and freight. Keep cents and yuan separate before ordering. Follow the request walkthrough."
permalink: "/guides/1688-order-preview-api/"
date_published: "2026-11-06"
date_modified: "2026-11-06"
last_modified_at: "2026-11-06"
last_reviewed: "2026-11-06"
author: "Nexscope Team"
schema_type: "Article"
og_type: "article"
topic: "api"
suppress_article_help: true
next_step:
  id: 1688_order_preview_api
  title: Inspect the API for this workflow
  description: "New users receive 1,000 credits to get started. Check current access and credit requirements before running a request."
  label: Open the API reference
  url: https://www.nexscope.ai/api-docs/1688-order-preview?view=api&co-from=learn
---

# 1688 order preview API: check SKU, quantity and freight

{% include api-guide-entry.html %}

The 1688 order preview API checks a proposed purchase before an order is created. A listing price or stock number is not a confirmed purchase quote. Nexscope separates SKU lookup, buyer addresses and preview so you can review the actual proposal.

## Move from discovery to the exact specification

Start with [product search]({{ '/guides/1688-product-search-api/' | relative_url }}) or [image sourcing]({{ '/ecommerce-trends/1688-image-search-sourcing/' | relative_url }}), then inspect [product details]({{ '/guides/1688-product-detail-api/' | relative_url }}). Complete [buyer authorization]({{ '/guides/1688-api-authorization/' | relative_url }}) before procurement reads.

Keep offer, specification and address identifiers as strings. A color name is a display label, not a replacement for `specId`.

```text
POST https://api.nexscope.ai/alibaba1688/sku
```

```json
{
  "offerId": "1234567890123456789"
}
```

Inspect `skuList[].specId`, `price` and `amountOnSale`. Choose the intended material, size, pack and color, not simply the first row. SKU prices and stock are indicative; preview determines purchasability and final amounts.

Request `receiveAddressList` with `{}` and select a returned `addressId`. Do not invent an address when the list is empty.

## Build the proposal explicitly

```text
POST https://api.nexscope.ai/alibaba1688/orderPreview
```

```json
{
  "addressId": "987654321012345678",
  "flow": "general",
  "cargoParamList": [
    {
      "offerId": "1234567890123456789",
      "specId": "example-spec",
      "quantity": 2
    }
  ]
}
```

Replace all sample IDs with actual values from your own reads. These are request templates, not executed purchases. Set REST `flow` explicitly: `general`, `fenxiao` or `boutiquefenxiao`. Distribution modes are deliberate choices, not alternatives to cycle through when a proposal fails.

Use `addressId` or `addressParam` for the destination and `cargoParamList` for the offer, specification and quantity. Optional `invoiceParam` belongs to preview; it is not an order-creation field.

## Keep cents and yuan separate

| Returned field | Unit | Handling |
| --- | --- | --- |
| `sumPayment` | Cents | Divide by 100 only for display |
| `sumCarriage` | Cents | Preserve original freight amount |
| `discountFee` | Cents | Keep separate from freight |
| `cargoList.finalUnitPrice` | Yuan | Do not divide again |
| `cargoList.amount` | Yuan | Preserve field path and currency context |

For an arithmetic-only example, 12345 cents displays as 123.45 yuan, while a unit price of 12.34 yuan stays 12.34. These are invented numbers, not a supplier quote. Do not add fields into a grand total without checking what the returned total already includes.

{% include article-action.html placement="article-middle" %}

## Decide whether the proposal is usable

Check HTTP status, numeric platform code and the business result, including a retained provider wrapper when present. Stop if preview `status=false`, even when outer `code=0`. Review cargo, address, freight, discounts and returned payment or promotion options. Missing amounts remain unknown.

Re-preview after changing quantity, specification, destination or flow. A preview is not a stock reservation. Save the observation time, buyer label, exact IDs, quantity, flow, original money fields and unresolved messages for review.

## Know what the result excludes

Domestic freight is not a complete international landed-cost quote. Overseas forwarding, packaging, duties and taxes remain separate assumptions unless explicitly returned and documented. A preview also does not certify the supplier or product.

**Does preview place an order?** No. The [order creation guide]({{ '/guides/1688-order-api/' | relative_url }}) explains the separate write and its confirmation.

**Can I multiply search price by quantity instead?** That supports an estimate but can miss eligibility, freight and order-specific prices. Keep estimates separate from actual preview results.


## Sources and verification

Reviewed November 6, 2026 by the Nexscope Team against the procurement operation reference and request schemas in the main-site implementation. The examples are illustrative templates, not live buyer-account results. No paid request, order, payment, invoice or supplier verification was performed for this guide.

[Inspect the workflow reference](https://www.nexscope.ai/api-docs/1688-order-preview?view=api&co-from=learn) and [current pricing](https://www.nexscope.ai/pricing?co-from=learn) before execution. Outer response processing time is not a credit charge.

## Related procurement guides

- [1688 API authorization: connect and verify your buyer account]({{ "/guides/1688-api-authorization/" | relative_url }})
- [1688 order API: preview, create and retrieve a payment link]({{ "/guides/1688-order-api/" | relative_url }})
- [1688 order tracking API: connect status, parcels and traces]({{ "/guides/1688-order-tracking-api/" | relative_url }})
- [1688 invoice API: amounts, applications and partial failures]({{ "/guides/1688-invoice-api/" | relative_url }})
- [n8n 1688 workflow: purchase previews and an order-status sheet]({{ "/guides/n8n-1688-procurement-workflow/" | relative_url }})
