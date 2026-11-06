---
learning_topic: "sourcing"
related_topics: ["agents"]
content_kind: "guide"
layout: "default"
title: "1688 API Authorization: Connect a Buyer | Nexscope"
description: "Connect your 1688 buyer account with Nexscope API authorization. Verify active access, resolve expired consent and protect credentials. Follow the guide."
permalink: "/guides/1688-api-authorization/"
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
  id: 1688_api_authorization
  title: Inspect the API for this workflow
  description: "New users receive 1,000 credits to get started. Check current access and credit requirements before running a request."
  label: Open the API reference
  url: https://www.nexscope.ai/api-docs/1688-authorize-url?view=api&co-from=learn
---

# 1688 API authorization: connect and verify your buyer account

{% include api-guide-entry.html %}

A 1688 API authorization connects procurement operations to a buyer account. A Nexscope API key identifies your Nexscope user; it does not replace buyer consent. Complete the connection before reading delivery addresses, previewing a purchase or accessing orders.

## Keep the two identities separate

Use the intended Nexscope user and that user's key throughout the workflow. The buyer account completing consent determines which procurement records are available. An account display label is not a password and cannot select somebody else's account.

All operations use POST JSON. For REST authentication send `Authorization: Bearer YOUR_API_KEY` and `Content-Type: application/json`. Keep the real key in a server-side secret manager or automation credential. Do not put it in a shared sheet, workflow export or screenshot.

## Request and complete authorization

```text
POST https://api.nexscope.ai/alibaba1688/authorizeUrl
```

```json
{
  "accountName": "My 1688 account"
}
```

The identifier in this example is a label, not an existing connection. Open the returned `authorizeUrl` manually and complete consent within 10 minutes. Check the signed-in buyer account before approving. Keep the returned URL private. If it expires, obtain a fresh link rather than repeatedly opening the old one.

Generating the URL does not prove consent was completed. The next read verifies that distinction.

## Verify the actual connection

```text
POST https://api.nexscope.ai/alibaba1688/authorizedStores
```

```json
{}
```

The empty object is intentional: the current Nexscope user is selected automatically. Inspect `stores[].accountName`, `status` and `expired`. Continue only with the intended account where status is ACTIVE and expired is false.

| Observation | Next step |
| --- | --- |
| Link generated, consent unfinished | Complete manual consent |
| Intended account ACTIVE and not expired | Continue with a limited read |
| Expired connection | Reconnect the intended buyer |
| Different or unclear buyer identity | Stop and resolve the mismatch |

Do not switch buyers merely to make an error disappear. That changes the meaning of every address and order request.

{% include article-action.html placement="article-middle" %}

## Check the first address read

Call `receiveAddressList` with `{}`. Use an actual returned `items[].addressId` and preserve it as text. Recipient information belongs in a private operational workspace. An empty list is not permission to use a sample or another account's address.

Continue with the [SKU and order preview guide]({{ '/guides/1688-order-preview-api/' | relative_url }}) to connect a selected offer, specification and quantity to the intended destination. Previewing does not create an order.

## Diagnose errors at the right layer

Check HTTP status, numeric Nexscope `code` and the operation result. HTTP 200 alone is insufficient. Procurement can retain a provider code/message/data wrapper; inspect its nested business result when present instead of assuming every `data` object is usable output.

`11209` indicates a missing or nonexistent key; `13011` indicates insufficient credits. `13007` can mean unavailable buyer authorization or a service/proxy failure, so read the message before reconnecting. Retain a redacted message and `traceId` for support. Outer `cost` is processing time, not credits.

**Does authorization approve automatic payment?** No. A buyer connection is not approval of a specific purchase, payment link or payment.

**Can an API key replace consent?** No. Procurement needs the intended user's eligible buyer connection as well as API authentication.


## Sources and verification

Reviewed November 6, 2026 by the Nexscope Team against the procurement operation reference and request schemas in the main-site implementation. The examples are illustrative templates, not live buyer-account results. No paid request, order, payment, invoice or supplier verification was performed for this guide.

[Inspect the workflow reference](https://www.nexscope.ai/api-docs/1688-authorize-url?view=api&co-from=learn) and [current pricing](https://www.nexscope.ai/pricing?co-from=learn) before execution. Outer response processing time is not a credit charge.

## Related procurement guides

- [1688 order preview API: check SKU, quantity and freight]({{ "/guides/1688-order-preview-api/" | relative_url }})
- [1688 order API: preview, create and retrieve a payment link]({{ "/guides/1688-order-api/" | relative_url }})
- [1688 order tracking API: connect status, parcels and traces]({{ "/guides/1688-order-tracking-api/" | relative_url }})
- [1688 invoice API: amounts, applications and partial failures]({{ "/guides/1688-invoice-api/" | relative_url }})
- [n8n 1688 workflow: purchase previews and an order-status sheet]({{ "/guides/n8n-1688-procurement-workflow/" | relative_url }})
