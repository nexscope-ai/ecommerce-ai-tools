---
layout: default
title: "Seedance API Guide: 2.0 vs 2.5, Access & Playground"
description: "Start with the Seedance API on Nexscope: compare 2.0 and 2.5, check subscription access, submit a reference-led request and retrieve the completed video."
permalink: /guides/seedance-api/
date_published: 2026-10-23
date_modified: 2026-10-23
last_modified_at: 2026-10-23
last_reviewed: 2026-10-23
author: Nexscope Team
schema_type: Article
og_type: article
topic: creative
suppress_article_help: true
next_step:
  id: seedance_api_playground
  title: Inspect Seedance 2.0 before integrating
  description: "Review the supported references and settings in Playground. Creative API key access requires an active subscription."
  label: Open Seedance 2.0 Playground
  url: https://www.nexscope.ai/api-docs/seedance-2-0-video-generation?view=playground&co-from=learn
---

# Seedance API guide: choose a route, submit a task and inspect the video

**A Seedance API integration needs more than a generation request: it needs the correct provider route, valid reference inputs and a completed-task check.** This guide covers Seedance 2.0 and 2.5 through Nexscope. It is not ByteDance's official API documentation, and Nexscope authentication and billing should not be copied into another provider's integration.

**[Open Seedance 2.0 Playground](https://www.nexscope.ai/api-docs/seedance-2-0-video-generation?view=playground&co-from=learn) · [Open Seedance 2.5 Playground](https://www.nexscope.ai/api-docs/seedance-2-5-video-generation?view=playground&co-from=learn).** New users receive 1,000 free credits, valid for 3 days. API key access requires an active subscription; the trial does not guarantee a free generation on every route or configuration.

> **Quick answer:** Select the exact version, check access and cost, and provide a compatible reference. Submit the request, retain its task ID, then inspect the completed result rather than treating a submission receipt as a video. For product footage, manually review identity and motion before approving the asset.

*Documentation checked October 23, 2026. Written by Nexscope Team. This is an integration guide, not a new generation benchmark. No chargeable API request was run for this article.*

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

## Playground or API: where should you begin?

Use Playground to inspect the available settings and access conditions before implementing a client. Use the API when you need repeatable server-side automation and have confirmed its billing and task lifecycle. The simplified app and external API may expose different controls.

For a complete content workflow, continue to the [AI product video guide]({{ '/ai-video-generator/' | relative_url }}). For other model choices, browse the [model review directory]({{ '/guides/ai-model-playgrounds/' | relative_url }}).
