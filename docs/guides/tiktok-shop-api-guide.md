---
layout: default
title: "TikTok Shop API Guide: Product, Creator, Video and Seller Research with Nexscope"
description: "A practical guide to Nexscope's TikTok Shop APIs for product discovery, creator research, video analysis, shop analytics, rankings, and REST or MCP workflows."
permalink: /guides/tiktok-shop-api-guide/
date_published: 2026-10-13
last_reviewed: 2026-10-13
date_modified: 2026-10-13
last_modified_at: 2026-10-13
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
keywords:
  - TikTok Shop API
  - TikTok product API
  - TikTok creator analytics API
  - TikTok video search API
  - TikTok Shop analytics API
  - TikTok product discovery API
faq:
  - question: "How many TikTok Shop APIs does Nexscope currently list?"
    answer: "Nexscope's API directory currently lists 54 TikTok Shop and social-commerce data APIs. The catalog and credit cost can change, so confirm the individual API page before building a production workflow."
  - question: "Can Nexscope's TikTok Shop APIs publish posts or manage my TikTok Shop account?"
    answer: "These APIs are documented for public marketplace, product, creator, video, advertising, and analytics research. They should not be treated as an official TikTok Shop order-management, posting, ad-account, or store-connection API unless the relevant documentation explicitly says so."
  - question: "Can I call Nexscope TikTok APIs through REST and MCP?"
    answer: "The documented run endpoints use POST with a Bearer API key, and the API pages expose MCP method names for compatible clients. Use the individual API page for the current endpoint, parameters, response fields, and credit estimate."
---

# TikTok Shop API Guide: what sellers can research with Nexscope

**By Nexscope Team · Published October 13, 2026**

TikTok Shop research often starts with a deceptively simple question: **which product, creator, video, or shop should we investigate next?** A product search alone does not explain why an item is moving. You may need its regional sales signals, related creators, videos, reviews, livestreams, advertising references, or shop context before deciding what to test.

Nexscope's current API directory lists **54 TikTok Shop and social-commerce research APIs**. They are available through documented REST endpoints and, where shown on the API page, MCP methods. This guide maps the catalog to seller decisions so you can choose the smallest useful workflow instead of calling every endpoint.

> **Important scope note:** These are research and analytics capabilities. They are not automatically a connection to your TikTok Shop account, order system, advertising account, or publishing workflow. Check the individual API documentation, supported region, access requirements, and current credit estimate before using a result in a business decision.

## What are the main TikTok Shop API groups?

