---
layout: default
title: "1688 Image Search: Find and Vet Sourcing Candidates"
description: "Find 1688 sourcing candidates from a product photo. Use Nexscope image search, keyword search, product detail and ranking APIs to compare offers without mistaking a visual match for a verified factory."
permalink: /ecommerce-trends/1688-image-search-sourcing/
last_reviewed: 2026-09-20
date_published: 2026-09-20
date_modified: 2026-09-20
date: 2026-09-20
last_modified_at: 2026-09-20
author: Nexscope Team
schema_type: Article
og_type: article
topic: sourcing
keywords:
  - 1688 image search
  - find 1688 supplier by image
  - 1688 product sourcing API
  - 1688 supplier shortlist
image: /assets/images/1688-image-search-sourcing-1440w.webp
image_small: /assets/images/1688-image-search-sourcing-720w.webp
image_alt: An unbranded bottle, its reference photo, alternative samples, and a blank sourcing checklist
image_caption: "Concept illustration of a sourcing review, not a real 1688 result or a verified supplier."
faq:
  - question: Can 1688 image search identify the original manufacturer?
    answer: "No. It returns visually similar product listings. A match cannot establish who manufactured an item, who owns a design, or whether two listings have identical materials and quality. Verify the seller and request a sample before ordering."
  - question: Can I use a WEBP image URL with Nexscope's 1688 Search By Image API?
    answer: "The current API documentation lists publicly accessible PNG, JPG, and JPEG image URLs or raw Base64 for those formats. WEBP and GIF are not listed as supported inputs. Check the live documentation before sending a request."
  - question: Which Nexscope 1688 API should I call after image search?
    answer: "Use the returned offerId with 1688 Product Detail to inspect available SKU, sale, shipping, and company fields. Use Product Search with a Simplified Chinese keyword for an independent comparison set; Product Billboard can provide additional weekly or monthly ranking context."
  - question: Does a supplier badge or a low listed price make a purchase safe?
    answer: "No. A badge, score, sales figure, or listed price is a screening signal, not a guarantee. Confirm the applicable quantity tier, sample, specifications, company identity, compliance, production capacity, shipping, and payment terms independently."
---

# 1688 image search: how to find and vet sourcing candidates

{% include article-visual.html %}

**By Nexscope Team · Updated September 20, 2026**

