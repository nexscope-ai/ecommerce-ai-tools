/** Membership comes from the published E-commerce Data tab, never category spelling. */
export const DATA_DIRECTORY = 'https://www.nexscope.ai/api-docs?tab=data';
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function dataCollectionSlugs(membership) {
  if (membership?.collection !== 'ecommerce' || !Array.isArray(membership.slugs) || !membership.slugs.length
      || membership.slugs.some(value => typeof value !== 'string' || !slug.test(value))
      || new Set(membership.slugs).size !== membership.slugs.length) {
    throw new Error('Missing or invalid official E-commerce Data membership');
  }
  return new Set(membership.slugs);
}

export function projectDirectoryMembership(html) {
  const script = html.match(/<script\b[^>]*\bid="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (!script) throw new Error('Official directory publication is unavailable');
  const page = JSON.parse(script[1])?.props?.pageProps;
  if (page?.catalogAvailable !== true || !Array.isArray(page._publicDirectoryFallback?.apis)
      || !Array.isArray(page.marketingGroups) || !Array.isArray(page.catalog?.skills)
      || !Array.isArray(page.catalog?.categories)) throw new Error('Incomplete official directory publication');
  // Same partition used by the main-site E-commerce Data tab. Its directory
  // already excludes Video & Image; marketing membership is supplied by that site.
  const marketing = new Set(page.marketingGroups.flatMap(group => {
    if (!Array.isArray(group.skills)) throw new Error('Invalid official marketing partition');
    return group.skills.map(item => item.slug);
  }));
  const slugs = page._publicDirectoryFallback.apis
    .filter(item => !['marketing','account'].includes(item.platformSlug) && !marketing.has(item.slug))
    .map(item => item.slug).sort();
  const categorySlugs=new Set(page.catalog.categories.map(category=>category.slug));
  const groupCategories=(page.selectorGroups??[]).filter(group=>!categorySlugs.has(group.slug)).map(group=>({slug:group.slug,name:group.name}));
  const result = { collection: 'ecommerce', slugs, skills: page.catalog.skills, categories: [...page.catalog.categories,...groupCategories] };
  dataCollectionSlugs(result);
  if (!Number.isSafeInteger(page.directoryCounts?.data) || page.directoryCounts.data !== slugs.length) {
    throw new Error('Official E-commerce Data count does not match its membership');
  }
  return result;
}

export async function fetchDirectoryMembership(fetcher = fetch) {
  for (let attempt=0;attempt<2;attempt++) {
    try {
      const response = await fetcher(DATA_DIRECTORY, { redirect: 'error', signal: AbortSignal.timeout(25000), headers: { 'Cache-Control': 'no-cache' } });
      if (!response.ok) throw new Error('Official directory publication HTTP ' + response.status);
      return projectDirectoryMembership(await response.text());
    } catch (error) { if (attempt===1) throw error; }
  }
}
