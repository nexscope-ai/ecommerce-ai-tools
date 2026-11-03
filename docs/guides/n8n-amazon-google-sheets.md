---
layout: default
learning_topic: agents
related_topics: [research]
content_kind: guide
title: "n8n Amazon API: Product Data to Google Sheets"
description: "Import a manual n8n workflow for Amazon product data: configure Nexscope credentials, validate the returned ASIN and append reviewed fields to Google Sheets."
permalink: /guides/n8n-amazon-google-sheets/
date_published: 2026-11-03
date_modified: 2026-11-03
last_modified_at: 2026-11-03
last_reviewed: 2026-11-03
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
next_step:
  id: n8n_amazon_product_sheet
  intent: api_evaluation
  title: Check the product lookup before connecting your sheet
  description: Review the Product Detail request, current access and credits, then configure your own Nexscope credential in n8n. The starter makes one manual product request.
  label: Open Amazon Product Detail API
  url: "https://www.nexscope.ai/api-docs/amazon-product-detail?view=api#online-test"
keywords: [n8n amazon, amazon api google sheets, n8n http request, n8n amazon product data]
faq:
  - question: Is this an official Amazon SP-API workflow?
    answer: "No. This workflow uses Nexscope to retrieve public Amazon product research data. It does not connect Seller Central, retrieve private orders or use an Amazon seller authorization token."
  - question: Will the n8n template run or write to Sheets automatically?
    answer: "No. The workflow is inactive, uses a Manual Trigger and has no schedule. The Google Sheets node is disabled until you configure your own credentials, spreadsheet and headers and enable it."
  - question: Can repeated executions add duplicate spreadsheet rows?
    answer: "Yes. The starter uses Append Row. Each execution can make a new credit-using product request and append another observation. It does not provide an idempotent database or a cross-run deduplication system."
---

# n8n Amazon API: send product data to Google Sheets

**Connect Nexscope's Amazon Product Detail API to n8n's HTTP Request node, validate the response, then map the returned product fields into Google Sheets.** The downloadable starter handles one ASIN per manual execution and keeps the spreadsheet step disabled until you configure and review it.

{% include api-guide-entry.html %}

> **Quick answer:** Import the inactive workflow, set one ASIN, select a Nexscope Header Auth credential and inspect the validated output. Create the sheet headers, connect your own Google account and enable Append Row when ready. This is public product research, not an Amazon Seller Central order integration.

## What does this n8n Amazon workflow do?

**It looks up one product and prepares one timestamped observation for a spreadsheet.** It does not search for arbitrary products, track every price change or synchronize inventory.

```text
Manual Trigger
  → Product input
  → Nexscope Product Detail
  → Validate and map
  → Append to Google Sheets (configure, then enable)
```

