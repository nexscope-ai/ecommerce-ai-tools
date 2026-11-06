---
layout: default
learning_topic: agents
related_topics: [creative]
content_kind: guide
title: "Seedream API Python Tutorial: Reference Photos to Product Images"
description: "Use the Seedream 5 Pro API with product reference photos. Download a Python starter, submit one composition, query its task and review the returned image."
permalink: /guides/seedream-api-python/
date_published: 2026-11-06
date_modified: 2026-11-06
last_modified_at: 2026-11-06
last_reviewed: 2026-11-06
author: Nexscope Team
schema_type: Article
og_type: article
compact_evidence: true
evidence_scope: "Seedream 5 Pro integration example validated with offline fixtures, not a new paid generation or quality benchmark."
suppress_article_help: true
topic: creative
keywords: [Seedream API, Seedream API Python, Seedream 5 Pro API, reference image API]
next_step:
  id: seedream_api_python
  intent: api-evaluation
  title: Inspect the Seedream request with your references
  description: Check the current Seedream 5 Pro settings, API eligibility and estimate before sending permitted product reference photos.
  label: Open Seedream 5 Pro API tester
  url: https://www.nexscope.ai/api-docs/seedream-5-pro-image-generation?view=api#online-test
faq:
  - question: "Which Seedream version does the Python starter call?"
    answer: "It calls Nexscope's Seedream 5 Pro route. Credentials, billing and controls belong to that integration, not every provider or Seedream version."
  - question: "Why does the example use two product photos?"
    answer: "The example uses a main view and a detail view of the same variant to describe a reviewable reference brief. The client accepts one or two references; more photos do not guarantee accurate output."
  - question: "Does this Seedream starter generate 4K images?"
    answer: "No. This starter uses one 2K, 4:3 output. The reviewed Seedream 5 Pro route lists 1K and 2K, and other settings require checking their exact model reference."
---

# Seedream API Python tutorial: build a reference-led product image request

**Use consistent reference photos to make the intended product clear before asking Seedream to change its composition.** This tutorial connects Nexscope's Seedream 5 Pro API with a main photo and a detail photo of the same variant. It provides a narrow Python client and a review process for one returned image.

{% include article-action.html placement="article-top" %}

## Start with the correct Seedream route

