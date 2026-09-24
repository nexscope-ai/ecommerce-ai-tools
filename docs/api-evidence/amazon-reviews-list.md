---
layout: default
title: Amazon Reviews List API Evidence | One Low-Star Sample
description: Inspect a real Nexscope Amazon review collection with its ASIN, marketplace, requested ratings, returned count, source IDs and analysis limitations.
permalink: /api-evidence/amazon-reviews-list/
last_reviewed: 2026-09-23
date_published: 2026-09-23
date_modified: 2026-09-23
schema_type: Article
topic: research
---

# Amazon Reviews List API: one observed low-star sample

**Observed result:** a September 15, 2026 production run requested 10 one-star and 10 two-star reviews for ASIN `B0G1FVPYNW` on Amazon US. The workflow returned **10 unique review IDs: nine one-star and one two-star**. Human review found four comments that explicitly mentioned physical size or capacity.

This record documents one bounded request. It does not estimate the distribution of all reviews, overall satisfaction, conversion, returns or sales.

| Evidence field | Observed value |
| --- | --- |
| Environment | Public Nexscope production tool |
| Test date | September 15, 2026 |
| Marketplace / ASIN | Amazon.com / `B0G1FVPYNW` |
| Requested | 10 one-star + 10 two-star reviews |
| Returned | 10 unique review IDs; 9 one-star + 1 two-star |
| Returned review dates | September 24, 2024 to May 19, 2026 |
| Human-coded size/capacity mentions | 4 of 10 returned comments |

## What the result can support

The returned evidence supports a **follow-up capacity test** for a comparable product: measure usable dimensions, photograph tested card and cash configurations, show accurate scale, and check whether listing language communicates intended use. It does not prove that the product should be enlarged or that the listing caused the complaints.

## Inspect the full evidence trail

The complete case study lists the four returned source review IDs, paraphrased evidence, the proposed validation plan and places where human review rejected unsupported AI interpretations.

- [Read the full Amazon review case study]({{ '/amazon-review-case-study/' | relative_url }})
- [Open the Amazon Reviews List API documentation](https://www.nexscope.ai/api-docs/amazon-reviews-list?view=api&co-from=learn)
- [Follow the negative-review analysis tutorial]({{ '/amazon-negative-review-analysis/' | relative_url }})

No API key, token or private account information is stored in this public record.
