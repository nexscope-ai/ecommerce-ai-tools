---
learning_topic: research
content_kind: guide
layout: default
title: "Amazon Competitor Keywords: Compare ASINs and Export CSV"
description: "Find Amazon competitor keywords, export reverse-ASIN evidence with Python, and compare relevant terms without mixing ad ranks, organic ranks or volume estimates."
permalink: /amazon-competitor-keyword-research/
redirect_from:
  - /ecommerce-ai-tools/amazon-competitor-keyword-research/
date_published: 2026-09-15
date_modified: 2026-11-05
last_modified_at: 2026-11-05
last_reviewed: 2026-11-05
author: Nexscope Team
schema_type: Article
suppress_article_help: true
topic: research
keywords:
  - Amazon competitor keywords
  - find Amazon competitor keywords
  - Amazon competitor keyword research
  - Amazon competitor keyword tool
  - reverse ASIN keyword research
  - competitor keyword research for Amazon
  - find competitor keywords Amazon
  - find Amazon competitor keywords
  - Amazon keyword competitor research
  - Amazon product ranking tool
  - Amazon keyword API
faq:
  - question: "How do you find Amazon competitor keywords?"
    answer: "Choose comparable ASINs in the same marketplace, collect dated reverse-ASIN or keyword evidence, separate branded and generic terms, and validate the shortlist against your own listing and eligible first-party Amazon reports."
  - question: "Can Amazon competitor keywords prove demand?"
    answer: "No. A competitor keyword is a research candidate, not proof of search volume, conversion, or relevance to your product. Keep the marketplace, date, provider, metric definition, and product-match decision with every term."
  - question: "What does an Amazon product ranking tool actually measure?"
    answer: "It reports a rank or placement signal for a specified marketplace, query, product, date, and result type. It does not by itself prove demand, conversion, organic placement, or product quality; keep sponsored, organic, category, and query context separate."
next_step:
  id: amazon_asin_keywords
  intent: api-evaluation
  title: Start with one competitor ASIN
  description: Have one comparable ASIN and marketplace ready. Check the required inputs, returned keyword fields, credit estimate and access requirements before a pilot request.
  label: Evaluate the ASIN keyword request
  url: "https://www.nexscope.ai/api-docs/amazon-asin-keywords?view=api&co-from=learn"
image: /assets/images/ecommerce-competitor-keyword-research-1440w.webp
image_small: /assets/images/ecommerce-competitor-keyword-research-720w.webp
image_alt: A magnifying glass revealing keyword clusters and gaps across competing ecommerce products
image_caption: "Illustration: select comparable ASINs, inspect associated terms, and validate each apparent gap."
---

# Amazon competitor keywords: compare ASINs and export CSV

**To find Amazon competitor keywords, first select products that solve the same buyer problem in the same marketplace.** This Amazon competitor keyword workflow records comparable ASINs, inspects reverse-ASIN evidence, and compares relevant terms with your listing and first-party search reports. A term associated with a rival is a *candidate*, not proof that the rival converted or that your product should target it.

**Quick answer:** Keep the query, marketplace, date, ASIN, source, and metric label together. Exclude products with a different function or variant. Prioritize terms that accurately describe your product and recur across comparable products; validate the shortlist with Amazon Brand Analytics or advertising search-term data when you have access. Do not relabel Google search volume as Amazon demand.

{% include article-action.html placement="article-top" %}

{% include article-visual.html %}

## Which products count as Amazon competitors?

**Comparable ASINs share the customer's intended job, not just a word in the title.** Start with a buyer-relevant seed query in the target Amazon marketplace. Inspect product type, use case, capacity, variant, price band, and whether a result is sponsored, refurbished, or a bundle. Keep three to five closely matched products as a workable first sample; the number is a research choice, not an Amazon rule.

Our [October 7, 2026 portable-blender API test]({{ '/api-evidence/portable-blender-keyword-competitor/' | relative_url }}) shows why this matters. A separate Amazon US lookup for `portable blender` returned 10 first-page products, but the first row was a non-electric shaker bottle. Including it in an electric-blender keyword set would mix different purchase intents. The response was one bounded sample, not a census of the category.