Download the [Python 3.10+ client]({{ '/assets/downloads/seedream5-product-image-starter.py' | relative_url }}), [reference-photo request]({{ '/assets/downloads/seedream5-product-image-request.json' | relative_url }}) and [review log]({{ '/assets/downloads/creative-api-review-log.csv' | relative_url }}). These files do not run a generation when opened. Put your Nexscope key in the local `NEXSCOPE_API_KEY` environment variable and confirm current API eligibility and the estimate in the [Seedream 5 Pro reference](https://www.nexscope.ai/api-docs/seedream-5-pro-image-generation?view=api).

The guide uses Nexscope's endpoint and billing. For a general introduction to the submit, query and download pattern using Nano Banana 2, read the [image generation API tutorial]({{ '/guides/image-generation-api-python/' | relative_url }}). Here, the distinct task is selecting consistent references for a Seedream composition and checking which visible product details survive.

## 1. Select a main photo and a detail photo

**Choose two views of the same exact item, not two similar variants.** For a fictional desk organizer, a main photo might show the whole unit while a detail photo shows the actual compartment edges. If the second photo depicts another color or package, resolve that mismatch before submitting.

| Reference check | What to record |
| --- | --- |
| Variant identity | Same SKU, color, included pieces and visible construction |
| Useful detail | Which feature the second photo actually clarifies |
| Image access | The HTTPS reference can be retrieved and you may send it |
| Intended composition | What should change, and which item details must remain fixed |
| Missing information | Any hidden surface or feature the references do not establish |

The client accepts one or two references for this exercise. It checks URL and request shape, not the remote files themselves. Inspect dimensions, file size, format and current route requirements separately. More reference photos are not proof of better accuracy.

## 2. Prepare one composition

Replace both placeholders in the downloadable JSON. If you have only one appropriate photo, remove the second array entry:

```json
{
  "imageUrls": [
    "https://example.com/replace-with-your-main-photo.webp",
    "https://example.com/replace-with-your-detail-photo.webp"
  ],
  "prompt": "Use both photos of the same desk organizer as references. Create one neutral tabletop composition. Preserve its visible compartments, color, proportions and quantity. Leave empty space beside the item. Add no text or accessories.",
  "outputNum": 1,
  "resolution": "2K",
  "aspectRatio": "4:3"
}
```

Change “both photos” if you use a single reference. The example is fictional and has not been generated for this article. It requests one landscape image with room for separately approved copy. The client intentionally holds output count, resolution and ratio fixed, making the initial review easier to compare.

The current full route exposes a wider selection of references and ratios. It lists 1K and 2K; this tutorial does not imply a 4K output option. Consult the exact model reference before adapting the client or adding fields.

## 3. Submit and preserve the task receipt

```text
python seedream5-product-image-starter.py submit seedream5-product-image-request.json --output seedream-submit-001
```

The client sends one chargeable `POST /image/seedream5ProImageGeneration` to `https://api.nexscope.ai`. It saves the raw response as `response.json`, then writes `task.json` after validating the business code, task ID and state. Keep the request file beside your review record; no API key belongs in that file.

The output directory must be new for each invocation. HTTP 200 is insufficient: inspect the outer business code and task data. A PENDING response is a receipt. If a response is unclear or the connection fails, inspect task and usage history before resubmitting an unchanged request.

## 4. Retrieve the same task

```text
python seedream5-product-image-starter.py query YOUR_TASK_ID --output seedream-query-001
```

This performs one `GET /image/seedream5ProImageGeneration/tasks/{taskId}`. The client checks that the response belongs to the requested task. It does not create another image or automatically poll.

For PENDING or RUNNING, retain the ID and check later under current rate guidance. For SUCCEEDED, inspect the completed `data.result`. For FAILED, TIMEOUT or an unexpected envelope, preserve the response and inspect the reason before changing the brief. The outer `cost` field is elapsed time, not image credits.

{% include article-action.html placement="article-middle" %}

## 5. Save the image you intend to review

Copy the actual returned media resource from the completed result:

```text
python seedream5-product-image-starter.py download "RETURNED_NEXSCOPE_IMAGE_URL" --output seedream-download-001
```

The starter accepts Nexscope-hosted HTTPS images on `store.nexscope.ai` or `www.nexscope.ai`. It sends no API authorization header to the media request, refuses redirects and accepts PNG, JPEG or WebP content types up to 32 MiB. The response type determines the file extension. It does not decode the image or guess a URL field in the completed result.

If the actual resource uses another host or format, inspect the current contract before adapting the download. Save the original returned image before editing or compressing it, so the review is tied to an identifiable candidate.

## 6. Decide whether the references were preserved

**Compare details before judging the new scene.** For the organizer exercise, review the compartment count, edge shape, proportions, color and visible quantity against both source photos. Reject invented accessories or geometry even when the composition looks attractive.

Record the model, reference set, prompt, settings, task, output and actual charge in the worksheet. Add the reviewer and reason for approval or rejection. If a second experiment changes the reference set, hold the other settings fixed and record the difference. One result does not establish an approval rate or a model ranking.

For prompt ideas and an older observed edit that changed product details, see the [product photography workflow]({{ '/ai-product-image-generator/' | relative_url }}). For Seedream's documented strengths and attributed public feedback, keep the separate [Seedream 5 Pro review]({{ '/guides/seedream-5-pro-image/' | relative_url }}) alongside this integration guide.

## Use the same brief with MCP

The [Seedream MCP call template]({{ '/assets/downloads/seedream5-mcp-call.json' | relative_url }}) names `nexscope_seedream_5_pro_image_generation` and carries the same request arguments. Follow the [current MCP connection guide](https://www.nexscope.ai/mcp-map) and inspect the actual tool schema. The template has not been executed as a live MCP call.

If you prefer a visual workflow for an available image route, the [n8n image-generation guide]({{ '/guides/n8n-image-generation/' | relative_url }}) implements Nano Banana 2. Its route and initial settings differ; do not substitute the model name alone.

## Frequently asked questions

### Which Seedream version does the Python starter call?

Nexscope's Seedream 5 Pro route. Other versions and providers have their own contracts.

### Why does the example use two product photos?

A main view and a detail view can clarify the brief when they show the same variant. They do not guarantee a faithful result. The starter also accepts one reference.

### Does this Seedream starter generate 4K images?

No. It requests one 2K, 4:3 image. The reviewed route lists 1K and 2K.

## Validation and sources

Offline checks cover reference validation, the route-specific request, business and task errors, one-request command behavior and download restrictions. No new paid Seedream output or live MCP response was produced for this tutorial.

- [Nexscope Seedream 5 Pro API](https://www.nexscope.ai/api-docs/seedream-5-pro-image-generation?view=api) — current model request and task contract.
- [Plans and access](https://www.nexscope.ai/pricing) — inspect current eligibility and credit conditions.
