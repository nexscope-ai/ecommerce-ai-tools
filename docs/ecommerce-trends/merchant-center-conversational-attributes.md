---
layout: default
title: "Merchant Center Conversational Attributes: 6-Field Guide"
description: Learn what Google's six Merchant Center conversational attributes do, when to use them, and how to avoid duplicate or unsupported product claims.
permalink: /ecommerce-trends/merchant-center-conversational-attributes/
last_reviewed: 2026-09-22
date_published: 2026-09-22
date_modified: 2026-09-22
author: Nexscope Team
schema_type: Article
og_type: article
topic: shopping
keywords:
  - Merchant Center conversational attributes
  - Google AI Mode product feed
  - question and answer attribute
  - conversational commerce product data
image: /assets/images/merchant-center-conversational-attributes-1440w.webp
image_small: /assets/images/merchant-center-conversational-attributes-720w.webp
image_alt: A product connected to question, document, related-product, variant, group, and popularity data modules that feed an AI shopping assistant
image_caption: "Illustration: conversational attributes add product context, but they should complement accurate core feed fields rather than repeat them."
faq:
  - question: What are Merchant Center conversational attributes?
    answer: "They are six optional product-data attributes that provide additional question-and-answer, document, related-product, group, variant, and popularity context for Google AI shopping experiences."
  - question: Do conversational attributes affect product approval?
    answer: "Google says adding these optional attributes does not affect the approval status of existing products. Core product requirements and policy compliance still apply."
  - question: Should merchants repeat their descriptions in conversational attributes?
    answer: "No. Google advises merchants not to duplicate details already submitted through description, product highlight, or product detail fields. Add only accurate context that has a clear purpose."
---

# Merchant Center conversational attributes: a practical six-field guide

{% include article-visual.html %}

**By Nexscope Team · Published September 22, 2026 · Updated September 22, 2026**

**Merchant Center conversational attributes are six optional product-data fields designed to help AI systems understand questions, documents, product relationships, groups, variants, and relative popularity.** They complement the standard product feed; they do not replace identifiers, price, availability, required attributes, or accurate landing pages.

The opportunity is not to add more marketing copy. It is to give a shopping system precise context that was previously difficult to express in a conventional feed.

> **The practical takeaway:** first make the primary feed and landing page accurate. Then add only the conversational attributes that resolve real buyer questions or catalog relationships. More fields are not automatically better, and duplicated or unsupported information can create new inconsistencies.

## What are Google's six conversational attributes?

**The six fields are `question_and_answer`, `document_link`, `related_product`, `item_group_title`, `variant_option`, and `popularity_rank`.** Google recommends adding them through a supplemental data source, although merchants can also use a primary data source or the Merchant API.

