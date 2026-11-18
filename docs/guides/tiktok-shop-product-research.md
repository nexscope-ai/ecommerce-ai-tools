---
layout: default
learning_topic: research
related_topics: [agents, sourcing]
content_kind: guide
title: "TikTok Shop Product Research: Find Growing Categories"
description: "Compare TikTok Shop category sales, GMV and daily trends in one market. Find category IDs, build a shortlist and check competing brands."
permalink: /guides/tiktok-shop-product-research/
date_published: 2026-11-18
date_modified: 2026-11-18
last_modified_at: 2026-11-18
last_reviewed: 2026-11-18
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
compact_evidence: true
evidence_scope: "Reviewed against TikTok Shop Seller University and the published Nexscope API contracts. Requests are templates and the worksheet contains no live figures."
suppress_article_help: true
next_step:
  id: tiktok_shop_category_research
  intent: api-evaluation
  title: "Look up a TikTok Shop category trend"
  description: "Choose one market, category and date range. Review the current access and credit cost before running the request."
  label: Open the Category Trend Playground
  url: "https://www.nexscope.ai/api-docs/tiktok-category-trend?co-from=learn#online-test"
---

# TikTok Shop product research: how to find growing categories

Compare three related categories in one TikTok Shop market. Check their sales and gross merchandise value (GMV) over the same dates, then review the individual products and brands that compete in the category you shortlist.

{% include api-guide-entry.html %}

## Pick a buyer need and find the category IDs

Start with a need such as kitchen organization. Compare drawer organizers, under-sink storage and pantry containers if the catalog returns comparable category paths. TikTok Shop Seller Center also lists product ideas in Product Opportunities. [TikTok Shop Product Opportunities](https://seller-us.tiktok.com/university/essay?knowledge_id=4371484668528427)

| Level | What to pass | What to save |
| --- | --- | --- |
| [Level 1](https://www.nexscope.ai/api-docs/tiktok-category-level-1) | `{"language":"en-US"}` | Broad category name and ID |
| [Level 2](https://www.nexscope.ai/api-docs/tiktok-category-level-2) | `language` and the level 1 ID in `parentId` | Child categories and IDs |
| [Level 3](https://www.nexscope.ai/api-docs/tiktok-category-level-3) | `language` and the level 2 ID in `parentId` | Specific categories and their full paths |

Save IDs as strings. Use `language` for names and `region` for the market in analytics requests. Compare categories at the same level so a broad parent category does not dominate a narrow subcategory.

## Compare category size and daily trends

Use [Category Overview](https://www.nexscope.ai/api-docs/tiktok-category-overview) for a **top-level** snapshot of sales, GMV, product and influencer metrics. It updates T+1. Use [Category Trend](https://www.nexscope.ai/api-docs/tiktok-category-trend) for a daily comparison at the selected category level. Keep the current and previous windows the same length.

```bash
curl -X POST 'https://api.nexscope.ai/et/category/trend' \
  -H "Authorization: Bearer $NEXSCOPE_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"region":"US","categoryL3Id":"<level-3 category ID>","startDate":"2026-11-01","endDate":"2026-11-07","pageNum":1,"pageSize":10}'
```

Replace the ID with one from the category lookup. For level 1 or 2 use `categoryId` or `categoryL2Id`. Read additional pages for longer windows. Check the returned dates and metrics before comparing totals. Leave missing metrics unknown and growth blank when the previous period is zero or incomplete.

| Category | What to record | What to check |
| --- | --- | --- |
| Candidate A | Units and GMV for both periods | Did sales rise over several days or spike once? |
| Candidate B | Units and GMV for both periods | Did units and GMV move in the same direction? |
| Candidate C | Units and GMV for both periods | Do leading offers match what you can source? |

When units rise while GMV stays flat, check individual prices and pack sizes. The dated [US TikTok Shop best sellers](/tiktok-shop-bestsellers/) shows offers you can compare with your product.

## Check competing brands and sellers

Search by a brand name, product title or ID, or seller ID. This sample shows the brand-name mode. Replace the name with a brand from your shortlist.

```json
{"queryType":2,"name":"medicube","marketplace":"us","pageIndex":1}
```

Use `queryType` 1 for a product title or ID, 2 for a brand name, and 3 for a seller ID. Coverage is limited to subcategory Top 300 data. Check the actual seller, listing, variant and price before treating a result as a direct competitor. [Brand Search API](https://www.nexscope.ai/api-docs/tiktok-brand-search)

Shortlist a category when the trend, offer prices and supplier quotes support the same opportunity. Record your expected landed cost and what still needs validation. When you have a product to test, use the [TikTok Shop affiliate screening guide]({{ '/guides/find-tiktok-shop-affiliates/' | relative_url }}). For the ranking request itself, see the [Best Sellers API guide]({{ '/guides/tiktok-shop-best-sellers-api/' | relative_url }}).
