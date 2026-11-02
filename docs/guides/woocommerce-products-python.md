---
layout: default
learning_topic: agents
related_topics: [research]
content_kind: guide
title: "WooCommerce Product Scraper: Python, Variations & CSV"
description: "Query one public WooCommerce store with Python, inspect parent products and variations, and export CSV with source identity, cache metadata and missing fields."
permalink: /guides/woocommerce-products-python/
date_published: 2026-11-02
date_modified: 2026-11-02
last_modified_at: 2026-11-02
last_reviewed: 2026-11-02
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
next_step:
  id: woocommerce_python_export
  intent: api_evaluation
  title: Inspect the query for one public store
  description: Review the store URL, supported fields and current credits. Try one product page before choosing a parent product for a separate variation request.
  label: Open WooCommerce Products in the playground
  url: "https://www.nexscope.ai/api-docs/woocommerce-products?view=api#online-test"
keywords: [woocommerce product scraper, woocommerce api python, woocommerce products api, woocommerce product variations api]
faq:
  - question: Can this WooCommerce product scraper search every store?
    answer: "No. This workflow searches within one specified public store. Availability depends on the store and supported public data; it does not provide a global WooCommerce product index."
  - question: Do I need a merchant's WooCommerce consumer secret?
    answer: "This Nexscope workflow uses a Nexscope API key to read supported public product data. It does not request a merchant's private WooCommerce credentials or access their private orders."
  - question: Is a parent product row a complete list of its SKUs?
    answer: "No. Select a parent within its store, then make a separate variation request. Preserve store identity and parentId and review pagination before claiming complete SKU coverage."
---

# WooCommerce product scraper: a Python API-to-CSV workflow

**Query one public WooCommerce store, review the returned products, then inspect a selected parent's variations.** This WooCommerce product scraper alternative uses Nexscope and a downloadable Python script. It produces source JSON, a review CSV and a manifest, while keeping store, parent and variant identity separate.

{% include api-guide-entry.html %}

> **Quick answer:** Use a store URL and optional keyword for one bounded product request. After reviewing the result, select a parent ID from that same store and run the variation request separately. Keep returned prices, stock fields, cache information and fetch time. Public product evidence does not provide private order access or guarantee complete storefront coverage.

*Reviewed November 2, 2026 by Nexscope Team against public references. Code is checked with synthetic offline responses; this article reports no chargeable production test or merchant findings.*

## Which WooCommerce API should you use?

**Choose by ownership and task.** This tutorial is a public product-research workflow. WooCommerce's own [Store API documentation](https://developer.woocommerce.com/docs/apis/store-api/) distinguishes public storefront functionality from authenticated administration. Nexscope adds its own authentication and response contract; a Nexscope Key is not a WooCommerce merchant secret.

| Your task | Starting point |
| --- | --- |
| Search products inside one supported public store | Nexscope WooCommerce Products |
| Inspect a known parent's returned SKUs | Nexscope Product Variations |
| Manage products or private orders in your own store | The appropriate authorized WooCommerce integration |
| Search across all WooCommerce stores | A separately verified discovery source |

This approach suits a developer prototyping a comparison sheet, an analyst reviewing a public assortment or a team collecting a small sourcing shortlist. It does not fit private order reporting or an inventory-sync promise across arbitrary stores.

## How do you export products with Python?

**Start with one page and retain the original response.** Download [commerce-evidence-export.py]({{ '/assets/downloads/commerce-evidence-export.py' | relative_url }}), use Python 3.10 or later and create `woo-request.json` in the same folder. Replace the illustrative host with a real public HTTPS store installation URL before executing:

```json
{
  "storeUrl": "https://example.com",
  "keyword": "shirt",
  "pageNum": 1,
  "pageSize": 20
}
```

Set a Nexscope Key in your local environment. In PowerShell 7, a masked prompt keeps the literal value out of command history:

```powershell
$env:NEXSCOPE_API_KEY = Read-Host 'Nexscope API key' -MaskInput
```

Then execute:

```bash
python commerce-evidence-export.py woo-products woo-request.json --output woo-products-run
```

