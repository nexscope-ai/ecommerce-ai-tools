---
learning_topic: "sourcing"
related_topics: ["agents"]
content_kind: "guide"
layout: "default"
title: "n8n 1688 Workflow: Preview and Order Status | Nexscope"
description: "Design an n8n 1688 workflow for authorized order previews and a private status sheet. Add budget checks and human review before writes. Follow the guide."
permalink: "/guides/n8n-1688-procurement-workflow/"
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
  id: n8n_1688_procurement_workflow
  title: Inspect the API for this workflow
  description: "New users receive 1,000 credits to get started. Check current access and credit requirements before running a request."
  label: Open the API reference
  url: https://www.nexscope.ai/api-docs/1688-order-preview?view=api&co-from=learn
---

# n8n 1688 workflow: purchase previews and an order-status sheet

{% include api-guide-entry.html %}

An n8n 1688 workflow can turn purchase questions into a review queue and monitor existing orders. Begin with two branches: manually triggered purchase previews and scheduled reads of verified order IDs. Keep order creation and payment decisions outside the initial automation.

## Define the outputs

The preview branch produces a proposed-purchase row with exact identifiers, quantity, destination reference and original quote fields. The monitoring branch produces an order summary and parcel observations. Neither branch places an order or pays a supplier.

This is a node-by-node design from the Nexscope implementation contract, not an exported workflow tested in a live n8n instance. No execution time, purchase result or free-call allowance is claimed.

## Configure credentials and buyer access

Complete [buyer authorization]({{ '/guides/1688-api-authorization/' | relative_url }}) manually. Use an n8n credential for HTTP Request authentication: `Authorization: Bearer YOUR_API_KEY`. Send JSON content. Keep the key out of Edit Fields nodes, sheet cells and exported workflows.

Run manually before scheduling. Call `authorizedStores` with `{}` and verify the intended account is ACTIVE and not expired. A valid key alone does not prove buyer authorization is usable.

## Branch A: build a preview review row

| Step | Suggested node | Result |
| --- | --- | --- |
| 1 | Manual Trigger | Explicit preview run |
| 2 | Edit Fields | String offer ID, quantity and explicit flow |
| 3 | HTTP Request: `sku` | Specification candidates |
| 4 | Human selection | Exact `specId` |
| 5 | HTTP Request: `receiveAddressList` | Reviewed destination reference |
| 6 | HTTP Request: `orderPreview` | Proposal status and amounts |
| 7 | IF / validation | Success or failure/review branch |
| 8 | Private database or sheet | Review row without secrets |

Use the [preview request template]({{ '/guides/1688-order-preview-api/' | relative_url }}). Configure POST to `https://api.nexscope.ai/alibaba1688/orderPreview`. Map actual string IDs rather than sample values. Explicitly select `flow`; a Skill script's default does not establish a default for your HTTP node.

Check HTTP status, numeric outer code and the operation result. Inspect nested business data when a provider wrapper is retained. Preview `status=false` goes to review, never an order-creation node.

## Store money with units

Preview totals, shipping and discounts are cents. `cargoList.finalUnitPrice` and `cargoList.amount` are yuan. Keep source-unit and display columns; do not apply one divide-by-100 expression to the whole response.

Useful review columns include run time, buyer label, offer ID, spec ID, quantity, address ID, flow, preview status, original totals and unresolved messages. Recipient details should be visible only to the reviewers who need them.

{% include article-action.html placement="article-middle" %}

## Branch B: monitor verified orders

Start with a private table of real `aliOrderId` strings. Use a Schedule Trigger and iterate rows. Read `orderStatus`, then `logistics` and `logisticsTrace` where shipment monitoring is needed. The [tracking guide]({{ '/guides/1688-order-tracking-api/' | relative_url }}) explains parcel keys and Asia/Shanghai times.

Keep summaries keyed by buyer and order ID, with separate parcel records keyed by order and logistics ID. Preserve the last successful observation and mark later failures explicitly. Empty traces and failed requests must not produce the same label.

## Budget before enabling the schedule

Calculate orders multiplied by refreshes, plus logistics and per-parcel calls. Check current prices and limits rather than assuming equal node costs or free execution. Start with a small manual sample. Use bounded recovery for reads; stop on invalid credentials or insufficient credits. Do not reuse automatic read retries for writes.

## Extend after review is reliable

The [order guide]({{ '/guides/1688-order-api/' | relative_url }}) covers separate confirmations and uncertain-write recovery. A future extension should show the exact proposal and wait for a person's decision. Never open a payment link or pay automatically, and never infer receipt approval from a delivered trace.

**Can this be adapted to Make?** The sequence can be adapted, but module mappings and error handling need separate testing. This is not a tested Make scenario.

**Can MCP use these operations?** The catalog defines names such as `nexscope_data_alibaba1688_order_preview`. Verify the tool is present and inspect its schema in the connected client. A code-defined name is not proof of availability in your session.


## Sources and verification

Reviewed November 6, 2026 by the Nexscope Team against the procurement operation reference and request schemas in the main-site implementation. The examples are illustrative templates, not live buyer-account results. No paid request, order, payment, invoice or supplier verification was performed for this guide.

[Inspect the workflow reference](https://www.nexscope.ai/api-docs/1688-order-preview?view=api&co-from=learn) and [current pricing](https://www.nexscope.ai/pricing?co-from=learn) before execution. Outer response processing time is not a credit charge.

## Related procurement guides

- [1688 API authorization: connect and verify your buyer account]({{ "/guides/1688-api-authorization/" | relative_url }})
- [1688 order preview API: check SKU, quantity and freight]({{ "/guides/1688-order-preview-api/" | relative_url }})
- [1688 order API: preview, create and retrieve a payment link]({{ "/guides/1688-order-api/" | relative_url }})
- [1688 order tracking API: connect status, parcels and traces]({{ "/guides/1688-order-tracking-api/" | relative_url }})
- [1688 invoice API: amounts, applications and partial failures]({{ "/guides/1688-invoice-api/" | relative_url }})
