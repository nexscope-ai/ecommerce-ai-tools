# Build the Data API square

Requirements: Node.js 22.18+ or Node.js 24. No npm packages or API key.

Refresh the public Data API directory snapshot from the trusted local web publication (read-only):

```sh
node scripts/build_api_docs.mjs --web-root ../web
node --test scripts/test_build_api_docs.mjs
```

Only customer-facing directory fields are exported. Schemas, credentials, proxy metadata and non-Data APIs are not included.

The root Learn repository checks out this repository on each deployment and calls `buildRoot`. It cleans `dist/client/data/`, generates the Data category square and category pages, and adds their canonical URLs to the root sitemap. Cards link to official API detail pages with `co-from=learn`. No local API detail pages are generated.

The learning-library build generates only the legacy `/ecommerce-ai-tools/api/` redirect to `/data/`; this redirect is excluded from its sitemap. Static GitHub Pages redirects cannot return HTTP 301.

To publish directory changes, deploy this repository, then redeploy the root Learn repository. Keep manual files outside the exclusively generated output directories.

## Current directory structure

`/data/` lists Data API categories; `/data/<category>/` contains a short introduction and that category’s API cards. Cards open `https://www.nexscope.ai/api-docs/<slug>?co-from=learn` directly. No local API detail pages are generated. The root sitemap includes the square and category pages; `/api/` remains only a redirect. GA events `data_api_category_click` and `data_api_open` retain page/category/API context and original channel fields without internal UTMs.
