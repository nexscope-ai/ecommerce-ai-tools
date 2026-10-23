const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs');
const build = path.join(root, '.tmp-creative-models-site');
const pages = [
  ['nano-banana-2-vs-pro.md', '/guides/nano-banana-2-vs-pro/', 'banana-2-image-generation'],
  ['kling-ai-pricing.md', '/guides/kling-ai-pricing/', 'kling-2-6-video-generation'],
  ['seedance-api-guide.md', '/guides/seedance-api/', 'seedance-2-0-video-generation'],
];

test('new decision guides have distinct intent, dated sources and model-matched next steps', () => {
  for (const [file, url, api] of pages) {
    const text = fs.readFileSync(path.join(docs, 'guides', file), 'utf8');
    assert.ok(text.includes(`permalink: ${url}`), file);
    assert.ok(text.includes('date_published: 2026-10-23'), file);
    assert.ok(text.includes(`https://www.nexscope.ai/api-docs/${api}?view=playground&co-from=learn`), file);
    assert.ok(text.includes('placement="article-middle"'), file);
    assert.ok(text.includes('1,000 free credits'), file);
    assert.ok(text.includes('3 days'), file);
    assert.ok(text.includes('active subscription'), file);
    assert.equal((text.match(/^# /gm) || []).length, 1, file);
    assert.ok(!/aggregateRating|ratingValue|unlimited free/.test(text), file);
    assert.ok(!text.includes('model_api_slug:'), 'decision pages must not replace a model review');
  }
});

test('pricing comparison distinguishes providers and discloses unresolved quotes', () => {
  const text = fs.readFileSync(path.join(docs, 'guides/kling-ai-pricing.md'), 'utf8');
  assert.ok(text.includes('kling.ai/docs/point-policy'));
  assert.ok(text.includes('published-estimate mismatch'));
  assert.ok(text.includes('not Kling\'s official membership site'));
  assert.ok(text.includes('not a Kling-specific allocation'));
});

test('eight priority reviews connect to decision guides without changing their URLs', () => {
  const files = [
    'nano-banana-2-image-guide.md', 'nano-banana-pro-image-guide.md',
    'kling-2-6-video-review.md', 'kling-3-omni-video-review.md',
    'seedance-2-0-video-review.md', 'seedance-2-5-video-review.md',
    'gpt-image-2-5-sunburst-review.md', 'gpt-image-2-5-flare-review.md',
  ];
  for (const file of files) {
    const text = fs.readFileSync(path.join(docs, 'guides', file), 'utf8');
    assert.ok(text.includes('{% include model-decision-path.html %}'), file);
    assert.ok(text.includes('date_published: 2026-10-22'), file);
    assert.ok(text.includes('date_modified: 2026-10-23'), file);
  }
});

test('built decision pages have canonical URLs, schema, sitemap coverage and valid internal links', { skip: !fs.existsSync(build) }, () => {
  const sitemap = fs.readFileSync(path.join(build, 'sitemap.xml'), 'utf8');
  const hub = fs.readFileSync(path.join(build, 'guides/ai-model-playgrounds/index.html'), 'utf8');
  const listing = fs.readFileSync(path.join(build, 'guides/index.html'), 'utf8');
  for (const [, url, api] of pages) {
    const html = fs.readFileSync(path.join(build, url, 'index.html'), 'utf8');
    assert.ok(html.includes(`rel="canonical" href="https://learn.nexscope.ai/ecommerce-ai-tools${url}"`), url);
    assert.ok(sitemap.includes(`/ecommerce-ai-tools${url}`), url);
    assert.ok(hub.includes(`/ecommerce-ai-tools${url}`), url);
    assert.ok(listing.includes(`/ecommerce-ai-tools${url}`), url);
    assert.ok(html.includes(`api-docs/${api}?view=playground&amp;co-from=learn`), url);
    assert.ok(html.includes('data-cta-placement="article-middle"'), url);
    assert.ok(html.includes('data-cta-placement="article-end"'), url);
    assert.ok(!html.includes('{%'), url);
    const schema = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.ok(schema.some(s => s['@graph']?.some(n => n['@type'] === 'Article')), url);
    for (const match of html.matchAll(/href="\/ecommerce-ai-tools([^"?#]*)/g)) {
      const target = path.join(build, decodeURIComponent(match[1]));
      assert.ok(fs.existsSync(target), `${url}: missing internal target ${match[1]}`);
    }
  }
});

test('built review decision blocks render as headings and resolve to guides', { skip: !fs.existsSync(build) }, () => {
  for (const [review, target] of [
    ['nano-banana-2-image', 'nano-banana-2-vs-pro'],
    ['kling-2-6-video', 'kling-ai-pricing'],
    ['seedance-2-0-video', 'seedance-api'],
  ]) {
    const html = fs.readFileSync(path.join(build, 'guides', review, 'index.html'), 'utf8');
    assert.ok(html.includes(`/guides/${target}/`), review);
    assert.ok(!html.includes('## '), review);
  }
});
