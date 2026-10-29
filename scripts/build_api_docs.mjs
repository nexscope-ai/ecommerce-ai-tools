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
const clean = value => String(value ?? '').replace(/[^.!?\n]*\bMCP\b[^.!?\n]*[.!?]?/gi, '').trim();
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value, null, 2);
const code = (value, lang = '') => `<pre><code class="language-${lang}">${esc(value)}</code></pre>`;
const link = slug => `{{ '/api/${slug ? slug + '/' : ''}' | relative_url }}`;
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
  const entries = publication.apiSlugs.map(slug => {
    if (!SLUG.test(slug)) throw new Error(`Unsafe API slug: ${slug}`);
    const model = publication.apiDetailsBySlug[slug];
    const record = model?.route?.record;
    if (!record) throw new Error(`Missing published contract: ${slug}`);
    const skill = model.catalog.skills.find(item => item.slug === slug) || {};
    const account = model.route.kind === 'account-doc';
    const path = apiPath(account ? record.path : skill.endpoint || record.endpoint);
    if (!path?.startsWith('/') || path.startsWith('//') || /[\s"'<>]/.test(path)) throw new Error(`Invalid public endpoint: ${slug}`);
    const group = account ? 'Account APIs' : model.catalog.categories.find(c => c.slug === skill.categorySlug)?.name || 'Marketing & SEO';
    const entry = {
      slug, name: clean(skill.name || record.name), description: clean(record.description || skill.description),
      group, method: account ? 'GET' : record.run?.method || 'POST', path,
    };
    for (const field of ['requestSchema','responseSchema','requestExample','responseExample','requestFields','requiredAnyGroups','assetUploadConstraints','asyncTask','taskResultEndpoint','acceptedSchema','errorSchema']) {
      const value = record[field] ?? skill[field];
      if (value !== undefined) entry[field] = field === 'taskResultEndpoint' ? apiPath(value) : value;
    }
    return entry;
  });
  const result = { schemaVersion: 1, generatedAt: publication.generatedAt, entries };
  validate(result);
  return result;
}

export function validate(snapshot) {
  if (snapshot.schemaVersion !== 1 || !snapshot.entries?.length) throw new Error('Empty or unsupported API publication');
  const seen = new Set();
  for (const e of snapshot.entries) {
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

function properties(schema) {
  const required = new Set(schema?.required || []);
  return Object.entries(schema?.properties || {}).map(([name, field]) => ({name, type: Array.isArray(field.type) ? field.type.join(' | ') : field.type || (field.oneOf || field.anyOf ? 'union' : 'object'), required: required.has(name), description: field.description || '', constraints: Object.fromEntries(Object.entries(field).filter(([key]) => ['enum','const','minimum','maximum','minLength','maxLength','minItems','maxItems','format','default','pattern'].includes(key)))}));
}

export function renderEntry(e) {
  const fields = properties(e.requestSchema);
  const rows = (fields.length ? fields : e.requestFields || []).map(f => `<tr><td><code>${esc(f.name)}</code></td><td>${esc(f.type)}</td><td>${f.required ? 'Required' : 'Optional'}</td><td>${esc(clean(f.description))}${Object.keys(f.constraints || {}).length ? code(json(f.constraints),'json') : ''}</td></tr>`).join('\n');
  const example = e.requestExample;
  const required = e.requestSchema?.required || [];
  const usable = example && required.every(key => key in example) && (Object.keys(example).length || !Object.keys(e.requestSchema?.properties || {}).length);
  let request = `${e.method} ${API_ORIGIN}${e.path}`;
  if (usable || e.method === 'GET') {
    request = `curl --request ${e.method} '${API_ORIGIN}${e.path}' \\\n  --header "Authorization: Bearer $NEXSCOPE_API_KEY"`;
    if (e.method !== 'GET') request += ` \\\n  --header 'Content-Type: application/json' \\\n  --data-binary @request.json`;
  }
  const schemas = [['Request JSON schema',e.requestSchema],['Response JSON schema',e.responseSchema],['Accepted task schema',e.acceptedSchema],['Error schema',e.errorSchema]].filter(([,s])=>s).map(([label,s])=>`<details><summary>${label}</summary>${code(json(s),'json')}</details>`).join('\n');
  return page(`${e.name} — Nexscope API reference`, e.description || `Request parameters and response schemas for ${e.name}.`, e.slug, `
<nav aria-label="Breadcrumb"><a href="${link('')}">API reference</a> / ${esc(e.group)}</nav>
<p class="api-eyebrow">${esc(e.group)}</p>
<h1>${esc(e.name)}</h1>
<p>${esc(e.description)}</p>
<div class="api-endpoint"><strong>${esc(e.method)}</strong> <code>${esc(API_ORIGIN + e.path)}</code></div>
<div class="api-actions"><a class="api-primary" href="${officialTestUrl(e.slug)}">Try online on Nexscope ↗</a><a href="${link('quickstart')}">Authentication and quick start →</a></div>
<p class="api-caption">The online test opens the matching endpoint on the official Nexscope website. Review its access and credit requirements before running a request.</p>
<h2>Request parameters</h2>
<p>${e.method === 'GET' ? 'Send parameters in the query string.' : 'Send a JSON request body.'} Check the full schema for nested fields and conditional requirements.</p>
${rows ? `<div class="api-table"><table><thead><tr><th>Parameter</th><th>Type</th><th>Requirement</th><th>Description / constraints</th></tr></thead><tbody>${rows}</tbody></table></div>` : '<p>See the request schema below for the accepted input.</p>'}
${e.requiredAnyGroups?.length ? `<h3>Conditional requirements</h3>${code(json(e.requiredAnyGroups),'json')}` : ''}
${usable && e.method !== 'GET' ? `<h2>Example request body</h2><p>Save as <code>request.json</code>. Replace example values with your own inputs; examples are illustrative and are not live test results.</p>${code(json(example),'json')}` : ''}
<h2>Call the API</h2>
${usable || e.method === 'GET' ? '<p>Set <code>NEXSCOPE_API_KEY</code> in your local environment. Never publish your key.</p>' : '<p>Create <code>request.json</code> from the schema and supply the required inputs, including any evidence from earlier calls. The official documentation provides the current execution requirements.</p>'}
${code(request,'bash')}
${e.method === 'GET' ? '<p>For optional filters, add <code>--get --data-urlencode "parameter=value"</code> to the request.</p>' : ''}
${e.responseExample ? `<h2>Example response</h2><p>Illustrative response from the published contract; actual results depend on your request.</p>${code(json(e.responseExample),'json')}` : ''}
${e.asyncTask || e.taskResultEndpoint ? `<h2>Asynchronous results</h2><p>A task being accepted is not the completed output. Save the returned task ID and check its status until completion or failure.</p>${e.taskResultEndpoint ? code(API_ORIGIN + e.taskResultEndpoint) : '<p>Use the task retrieval route documented for this operation.</p>'}` : ''}
${e.assetUploadConstraints?.length ? `<h2>Media requirements</h2>${code(json(e.assetUploadConstraints),'json')}` : ''}
<h2>Full contract</h2>${schemas}
<h2>Before using the output</h2><p>Inspect the response status and returned data before continuing your workflow. Access requirements and credit charges vary by operation; consult the official documentation before running paid calls. An empty result is not proof that no matching data exists.</p>
`);
}

export async function build(snapshot, output = OUTPUT) {
  validate(snapshot);
  const pages = new Map(snapshot.entries.map(e=>[`${e.slug}.md`,renderEntry(e)]));
  const groups = Map.groupBy(snapshot.entries, e=>e.group);
  const directory = [...groups].map(([name,entries])=>`<section data-api-group="${esc(name)}"><h2>${esc(name)} <small>${entries.length} APIs</small></h2><div class="api-directory">${entries.map(e=>`<article class="api-card" data-api-search="${esc([e.name,e.slug,e.path,e.description].join(' ').toLowerCase())}"><span>${esc(e.method)}</span><h3><a href="${link(e.slug)}">${esc(e.name)}</a></h3><p>${esc(e.description)}</p><div class="api-card-actions"><a href="${link(e.slug)}">View API docs →</a><a href="${officialTestUrl(e.slug)}" aria-label="Try ${esc(e.name)} online">Try online ↗</a></div></article>`).join('')}</div></section>`).join('\n');
  const filters = `<div class="api-filters" data-api-filters hidden><div><label for="api-search">Find an API</label><input type="search" id="api-search" placeholder="Search Amazon reviews, SEO, image generation…" autocomplete="off"></div><div><label for="api-category">Category</label><select id="api-category"><option value="">All categories</option>${[...groups.keys()].map(name=>`<option value="${esc(name)}">${esc(name)}</option>`).join('')}</select></div></div><p data-api-count role="status" aria-live="polite">${snapshot.entries.length} APIs available</p><p data-api-empty hidden>No APIs match your search. Try a broader keyword or another category.</p>`;
  pages.set('index.md',page('Nexscope REST API documentation','Explore ecommerce data, SEO and marketing, creative AI and account API request parameters, examples and response schemas.','',`<p class="api-eyebrow">Nexscope developer reference</p><h1>Find the API for your next workflow</h1><p>Explore ecommerce data, SEO and marketing intelligence, and creative AI. Read the input and response contract, then try the matching API on Nexscope.</p><p><a href="${link('quickstart')}">Start with authentication →</a></p>${filters}${directory}`));
  pages.set('quickstart.md',page('Nexscope API quick start','Call Nexscope REST APIs from a developer application or a normal Codex session using a local environment variable.','quickstart',`<nav><a href="${link('')}">← API reference</a></nav><h1>Make your first API request</h1><h2>1. Prepare your account</h2><p>Create an API key in Nexscope and review access and credit requirements for your selected endpoint. Store the key in your local environment as <code>NEXSCOPE_API_KEY</code>. Do not paste it into public code, screenshots or documentation.</p><h2>2. Choose an operation</h2><p>Open an endpoint in the <a href="${link('')}">API directory</a>. Read its required parameters, conditional requirements and media limits. Save your JSON input as <code>request.json</code>.</p><h2>For developers</h2><p>The endpoint pages provide HTTP methods, cURL templates and complete JSON schemas. Pass <code>Authorization: Bearer YOUR_API_KEY</code>. Send JSON for body parameters and query strings for GET parameters. Parse success and error responses; retrieve asynchronous results using the endpoint's documented task route.</p><h2>For ordinary Codex users</h2><p>In a Codex session with local command execution, provide the endpoint documentation URL and describe your goal. You can use this prompt after setting your API key locally:</p>${code('Read this Nexscope REST API reference: [paste the endpoint documentation URL]. Help me prepare the required inputs for [my task]. Use NEXSCOPE_API_KEY from my local environment without displaying it. Explain the request and any missing inputs before running it. Ask before making a paid call. Save the response locally and summarize the results and limitations.')}<h2>Validate the result</h2><p>A request can fail because of authentication, input validation, permissions, insufficient credits or an upstream error. Inspect the documented error response before retrying. Retry policies must account for charges and duplicate work. Do not treat a task acceptance or a sample response as a completed result.</p>`));
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
  await writeFile(marker,JSON.stringify([...pages.keys()]));
  for (const [name,body] of pages) await writeFile(join(output,name),body);
  return pages.size;
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
