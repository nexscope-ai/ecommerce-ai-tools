---
learning_topic: "sourcing"
related_topics: ["agents"]
content_kind: "guide"
layout: "default"
title: "1688 Order API: Create and Track Orders | Nexscope"
description: "Build a 1688 order API flow from preview to confirmed creation and a manual payment link. Reconcile uncertain writes before retries. Read the workflow."
permalink: "/guides/1688-order-api/"
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
  id: 1688_order_api
  title: Inspect the API for this workflow
  description: "New users receive 1,000 credits to get started. Check current access and credit requirements before running a request."
  label: Open the API reference
  url: https://www.nexscope.ai/api-docs/1688-create-order?view=api&co-from=learn
---

# 1688 order API: preview, create and retrieve a payment link

{% include api-guide-entry.html %}

A 1688 order API connects a reviewed proposal to a real buyer order. Nexscope separates preview, creation, payment-link retrieval and status. Keep them as separate decisions: a key and buyer authorization do not approve a specific purchase.

## Start with an approved proposal

Complete [authorization]({{ '/guides/1688-api-authorization/' | relative_url }}) and a successful [preview]({{ '/guides/1688-order-preview-api/' | relative_url }}). Show the buyer account, destination, offer, specification, quantity, flow and returned amounts to the reviewer. Record what was approved; changed inputs require a new decision.

| Stage | Operation | Evidence to keep |
| --- | --- | --- |
| Check proposal | `orderPreview` | Business status and original amounts |
| Create approved order | `createOrder` | Business success and real order ID |
| Retrieve link | `paymentUrl` | Outcome and private payment URL |
| Observe progress | `orderStatus` | Exact order ID and source status |

## Prepare order creation

```text
POST https://api.nexscope.ai/alibaba1688/createOrder
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
  ],
  "confirmCreateOrder": false
}
```

This template intentionally keeps `confirmCreateOrder=false`; it is not an executable approval. Replace sample IDs and compare the full payload with the reviewed preview. A real creation request requires JSON boolean `true` after explicit approval of that exact action. The string `"true"` is not equivalent.

Use address, cargo and flow fields. Do not copy preview-only `invoiceParam` into creation. Do not invent an idempotency header or assume a client reference guarantees deduplication: this guide has not verified that guarantee for Nexscope.

## Verify the real outcome

HTTP 200 or outer `code=0` alone is insufficient. Inspect the provider wrapper when retained, business `success`, messages and returned `orderId`. Save the actual ID as a string. The tutorial ID is not the ID of your purchase.

After a timeout, stop dependent actions. The outcome is uncertain and a repeated request may create a second order. Reconcile the buyer's actual records and contact support where needed. If a reliable order ID is available, check its status. Do not guess an ID or automatically retry creation.

{% include article-action.html placement="article-middle" %}

## Retrieve a payment link separately

```text
POST https://api.nexscope.ai/alibaba1688/paymentUrl
```

```json
{
  "orderIdList": [
    "3309156590237728779"
  ],
  "confirmGetPaymentUrl": false
}
```

The template again defaults to false. A real request needs `confirmGetPaymentUrl=true` for the reviewed actual order IDs. Inspect `success`, `payUrl`, `errorMessage` and `errorCode`. Keep the URL private and show it to the buyer for manual review.

Retrieving a link does not pay. Never automatically open the URL, authorize payment or mark an order paid because a link exists. Read `orderStatus` using `aliOrderId` to observe the actual state.

## Cancellation and receipt have separate meanings

`cancelOrder` requires `aliOrderId` and `confirmCancel=true`; optional `cancelReason` and `remark` explain the request. Inspect success and messages. Cancellation is not a refund request; eligibility depends on the order state. Do not promise every order can be cancelled.

`confirmReceive` requires the exact `aliOrderId` and `confirmReceive=true`. Use it only after a person checks the shipment. A delivered trace does not prove the buyer inspected the goods. Obtain a fresh confirmation for the exact action and order. Neither write belongs in a blind retry loop.

## Recover without multiplying purchases

For `99001`, inspect parameters, confirmation or a pricing-configuration message. For `13007`, distinguish authorization failure from service/proxy failure. For `13011`, check credits. Retain a redacted `traceId`. Changing buyer or flow does not resolve an uncertain write.

Continue with [logistics tracking]({{ '/guides/1688-order-tracking-api/' | relative_url }}) and the [invoice guide]({{ '/guides/1688-invoice-api/' | relative_url }}).


## Sources and verification

Reviewed November 6, 2026 by the Nexscope Team against the procurement operation reference and request schemas in the main-site implementation. The examples are illustrative templates, not live buyer-account results. No paid request, order, payment, invoice or supplier verification was performed for this guide.

[Inspect the workflow reference](https://www.nexscope.ai/api-docs/1688-create-order?view=api&co-from=learn) and [current pricing](https://www.nexscope.ai/pricing?co-from=learn) before execution. Outer response processing time is not a credit charge.

## Related procurement guides

- [1688 API authorization: connect and verify your buyer account]({{ "/guides/1688-api-authorization/" | relative_url }})
- [1688 order preview API: check SKU, quantity and freight]({{ "/guides/1688-order-preview-api/" | relative_url }})
- [1688 order tracking API: connect status, parcels and traces]({{ "/guides/1688-order-tracking-api/" | relative_url }})
- [1688 invoice API: amounts, applications and partial failures]({{ "/guides/1688-invoice-api/" | relative_url }})
- [n8n 1688 workflow: purchase previews and an order-status sheet]({{ "/guides/n8n-1688-procurement-workflow/" | relative_url }})
