---
layout: default
learning_topic: visibility
content_kind: guide
compact_evidence: true
evidence_scope: "One temporary ChatGPT conversation and a separate 30-day Ahrefs entry-page report."
title: "How to Diagnose a Drop in ChatGPT Search Referrals"
description: "Use a real Temu API guide citation to separate ChatGPT Search recommendations, exact source links and measured referral visits."
permalink: /guides/chatgpt-search-referral-diagnosis/
date_published: 2026-11-10
date_modified: 2026-11-10
last_modified_at: 2026-11-10
last_reviewed: 2026-11-10
author: Nexscope Team
schema_type: Article
og_type: article
topic: research
---

# How to diagnose a drop in ChatGPT Search referrals

Start with three separate observations: whether ChatGPT recommends your brand, which page the answer cites, and which landing page receives measurable traffic. A single answer can recommend a provider, show a direct link to its API docs, and cite a separate tutorial. Each observation helps locate a different part of the visitor journey.

## What did we observe on the Temu Product Research API guide?

In Learn's October 12 to November 10, 2026 Ahrefs Web Analytics entry-page report, the Temu guide had **three ChatGPT-referred visitors**, the highest among the Learn articles in that report. The guide had 14 entry visitors across all channels. We excluded home, tool, product and other non-article pages from the article ranking. [Temu Product Research API guide]({{ '/guides/temu-product-research-api/' | relative_url }})

On November 10, we asked in a fresh temporary ChatGPT conversation: `Search the web and cite your sources. What APIs can I use to research public Temu products, shops, and keywords?` The prompt contained no Nexscope name or URL. Here is what we found in the returned answer and its expanded citation cards.

| Check | Observed in this answer |
| --- | --- |
| Brand recommendation | ChatGPT named Nexscope as a research option alongside JINGHAI DATA and discussed Temu's official partner platform separately. |
| Exact guide citation | Two expanded source groups listed the Learn article titled *Temu Product Research API: Products, Shops & Keywords*. |
| Other destinations | The answer also displayed a direct link to Nexscope's Temu API docs with `utm_source=chatgpt.com`. Source cards included other documentation. |
| Product boundary | The answer distinguished public product, shop and keyword research from authorized merchant operations. |

The November 10 answer is a single observation. The three visits came from a separate 30-day analytics window, and the report does not identify which answers drove them. We did not use the answer's links to create a test visit. [OpenAI's ChatGPT Search and sources documentation](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)

## How should you investigate a traffic change?

1. **Check entry pages by source.** Compare equal date windows using the same analytics property and source filter. In GA4, use the Landing page report and add Session source / medium. Inspect recognized ChatGPT source values in your own data. Group tracking variants by canonical page and keep the raw landing URLs available for troubleshooting.
2. **Retest a small set of buyer questions.** Use new conversations and record the exact prompt, date, locale, whether search ran, the brand mentioned and the exact URLs you can see in the response and its citation cards. Repeat a fixed set across multiple dates to reduce the influence of a single answer.
3. **Check the destination.** If the citation points to an API reference, product page or old route, look for traffic there as well. Check that redirects resolve to a working page and preserve useful campaign parameters. Verify the analytics tag and consent behavior using your normal debugging workflow.
4. **Check crawler access where relevant.** If the target stops appearing across repeated checks, inspect `robots.txt`, CDN responses and verified `OAI-SearchBot` requests. Compare its source IPs to the published ranges. OpenAI documents how the bot is used and recommends allowing its published ranges. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)

| Pattern you see | First thing to check |
| --- | --- |
| Your brand still appears, but the target guide appears less often in your answer samples. | Compare the competing destination pages and identify which claim or task each supports. |
| The same guide still appears in your samples, but recorded visits are down. | Check attribution and redirects, then consider click behavior as a hypothesis. The samples do not give you the total number of citation impressions. |
| The target guide stays flat while the docs gain referrals. | Inspect whether the answers now send readers directly to the API reference for implementation questions. |

Use the [GA4 landing page report documentation](https://support.google.com/analytics/answer/12931766) to build the source and landing-page comparison. Continue with the [GA4 AI referral tracking guide]({{ '/ai-referral-traffic-ga4/' | relative_url }}) for measurement setup and the [publisher controls guide]({{ '/guides/ai-training-grounding-publisher-controls/' | relative_url }}) for crawl and usage checks.