| Candidate result | Decision for an electric-blender study | Reason |
| --- | --- | --- |
| Portable electric blender, matching use case and capacity | Compare | Serves the same buyer problem |
| Non-electric shaker bottle | Exclude | Shares a phrase but not the product function |
| Renewed unit or multi-item bundle | Separate | Offer type can change intent and price comparison |

If you need to discover products programmatically, the [Amazon Search API reference](https://www.nexscope.ai/api-docs/amazon-search?view=api&co-from=learn) is a starting point. Check its live parameters and access requirements before relying on a field. A search result alone does not establish that a product ranks organically for every term you later investigate.

## How do you find competitor keywords on Amazon?

1. **Define the market and product.** Write down country, language, product function, meaningful variants, and a seed phrase a buyer would use.
2. **Collect comparable ASINs.** Inspect actual Amazon results and remove mismatched products before running any keyword comparison.
3. **Inspect reverse-ASIN evidence.** Use an available ASIN-keyword data source to collect associated terms, retaining its date, marketplace, and field definitions. The [reverse-ASIN research guide]({{ '/reverse-asin-keyword-research/' | relative_url }}) covers the method in more detail.
4. **Separate branded and generic terms.** Rival brand names may explain demand but are not automatically appropriate for your listing or ads.
5. **Compare against your product.** Mark each term as already covered, a plausible gap, or irrelevant. Verify that your product genuinely has the attribute or use case the term implies.
6. **Validate and test.** Where eligible, use your own Brand Analytics Search Query Performance or advertising search-term reports to check shopper behavior. Change one listing element or test a small ad group, then track the result over a suitable period.

This is the practical meaning of **find Amazon competitor keywords**: find comparable products first, then keep each candidate tied to its ASIN, marketplace, retrieval date, provider, and metric. If the next decision also needs product attributes, offers, or history, compare the [Amazon search volume and product research API guide]({{ '/best-amazon-product-research-api/' | relative_url }}) rather than assuming a keyword export answers both questions.

Amazon says [Brand Analytics](https://sell.amazon.com/tools/amazon-brand-analytics) includes Search Query Performance and Top Search Terms for eligible brand representatives. Amazon's [Sponsored Products search-term report](https://advertising.amazon.com/help/G3HEFZYWZF84NPS9) contains terms with at least one ad click, so it is useful for campaign learning but is not a complete list of all searches. Access and reporting scope depend on account eligibility and campaigns.

## Which Nexscope API finds Amazon competitor keywords?

Use [Amazon ASIN Keywords](https://www.nexscope.ai/api-docs/amazon-asin-keywords?view=api&co-from=learn) for an ASIN-first reverse lookup. Its current REST contract requires one `asin`; `country` selects the marketplace, and period, sorting and pagination inputs refine the result. This is a different dataset from the [Google keyword ranking API]({{ '/guides/competitor-keyword-traffic-api/' | relative_url }}).

| Question before a lookup | Current input or check | Why it matters |
| --- | --- | --- |
| Which comparable product? | One `asin` per request | A multi-product comparison requires separately scoped lookups |
| Which marketplace? | `country`, default US | Do not mix different marketplaces in one apparent gap |
| Which observation period? | `timePieceType` and `timePieceValue` | Current recent-day values are 7 or 30; month and week use their documented date formats |
| How much of the result is returned? | `pageNum` and `pageSize`; documented page size 10–100 | A first page is not a complete reverse-ASIN export |

Optional fields include `keyword`, `conditions` and `sortBy`; inspect the exact accepted values instead of copying filters from a general Google SEO API. Organic and advertising ranks, traffic shares and volume-related fields must retain their provider definitions. The schema is not evidence that every metric is available for every ASIN or period.

**Reviewed November 5, 2026 from the current documentation and catalog contract. This update did not execute a reverse-ASIN request.** For integration details, continue to the existing [ASIN keyword API shortlist guide]({{ '/ecommerce-trends/amazon-keywords-by-asin-api/' | relative_url }}); for the term-qualification method, use [reverse-ASIN keyword research]({{ '/reverse-asin-keyword-research/' | relative_url }}). They are supporting workflows, not additional copies of this discovery guide.

{% include article-action.html placement="article-middle" %}

## Export one competitor's keywords with Python

**Collect one small ASIN sample, inspect it, then repeat deliberately for the other comparable products.** Download the [Python 3.10+ export starter]({{ '/assets/downloads/competitor-evidence-export.py' | relative_url }}) and [ASIN request template]({{ '/assets/downloads/competitor-asin-request.json' | relative_url }}). Save both files together. The starter uses Python's standard library and makes one paid POST per invocation; it does not retry, fetch more pages or call an AI model.

Replace `REPLACE_ME` in the template with one real, comparable ASIN. The starter rejects this placeholder. Keep `country: US`, `timePieceType: latelyDay`, `timePieceValue: "7"`, `pageNum: 1` and `pageSize: 10` for the initial comparison. These are deliberately narrow starter settings, not the full API's capabilities.

Set `NEXSCOPE_API_KEY` in your local environment using your normal secret-management method. Inspect the [current ASIN Keywords reference](https://www.nexscope.ai/api-docs/amazon-asin-keywords?view=api#online-test), access and credit estimate before running:

```shell
python competitor-evidence-export.py amazon competitor-asin-request.json --output competitor-a-001
```

The request goes to `https://api.nexscope.ai/sf/asinKeywords`. Each run needs a new output directory. It saves the raw response before transformation, checks the outer business envelope and any returned provider business code, and reads the keyword array at `data.data`. It stops when returned ASINs do not match the requested product; parent/variant scope needs inspection rather than an automatic merge.

| File | What it gives you | Check before using it |
| --- | --- | --- |
| `response.json` | Original response bytes | Envelope, provider result and the exact returned records |
| `manifest.json` | Request scope, client observation time, reported count and available parent/variant flags | Observation time is not proof every record was freshly collected |
| `rows.csv` | Keyword, ASIN, natural/ad ranks, available weekly volume and review columns | Blank metrics remain unknown; rank displays and source dates stay separate |

The code retains zero values, escapes spreadsheet-formula text and rejects duplicate normalized keywords within one ASIN sample. A zero rank is preserved as returned evidence for review, not converted into a valid first position. Check display text and missing context before deciding whether a product was observed ranking.

## How do you compare several ASIN exports without double-counting?

**Join on a normalized keyword within the same marketplace and period; keep each ASIN's evidence in a separate row.** Make a deliberate first-page request for each of your three to five comparable products. This means three to five separately charged calls, not one batch call. Retain each request with its corresponding response and keep collection times close enough for your decision.

The CSV's `normalized_keyword` applies Unicode NFC, trims outer whitespace and case-folds the phrase. It does not translate, stem, remove accents or collapse different buyer meanings. In a spreadsheet pivot, place normalized keywords in rows and ASINs in columns. Count **distinct comparable ASINs**, then inspect the original wording and source fields before assigning a content action.

| Comparison check | Decision rule |
| --- | --- |
| Same phrase appears for three products | Record three associated ASINs; do not add the same query's search-volume estimate three times |
| Phrase appears in one sample but not another | Mark “not returned in this sample,” not “the other ASIN never ranks” |
| Natural and ad ranks differ | Keep both; an advertising placement does not prove organic placement |
| A competitor term is absent from your listing | Check your product facts before calling it a useful gap |
| Parent or variant identity differs | Hold that comparison until the product scope is reconciled |

Use the blank `comparable_asin`, `brand_or_generic`, `your_listing_coverage`, `decision` and `evidence_note` columns to record the review. A useful outcome is a small set of truthful changes to test, not the largest possible keyword list. The [ASIN API integration guide]({{ '/ecommerce-trends/amazon-keywords-by-asin-api/' | relative_url }}) covers the endpoint separately; this page focuses on choosing and comparing competitors.

To inspect the same response again without another API charge:

```shell
python competitor-evidence-export.py amazon competitor-asin-request.json --from-response competitor-a-001/response.json --output competitor-a-offline-001
```

Use the original request file. Missing arrays, failed business codes or mismatched identities stop the export. A genuinely empty array yields zero rows. The starter was validated with constructed offline fixtures; this November 5 update did not execute a paid reverse-ASIN request or measure listing uplift. The separate October 7 example below retains its original scope and date.

## What did our dated keyword-and-competitor test actually show?

On **October 7, 2026**, a Nexscope production API test expanded `portable blender` into 10 **Google US English** keyword ideas; six were brand-led. The seed term had an **estimated Google monthly search volume of 18,100** in that response. A *separate* Amazon US product lookup returned 10 first-page products, including the shaker bottle described above.

| Observation | Useful conclusion | Unsupported conclusion |
| --- | --- | --- |
| Six of 10 Google ideas named brands | Separate brand-led research from generic product terms | A new brand can capture those searches |
| `portable blender` had estimated Google US volume of 18,100 | The phrase merits Google search-intent review | Amazon receives 18,100 searches for it |
| Amazon product sample included a shaker bottle | Manually screen ASIN comparability | All returned rows are direct competitors |

The [dated request, response, and sanitized JSON]({{ '/api-evidence/portable-blender-keyword-competitor/' | relative_url }}) show the exact scope and limitations. We did **not** run a reverse-ASIN benchmark in that test, measure Amazon query volume, or observe a conversion lift. The [SEO Keyword Planner case guide]({{ '/seo-keyword-planner/' | relative_url }}) explains the Google-keyword part of this workflow separately.

## How should you prioritize an Amazon keyword gap?

**A gap is worth testing when it is relevant, supported by a traceable source, and absent or weak in your current coverage.** Do not sort a reverse-ASIN export solely by a provider's volume estimate. Consider whether the term describes an actual feature, whether multiple close competitors are associated with it, whether it is branded, and whether your own customer data supports the intent.

| Record in your shortlist | Example of what to capture |
| --- | --- |
| Term and intent | Exact phrase; product feature, use case, comparison, or brand |
| Source and scope | Provider or first-party report; Amazon US; retrieval date |
| Competitor evidence | ASINs, why each is comparable, relevant returned fields |
| Your coverage | Listing location, current ad targeting, or no verified coverage |
| Decision | Test, monitor, or reject, with a one-sentence reason |
| Outcome | Change date, baseline, subsequent clicks or orders where available |

For example, `portable blender for smoothies` is a plausible candidate only if the product can actually make smoothies. A brand-specific query such as `ninja blast portable blender` belongs in a separate comparison or advertising decision; it should not be inserted into a generic listing simply to chase an estimate. The [Amazon listing optimization guide]({{ '/amazon-listing-optimization-tool/' | relative_url }}) covers how to turn a verified term into truthful product copy.

## What are the limits of competitor-keyword tools?

Reverse-ASIN providers can differ in coverage, update timing, and the meaning of “ranked,” “indexed,” or “associated.” A missing term does not prove a competitor never appears for it. An estimated volume or sales field is not a seller-account measurement. Product rank, organic placement, advertising placement, and conversion answer different questions; keep them in separate columns.

## Frequently asked questions

### How do you find Amazon competitor keywords?

Choose comparable ASINs in the same marketplace, collect dated reverse-ASIN evidence, separate branded and generic terms, then validate relevance against your listing and eligible first-party reports.

### Can Amazon competitor keywords prove demand?

No. A returned term is a research candidate. Preserve its marketplace, date, provider and metric definitions; it does not prove search volume, conversion or product relevance.

### What does an Amazon product ranking tool actually measure?

It measures a dated rank or placement signal for a defined marketplace, query, product, and result type. Treat it as a snapshot. It is not a substitute for demand, conversion, or first-party search-term data, and sponsored and organic placement should never be merged without labels.

This guide is an editorial workflow, not a claim that a particular keyword will increase rankings or sales. Recheck the live [Amazon ASIN Keywords API documentation](https://www.nexscope.ai/api-docs/amazon-asin-keywords?view=api&co-from=learn) for current fields and credits, and verify consequential decisions against your first-party Amazon reports and listing experiments.

