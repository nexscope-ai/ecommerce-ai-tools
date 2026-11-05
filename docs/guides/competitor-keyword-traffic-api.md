---
learning_topic: agents
content_kind: guide
layout: default
title: "Keyword Ranking API: Python Export to CSV"
description: "Call a keyword ranking API with Python, export competitor keywords and ranking URLs to CSV, and validate US English scope, partial coverage and missing positions."
permalink: /guides/competitor-keyword-traffic-api/
date_published: 2026-10-23
date_modified: 2026-11-04
last_modified_at: 2026-11-04
last_reviewed: 2026-11-04
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
faq:
  - question: "Does a competitor keyword API show every keyword a site ranks for?"
    answer: "No completeness claim is warranted here. The documented result is bounded by the requested limit and database scope. An absent keyword is not proof that a site never ranks for it."
  - question: "Are competitor traffic estimates the same as measured visits?"
    answer: "No. Label estimates with their provider and scope. They are not the competitor's first-party analytics and do not establish sessions, conversion rate or revenue."
  - question: "Should every competitor keyword become a new article?"
    answer: "No. Group terms by reader task and check existing pages first. Update an existing guide when it already serves the intent; create a new page only when you can add a distinct, useful answer."
next_step:
  id: competitor_keyword_api
  title: Inspect the keywords a competitor ranks for
  description: "Inspect the US English scope, result limit and current cost, then investigate relevant ranking pages."
  label: Open ranked-keyword Playground
  url: https://www.nexscope.ai/api-docs/seo-domain-ranked-keywords?view=playground&co-from=learn
---

# Keyword ranking API: Python tutorial and CSV export

A **keyword ranking API** can help answer which organic terms a competitor domain ranks for and which URLs appear with them. Nexscope's Domain Organic Ranked Keywords interface serves this domain-first research task. It is different from checking one query's search results or operating a scheduled rank tracker.

{% include api-guide-entry.html %}

> **Quick answer:** Nexscope's keyword ranking API returns a bounded organic-keyword sample for a domain in US English, including available positions and ranking URLs. Use it for competitor research, not as a complete rank tracker. Choose a SERP request for one query's results; a recurring monitoring workflow also needs scheduling, storage and comparison logic.

*Reviewed November 4, 2026 against public documentation and repository contracts. Documentation-based guide by Nexscope Team. No paid SEO request or competitor benchmark was run, and no traffic gain is claimed.*

## Is this API workflow right for you?

| Assessment | Your task | Recommended approach |
| --- | --- | --- |
| Fit | Find relevant ranking terms for a known competitor | Match target, market and language before comparing. |
| Fit | Check keyword overlap before planning content | Inspect the intersection mode and existing pages. |
| Fit | Prioritize briefs with a useful product next step | Review relevance and original evidence, not volume alone. |
| Not a fit | Measure a competitor's actual sessions or revenue | Only authorized first-party analytics can establish those account metrics. |
| Not a fit | Guarantee traffic or justify copied content | Test original content and measure your own outcomes. |

## Keyword ranking API or keyword tracking API: which task do you need?

Start with the input you already have. A domain-first database lookup, a query-first SERP observation and a recurring tracking service answer different questions. Nexscope documents the first two request types; neither request alone is a configured tracking project with scheduled alerts.

