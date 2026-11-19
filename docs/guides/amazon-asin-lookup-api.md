---
layout: default
learning_topic: research
related_topics: [agents]
content_kind: guide
title: "Amazon ASIN Lookup API: Details, Price and Ratings"
description: "Find an Amazon ASIN and use a JSON request to look up its product title, price, currency and ratings for the selected Amazon marketplace."
permalink: /guides/amazon-asin-lookup-api/
date_published: 2026-11-19
date_modified: 2026-11-19
last_modified_at: 2026-11-19
last_reviewed: 2026-11-19
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
compact_evidence: true
evidence_scope: "Reviewed against published API contracts. Examples are templates for a first request."
suppress_article_help: true
next_step:
  id: amazon_asin_lookup_api
  intent: api-evaluation
  title: "Try an Amazon ASIN lookup"
  description: "Verify the example input and check current access and credits before running the request."
  label: Open the API tester
  url: "https://www.nexscope.ai/api-docs/amazon-product-detail?co-from=learn#online-test"
---

# Amazon ASIN lookup API: get product details, price and ratings

If you already have an ASIN, send it with the Amazon marketplace to retrieve the corresponding product details. Start with the exact variant you want to compare. Save the marketplace and returned ASIN alongside price and rating data.

{% include api-guide-entry.html %}

## Find the ASIN and choose the marketplace

Amazon's product identifiers are ten characters. Look in the product details or in the `/dp/` part of the product URL. For a product with colors or sizes, pick the variant you want before copying the ASIN. Choose the marketplace explicitly, such as `amazon.com` or `amazon.co.uk`. [Amazon's guide to ASINs](https://sell.amazon.com/blog/what-is-an-asin)

## Run a product-detail request

Use `asins` as a comma-separated string, even when you are checking a single product. The documented limit is 40 ASINs per call. Start with one to verify the fields and current credit cost in the [Amazon Product Detail reference](https://www.nexscope.ai/api-docs/amazon-product-detail).

```bash
curl -X POST 'https://api.nexscope.ai/amazon/product/detail' \
  -H "Authorization: Bearer $NEXSCOPE_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"amazonDomain":"amazon.com","asins":"B072MQ5BRX"}'
```

Check the outer `code` and whether `data.products` contains the ASIN you requested. For a batch, match by returned ASIN instead of row position and flag requested IDs that did not return a row.

| What to check | Why it matters |
| --- | --- |
| `asin`, title and brand | Confirm the listing matches your selected variant |
| Current price and currency | Compare like-for-like offers in one marketplace |
| Old price, coupon or shipping | Keep these separate from the current returned price |
| Rating and review count, when available | Save when you checked them and leave missing fields blank |

## Pick the next query for your task

For a recurring price watch, use the [Google Sheets price-tracking guide]({{ '/guides/amazon-price-tracker-google-sheets/' | relative_url }}). For past prices, use [Amazon Price History]({{ '/amazon-price-history/' | relative_url }}). If your goal is to find what people search for before buying, use the [Amazon competitor keyword guide]({{ '/amazon-competitor-keyword-research/' | relative_url }}). Browse the [Data API directory](/data/) for related endpoints.
