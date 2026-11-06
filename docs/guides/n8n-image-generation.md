---
layout: default
learning_topic: agents
related_topics: [creative]
content_kind: guide
title: "n8n Image Generation: Product Photo to Reviewed Asset"
description: "Download an n8n image generation workflow for Nano Banana 2: validate one product brief, submit once, query its saved task and stop for image review."
permalink: /guides/n8n-image-generation/
date_published: 2026-11-06
date_modified: 2026-11-06
last_modified_at: 2026-11-06
last_reviewed: 2026-11-06
author: Nexscope Team
schema_type: Article
og_type: article
compact_evidence: true
evidence_scope: "Downloadable workflow with offline code and graph checks. No import into a live n8n instance or paid generation was performed for this article."
suppress_article_help: true
topic: creative
keywords: [n8n image generation, n8n AI image workflow, Nano Banana n8n, product image automation]
next_step:
  id: n8n_image_generation
  intent: api-evaluation
  title: Inspect the image API before connecting n8n
  description: Review the Nano Banana 2 request, API access and estimate. Then attach your own credential to both HTTP nodes in the downloaded workflow.
  label: Open Nano Banana 2 API tester
  url: https://www.nexscope.ai/api-docs/banana-2-image-generation?view=api#online-test
faq:
  - question: "Does this n8n image workflow need a Nexscope community node?"
    answer: "No. The template uses built-in Manual Trigger, Code, HTTP Request, Wait and If nodes. It calls Nexscope's Nano Banana 2 REST route; it does not claim an official native Nexscope node."
  - question: "Does the workflow automatically publish a generated product image?"
    answer: "No. Its final record is for human review, a task failure or a polling limit. It includes no publishing or media-download node."
  - question: "Will the workflow keep submitting until it gets an image?"
    answer: "No. A full manual execution contains one generation POST. Only the task query loops, with at most six GETs separated by 30-second waits. Restarting the full workflow can create another paid task."
---

# n8n image generation: turn one product photo into a reviewable task

**Connect n8n to an image-generation API by separating the paid submission from later task queries.** This guide provides a one-product workflow for Nexscope's Nano Banana 2 route. It validates a product brief, saves the task ID, checks the same task and produces a record for human review.

{% include article-action.html placement="article-top" %}

## Download the workflow and understand its boundary

Download the [n8n workflow JSON]({{ '/assets/downloads/n8n-product-image-generation.json' | relative_url }}) and [asset review log]({{ '/assets/downloads/creative-api-review-log.csv' | relative_url }}). The export is inactive, has no embedded key or pinned output, and contains a fictional organizer brief with a deliberately rejected image placeholder.

The template uses built-in nodes and generic HTTP authentication. It is not an official native Nexscope n8n node. Its JavaScript and graph were checked offline with constructed API responses. It has not been imported into a live n8n instance or run against a paid image request for this article. Check the node configuration and credential selectors in your own n8n version before executing.

```text
Manual Trigger → Edit brief → Validate request → Submit image once
→ Save task receipt → Wait 30 seconds → Query saved task → Check state
                                             ↑                 ↓
                                             └── If pending ───┘
                                                  otherwise → Review / failure / limit
```

Only the query loop repeats. It cannot reach the submission node. The workflow stops polling after its sixth query, even if the task is still running; it does not cancel the server-side task.

## 1. Import and keep the first run manual

Use n8n's workflow import option to load the JSON. Inspect each node before running it. The export uses HTTP Request version 4.2, Code version 2, Wait version 1.1 and If version 2.2; if your instance cannot load a version, resolve that compatibility issue first rather than executing a partial flow.

Open **Edit product brief**. Replace the fictional SKU, placeholder image and prompt with your own product information. Keep the input to one product while you verify the flow. A successful manual run is the point to evaluate a later spreadsheet trigger, not a reason to activate a whole catalog immediately.

The initial brief is a Code node returning one item:

```javascript
return [{json:{
  sku: 'YOUR-SKU',
  imageUrl: 'https://example.com/replace-with-your-product.webp',
  prompt: 'Change only the setting to a neutral tabletop. Preserve the product shape, visible compartments, color and quantity. Add no text or accessories.',
  approvedForOnePaidRequest: false
}}];
```

After inspecting the current estimate and intended request, set `approvedForOnePaidRequest` to `true`. This is a deliberate configuration flag, not a billing cap or a durable record that a SKU has already been generated. A new full execution can submit again.

## 2. Configure your API credential in both HTTP nodes

Create or select an **HTTP Header Auth** credential in n8n. Its header name is `Authorization`; its value is `Bearer YOUR_NEXSCOPE_API_KEY`. Select that credential in both **Submit image once** and **Query saved task**. The key belongs in n8n's credential store, not in the brief, code, query string or exported JSON.