The 54 APIs fall into seven practical groups. Names and availability are based on the current [Nexscope API directory](https://www.nexscope.ai/api-docs?co-from=learn&utm_source=learn.nexscope.ai&utm_medium=referral&utm_campaign=tiktok-shop-api-guide&utm_content=api-directory); the catalog may change as endpoints are added or revised.

### 1. Product discovery and product evidence

Use these when you are validating demand, comparing listings, or looking for a new product angle:

- TikTok Product Detail
- TikTok Product Image Search
- TikTok Product Most Promoted
- TikTok Product New Arrivals
- TikTok Product Top Selling
- TikTok Product Market Search
- TikTok Product Related Creators
- TikTok Product Related Lives
- TikTok Product Related Videos
- TikTok Product Reviews

The newer analytics-oriented product endpoints add a second layer:

- TikTok Batch Product Detail
- TikTok Product Analytics
- TikTok Product Analytics Detail
- TikTok Product Discovery
- TikTok Product Search
- TikTok New Product Rank
- TikTok Top Selling Products

For example, [TikTok Product Discovery](https://www.nexscope.ai/api-docs/tiktok-product-discovery?returnTo=%2Fapi-docs%23api-tiktok-product-discovery&co-from=learn&utm_source=learn.nexscope.ai&utm_medium=referral&utm_campaign=tiktok-shop-api-guide&utm_content=product-discovery) is designed for keyword, category, shop-type, commission, sales, and creator-count filters. It is a better starting point for a shortlist than asking a model to guess which products are trending.

### 2. Shop and seller research

These APIs help answer “who is selling this?” and “what else is this shop doing?”:

- TikTok Shop Detail
- TikTok Shop Search
- TikTok Shop Most Promoted
- TikTok Shop Top Selling
- TikTok Shop Related Creators
- TikTok Shop Related Products
- TikTok Shop Related Videos
- TikTok Seller Detail
- TikTok Shop Analytics
- TikTok Shop Product Detail

Use a shop detail call to establish the seller context, then follow related products, creators, or videos. Treat these as public research signals, not proof of ownership, supplier identity, or future performance.

### 3. Creator and affiliate research

When the next decision is creator outreach or affiliate testing, use:

- TikTok Creator Detail
- TikTok Creator Search
- TikTok Creator Commercial
- TikTok Creator Growth
- TikTok Creator Agencies
- TikTok Creator Related Products
- TikTok Creator Related Videos
- TikTok Creator Related Lives
- TikTok Creator Analytics
- TikTok Creator Rankings

The useful sequence is usually **discover → qualify → inspect related content**. Follower count alone is not a creator-fit signal. Compare region, product association, commercial performance, recent growth, video evidence, and the creator's actual audience response.

### 4. Video and livestream research

For creative and competitive analysis, the catalog includes:

- TikTok Video Detail
- TikTok Video Search
- TikTok Video Keyword Search
- TikTok Video Related Products
- TikTok Video Reviews
- TikTok Video Analytics
- TikTok Video Rank
- TikTok Video Download URL
- TikTok Live Detail
- TikTok Live Search
- TikTok Live Related Products
- TikTok Livestream Analytics

[TikTok Video Search](https://www.nexscope.ai/api-docs/tiktok-video-search?returnTo=%2Fapi-docs%23api-tiktok-video-search&co-from=learn&utm_source=learn.nexscope.ai&utm_medium=referral&utm_campaign=tiktok-shop-api-guide&utm_content=video-search) supports filters around products, creators, regions, views, engagement, and sales performance. That makes it useful for building a dated creative brief: identify repeated hooks, inspect the product association, read audience reactions, and then decide whether a concept is worth recreating with approved assets.

### 5. Advertising and creative intelligence

For competitor advertising research, use:

- TikTok Ad Detail
- TikTok Ad Search
- TikTok Ad Related Products
- TikTok Creative Detail
- TikTok Creative Search

An ad or creative result is evidence of what was observed, not evidence that the claim is true or that the campaign will perform for your SKU. Save the capture date and separate observed fields from your interpretation.

## Which TikTok Shop API should you call first?

Choose the API from the decision you need to make:

| Seller question | Start with | Add next |
|---|---|---|
| Which products are worth shortlisting? | Product Discovery or Product Search | Product Detail, Reviews |
| Which new products are gaining attention? | New Product Rank or Product New Arrivals | Product Analytics Detail |
| Which products are already selling? | Product Top Selling or Top Selling Products | Product Analytics |
| Which creators could promote this product? | Creator Search or Product Related Creators | Creator Detail, Creator Analytics |
| What content is working around this product? | Video Search or Product Related Videos | Video Detail, Video Reviews |
| Which shops deserve competitor review? | Shop Search or Shop Detail | Shop Related Products, Shop Analytics |
| Which livestreams are worth studying? | Live Search | Livestream Analytics, Live Related Products |
| What are competitors promoting? | Ad Search or Creative Search | Ad Detail, Ad Related Products |

This sequence limits cost and keeps the research question visible. Do not start with a broad analytics call if a product or shop identifier is still unknown.

## How do you call a Nexscope TikTok API?

The documented run endpoints use `POST`, a Bearer API key, and a JSON request body. For example, the Product Discovery API uses this endpoint:

```bash
curl -X POST \
  'https://api.nexscope.ai/api/skill-api/v1/skills/tiktok-product-discovery/run' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "keyword": "phone case",
    "page": 1,
    "pageSize": 10,
    "region": "US"
  }'
```

The response uses a platform envelope. Check the returned `code` and then inspect `data`; a successful HTTP response does not by itself mean the business request succeeded. Keep API keys in a secret manager or environment variable, never in a public article, repository, or client-side bundle.

For compatible MCP clients, the same API page shows the method name, such as `nexscope_tiktok_product_discovery` or `nexscope_tiktok_video_search`. The [Nexscope MCP and API guide](https://www.nexscope.ai/api-docs?view=documentation&co-from=learn&utm_source=learn.nexscope.ai&utm_medium=referral&utm_campaign=tiktok-shop-api-guide&utm_content=mcp-api-guide) explains how to inspect the current contract before connecting a client.

## What should you record when using TikTok Shop data?

TikTok commerce signals change quickly. For each research run, save:

1. The API name and request parameters.
2. The market or region and the request date.
3. The returned snapshot or date range.
4. Whether a number is observed, estimated, or missing.
5. The product, shop, creator, or video identifier used for the next lookup.
6. The decision the result informed and what you still need to verify.

Do not convert an optional missing field into zero. Do not describe public research data as your own shop's first-party sales data. If you use the result in an ad, product claim, creator brief, or AI-generated video, verify the exact SKU and claim separately.

## How can sellers combine TikTok APIs into a workflow?

A practical workflow looks like this:

1. **Discover:** Use Product Discovery, Product Search, New Product Rank, or Video Search to create a dated shortlist.
2. **Qualify:** Use Product Detail, Reviews, Product Analytics Detail, or Shop Detail to check product and seller context.
3. **Map influence:** Use Related Creators, Creator Analytics, Related Videos, or Livestream Analytics to understand how attention is generated.
4. **Build a test brief:** Record one buyer question, one approved product claim, one creative hook, and one measurable outcome.
5. **Create or adapt assets:** If you use Nexscope's creative workflow, keep the output faithful to the exact SKU and review it before publication. For an image-to-video experiment, use the [image-to-video workflow](https://www.nexscope.ai/seller/video-generation/image-to-video?co-from=learn&utm_source=learn.nexscope.ai&utm_medium=referral&utm_campaign=tiktok-shop-api-guide&utm_content=image-to-video) with approved product imagery.
6. **Measure and re-check:** Compare product clicks, creator or video performance, and sales evidence over a defined window. Research APIs do not replace TikTok's own account, policy, or attribution reports.

## What the API catalog does not promise

The directory is useful for research, but sellers should keep the boundary clear:

- A product ranking is not a guaranteed trend or sales forecast.
- A creator association is not an endorsement or a contract.
- A video download URL is not permission to reuse copyrighted content.
- An ad result is not proof of compliant claims.
- A public shop result is not proof of factory identity or ownership.
- A creative video file is not automatically a TikTok Shop post or an AI-disclosure decision.

Use the API to reduce research time and make your next test more evidence-based. Keep the final listing, creator agreement, ad claim, disclosure, and publication decision in the appropriate TikTok workflow.

## FAQ

### Is Nexscope a TikTok Shop account-management API?

The current catalog documents public marketplace and social-commerce research capabilities. It does not, by itself, mean Nexscope can manage orders, publish posts, connect a store, or operate a TikTok advertising account. Confirm the scope on each API page before planning an integration.

### Which API is best for TikTok product research?

Start with Product Discovery or Product Search when you need a shortlist. Use Product Detail, Product Reviews, Product Analytics Detail, or Shop Detail after you have a specific product or seller to investigate.

### Can I use TikTok APIs with an AI agent?

Yes, where the API page exposes an MCP method. You can also call the REST endpoint from your own application. Use the same documented parameters and keep the API key on the server side.

### Do TikTok API results guarantee that a product will sell?

No. The results are research signals. Validate product quality, inventory, pricing, claims, policy requirements, creator fit, and actual conversion performance before scaling.

## Related resources

- [Nexscope API capabilities and ecommerce workflows](/api-capabilities/)
- [TikTok Shop AI UGC video seller workflow](/ecommerce-trends/tiktok-shop-ai-ugc-video-seller-workflow/)
- [Ecommerce APIs and MCP tools for AI agents](https://www.nexscope.ai/api-docs?co-from=learn&utm_source=learn.nexscope.ai&utm_medium=referral&utm_campaign=tiktok-shop-api-guide&utm_content=related-resource)

