const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs');
const models = JSON.parse(fs.readFileSync(path.join(docs, '_data/creative_models.json'), 'utf8'));
const files = fs.readdirSync(path.join(docs, 'guides')).filter(f => f.endsWith('.md'));
const sources = files.map(file => ({ file, text: fs.readFileSync(path.join(docs, 'guides', file), 'utf8') }));
const byApi = new Map(sources.flatMap(s => {
  const match = s.text.match(/^model_api_slug: (.+)$/m);
  return match ? [[match[1], s]] : [];
}));

test('inventory covers 10 image and 12 video models exactly once', () => {
  assert.equal(models.length, 22);
  assert.equal(models.filter(m => m.kind === 'image').length, 10);
  assert.equal(models.filter(m => m.kind === 'video').length, 12);
  assert.equal(new Set(models.map(m => m.api)).size, 22);
  assert.equal(new Set(models.map(m => m.article)).size, 22);
  assert.equal(byApi.size, 22);
});

test('every model has a substantive review and its own attributed feedback section', () => {
  const titles = new Set();
  for (const model of models) {
    const source = byApi.get(model.api);
    assert.ok(source, model.name);
    const { text } = source;
    const body = text.split(/\r?\n---\r?\n/)[1];
    assert.ok(body, source.file);
    assert.ok(body.split(/\s+/).length >= 400, `${model.name}: review too short`);
    assert.equal((body.match(/^# /gm) || []).length, 1, model.name);
    for (const section of ['What are its strengths?', 'What are its limitations?', `What do users say about ${model.name}?`, 'Who should consider it?']) {
      assert.ok(body.includes(`## ${section}`), `${model.name}: ${section}`);
    }
    assert.ok(body.includes('**Confidence:'), `${model.name}: feedback confidence`);
    assert.ok(body.includes('not a new hands-on') || body.includes('No new generation'), `${model.name}: review basis`);
    assert.ok(body.includes('{% include model-experience.html placement="article-top" %}'), model.name);
    assert.ok(body.includes('{% include article-action.html placement="article-middle" %}'), model.name);
    assert.ok(body.indexOf('placement="article-top"') < body.indexOf('> **Our take:**'), model.name);
    assert.ok(body.indexOf('placement="article-middle"') < body.indexOf('## What are its strengths?'), model.name);
    assert.ok(!body.includes('{% include article-action.html %}'), `${model.name}: no late duplicate card`);
    assert.ok(body.includes('{% include creative-model-notes.html %}'), model.name);
    assert.ok(!body.includes('```'), `${model.name}: review should not be a prompt tutorial`);
    assert.ok(!/aggregateRating|ratingValue|five.star|5\/5/.test(text), `${model.name}: no invented ratings`);
    assert.ok(text.includes(`permalink: ${model.article}`), model.name);
    const title = text.match(/^title: (.+)$/m)[1];
    assert.ok(!titles.has(title), `${model.name}: duplicate title`);
    titles.add(title);
  }
});

test('every experience CTA maps to the same model, with the finite trial offer', () => {
  for (const model of models) {
    const text = byApi.get(model.api).text;
    const url = text.match(/^  url: (.+)$/m)[1];
    const target = new URL(url);
    assert.equal(target.origin, 'https://www.nexscope.ai');
    assert.equal(target.pathname, `/api-docs/${model.api}`);
    assert.equal(target.searchParams.get('view'), 'playground');
    assert.equal(target.searchParams.get('co-from'), 'learn');
    assert.ok(text.includes('1,000 free credits'), model.name);
    assert.ok(text.includes('valid for 3 days'), model.name);
    assert.ok(!text.includes('unlimited free'), model.name);
  }
});

test('related model links resolve within the inventory', () => {
  const paths = new Set(models.map(m => m.article));
  paths.add('/guides/ai-model-playgrounds/');
  for (const model of models) {
    const body = byApi.get(model.api).text.split('## Related model reviews')[1];
    const links = [...body.matchAll(/'([^']+)' \| relative_url/g)].map(m => m[1]);
    assert.ok(links.length >= 3, model.name);
    for (const link of links) assert.ok(paths.has(link), `${model.name}: ${link}`);
  }
});

const build = path.join(root, '.tmp-creative-models-site');
test('built collection has all model links, canonical URLs, schema and sitemap entries', { skip: !fs.existsSync(build) }, () => {
  const hub = fs.readFileSync(path.join(build, 'guides/ai-model-playgrounds/index.html'), 'utf8');
  const sitemap = fs.readFileSync(path.join(build, 'sitemap.xml'), 'utf8');
  const listing = fs.readFileSync(path.join(build, 'guides/index.html'), 'utf8');
  const home = fs.readFileSync(path.join(build, 'index.html'), 'utf8');
  assert.ok(home.includes('/guides/ai-model-playgrounds/'));
  assert.ok(sitemap.includes('/guides/ai-model-playgrounds/'));
  for (const model of models) {
    const html = fs.readFileSync(path.join(build, model.article, 'index.html'), 'utf8');
    assert.ok(hub.includes(`/ecommerce-ai-tools${model.article}`), model.name);
    assert.ok(listing.includes(`/ecommerce-ai-tools${model.article}`), model.name);
    assert.ok(hub.includes(`/api-docs/${model.api}?view=playground`), model.name);
    assert.ok(html.includes(`href="https://www.nexscope.ai/api-docs/${model.api}?view=playground&amp;co-from=learn"`), model.name);
    assert.ok(html.includes('data-cta-placement="article-top"'), model.name);
    assert.ok(html.includes('data-cta-placement="article-middle"'), model.name);
    assert.ok(html.includes('data-cta-placement="article-end"'), model.name);
    assert.equal((html.match(/class="article-next article-next-focused"/g) || []).length, 1, `${model.name}: only one full card`);
    assert.equal((html.match(/data-article-next-step/g) || []).length, 3, `${model.name}: three tracked experience links`);
    assert.ok(html.indexOf('data-cta-placement="article-top"') < html.indexOf('<blockquote>'), model.name);
    assert.ok(html.indexOf('data-cta-placement="article-middle"') < html.indexOf('id="what-are-its-strengths"'), model.name);
    assert.ok(html.includes('1,000 free credits'), model.name);
    assert.ok(html.includes(`rel="canonical" href="https://learn.nexscope.ai/ecommerce-ai-tools${model.article}"`), model.name);
    assert.ok(sitemap.includes(`/ecommerce-ai-tools${model.article}`), model.name);
    assert.ok(!html.includes('{%'), model.name);
    const jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.ok(jsonld.some(item => item['@graph']?.some(node => node['@type'] === 'Article')), model.name);
  }
});