Google says the attributes are optional and do not change the approval status of existing products. The [official conversational attributes specification](https://support.google.com/merchants/answer/17085370?hl=en) remains the source of truth for current formats, limits, and availability.

| Attribute | What it expresses | Good use case | Main risk |
| --- | --- | --- | --- |
| `question_and_answer` | Product-specific questions with factual answers | Compatibility, care, setup, included parts | Invented FAQs or answers that conflict with the page |
| `document_link` | Related PDF documents | Manuals, assembly guides, technical sheets | Broken, outdated, inaccessible, or mismatched files |
| `related_product` | A defined relationship with another product | Required component, accessory, replacement, bundle context | Linking products without a real relationship |
| `item_group_title` | A readable title for a variant family | A shoe model sold in several widths, sizes, and colors | Using a group title that is broader than the actual family |
| `variant_option` | The properties that distinguish one variant | Size, width, color, storage, material | Missing an option or mapping it to the wrong SKU |
| `popularity_rank` | Relative performance within the merchant's own inventory | Prioritizing genuinely popular items in a catalog | Presenting unsupported external-market popularity |

## Which conversational attribute should you implement first?

**Choose the field that fixes a verified information gap; do not implement all six simply because they exist.** The right priority depends on the catalog.

### Start with variant fields for complex catalogs

Use `item_group_title` and `variant_option` first when shoppers frequently need a specific size, color, width, capacity, memory configuration, or material. A recommendation is only useful when the qualifying variant can be identified and purchased.

Before adding these fields, verify that `item_group_id`, product IDs, URLs, images, price, and availability already point to the same variant structure.

### Start with question and answer for high-consideration products

Use `question_and_answer` when product selection depends on recurring factual questions: “Will this fit a 14-inch laptop?”, “Is the liner removable?”, or “Does the package include the mounting bracket?”

Answers should be specific, current, and supported by visible product information or documentation. Avoid promotional questions, keyword lists, and claims that a customer could not verify.

### Start with documents for technical or assembled products

Use `document_link` for relevant PDFs such as manuals, installation instructions, safety information, or specification sheets. Check that the document belongs to the exact model, can be fetched without a login, and remains available at a stable URL.

### Add relationships only when they are operationally true

Use `related_product` to distinguish an accessory from a required component or another supported relationship. A random cross-sell is not useful context. The linked identifier must resolve to the intended product and remain current when the catalog changes.

### Treat popularity as first-party catalog context

Google defines `popularity_rank` relative to the merchant's total inventory. It should not be populated from an unsupported claim such as “best seller everywhere” or from a marketplace estimate that measures something different.

## How do conversational attributes differ from standard feed fields?

**Standard fields establish what the product is and whether it can be sold; conversational attributes add context about how a shopper may evaluate it.** The distinction helps prevent duplicate or conflicting data.

| Layer | Examples | Role |
| --- | --- | --- |
| Core commerce | ID, price, availability, condition, link | Establish the sellable offer |
| Product identity | Brand, GTIN, MPN, category | Identify and classify the product |
| Descriptive evidence | Title, description, product highlight, product detail | Explain features and specifications |
| Conversational context | Questions, documents, relationships, groups, variants, popularity | Support nuanced questions and catalog navigation |

Google explicitly says merchants do not need to repeat details already submitted in `description`, `product_highlight`, or `product_detail`. Duplication creates maintenance work and increases the chance that two fields disagree later.

## What does a clean implementation look like?

**A clean implementation begins with a small product set and a field-to-evidence map.** For each proposed value, record where the fact came from, which SKU it belongs to, who owns updates, and how it will be validated.

Consider a fictional insulated lunch bag with three sizes:

| Buyer need | Best data location | Example evidence |
| --- | --- | --- |
| Current price and stock | Core feed fields | Variant-level commerce system |
| Dimensions and capacity | Product detail | Manufacturer specification |
| “Does it fit two meal containers?” | Question and answer | Tested internal dimensions and named container sizes |
| Small, medium, and large distinction | Variant option | Variant source of truth |
| Cleaning instructions | Document link or visible page | Current care guide for the same model |
| Compatible ice pack | Related product | Stable product identifier and verified fit |

The answer should not say “fits every meal container” if only one configuration was tested. Conversational product data still needs the same qualification and evidence as visible product copy.

## How should you roll out conversational attributes?

### 1. Select products with a real information problem

Choose a manageable group with meaningful traffic, recurring customer questions, complex variants, or technical documentation. Avoid beginning with the entire catalog.

### 2. Build the source-of-truth map

For every value, record the product ID, variant, source system, supporting URL or document, owner, and refresh rule. Do not derive permanent product facts from a temporary campaign spreadsheet.

### 3. Use a supplemental data source for the first test

Google recommends a supplemental source for these attributes. It can isolate the new context from the primary feed and make rollback easier. Confirm the current upload or Merchant API requirements in official documentation.

### 4. Validate ingestion and product matching

Check whether the values were accepted and attached to the correct item. Validate special characters, grouped sub-attributes, identifiers, PDFs, and variant relationships. Approval of the base product does not prove every supplemental value is useful or correct.

### 5. Compare AI visibility and business outcomes

Use [Merchant Center AI Performance Insights](../merchant-center-ai-performance-insights/) where eligible to review product terms, popular attributes, search intents, products showing, and share of voice. Also check qualified sessions, product engagement, and conversion data. A visibility change without relevant outcomes may not deserve wider rollout.

## What should you avoid?

- Do not duplicate the same specification across every available field.
- Do not fabricate customer questions to insert keywords.
- Do not point multiple models to one generic PDF when specifications differ.
- Do not reuse a parent product's attributes for variants that have different dimensions or compatibility.
- Do not describe external-market popularity with an internal inventory rank.
- Do not assume conversational attributes guarantee appearance in AI Mode.
- Do not leave the public product page with less accurate information than the feed.

Conversational attributes improve the information available to supported systems. Google does not promise that adding a field will create an impression, citation, recommendation, or sale.

## How can Nexscope help prepare the evidence?

**Nexscope can help research the questions and evidence around a product, but Merchant Center remains the place to submit and validate the feed.** The connection is strongest before implementation:

- use the [SEO Keyword Planner](https://www.nexscope.ai/tools/seo-keyword-planner?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=conversational_attributes) to map attribute and use-case language;
- analyze public product reviews with the [Amazon Review Analyzer](https://www.nexscope.ai/tools/amazon-review-analyzer?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=conversational_attributes) to find recurring questions and complaints that require verification;
- inspect comparable products and variants through the relevant [ecommerce APIs](https://www.nexscope.ai/api-docs?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=conversational_attributes);
- run the public destination through the [Website SEO Auditor](https://www.nexscope.ai/tools/website-seo-auditor?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=conversational_attributes) to find crawlability and evidence gaps.

Review and substantiate every proposed value. Marketplace observations, keyword datasets, and customer reviews can reveal questions; they do not automatically provide the correct answer for your product.

## A practical first test

Select 20 products from one coherent category. Fix core feed inconsistencies first, then add one or two conversational attributes that answer a documented need. Record the baseline, upload date, affected items, validation result, and relevant AI Performance Insights segment. Review the same cohort after processing instead of comparing it with unrelated products.

The best first result is not “all six fields completed.” It is a smaller catalog segment with fewer unanswered questions and a repeatable update process.

## Sources

- [Google Merchant Center Help: How to use conversational attributes](https://support.google.com/merchants/answer/17085370?hl=en)
- [Google: Conversational Attributes announcement](https://business.google.com/us/accelerate/announcements/conversational-attributes/)
- [Google: Boost your holiday sales with agentic commerce updates](https://blog.google/products-and-platforms/products/shopping/google-shopping-updates-holiday-shopping/), September 16, 2026
