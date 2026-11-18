---
layout: default
learning_topic: research
related_topics: [agents]
content_kind: guide
title: "How to Find and Evaluate TikTok Shop Affiliates"
description: "Find creators in TikTok Shop Affiliate Center, then evaluate a shortlist with product fit, engagement and recent estimated sales."
permalink: /guides/find-tiktok-shop-affiliates/
date_published: 2026-11-18
date_modified: 2026-11-18
last_modified_at: 2026-11-18
last_reviewed: 2026-11-18
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
compact_evidence: true
evidence_scope: "Reviewed against TikTok Shop Seller University and the published Nexscope API contracts. The shortlist and API requests are templates."
suppress_article_help: true
next_step:
  id: tiktok_shop_affiliate_screening
  intent: api-evaluation
  title: "Review the TikTok influencer lookup"
  description: "Start with a few creator handles from your shortlist. Review access and credit requirements in the Playground."
  label: Open the Influencer Detail Playground
  url: "https://www.nexscope.ai/api-docs/tiktok-influencer-detail?co-from=learn#online-test"
---

# How to find and evaluate TikTok Shop affiliates for your products

Use **Find Creators** in TikTok Shop Affiliate Center to build a shortlist. Review recent content for product fit, then compare engagement and estimated sales over the same time window. Send samples first to creators who can demonstrate your product in a way that helps shoppers make a decision.

{% include api-guide-entry.html %}

## Find creators who already reach your buyers

Pick one market and one product. Write down its use case, price and what a credible demo should show. In Affiliate Center, use **Find Creators** and the filters available to your account. Start with creators who have covered similar products and open several recent videos to see how viewers respond. [TikTok Shop Find Creators](https://seller-us.tiktok.com/university/essay?knowledge_id=8280083875170049)

For a compact kitchen scale, look for a readable display, a practical use case and viewer questions about how the scale works. Record the handle, the video link and what the creator showed. Give each candidate the same review so one viral video does not decide the shortlist.

## Verify the candidate handles in a batch

Use [Influencer Detail](https://www.nexscope.ai/api-docs/tiktok-influencer-detail) to look up up to ten profiles at a time. Pass either `uniqueIds` with handles without the `@`, or `userIds` with numeric IDs as strings.

```bash
curl -X POST 'https://api.nexscope.ai/et/influencer/detail' \
  -H "Authorization: Bearer $NEXSCOPE_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"uniqueIds":["<first creator handle>","<second creator handle>"]}'
```

Match each returned profile to the public account you reviewed. Use a confirmed numeric user ID for the next step. If a match is missing, record it as unverified and check the handle in Affiliate Center.

## Compare recent performance using the same dates

[Influencer Trend](https://www.nexscope.ai/api-docs/tiktok-influencer-trend) reads one creator at a time. It covers daily trends within the last 180 days and returns up to ten records per page. Choose a window within that range and use the same dates for every candidate. Request subsequent pages if needed.

```json
{
  "userId": "<verified numeric creator ID>",
  "startDate": "2026-11-01",
  "endDate": "2026-11-07",
  "pageNum": 1,
  "pageSize": 10
}
```

Review follower and engagement patterns alongside the posts you watched. Keep estimated sales labeled as estimates. Use your own Affiliate Center results to evaluate sales for your shop after the trial. Track missing metrics separately from measured zeros.

| Shortlist field | What to enter |
| --- | --- |
| Product and audience fit | A recent video link and what it shows |
| Engagement | Whether interest is steady or concentrated in one post |
| Estimated sales | The reported figure, date window and any missing days |
| Sample decision | Invite, review again or pass, with a reason |

## Invite a small group and measure the trial

Prioritize a credible demo and relevant buyer questions, then use the trend to break ties. Send a brief with one product benefit, a demonstration the creator can do and the claims you can support. Keep sample cost, publication date, attributable orders and returns in your trial records.

If you are still choosing a product, start with [TikTok Shop product research]({{ '/guides/tiktok-shop-product-research/' | relative_url }}). For turning candidate videos into a brief, see the [TikTok product and creator research workflow]({{ '/ecommerce-trends/tiktok-product-creator-research-api/' | relative_url }}).
