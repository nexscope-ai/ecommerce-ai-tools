---
layout: default
learning_topic: agents
related_topics: [creative]
content_kind: guide
title: "Kling API Python Tutorial: Product Image to Video"
description: "Connect Nexscope's Kling 2.6 API in Python: submit a product photo, retain the task ID, query its state and download a returned video for review."
permalink: /guides/kling-api-python/
date_published: 2026-11-06
date_modified: 2026-11-06
last_modified_at: 2026-11-06
last_reviewed: 2026-11-06
author: Nexscope Team
schema_type: Article
og_type: article
compact_evidence: true
evidence_scope: "Route-specific integration example checked with offline fixtures. No new paid Kling generation was performed for this tutorial."
suppress_article_help: true
topic: creative
keywords: [Kling API, Kling API Python, Kling image to video API, Kling 2.6 API]
next_step:
  id: kling_api_python
  intent: api-evaluation
  title: Test the Kling request for your product
  description: Open the current Kling 2.6 reference, inspect account access and the estimate, then replace the example image with your own permitted reference.
  label: Open Kling 2.6 API tester
  url: https://www.nexscope.ai/api-docs/kling-2-6-video-generation?view=playground&co-from=learn
faq:
  - question: "Which Kling API does this tutorial use?"
    answer: "It uses Nexscope's Kling 2.6 route and Nexscope account credentials. It does not describe direct authentication, pricing or billing through Kling's own service."
  - question: "Does querying a Kling task create another video?"
    answer: "The starter's query command sends one GET for the saved task ID. Only its submit command sends a generation POST; there is no automatic resubmission."
  - question: "Can I use the same payload for every Kling version?"
    answer: "No. Match the exact version's reference and task route. This starter intentionally implements one first-image configuration for Kling 2.6."
---

# Kling API Python tutorial: turn a product image into a video task

**Use a product image, submit one motion brief and keep the returned task ID until you have reviewed the completed video.** This tutorial implements that sequence for Nexscope's Kling 2.6 route. It includes a Python client, a request template and a review sheet so a developer can retain the request, response and asset as one record.

{% include article-action.html placement="article-top" %}

## What will this example create?

The example brief describes a fictional desk organizer and a slow camera push toward a stationary item. It is an unexecuted request, not a sample of generated footage. Replace its image with a photo you may send and check whether the selected framing suits your real product.

Download the [Python 3.10+ client]({{ '/assets/downloads/kling26-product-video-starter.py' | relative_url }}), [request JSON]({{ '/assets/downloads/kling26-product-video-request.json' | relative_url }}) and [review log]({{ '/assets/downloads/creative-api-review-log.csv' | relative_url }}). The client uses the standard library. Downloading or opening the files does not call the API.

