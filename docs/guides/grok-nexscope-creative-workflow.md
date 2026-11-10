---
learning_topic: creative
content_kind: guide
layout: default
title: "Grok Product Video Workflow: One Photo to an Image and Clip"
description: "Use Grok to write a product brief, then try Nano Banana 2.1 for a lifestyle image and Seedance 2.5 for a short clip. Includes prompts and Playground links."
permalink: /guides/grok-nexscope-creative-workflow/
date_published: 2026-11-09
date_modified: 2026-11-10
last_modified_at: 2026-11-10
last_reviewed: 2026-11-10
author: Nexscope Team
schema_type: Article
og_type: article
topic: creative
related_topics: [agents]
compact_evidence: true
evidence_scope: "The travel-mug brief and prompts are illustrative. Model inputs and access requirements come from the linked Nexscope references."
next_step:
  id: grok_nexscope_creative
  intent: product-video-trial
  title: Turn a product photo into a short clip
  description: "First-time Nexscope users get 1,000 free credits to try the web tool. Sign in to generate and check the credit estimate for your settings."
  label: Try the Product Video Generator
  url: https://www.nexscope.ai/tools/ai-video-generator?co-from=learn
---

# Use Grok and Nexscope to turn one product photo into an image and video

Start with a product photo. Ask Grok for two prompts, one for a lifestyle image and one for a short clip. Use **Nano Banana 2.1** for the image and **Seedance 2.5** for motion. This example uses the same original photo of a matte navy travel mug as the reference in both steps.

{% include article-action.html placement="article-top" %}

## 1. Give Grok the product facts and the shots you want

Use a clear photo you have permission to use. For this example, the approved details are a matte navy finish, a silver rim and a black lid. Ask Grok for a still shot and one simple camera move:

> Write two prompts for a vertical social ad for the travel mug in my reference photo. For the still, place the mug upright on a light kitchen counter with soft window light. For the video, use a slow sideways camera move. In both prompts, preserve the mug shape, matte navy finish, silver rim and black lid. Avoid adding accessories, text or performance claims. Return one short prompt per shot.

Review both prompts against the photo and approved product information before using them.

## 2. Generate the lifestyle image with Nano Banana 2.1

Supply the original photo as a reference and use the still prompt. The API uses `imageUrls` for references and `prompt` for the instructions. Start with one output and choose a supported aspect ratio. For a browser workflow using an uploaded photo, open the [Nexscope image generator](https://www.nexscope.ai/tools/ai-image-generator?co-from=learn).

<a data-article-next-step data-step-id="grok_nano_banana_playground" data-cta-placement="article-middle" data-buyer-intent="image-api-preview" href="https://www.nexscope.ai/api-docs/banana-2-1-image-generation?view=playground&amp;co-from=learn">Open Nano Banana 2.1 Playground →</a>

Running the creative API in the online tester requires an active subscription.

Check the mug silhouette, rim, lid and visible branding against the original. Approve the still against those details before using it as a reference for another asset.

## 3. Make the short clip with Seedance 2.5

Use the original photo as the primary image and supply the motion prompt. The API field for the primary image is `imageUrl`. Choose a supported duration and resolution, and check the credit estimate before starting. The model documentation includes a five-second example.

<a data-article-next-step data-step-id="grok_seedance_playground" data-cta-placement="article-middle" data-buyer-intent="video-api-preview" href="https://www.nexscope.ai/api-docs/seedance-2-5-video-generation?view=playground&amp;co-from=learn">Open Seedance 2.5 Playground →</a>

Running the creative API in the online tester requires an active subscription.

Watch the full clip. Check whether the lid, rim, finish or proportions change as the camera moves. Reject a take that adds a feature or shows an action the product cannot perform. If using the API, keep the task ID and retrieve the result before starting another generation.

## Where can you try this workflow?

| Route | What you need |
| --- | --- |
| Nexscope browser tools | Sign in, add your photo and paste the prompt. First-time Nexscope users get 1,000 free credits. Check the estimate for your chosen model and settings. |
| Model Playground or API key integration | An active subscription is required to run these creative API operations. Check your account access and the model's estimate before generating. |
| Grok with a Nexscope connector | Confirm that Grok can discover the operation and that the connected Nexscope account has access. [Grok MCP setup]({{ '/guides/grok-nexscope-mcp-ecommerce-api/' | relative_url }}) |

For your next product demonstration, use buyer questions you can verify against the product specs. [Grok and TikTok buyer-question workflow]({{ '/guides/grok-nexscope-tiktok-research/' | relative_url }})
