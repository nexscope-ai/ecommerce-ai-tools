---
learning_topic: agents
related_topics: [creative]
content_kind: guide
layout: default
title: "AI Image Generator API in Python: Request to Download"
description: "Use a Python image generation API starter with one product reference. Save the task ID, query its result and download a returned image for review."
permalink: /guides/image-generation-api-python/
date_published: 2026-11-06
date_modified: 2026-11-06
last_modified_at: 2026-11-06
last_reviewed: 2026-11-06
author: Nexscope Team
schema_type: Article
og_type: article
compact_evidence: true
evidence_scope: "Nano Banana 2 integration example checked with offline fixtures. No new paid image-generation request was executed."
suppress_article_help: true
topic: creative
keywords: [AI image generator API, image generation API Python, image editing API, image generation MCP]
next_step:
  id: image_api_python
  intent: api-evaluation
  title: Inspect the image request before integrating
  description: Open the currently listed Nano Banana 2 API, check reference inputs, account access and the credit estimate, then adapt the starter to your own permitted image.
  label: Open Nano Banana 2 API tester
  url: https://www.nexscope.ai/api-docs/banana-2-image-generation?view=playground&co-from=learn
faq:
  - question: "Which image generation API does this Python example use?"
    answer: "It uses Nexscope's Nano Banana 2 route. Other models have their own schemas, access conditions and task routes; this is not a GPT Image 2.6 client or a universal provider wrapper."
  - question: "Does the starter automatically retry a failed image request?"
    answer: "No. Submit makes one POST, query makes one GET and download makes one separate media GET. It does not automatically retry, poll or publish an output."
  - question: "Does a successful task mean the image is ready to publish?"
    answer: "No. Inspect the actual image against the reference and approved facts. A task can complete while changing a label, color, quantity or product shape."
---

# AI image generator API in Python: submit, query and download

**Connect an image generation API by keeping the request, task receipt and completed media as separate records.** This Python tutorial uses one currently available Nexscope Nano Banana 2 route and one permitted product reference. You will save the raw response, check the same task and download a selected returned image for review.

{% include article-action.html placement="article-top" %}

Prefer a visual integration? Use the [n8n product image workflow]({{ '/guides/n8n-image-generation/' | relative_url }}). For a different reference-image route and a two-photo composition exercise, see the [Seedream API tutorial]({{ '/guides/seedream-api-python/' | relative_url }}).

## What do you need before the first request?

Download the [Python 3.10+ starter]({{ '/assets/downloads/image-generation-starter.py' | relative_url }}) and [product-image request template]({{ '/assets/downloads/banana2-product-image-request.json' | relative_url }}). The starter uses Python's standard library. It makes no API call when you download or inspect it.

Prepare your own API key, confirm account eligibility and inspect the request estimate. Keep the key in `NEXSCOPE_API_KEY` using your normal local secret-management method. Never paste it into the JSON template, public browser code or a support screenshot.

