---
layout: default
learning_topic: visibility
content_kind: guide
compact_evidence: true
evidence_scope: "Publisher controls and rollout dates reviewed against platform documentation on November 10, 2026."
title: "AI Training and Grounding Controls for Website Publishers"
description: "Choose how OpenAI, Google and Bing can use your content. Compare robots.txt, Google-Extended and Microsoft's new page-level grounding settings."
permalink: /guides/ai-training-grounding-publisher-controls/
date_published: 2026-11-10
date_modified: 2026-11-10
last_modified_at: 2026-11-10
last_reviewed: 2026-11-10
author: Nexscope Team
schema_type: Article
og_type: article
topic: research
---

# How to control AI training and grounding on your website

Start with two separate decisions. Decide whether an AI provider may use your pages to train future models, and whether it may retrieve your pages to inform a generated answer. The second use is called **grounding**. OpenAI and Microsoft offer separate controls for these uses, while Google's `Google-Extended` covers both training and grounding in Gemini Apps. [OpenAI crawler controls](https://developers.openai.com/api/docs/bots) · [Google crawler controls](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended) · [Microsoft publisher controls](https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/)

## Which setting controls which experience?

| Where you want your page to appear | What to check | Training preference |
| --- | --- | --- |
| ChatGPT Search | Allow `OAI-SearchBot` in `robots.txt` and check that the CDN accepts requests from OpenAI's published IP ranges. | Set a separate preference for `GPTBot`. |
| Google AI Overviews and AI Mode | Check Googlebot access, indexing, snippet eligibility and the Search generative AI setting in Search Console. | Review `Google-Extended` separately from Google Search eligibility. |
| Gemini Apps | Review `Google-Extended`, which covers grounding in Gemini Apps as well as Gemini model training. | If you plan to opt out through the shared signal, review Google's announced fallback and any explicit `Google-Extended` group. |
| Bing and Microsoft Copilot | Check Bingbot access and Microsoft's new page-level `AI Grounding` preference. The announced default is `Allow`. | Microsoft's new `AI Training` preference can be set in `robots.txt` or overridden on a page. |

[Google Search AI eligibility](https://developers.google.com/search/docs/appearance/ai-features) · [Google Search Console controls](https://support.google.com/webmasters/answer/16908024) · [Google's shared training signal announcement](https://developers.google.com/search/blog/2026/10/ai-training-control) · [Bing implementation FAQ](https://www.bing.com/webmasters/help/new-ai-preferences-2t1cc16d)

## What changes under the shared robots.txt proposal?

The October 30, 2026 Internet-Draft proposes `__usage_ai-training` as a common policy token. For example, a publisher could add a group with `User-agent: __usage_ai-training` and `Disallow: /` to express a training opt-out. Treat the signal as a usage preference and keep ordinary crawl rules in their own groups. OpenAI announced future support and said its existing controls will continue to apply. Google aims to support it in 2027 and plans to treat a shared opt-out as a `Google-Extended` opt-out when the site has no explicit `Google-Extended` rule. That fallback matters if Gemini App visibility is one of your goals. [Internet-Draft](https://datatracker.ietf.org/doc/html/draft-kelley-aipref-training-preference-signal) · [OpenAI announcement](https://openai.com/index/helping-websites-express-ai-training-preferences/) · [Google announcement](https://developers.google.com/search/blog/2026/10/ai-training-control)

## How would a publisher keep Copilot eligibility and decline Microsoft training?

Microsoft gives an example in its announcement. Use `Disallow` for AI Training and keep AI Grounding at its default `Allow`. A page-specific training opt-out can use `<meta name="Bingbot" content="ai-training:disallow">`. If your goal is to permit grounding only in Microsoft-operated experiences, its separate `DisallowExtended` option restricts use by the grounding services Microsoft provides to third parties.

Microsoft plans to begin applying the new settings as it recrawls pages from **February 1, 2027**. Sites relying on `NoArchive` or `NoCache` should review the legacy migration. Microsoft says eligible sites can record a temporary grounding preference from December 15, 2026, and should complete the relevant migration steps before March 1, 2027 to preserve their chosen restrictions. [Microsoft announcement and migration schedule](https://blogs.bing.com/search/2026/10/your-content-your-choice-clearer-preferences-for-training-and-grounding/)

## How do you verify that your settings match your policy?

1. Pick one public article and one page whose usage should be restricted. Write down your expected crawl, indexing, training and grounding treatment for each platform.
2. Inspect the live `robots.txt`, the page's HTML meta tags and its HTTP response headers. Include the CDN in the check. Page-level settings can only be processed after the relevant crawler can see them.
3. For Google Search, verify the property setting and inspect the URL in Search Console. For ChatGPT Search, match crawler requests in your logs against OpenAI's published IP ranges.
4. Keep a separate record of answer citations and visits. Search eligibility, a visible citation and a recorded visit are separate observations.

In our November 10 check, a Shopify Canvas guide had previously received Gemini visits, while a fresh Gemini answer to one Canvas question cited Codilar and GemPages. A successful answer test or a missed citation does not verify a site's training settings. Use the public directives to verify policy and answer samples to study which sources a platform shows. [Read the Shopify and TikTok citation check]({{ '/guides/google-ai-search-ecommerce-content/' | relative_url }})
