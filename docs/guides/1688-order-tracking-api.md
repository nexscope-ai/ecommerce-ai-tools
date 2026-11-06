---
learning_topic: "sourcing"
related_topics: ["agents"]
content_kind: "guide"
layout: "default"
title: "1688 Order Tracking API: Status and Parcels | Nexscope"
description: "Track 1688 orders with order status, logistics records and parcel traces. Preserve order IDs, separate parcels and read China time. Follow the guide."
permalink: "/guides/1688-order-tracking-api/"
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
  id: 1688_order_tracking_api
  title: Inspect the API for this workflow
  description: "New users receive 1,000 credits to get started. Check current access and credit requirements before running a request."
  label: Open the API reference
  url: https://www.nexscope.ai/api-docs/1688-order-status?view=api&co-from=learn
---

# 1688 order tracking API: connect status, parcels and traces

{% include api-guide-entry.html %}

A 1688 order tracking API is useful when it distinguishes a purchase from its shipments. Nexscope exposes order status, logistics records and logistics traces as separate reads. Join them using actual order and logistics identifiers rather than treating one tracking number as the entire order.

## Establish the buyer and order

Complete [buyer authorization]({{ '/guides/1688-api-authorization/' | relative_url }}). Use a real order belonging to that buyer, from [order creation]({{ '/guides/1688-order-api/' | relative_url }}) or verified buyer records. Preserve long IDs as strings in JSON, databases and spreadsheets. Tutorial IDs are placeholders, not public orders to test.

## Read the order-level status

```text
POST https://api.nexscope.ai/alibaba1688/orderStatus
```

```json
{
  "aliOrderId": "3309156590237728779"
}
```

Inspect `aliOrderId`, `aliStatus` and `normalizedStatus`. Save source and normalized statuses together. Do not copy status enumerations from another provider. Record observation time: the last successful observation becomes historical when a later read fails.

## Read every logistics record

```text
POST https://api.nexscope.ai/alibaba1688/logistics
```

```json
{
  "aliOrderId": "3309156590237728779"
}
```

Inspect all `logisticsOrders` rows. Keep `logisticsId`, `logisticsBillNo`, `logisticsCompanyName` and `status` together. An order can have multiple logistics records; do not overwrite one parcel with another.

| Level | Key | Question answered |
| --- | --- | --- |
| Order | `aliOrderId` | Which purchase? |
| Logistics record | `logisticsId` | Which shipment record? |
| Carrier reference | Bill number plus carrier | Which carrier shipment? |
| Observation | Order, logistics ID and trace time | What happened to this parcel? |

## Read a parcel trace

```text
POST https://api.nexscope.ai/alibaba1688/logisticsTrace
```

```json
{
  "aliOrderId": "3309156590237728779"
}
```

Use the actual `logisticsId` from the logistics response to select a shipment. Inspect `traceList[].traceTime`, `location`, `traceDescription` and `traceStatus`. Times use **Asia/Shanghai**. Store the timezone with the source value before converting for local display. Do not append a UTC marker to China-local time.

{% include article-action.html placement="article-middle" %}

## Build an operational report

Keep one order summary and separate parcel rows. Suggested columns: buyer label, order ID, original status, normalized status, logistics ID, carrier, bill number, last trace time, last description and observation time. Keep recipient details and payment links out of general dashboards.

Missing tracking remains missing; it does not prove loss or non-dispatch. An empty list and a failed request are different outcomes. Check HTTP status, numeric Nexscope code, provider wrapper when present and business messages before labeling a result empty. Keep a redacted trace ID for support.

## Choose a refresh budget

No polling interval or rate-limit guarantee was verified for this guide. Calculate planned requests from active orders, refreshes and per-parcel reads, then check current pricing and limits. Stop or back off on authorization or credit failures.

As arithmetic only, 20 orders read four times daily already require 80 status calls before logistics and trace requests. This is not a measured bill or a recommended frequency. Avoid refreshing terminal orders without an operational reason.

**Does this include international forwarding?** This guide covers returned 1688 order and domestic logistics data. It does not promise overseas tracking or cross-border delivery estimates.

**Should a delivered trace confirm receipt automatically?** No. Receipt confirmation changes an order and requires checking the goods and approving the exact action.

Use the [n8n monitoring guide]({{ '/guides/n8n-1688-procurement-workflow/' | relative_url }}) to create a private status sheet.


## Sources and verification

Reviewed November 6, 2026 by the Nexscope Team against the procurement operation reference and request schemas in the main-site implementation. The examples are illustrative templates, not live buyer-account results. No paid request, order, payment, invoice or supplier verification was performed for this guide.

[Inspect the workflow reference](https://www.nexscope.ai/api-docs/1688-order-status?view=api&co-from=learn) and [current pricing](https://www.nexscope.ai/pricing?co-from=learn) before execution. Outer response processing time is not a credit charge.

## Related procurement guides

- [1688 API authorization: connect and verify your buyer account]({{ "/guides/1688-api-authorization/" | relative_url }})
- [1688 order preview API: check SKU, quantity and freight]({{ "/guides/1688-order-preview-api/" | relative_url }})
- [1688 order API: preview, create and retrieve a payment link]({{ "/guides/1688-order-api/" | relative_url }})
- [1688 invoice API: amounts, applications and partial failures]({{ "/guides/1688-invoice-api/" | relative_url }})
- [n8n 1688 workflow: purchase previews and an order-status sheet]({{ "/guides/n8n-1688-procurement-workflow/" | relative_url }})
