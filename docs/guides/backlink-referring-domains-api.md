---
learning_topic: agents
content_kind: guide
layout: default
title: "Backlink API: Referring Domains & New or Lost Links"
description: "Choose a backlink API by task: profile overview, referring domains, link records or new/lost history. Check sample limits and inspect the matching Playground."
permalink: /guides/backlink-referring-domains-api/
date_published: 2026-10-23
date_modified: 2026-10-26
last_modified_at: 2026-10-26
last_reviewed: 2026-10-26
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
faq:
  - question: "What is the difference between backlinks and referring domains?"
    answer: "Backlinks are individual links; referring domains are distinct source domains. Several links from one source domain can increase backlink count without adding the same number of referring domains."
  - question: "Does a lost backlink mean the publisher removed it on that date?"
    answer: "Not necessarily. New and lost records reflect the provider index's observations within the requested scope. Verify an important source page before treating an observation as an exact publication or removal event."
  - question: "Should a high spam score trigger automatic disavowal?"
    answer: "No. A proprietary score is a research signal, not a Google judgment. Inspect source evidence and context, and require a separately justified decision before taking action."
next_step:
  id: backlink_api_guide
  title: Inspect the backlink overview for your target
  description: "Choose a domain or page deliberately, check the current cost and source scope, and verify selected referring pages manually."
  label: Open backlink overview Playground
  url: https://www.nexscope.ai/api-docs/seo-backlink-overview?view=playground&co-from=learn
---

# Backlink API: referring domains, individual links and history

A **backlink API** can identify link sources worth inspecting. It does not measure the sales those links produced or reveal how Google values them. A useful study separates the number of links, the number of referring websites and the relevance of the actual pages linking to your content.

{% include api-guide-entry.html %}

> **Quick answer:** Nexscope's backlink APIs support link-profile research through overview, referring-domain, individual-link and new/lost views. Start with an exact domain or page, then inspect selected source evidence. Use the results for manual review, not automatic disavowal or exhaustive link counts. Index observations and proprietary scores are not Google's judgments about your site.

*Reviewed October 26, 2026 against public documentation and repository contracts. Documentation-based guide by Nexscope Team. No paid backlink request, link acquisition or ranking experiment was performed for this article.*

## Is this API workflow right for you?

| Assessment | Your task | Recommended approach |
| --- | --- | --- |
| Fit | Review the scope of a domain or page's link profile | Start with the same target definition for every comparison. |
| Fit | Inspect the websites behind referring-domain counts | Review relevance and selected source pages manually. |
| Fit | Investigate indexed new or lost link observations | Retain dates and verify important changes on the source. |
| Not a fit | Retrieve an exhaustive Google link inventory | Treat the provider index as a bounded source. |
| Not a fit | Automatically disavow links based on a spam score | Require independent review and a separately justified decision. |

## Backlinks or referring domains: what is the difference?

A backlink is a link from one page to another. A referring domain is a source website represented by one or more such links. Several links from one website do not become several independent referring domains.

For a hypothetical comparison, one partner site with many repeated footer links can produce a different profile from several relevant editorial websites linking once each. Counts alone cannot tell you which profile is more useful for readers, qualified visits or search performance.

Keep source scope consistent. A page-level target and an entire domain describe different link sets. Where the contract distinguishes target kind, preserve that value with every saved result.

## Which backlink API should you use first?

Use the endpoint that answers the next unanswered question. Nexscope's current documentation describes DataForSEO index projections with explicit limits and source boundaries.