Confirm account access and the estimate on the [Nano Banana 2 API page](https://www.nexscope.ai/api-docs/banana-2-image-generation?view=api). A visible tool or a successful workflow import does not establish execution eligibility.

| HTTP node | Operation | Request behavior |
| --- | --- | --- |
| Submit image once | POST to `/image/banana2ImageGeneration` | Sends one validated JSON body per full manual execution |
| Query saved task | GET to that route's `/tasks/{taskId}` | Uses the retained receipt, not an invented ID |

Both use `https://api.nexscope.ai`. Automatic node retries and redirects are disabled in this export. Non-success HTTP responses stop execution; HTTP 200 responses still pass through a business-code check. See n8n's [HTTP Request documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) for the node's setup controls.

## 3. Validate and submit a small image request

**Validate product request** requires a SKU, an approved flag, a non-placeholder HTTPS reference and a nonempty prompt. It creates one 1K, 1:1 request with one output and one reference. These are choices for this pilot, not the complete API's limits.

The validator does not fetch the reference or check its actual file format, dimensions or permissions. Inspect those yourself before submitting. A fictional prompt cannot establish that a product feature exists.

Run the complete workflow once with the configured brief. The HTTP node sends a paid generation request. **Save task receipt** checks the business code and task envelope, then retains the SKU, request and raw submission response with the task ID. Save the execution record under your normal retention policy before leaving a task unfinished.

{% include article-action.html placement="article-middle" %}

## 4. Query until completion or the polling limit

The Wait node pauses for 30 seconds before each task query. The checker accepts only a known task state with the same saved ID. A pending result may return to Wait; a completed or failed task exits the loop. The sixth pending query also exits.

| Final record | Meaning | Next action |
| --- | --- | --- |
| `needs_human_review` | Task succeeded with a completed result object | Inspect its actual returned image and compare with the product |
| `inspect_failure` | Task returned FAILED or TIMEOUT | Review the raw result and usage record |
| `poll_limit_reached` | Task remains PENDING or RUNNING after six queries | Retain its ID and query it later; the task is not cancelled |
| Node error | Transport, business-code or envelope validation failed | Inspect the saved execution; do not automatically resubmit |

The interval and six-query ceiling are tutorial choices, not an API completion-time promise or an official rate limit. Follow current service guidance if it requires a different schedule. n8n's [Wait node documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/) explains interval-based resumption.

To resume a pending task, use its saved ID in the current API tester or the query command in the [Python image API guide]({{ '/guides/image-generation-api-python/' | relative_url }}). Do not restart the whole manual workflow just to check the old task: that reaches the paid POST again. Partial execution or edited loop settings are outside this template's bounded full-run behavior.

## 5. Review the candidate before connecting a destination

The final node exposes the receipt, last query response and decision. It does not guess a universal image URL field, download media or publish to a store. Inspect the actual resource in the completed response and record the chosen output in the worksheet.

Check shape, visible compartments, label, color, quantity and implied accessories against the source. Keep actual charged credits and any confirmed refund separate from whether the image passes your review. The envelope's `cost` is elapsed time, not the bill.

For example, if an organizer gains another compartment, record a rejection even when the background improves. Adjust the next brief deliberately. Do not let a successful API state bypass the product check.

## When should you add Google Sheets or batch inputs?

After one product passes, design a durable ledger with SKU, input version, task ID and execution state before adding a scheduled trigger. Updating a sheet after a request does not by itself prevent duplicate submissions if a process crashes between the two operations.

Use explicit request budgets, rate guidance and a recovery procedure before scaling. The [paid API workflow guide]({{ '/guides/paid-api-workflow-retries-deduplication/' | relative_url }}) covers retry and deduplication decisions. The [product photography guide]({{ '/ai-product-image-generator/' | relative_url }}) supplies the creative review context. If you need a second image route in code, use the separate [Seedream API tutorial]({{ '/guides/seedream-api-python/' | relative_url }}).

## Frequently asked questions

### Does this n8n image workflow need a Nexscope community node?

No. It uses built-in nodes and the Nano Banana 2 REST route.

### Does the workflow automatically publish a generated product image?

No. It ends with a record for review, failure investigation or later task resumption.

### Will the workflow keep submitting until it gets an image?

No. One full manual execution has one generation POST and up to six task GETs. A separate full restart can submit another task.

## Sources and validation scope

- [Nano Banana 2 API](https://www.nexscope.ai/api-docs/banana-2-image-generation?view=api) — current request and task reference.
- [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/) and [Wait](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/) — built-in node configuration.

Offline checks exercise the workflow's code with pending, completed, failed, invalid and mismatched task fixtures, and inspect its connections and polling ceiling. They do not establish live import compatibility, provider availability or generated image quality.
