/** Build public REST documentation. Refresh reads web artifacts; never runs its build. */
import { readFile, writeFile, mkdir, readdir, rm, lstat, realpath } from 'node:fs/promises';
import { resolve, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { createHash } from 'node:crypto';
import { loadUsage, applyUsage, compareUsage } from './data-api-usage.mjs';
import { selectionCopy, selectionHelp, directorySchema } from './data-api-seo.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT = join(ROOT, 'scripts/data/api-docs.public.json');
const OUTPUT = join(ROOT, 'docs/api-docs');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const API_ORIGIN = 'https://api.nexscope.ai';
// Marketplace and research contracts include older category names alongside
// the newer data-* taxonomy. Keep generation/routing/account/SEO APIs out.
const LEGACY_DATA_CATEGORIES = new Set(['amazon-advertising','amazon-marketplace-intelligence','patent-ip-risk','product-market-research']);
const isDataCategory = category => typeof category === 'string' && (category.startsWith('data-') || LEGACY_DATA_CATEGORIES.has(category));
const clean = value => String(value ?? '').replace(/[^.!?\n]*\bMCP\b[^.!?\n]*[.!?]?/gi, '').trim();
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value, null, 2);
export const officialApiUrl = slug => `https://www.nexscope.ai/api-docs/${encodeURIComponent(slug)}?co-from=learn`;
const sensitiveField = /(?:authorization|password|secret|token|api[_-]?key|credential)/i;
function schemaFields(schema) {
  if (Array.isArray(schema?.fields)) return schema.fields;
  const required = new Set(schema?.required || []);
  return Object.entries(schema?.properties || {}).map(([name,field])=>({name,description:field.description || '',required:required.has(name)}));
}
function publicExample(value, depth = 0) {
  if (depth > 3) return '[See full example in official docs]';
  if (Array.isArray(value)) return value.slice(0,2).map(v=>publicExample(v,depth+1));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).slice(0,12).map(([key,item])=>[key,sensitiveField.test(key)?'[YOUR_CREDENTIAL]':publicExample(item,depth+1)]));
  return typeof value === 'string' ? value.slice(0,300) : value;
}
function previewContract(record,skill) {
  const request = record.requestSchema || skill.requestSchema;
  const response = record.responseSchema || skill.responseSchema;
  const inputs = schemaFields(request).sort((a,b)=>Number(b.required)-Number(a.required)).slice(0,12).map(f=>({name:f.name,required:Boolean(f.required),description:clean(f.description)}));
  const metadata = new Set(['code','msg','message','columns','costToken','cost','traceId','ts','time','total','data','type']);
  const outputs = schemaFields(response?.properties?.data?.items || response?.properties?.data || response).filter(f=>!metadata.has(f.name)).slice(0,12).map(f=>({name:f.name,description:clean(f.description)}));
  const example = record.requestExample || skill.requestExample;
  return {inputs,outputs,...(example && Object.keys(example).length ? {requestExample:publicExample(example)} : {})};
}
function apiPath(value) {
  if (value?.startsWith(API_ORIGIN + '/')) {
    const url = new URL(value);
    return url.pathname + url.search;
  }
  return value;
}

