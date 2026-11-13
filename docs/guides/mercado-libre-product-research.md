---
learning_topic: research
content_kind: guide
layout: default
title: "Mercado Libre Product Research: Find Products to Sell with Data"
description: "Research what to sell on Mercado Libre in Mexico, Brazil, Argentina, Chile and Colombia: category demand, 30-day sales, new entrants, price bands and reviews via API or an AI agent."
permalink: /guides/mercado-libre-product-research/
date_published: 2026-11-09
date_modified: 2026-11-09
last_modified_at: 2026-11-09
last_reviewed: 2026-11-09
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
keywords:
  - Mercado Libre product research
  - what to sell on Mercado Libre
  - Mercado Libre sales data API
  - Mercado Libre Mexico product research
  - Mercado Livre product research tool
faq:
  - question: "Which Mercado Libre markets can I research with Nexscope?"
    answer: "The current Mercado Libre market research reference lists five market codes: MLM (Mexico), MLB (Brazil), MLA (Argentina), MLC (Chile) and MCO (Colombia). Mexico is the default when no market code is sent."
  - question: "Are Mercado Libre sales figures from Nexscope official data?"
    answer: "No source should be treated as Mercado Libre's own reporting unless it says so. The API reference states that source and freshness are not specified beyond the documented fields, so treat 30-day sales and historical totals as third-party estimates and compare them with Mercado Libre's own market analysis where you have access."
  - question: "Can I find cross-border sellers separately from local sellers?"
    answer: "Yes. Product snapshot searches accept a shop_type filter with the values cross_border and local, so you can see how much of a niche's top sellers ship from abroad."
  - question: "Do I need to write code?"
    answer: "No. You can connect Nexscope to an MCP-compatible AI agent and ask in plain language. Developers can call the same operations through REST with an API key."
next_step:
  id: mercado_market_research
  title: Find the category code for one product idea
  intent: api-test
  description: 'Start with search_categories, a local-language keyword and the market code. The Mexico example below shows the JSON to paste.'
  label: Test Mercado Libre Market Research
  url: https://www.nexscope.ai/api-docs/mercado-market-intelligence?view=playground&co-from=learn
---

# How do you research what to sell on Mercado Libre?

**To choose a product for Mercado Libre, find the category code, pull the top listings by 30-day sales in your target country, check how many new listings entered recently, look at the price band and how concentrated sales are among sellers, read the reviews of the leaders, and only then calculate margin after fees, shipping and taxes.** Each step can be answered with data from the Nexscope Mercado Libre APIs, either through an AI agent or a direct API call.

{% include api-guide-entry.html %}

> **Quick answer:** Use `search_categories` to get the category ID, `industry_overview` for the category picture, `search_product_snapshots` to filter listings by 30-day sales, price, rating, listing date and cross-border vs local shop, `product_sales_trend` for a listing's history, and `review_search` for buyer complaints. Markets: Mexico (MLM), Brazil (MLB), Argentina (MLA), Chile (MLC), Colombia (MCO). Treat sales numbers as estimates and validate before importing stock.

## Why is Mercado Libre research hard right now?

