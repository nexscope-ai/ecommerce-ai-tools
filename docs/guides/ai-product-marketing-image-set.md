---
layout: default
learning_topic: creative
related_topics: [research]
content_kind: guide
title: "How to Create an AI Product Marketing Image Set From One Photo"
description: "Use one product photo to brief lifestyle, feature and dimension images. Review the SKU details and try Nexscope's marketing image set Playground."
permalink: /guides/ai-product-marketing-image-set/
date_published: 2026-11-12
date_modified: 2026-11-12
last_modified_at: 2026-11-12
last_reviewed: 2026-11-12
author: Nexscope Team
schema_type: Article
og_type: article
compact_evidence: true
evidence_scope: "Workflow based on Adobe's November 10 announcement and Nexscope's published API documentation. The image briefs are illustrative."
suppress_article_help: true
next_step:
  id: product_marketing_image_set_growth_report
  intent: product-report-evaluation
  title: "Request a reviewed image set for one product"
  description: "Submit one public product URL and one target market. Choose the service you need and review the credit quote before submitting."
  label: "Explore product advertising images"
  url: "https://www.nexscope.ai/product-growth-report?co-from=learn#request"
---

# From one product photo to a campaign image set

Give each image a job. A lifestyle image shows where the item fits, a feature image explains a verified detail, and a dimension image helps a shopper compare fit. Adobe's November 10 Firefly announcement gives creative teams more ways to combine image and video tools. This walkthrough uses Nexscope's Product Marketing Image Set v4 to prepare and review assets for one SKU. [Adobe MAX announcement](https://news.adobe.com/news/2026/11/adobe-powers-new-era-of-creativity) · [Nexscope image set API](https://www.nexscope.ai/api-docs/ai-product-marketing-image-set-v4)

{% include article-quick-action.html %}

## Prepare one reference image and three briefs

Choose a clear photo you can use and record the exact SKU, color, packaging, dimensions and included pieces. The example uses a navy travel mug with a silver rim and one black lid. Write the approved facts before generating.

| Asset | What to show | What to verify |
| --- | --- | --- |
| Lifestyle | The mug on a kitchen counter with soft daylight | Mug shape, finish, lid and scale match the reference |
| Feature | A close-up of the rim and lid | The image depicts the real parts and carries only verified feature claims |
| Dimensions | A clean front view with space for labels | Add approved measurements in your layout tool and verify units and endpoints |

## Start with one image in the Playground

1. Add the reference through the supported image input. The API documents it as `imageList`.
2. Provide approved selling points and keep automatic extraction off if you already have a verified brief. Choose a supported model, output type and aspect ratio in the Playground.
3. Generate one image and compare it with the original at full size. For an API integration, keep the task ID and retrieve the result through the documented task flow.

<a data-article-next-step data-step-id="product_marketing_image_set_playground" data-cta-placement="article-middle" data-buyer-intent="api-evaluation" href="https://www.nexscope.ai/api-docs/ai-product-marketing-image-set-v4?view=playground&amp;co-from=learn">Open Product Marketing Image Set Playground →</a>

Running the creative API requires an active subscription. Check the live credit estimate before submitting. [API access and inputs](https://www.nexscope.ai/api-docs/ai-product-marketing-image-set-v4?view=playground)

## Review the images against the product page

Compare the generated image and live listing side by side. Check the number of pieces, shape, color, label and accessories. For the dimension image, check each label against the actual variant. If an image shows a spare lid that the SKU does not include, revise the shot before uploading it. Read the destination marketplace's current rules before using the image as the main listing photo.

If you need help preparing the set, choose **Product advertising images** in the Nexscope Product Growth Report. Provide one public product URL, the target market, the number of images and the purpose of each. The service reviews the selected images before delivery. [Product Growth Report scope](https://learn.nexscope.ai/product-growth-report/)

{% include article-action.html placement="article-middle" %}

When the still images are approved, use the same product facts to brief a short clip. [Black Friday video creative workflow]({{ '/guides/black-friday-video-ad-creative-pack/' | relative_url }})
