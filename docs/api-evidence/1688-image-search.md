---
layout: default
title: 1688 Search By Image API Evidence | Base64 Test
description: Inspect a real Nexscope 1688 image-search test with the input method, returned rows, credit use, earlier URL failures and supplier-verification limits.
permalink: /api-evidence/1688-image-search/
last_reviewed: 2026-09-23
date_published: 2026-09-23
date_modified: 2026-09-23
schema_type: Article
topic: sourcing
image: /assets/images/1688-image-search-api-evidence-1440w.webp
image_alt: Nexscope 1688 Search By Image API evidence summary showing supported input and returned sourcing fields
---

# 1688 Search By Image API: one successful Base64 test

**Observed result:** on September 20, 2026, a generated unbranded bottle concept was compressed to a 192 × 192 JPEG and sent as raw Base64 with `page: 1` and `pageSize: 10`. The response returned **HTTP 200, business `code: 0`, and 10 first-page products**. The usage record showed **10 credits deducted**.

{% include article-visual.html %}

| Evidence field | Observed value |
| --- | --- |
| Input | Generated unbranded bottle concept, compressed to JPEG |
| Input method | Raw `imageBase64`, without a data-URL prefix |
| Request | Page 1, page size 10 |
| Result | HTTP 200, business `code: 0`, 10 rows |
| Usage | 10 credits deducted for the successful call |
| Earlier attempts | Three public-image-URL requests returned business code `13007`; no credit deduction was observed |

Two selected rows appeared visually relevant to amber dropper bottles; one selected row was an off-target face mask. That mix is why image search should create a candidate list, not certify a factory or product match.

## What the result can support

The result can support a shortlist of returned `offerId` values for subsequent Product Detail checks. It cannot establish manufacturer identity, product quality, material, compliance, intellectual-property rights, negotiated price or landed cost.

- [Read the full 1688 sourcing analysis]({{ '/ecommerce-trends/1688-image-search-sourcing/' | relative_url }})
- [Open the 1688 Search By Image API documentation](https://www.nexscope.ai/api-docs/1688-search-by-image?co-from=learn)
- [Follow the broader sourcing tutorial](https://learn.nexscope.ai/1688-supplier-product-sourcing/)

The raw Base64 and all credentials are intentionally excluded from this public record.
