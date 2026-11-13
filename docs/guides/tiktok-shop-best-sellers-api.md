---
layout: default
learning_topic: research
related_topics: [agents]
content_kind: guide
title: "TikTok Shop Best Sellers API: Get Product Rankings by Market and Date"
description: "Query TikTok Shop top-selling products by market, category and period. Copy a REST request, inspect the response fields and try the Nexscope Playground."
permalink: /guides/tiktok-shop-best-sellers-api/
date_published: 2026-11-13
date_modified: 2026-11-13
last_modified_at: 2026-11-13
last_reviewed: 2026-11-13
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
compact_evidence: true
evidence_scope: "Based on the documented REST and MCP contracts. The request and response shape are illustrative."
suppress_article_help: true
next_step:
  id: tiktok_shop_best_sellers_api
  intent: api-evaluation
  title: "Run a TikTok Shop product ranking query"
  description: "Choose one market and date. Review the current credit cost in the Playground before submitting."
  label: Open TikTok Top Selling Products Playground
  url: "https://www.nexscope.ai/api-docs/tiktok-top-selling-products?view=playground&co-from=learn"
---

# TikTok Shop best sellers API

Use the **TikTok Top Selling Products API** to get a dated ranking for one TikTok Shop market. Choose a day, week or month, add an English category name if needed, and start with up to ten products on the first page. Save the returned product IDs and the period you asked for so you can verify the shortlist later. [REST and MCP reference](https://www.nexscope.ai/api-docs/tiktok-top-selling-products)

{% include api-guide-entry.html %}

## Run your first US ranking request

This request uses a sample day from the documentation. Replace the date with an available period for your market. Use your Nexscope API key from a secure environment or enter the request inputs in the Playground.

```bash
curl -X POST 'https://api.nexscope.ai/fm/productRankTopSelling' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"region":"US","dateInfo":{"type":"day","value":"2026-04-15"},"page":1,"pageSize":10}'
```

| Input | What to choose |
| --- | --- |
| `region` | One supported market, such as `US`, `GB` or `MY` |
| `dateInfo` | Use `YYYY-MM-DD` for a day, `YYYY-WW` for a week or `YYYY-MM` for a month |
| `category` | An optional English category name. Verify the matched category path in the response |
| `orderby` | Set the ranking measure explicitly when comparing runs, such as `units_sold` descending |
| `pageSize` | Up to ten results per page |

For MCP, use `nexscope_tiktok_top_selling_products` and check the tool schema in your client. Access and charges are shown in the live reference. [Parameters and response fields](https://www.nexscope.ai/api-docs/tiktok-top-selling-products?view=api&co-from=learn)

## Read the response before saving the shortlist

Check the outer `code` and the operation's `errcode` when present. The reference documents `code: 0` for success or acceptance and `errcode: 200` for business success. Inspect `products` after checking those statuses. The following abbreviated shape uses placeholders from the field definitions.

```json
{
  "code": 0,
  "data": {
    "errcode": 200,
    "page": 1,
    "products": [
      {"productId": "<product ID>", "title": "<product title>", "region": "US"}
    ]
  }
}
```

Save the region, date window, sort measure and category with each product ID. Check the returned category match before comparing runs. A missing metric stays unknown. Keep period sales separate from lifetime totals and treat marketplace metrics as reported observations.

## Turn one ranked product into a comparison

Pick three items that serve the same buyer need. Open each listing and compare the exact variant, offer quantity, current price and evidence for its main claim. A high ranking can help choose a product to investigate. Use those listing checks and your own costs to decide whether it is a useful comparison.

For developers, the [TikTok Shop API guide]({{ '/guides/tiktok-shop-api-guide/' | relative_url }}) explains how ranking fits with discovery and product details. For sellers who want a reviewed competitor comparison for their own public Amazon or independent-store product page, see the [Nexscope Product Growth Report](https://www.nexscope.ai/product-growth-report?co-from=learn#request).
