---
layout: default
title: "1688 Product Detail API: SKU Prices, MOQ & Evidence"
description: "Inspect one 1688 offer with Nexscope: separate SKU prices, quantity tiers and MOQ, review dated detail evidence, and validate supplier terms before buying."
permalink: /guides/1688-product-detail-api/
schema_type: Article
learning_topic: sourcing
related_topics: [agents]
content_kind: guide
topic: sourcing
author: Nexscope Team
date_published: 2026-10-27
date_modified: 2026-10-27
last_modified_at: 2026-10-27
next_step:
  id: 1688_product_detail_analyzer
  title: Inspect the evidence for one offer
  description: Start with a public 1688 offer URL or string ID, inspect the returned fields, and export the SKU table before requesting any AI interpretation.
  label: Open 1688 Product Detail Analyzer
  url: https://learn.nexscope.ai/tools/1688-product-detail-analyzer/
---

# 1688 Product Detail API: how do you inspect one offer?

Use a 1688 product-detail request to inspect a specific offer's returned listing fields, SKU variants, quantity-price tiers, MOQ and available shipping information. Keep each price attached to its variant, quantity and unit. The response supports a supplier inquiry or sample-order checklist; it does not verify the factory, guarantee order eligibility or establish landed cost.

## When should you use product detail instead of image search?

Image search finds candidate offers from a product picture. Product detail examines one identified offer. Start with [the Amazon-to-1688 sourcing workflow](https://learn.nexscope.ai/1688-supplier-product-sourcing/) if you do not yet have an offer. Open detail records only after checking that the candidate appears relevant to the required product specifications.

| Task | Appropriate next step |
| --- | --- |
| Find visually related offers | Run image search, then inspect candidate relevance. |
| Compare variants within one offer | Inspect product detail and preserve the returned SKU attributes. |
| Estimate a merchandise subtotal | Select a reported price and quantity, retaining the unit and tier assumptions. |
| Confirm the final order price or supplier reliability | Ask the supplier for a current written quote and obtain independent verification. |

## What did a recorded Nexscope detail test return?

In the [October 7, 2026 portable-blender sourcing test]({{ '/api-evidence/portable-blender-amazon-1688/' | relative_url }}), two detail requests inspected offers `902856167524` and `1036978647065`. Each response reported five SKUs, MOQ 1 and a tier of 1+ at ¥33. The returned company names and dispatch locations provided inquiry targets. They were not independently verified factory identities.

Those observations apply to that dated test. They do not show that every offer has five SKUs, that the same prices are still available, or that a sample order will be accepted. The evidence record links a sanitized JSON artifact and describes missing credit-charge evidence; no credit amount should be inferred from it.

## How should you review a response?

1. Enter one public offer URL or string ID in the [1688 Product Detail Analyzer](https://learn.nexscope.ai/tools/1688-product-detail-analyzer/).
2. Verify that the returned offer matches the intended item. Preserve the source ID and retrieval date.
3. Review SKU attributes and prices together. A product-level range does not establish the price of every SKU.
4. Keep quantity tiers, MOQ and pack units separate. A minimum quantity and a pricing threshold may describe different conditions.
5. Inspect shipping fields only when returned. Missing freight, dispatch or weight information remains unknown.
6. Export the available SKU table before leaving the page. Request an AI report separately if you need a review checklist; source retrieval and analysis may each consume credits.
7. Confirm the exact specification, quantity, pack unit and current terms with the supplier before committing to an order.

The tool's illustrative example is not a live API result. Running your own lookup requires a Nexscope API key and may consume credits. The tool explains its browser key storage; the key should never be copied into published evidence, downloads or an AI prompt.

## Which facts need separate verification?

| Returned field or calculation | What it cannot establish |
| --- | --- |
| Company name or membership label | Factory ownership, production capacity or independently checked credentials. |
| Listed SKU price | A negotiated quote, price validity or eligibility for your requested quantity. |
| Merchandise subtotal | Freight, duties, taxes, inspection, payment fees, returns or final landed cost. |
| Similar product image | Identical materials, battery, motor, dimensions, certification or warranty. |
| AI interpretation | Physical sample quality, compliance approval or a guaranteed commercial outcome. |

For an integration, inspect the current [1688 Product Detail API documentation](https://www.nexscope.ai/api-docs/1688-product-detail?co-from=learn). Check the documented request parameters, returned fields and credit requirements before sending a batch. Keep IDs as strings and retain missing values as unknown rather than converting them to zero.

Continue with the [complete product-research case]({{ '/portable-blender-market-research-case-study/' | relative_url }}) to connect demand questions, review evidence and supplier samples into a bounded validation plan.
