---
layout: default
title: Portable Blender Amazon-to-1688 API Test
description: Inspect a dated Amazon product, low-star review, 1688 image-search and supplier-detail workflow with sanitized evidence and explicit limits.
permalink: /api-evidence/portable-blender-amazon-1688/
last_reviewed: 2026-10-07
date_published: 2026-10-07
date_modified: 2026-10-07
last_modified_at: 2026-10-07
schema_type: Article
topic: sourcing
---

# Portable blender Amazon-to-1688 API test

**Observed result:** on October 7, 2026, Nexscope retrieved Amazon product `B0CT2BY5KL`, used its image in a 1688 image-search request, returned 10 candidate offers priced from **¥28 to ¥79**, and opened two offer-detail records. A separate low-star request returned 10 one-star reviews even though the request asked for five one-star and five two-star reviews. These are sourcing and product-test leads, not proof of an identical factory product or a defect rate.

| Evidence field | Observed value |
| --- | --- |
| Environment | Nexscope production API |
| Test time | October 7, 2026, 04:00–04:01 UTC |
| Amazon source | `B0CT2BY5KL`, returned price $32.29 |
| 1688 image-search sample | 10 candidate offers |
| Returned listing-price range | ¥28–¥79 |
| Returned MOQ | 1 for 9 offers; unknown for 1 |
| Detail checks | 2 offers, each 5 returned SKUs and MOQ 1 |
| Low-star request | 5 one-star + 5 two-star |
| Low-star result | 10 one-star + 0 two-star |
| Credit charge | Not captured; no amount is claimed |

## What did the image search return?

The 10 candidates reported monthly-unit values from 4 to 591. All carried a returned `诚信通会员` label; three also carried `实力商家`, and two carried `超级工厂`. These are provider-returned identity or membership labels, not certifications independently authenticated by this test.

| Rank | Offer ID | Price | MOQ | Reported monthly units | Returned labels |
| ---: | --- | ---: | ---: | ---: | --- |
| 1 | `902856167524` | ¥33.00 | 1 | 591 | 诚信通会员 |
| 2 | `957433112906` | ¥28.00 | Unknown | 210 | 实力商家, 诚信通会员 |
| 3 | `947942225643` | ¥30.64 | 1 | 207 | 实力商家, 诚信通会员 |
| 4 | `1043284401663` | ¥35.00 | 1 | 184 | 诚信通会员 |
| 5 | `1036978647065` | ¥33.00 | 1 | 76 | 超级工厂, 诚信通会员 |
| 6 | `689890947922` | ¥72.00 | 1 | 40 | 诚信通会员 |
| 7 | `1014280929964` | ¥38.00 | 1 | 20 | 实力商家, 诚信通会员 |
| 8 | `1049551732248` | ¥38.00 | 1 | 14 | 诚信通会员 |
| 9 | `959069756666` | ¥79.00 | 1 | 5 | 超级工厂, 诚信通会员 |
| 10 | `1044389845983` | ¥33.00 | 1 | 4 | 诚信通会员 |

Visual similarity does not prove that an offer has the same manufacturer, motor, battery, materials, safety compliance, warranty, accessories, quality or intellectual-property status as the Amazon item.

## What did two supplier-detail checks add?

| Offer ID | Returned company | Dispatch location | MOQ | SKUs | Returned tier |
| --- | --- | --- | ---: | ---: | --- |
| `902856167524` | 温州八只鹅电子科技有限公司 | 浙江省温州市 | 1 | 5 | 1+ at ¥33 |
| `1036978647065` | 温州启寻科技有限公司 | 浙江省温州市 | 1 | 5 | 1+ at ¥33 |

The checks provide contact targets and sample-order inputs. They do not establish factory ownership or production capability. The ¥33 listing price cannot be compared directly with the returned Amazon price of $32.29 to calculate margin: freight, duties, taxes, packaging, inspection, payment, returns, advertising, marketplace fees, compliance and specification differences are all excluded.

## What did the low-star review sample show?

The returned 10-review sample contained five comments coded for stopped-working or unusable outcomes, four for battery or charging, three for fruit or ice blending performance, and one for leakage. Theme counts overlap because one comment can support more than one test.

This does **not** mean 50% of buyers experienced product failure. The request deliberately selected low-star feedback, returned only 10 comments and did not sample positive reviews. The absence of two-star rows also does not prove that no two-star reviews exist. Reviewer identities and full comment text are excluded from the public evidence file; only source IDs and paraphrases are retained.

The actionable next step is a pre-launch test plan: record battery runtime and recharge time, run repeat blending tests with declared fruit and ice sizes, perform a leak test after repeated assembly, verify every included accessory, and document warranty handling. Compare those tests with multiple supplier samples before making listing claims.

## Evidence files and reproduction

- [Download the sanitized JSON record]({{ '/assets/evidence/portable-blender-amazon-1688-2026-10-07.json' | relative_url }})
- [Open the Amazon-to-1688 Supplier Finder](https://learn.nexscope.ai/tools/amazon-to-1688-supplier-finder/)
- [Read the complete market-research case]({{ '/portable-blender-market-research-case-study/' | relative_url }})

The run used `amazon-product-detail/run`, `1688-search-by-image/run`, `1688-product-detail/run` and `amazon-reviews-list/run`. No API key, token, reviewer identity or private account information is stored in the public record.

## What this record cannot establish

- Image-search candidates are not confirmed identical products or verified factories.
- Returned sales, membership and identity fields were not independently authenticated.
- A selected low-star sample cannot estimate review distribution, satisfaction or defect rate.
- Listing prices are not landed cost and do not establish profit.
- No supplier sample, compliance document, battery test, leak test or commercial outcome was evaluated.
