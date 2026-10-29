# Build the public API reference

Requirements: Node.js 22.18+ (or Node.js 24). No npm dependencies or API key.

Generate the Jekyll source pages from the checked-in public contract snapshot:

```sh
node scripts/build_api_docs.mjs
ruby -S jekyll build --source docs --destination _site
python scripts/attribute_outbound_links.py _site
python scripts/finalize_learning_site.py _site --api-snapshot scripts/data/api-docs.public.json
```

The Pages workflow runs the generator before Jekyll and adds the resulting canonical pages to the existing sitemap. Output lives in `docs/api-docs/` and is ignored by Git. Every build validates its input, verifies ownership of this directory, deletes the previous generated directory, and regenerates all pages. This removes retired APIs and orphan files, including files absent from the old manifest. Keep manually maintained content outside this generated directory. Other documentation directories are not cleaned.

The sitemap is rebuilt from rendered canonical HTML, just like the generated product detail pages. Deployment fails if an expected API page is missing or a retired API remains in the sitemap. API `lastmod` uses the contract publication timestamp, not each deployment time.

Refresh after the web project's normal API documentation publication has completed:

```sh
node scripts/build_api_docs.mjs --web-root ../web
node --test scripts/test_build_api_docs.mjs
```

This reads `src/generated/skill-api-docs.publication.generated.ts` without modifying web or invoking its build. Use only a trusted local checkout: the generated TypeScript module is evaluated to expand its deduplicated records. The snapshot exports an allowlist of public contract fields, rejects literal Nexscope key values, and omits proxy details, MCP contracts and environment settings. Review the snapshot diff before publishing. CI uses the reviewed snapshot, not the sibling repository or a live API.

The API reference is served at `/ecommerce-ai-tools/api/`, with an index, quick start and one page per published API slug. Examples describe the published contract; they do not claim that live calls were executed. Conditional and nested requirements remain available in the full JSON schemas. Incomplete upstream examples are not presented as runnable requests.

The directory supports client-side keyword and category filters over server-built HTML. Each API has a separate static page at `/api/<slug>/`. Both directory cards and detail pages link to `https://www.nexscope.ai/api-docs/<slug>?co-from=learn#online-test`, which selects the official online tester. No API request or key entry is performed on the learning site.
