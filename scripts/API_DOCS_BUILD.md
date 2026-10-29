# Build the Data API square

Requirements: Node.js 22.18+ or Node.js 24. No npm packages or API key.

Refresh the public Data API directory snapshot from the trusted local web publication (read-only):

```sh
node scripts/build_api_docs.mjs --web-root ../web
node --test scripts/test_build_api_docs.mjs
```

Only customer-facing directory fields are exported. Schemas, credentials, proxy metadata and non-Data APIs are not included.

The root Learn repository checks out this repository on each deployment and calls `buildRoot`. It cleans `dist/client/api/`, generates only `/api/index.html` plus CSS and JavaScript, and adds only `/api/` to the root sitemap. Cards link directly to the matching official online tester with `co-from=learn#online-test`. There are no local API details or quick-start pages.

The learning-library build generates only the legacy `/ecommerce-ai-tools/api/` redirect to `/api/`; this redirect is excluded from its sitemap. Static GitHub Pages redirects cannot return HTTP 301.

To publish directory changes, deploy this repository, then redeploy the root Learn repository. Keep manual files outside the exclusively generated output directories.
