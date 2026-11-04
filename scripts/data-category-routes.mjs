// Public URLs describe tasks; source category IDs remain stable for API contracts
// and analytics. Previously published paths are retained as direct aliases.
export const categoryRouteSlugs = Object.freeze({
  'data-ss': 'amazon-market-research',
  'data-kp': 'amazon-price-history',
  'data-js': 'amazon-keyword-sales-research',
  'data-jm': 'amazon-niche-research',
  'data-st': 'amazon-product-discovery',
  'data-sf-search-intelligence': 'amazon-asin-keywords',
  'data-fm-tiktok': 'tiktok-product-discovery',
  'data-cj-tiktok': 'tiktok-commerce-research',
  'data-et-tiktok': 'tiktok-product-seller-lookup',
  'data-kd-tiktok': 'tiktok-shop-analytics',
  'data-gb-temu': 'temu-product-keyword-research',
  'data-sr-ozon': 'ozon-keyword-market-research',
  'data-mp-ozon': 'ozon-product-seller-research',
  'data-st-walmart': 'walmart-keyword-research',
  'data-zy-patent': 'patent-search',
  'data-rg-ip-detection': 'ip-risk-screening',
  'data-md-product-tro-detection': 'product-tro-risk-screening',
});

const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function legacyPath(category) {
  if (!slug.test(category)) throw new Error(`Invalid Data category: ${category}`);
  return `/data/${category.replace(/^data-/, '')}/`;
}
export function categoryPath(category) {
  const previous = legacyPath(category);
  const mapped = Object.hasOwn(categoryRouteSlugs, category) ? categoryRouteSlugs[category] : null;
  return mapped ? `/data/${mapped}/` : previous;
}

export function categoryRedirects(categories) {
  const paths = new Map();
  const redirects = new Map();
  for (const category of new Set(categories)) {
    const target = categoryPath(category);
    if (paths.has(target)) throw new Error(`Duplicate category route: ${target}`);
    paths.set(target, category);
    const previous = legacyPath(category);
    if (previous !== target) redirects.set(previous, target);
  }
  for (const previous of redirects.keys()) {
    if (paths.has(previous)) throw new Error(`Category alias conflicts with canonical route: ${previous}`);
  }
  return redirects;
}

export function renderCategoryRedirect(target) {
  if (!/^\/data\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(target)) throw new Error(`Invalid Data redirect: ${target}`);
  return `<!doctype html><html lang="en" data-legacy-redirect><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="https://learn.nexscope.ai${target}"><title>Page moved | Nexscope</title><script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script></head><body><p>This category has moved to <a href="${target}">${target}</a>.</p></body></html>`;
}
