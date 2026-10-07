---
layout: default
title: Portable Blender Keyword & Competitor API Test
description: Inspect a dated Nexscope test connecting Google US keyword estimates to a bounded Amazon US competitor sample, with exact inputs and limitations.
permalink: /api-evidence/portable-blender-keyword-competitor/
last_reviewed: 2026-10-07
date_published: 2026-10-07
date_modified: 2026-10-07
last_modified_at: 2026-10-07
schema_type: Article
topic: research
---

# Portable blender keyword and competitor API test

**Observed result:** on October 7, 2026, a production request expanded `portable blender` into 10 Google US English keyword ideas. Six of the 10 were brand-led. A separate Amazon US request returned 10 first-page products across six brands, but one result was a shaker bottle rather than an electric blender. The run is useful for forming research questions; it does not validate demand or forecast a launch.

| Evidence field | Observed value |
| --- | --- |
| Environment | Nexscope production API |
| Test time | October 7, 2026, 03:58–03:59 UTC |
| Seed / locale | `portable blender` / United States / English |
| Keyword ideas | 10 returned; 6 brand-led |
| Keyword metric range | Estimated volume 2,900–22,200; difficulty 0–23 |
| Amazon request | US marketplace, page 1, 10 rows |
| Amazon sample | 10 products, 6 brands, price range $24.95–$69.95 |
| Sample-quality warning | Rank 1 was a shaker bottle, not an electric blender |
| Credit charge | Not captured; no amount is claimed |

## What did the keyword APIs return?

The expansion response was passed into the metrics endpoint without silently adding or removing terms. Volume, difficulty and competition are provider estimates for Google US English. They are **not Amazon search volume**.

| Returned keyword | Est. volume | Difficulty | Competition |
| --- | ---: | ---: | ---: |
| ninja blast portable blender | 22,200 | 4 | 0.96 |
| portable blender | 18,100 | 23 | 1.00 |
| ninja portable blender | 9,900 | 6 | 1.00 |
| portable ninja blender | 9,900 | 6 | 1.00 |
| ninja blender portable | 9,900 | 6 | 1.00 |
| aldi ambiano portable blender | 8,100 | 0 | 0.47 |
| portable cordless blender | 3,600 | 1 | 0.32 |
| cordless portable blender | 3,600 | 4 | 0.32 |
| ninja blast max portable blender | 3,600 | 0 | 0.98 |
| portable blender for smoothies | 2,900 | 5 | 1.00 |

The six brand-led ideas were five Ninja variants and one Aldi Ambiano term. This indicates that brand comparison deserves a place in the research plan; it does not show that a new brand can capture the estimated searches.

## What did the Amazon competitor lookup return?

| Rank | Brand | ASIN | Price | Est. monthly units | Rating / count |
| ---: | --- | --- | ---: | ---: | ---: |
| 1 | YETI | `B0FZMTKC6S` | $25.00 | 22,328 | 4.5 / 2,667 |
| 2 | Ninja | `B0DB8ZN253` | $69.95 | 8,542 | 4.2 / 3,157 |
| 3 | Ninja | `B0C2FF4JD1` | $49.99 | 6,782 | 4.2 / 14,082 |
| 4 | Ganiza | `B0DJM4QW9B` | $28.48 | 5,053 | 4.4 / 3,687 |
| 5 | Hamilton Beach | `B00KVZ27UA` | $24.95 | 3,766 | 4.2 / 40,871 |
| 6 | Ninja | `B0G2774F1S` | $39.95 | 1,639 | 4.5 / 33 |
| 7 | NexaEase | `B0CT2BY5KL` | $32.29 | 1,573 | 4.1 / 1,099 |
| 8 | Hamilton Beach | `B00QNUCV0I` | $26.45 | 1,542 | 4.3 / 50,829 |
| 9 | Ninja | `B0FDY1GZPT` | $39.95 | 1,465 | 5.0 / 1 |
| 10 | NutriBullet | `B0D8ZXZH5Z` | $58.79 | 937 | 4.0 / 1,149 |

Monthly units, revenue, BSR, rating and price are returned provider fields and were not independently verified. Ranks 6 and 9 were renewed products. Rank 1 was a YETI shaker bottle, which shows why a researcher must inspect product type instead of treating every returned row as an equivalent competitor.

## Evidence files and reproduction

- [Download the sanitized JSON record]({{ '/assets/evidence/portable-blender-keyword-competitor-2026-10-07.json' | relative_url }})
- [Open the SEO Keyword Planner](https://learn.nexscope.ai/tools/seo-keyword-planner/)
- [Read the complete market-research case]({{ '/portable-blender-market-research-case-study/' | relative_url }})

The run used `seo-keyword-expand/run`, `seo-keyword-metrics/run` and `amazon-competitor-lookup/run`. The public JSON contains the query, returned values and limitations, but excludes credentials and private account information.

## What this record cannot establish

- Google keyword estimates do not measure Amazon searches or purchases.
- One first-page API response does not define the full competitor set.
- Returned sales and revenue estimates are not seller-account records.
- A current price, rating or BSR can change after the observation time.
- The run did not measure ranking, conversion, profit, revenue uplift or launch performance.

Use the sample to choose products and claims for deeper verification, not as an automatic go/no-go decision.
