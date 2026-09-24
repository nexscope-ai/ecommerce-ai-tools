---
layout: default
title: Amazon Product Price Series API Evidence | Four Returned Records
description: Inspect a real Nexscope Amazon price-series response with four dated price observations, an empty deal array and explicit coverage limitations.
permalink: /api-evidence/amazon-price-series/
last_reviewed: 2026-09-23
date_published: 2026-09-23
date_modified: 2026-09-23
schema_type: Article
topic: research
image: /assets/images/prime-big-deal-days-2026-price-series-evidence.svg
image_alt: Four observed Amazon US price records returned by a Nexscope API test, plotted on a USD axis
---

# Amazon Product Price Series API: four returned observations

**Observed result:** on September 21, 2026, the online tester requested 30 days of lowest-new, list, deal and Prime price data for Amazon US ASIN `B072MQ5BRX`. The response returned `code: 0` and four lowest-new-price records: **$16.62 on August 18, $9.69 on August 31, $16.62 on September 1, and $16.32 on September 3, 2026**.

{% include article-visual.html %}

| Evidence field | Observed value |
| --- | --- |
| Test date | September 21, 2026 |
| Marketplace / ASIN | Amazon US / `B072MQ5BRX` |
| Requested window | 30 days |
| Lowest-new records | Four dated observations |
| Deal-price array | Empty |
| Prime-price record | One value of `-1`, not treated as a valid price |
| Most recent returned price date | September 3, 2026 |

Some returned records fell outside the requested window. The response therefore cannot establish continuous daily coverage, a current price, the cause or duration of the August 31 low, or a verified promotion.

## What the result can support

The result supports a follow-up question about a dated price change and a more complete baseline. It does not establish sales volume, profitability or causation.

- [Inspect the sanitized JSON evidence]({{ '/assets/evidence/prime-big-deal-days-2026-price-series.json' | relative_url }})
- [Read the event research workflow]({{ '/ecommerce-trends/prime-big-deal-days-2026-seller-research/' | relative_url }})
- [Open the Amazon Product Price Series API documentation](https://www.nexscope.ai/api-docs/amazon-product-price-series?view=api&co-from=learn)

The public JSON excludes API credentials and private account data.