The [Nexscope Product Detail reference](https://www.nexscope.ai/api-docs/amazon-product-detail?view=api) documents a comma-separated `asins` input and an Amazon domain. This starter deliberately uses one uppercase 10-character ASIN and `amazon.com`. Its smaller scope makes it easier to inspect product identity and expected output before extending the workflow.

If you need private merchant orders or authorized store management, choose the appropriate official seller integration instead. If you need review evidence, use the separate [Amazon Reviews API Python tutorial]({{ '/ecommerce-trends/amazon-reviews-api-customer-pain-points/' | relative_url }}); the product-detail request is not a review collection request.

## What should you download and prepare?

**Download the JSON template and header CSV, then prepare your own credentials and destination sheet.** The files contain no API key, Google credential or live product result.

- [Download the n8n starter workflow]({{ '/assets/downloads/n8n-amazon-product-to-sheets.json' | relative_url }}).
- [Download the Google Sheets header row]({{ '/assets/downloads/amazon-product-sheet-headers.csv' | relative_url }}).
- Have access to an n8n instance, a Nexscope API key and a Google account that can edit your intended spreadsheet.

The template uses standard Manual Trigger, Code, HTTP Request and Google Sheets nodes. The included HTTP Request node uses type version 4.2 and Google Sheets uses 4.7. Inspect the imported controls in your installed n8n version, especially credentials, body format and cell format, before executing.

The template's graph and code are checked offline against synthetic responses. An authenticated n8n import, paid product lookup and live Google Sheets write were not performed for this article. Treat the template as a configurable starter, not a record of an executed customer integration.

## How do you configure the product and API credential?

**Import the file through n8n's workflow import control, keep it inactive and edit the Product input node.** Replace `REPLACE_WITH_ASIN` with the product you intend to inspect. Leave the domain as `amazon.com` for the first run.

The input node rejects an unchanged placeholder and unsupported starter scope before the HTTP node runs. The request body is built from this input:

```json
{
  "asins": "B08N5WRWNW",
  "amazonDomain": "amazon.com"
}
```

This ASIN is an illustrative request value, not a recommendation or a reported test. Confirm the product in the relevant marketplace before using it.

In **Nexscope Product Detail**, select a generic **Header Auth** credential. Set its header name to `Authorization` and its value to `Bearer YOUR_API_KEY`, using your actual key inside n8n's credential manager. Do not paste it into the workflow JSON, Code nodes, spreadsheet or a shared screenshot.

Confirm these HTTP settings against the [official n8n HTTP Request documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/):

| Setting | Starter value |
| --- | --- |
| Method | `POST` |
| URL | `https://api.nexscope.ai/amazon/product/detail` |
| Authentication | Generic Header Auth credential |
| Body | JSON expression from Product input |
| Response | JSON |
| Timeout | 90 seconds |
| Retry on failure | Off |

Review current Nexscope access and credits before executing. The first manual run still makes a credit-using API request even though the Sheets node is disabled.

## Why validate the response before writing to Sheets?

**HTTP 200 alone does not prove that a usable product record was returned.** The Validate and map node checks the business envelope and product identity before producing any row.

The starter requires numeric `code: 0`, a `data.products` array with exactly one record and a returned `asin` matching the input. A reported non-200 product-record status stops the workflow. Missing arrays, an asynchronous task response, unexpected row counts or another ASIN also stop it for inspection.

Keep the HTTP node's original output available while reviewing the mapped data. If it contains a task identifier instead of a product list, follow the current API's documented result-retrieval process; this template does not create a second paid request to fill the gap. The starter assumes the documented `data.products` shape and stops rather than guessing a new container if the upstream response changes.

Fields such as title, brand, price, currency, rating, ratings and stock are copied when present. Missing values become blank cells and their names appear in `missing_fields`. Zero is preserved. Nested optional values are serialized for review rather than silently interpreted as a different price or stock quantity.

{% include article-action.html placement="article-middle" %}

## How do you connect Google Sheets?

**Create the matching headers, choose your own Google credential and destination, then enable the spreadsheet node.** First inspect **Validate and map** with the Sheets node still disabled.

Import the header CSV into a sheet named **Product research**, or create the following first row:

```text
asin,requested_domain,title,brand,price,currency,rating,ratings,stock,missing_fields,observed_at_utc,execution_id
```

In the Google Sheets node, select your authorized Google credential and replace `REPLACE_WITH_SPREADSHEET_ID` with the intended spreadsheet ID. Confirm the sheet name and **Append Row** operation. Refresh the available column mapping if your n8n version requests it; automatic mapping requires the header names to match the incoming field names.

Keep **Cell Format = RAW**. The mapping code also prefixes spreadsheet-sensitive strings. These measures keep returned text from being treated as an executable formula. Review the [Google Sheets node documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/) for the available operations and Google credential setup.

When the mapped row and destination are correct, enable the Sheets node and execute deliberately. A new execution makes another API request. During setup, you can use n8n's own reviewed intermediate data or node-execution controls to test the mapping, but check and remove pinned sample data before a real collection so it cannot be mistaken for a fresh lookup.

## What happens on repeated runs or failures?

**Each completed execution is a new observation, and Append Row can create duplicates across runs.** The starter records `observed_at_utc` as the time the mapping node ran and `execution_id` as the n8n execution reference. Neither is a supplier freshness timestamp.

If Sheets fails after a successful product request, inspect the execution and reuse the validated result where your n8n setup supports it. Restarting the entire workflow can make another paid API request. There is no automatic retry, schedule or hidden loop in the downloaded template.

For a maintained monitoring workflow, define the observation interval, budget, storage key and update policy separately. Decide whether the sheet should hold one current row per ASIN or a historical series before replacing Append Row with another operation. This starter is neither a cross-run deduplication system nor a guarantee of live price freshness.

## Frequently asked questions

### Is this an official Amazon SP-API workflow?

No. It uses Nexscope for public product research and does not connect private Seller Central orders or seller authorization tokens.

### Will it run or write to Sheets automatically?

No. It is inactive, manually triggered and has no schedule. The Sheets node is disabled until you configure the destination and enable it.

### Can repeated executions add duplicate rows?

Yes. Append Row adds observations; repeated executions can also incur new API charges. Plan a separate update or deduplication policy before turning a starter into a recurring system.

For a code-based product export, compare the [Amazon scraper API tutorial]({{ '/guides/amazon-scraper-python/' | relative_url }}). For another spreadsheet research task, the [keyword search volume API guide]({{ '/ecommerce-trends/seo-keyword-api-content-plan/' | relative_url }}) provides a Python-to-CSV workflow.
