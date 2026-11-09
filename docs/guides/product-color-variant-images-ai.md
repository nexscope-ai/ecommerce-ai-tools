---
learning_topic: creative
content_kind: guide
layout: default
title: "Product Color Variant Images Without a Reshoot: AI Recolor Workflow"
description: "Create an image for every color you sell from one approved product photo with AI recoloring, match each color to a real swatch, and know when you still need a real photo."
permalink: /guides/product-color-variant-images-ai/
date_published: 2026-11-09
date_modified: 2026-11-09
last_modified_at: 2026-11-09
last_reviewed: 2026-11-09
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
suppress_article_help: true
keywords:
  - product color variant images
  - recolor product photo AI
  - color variants without reshoot
  - Shopify variant images AI
  - Amazon color variation images
faq:
  - question: "When is AI recoloring accurate enough for variant images?"
    answer: "When color is the only difference between variants. If variants differ in material, texture, finish, pattern or hardware, recoloring one photo will misrepresent the product and you need a real photo of that variant."
  - question: "How do I make the recolored image match the real product?"
    answer: "Measure or obtain the exact color from a physical sample or supplier swatch, pass it as a HEX, RGB or HSB value or as a reference image, then compare the output with the physical product under neutral light before publishing."
  - question: "How many colors can one request include?"
    answer: "The current One-Click Image Recoloring v2 reference accepts 1 to 25 target colors or 1 to 25 color reference images per request, but not both in the same request."
  - question: "Can buyers return items because the color looked different?"
    answer: "Yes, color mismatch is a common reason for returns and negative reviews. That is why every recolored image should be checked against the physical product, and why variants with uncertain color should get a real photo."
next_step:
  id: image_recoloring
  title: Recolor one approved photo into your real colorways
  description: "Inspect the recoloring inputs, color formats, image size limits and current credit cost before running a test."
  label: Open One-Click Image Recoloring
  url: https://www.nexscope.ai/api-docs/one-click-image-recoloring-v2?view=api&co-from=learn
---

# How do you create product images for every color variant without a new photoshoot?

**Start from one approved, well-lit photo of the product, use AI recoloring to change only the product to each exact color you sell — defined by a HEX value or a swatch photo from the physical sample — and approve each image only after comparing it with the real item.** Recoloring works when color is the only difference between variants. If material, finish or pattern changes, photograph that variant.

{% include api-guide-entry.html %}

> **Quick answer:** Nexscope's [One-Click Image Recoloring v2](https://www.nexscope.ai/api-docs/one-click-image-recoloring-v2?view=api&co-from=learn) (`nexscope_one_click_image_recoloring_v2`) takes a product image, the subject to recolor (for example "phone case" or "hoodie") and 1–25 target colors as HEX, RGB or HSB values — or 1–25 color reference images. It runs as a task. Check every output against the physical product before attaching it to a variant.

## Why do sellers need this?

