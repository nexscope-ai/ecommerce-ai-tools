---
layout: default
learning_topic: agents
related_topics: [research]
content_kind: guide
title: "Shopify Product Scraper Alternative: Python API to CSV"
description: "Query Shopify product research data with Python and Nexscope. Download a CSV script, check source coverage and keep store IDs, missing values and metrics clear."
permalink: /guides/shopify-product-scraper-python/
date_published: 2026-10-30
date_modified: 2026-10-30
last_modified_at: 2026-10-30
last_reviewed: 2026-10-30
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
next_step:
  id: shopify_python_product_query
  intent: api_evaluation
  title: Check Shopify query coverage for your task
  description: Inspect the search inputs, supported filters, access and current credits. Review one returned page before building a larger storefront research workflow.
  label: Try Shopify Product Query in the playground
  url: "https://www.nexscope.ai/api-docs/shopify-product-query?view=api#online-test"
keywords: [shopify product scraper, shopify scraper, shopify product api, shopify python csv]
faq:
  - question: Can this Shopify product scraper export any store's full live catalog?
    answer: "No. This tutorial queries Nexscope's product research service. Coverage, returned fields and freshness depend on the service response. It does not guarantee a complete real-time catalog for an arbitrary storefront."
  - question: Is Nexscope Product Query the Shopify Admin API?
    answer: "No. Nexscope Product Query is a research interface. Shopify Admin API is a separate, authorized integration for a store. Do not use this research response as a replacement for owned inventory or order records."
  - question: Does an empty response prove a Shopify store has no products?
    answer: "No. An empty returned page can reflect the query, filters or service coverage. A missing products array is a different response-shape issue. Neither proves the store has no products."
---

# Shopify product scraper alternative: query data with Python

**Use a product-query API when you need a Shopify research shortlist, then inspect coverage before scaling.** This Shopify product scraper alternative saves one Nexscope query as raw JSON, a CSV and a request manifest. It helps you review candidate products without claiming to mirror an entire live store.

{% include api-guide-entry.html %}

> **Quick answer:** Use Nexscope Product Query for supported research searches and filters. Use Shopify's authorized APIs when your task is managing a store you control. The Python example below requests one page, preserves source identifiers and flags missing fields; it does not promise complete catalogs or verified merchant orders.

*Reviewed October 30, 2026 by Nexscope Team against the public reference. The script was checked with synthetic responses offline. No paid production query or storefront coverage experiment was run for this article.*

