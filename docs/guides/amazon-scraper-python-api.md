---
layout: default
learning_topic: agents
related_topics: [research]
content_kind: guide
title: "Amazon Scraper in Python: Product API to Validated CSV"
description: "Build a Python Amazon product-data workflow using an ASIN API. Validate the response, preserve missing prices and export traceable CSV without HTML selectors."
permalink: /guides/amazon-scraper-python/
date_published: 2026-10-28
date_modified: 2026-10-28
last_modified_at: 2026-10-28
last_reviewed: 2026-10-28
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
next_step:
  id: amazon_python_product_api
  intent: api_evaluation
  title: Inspect one ASIN before building the collection job
  description: Open the Amazon Product Detail tester, review the current access and credit cost, and inspect the products array for a representative ASIN before scaling up.
  label: Open the Amazon product API tester
  url: "https://www.nexscope.ai/api-docs/amazon-product-detail?view=api#online-test"
keywords: [amazon scraper, amazon scraping python, amazon product scraper, amazon scraper api]
faq:
  - question: Does this Python example scrape Amazon HTML directly?
    answer: "No. It calls Nexscope's documented Amazon Product Detail API and exports fields from the structured response. It is an API-based alternative to maintaining HTML selectors, not a browser scraper or an official Amazon SDK."
  - question: Can one request collect an entire Amazon category?
    answer: "No. The reviewed product-detail route accepts a comma-separated list of up to 40 ASINs. Category discovery, pagination and repeated collection require separately documented requests and application logic."
  - question: Is a missing price equal to zero?
    answer: "No. Missing prices stay blank in the CSV. Preserve the original response and investigate the offer context; zero should appear only when a valid source value explicitly says zero."
---

# Amazon scraper in Python: use a product API and validate the CSV

**Build an API-based Amazon scraper workflow in Python: request product data by ASIN, validate returned records and export CSV.** This tutorial uses Nexscope's Amazon Product Detail endpoint rather than HTML selectors. It preserves raw JSON and missing fields, and checks product identity before accepting rows.

{% include api-guide-entry.html %}

> **Quick answer:** Send documented ASIN inputs to the product-detail endpoint, check the outer business result, validate `data.products`, match records by ASIN and keep missing values explicit. Save the raw JSON so that a later analysis can distinguish source evidence from a spreadsheet transformation.

*Reference checked October 28, 2026 by Nexscope Team. No paid product request was run for this article. The Python logic is an integration example; fixture checks cannot establish live coverage, freshness or throughput.*

## Should you use an API or maintain a Python HTML scraper?

**Choose by the evidence your application needs.** An API reduces the amount of page-specific parsing your application owns, but you still depend on the provider's coverage and contract. Direct page parsing requires a separate collection and maintenance design.

| Requirement | API-based workflow | Direct HTML workflow |
| --- | --- | --- |
| Defined product fields | Validate the documented JSON fields | Build and maintain extraction rules |
| Product identity | Match returned ASINs to requested ASINs | Associate parsed values with the correct page and variant |
| Missing information | Preserve nulls and absent fields | Distinguish a missing element from a changed layout or failed fetch |
| Cost planning | Inspect current request charges and accepted-record yield | Account for infrastructure, maintenance and review |
| Raw source requirements | Verify what evidence the provider actually exposes | Define what you may collect and retain |

