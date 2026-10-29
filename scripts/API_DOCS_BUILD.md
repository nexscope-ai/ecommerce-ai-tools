# Build the Data API square

Requirements: Node.js 22.18+ or Node.js 24. No npm packages or API key.

Refresh the Data API directory from the official public catalog and published sitemap:

```sh
node scripts/build_api_docs.mjs --refresh
node --test scripts/test_build_api_docs.mjs
```

Only customer-facing directory fields are exported. Full schemas, credentials, proxy metadata and non-Data APIs are not included. Bounded input/output field descriptions and illustrative request examples are projected from the public contract; credential-like example fields are redacted.

The root Learn repository checks out this repository on each deployment, calls
`refreshSnapshot`, then calls `buildRoot`. Every root build fetches
`https://www.nexscope.ai/api/skill-api/catalog` and the official main-site sitemap.
Only server-backed, published Data API records survive; unavailable, withdrawn,
unpublished and non-Data entries are excluded. Network or validation failure stops
the build before clearing generated pages; it never silently publishes an old feed.
Reviewed public names are retained while availability, summaries and contracts refresh.
Unchanged projected content retains its existing modification date.

The build cleans `dist/client/data/`, generates the Data category square and category pages, and adds their canonical URLs to the root sitemap. Cards link to official API detail pages with `co-from=learn`. No local API detail pages are generated. Usage numbers remain the separately reviewed historical aggregate snapshot; the public catalog does not supply live usage counts. Newly added APIs without a metrics record show no invented usage counts.

For offline fixture/recovery work only, `node scripts/build_api_docs.mjs --web-root ../web`
can read the existing local web publication without running or changing that project.
The deployment path does not depend on the web repository.

## User-facing SEO and GEO

The root directory and each category have self-canonical titles and descriptions,
social metadata, visible selection guidance and four practical FAQs. JSON-LD uses
CollectionPage, ItemList, BreadcrumbList and FAQPage with the same visible content
and official API links. No ratings or private analytics are published. The sitemap
continues to list only canonical root/category pages. SEO markup does not guarantee
indexing, rich results, AI citations or traffic.

The learning-library build generates only the legacy `/ecommerce-ai-tools/api/` redirect to `/data/`; this redirect is excluded from its sitemap. Static GitHub Pages redirects cannot return HTTP 301.

To publish directory changes, deploy this repository, then redeploy the root Learn repository. Keep manual files outside the exclusively generated output directories.

## Current directory structure

`/data/` lists Data API categories; `/data/<category>/` contains a short introduction and that category’s API cards. Cards open `https://www.nexscope.ai/api-docs/<slug>?co-from=learn` directly. No local API detail pages are generated. The root sitemap includes the square and category pages; `/api/` remains only a redirect. GA events `data_api_category_click` and `data_api_open` retain page/category/API context and original channel fields without internal UTMs.

## Discovery controls

The root directory provides platform chips, Categories / All APIs views, and keyword search across every public Data API. Category pages retain local API search. Cards show the platform logo, API name and description without inline parameter panels or examples. Users open the official documentation for technical details; no local API detail routes are added. Search terms are not sent in custom analytics events. Platform selections have dedicated events in addition to existing category and outbound attribution.

Inline INPUT/OUTPUT labels and expandable examples have been removed from both category cards and global API search results. Existing navigation, platform filters, search, outbound attribution and click events remain active.
# Public usage snapshot

`scripts/data/api-usage.public.json` contains only approved aggregate counts,
embedded during the static build; no runtime statistics API or credentials are used.
The snapshot exported on 2026-10-29 covers all retained historical requests,
including test/deleted accounts, all invocation types and all request statuses.
It is not a success-only or production-customer statistic.

The exported CSVs identify APIs by canonical `api_slug`. The 233 current Data
APIs match 176 rows and contain 89,220 recorded requests. The other 57 canonical
slugs have no retained records in this exhaustive export and display zero;
historical aliases/shared proxy traffic are not estimated or redistributed.
The source's global 105,076 calls includes APIs outside this directory.
Users are distinct recorded users per API, excluding anonymous calls. Category
calls sum only listed APIs. Category users sum per-API user counts, as requested;
the tooltip clarifies that users of multiple APIs may count more than once.
This total is not the distinct union of users across a category. Missing per-API
counts keep the category user total unknown rather than showing an incomplete sum.

Cards and categories sort by calls descending, preserving original order for
ties. Replace the aggregate snapshot to refresh counts and its publication date.
