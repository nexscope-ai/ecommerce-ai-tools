---
layout: default
learning_topic: visibility
related_topics: [research]
content_kind: guide
title: "Shopify Shop.md: How to Audit Product Discovery for AI Shoppers"
description: "Use one Shopify variant and three buying questions to check what a Shop.md-enabled shopping agent finds, links and says about your product."
permalink: /guides/shopify-shop-md-product-discovery/
date_published: 2026-11-12
date_modified: 2026-11-12
last_modified_at: 2026-11-12
last_reviewed: 2026-11-12
author: Nexscope Team
schema_type: Article
og_type: article
compact_evidence: true
evidence_scope: "Based on Shopify's Fall '26 announcement and Catalog documentation. The prompts are a proposed workflow."
suppress_article_help: true
next_step:
  id: shop_md_product_growth_report
  intent: product-report-evaluation
  title: "Check how sampled AI answers identify one product"
  description: "Start with one public product URL and one target market. Choose your service and review the credit quote before submitting."
  label: "Explore AI mentions and recommendations"
  url: "https://www.nexscope.ai/product-growth-report?co-from=learn#request"
---

# Shopify Shop.md product discovery audit for merchants

Shopify introduced Shop.md in its Fall '26 Edition as a shopping skill that compatible AI agents can use to search products through Shop. For a merchant, a useful first check is whether a shopping answer identifies the correct product and variant for a specific buyer need. Start with one public product page and one target market. [Shopify Fall '26 announcement](https://www.shopify.com/news/fall-26-edition-merchant)

{% include article-quick-action.html %}

## Record what the catalog and live page say

Check your Shopify Catalog eligibility and review product data mapping where available in Shopify admin. Then open the live product page and select the same variant a shopper would buy. Record its title, variant, market, price, availability and any fit or compatibility claim you want an agent to repeat. [Shopify Catalog eligibility and product data mapping](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/products)

If your variant picker calls an option “Navy,” and the title or lead image describes the black version, resolve which details apply to the linked SKU. Confirm measurements and pack contents against the product before revising the listing.

## Ask three questions and save the linked product

Use a compatible shopping agent with Shop.md available. Keep the market and buyer need consistent. For a travel mug, try these questions:

| Question | What to check |
| --- | --- |
| Which insulated travel mugs fit a cup holder with a 2.8-inch opening? | Does the answer give a source for the base diameter? |
| Is the navy version of this model sold with one lid or two? | Does the answer identify the model and correct variant? |
| How does this mug compare with a similarly priced option for cleaning and fit? | Do the compared listings and claims match the links? |

Save the prompt, date, observed answer, exact product URL and any mismatched detail. Note which agent and shopping setup you used. Keep personalized context in mind when repeating the check. A single result shows what that session returned.

## Improve the first product fact that failed the check

If the agent links to the correct item but cannot verify a useful measurement, add the verified value where buyers can see it on the product page. If the linked variant is wrong, compare the variant labels, URLs and catalog mapping. Retest the same prompt with comparable settings after the update.

Nexscope's **AI mentions & recommendations** service reviews available sampled answers for one product and target market. Select it if you want help checking product identification, recommendation wording and the evidence behind it. The report describes its own sample scope. For a Shop.md-specific observation, use the workflow above and keep the result from that session. [Product Growth Report scope and public example](https://learn.nexscope.ai/product-growth-report/)

{% include article-action.html placement="article-middle" %}

If you are troubleshooting ChatGPT's Shopify channel specifically, see the [Shopify product visibility checklist]({{ '/guides/shopify-product-not-showing-in-chatgpt/' | relative_url }}).