// Export only customer-facing contract fields. No environment files, credentials,
// proxy metadata, MCP contracts, internal counters or execution-only slugs.
export function project(publication) {
  const entries = publication.apiSlugs.flatMap(slug => {
    if (!SLUG.test(slug)) throw new Error(`Unsafe API slug: ${slug}`);
    const model = publication.apiDetailsBySlug[slug];
    const record = model?.route?.record;
    if (!record) throw new Error(`Missing published contract: ${slug}`);
    const skill = model.catalog.skills.find(item => item.slug === slug) || {};
    if (model.route.kind !== 'upstream-skill' || !isDataCategory(skill.categorySlug)) return [];
    const account = model.route.kind === 'account-doc';
    const path = apiPath(account ? record.path : skill.endpoint || record.endpoint);
    if (!path?.startsWith('/') || path.startsWith('//') || /[\s"'<>]/.test(path)) throw new Error(`Invalid public endpoint: ${slug}`);
    const category = model.catalog.categories.find(c => c.slug === skill.categorySlug);
    const group = category?.name || 'Marketplace data';
    const entry = {
      slug, name: clean(skill.name || record.name), description: clean(record.description || skill.description),
      group, categoryDescription: clean(category?.description), categorySlug: skill.categorySlug, method: record.run?.method || 'POST', path, preview:previewContract(record,skill),
    };
    return [entry];
  });
  const result = { schemaVersion: 1, scope: 'data', generatedAt: publication.generatedAt, entries };
  validate(result);
  return result;
}

export function validate(snapshot) {
  if (snapshot.schemaVersion !== 1 || snapshot.scope !== 'data' || !snapshot.entries?.length) throw new Error('Empty or unsupported Data API publication');
  const seen = new Set();
  for (const e of snapshot.entries) {
    if (!SLUG.test(e.categorySlug) || !isDataCategory(e.categorySlug)) throw new Error(`Non-data API is not allowed: ${e.slug}`);
    if (!SLUG.test(e.slug) || ['index','quickstart'].includes(e.slug) || seen.has(e.slug) || !e.name || !e.path?.startsWith('/') || e.path.startsWith('//') || /[\s"'<>]/.test(e.path) || !['GET','POST','PUT','PATCH','DELETE'].includes(e.method)) throw new Error(`Invalid API entry: ${e.slug}`);
    seen.add(e.slug);
  }
  // Keys such as token/password may legitimately be schema field definitions.
  // Reject literal credential values instead of hiding public schema parameters.
  if (/\bnk-[a-zA-Z0-9]{12,}\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(json(snapshot))) throw new Error('Credential-like value in public API snapshot');
}

function page(title, description, slug, body) {
  return `---\nlayout: api-reference\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\npermalink: /data/${slug ? slug + '/' : ''}\nlearning_topic: agents\napi_directory: ${!slug}\n---\n{% raw %}\n${body}\n{% endraw %}\n`.replaceAll(/href="(\{\{[^\n]+?\}\})"/g, 'href="{% endraw %}$1{% raw %}"');
}

function categoryVisual(category) {
  if (['data-sf-search-intelligence','data-ss','data-js','data-st','data-jm','data-kp'].includes(category)) category = 'amazon';
  if (category === 'product-market-research') category = 'mercado';
  const platforms = [
    ['1688','1688','1688','#d66b10','#fff2e5'], ['amazon','Amazon','a','#bd7614','#fff4df'],
    ['tiktok','TikTok','♪','#27334d','#edf0f8'], ['ebay','eBay','e','#2765bd','#eaf2ff'],
    ['etsy','Etsy','E','#bc5a2b','#fff0e8'], ['shopify','Shopify','S','#497b32','#eef5e7'],
    ['temu','Temu','T','#cb661b','#fff1e5'], ['walmart','Walmart','W','#266da9','#eaf4fc'],
    ['google','Google','G','#397555','#edf6f0'], ['web-search','Web search','↗','#5678ae','#edf2fb'],
    ['shopee','Shopee','S','#ce572e','#fff0e9'], ['ozon','Ozon','O','#3865cb','#edf1ff'],
    ['mercado','Mercado Libre','M','#94731d','#fff8d6'],
    ['patent','IP research','IP','#7755ae','#f2ecfa'], ['detection','Risk research','IP','#7755ae','#f2ecfa'],
  ];
  const match=platforms.find(([token])=>category.includes(token));
  const [,label,mark,color,soft]=match || ['', 'Data API','D','#7050c5','#f1edfb'];
  const logos = {'1688':'1688.webp',amazon:'amazon.webp',tiktok:'tiktok.webp',ebay:'ebay.webp',etsy:'etsy.webp',shopify:'shopify.webp',temu:'temu.webp',walmart:'walmart.webp',google:'google.webp',shopee:'shopee.webp',ozon:'ozon.webp',mercado:'mercado-libre.png'};
  return {label,mark,color,soft,logo:logos[match?.[0]],kind:match?.[0] || 'data'};
}
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function cardTop(category,badge) {
  const visual=categoryVisual(category);
  const symbols = {
    'web-search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M10.5 4v13M4 10.5h13"/>',
    patent:'<path d="M7 3h7l4 4v14H7zM14 3v5h5M10 12h5M10 16h5"/>',
    detection:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',
    data:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  };
  const icon = visual.logo ? `<img src="/data/logos/${visual.logo}" alt="" width="40" height="40" loading="lazy" decoding="async">` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${symbols[visual.kind] || symbols.data}</svg>`;
  return `<div class="api-card-top"><span class="api-category-icon${visual.logo ? ' api-category-icon--brand' : ''}" aria-hidden="true">${icon}</span><span class="api-count-badge">${esc(badge)}</span></div>`;
}
function cardStyle(category) {
  const visual=categoryVisual(category);
  return `--card-accent:${visual.color};--card-soft:${visual.soft}`;
}
function categoryCopy(category,entries) {
  const legacyNames={'amazon-advertising':'Amazon Advertising','amazon-marketplace-intelligence':'Amazon Marketplace Intelligence','patent-ip-risk':'Design Registration Research','product-market-research':'Product & Market Research'};
  const name=legacyNames[category] || entries[0].group;
  const topics=entries.slice(0,3).map(e=>e.name.replace(/ API$/,'')).join(', ');
  return {name,description:`Explore ${topics}${entries.length>3?', and more':''}.`};
}

export function categoryPath(category) { return `/data/${category.replace(/^data-/, '')}/`; }
function searchControls(label, unit, total, root = false) {
  return `<div class="api-filters api-filters--search" data-api-filters hidden><div><label for="api-search">${label}</label><div class="api-search-row"><input type="search" id="api-search" placeholder="${root?'Try Amazon reviews, TikTok products, or 1688 suppliers…':'Search this category by API name or keyword…'}" autocomplete="off"><button type="button" data-clear-search hidden>Clear</button></div></div></div><p data-api-count data-unit="${unit}" role="status" aria-live="polite">${total} ${unit === 'category' ? 'categories' : 'APIs'} available</p><div class="api-empty" data-api-empty hidden><h2>No matches found</h2><p>Try fewer words or choose another platform.</p><button type="button" data-reset-filters>Reset filters</button></div>`;
}
function usageMarkup(metrics) {
  const full = value => new Intl.NumberFormat('en').format(value);
  const calls = metrics?.callCount, users = metrics?.userCount;
  const icon = body => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const activity = icon('<path d="M3 12h4l3-8 4 16 3-8h4"/>');
  const people = icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>');
  const coins = icon('<ellipse cx="9" cy="6" rx="6" ry="3"/><path d="M3 6v4c0 1.66 2.69 3 6 3m-6-3v4c0 1.66 2.69 3 6 3m0-11v4m6-4v3"/><ellipse cx="15" cy="12" rx="6" ry="3"/><path d="M9 12v6c0 1.66 2.69 3 6 3s6-1.34 6-3v-6m-12 3c0 1.66 2.69 3 6 3s6-1.34 6-3"/>');
  const metric = (value,label,symbol,threshold,capped) => `<span class="api-usage-metric" title="${full(value)} ${label}" aria-label="${full(value)} ${label}">${symbol}<strong>${value > threshold ? capped : full(value)}</strong></span>`;
  const userLabel = metrics?.userCountBasis === 'sum' ? 'summed API users; users of multiple APIs count more than once' : 'distinct API users';
  const hasRange = metrics?.creditMin != null;
  const range = hasRange ? (metrics.creditMin === metrics.creditMax ? full(metrics.creditMin) : `${full(metrics.creditMin)}～${full(metrics.creditMax)}`) : '—';
  const coverage = metrics?.creditTotalApis ? ` Across ${metrics.creditKnownApis} of ${metrics.creditTotalApis} APIs with positive charge records.` : '';
  const creditLabel = hasRange ? `${range} historical credits per successful call; positive actual charges only, not a current price quote.${coverage}` : 'Historical credit range unavailable; no verified positive charge records. Check official API docs for current pricing.';
  const credits = `<span class="api-usage-metric api-credit-range" title="${esc(creditLabel)}" aria-label="${esc(creditLabel)}">${coins}<strong>${range}</strong></span>`;
  return `<div class="api-usage" aria-label="Recorded usage and historical credit range">${calls != null ? metric(calls,'recorded calls',activity,10000,'9999+') : ''}${users != null ? metric(users,userLabel,people,100,'99+') : ''}${credits}</div>`;
}
function usageNote(snapshot) {
  const credits = snapshot.creditUpdatedAt ? `<p class="api-usage-note">Credit ranges · Updated ${esc(snapshot.creditUpdatedAt.slice(0,10))}. Recorded positive charges for successful calls, not a current price quote. Category ranges cover APIs with charge records. Check official documentation for current costs; — means no recorded range.</p>` : '';
  return (snapshot.usageUpdatedAt ? `<p class="api-usage-note">All-time recorded usage · Updated ${esc(snapshot.usageUpdatedAt.slice(0,10))}. Includes test accounts and all request statuses. Categories sum calls and users across listed APIs; a user of multiple APIs may count more than once.</p>` : '') + credits;
}
function renderOperation(e, category, name) {
  const contract=e.preview || {};
  const content=`<a class="api-main-link" href="${officialApiUrl(e.slug)}" data-track="start_using" data-data-category="${esc(category)}" data-api-slug="${esc(e.slug)}">${cardTop(category,e.method)}<div class="api-card-content"><span class="api-platform-label">${esc(name)}</span><h3>${esc(e.name)}</h3><p>${esc(e.description)}</p></div><div class="api-card-actions"><span class="api-card-cta">View API docs <span aria-hidden="true">↗</span></span>${usageMarkup(e.usage)}</div></a>`;
  return `<article class="api-card api-operation-card" style="${cardStyle(category)}" data-platform="${esc(categoryVisual(category).kind)}" data-api-search="${esc([e.name,e.slug,e.path,e.description,name,...(contract.inputs||[]).map(f=>f.name)].join(' ').toLowerCase())}">${content}</article>`;
}
export function buildPages(snapshot) {
  validate(snapshot);
  const orderedEntries = [...snapshot.entries].sort((a,b)=>compareUsage(a.usage,b.usage));
  const groups = new Map([...Map.groupBy(orderedEntries,e=>e.categorySlug)].sort(([a],[b])=>compareUsage(snapshot.categoryUsage?.[a],snapshot.categoryUsage?.[b])));
  const pages = new Map();
  const categories = [];
  const operations = [];
  const routes = new Set();
  const platforms = new Map();
  for (const [category, entries] of groups) {
    const route = categoryPath(category);
    if (routes.has(route)) throw new Error(`Duplicate category route: ${route}`);
    routes.add(route);
    const visual=categoryVisual(category);
    const previous=platforms.get(visual.kind);
    platforms.set(visual.kind,{...visual,count:(previous?.count||0)+entries.length});
    const {name,description} = categoryCopy(category,entries);
    const copy=selectionCopy(name,entries,visual.kind);
    const card = `<a class="api-card api-category-card" style="${cardStyle(category)}" href="${route}" data-data-category="${esc(category)}" data-platform="${esc(visual.kind)}" data-api-search="${esc([name,category,description,...entries.map(e=>e.name)].join(' ').toLowerCase())}">${cardTop(category,`${entries.length} ${entries.length === 1 ? "API" : "APIs"}`)}<div class="api-card-content"><span class="api-platform-label">${esc(visual.label)}</span><h3>${esc(name)}</h3><p>${esc(description)}</p></div><div class="api-card-actions"><span class="api-card-cta">Explore category <span aria-hidden="true">→</span></span>${usageMarkup(snapshot.categoryUsage?.[category])}</div></a>`;
    categories.push(card);
    const cards=entries.map(e=>renderOperation(e,category,name)).join('');
    operations.push(...entries.map(e=>({entry:e,html:renderOperation(e,category,name)})));
    const content = `<nav aria-label="Breadcrumb"><a href="/data/">Data API categories</a> / ${esc(name)}</nav><p class="api-eyebrow">Nexscope Data APIs</p><h1>${esc(name)}</h1><p>${esc(copy.summary)}</p><p>${esc(description)}</p><p class="api-caption">Access and credit requirements vary by operation.</p><div data-data-directory data-directory-kind="category">${searchControls('Find an API','API',entries.length)}<section data-results-kind="apis" data-api-group="${esc(name)}"><h2 class="api-directory-title">Explore ${esc(name)} APIs</h2><div class="api-directory">${cards}</div></section></div>${selectionHelp(copy)}${usageNote(snapshot)}`;
    pages.set(`${category}.md`,page(`${name} APIs | Nexscope`,`${name} APIs for ecommerce research. Compare ${entries.length} operations, review marketplace coverage and credit requirements, and open the official online tester.`,route.slice('/data/'.length,-1),content));
  }
  const chips=`<div class="api-platform-filters" role="group" aria-label="Filter by platform" data-platform-filters hidden><button type="button" data-platform-filter="" aria-pressed="true">All platforms <span>${snapshot.entries.length}</span></button>${[...platforms].sort(([,a],[,b])=>b.count-a.count).map(([key,visual])=>`<button type="button" data-platform-filter="${esc(key)}" aria-pressed="false">${visual.logo?`<img src="/data/logos/${visual.logo}" alt="" width="20" height="20">`:''}${esc(visual.label)} <span>${visual.count}</span></button>`).join('')}</div>`;
  const switcher=`<div class="api-view-switch" role="group" aria-label="Browse directory" data-view-switch hidden><button type="button" data-directory-view="categories" aria-pressed="true">Categories <span>${groups.size}</span></button><button type="button" data-directory-view="apis" aria-pressed="false">All APIs <span>${snapshot.entries.length}</span></button></div>`;
  const rootCopy=selectionCopy('Ecommerce Data',orderedEntries);
  const content = `<p class="api-eyebrow">Nexscope Data API directory</p><h1>Ecommerce Data APIs</h1><p>${esc(rootCopy.summary)}</p><p>Browse ${snapshot.entries.length} APIs across ${groups.size} categories.</p><div data-data-directory data-directory-kind="root">${chips}${searchControls('Search all APIs','category',groups.size,true)}${switcher}<section data-results-kind="categories" data-api-group="Categories"><div class="api-directory">${categories.join('')}</div></section><section data-results-kind="apis" data-api-group="APIs" hidden><div class="api-directory">${operations.sort((a,b)=>compareUsage(a.entry.usage,b.entry.usage)).map(item=>item.html).join('')}</div></section></div>${selectionHelp(rootCopy)}${usageNote(snapshot)}`;
  return new Map([['index.md',page('Ecommerce Data APIs for Developers & AI Agents | Nexscope','Explore Nexscope ecommerce Data APIs for Amazon, TikTok, 1688 and more. Compare operations by platform and open official documentation and online testing.','',content)],...pages]);
}

export function renderStandalone(source, snapshot) {
  const title = JSON.parse(source.match(/^title: (.+)$/m)[1]);
  const description = JSON.parse(source.match(/^description: (.+)$/m)[1]);
  const path = source.match(/^permalink: (.+)$/m)[1];
  const modifiedAt = [snapshot.generatedAt,snapshot.usageUpdatedAt,snapshot.creditUpdatedAt].filter(Boolean).sort((a,b)=>Date.parse(b)-Date.parse(a))[0];
  const category=path==='/data/' ? null : snapshot.entries.find(e=>categoryPath(e.categorySlug)===path)?.categorySlug;
  const selected=[...snapshot.entries.filter(e=>!category||e.categorySlug===category)].sort((a,b)=>compareUsage(a.usage,b.usage));
  const groups=new Map([...Map.groupBy(snapshot.entries,e=>e.categorySlug)].sort(([a],[b])=>compareUsage(snapshot.categoryUsage?.[a],snapshot.categoryUsage?.[b])));
  const items=category ? selected.map(e=>({name:e.name,url:officialApiUrl(e.slug)})) : [...groups].map(([key,entries])=>({name:categoryCopy(key,entries).name,url:'https://learn.nexscope.ai'+categoryPath(key)}));
  const copy=selectionCopy(category?categoryCopy(category,selected).name:'Ecommerce Data',selected,category?categoryVisual(category).kind:'root');
  const schema=directorySchema({title,description,path,modifiedAt,items,faqs:copy.faqs});
  const body = source.slice(source.indexOf('{% raw %}') + '{% raw %}'.length).replace(/\{% (?:endraw|raw) %\}/g, '');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://learn.nexscope.ai${path}"><meta name="robots" content="index,follow,max-image-preview:large"><meta property="og:type" content="website"><meta property="og:site_name" content="Nexscope Learn"><meta property="og:locale" content="en_US"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="https://learn.nexscope.ai${path}"><meta property="article:modified_time" content="${esc(modifiedAt)}"><script type="application/ld+json">${schema}</script><link rel="stylesheet" href="/data/api-reference.css${snapshot.assetVersions?.css ? `?v=${snapshot.assetVersions.css}` : ''}"></head><body class="api-root"><header class="api-root-header"><a href="/" aria-label="Nexscope Learn home"><img src="/logo.png" alt="Nexscope" width="166" height="40"></a><nav aria-label="Main navigation"><a href="/tools/">Tools</a><a href="/ecommerce-ai-tools/product-showcase/">Product Gallery</a><a href="/ecommerce-ai-tools/">Learning library</a><a href="/data/" aria-current="${path==='/data/'?'page':'location'}">Data APIs</a></nav></header><main class="api-reference">${body}</main><footer class="api-root-footer"><a href="/data/">Data API documentation</a> · <a href="/ecommerce-ai-tools/community/">Community</a> · <a href="https://www.nexscope.ai/?co-from=learn">Explore Nexscope ↗</a></footer><script src="/data/api-directory.js${snapshot.assetVersions?.js ? `?v=${snapshot.assetVersions.js}` : ''}" defer></script></body></html>`;
}

async function cleanGenerated(output) {
  output = resolve(output);
  if (dirname(output) === output || output === ROOT || ROOT.startsWith(output + sep)) throw new Error('Refusing to clean a repository ancestor or filesystem root');
  await mkdir(output,{recursive:true});
  if ((await lstat(output)).isSymbolicLink() || (await realpath(output)).toLowerCase() !== output.toLowerCase()) throw new Error('Refusing to clean a redirected documentation directory');
  const marker = join(output,'.api-docs-generated');
  const existing = await readdir(output);
  if (existing.length && !existing.includes('.api-docs-generated')) throw new Error('Refusing to overwrite an unmanaged documentation directory');
  if (existing.length && !(await lstat(marker)).isFile()) throw new Error('Invalid documentation ownership marker');
  // This absolute, verified directory is exclusively generated output. Start
  // fresh so removed APIs and orphan files cannot survive a later deployment.
  await rm(output,{recursive:true,force:true});
  await mkdir(output,{recursive:true});
  await writeFile(marker,'[]');
  return output;
}

export async function build(snapshot, output = OUTPUT) {
  const pages = buildPages(snapshot);
  output = await cleanGenerated(output);
  const target = 'https://learn.nexscope.ai/data/';
  const redirect = `---\nlayout: null\npermalink: /api/\nsitemap: false\n---\n<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"><title>Data API categories | Nexscope</title></head><body><a href="${target}">Explore Data API categories</a><script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script></body></html>`;
  await writeFile(join(output,'index.md'),redirect);
  await writeFile(join(output,'.api-docs-generated'),JSON.stringify(['index.md']));
  return 1;
}

export async function buildRoot(snapshot, output, usage) {
  snapshot = applyUsage(snapshot, usage || await loadUsage(join(ROOT,'scripts/data/api-usage.public.json')));
  const assetVersion = async path => createHash('sha256').update(await readFile(join(ROOT,path))).digest('hex').slice(0,12);
  snapshot = {...snapshot,assetVersions:{css:await assetVersion('docs/assets/css/api-reference.css'),js:await assetVersion('docs/assets/api-directory.js')}};
  const pages = buildPages(snapshot);
  output = await cleanGenerated(output);
  const paths = [];
  for (const source of pages.values()) {
    const path = source.match(/^permalink: (.+)$/m)[1];
    const destination = join(output,path.slice('/data/'.length),'index.html');
    await mkdir(dirname(destination),{recursive:true});
    await writeFile(destination,renderStandalone(source,snapshot));
    paths.push(path);
  }
  for (const [source,target] of [['docs/assets/css/api-reference.css','api-reference.css'],['docs/assets/api-directory.js','api-directory.js']]) {
    await writeFile(join(output,target),await readFile(join(ROOT,source),'utf8'));
  }
  const logoSource = join(ROOT,'docs/assets/data-logos');
  await mkdir(join(output,'logos'),{recursive:true});
  for (const name of await readdir(logoSource)) {
    if (/^[a-z0-9-]+\.(?:webp|png)$/.test(name)) await writeFile(join(output,'logos',name),await readFile(join(logoSource,name)));
  }
  await writeFile(join(output,'.api-docs-generated'),JSON.stringify(paths));
  return paths;
}

async function main() {
  const args=process.argv.slice(2);
  let snapshot;
  if(args.includes('--refresh')) {
    const {refreshSnapshot}=await import('./refresh-data-api-snapshot.mjs');
    snapshot=await refreshSnapshot();
  } else if(args.includes('--web-root')) {
    const root=args[args.indexOf('--web-root')+1];
    if(!root || root.startsWith('--')) throw new Error('--web-root requires the read-only web directory');
    const {stripTypeScriptTypes}=await import('node:module');
    const source=await readFile(resolve(root,'src/generated/skill-api-docs.publication.generated.ts'),'utf8');
    const context={};
    runInNewContext(stripTypeScriptTypes(source).replace('export default publication;','globalThis.publication=publication;'),context,{timeout:15000});
    snapshot=project(context.publication);
    await mkdir(dirname(SNAPSHOT),{recursive:true});
    await writeFile(SNAPSHOT,json(snapshot)+'\n');
  } else snapshot=JSON.parse(await readFile(SNAPSHOT,'utf8'));
  console.log(`Built ${await build(snapshot)} API documentation pages from ${snapshot.entries.length} published contracts.`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().catch(e=>{console.error(e.message);process.exitCode=1;});
