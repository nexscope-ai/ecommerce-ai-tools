/** Membership comes from the public catalog's explicit collection metadata. */
export const DATA_CATALOG = 'https://www.nexscope.ai/api/skill-api/catalog';
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const creativeCategories = new Set([
  'image-generation-models',
  'video-generation-models',
  'multimodal-ai',
]);
const excludedCollections = new Set(['marketing', 'social', 'creative', 'account']);
const includedCollections = new Set(['data', 'ecommerce']);

export function dataCollectionSlugs(membership) {
  if (membership?.collection !== 'ecommerce' || !Array.isArray(membership.slugs) || !membership.slugs.length
      || membership.slugs.some(value => typeof value !== 'string' || !slug.test(value))
      || new Set(membership.slugs).size !== membership.slugs.length) {
    throw new Error('Missing or invalid official E-commerce Data membership');
  }
  return new Set(membership.slugs);
}

function projectCatalogMembership(payload) {
  const data = payload?.data ?? payload;
  if (data?.source !== 'server' || !Array.isArray(data.skills) || !data.skills.length
      || !Array.isArray(data.categories)) {
    throw new Error('Official public API catalog is unavailable or malformed');
  }

  const seen = new Set();
  const skills = [];
  const categorySlugs = new Set();
  for (const item of data.skills) {
    const itemSlug = item?.slug;
    const categorySlug = item?.categorySlug;
    if (typeof itemSlug !== 'string' || !slug.test(itemSlug) || seen.has(itemSlug)) {
      throw new Error('Invalid or duplicate public API catalog slug');
    }
    if (typeof categorySlug !== 'string' || !slug.test(categorySlug)) {
      throw new Error('Public API catalog entry has no valid category');
    }
    seen.add(itemSlug);

    const collection = item.catalogMetadata?.collectionSlug;
    if (collection != null && typeof collection !== 'string') {
      throw new Error('Public API catalog has invalid collection metadata');
    }
    if (collection && !excludedCollections.has(collection) && !includedCollections.has(collection)) {
      throw new Error(`Unknown public API collection: ${collection}`);
    }

    const isEcommerceData = !excludedCollections.has(collection)
      && categorySlug !== 'social-data'
      && categorySlug !== 'account-apis'
      && !creativeCategories.has(categorySlug);
    if (isEcommerceData) {
      skills.push(item);
      categorySlugs.add(categorySlug);
    }
  }

  const categories = data.categories
    .filter(item => categorySlugs.has(item?.slug))
    .map(item => ({
      slug: item.slug,
      name: item.name,
      description: item.description ?? '',
    }));
  const result = {
    collection: 'ecommerce',
    slugs: skills.map(item => item.slug).sort(),
    skills,
    categories,
  };
  dataCollectionSlugs(result);
  return result;
}

// Keep support for the old server-rendered shape for callers with cached fixtures.
// Production refreshes now use the public catalog endpoint above.
function projectLegacyDirectoryMembership(html) {
  const script = html.match(/<script\b[^>]*\bid="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (!script) throw new Error('Official directory publication is unavailable');
  const page = JSON.parse(script[1])?.props?.pageProps;
  if (page?.catalogAvailable !== true || !Array.isArray(page._publicDirectoryFallback?.apis)
      || !Array.isArray(page.marketingGroups) || !Array.isArray(page.catalog?.skills)
      || !Array.isArray(page.catalog?.categories)) throw new Error('Incomplete official directory publication');
  const marketing = new Set(page.marketingGroups.flatMap(group => {
    if (!Array.isArray(group.skills)) throw new Error('Invalid official marketing partition');
    return group.skills.map(item => item.slug);
  }));
  const slugs = page._publicDirectoryFallback.apis
    .filter(item => item.platformSlug !== 'marketing' && item.platformSlug !== 'account' && !marketing.has(item.slug))
    .map(item => item.slug).sort();
  const eligible = new Set(slugs);
  const categories = new Map(page.catalog.categories.map(item => [item.slug, item]));
  for (const api of page._publicDirectoryFallback.apis) {
    if (!eligible.has(api.slug) || categories.has(api.categorySlug)) continue;
    const name = typeof api.categoryName === 'string' ? api.categoryName : api.categoryName?.en;
    if (typeof api.categorySlug === 'string' && slug.test(api.categorySlug) && typeof name === 'string' && name.trim()) {
      categories.set(api.categorySlug, { slug: api.categorySlug, name: name.trim(), description: '' });
    }
  }
  const result = { collection: 'ecommerce', slugs, skills: page.catalog.skills, categories: [...categories.values()] };
  dataCollectionSlugs(result);
  if (!Number.isSafeInteger(page.directoryCounts?.data) || page.directoryCounts.data !== slugs.length) {
    throw new Error('Official E-commerce Data count does not match its membership');
  }
  return result;
}

export function projectDirectoryMembership(publication) {
  return typeof publication === 'string'
    ? projectLegacyDirectoryMembership(publication)
    : projectCatalogMembership(publication);
}

export async function fetchDirectoryMembership(fetcher = fetch) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetcher(DATA_CATALOG, {
        redirect: 'error',
        signal: AbortSignal.timeout(25000),
        headers: { 'Cache-Control': 'no-cache', Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Official public API catalog HTTP ' + response.status);
      return projectDirectoryMembership(await response.json());
    } catch (error) {
      if (attempt === 1) throw error;
    }
  }
}