| Your starting point | Appropriate request or workflow | Important boundary |
| --- | --- | --- |
| A competitor domain | Domain Organic Ranked Keywords | US English; default 10, maximum 20 returned items; no pagination |
| One search phrase | [SEO SERP](https://www.nexscope.ai/api-docs/seo-serp?view=playground&co-from=learn) | Current contract: US, English, desktop; up to 10 results |
| A topic with no keyword shortlist | [Keyword Expansion](https://www.nexscope.ai/api-docs/seo-keyword-expand?view=api&co-from=learn) | Candidate discovery, not evidence that your domain ranks |
| A supplied list needing demand metrics | [Keyword research and metrics guide]({{ '/ecommerce-trends/seo-keyword-api-content-plan/' | relative_url }}) | Volume and difficulty do not identify your current position |
| Daily checks and change alerts | A separately designed monitoring workflow | Needs authorized execution, a schedule, stored observations and alert rules; not established by the lookup contract |

If you searched for a **keyword tracking API**, first specify the query list, target, locale, device, frequency, observation depth and retention you need. Do not relabel a domain database sample as a live position check for every supplied keyword. A target missing from the returned sample has an unknown position, not a measured last-place ranking.

## What can each competitor research API tell you?

Different endpoints describe different parts of the search picture. Use them to answer a specific question, not to assemble a large table whose columns have incompatible meanings.

| Question | API | What not to infer |
| --- | --- | --- |
| Which terms does a domain rank for? | [Domain Ranked Keywords](https://www.nexscope.ai/api-docs/seo-domain-ranked-keywords?view=api) | Not a complete log of every query or visitor |
| Which pages have ranking evidence? | [Top Organic Pages](https://www.nexscope.ai/api-docs/seo-top-pages?view=api) | Not verified first-party sessions |
| Which terms overlap between targets? | [Domain Keyword Intersection](https://www.nexscope.ai/api-docs/seo-domain-keyword-intersection?view=api) | An overlap alone does not identify a useful content gap |
| How do estimated targets compare? | [Target Traffic Estimates](https://www.nexscope.ai/api-docs/seo-target-traffic-estimates?view=api) | Estimated traffic is not measured visits or revenue |
| How does a comparison change over time? | [Domain Traffic History](https://www.nexscope.ai/api-docs/seo-domain-traffic-history?view=api) | A modelled change does not establish its cause |

Read the current contracts for supported target forms, market, language and limits. The ranked-keyword and intersection interfaces document bounded database results; do not invent pagination or describe a fixed-size sample as exhaustive.

For Amazon listing terms, use the separate [Amazon competitor keyword workflow]({{ '/amazon-competitor-keyword-research/' | relative_url }}). Google organic positions are not Amazon organic or advertising ranks.

## What does a domain ranking request actually contain?

The [current ranked-keyword reference](https://www.nexscope.ai/api-docs/seo-domain-ranked-keywords?view=api&co-from=learn) requires `target`; its current market and language are fixed to `US` and `en`. The following is a **documentation-derived input example, not an executed request or measured result**:

```json
{
  "target": "nexscope.ai",
  "market": "US",
  "language": "en",
  "limit": 10
}
```

After a permitted call completes, inspect `data.status`, coverage and `data.result` before using its items. Keep `keyword`, `url`, `rankAbsolute`, `rankGroup` and missing reasons with the requested scope. Do not substitute search volume for rank, or collapse differently defined rank fields into one unlabeled position.

For a proposed repeat check, save the original observation and compare only matching scopes. A collection timestamp is not proof the provider refreshed every database row at that moment. A non-completed or partial call must not become a fabricated ranking history.

## How to call the keyword ranking API with Python

**Start with one domain and export its returned keyword sample before building a larger pipeline.** Download the [Python 3.10+ starter]({{ '/assets/downloads/etsy-ranking-export.py' | relative_url }}) and [domain ranking request]({{ '/assets/downloads/domain-ranking-request.json' | relative_url }}). Save them together; the script uses only Python's standard library.

The template targets `nexscope.ai`, requests 10 items and fixes the scope to US English. Replace the domain with the competitor you intend to research. This starter accepts bare domains only; it deliberately excludes schemes, paths and ports. Keep the request file alongside the saved response so its scope can be checked later.

Set `NEXSCOPE_API_KEY` in your local environment. Inspect the [current ranking reference and charge estimate](https://www.nexscope.ai/api-docs/seo-domain-ranked-keywords?view=api#online-test) first. The command makes one POST to `https://api.nexscope.ai/seo/domainRankedKeywords`:

```shell
python etsy-ranking-export.py rankings domain-ranking-request.json --output ranking-run-001
```

There are no automatic retries, recurring jobs or pagination. The script writes the original `response.json` before transforming it and records the request, observation time and result metadata in `manifest.json`. Use a new output directory for every invocation.

If the response is `PROCESSING`, the script exits with code 2 and creates no CSV. Inspect its `callId` and retrieve that same request through the documented owner-result lookup, rather than sending the POST again. Replace the UUID placeholder below with the returned ID:

```shell
python etsy-ranking-export.py rankings domain-ranking-request.json --call-id RETURNED_CALL_UUID --output ranking-result-001
```

This command makes one authenticated GET to the same endpoint's `/calls/{callId}` route and verifies the returned call ID. It does not poll. A timeout or failed request also requires inspecting saved evidence and usage before deciding whether to run again.

## How should you validate the ranking CSV?

**Match the domain and search scope before comparing positions.** The starter accepts completed `SUCCESS`, `PARTIAL` and `EMPTY` states, checks the returned target, market, language, requested limit and item count, and rejects malformed positions. It keeps partial coverage and missing reasons in the manifest. An unexpected response shape stops for inspection.

| CSV field | Meaning | Review rule |
| --- | --- | --- |
| `keyword` and `url` | A returned term and its ranking page | Review together; a keyword alone does not reveal page intent |
| `rankAbsolute`, `rankGroup` | Separate provider-defined position measures | Keep separate labels; missing positions stay blank |
| `url_scope_check` | Local check of the returned URL's host | Exact target or a subdomain matches; another host is flagged for review |
| `searchVolume`, `cpcUsd` | Available demand and advertising estimates | They do not measure your site's clicks or revenue |
| `missing`, `missing_fields` | Provider reasons and locally absent values | Do not turn unknown values into zero |
| `content_action`, `evidence_note` | Empty columns for your decisions | Choose update, new brief, exclude or further investigation |

A URL on `competitor.example.evil.example` does not match `competitor.example`; the check uses a hostname boundary, not a substring. Missing URLs remain unknown. Duplicate keyword-and-URL rows stop the export for inspection instead of inflating counts. The script retains flagged rows so you can investigate provider scope.

Reprocess a saved response without another API request:

```shell
python etsy-ranking-export.py rankings domain-ranking-request.json --from-response ranking-result-001/response.json --output ranking-offline-001
```

The code has been checked with constructed offline fixtures, including partial results, mismatched scope, missing positions and processing states. No paid domain request or production accuracy benchmark was run for this tutorial. A successful export proves that a response met the starter's checks, not that the database contains every ranking keyword.

## How do you choose the right competitors?

Choose sites or pages that address the same buyer task. A large marketplace, a tool provider and a news publisher may rank for the same phrase for different reasons. Their content is not necessarily interchangeable.

For a hypothetical ecommerce API provider, an article about choosing a product-data integration may be more relevant than a highly visited consumer shopping page. Record why each domain is in the study and whether you are comparing whole domains or specific pages.

Use a consistent country/market and language. Keep branded navigational searches separate from generic problem searches, since their audiences and realistic click opportunities differ.

## How do you turn ranking terms into candidate topics?

Inspect the term, ranking page and likely search task together. A keyword string without its page context can hide whether the result is a tutorial, comparison, definition or product page.

1. Retrieve a bounded keyword result for a selected target.
2. Keep the market, language, collection date, result limit and available source dates.
3. Inspect the relevant top pages and remove unrelated or misleading matches.
4. Use the intersection contract's documented mode when comparing your target and a competitor. Verify that the mode answers overlap or difference as intended.
5. Check your own existing content before proposing a new URL.
6. Write one candidate brief with the buyer question, original contribution and appropriate product entry point.

A hypothetical brief might target developers comparing listing-data sources and contribute a contract checklist. It should not promise a competitor's traffic volume or copy their examples, text and unsupported performance claims.

{% include article-action.html placement="article-middle" %}

## How should you interpret traffic estimates?

Label them as estimates and retain the provider and database scope. They are not your competitor's analytics account, nor proof of sales or conversion rate. Comparing organic estimates with paid estimates also requires an explicit label rather than one undifferentiated “traffic” column.

A missing value must remain unknown. An absent keyword in a limited response might reflect the limit, database coverage or requested scope. Do not replace it with zero or label it a proven opportunity without inspecting the underlying search results.

Validate your own outcomes with the measurements you control. After a content change, compare Search Console impressions and clicks with qualified product visits and the chosen downstream action. Ranking alone does not establish that the article brings relevant users to the main site.

## How do you avoid duplicate pages and weak content?

Group terms by the question a reader needs answered. Two word-order variants often belong on the same page. A true difference in task—such as evaluating a provider versus implementing an endpoint—may justify separate pages with a clear relationship.

For each brief, name the information you can add: a verified current contract, a dated permitted result, a reproducible checklist or a clearly explained limitation. If you have no useful addition, update an existing page rather than launching a thin competitor-keyword article.

## What is the next step after research?

Review the current cost and access conditions before running any paid request. Start with one competitor and a bounded question, retain source evidence and inspect missing fields. If an estimate or execution condition is unavailable, clarify it before calling.

For keyword planning on your own site, use the [SEO keyword planner guide]({{ '/seo-keyword-planner/' | relative_url }}). For link-source research, continue to the [backlink API guide]({{ '/guides/backlink-referring-domains-api/' | relative_url }}). Keep content relevance and link evidence separate rather than treating either as a shortcut to rankings.

## Evidence checked and what remains untested

Documentation review date: **November 4, 2026**. This is a vendor-authored contract review, not an independent benchmark or customer testimonial.

The [Domain Ranked Keywords contract](https://www.nexscope.ai/api-docs/seo-domain-ranked-keywords?view=api) documents `target`, `market`, `language` and `limit`. Returned fields include `keyword`, `rankAbsolute`, `searchVolume` and `url`. Pair the keyword with its ranking URL and requested scope; the result limit is not a complete record of all searches.

| Check | Documented evidence or review status | Limitation |
| --- | --- | --- |
| Input check | Record target, market, language and limit | A market or language mismatch can invalidate the comparison. |
| Response check | Review keyword, rankAbsolute, searchVolume and ranking url together | Volume is a research metric, not your site's measured clicks. |
| Unmeasured | No live competitor request or before/after experiment executed | No ranking uplift, traffic accuracy or conversion result is claimed. |

Check [current Nexscope pricing and access](https://www.nexscope.ai/pricing?co-from=learn) alongside the endpoint's current estimate. Plan the whole workflow, not just one request; no measured total is available from this article.

{% include api-guide-faq.html %}

## Need Amazon marketplace keyword evidence instead?

Domain keyword rankings describe web search, not Amazon search placement. For marketplace research, follow the [Amazon competitor keyword workflow]({{ "/amazon-competitor-keyword-research/" | relative_url }}) and the [reverse-ASIN keyword gap tool](https://learn.nexscope.ai/tools/reverse-asin-keyword-gap/). Browse [Data API categories](https://learn.nexscope.ai/data/) to select the appropriate marketplace and check its current contract before building an export.