| Research question | API | What to review |
| --- | --- | --- |
| What does the indexed profile look like? | [Backlink Overview](https://www.nexscope.ai/api-docs/seo-backlink-overview?view=api) | Target kind, counts, scope and missing values |
| Which websites link to the target? | [Referring Domains](https://www.nexscope.ai/api-docs/seo-referring-domains?view=api) | Source domains, available dates and returned limits |
| What are the underlying link records? | [Backlink Records](https://www.nexscope.ai/api-docs/seo-backlink-records?view=api) | Linking page, destination and documented attributes |
| What changed over a period? | [New/Lost Backlinks](https://www.nexscope.ai/api-docs/seo-backlink-new-lost?view=api) | Date range, bucket policy and source observations |

Do not assume pagination or complete web coverage. Check the actual result contract and limits; an endpoint with a bounded result does not become an exhaustive export because the reader wants a larger number.

## How do you request referring domains without changing the target scope?

The current [Referring Domains reference](https://www.nexscope.ai/api-docs/seo-referring-domains?view=playground&co-from=learn) accepts a target object, with `kind` set to `DOMAIN` or `PAGE`. Its `limit` defaults to 10 and allows at most 20. This **documentation-derived input example was not executed**:

```json
{
  "target": { "kind": "DOMAIN", "target": "nexscope.ai" },
  "limit": 10
}
```

Check the completed result's `returnedCount`, `providerTotalCount`, `truncated` and `missing` alongside its domain rows. The provider's reported total and the rows returned are different quantities. Even an untruncated response describes the provider index, not the entire web or Google's private link inventory.

For a page-level question, inspect the `PAGE` contract and use the precise page URL. Do not silently broaden the request to the whole domain merely to obtain more rows.

## What do individual backlink records add?

Use [Backlink Records](https://www.nexscope.ai/api-docs/seo-backlink-records?view=playground&co-from=learn) when you need the evidence behind a profile count. Its documented fields include source `fromUrl`, destination `toUrl`, `anchor`, `dofollow`, observation dates and missing reasons. The current request also uses a target object and a 1–20 item limit.

Retain the linking page and destination together, then inspect important links manually. A link attribute is not a promise of ranking value, referral traffic or a safe disavow decision. For an integration pilot, first confirm that the selected source pages answer the research question before expanding the study.

## How do you compare a competitor's link profile fairly?

Compare like-for-like targets and retain collection dates. A useful competitor is one whose content solves a similar problem, not simply a site with the largest link count.

Start with your own target and one relevant comparator. Look for source types that help explain the profile: editorial references, product directories, partner pages or repeated templates. Then inspect selected pages manually before calling a source an opportunity.

If the question concerns an article, compare relevant pages rather than comparing one page with a competitor's whole domain. Where the two targets cannot be matched, state the limitation instead of presenting the numbers as a clean ranking.

{% include article-action.html placement="article-middle" %}

## What does “new” or “lost” mean?

It is a dated observation within the provider's index and the endpoint's bucket policy. It is not necessarily the exact time a publisher added or removed a link, and it is not proof of the cause of a traffic change.

Retain the requested period and returned observation fields. A recently missing record might reflect crawling or coverage as well as a page change. Check the source page before treating it as a confirmed removal or contacting its publisher.

The [New/Lost Backlinks contract](https://www.nexscope.ai/api-docs/seo-backlink-new-lost?view=api&co-from=learn) uses a **string** `target` plus `dateFrom`, `dateTo` and optional `groupRange`; it does not reuse the target object above. Date buckets describe aggregate observations, not a list of every changed source URL. Review `bucketPolicy`, `zeroMeaning` and missing evidence before interpreting an empty bucket as zero change.

For a hypothetical alert, define which source pages are important, verify a changed link manually and record the outcome. Do not send an automatic accusation based on an index difference.

## Should a high spam score trigger automatic action?

No. A proprietary score is a screening signal, not a Google penalty notice or proof that a source is harmful. Review relevance, context and the actual page before deciding whether any response is justified.

Do not buy links or make disavow decisions solely to improve a dashboard score. Separate a research flag from an authorized operational action. This guide does not establish a safe threshold that applies to every site.

## What should a small pilot save?

Keep enough information to reproduce the scope and review the evidence:

1. Target kind and exact domain or page.
2. API, requested limits, date range and collection time.
3. Provider/source scope and returned missing-value indicators.
4. Selected referring domains and link records, without treating the sample as exhaustive.
5. Manual checks and the reason each source matters to the business question.
6. Current estimate and actual charged credits for every request.

If access or price is unconfirmed, clarify it before execution. Never convert a missing count into a measured zero or a proprietary rank into Google authority.

For content opportunities, read the [competitor keyword and traffic API guide]({{ '/guides/competitor-keyword-traffic-api/' | relative_url }}). For technical page issues, use the [ecommerce SEO audit]({{ '/ecommerce-seo-audit/' | relative_url }}). Link research, content relevance and technical accessibility answer different questions and should lead to distinct, evidence-backed decisions.

## Evidence checked and what remains untested

Documentation review date: **October 26, 2026**. This is a vendor-authored contract review, not an independent benchmark or customer testimonial.

The [Referring Domains contract](https://www.nexscope.ai/api-docs/seo-referring-domains?view=api) documents `limit` and the target object's `kind` and `target` fields. Response fields include `domain`, `backlinks`, `referringPages`, `firstSeenAt` and `lostAt`. These are index observations for the specified scope, not verified dates of a publisher's edit.

| Check | Documented evidence or review status | Limitation |
| --- | --- | --- |
| Input check | Record target.kind, target.target and limit | A whole-domain target and a single page are not interchangeable. |
| Response check | Distinguish domain, backlinks and referringPages | Several links from one domain are not several unique referring domains. |
| Unmeasured | No live backlink request or source-page audit executed | Index coverage, latency and actual request credits were not benchmarked. |

Check [current Nexscope pricing and access](https://www.nexscope.ai/pricing?co-from=learn) alongside the endpoint's current estimate. Plan the whole workflow, not just one request; no measured total is available from this article.

{% include api-guide-faq.html %}