A product photo can start a 1688 sourcing search, but it cannot tell you which listing is the original factory or which supplier can deliver your exact specification. Alibaba Group describes [1688 as a domestic wholesale marketplace](https://www.alibabagroup.com/en-US/about-alibaba-businesses-1941299332078632960). The practical job for an overseas seller is to turn visual matches into a small, reviewable list of offers, then verify those offers before paying.

> **The short answer:** run 1688 image search with a suitable product photo, record the returned listing IDs, compare price and minimum order quantity on a like-for-like basis, inspect the promising listings in Product Detail, and use Chinese-keyword search to catch alternatives the photo missed. Treat the resulting shortlist as research, not supplier certification.

## What can a photo actually find on 1688?

**1688 image search finds visually similar listings, not proven manufacturers.** Nexscope's [1688 Search By Image API](https://www.nexscope.ai/api-docs/1688-search-by-image?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=1688_image_search_guide&utm_content=image_api) accepts an eligible image and returns candidate products with available identifiers, titles, images, prices, minimum order quantities, seller signals, and dispatch information. A similar silhouette can still hide a different material, capacity, certification, or accessory set.

This matters when sourcing from a marketplace photo. A listing may use a shared catalogue image, a reseller's photograph, or a similar-looking mold. The useful result is an **offer to investigate**. It is not evidence that the seller owns the image, owns the design, or is the manufacturer. If the reference image belongs to another brand, do not assume you can copy its branding or protected design.

## How do you turn an image into a usable shortlist?

**Start with a clean reference and a written product brief.** A photo is good at describing shape but poor at specifying grade, dimensions, performance, and commercial terms. For an insulated bottle, write down the target capacity, material, lid type, color, packaging, desired quantity, target market, and whether you need customization before searching.

1. **Choose an eligible reference.** The current Nexscope API documentation supports a publicly accessible PNG, JPG, or JPEG `imageUrl`, or raw Base64 for those formats. WEBP and GIF are not listed as supported. Use an image you have the right to process and avoid sharing private product imagery through a public URL.
2. **Run image search and keep the raw evidence.** Record the query image, time, returned `offerId`, listing URL, image, displayed price, `quantityBegin`, seller name or identity, and any available sales or service signals. Missing fields should stay blank, not be inferred.
3. **Check the actual offer.** Pass a shortlisted `offerId` as a string to [1688 Product Detail](https://www.nexscope.ai/api-docs/1688-product-detail?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=1688_image_search_guide&utm_content=detail_api). Its normalized response can include `skuList`, `saleInfo`, `shippingInfo`, and `companyName`. Compare the specific variant you would order, not a generic headline image.
4. **Search again by terms, not just appearance.** The [1688 Product Search API](https://www.nexscope.ai/api-docs/1688-product-search?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=1688_image_search_guide&utm_content=keyword_api) supports a `keyWord` in Simplified Chinese, price and MOQ filters, supplier-related filters, and sorting. Search the product's material and function to find alternatives that look different but better fit the brief.
5. **Ask for evidence from the finalists.** Confirm company identity, sample quality, applicable price tier, lead time, production role, testing or compliance documents, payment terms, and shipping arrangement directly. Do not pay solely because an API returned a promising row.

A minimal image-search request body looks like this. Replace the example URL with your own eligible, publicly accessible image; this is a **request template, not a live test or a real search result**:

```json
{
  "imageUrl": "https://your-domain.example/reference-bottle.jpg",
  "page": 1,
  "pageSize": 10
}
```

The documented REST operation is `POST /api/skill-api/v1/skills/1688-search-by-image/run` with a bearer API key. Keep the key on your server, not in browser code or a shared document. The [live API reference](https://www.nexscope.ai/api-docs/1688-search-by-image?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=1688_image_search_guide&utm_content=run_api) is the source of truth for current inputs and billing.

## Which 1688 API answers which sourcing question?

**Use each endpoint for one decision.** Image search discovers visual candidates; the other APIs add independent ways to inspect or challenge that initial shortlist. Combining them is more reliable than treating one image match as a purchase recommendation.

| Sourcing question | Nexscope capability | Evidence to keep | Important limit |
| --- | --- | --- | --- |
| What listings look similar to this item? | [Search By Image](https://www.nexscope.ai/api-docs/1688-search-by-image) | `offerId`, image, listed price, MOQ, seller and dispatch fields when present | Visual similarity is not product or manufacturer identity |
| What other products match the specification? | [Product Search](https://www.nexscope.ai/api-docs/1688-product-search) | Simplified Chinese query, filters, price, quantity tier, sales period, store | Search results are not a quality audit |
| What does this exact offer say? | [Product Detail](https://www.nexscope.ai/api-docs/1688-product-detail) | `offerId`, SKU options, sale and shipping fields, company name when present | Listing data is not a confirmed purchase contract |
| What products appear in weekly or monthly rankings? | [Product Billboard](https://www.nexscope.ai/api-docs/1688-product-billboard) | Requested chart period, category/query, ranked offers | A ranking is context, not a forecast for your destination market |

For a broader procurement overview, see Nexscope's [1688 supplier sourcing guide](https://nexscope-ai.github.io/1688-supplier-product-sourcing/). This article concentrates on the narrower image-to-shortlist workflow and the API evidence needed to reproduce it.

## How should you compare two similar offers?

**Compare the same specification and order size before comparing price.** The `price` field is a listed wholesale signal, while `consignPrice`, when returned, is a separate dropship-price signal. `quantityBegin` and quantity-tier information may change which price applies. Sales counts, repurchase rates, seller identities, and service scores can help prioritize questions, but none proves sample quality or supplier ownership.

Use a worksheet with one row per `offerId` and these columns: exact SKU and material; stated capacity or size; listed wholesale and dropship price; applicable quantity tier and MOQ; dispatch location and lead time; seller/company identifier; available service or transaction signal; **unverified questions**; sample result; and a final buyer decision. Keep the currency and observation date beside every price. Mark an absent field as “not provided,” not zero.

For cross-border resale, a better comparison is **estimated landed cost per sellable unit**, not the lowest displayed 1688 number. Build your own estimate from the negotiated unit cost, packaging, domestic freight, export shipping, applicable duties and taxes, inspection, payment fees, and expected loss from defects. The API does not calculate a binding landed cost or establish customs compliance for you.

## What must you verify before placing an order?

**A data shortlist is the beginning of due diligence.** Before money changes hands, ask the supplier to confirm the exact specification and variant in writing; request a sample; check company registration and whether the seller manufactures or trades; confirm production capacity, lead time, inspection rights, required safety or labeling rules in the destination market, and how defects or delays will be handled. Seek appropriate professional advice where compliance or intellectual-property rights are material.

The same caution applies to rankings. [1688 Product Billboard](https://www.nexscope.ai/api-docs/1688-product-billboard?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=1688_image_search_guide&utm_content=billboard_api) exposes weekly or monthly product ranking context, but a hot wholesale item does not prove end-customer demand in your market. Validate demand separately and document the period, category, and filters used.

## A repeatable workflow for a small sourcing team

**Make the decision trail reproducible.** Save the original photo and brief, the image-search request, the raw response, the shortlist criteria, the detail lookups, and supplier replies. Then a teammate can see why an offer was shortlisted or rejected instead of relying on a screenshot and a vague “looks similar.”

For an initial test, choose one non-branded product you can inspect physically. Search by image, retain five candidate offer IDs, inspect the relevant SKUs, then run a Chinese-keyword search for the same material and function. Identify the two candidates that meet your written constraints and request samples. If none qualifies, that is a useful result: revise the specification or price target instead of lowering verification standards.

Nexscope's 1688 APIs help with **discovery and structured comparison**. They do not place an order, certify a factory, guarantee a margin, or replace direct supplier and compliance checks. [Explore the 1688 API documentation](https://www.nexscope.ai/api-docs?co-from=githubIO&utm_source=github_pages&utm_medium=referral&utm_campaign=1688_image_search_guide&utm_content=final_cta) to choose the first read-only call for your sourcing workflow.

## Frequently asked questions

### Can 1688 image search identify the original manufacturer?

No. It can return visually similar listings. Verify who makes the product, who owns the design, and whether the sample matches your specification before you make a purchase decision.

### Can I use a WEBP image URL?

The current Search By Image documentation lists PNG, JPG, and JPEG for a public `imageUrl` or raw Base64 input. Check the live API reference for any future format changes.

### What should I call after image search?

Use the returned `offerId` with Product Detail, then use a Simplified Chinese product term with Product Search to find alternatives. Use Billboard only if weekly or monthly ranking context helps answer your research question.

### Is the cheapest listed supplier the best choice?

Not necessarily. Verify the applicable quantity tier, MOQ, materials, sample, shipping, total landed cost, supplier identity, and terms. A listed price is a starting signal, not a final offer.

---

**Sources and methodology:** This guide was reviewed against [Alibaba Group's description of 1688](https://www.alibabagroup.com/en-US/about-alibaba-businesses-1941299332078632960) and Nexscope's public [image search](https://www.nexscope.ai/api-docs/1688-search-by-image), [product search](https://www.nexscope.ai/api-docs/1688-product-search), [product detail](https://www.nexscope.ai/api-docs/1688-product-detail), and [billboard](https://www.nexscope.ai/api-docs/1688-product-billboard) API references on September 20, 2026. No real supplier search, purchase, or performance benchmark was run for this article. Fields may be absent or change; check the live documentation and returned data before use.