Sellers in Latin America and cross-border sellers from China describe the same gap: tools for Amazon are everywhere, but Mercado Libre research is opaque or gated. A Chilean seller who built his own research tool wrote that he lost hours "trying to guess what to import" and that the best-known Mercado Libre analytics vendor required an application and did not publish its price ([r/FinanzasChile, 2026](https://www.reddit.com/r/FinanzasChile/comments/1tx8p7q/vendedoresimportadores_arm%C3%A9_una_herramienta_para/)). In Argentina, beginners ask where to start when importing from China to sell on Mercado Libre ([r/NegociosArgentina](https://www.reddit.com/r/NegociosArgentina/comments/1ved28j/cero_experiencia_importando_quiero_traer_de_china/)), and a Chinese cross-border seller asked Brazilian buyers what he was missing ([r/mercadolivre](https://www.reddit.com/r/mercadolivre/comments/1toam0q/i_am_a_chinese_crossborder_seller_shipping/)).

A widely shared Brazilian method sets clear rules: discard niches where the leader has under 500 visits in 30 days, watch how many new listings appeared in the last 15 days, require at least 15% net margin after commission, freight and tax, check a 3–4 month trend, and avoid niches where one seller takes more than 70% of the traffic ([r/mercadolivre](https://www.reddit.com/r/mercadolivre/comments/1u313yj/como_analiso_um_produto_antes_de_comprar_estoque/)). The same thread warns that external tools don't always match Mercado Libre's own market analysis. That is a good reason to use data as a filter, not as a forecast.

## Which data answers which question?

Nexscope documents two Mercado Libre APIs. The table maps the common research questions to the operations in the [Mercado Libre Market Research API](https://www.nexscope.ai/api-docs/mercado-market-intelligence?view=api&co-from=learn) (`nexscope_mercado_market_intelligence`).

| Research question | Operation (`toolName`) | Key inputs |
| --- | --- | --- |
| What is the category code for my idea? | `search_categories` | `query`, `market_code` |
| How big and crowded is the category? | `industry_overview` | `category_id`, `market_code` |
| Which listings sell most, at what price? | `search_product_snapshots` | `keyword` or `category_id`; filters for `sales_30d`, `price`, `rating`, `review_count`, `listing_date`, `shop_type`; `sort_by` |
| Is a leading listing growing or fading? | `product_sales_trend` | `sku_id`, `days` (up to 731) |
| Is my supplier's product already listed? | `image_search_products` | `image_url` |
| What do buyers complain about? | `review_search` | `sku_id` |

A second API, [Mercado Product Selection](https://www.nexscope.ai/api-docs/mercado-product-selection?view=api&co-from=learn) (`nexscope_mercado_product_selection`), wraps 24 operations including keyword monthly search, keyword reverse lookup, seller search, new-item trends, price trends and top brands. Use it when you need keyword demand or brand concentration that the snapshot search does not show. The pages listed both at roughly 10–25 credits per call on November 9, 2026; check the [pricing page](https://www.nexscope.ai/pricing?co-from=learn) for current plans.

## How do you run the research step by step?

1. **Pick a market and an idea.** Start with one country. Mexico (MLM) and Brazil (MLB) are the largest; sellers often validate in one before expanding.
2. **Get the category code.** Run `search_categories` with a local-language query (for example `"botella de agua plegable"` for Mexico or `"garrafa dobrável"` for Brazil).
3. **Read the category overview.** Run `industry_overview` on the code. Note total activity, how many sellers have sales and price levels as reported.
4. **Pull the leaders.** Run `search_product_snapshots` sorted by `sales_30d`, `limit` 50. Record price, 30-day sales, historical sales, rating, review count and listing date.
5. **Measure new entrants.** Run the same search with `listing_date_min` set 15–30 days ago. Many new listings with sales means attention is arriving — and price competition may follow.
6. **Split cross-border and local.** Repeat with `shop_type: "cross_border"` and `"local"`. If local sellers dominate the top results, delivery speed may matter more than price.
7. **Check concentration.** From the leaders list, calculate the share of 30-day sales held by the top seller. A niche where one seller holds most sales is harder to enter.
8. **Check the trend of 2–3 leaders.** Run `product_sales_trend` with `days: 120`. Rising or stable is a candidate; consistently falling is a warning.
9. **Read reviews.** Run `review_search` on the leaders. Repeated complaints are your differentiation opportunity.
10. **Calculate margin outside the data.** Landed cost, Mercado Libre commission, shipping, taxes, returns and ads. If net margin is below your threshold, stop, however good demand looks.

## What prompt should you give an AI agent?

Connect Nexscope through the [MCP setup](https://www.nexscope.ai/mcp-data?co-from=learn) (server `https://api.nexscope.ai/mcp`, OAuth or API key) in Claude, Codex, Cursor or another MCP client, then ask:

```text
I'm evaluating "collapsible silicone water bottle" for Mercado Libre Mexico (MLM).
Using the Nexscope Mercado Libre tools:
1. Find the best matching category code.
2. Get the industry overview for that category.
3. List the top 30 listings by 30-day sales: title, price, sales_30d,
   historical sales, rating, reviews, listing date, shop type.
4. Count listings created in the last 30 days that already have sales.
5. Compute the top seller's share of 30-day sales among the 30 listings.
6. Get 120-day sales trends for the top 3 listings.
7. Pull 20 reviews for the top 2 listings and group recurring complaints.
Show the raw numbers in tables. Label every sales number as an estimate.
Don't recommend importing; list what I still need to verify.
```

**Example only:** the product and market are illustrative and no results are shown here. Run it on your own idea and keep the dated output.

## How do you call it from code?

The category search documented in the API reference:

```bash
curl -X POST 'https://api.nexscope.ai/mercado/marketResearch' \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "search_categories",
    "arguments": { "market_code": "MLM", "query": "botella de agua", "limit": 10 }
  }'
```

Then a filtered snapshot search on the code you selected:

```json
{
  "toolName": "search_product_snapshots",
  "arguments": {
    "market_code": "MLM",
    "category_id": "YOUR_CATEGORY_ID",
    "sales_30d_min": 50,
    "price_min": 150,
    "price_max": 600,
    "shop_type": "cross_border",
    "sort_by": "sales_30d",
    "sort_order": "desc",
    "limit": 50
  }
}
```

The response wraps results in a platform envelope where `code` 0 means success; the wrapper's `total` and `charged` fields describe the call, not market demand. Price filters use local currency values as returned by the source — confirm the currency before you set thresholds.

## How do you turn the data into a decision?

| Check | Healthy signal | Warning signal |
| --- | --- | --- |
| Leader 30-day sales | Several listings with steady sales, not one spike | Only one listing sells; others near zero |
| New entrants (last 15–30 days) | A few, with modest sales | Many new listings at once — a price war may be coming |
| Concentration | Sales spread across several mid-size sellers | One seller holds most of the sales |
| Trend | Rising or stable over 3–4 months | Falling month over month |
| Reviews | Specific fixable complaints | Complaints about issues you can't fix (customs, delivery time for cross-border) |
| Margin (your calculation) | Above your threshold after all costs | Below it — stop |

These thresholds are a starting framework adapted from the community method above, not Nexscope recommendations or guarantees.

## Where does sourcing fit?

Once a niche passes, use [1688 search by image]({{ '/ecommerce-trends/1688-image-search-sourcing/' | relative_url }}) on a leader's main image to find factories, and the [1688 product search guide]({{ '/guides/1688-product-search-api/' | relative_url }}) to filter by MOQ and price. Before you order, run an IP screen — see [patent, trademark and TRO checks]({{ '/guides/amazon-patent-trademark-tro-check/' | relative_url }}); Mercado Libre also removes listings on rights-holder complaints. If you sell on several marketplaces, the same agent can compare with [Shopee]({{ '/guides/shopee-product-research-api/' | relative_url }}), [Temu]({{ '/guides/temu-product-research-api/' | relative_url }}) or [Ozon]({{ '/guides/ozon-product-research-api/' | relative_url }}).

## How does this compare with other Mercado Libre tools?

| Option | Strength | Trade-off |
| --- | --- | --- |
| Mercado Libre's own market analysis in your seller account | Official data | The community reports it only shows categories where you already have sales |
| Dedicated Mercado Libre analytics (for example Nubimetrics, VirtualSeller, Teclazo for keywords) | Built for Mercado Libre; dashboards; some free tiers | Separate tools; some require an application or sales call |
| Nexscope Mercado Libre APIs via MCP or REST | Same agent and credits as your Amazon, TikTok Shop, 1688 and IP research; filters you control | Estimates from a third-party source; you write the prompt or code |

## Frequently asked questions

### Which Mercado Libre markets can I research with Nexscope?

Five market codes are documented: MLM (Mexico), MLB (Brazil), MLA (Argentina), MLC (Chile) and MCO (Colombia). Mexico is the default.

### Are Mercado Libre sales figures from Nexscope official data?

Treat them as third-party estimates. Compare with Mercado Libre's own market analysis where you can.

### Can I find cross-border sellers separately from local sellers?

Yes. Snapshot searches accept `shop_type` with `cross_border` or `local`.

### Do I need to write code?

No. Connect Nexscope to an MCP-compatible agent and ask in plain language, or use the REST API.

**Next step:** run a [Mercado Libre category search](https://www.nexscope.ai/api-docs/mercado-market-intelligence?view=playground&co-from=learn) for one product idea in Mexico and note the category code before pulling listings.