On this page: [select the right interface](#which-shopify-data-interface-fits-your-task) · [run Python](#how-do-you-query-shopify-products-with-python) · [filter carefully](#which-filters-should-you-add-first) · [read the CSV](#how-do-you-read-the-export-without-overstating-the-data) · [troubleshoot](#what-if-a-store-url-or-query-returns-no-products).

## Which Shopify data interface fits your task?

**Choose the interface by ownership and the decision you need to make.** A research query, an authorized store integration and a custom page collector solve different problems. A response with product-looking rows is not evidence that it is the operational source of truth for a merchant's catalog or orders.

| Your task | Starting point | What to verify |
| --- | --- | --- |
| Find product candidates by keyword or supported URL query | Nexscope Product Query | Coverage, returned fields and timestamps |
| Prepare a bounded competitor-research sheet | This Python export workflow | Product/store identity and metric definitions |
| Maintain products, inventory or orders in an owned store | [Shopify GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql/latest) | Store authorization and required permissions |
| Export every product or variant from a specific storefront | An interface with explicit full-catalog coverage | Access, variant completeness and refresh behavior |
| Extract a custom page field absent from a research response | A separately evaluated collection method | Permissions, field evidence and maintenance effort |

This tutorial fits a prototype, a product-research shortlist or a small analyst export. It does not fit live stock synchronization or an audit requiring proof of every SKU in a store. For the broader source decision, see the [ecommerce data extraction guide]({{ '/ecommerce-data-extraction-api/' | relative_url }}).

## How do you query Shopify products with Python?

**Run one bounded request and inspect the saved result before making another.** The downloadable starter requires Python 3.10 or later and uses no additional packages. It reads a Nexscope Key from the environment, creates a new output directory and stops rather than automatically retrying or collecting more pages. Execution uses API credits.

1. [Download product-query-to-csv.py]({{ '/assets/downloads/product-query-to-csv.py' | relative_url }}) into a local folder.
2. Review access and current usage information on the [Shopify Product Query reference](https://www.nexscope.ai/api-docs/shopify-product-query?view=api).
3. Set your Key locally. PowerShell 7 users can use a masked prompt so the literal Key is absent from command history:

```powershell
$env:NEXSCOPE_API_KEY = Read-Host 'Nexscope API key' -MaskInput
```

4. Run the script from its folder:

```bash
python product-query-to-csv.py shopify "phone case" --output shopify-phone-case
```

The starter sends the following JSON to Shopify Product Query:

```http
POST https://api.nexscope.ai/eh/shopify/productQuery
```

```json
{
  "searchKey": "phone case",
  "country": "US",
  "page": 1,
  "pageSize": 20
}
```

The country input refers to the documented shipping-country filter, not proof that the merchant is based in the United States. The query can use a keyword; the reference also accepts a Shopify product/store URL as `searchKey`. URL input is a query option, not a guarantee of direct real-time crawling or exhaustive catalog retrieval.

For another run, choose a new `--output` folder. If the folder already exists, the script exits before a request so it cannot overwrite the previous observation.

{% include article-action.html placement="article-middle" %}

## Which filters should you add first?

**Start with a query you can inspect, then add one filter at a time.** If you combine many constraints before learning what the service returns, an empty page will be hard to explain. Keep the original request with each observation, especially when comparing the same phrase under different conditions.

For example, add a USD price filter to the Shopify branch of `build_request`:

```python
return {"searchKey": args.query, "country": "US",
        "priceMin": 10, "priceMax": 40,
        "page": 1, "pageSize": 20}
```

The range is an illustrative input, not a recommended market price. Do not infer that every response field has an independently verified USD unit just because the request price filter uses USD. Read the current schema and any returned provider metadata before normalizing monetary fields.

The service also documents weekly-sales and other research filters. Their presence does not make the response an authorized copy of a merchant's order ledger. Verify definitions before comparing metrics across providers or forecasting revenue.

## How do you read the export without overstating the data?

**Use the CSV to review returned records, and keep the raw response as evidence.** The script exports product and store identifiers separately, preserves zero values and flags missing identity fields. It does not infer a store identity from a title, merge products across merchants or confirm the truth of a sales metric.

| Output | Use it for | Limit |
| --- | --- | --- |
| `response.json` | Original response fields and provider metadata | A snapshot can contain missing or stale information |
| `products.csv` | Review product IDs, store IDs, links, prices and returned weekly metrics | CSV is a convenience view with fewer fields and lost types |
| `manifest.json` | Request inputs, client observation time, status and flagged-row count | Observation time does not establish source freshness |

The CSV includes `productId`, `storeId` and `shopId` as separate columns. Retain store context when matching records: a product name or unscoped identifier is not enough to prove that two rows describe the same item. All returned records stay in order; deduplication and cross-store matching are left to a deliberate review step.

The core missing-field rule is explicit:

```python
missing_fields = ";".join(
    field for field in FIELDS[platform]
    if product.get(field) is None
)
```

`FIELDS` and `platform` are defined in the full downloadable script. An absent field and a returned null are both noted as missing in the CSV; inspect JSON to distinguish them. The script does not substitute a guessed price, currency or weekly sales value.

**Synthetic illustration only:** if `weekOrderCount` is the string `"0"` and `weekRevenueCount` is null, the CSV retains `0` and leaves revenue blank. It does not infer that revenue was zero. This is a conversion example, not an observed merchant result.

Text that could be interpreted as a spreadsheet formula is prefixed with an apostrophe in CSV. JSON is not altered. Before sharing an export with an LLM, select the fields needed for the analysis and keep source IDs beside conclusions. The script does not call an LLM or send your Key to one.

## What if a store URL or query returns no products?

**Distinguish an empty returned page from a request failure or an unsupported response shape.** None of those outcomes establishes that the live store has no products. Record the query, filters and response first, then decide whether a smaller test or another source is needed.

| Situation | Interpretation and next step |
| --- | --- |
| `products` is an empty array | Empty returned page; inspect the query, filters and coverage |
| `products` is missing or not an array | Export stops; check the current contract and saved body |
| A record lacks ID, title or link | Row is flagged for review; it is not silently discarded |
| HTTP failure or nonzero business code | Check access, credits and the saved response |
| Timeout | Check usage records before repeating a potentially executed request |
| Output directory already exists | Use a new directory; the script has not sent a request |

The manifest records returned rows and available provider totals separately. Do not treat a field named `total` as the size of Shopify's entire market, or multiply one page into an estimate of full-store coverage. More pages mean more requests; add an explicit call limit if you extend the code.

For an agent-led version, compare [MCP and REST]({{ '/guides/mcp-vs-api/' | relative_url }}). The [eBay Python guide]({{ '/guides/ebay-scraper-python/' | relative_url }}) uses the same downloader with another request and output field set. Shared code does not make the platforms' data definitions interchangeable.

## Frequently asked questions

### Can this Shopify product scraper export any store's full live catalog?

No. This example queries Nexscope's research service and exports the returned page. Coverage, freshness and fields depend on the response; it does not promise a complete real-time catalog for arbitrary stores.

### Is Nexscope Product Query the Shopify Admin API?

No. The research service is separate from Shopify's authorized store APIs. Use the appropriate owned-store integration for inventory, products or orders that you manage.

### Does an empty response prove a Shopify store has no products?

No. Check the query, filters and service coverage. A missing product array is a response-shape issue, while an empty array is an empty returned sample; neither proves an empty storefront.
