/** Build public REST documentation. Refresh reads web artifacts; never runs its build. */
import { readFile, writeFile, mkdir, readdir, rm, lstat, realpath } from 'node:fs/promises';
import { resolve, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

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
export const officialTestUrl = slug => `https://www.nexscope.ai/api-docs/${encodeURIComponent(slug)}?co-from=learn#online-test`;
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
    const group = account ? 'Account APIs' : model.catalog.categories.find(c => c.slug === skill.categorySlug)?.name || 'Marketing & SEO';
    const entry = {
      slug, name: clean(skill.name || record.name), description: clean(record.description || skill.description),
      group, categorySlug: skill.categorySlug, method: record.run?.method || 'POST', path,
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
    if (!isDataCategory(e.categorySlug)) throw new Error(`Non-data API is not allowed: ${e.slug}`);
    if (!SLUG.test(e.slug) || ['index','quickstart'].includes(e.slug) || seen.has(e.slug) || !e.name || !e.path?.startsWith('/') || e.path.startsWith('//') || /[\s"'<>]/.test(e.path) || !['GET','POST','PUT','PATCH','DELETE'].includes(e.method)) throw new Error(`Invalid API entry: ${e.slug}`);
    seen.add(e.slug);
  }
  // Keys such as token/password may legitimately be schema field definitions.
  // Reject literal credential values instead of hiding public schema parameters.
  if (/\bnk-[a-zA-Z0-9]{12,}\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(json(snapshot))) throw new Error('Credential-like value in public API snapshot');
}

function page(title, description, slug, body) {
  return `---\nlayout: api-reference\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\npermalink: /api/${slug ? slug + '/' : ''}\nlearning_topic: agents\napi_directory: ${!slug}\n---\n{% raw %}\n${body}\n{% endraw %}\n`.replaceAll(/href="(\{\{[^\n]+?\}\})"/g, 'href="{% endraw %}$1{% raw %}"');
}

export function buildPages(snapshot) {
  validate(snapshot);
  const groups = Map.groupBy(snapshot.entries, e=>e.group);
  const directory = [...groups].map(([name,entries])=>`<section data-api-group="${esc(name)}"><h2>${esc(name)} <small>${entries.length} APIs</small></h2><div class="api-directory">${entries.map(e=>`<article class="api-card" data-api-search="${esc([e.name,e.slug,e.path,e.description].join(' ').toLowerCase())}"><span>${esc(e.method)}</span><h3><a href="${officialTestUrl(e.slug)}">${esc(e.name)}</a></h3><p>${esc(e.description)}</p><div class="api-card-actions"><a href="${officialTestUrl(e.slug)}" aria-label="Try ${esc(e.name)} online">Try online on Nexscope ↗</a></div></article>`).join('')}</div></section>`).join('\n');
  const filters = `<div class="api-filters" data-api-filters hidden><div><label for="api-search">Find an API</label><input type="search" id="api-search" placeholder="Search Amazon reviews, TikTok, 1688, Shopify…" autocomplete="off"></div><div><label for="api-category">Category</label><select id="api-category"><option value="">All categories</option>${[...groups.keys()].map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('')}</select></div></div><p data-api-count role="status" aria-live="polite">${snapshot.entries.length} APIs available</p><p data-api-empty hidden>No APIs match your search. Try a broader keyword or another category.</p>`;
  const content = `<p class="api-eyebrow">Nexscope Data API directory</p><h1>Find the API for your next workflow</h1><p>Explore marketplace data, product research, advertising intelligence and search data. Choose an API to open its online test on the official Nexscope website.</p><p class="api-caption">API access and credit requirements vary by operation. Review the official documentation before running a request.</p>${filters}${directory}`;
  return new Map([['index.md',page('Nexscope Data API directory','Find Nexscope ecommerce Data APIs for marketplace and product research, and open each API in the official online tester.','',content)]]);
}

export function renderStandalone(source, snapshot) {
  const title = JSON.parse(source.match(/^title: (.+)$/m)[1]);
  const description = JSON.parse(source.match(/^description: (.+)$/m)[1]);
  const path = source.match(/^permalink: (.+)$/m)[1];
  const body = source.slice(source.indexOf('{% raw %}') + '{% raw %}'.length).replace(/\{% (?:endraw|raw) %\}/g, '');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="https://learn.nexscope.ai${path}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="https://learn.nexscope.ai${path}"><meta property="article:modified_time" content="${esc(snapshot.generatedAt)}"><link rel="stylesheet" href="/api/api-reference.css"></head><body class="api-root"><header class="api-root-header"><a href="/" aria-label="Nexscope Learn home"><img src="/logo.png" alt="Nexscope" width="166" height="40"></a><nav aria-label="Main navigation"><a href="/tools/">Tools</a><a href="/ecommerce-ai-tools/product-showcase/">Product Gallery</a><a href="/ecommerce-ai-tools/">Learning library</a><a href="/api/" aria-current="${path==='/api/'?'page':'location'}">Data APIs</a></nav></header><main class="api-reference">${body}</main><footer class="api-root-footer"><a href="/api/">Data API documentation</a> · <a href="/ecommerce-ai-tools/community/">Community</a> · <a href="https://www.nexscope.ai/?co-from=learn">Explore Nexscope ↗</a></footer>${path==='/api/'?'<script src="/api/api-directory.js" defer></script>':''}</body></html>`;
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
  for (const [name,body] of pages) {
    const path = body.match(/^permalink: (.+)$/m)[1];
    const target = `https://learn.nexscope.ai${path}`;
    const redirect = `---\nlayout: null\npermalink: ${path}\nsitemap: false\n---\n<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${target}"><title>API documentation moved | Nexscope</title></head><body><p>Continue to <a href="${target}">Nexscope Data API documentation</a>.</p><script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script></body></html>`;
    await writeFile(join(output,name),redirect);
  }
  await writeFile(join(output,'.api-docs-generated'),JSON.stringify([...pages.keys()]));
  return pages.size;
}

export async function buildRoot(snapshot, output) {
  const pages = buildPages(snapshot);
  output = await cleanGenerated(output);
  const paths = [];
  for (const source of pages.values()) {
    const path = source.match(/^permalink: (.+)$/m)[1];
    const destination = join(output,path.slice('/api/'.length),'index.html');
    await mkdir(dirname(destination),{recursive:true});
    await writeFile(destination,renderStandalone(source,snapshot));
    paths.push(path);
  }
  for (const [source,target] of [['docs/assets/css/api-reference.css','api-reference.css'],['docs/assets/api-directory.js','api-directory.js']]) {
    await writeFile(join(output,target),await readFile(join(ROOT,source),'utf8'));
  }
  await writeFile(join(output,'.api-docs-generated'),JSON.stringify(paths));
  return paths;
}

async function main() {
  const args=process.argv.slice(2);
  let snapshot;
  if(args.includes('--web-root')) {
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
