# Ecommerce AI Tools by Nexscope

Official browser tools, ecommerce data APIs, creative AI APIs, workflow guides, and community support from Nexscope.

**New users get 1,000 free credits to get started.** [Create your Nexscope account](https://www.nexscope.ai/?utm_source=github&utm_medium=referral&utm_campaign=tools_launch&utm_content=tools_readme). Credit usage varies by action.

[Explore API docs](https://www.nexscope.ai/api-docs?co-from=github-ecommerce-ai-tools&utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_top) · [API capabilities and workflows](docs/api-capabilities.md) · [Getting started](docs/getting-started.md) · [Report a bug or request a feature](https://github.com/nexscope-ai/ecommerce-ai-tools/issues/new/choose)

## Ecommerce data, SEO/GEO, and creative AI APIs

Building a product research dashboard, an AI agent, or an ecommerce automation? [Nexscope API Docs](https://www.nexscope.ai/api-docs?co-from=github-ecommerce-ai-tools&utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_api_intro) brings together endpoint parameters, response schemas, request examples, online testing, and REST/MCP integration guidance.

| Your goal | Documented capabilities | Start here |
| --- | --- | --- |
| Understand competitor complaints | Retrieve Amazon reviews by ASIN and star rating; use the returned evidence in a separate analysis request. | [Amazon Reviews List API](https://www.nexscope.ai/api-docs/amazon-reviews-list?view=api&co-from=github-ecommerce-ai-tools&utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_reviews) |
| Research products and keywords | Amazon search, ASIN details, price history, competitor lookup, and reverse ASIN keyword research. | [Amazon Search API](https://www.nexscope.ai/api-docs/amazon-search?view=api&co-from=github-ecommerce-ai-tools&utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_amazon) |
| Find sourcing candidates | Search 1688 products by keyword or image and inspect returned supplier and product information. | [1688 Search By Image API](https://www.nexscope.ai/api-docs/1688-search-by-image?view=api&co-from=github-ecommerce-ai-tools&utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_sourcing) |
| Explore stores and social commerce | Shopify product/store queries and TikTok Shop product, creator, video, and ad research. | [Shopify Product Query API](https://www.nexscope.ai/api-docs/shopify-product-query?view=api&co-from=github-ecommerce-ai-tools&utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_shopify) |
| Research search visibility | SEO/GEO references for keyword metrics, SERPs, page evidence, backlinks, and AI citations; some detail pages are contract drafts. | [SEO API directory](https://www.nexscope.ai/api-docs?tab=marketing&co-from=github-ecommerce-ai-tools&utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_seo_geo) |
| Create product imagery and videos | Background removal, image generation/editing, and asynchronous video generation. | [Creative AI directory](https://www.nexscope.ai/api-docs?tab=creative&co-from=github-ecommerce-ai-tools&utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_creative) |
| Give an AI agent ecommerce tools | Discover MCP tool names and schemas, or call REST endpoints from your own workflow. | [MCP tool map](https://www.nexscope.ai/mcp-map?co-from=github-ecommerce-ai-tools&utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_mcp) |

**Start with 1,000 free credits as a new Nexscope user.** [Create an account](https://www.nexscope.ai/?utm_source=github&utm_medium=referral&utm_campaign=api_docs_launch&utm_content=readme_api_signup), then open the docs and check access for your chosen endpoint. External REST/MCP calls and the API tester use an account API key. Creative API key access requires an active subscription; trial credits do not unlock it. Check each SEO API's published status before relying on it in production.

See [API workflows and integration steps](docs/api-capabilities.md) for concrete examples, or [the API examples repository](https://github.com/nexscope-ai/nexscope-ecommerce-api) for cURL, JavaScript, and Python clients. Have an API question or need another capability? [Open an issue for the official Nexscope team](https://github.com/nexscope-ai/ecommerce-ai-tools/issues/new/choose).

## Tools and release status

The following tools are **coming soon**. Their production pages were not available at our September 14, 2026 check. The URLs below are planned destinations, not currently available demos. We will update this table when each workflow is released and verified.

| Tool | Start with | Workflow and output | Status |
| --- | --- | --- | --- |
| [Amazon Review Analyzer](https://www.nexscope.ai/tools/amazon-review-analyzer?utm_source=github&utm_medium=referral&utm_campaign=tools_launch&utm_content=tools_readme_reviews) | A competitor ASIN and marketplace | Analyze a recent 1–2 star review sample; download an AI report and source review CSV. | Coming soon |
| [SEO Keyword Planner](https://www.nexscope.ai/tools/seo-keyword-planner?utm_source=github&utm_medium=referral&utm_campaign=tools_launch&utm_content=tools_readme_keywords) | A seed keyword | Explore US English Google keyword metrics, look up Amazon US products, and request an AI competitor comparison report. | Coming soon |
| [Website SEO Auditor](https://www.nexscope.ai/tools/website-seo-auditor?utm_source=github&utm_medium=referral&utm_campaign=tools_launch&utm_content=tools_readme_auditor) | One public page URL | Inspect page SEO evidence and separately request a mobile Lighthouse check. | Coming soon; service verification pending |

These are hosted Nexscope workflows. This repository contains documentation and support resources; it does not contain the hosted application's source code or a self-hostable implementation.

## What can these workflows help you do?

### Investigate competitor complaints

Use a recent low-star review sample to identify issues worth investigating, such as materials, fit, packaging, or product expectations. Read the original reviews before accepting an AI suggestion. The sample does not establish total review counts, product authenticity, or a defect rate.

### Explore keywords and competing products

Research Google keywords, then explicitly request matching Amazon US products and an AI comparison. Google search volume is not Amazon search volume. Product sales and revenue figures, when available, are provider estimates. Missing data remains unknown.

### Inspect a website page

Review one URL's collected SEO evidence and, separately, a mobile Lighthouse lab result. This is not a whole-site crawl or a guarantee of rankings. The complete live audit workflow is still awaiting service verification.

## Free credits

New users receive **1,000 free credits** to get started with Nexscope. Available actions and credit usage depend on the tool and your account access. Check your account for the current balance and applicable terms. Trial credits do not imply unlimited usage or access to every API.

## Official support and feature requests

**Have a question, found a bug, or need a feature? [Open an issue](https://github.com/nexscope-ai/ecommerce-ai-tools/issues/new/choose).**

The official Nexscope team reviews reports and feature requests, responds as quickly as possible, and follows up on progress toward a resolution. Tell us which tool you used, what you expected, and what happened. For a feature request, explain the problem you want to solve.

Please do not post passwords, API keys, access tokens, private customer data, or unredacted account screenshots. For private account or billing questions, contact [service@nexscope.ai](mailto:service@nexscope.ai).

See [our support process](SUPPORT.md). Requests are reviewed by the team; an issue does not guarantee a feature will be built or set an immediate resolution deadline.

## APIs and agent skills

- [Nexscope Ecommerce API](https://github.com/nexscope-ai/nexscope-ecommerce-api): API documentation and request examples.
- [Amazon Skills](https://github.com/nexscope-ai/Amazon-Skills): agent skills for Amazon seller workflows.
- [Ecommerce SEO and GEO Skills](https://github.com/nexscope-ai/ecommerce-seo-geo-skills): ecommerce search and content workflows.

Maintained by the official Nexscope team. Amazon and Google are trademarks of their respective owners; no affiliation or endorsement is implied.
