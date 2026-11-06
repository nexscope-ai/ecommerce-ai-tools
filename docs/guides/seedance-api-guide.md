---
learning_topic: creative
content_kind: guide
layout: default
title: "Seedance 2.0 API: Python Request, Task Query & Video Review"
description: "Call the Seedance 2.0 API with a bounded Python starter. Save the task ID, query status and inspect the completed video before downloading."
permalink: /guides/seedance-api/
date_published: 2026-10-23
date_modified: 2026-11-05
last_modified_at: 2026-11-06
last_reviewed: 2026-11-05
author: Nexscope Team
schema_type: Article
compact_evidence: true
evidence_scope: "Documentation and offline-validated client example; no new paid Seedance generation or model benchmark was run."
og_type: article
topic: creative
suppress_article_help: true
next_step:
  id: seedance_api_playground
  title: Inspect Seedance 2.0 before integrating
  description: "Review the supported references and settings in Playground. Video API key access requires an active subscription."
  label: Open Seedance 2.0 Playground
  url: https://www.nexscope.ai/api-docs/seedance-2-0-video-generation?view=playground&co-from=learn
---

# Seedance API guide: choose a route, submit a task and inspect the video

**A Seedance API integration needs more than a generation request: it needs the correct provider route, valid reference inputs and a completed-task check.** This guide covers Seedance 2.0 and 2.5 through Nexscope. It is not ByteDance's official API documentation, and Nexscope authentication and billing should not be copied into another provider's integration.

{% include article-action.html placement="article-top" %}