The search landscape includes both API clients and HTML tutorials. For example, [Apify's Amazon Python API page](https://apify.com/junglee/amazon-crawler/api/python) describes calling its own scraper service. That request contract is different from Nexscope's. Provider examples should not be mixed into one supposedly universal Amazon scraper.

For the wider source-choice question, use the [ecommerce data extraction guide]({{ '/ecommerce-data-extraction-api/' | relative_url }}). This tutorial focuses on a concrete Python collection and export task.

## What inputs does the Amazon product endpoint accept?

The [current public reference](https://www.nexscope.ai/api-docs/amazon-product-detail?view=api) documents:

```text
POST https://api.nexscope.ai/amazon/product/detail
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

The required `asins` field is a comma-separated string, with up to 40 ASINs. Optional context includes `amazonDomain`, language, delivery ZIP and device. Review the supported values instead of assuming arbitrary domains or locales work.

Start with a known ASIN in a named marketplace. A listing URL, a seller ID and a search keyword are not interchangeable with an ASIN. If you only have a keyword, use the documented [Amazon Search API](https://www.nexscope.ai/api-docs/amazon-search?view=api&co-from=learn) to discover candidate IDs first.

## How do you request and export product data with Python?

The example below uses Python's standard library. Set `NEXSCOPE_API_KEY` securely in your local environment, then run the script with one or more ASINs:

```text
python amazon_products.py B072MQ5BRX
```

**Running the script submits one real request and may consume credits.** The example ASIN is an input identifier, not a claim that a product result has been tested for this tutorial. Keep keys out of repositories and shared terminal output.

```python
import csv
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

asins = [value.upper() for value in sys.argv[1:]]
if not 1 <= len(asins) <= 40:
    raise SystemExit("Supply 1 to 40 ASINs.")
if any(not re.fullmatch(r"[A-Z0-9]{10}", value) for value in asins):
    raise SystemExit("Use ten-character ASINs, not URLs.")
if len(set(asins)) != len(asins):
    raise SystemExit("Remove duplicate ASINs.")

request = urllib.request.Request(
    "https://api.nexscope.ai/amazon/product/detail",
    data=json.dumps({"asins": ",".join(asins),
                     "amazonDomain": "amazon.com"}).encode(),
    headers={"Authorization": "Bearer " + os.environ["NEXSCOPE_API_KEY"],
             "Content-Type": "application/json"},
    method="POST",
)
# No automatic POST retry: an uncertain request may already have executed.
with urllib.request.urlopen(request, timeout=120) as response:
    raw = response.read().decode("utf-8")
observed = datetime.now(timezone.utc).isoformat()
run_dir = Path("amazon-run-" + datetime.now(timezone.utc).strftime(
    "%Y%m%dT%H%M%S%fZ"))
run_dir.mkdir()
(run_dir / "response.json").write_text(raw, encoding="utf-8")
payload = json.loads(raw)
if not isinstance(payload, dict) or payload.get("code") != 0:
    raise SystemExit("Business result not accepted; inspect response.json.")
data = payload.get("data")
products = data.get("products") if isinstance(data, dict) else None
if not isinstance(products, list) or not products:
    raise SystemExit("No product list; inspect the saved response.")

accepted = {}
for item in products:
    if not isinstance(item, dict):
        raise SystemExit("Unexpected product record shape.")
    asin = item.get("asin")
    if asin not in asins or asin in accepted:
        raise SystemExit("Unexpected or duplicate ASIN; review raw evidence.")
    accepted[asin] = item

fields = ["asin", "title", "brand", "price", "currency", "rating", "ratings"]
with (run_dir / "products.csv").open("w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fields + ["marketplace", "retrieved_at"])
    writer.writeheader()
    for asin, item in accepted.items():
        row = {name: item.get(name) for name in fields}
        row.update(marketplace="amazon.com", retrieved_at=observed)
        writer.writerow(row)
print("Saved:", run_dir)
print("Missing requested ASINs:", sorted(set(asins) - set(accepted)))
```

The script deliberately matches identifiers instead of trusting response order. A shorter response remains shorter; it prints the IDs not returned. A missing optional price becomes an empty CSV field, not zero. The retrieval timestamp records when the client received data, not proof that the upstream observation is equally fresh.

## What should you check before using the CSV?

**Separate record identity from field completeness.** An ASIN match does not guarantee that all values meet the requirements of a price-comparison or listing-research task.

| Check | Example acceptance rule |
| --- | --- |
| Identity | Every accepted ASIN belongs to the requested set |
| Coverage | Requested, returned and missing IDs are recorded |
| Offer context | Marketplace and any delivery or variant assumptions are explicit |
| Price | Currency and source value exist before a price comparison |
| Descriptive fields | Missing title or brand is visible to the downstream task |
| Evidence | Raw response is saved beside the transformed output |

If opening untrusted product text in spreadsheet software, apply your organization's CSV formula-injection controls first. The code preserves source text; it is not a spreadsheet sanitization layer.

{% include article-action.html placement="article-middle" %}

## What happens when the request fails or returns partial data?

HTTP 200 alone is insufficient: the reference instructs callers to inspect the outer `code`. A null `data` or absent product list should stop the export's success path. Preserve a useful error identifier when present, without logging the API key.

If a network timeout leaves execution uncertain, do not immediately run the POST in a tight retry loop. Check the route's documented recovery behavior and usage record first. For repeated collection, implement bounded concurrency and honor documented admission or rate-limit signals.

Treat an optional field as unknown when absent. If your application requires price and currency, flag incomplete records for that task rather than presenting them as accepted price observations. Keep the last usable record with a stale label when a refresh fails.

## How do you expand this into a research workflow?

Start with a small representative sample and record accepted products, missing required fields, latency and actual credits charged. Calculate cost per usable record for your own field requirements; maximum batch size alone does not establish throughput or economics.

Product detail does not replace a dedicated review collection. Use the [Amazon review analysis guide]({{ '/amazon-negative-review-analysis/' | relative_url }}) when the task requires review text and source IDs. Use the [Amazon price-history guide]({{ '/amazon-price-history/' | relative_url }}) when the question requires past observations rather than a current product record.

The example produces evidence for your application. It does not establish sales, full category coverage, permission to republish third-party content or access to a seller's private inventory and orders.

{% include api-guide-faq.html %}
