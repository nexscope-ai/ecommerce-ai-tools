---
layout: default
learning_topic: visibility
related_topics: [research]
content_kind: guide
title: "Google Shopping Sale Price Mismatch: A Holiday Feed Checklist"
description: "Fix a Google Merchant Center sale price mismatch by checking the exact variant, currency, sale window, structured data and checkout."
permalink: /guides/google-shopping-sale-price-mismatch/
date_published: 2026-11-12
date_modified: 2026-11-12
last_modified_at: 2026-11-12
last_reviewed: 2026-11-12
author: Nexscope Team
schema_type: Article
og_type: article
compact_evidence: true
evidence_scope: "Based on Google Merchant Center guidance. The example prices are illustrative."
suppress_article_help: true
next_step:
  id: google_sale_price_product_report
  intent: product-report-evaluation
  title: "Review the public product page behind your Google Shopping offer"
  description: "Start with one public product URL and one target market. Choose your service and review the credit quote before submitting."
  label: "Explore the Product Growth Report"
  url: "https://www.nexscope.ai/product-growth-report?co-from=learn#request"
---

# How to fix a Google Shopping sale price mismatch before a holiday sale

Start with the affected item ID in Merchant Center and open its exact variant link in the target market. Compare the price in the feed, on the product page and in its structured data. Google's holiday shopping guidance recommends keeping feeds current as shoppers discover products across Shopping and AI experiences. A mismatch can lead to a product disapproval. [Google holiday shopping guidance](https://blog.google/products-and-platforms/products/shopping/google-shopping-updates-holiday-shopping/) · [Merchant Center price mismatch instructions](https://support.google.com/merchants/answer/12159029?hl=en)

{% include article-quick-action.html %}

## Follow the same SKU from the feed to checkout

Take a dated snapshot before changing anything. Keep the Merchant Center item ID, variant URL, target country, currency and expected sale window together.

| Check | What to compare | Typical fix |
| --- | --- | --- |
| Feed | `price`, `sale_price` and `sale_price_effective_date` | Synchronize the promotion dates and confirm the time zone |
| Landing page | Variant, currency and price displayed on initial load | Link to the exact variant and correct market |
| Structured data | The detected Offer's price and currency | Update stale Offer values and check the URL in Google's Rich Results Test |
| Checkout | The selected variant and the advertised item price | Verify that any conditions shown on the offer match what a shopper sees |

For example, a blue two-pack goes from $40 to $32 at midnight Pacific time. If the feed reports $32 but the link opens a single pack at $22, correct the link before changing the price. If the correct two-pack page shows $32 and its markup still reports $40, fix the markup and confirm the detected Offer again.

## Verify that the fix reached Merchant Center

Update the website and product data together. Confirm that the new data was processed, then review the product's current status after Google checks it again. Record the observed status and timestamp. Use the same steps after the promotion ends to catch stale sale prices. [Google's instructions for reconciling feed and landing-page prices](https://support.google.com/merchants/answer/9773429?hl=en)

## When the price is correct but the page still leaves buyers guessing

Check whether the landing page clearly explains what ships, which variant the price applies to and why the product fits the shopper's use. Nexscope's Product Growth Report reviews one public product page and market. Select **Product copy rewriting** for suggested edits. SEO and GEO analyses are included with a selected paid service. Feed changes and Merchant Center status are managed in your own account. [Product Growth Report scope and example](https://learn.nexscope.ai/product-growth-report/)

{% include article-action.html placement="article-middle" %}

To compare public Shopping offers after checking your own listing, see the [Google Shopping seller offers guide]({{ '/guides/google-shopping-api-mcp-seller-offers/' | relative_url }}).