The [current Nano Banana 2 reference](https://www.nexscope.ai/api-docs/banana-2-image-generation?view=api) governs the request. Other image models expose different controls. New features announced for GPT Image 2.6 do not establish that a Nano Banana 2 request accepts GIF, SVG, markup or complexity parameters.

## 1. Prepare a bounded product-image request

**Use one clear reference and one controlled edit.** Replace the placeholder below with a retrievable image you have permission to send. This is a request template, not a generation performed for this article:

```json
{
  "imageUrls": ["https://example.com/replace-with-your-product.webp"],
  "prompt": "Change only the background to a neutral tabletop with soft side lighting. Preserve the supplied product, shape, cap, label, color and quantity. Add no text or accessories.",
  "outputNum": 1,
  "resolution": "1K",
  "aspectRatio": "1:1"
}
```

The download intentionally accepts one reference and one output. The full API documents a wider range. The starter validates its narrow request shape, not the remote image's contents, permissions, dimensions or file size. Check those against the current reference before submitting.

| Input | Starter choice | Why |
| --- | --- | --- |
| Reference | One permitted HTTPS image | Keeps the identity check manageable |
| Output count | One | Makes the first request and review explicit |
| Resolution | 1K | A controlled initial configuration, not a promise of sufficient final quality |
| Aspect ratio | 1:1 | A matched initial frame; choose the final placement separately |
| Prompt | One background change | Helps isolate unrelated product changes |

## 2. Submit once and retain the task receipt

```shell
python image-generation-starter.py submit banana2-product-image-request.json --output image-submit-001
```

This sends one **paid POST** to `https://api.nexscope.ai/image/banana2ImageGeneration`. It saves `response.json` before interpretation and writes a small `task.json` summary after validation. Every invocation needs a new output directory so earlier evidence is not overwritten.

The initial response can contain `data.taskId` and a pending state. That is a receipt, not a finished image. HTTP 200 alone is insufficient: the client checks the platform business code and task envelope. The outer `cost` field describes elapsed time, not charged credits.

If submission times out or the response is unclear, inspect task and usage history before deciding to send another POST. An unchanged retry may create another billable generation. The starter does not automatically retry.

## 3. Query the same task deliberately

Copy the actual returned task ID into:

```shell
python image-generation-starter.py query YOUR_TASK_ID --output image-query-001
```

The query uses `GET /image/banana2ImageGeneration/tasks/{taskId}` on the same API origin. It performs one request and preserves its raw result. Querying a task does not submit a new generation.

| State | What to do |
| --- | --- |
| `PENDING`, `RUNNING` | Keep the ID and check it later, respecting current rate guidance |
| `SUCCEEDED` | Inspect `data.result` and select the returned image resource that belongs to the task |
| `FAILED`, `TIMEOUT` | Preserve the error, inspect usage and refund information, then review the input |
| Invalid business code or unexpected shape | Stop and inspect the saved response before changing the client |

The completed result is capability-specific. The starter does not guess a URL field, replace missing data with an example URL, or infer charges from processing time.

{% include article-action.html placement="article-middle" %}

## 4. Download one returned image without sending your API key

**Read the successful response and copy the actual Nexscope-hosted media URL you want to inspect.** Then run:

```shell
python image-generation-starter.py download "RETURNED_NEXSCOPE_IMAGE_URL" --output image-download-001
```

The placeholder is deliberately rejected. Download makes one separate HTTPS media request **without the API authorization header**. This starter accepts `store.nexscope.ai` and `www.nexscope.ai`, refuses redirects and checks for PNG, JPEG or WebP content with a 32 MiB size ceiling. It names the saved file from the response's image content type rather than assuming every output is a PNG.

If the returned resource uses another host or format, inspect the current official result contract before adapting the download logic. Do not forward an API key to an unfamiliar media host. A successful download is a saved candidate, not approval to publish it.

## 5. Review the image and its actual cost

Compare the candidate with the reference at the size of the intended placement. Check product identity, label, color, quantity, accessories, implied function and any visible claims. Use the [product photography prompts and review workflow]({{ '/ai-product-image-generator/' | relative_url }}) to record the decision.

Preserve the request, receipt, raw query response, chosen resource, actual charged credits and approval reason. The [recorded Flare edit]({{ '/api-evidence/gpt-image-2-5-flare/' | relative_url }}) demonstrates a completed task that still changed product details; it is an older, different model example, not a Nano Banana result from this tutorial.

## Can you call the same image tool with MCP?

A compatible client can inspect `nexscope_banana_2_image_generation`. Download the [MCP call template]({{ '/assets/downloads/banana2-image-mcp-call.json' | relative_url }}) and replace its image reference before use. It is a documentation example, not an executed tool call. Follow Nexscope's current connection instructions and inspect the tool schema in your client.

Keep a task receipt and review boundary in the agent workflow as well. Giving an agent a tool does not supply a publishing approval or make a generated product fact true. The [Seedance API guide]({{ '/guides/seedance-api/' | relative_url }}) covers a separate video task lifecycle.

## Frequently asked questions

### Which image generation API does this Python example use?

Nexscope Nano Banana 2. It is not a universal client or a GPT Image 2.6 integration. Match another route's schema and lifecycle before adapting it.

### Does the starter automatically retry a failed image request?

No. Each command makes one deliberate request. There is no background polling, repeat generation or automatic publication.

### Does a successful task mean the image is ready to publish?

No. Completion, download and product approval are separate decisions.

## Validation and sources

The starter was checked with constructed offline responses and mocked HTTP, including task errors, download restrictions and request counts. No new paid image request or live MCP call was performed for this guide.

- [Nano Banana 2 request and task reference](https://www.nexscope.ai/api-docs/banana-2-image-generation?view=api)
- [Nexscope MCP connection guide](https://www.nexscope.ai/mcp-map?co-from=learn)
- [Current plans and access](https://www.nexscope.ai/pricing?co-from=learn)