Every new colorway multiplies photography cost, and many small sellers end up with one image shared across all variants. In r/ecommerce, a seller asked for the best way to show multiple color variants with only one product image; the discussion compared a simple CSS color overlay with generating separate recolored images, noting overlays fail as soon as material texture matters ([r/ecommerce](https://www.reddit.com/r/ecommerce/comments/1sdw6kq/best_way_to_show_multiple_color_variants_with/)). In a separate thread about AI for clothing brands, sellers listed "color variations" among the things AI already does well, while warning that apparel details are easy to get wrong ([r/ecommerce, May 2026](https://www.reddit.com/r/ecommerce/comments/1tdxyfk/whats_the_best_ai_tool_right_now_for_ecommerce/)). The number of dedicated Shopify apps for color variant photos is another sign of steady demand.

A wrong image is worse than a missing one: buyers who receive a different shade than pictured return the item or leave a review about it. So the goal is not just more images — it is accurate ones.

## When should you recolor, and when should you reshoot?

| Variant difference | Recolor? | Why |
| --- | --- | --- |
| Same product, different solid color | Yes | This is what recoloring is for |
| Same product, different color of one part (strap, lid, trim) | Usually — name that part as the subject | Keep other parts unchanged |
| Different material or finish (matte vs gloss, leather vs fabric) | No | Texture and light behavior change, not just color |
| Different print or pattern | No | Recolor changes color, not pattern |
| Metallic, transparent or neon colors | Test carefully | These are hard to render accurately; compare closely |
| Very dark to very light (black to white) | Test carefully | Shadows and detail can look wrong |

## What do you need before you start?

- **One approved base image.** Good, even lighting, the product in focus, a color that is easy to shift (mid-tones usually recolor more cleanly than pure black). The reference requires 300–4,096 pixels on each side.
- **The exact target colors.** Get HEX or RGB values from your supplier's color card, or photograph a physical sample next to a gray card and use that photo as a reference image.
- **A clear subject name.** The `colorSubject` field tells the model what to recolor — "water bottle body", "hoodie", "phone case". Be specific if only part of the product changes.
- **A subscription.** Creative AI APIs require an active Nexscope subscription; the API page shows an estimated 70–84 credits per call on November 9, 2026. See the [pricing page](https://www.nexscope.ai/pricing?co-from=learn) for plans.

## How do you run the workflow step by step?

1. **Approve the base image first.** If the base photo misrepresents the product, every variant will too. A clean white-background image is a good base — see [AI product photography]({{ '/ai-product-image-generator/' | relative_url }}) if you need one.
2. **Collect color values from physical samples.** Write a table: variant name, SKU, HEX value or swatch image URL.
3. **Run one request with all colors for one base image.** Pass the list in `colors`, or pass swatch photos in `refImageUrls` — not both in one request.
4. **Fetch the finished task.** The first response returns a task ID. Query `/ai/oneClickImageRecoloringV2/tasks/{taskId}` for the result.
5. **Compare each output with the physical sample.** Neutral light, same screen calibration you use for listing review. Check that only the intended part changed.
6. **Reject and adjust, don't retouch.** If a color is off, try a swatch image instead of a HEX value, or a more specific subject name.
7. **Attach images to the right variant.** Use the variant SKU in the file name so images can't end up on the wrong option in Shopify, Amazon or another store.
8. **Recolor the other angles.** Repeat with the same colors on each approved angle (back, detail, lifestyle) so every variant has a full gallery.

## What does this look like with an AI agent?

With Nexscope connected through the [MCP setup](https://www.nexscope.ai/mcp-data?co-from=learn) (`https://api.nexscope.ai/mcp`) in Claude, Codex or Cursor:

```text
Base image (approved, white background): https://example.com/bottle-main.jpg
Subject to recolor: "water bottle body" (keep the black lid unchanged)
Variants from the supplier color card:
- BTL-500-SAGE  #9CAF88
- BTL-500-SAND  #D8C3A5
- BTL-500-NAVY  #1F2A44
Use the one-click recoloring tool with these three colors in one request.
Wait for the task to finish, then list each output URL next to its SKU.
Don't attach anything to listings; I'll review the colors first.
```

**Example only:** the SKUs, HEX values and URLs are placeholders. No output is shown or implied.

## How do you call it from code?

```bash
curl -X POST 'https://api.nexscope.ai/ai/oneClickImageRecoloringV2' \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/bottle-main.jpg",
    "colorSubject": "water bottle body",
    "colors": ["#9CAF88", "#D8C3A5", "#1F2A44"]
  }'
```

To match a physical sample more closely, replace `colors` with `"refImageUrls": ["https://example.com/swatch-sage.jpg"]`. The platform returns `code` 0 and a `taskId` when accepted; poll the task endpoint rather than resending the POST, because each submission is billed. The [retries and deduplication guide]({{ '/guides/paid-api-workflow-retries-deduplication/' | relative_url }}) explains how to avoid paying twice after a timeout.

## How do you review the outputs?

| Check | Pass | Fail |
| --- | --- | --- |
| Hue and brightness | Matches the physical sample side by side | Visibly lighter, darker or a different hue |
| Scope | Only the named part changed | Lid, logo, label or background also changed |
| Detail | Seams, texture, embossing still visible | Flattened or smeared detail |
| Shadows and highlights | Natural for the new color | Glow, banding or gray cast |
| Label and logo | Unchanged and legible | Recolored or distorted text |

Record which method produced each approved image (HEX or swatch) so you can repeat it for the next angle or the next season.

## How does this fit with other image work?

Recoloring is one step in a listing image set. For apparel, combine it with on-model images from [AI virtual try-on]({{ '/guides/ai-clothing-model-photos-virtual-try-on/' | relative_url }}) — recolor the approved on-model image rather than generating each color on the model from scratch, so the pose and model stay identical across variants. For ads, feed approved variant images into the [product ad image brief]({{ '/guides/product-ad-image-brief/' | relative_url }}) workflow or a short [product video]({{ '/ai-video-generator/' | relative_url }}).

## How does this compare with other options?

| Option | Strength | Trade-off |
| --- | --- | --- |
| Photograph every variant | Most accurate | Cost and time per color, every season |
| Photo editor (manual hue/saturation) | Full control | Slow; hard to keep texture and shadows natural |
| CSS overlay on the storefront | No new images | Breaks with texture; not usable on marketplaces |
| Dedicated recolor apps (for example Shopify variant-photo apps) | Store integration | Store-specific; separate subscription |
| Nexscope recoloring via MCP or REST | Up to 25 colors per request, HEX or swatch input; same credits as other image, video and research tools; works for any store or marketplace | You run the color review; subscription required |

## Frequently asked questions

### When is AI recoloring accurate enough for variant images?

When color is the only difference. Different materials, finishes, patterns or hardware need a real photo.

### How do I make the recolored image match the real product?

Use a HEX value or swatch photo taken from the physical sample, then compare the output with the product under neutral light.

### How many colors can one request include?

The current reference accepts 1–25 target colors or 1–25 reference images per request, not both together.

### Can buyers return items because the color looked different?

Yes. Check every recolored image against the physical product, and photograph variants where color is uncertain.

**Next step:** take one approved product photo and your supplier's color card, and run a three-color test in the [recoloring playground](https://www.nexscope.ai/api-docs/one-click-image-recoloring-v2?view=playground&co-from=learn) before recoloring the whole catalog.
