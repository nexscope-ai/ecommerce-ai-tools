---
layout: default
learning_topic: agents
related_topics: [visibility, research]
content_kind: guide
title: "Google Trends API: Official Access, Examples & Limits"
description: "Compare Google's Trends API alpha with Nexscope access. Inspect keyword and trending-topic requests, interpret interest scores and plan a repeatable data workflow."
permalink: /guides/google-trends-api/
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
  id: google_trends_api_evaluation
  intent: api_evaluation
  title: Inspect the Google Trends keyword request
  description: Choose a keyword, region and date window. Review the current access and credit cost, then inspect the returned series before using it in a report.
  label: Open the Google Trends API tester
  url: "https://www.nexscope.ai/api-docs/google-trends-by-keywords?view=api#online-test"
keywords: [google trends api, google trends api python, google trends data api, search interest api]
faq:
  - question: Does Google have an official Google Trends API?
    answer: "Yes. Google's page checked October 28, 2026 describes a limited-access API alpha and accepts applications. A third-party Trends endpoint uses its own access, billing and response contract; it is not the Google alpha."
  - question: Is a Google Trends score of 100 equal to 100 searches?
    answer: "No. The Nexscope keyword contract describes normalized interest on a 0–100 scale. Treat it as an index within its requested scope, not monthly search volume, revenue or units sold. Google's API alpha describes a different consistently scaled data offering."
  - question: Can I compare separately collected keyword scores directly?
    answer: "Only after verifying that the series share a comparable scale, region, time window and collection method. Independently normalized peaks can both equal 100 while representing very different search volumes."
---

# Google Trends API: access, examples and data limits

**Use a Google Trends API to investigate seasonality and build search-interest reports.** This guide compares Google's official alpha with Nexscope's keyword and trending-topic endpoints, shows a request example and explains how to keep relative interest separate from search volume.

{% include api-guide-entry.html %}

> **Quick answer:** Use a keyword-interest request when you already know the term to investigate. Use a trending-topic request to discover recent queries. Keep the provider, country, dates and scale beside each result. Use a separate keyword-metrics source when the question is monthly search volume.

*Documentation reviewed October 28, 2026 by Nexscope Team. No paid Trends request was executed for this article. Input examples are integration examples, not observed trend results.*

## Is there an official Google Trends API?

**Yes: Google's current [Trends API page](https://developers.google.com/search/apis/trends) describes an alpha that requires an application.** It lists a rolling five-year window, several aggregation intervals, regional data and consistently scaled data. The page does not establish open access for every developer.

Nexscope's endpoints are separate services with Nexscope authentication, credits and schemas. Do not use a Google alpha example as a drop-in Nexscope request or assume that access to one grants access to the other.

| Route | Appropriate starting point | Check before integration |
| --- | --- | --- |
| Google official alpha | You need the capabilities described by Google and can apply for access | Eligibility, current documentation and scale |
| Nexscope keyword interest | You have a term and want its documented time-series output | Accepted keyword format, region, date window and returned scale |
| Nexscope trending topics | You want recent query candidates for a region | Window, query fields and source definitions |
| Keyword-volume API | You need estimated monthly searches | Provider, database, period and missing metrics |

The distinction matters in a dashboard: labeling every column “Google Trends volume” would combine different measurements under one name.

## Which Nexscope Trends endpoint matches your task?

The [keyword endpoint](https://www.nexscope.ai/api-docs/google-trends-by-keywords?view=api) accepts `keyword`, `region`, `dayRangeStart` and `dayRangeEnd`. Its documented series includes `trendInfoForKeys`, keyword labels and dated `trendValues`.

The [time-based endpoint](https://www.nexscope.ai/api-docs/google-trends-by-time?view=api) accepts `region` and `days`. It describes recent query records rather than the same keyword-history series. Inspect the definitions of any returned volume or growth field before mixing it with another dataset.

For example, a team considering a seasonal product starts with the product term and a fixed historical window. A team scanning recent public interest starts with the time-based route, then checks whether the discovered queries have any relevant commercial intent. A breaking news query can be popular and still have no useful connection to the product.

## What does a keyword request look like?

The current keyword route is:

```text
POST https://api.nexscope.ai/googleTrend/getTrendByKeys
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

This is a **documentation-derived input example**:

```json
{
  "keyword": "portable blender",
  "region": "US",
  "dayRangeStart": "2025-10-01",
  "dayRangeEnd": "2026-09-30"
}
```

The request defines a past annual window; it does not imply that the example has been run or that a complete series will be returned. The current `keyword` field is a string. Start with one term and inspect the documented rules before assuming that a JSON array or a list of comma-separated terms is supported.

A Python application can submit that JSON with an HTTPS client and then retain the original response. Check HTTP errors, the outer business `code` and the presence of usable data separately. Do not construct a successful chart from an authentication error or a null payload. Keep the API key on your server or in your local environment rather than in browser source.

## How do you interpret the 0–100 interest scale?

**An interest index is not a search count.** Google's [Trends data FAQ](https://support.google.com/trends/answer/4365533?hl=en) explains that the website's results use sampled, normalized search data and that low-volume terms can appear as zero. Nexscope's keyword contract also describes a normalized 0–100 series. Google's alpha page describes consistently scaled data, so its behavior should not be inferred from the website index.

Consider a **synthetic example**: one independently collected series peaks at 100, and another also peaks at 100. That does not establish equal demand. Each peak may have been normalized within a different request.

| Observation | Supported interpretation | Unsupported interpretation |
| --- | --- | --- |
| A returned index rises within a comparable series | Relative interest increased within that scope | A known number of new customers appeared |
| A point is zero | Low or insufficient represented interest may be involved | Nobody searched for the product |
| A required point is missing | The series is incomplete for your application | The missing point equals zero |
| Two separate series peak at 100 | Each has a peak under its own scaling | Both have identical absolute search volume |

Retain returned values as supplied before converting types. If a field is a string, distinguish a valid numeric string from an empty or nonnumeric value. Do not quietly convert every parse failure to zero.

{% include article-action.html placement="article-middle" %}

## How can a developer build a useful seasonal report?

**Separate the observation from the business hypothesis.** A proposed report can follow this sequence:

1. Define one question, such as when a product-related term attracts interest in the target country.
2. Fix the keyword wording, region and historical window before comparing results.
3. Save the request, collection time and returned series, including gaps.
4. Inspect recurring patterns across comparable periods rather than selecting only the largest spike.
5. Check keyword-volume estimates separately and inspect which search pages serve the query.
6. Add marketplace evidence before making an assortment or inventory decision.

Use the [keyword research API workflow]({{ '/ecommerce-trends/seo-keyword-api-content-plan/' | relative_url }}) for demand estimates and the [Google SERP API guide]({{ '/guides/google-serp-api/' | relative_url }}) to inspect query intent. These are different questions, so keep the original field names and source labels in your report.

## What should you validate before scheduling repeat calls?

Use a small acceptance checklist before adding a scheduler:

| Check | Acceptance question |
| --- | --- |
| Identity | Does the returned keyword match the requested term? |
| Scope | Are region and dates preserved with the observation? |
| Completeness | Are missing dates and unusable values visible? |
| Comparability | Did the scaling or collection method change? |
| Cost | Is the current route's credit use acceptable at the planned frequency? |
| Decision | Is the report proposing a test rather than claiming future sales? |

Store the last usable observation alongside a failed refresh. A failed request should make the report stale, not make demand disappear. Repeated execution, storage and alerts are application responsibilities; one API response does not configure a monitoring service.

{% include api-guide-faq.html %}