**[Open Seedance 2.0 Playground](https://www.nexscope.ai/api-docs/seedance-2-0-video-generation?view=playground&co-from=learn) · [Open Seedance 2.5 Playground](https://www.nexscope.ai/api-docs/seedance-2-5-video-generation?view=playground&co-from=learn).** New users receive 1,000 free credits, valid for 3 days. API key access requires an active subscription; the trial does not guarantee a free generation on every route or configuration.

> **Quick answer:** Select the exact version, check access and cost, and provide a compatible reference. Submit the request, retain its task ID, then inspect the completed result rather than treating a submission receipt as a video. For product footage, manually review identity and motion before approving the asset.

*Documentation checked November 5, 2026. Written by Nexscope Team. This is an integration guide, not a new generation benchmark. No chargeable API request was run for this article.*

To implement another video model, use the separate [Kling API Python tutorial]({{ '/guides/kling-api-python/' | relative_url }}). Its request controls and task path belong to Kling 2.6; the payloads are not interchangeable.

## Seedance 2.0 API vs 2.5 API: which route do you need?

Choose by the input and output requirements of the shot. A newer version's larger allowance does not establish better motion, fewer retries or a lower cost for your task.

| Route on Nexscope | Duration | Resolution | Image-reference ceiling |
| --- | --- | --- | --- |
| Seedance 2.0 | 4–15 seconds | 480p, 720p, 1080p | Up to 9 |
| Seedance 2.5 | 4–30 seconds | 480p, 720p, 1080p | Up to 30 |

Check the live [Seedance 2.0 contract](https://www.nexscope.ai/api-docs/seedance-2-0-video-generation?view=api) or [Seedance 2.5 contract](https://www.nexscope.ai/api-docs/seedance-2-5-video-generation?view=api) before sending production requests. In particular, reference-video mode cannot be combined with image-reference inputs. Do not add every available reference field to the same payload.

For editorial strengths, limitations and attributed public feedback, read the [2.0 review]({{ '/guides/seedance-2-0-video/' | relative_url }}) and [2.5 review]({{ '/guides/seedance-2-5-video/' | relative_url }}). The guide here focuses on the integration decision rather than repeating those reviews.

## Can you use a free Seedance API key?

Nexscope's creative API key access requires an active subscription. The advertised new-user trial is a finite app trial balance, not permission to call every creative API. Do not build an integration on the assumption that receiving credits automatically enables a key.

Check [current plans and access conditions](https://www.nexscope.ai/pricing?co-from=learn), then manage the key in your own account. Keep it server-side; never embed it in public browser code, a repository, a screenshot or a support post. Use a placeholder when sharing a reproducible request.

## How do you start a Seedance API request?

Start from the live route example, not a guessed endpoint or an example for another provider. Nexscope documents Bearer authentication and route-specific JSON inputs. The 2.0 submission endpoint is `https://api.nexscope.ai/video/seedance20VideoGeneration`; 2.5 uses a separate endpoint in its linked documentation.

Prepare the following before calling:

1. A valid API key with the required subscription access and enough usable credits.
2. A product image or other supported reference that you are permitted to use.
3. A concise description of one shot, including the motion and product details that must remain unchanged.
4. A supported duration and resolution, plus other fields required by the current contract.
5. A record of the request estimate, model version and settings for later reconciliation.

The documentation examples contain illustrative URLs. Replace them with a retrievable asset; a placeholder URL is not an uploaded reference. Consider the privacy implications of exposing a reference URL and do not publish private or unauthorised source material merely to make an example run.

## Run one Seedance 2.0 request with Python

Download the [Python 3.10+ starter]({{ '/assets/downloads/seedance-task-starter.py' | relative_url }}) and [request template]({{ '/assets/downloads/seedance-20-product-request.json' | relative_url }}). Set `NEXSCOPE_API_KEY` locally using your secret-management method. Replace the example image URL with a retrievable reference you have permission to send; this template is not an executed generation:

```json
{
  "imageUrl": "https://example.com/replace-with-your-product.jpg",
  "prompt": "Keep the product stationary while the camera moves slowly. Preserve shape, color and printed label. Add no accessories or text.",
  "resolution": "720p",
  "videoTime": 5,
  "aspectRatio": "9:16"
}
```

The primary image must satisfy the current reference's size requirements. The starter checks a narrow input shape, not the contents or dimensions of the remote image. Inspect the estimate and confirm subscription access before submitting:

```shell
python seedance-task-starter.py submit seedance-20-product-request.json --output seedance-submit-001
```

This makes **one chargeable POST**, with no automatic retry. It saves the raw response before interpreting it. A successful receipt exposes `data.taskId` and `data.status`; it does not contain a finished video. Copy the returned task ID into a separate query:

```shell
python seedance-task-starter.py query YOUR_TASK_ID --output seedance-query-001
```

The query uses `GET https://api.nexscope.ai/video/seedance20VideoGeneration/tasks/{taskId}`. The starter issues one GET per invocation and does not poll forever, resubmit a generation or download a guessed URL. Keep the same task ID, space out manual checks and honor provider rate-limit guidance. Each output directory must be new.

| Returned status | Next step |
| --- | --- |
| `PENDING` or `RUNNING` | Keep the receipt and check the same task later |
| `SUCCEEDED` | Inspect `data.result` and open its returned Nexscope resource URL; review the video before saving or publishing it |
| `FAILED` or `TIMEOUT` | Preserve the result, check usage and any refund record, then decide whether to change inputs |
| Unknown status, malformed body or nonzero business code | Stop and inspect the saved response; do not treat HTTP 200 as success |

Use the current [Seedance 2.0 reference](https://www.nexscope.ai/api-docs/seedance-2-0-video-generation?view=api) for completed-result fields. The outer `cost` field is elapsed milliseconds, **not credits**. Preserve the response's actual usage information and reconcile it with your account; the starter does not infer a charge from latency. It was tested with constructed offline responses, not a paid production request.

When a completed response contains multiple resources, verify which one belongs to your requested task before downloading it. Open the returned media link, preview the whole clip and use its download control or your approved storage client. Keep the result JSON and original task ID alongside the saved media; an illustrative `example.com` URL is never an output.

## What happens after submission?

A task ID is a receipt, not a downloadable video. Preserve it with the route and request settings. Follow that route's current task-result instructions until it reaches a terminal outcome; do not assume a fixed completion time.

Your integration should distinguish these stages:

| Stage | Application behavior |
| --- | --- |
| Authentication or validation error | Correct access or inputs; do not loop unchanged requests |
| Task accepted | Store the returned task ID and identify the exact route |
| Still processing | Follow documented polling behavior; avoid overlapping duplicate submissions |
| Task failed | Surface the returned error and inspect charge/refund records |
| Completed output | Retrieve the documented result, record actual credits and review the media |

Do not submit another generation just because the first is slow. That can create another chargeable task. If a submission response is ambiguous, investigate its task or usage record before retrying. Parse the response described by the current route; do not assume every endpoint uses an identical wrapper.

{% include article-action.html placement="article-middle" %}

## How much does the Seedance API cost?

Use the request-specific estimate and completed charge, not a fixed price copied from an old comparison. Duration, configuration and provider billing all matter. At this review date, Nexscope's plan examples and some route-level estimates are not directly reconciled, so this guide does not promise a fixed credit-per-second rate.

If no estimate is available, clarify the cost before sending a paid request. During a pilot, save all charges, including rejected outputs, and calculate credits per approved clip. A successful task status does not establish creative acceptance or product fidelity.

## What should a product-video pilot test?

Use a single clear product reference and a simple camera movement. Keep the intended object and scene easy to judge. A modest brief makes it easier to distinguish an input problem from a product-preservation failure.

For a hypothetical bottle, a brief could request a slow camera move around the stationary item while preserving its cap, silhouette, printed label and color. This is suggested input, not an output we generated. Review the whole video for changing geometry or packaging, invented accessories and unsupported implied functions.

Log the input asset, prompt, route, settings, task ID, completion status, output, actual charge and rejection reason. Before automation at scale, decide what your application does with failed tasks, unusable completed media and uncertain product details. Do not auto-publish a video based only on completion status.

For a separate still-image implementation, use the [image generation API Python tutorial]({{ '/guides/image-generation-api-python/' | relative_url }}). It has its own image request and task route; do not submit a video payload to an image endpoint.

## Playground or API: where should you begin?

Use Playground to inspect the available settings and access conditions before implementing a client. Use the API when you need repeatable server-side automation and have confirmed its billing and task lifecycle. The simplified app and external API may expose different controls.

For a complete content workflow, continue to the [AI product video guide]({{ '/ai-video-generator/' | relative_url }}). For other model choices, browse the [model review directory]({{ '/guides/ai-model-playgrounds/' | relative_url }}).