This is an integration through Nexscope. Confirm current account access, API eligibility and estimated credits in the [Kling 2.6 reference](https://www.nexscope.ai/api-docs/kling-2-6-video-generation?view=api). Use a Nexscope key in the local `NEXSCOPE_API_KEY` environment variable. Keep it out of the request file and shared logs. For the distinction between estimates, charged credits and approved outputs, see [Kling pricing and cost review]({{ '/guides/kling-ai-pricing/' | relative_url }}).

## 1. Prepare one first-image request

**Begin with one product and one movement.** The downloadable starter deliberately narrows the available controls to this configuration:

```json
{
  "imageUrl": "https://example.com/replace-with-your-product.webp",
  "prompt": "Keep the supplied desk organizer stationary. Use a slow camera push-in. Preserve the visible compartments, color, proportions and quantity. Add no text, accessories or new product features.",
  "resolution": "1080p",
  "videoTime": 5,
  "aspectRatio": "9:16",
  "isPro": false,
  "promptOptimizer": false
}
```

The placeholder is rejected by the client. Use a retrievable HTTPS reference, inspect the source photo and confirm its current file requirements before running. The client checks request structure; it does not fetch the reference or establish its image quality, permissions or dimensions.

| Design choice | Why it is in this exercise |
| --- | --- |
| One first image | Makes it clear which product the reviewer should compare with the result |
| Five-second clip | Keeps the initial motion brief small enough to inspect frame by frame |
| Vertical frame | Defines one destination shape rather than mixing placements |
| Optimization off | Keeps the submitted wording available as the baseline |
| Pro mode off | Avoids silently changing the initial configuration |

The full route has other options, including additional references and a final-frame control with its own constraints. Those are not implemented by this bounded client. Use the exact reference before changing the schema; do not rename a Seedance payload and assume the controls match.

## 2. Submit once and save the receipt

```text
python kling26-product-video-starter.py submit kling26-product-video-request.json --output kling-submit-001
```

This makes one chargeable `POST` to `/video/kling26VideoGeneration` on `https://api.nexscope.ai`. It saves the raw response as `response.json` before interpreting it. When the envelope passes validation, it also writes a small `task.json` with the returned task ID and state.

Choose a new output folder for each command. The starter refuses to reuse a directory, helping you retain earlier records. HTTP 200 alone does not establish task acceptance: the outer business code must be integer `0`, with a valid task envelope. A pending receipt is not a playable video.

If the connection times out after submission, inspect account task and usage history before sending another POST. The server may already have accepted the first job. The client does not automatically retry or promise exactly-once execution across a network failure.

## 3. Query the saved Kling task

Copy the actual ID from the receipt:

```text
python kling26-product-video-starter.py query YOUR_TASK_ID --output kling-query-001
```

The client makes one `GET /video/kling26VideoGeneration/tasks/{taskId}` and checks that the returned ID matches. It does not poll in the background or create another generation.

| Returned state | Next action |
| --- | --- |
| PENDING or RUNNING | Retain the ID; query later using current rate guidance |
| SUCCEEDED | Inspect the completed result and select its video resource |
| FAILED or TIMEOUT | Keep the response and inspect the error and billing record |
| Unexpected code, ID or result | Stop and examine the raw response before adapting the parser |

The completed resource fields can vary by capability. This client keeps the raw result rather than guessing a universal video URL field. The platform envelope's `cost` field measures elapsed time, not charged credits. Record actual billing from the usage record or documented task usage when present.

{% include article-action.html placement="article-middle" %}

## 4. Download the returned video for review

Read the completed result and select the actual Nexscope-hosted video URL:

```text
python kling26-product-video-starter.py download "RETURNED_NEXSCOPE_VIDEO_URL" --output kling-download-001
```

The download command makes one separate media GET without an API authorization header. It accepts HTTPS resources on `store.nexscope.ai` or `www.nexscope.ai`, rejects redirects, requires an MP4 content type and limits the file to 256 MiB. A different returned host or format requires inspection of the current result contract before adapting the client.

These are transport checks, not video decoding or quality tests. A downloaded MP4 is a candidate asset. Compare the complete clip with the source, especially at moments of motion: do compartments change, does a label move, or does a camera angle invent a hidden side? Record the decision and reason in the review log.

Keep a source image, prompt, settings, task ID, returned resource and actual charge with each candidate. For a merchant-facing creation flow, use the [product image-to-video guide]({{ '/ai-video-generator/' | relative_url }}). For the model's broader positioning and attributed feedback, use the separate [Kling 2.6 review]({{ '/guides/kling-2-6-video/' | relative_url }}).

## Can an MCP client submit the same brief?

The route lists `nexscope_kling_2_6_video_generation`. The [MCP call template]({{ '/assets/downloads/kling26-mcp-call.json' | relative_url }}) contains the same request arguments, with no credentials. Follow the [current MCP connection guide](https://www.nexscope.ai/mcp-map), inspect the tool schema and replace the example reference before using it.

The template is not an executed MCP result. Preserve task tracking in an agent integration as well. For a different video route and its own request schema, see the [Seedance API guide]({{ '/guides/seedance-api/' | relative_url }}).

## Frequently asked questions

### Which Kling API does this tutorial use?

Nexscope's Kling 2.6 route. Direct-provider credentials and billing are outside this example.

### Does querying a Kling task create another video?

No. In this client, query is a GET for the saved task. Submit is the separate chargeable generation POST.

### Can I use the same payload for every Kling version?

No. Match the chosen version's schema and task path before adapting it.

## Validation and sources

The client was checked using constructed task responses and mocked HTTP for request counts, error preservation, task identity and download restrictions. No new paid Kling task, live MCP call or product-performance test was run for this article.

- [Nexscope Kling 2.6 API reference](https://www.nexscope.ai/api-docs/kling-2-6-video-generation?view=api) — request, task and account conditions.
- [Current plans](https://www.nexscope.ai/pricing) — access and billing context.
