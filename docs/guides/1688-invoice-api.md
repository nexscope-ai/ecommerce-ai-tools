---
learning_topic: "sourcing"
related_topics: ["agents"]
content_kind: "guide"
layout: "default"
title: "1688 Invoice API: Amounts and Applications | Nexscope"
description: "Use the 1688 invoice API to read eligible amounts and prepare confirmed applications. Keep cents exact and inspect partial failures. Follow the guide."
permalink: "/guides/1688-invoice-api/"
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
  id: 1688_invoice_api
  title: Inspect the API for this workflow
  description: "New users receive 1,000 credits to get started. Check current access and credit requirements before running a request."
  label: Open the API reference
  url: https://www.nexscope.ai/api-docs/1688-invoice-amount?view=api&co-from=learn
---

# 1688 invoice API: amounts, applications and partial failures

{% include api-guide-entry.html %}

The 1688 invoice API separates checking an order's invoice amount from applying for an invoice. Nexscope exposes both operations. Preserve exact cents, validate purchaser information and inspect every result row. Platform success does not establish that every application succeeded.

## Prepare the source records

Use the intended [authorized buyer]({{ '/guides/1688-api-authorization/' | relative_url }}) and actual order IDs as positive decimal strings. Keep purchaser details private. Product listings and estimated tax calculations do not establish invoice eligibility.

Create a private review row per order: buyer label, order ID, returned amount, invoice type, title type, title, observation time and decision. This distinguishes an already-applied order from one needing attention.

## Read the eligible amounts

```text
POST https://api.nexscope.ai/alibaba1688/invoiceAmount
```

```json
{
  "orderIds": [
    "3309156590237728779"
  ]
}
```

Inspect `orderInvoiceAmountModelList[].orderId`, `amount` and `retCodes`. Match results by order ID rather than array position. Missing or failed rows remain unresolved; never borrow another order's amount.

The returned amount is an integer in **cents**. Copy it unchanged into the corresponding application. As an arithmetic-only illustration, 840 cents displays as 8.40 yuan; the application amount remains 840, not 8.4 or 84000. This is not a real invoice result.

The schema allows 64-bit integers. Preserve exact values in parsing and storage. JavaScript applications must handle values outside the safe integer range with a lossless representation and appropriate serialization rather than silently rounding financial amounts.

## Validate purchaser information

| Input | Contract requirement |
| --- | --- |
| `invoiceType` | `VATAX_COMM` or `VATAX_SPEC` |
| `titleType` | `PERSONAL` or `COMPANY` |
| `title` | Required purchaser title |
| COMPANY | Also requires `taxpayerIdentify` |
| COMPANY with VATAX_SPEC | Also requires `bankName`, `bankAccountId`, `registerAddress`, `registerPhone` |

Validate those conditions before review. This checklist describes request fields; it does not determine a buyer's tax treatment or eligibility.

## Prepare a confirmed application

```text
POST https://api.nexscope.ai/alibaba1688/invoiceApply
```

```json
{
  "invoiceApplyModelList": [
    {
      "orderId": "3309156590237728779",
      "amount": 840,
      "invoiceType": "VATAX_COMM",
      "purchaserInvoiceTitleModel": {
        "titleType": "PERSONAL",
        "title": "Example recipient"
      }
    }
  ],
  "confirmApplyInvoice": false
}
```

The template is not an executed application. `confirmApplyInvoice=false` intentionally leaves the write unapproved. Replace the example ID, amount and title. A real submission needs JSON boolean `true` after explicit approval of the exact buyer, orders, amounts and purchaser details. Changed fields require a new decision.

Do not use the example 840 as a default. Each row must use the amount returned for its own order.

{% include article-action.html placement="article-middle" %}

## Inspect partial outcomes

Check HTTP status, numeric Nexscope code and the provider business result, including a retained nested wrapper when present. Inspect **both** `successList` and `failedList`, even with outer `code=0`. Record each order's result and errors.

A mixed batch is not permission to replay all applications. `INVOICE_ALREADY_APPLIED` means already invoiced; do not repeatedly submit that order. Issued invoices cannot be rolled back through this operation.

On a timeout, reconcile invoice state before another write. Isolate failed rows needing corrections, check eligibility again and obtain fresh confirmation. Keep raw cents separately from display values. Remove purchaser details from broad analytics and redact support messages while preserving a trace identifier where available.

**Is HTTP success enough?** No. Inspect platform, provider and per-order outcomes.

**Can the amount be calculated from an estimated order total?** Use the amount returned by `invoiceAmount` for the exact order.

For earlier steps, read [purchase preview]({{ '/guides/1688-order-preview-api/' | relative_url }}) and [order creation]({{ '/guides/1688-order-api/' | relative_url }}).


## Sources and verification

Reviewed November 6, 2026 by the Nexscope Team against the procurement operation reference and request schemas in the main-site implementation. The examples are illustrative templates, not live buyer-account results. No paid request, order, payment, invoice or supplier verification was performed for this guide.

[Inspect the workflow reference](https://www.nexscope.ai/api-docs/1688-invoice-amount?view=api&co-from=learn) and [current pricing](https://www.nexscope.ai/pricing?co-from=learn) before execution. Outer response processing time is not a credit charge.

## Related procurement guides

- [1688 API authorization: connect and verify your buyer account]({{ "/guides/1688-api-authorization/" | relative_url }})
- [1688 order preview API: check SKU, quantity and freight]({{ "/guides/1688-order-preview-api/" | relative_url }})
- [1688 order API: preview, create and retrieve a payment link]({{ "/guides/1688-order-api/" | relative_url }})
- [1688 order tracking API: connect status, parcels and traces]({{ "/guides/1688-order-tracking-api/" | relative_url }})
- [n8n 1688 workflow: purchase previews and an order-status sheet]({{ "/guides/n8n-1688-procurement-workflow/" | relative_url }})