Each live execution uses API credits. Review the [current Products reference](https://www.nexscope.ai/api-docs/woocommerce-products?view=api) first. The script uses the documented product route, makes one POST and does not automatically retry or paginate. A new output directory is required so an earlier run cannot be overwritten.

The request's `keyword` searches inside the specified store. Keep a WordPress installation subdirectory when it is part of that store's address. Do not submit a search-results URL containing query parameters or a product link as though it were the installation root.

{% include article-action.html placement="article-middle" %}

## How do you retrieve product variations?

**Choose the parent after reading the product result.** Create `woo-variations-request.json` with that store and the selected positive decimal product ID. The following ID is illustrative; it is not a finding from `example.com`:

```json
{
  "storeUrl": "https://example.com",
  "productId": "34",
  "pageNum": 1,
  "pageSize": 20
}
```

Run the separate command only after checking the [Product Variations reference](https://www.nexscope.ai/api-docs/woocommerce-product-variations?view=api):

```bash
python commerce-evidence-export.py woo-variations woo-variations-request.json --output woo-variants-run
```

The script checks the returned store and parent identity before export. It does not automatically look up every product's variants. This separation lets you inspect the first result and decide whether another credit-consuming request is useful.

Treat the join key as **store + parent + returned variant ID**. A numeric ID from one WordPress installation is not a global product identity. The response envelope's parent ID provides context; inspect each returned SKU's attributes and link before treating it as a comparable offer.

## How should you interpret prices, stock and fetch time?

**Preserve values before normalizing them.** The script retains the returned price representation, currency, minor-unit information and stock fields. It does not recalculate money or fill unknown availability with a likely answer. The original JSON is authoritative when CSV loses types or nesting.

| Evidence | How to use it |
| --- | --- |
| Store and product identifiers | Keep records attached to their source store |
| Parent and variation context | Avoid merging a parent price range with one exact SKU |
| Price and currency fields | Verify units before converting or comparing |
| Fetch time and cache metadata | Distinguish a retrieved snapshot from a product update |
| Pagination metadata | Decide whether another bounded request is necessary |

`fetchedAt` describes retrieval, not when the merchant modified the product. A cache hit is also not a new observation of the storefront. A returned zero price is preserved; a missing stock quantity remains blank. Neither a blank quantity nor a missing pagination total proves zero stock or zero products.

## What happens when data is incomplete or a call fails?

**Stop and inspect the saved response before repeating the request.** The starter checks HTTP and business status, expected arrays and source identity. A missing array is a response-shape problem; an explicit empty array is an empty returned page. Duplicate IDs stop the export rather than silently inflating a comparison.

On a successful run, read `rows.csv`, `response.json` and `manifest.json` together. `missing_fields` flags null or absent exported values; JSON distinguishes those cases. An empty result creates a CSV containing only the `missing_fields` header, with zero exported rows in the manifest.

You can reprocess an existing response without a Key or another API request:

```bash
python commerce-evidence-export.py woo-products woo-request.json --from-response woo-products-run/response.json --output woo-offline-review
```

Offline mode validates transformation behavior, not current availability. A timeout leaves execution uncertain; inspect usage history before deciding to retry. For larger exports, deliberately add page limits and save each request separately. Do not infer complete catalog coverage from one page.

Read the [Shopify Python export guide]({{ '/guides/shopify-product-scraper-python/' | relative_url }}) to compare another storefront research contract, or the [MCP vs API guide]({{ '/guides/mcp-vs-api/' | relative_url }}) to choose an integration path. The schemas and store scopes remain different.

## Frequently asked questions

### Can this WooCommerce product scraper search every store?

No. It searches inside one supplied public store. A keyword is not a global discovery query, and a returned page does not establish exhaustive coverage.

### Do I need a merchant's WooCommerce consumer secret?

This Nexscope workflow uses a Nexscope Key for supported public product data. It does not request merchant credentials or grant private order access.

### Is a parent product row a complete list of its SKUs?

No. Query variations separately after selecting the parent, retain store identity and inspect pagination and SKU evidence before claiming completeness.
