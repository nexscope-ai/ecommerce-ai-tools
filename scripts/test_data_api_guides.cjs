const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs');
const build = path.join(root, '.tmp-creative-models-site');
const cases = [
  ['amazon-ads-api-guide.md', '/guides/amazon-ads-api/', 'amazon-ads-api-access', 'api'],
  ['etsy-product-research-api.md', '/guides/etsy-product-research-api/', 'etsy-product-query', 'api'],
  ['walmart-product-keyword-api.md', '/guides/walmart-product-keyword-api/', 'walmart-search', 'api'],
  ['temu-product-research-api.md', '/guides/temu-product-research-api/', 'temu-product-source-query', 'api'],
  ['competitor-keyword-traffic-api.md', '/guides/competitor-keyword-traffic-api/', 'seo-domain-ranked-keywords', 'playground'],
  ['backlink-referring-domains-api.md', '/guides/backlink-referring-domains-api/', 'seo-backlink-overview', 'playground'],
];
const read = f => fs.readFileSync(path.join(docs, f), 'utf8');

test('GEO revisions contain concise verdicts, fit boundaries and attributable evidence', () => {
  for (const [file] of cases) {
    const text = read(`guides/${file}`);
    const answer = text.match(/^> \*\*Quick answer:\*\* (.+)$/m)?.[1];
    assert.ok(answer, file);
    const words = answer.trim().split(/\s+/).length;
    assert.ok(words >= 40 && words <= 60, `${file}: verdict has ${words} words`);
    assert.ok(answer.includes('Nexscope'), file);
    assert.equal((text.match(/^\| Fit \|/gm) || []).length, 3, file);
    assert.equal((text.match(/^\| Not a fit \|/gm) || []).length, 2, file);
    assert.ok(text.includes('vendor-authored contract review, not an independent benchmark'), file);
    assert.ok(text.includes('| Unmeasured |'), file);
    assert.ok(text.includes('https://www.nexscope.ai/pricing?co-from=learn'), file);
    assert.equal((text.match(/^  - question:/gm) || []).length, 3, file);
    assert.ok(text.includes('{% include api-guide-faq.html %}'), file);
  }
});

test('built API FAQs match their schema exactly and remain visible without interaction', { skip: !fs.existsSync(build) }, () => {
  const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  for (const [, url] of cases) {
    const html = fs.readFileSync(path.join(build, url, 'index.html'), 'utf8');
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const faqs = schemas.flatMap(s => s['@graph'] || []).filter(n => n['@type'] === 'FAQPage');
    assert.equal(faqs.length, 1, url);
    assert.equal(faqs[0].mainEntity.length, 3, url);
    const visible = html.match(/<section class="api-guide-faq"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(visible && !/hidden|<details/.test(visible), url);
    for (const item of faqs[0].mainEntity) {
      assert.ok(visible.includes(`<h3>${escape(item.name)}</h3>`), `${url}: question parity`);
      assert.ok(visible.includes(`<p>${escape(item.acceptedAnswer.text)}</p>`), `${url}: answer parity`);
    }
  }
});

test('six task-specific data guides have dated evidence, substantive copy and matching API handoffs', () => {
  const urls = new Set();
  for (const [file, url, slug, view] of cases) {
    const text = read(`guides/${file}`);
    const body = text.replace(/^---[\s\S]*?\r?\n---\r?\n/, '');
    assert.ok(text.includes(`permalink: ${url}`), file);
    assert.ok(!urls.has(url), file); urls.add(url);
    assert.ok(text.includes('date_published: 2026-10-23'), file);
    assert.ok(text.includes('schema_type: Article'), file);
    assert.ok(text.includes('suppress_article_help: true'), file);
    assert.equal((body.match(/^# /gm) || []).length, 1, file);
    assert.ok(body.split(/\s+/).length >= 600, `${file}: satisfy the task rather than a thin API listing`);
    assert.ok(body.includes('{% include api-guide-entry.html %}'), file);
    assert.ok(body.includes('{% include article-action.html placement="article-middle" %}'), file);
    assert.ok(text.includes(`url: https://www.nexscope.ai/api-docs/${slug}?view=${view}&co-from=learn`), file);
    assert.ok(body.includes('No ') || body.includes('no '), `${file}: evidence limitations`);
    assert.ok(!/unlimited free|guaranteed traffic|guaranteed sales|aggregateRating|ratingValue/.test(text), file);
  }
});

test('Amazon Ads guide separates read-only discovery from approved writes and does not publish credential recipes', () => {
  const text = read('guides/amazon-ads-api-guide.md');
  assert.ok(text.includes('55 Amazon Ads endpoints'));
  assert.ok(text.includes('Separate discovery from any approved write action'));
  assert.ok(text.includes('OAuth tokens remain backend-owned'));
  assert.ok(!text.includes('```'), 'no guessed universal Ads payload');
  assert.ok(text.includes('data-amazon-ads-developer-proxy-reporting-reports-report-id'));
});

test('TikTok guide updates the dated count and links all seven additional data contracts', () => {
  const text = read('guides/tiktok-shop-api-guide.md');
  assert.ok(!/(?:currently lists|directory lists|The)\s+\*{0,2}54\b/.test(text), 'current count should not remain 54; a dated historical comparison is allowed');
  assert.ok(text.includes('61 TikTok Shop'));
  assert.ok(text.includes('five practical task groups'));
  for (const slug of ['data-et-batch-video-detail', 'data-et-list-product-video', 'data-et-list-seller', 'data-et-list-seller-product', 'data-kd-livestream-detail', 'data-kd-shop-rank', 'data-kd-video-rank']) {
    assert.ok(text.includes(`/api-docs/${slug}?view=api&co-from=learn`), slug);
  }
  assert.ok(text.includes('current contract requires a shop ID'));
  assert.ok(text.includes('current contract requires a video ID'));
  assert.ok(text.includes('permalink: /guides/tiktok-shop-api-guide/'));
  assert.ok(text.includes('date_published: 2026-10-13'));
});

test('all new guides are linked from the existing API capability hub', () => {
  const hub = read('guides/api-capabilities.md');
  for (const [, url] of cases) assert.ok(hub.includes(`'${url}' | relative_url`), url);
});

test('built data guides have valid internal links, discovery, schema and three attributed CTA placements', { skip: !fs.existsSync(build) }, () => {
  const map = fs.readFileSync(path.join(build, 'sitemap.xml'), 'utf8');
  const listing = fs.readFileSync(path.join(build, 'guides/index.html'), 'utf8');
  const hub = fs.readFileSync(path.join(build, 'api-capabilities/index.html'), 'utf8');
  for (const [, url, slug, view] of cases) {
    const html = fs.readFileSync(path.join(build, url, 'index.html'), 'utf8');
    assert.ok(map.includes(`/ecommerce-ai-tools${url}`), url);
    assert.ok(listing.includes(`/ecommerce-ai-tools${url}`), url);
    assert.ok(hub.includes(`/ecommerce-ai-tools${url}`), url);
    assert.ok(html.includes(`rel="canonical" href="https://learn.nexscope.ai/ecommerce-ai-tools${url}"`), url);
    for (const placement of ['article-top', 'article-middle', 'article-end']) assert.ok(html.includes(`data-cta-placement="${placement}"`), `${url}: ${placement}`);
    assert.ok(html.includes(`/api-docs/${slug}?view=${view}&amp;co-from=learn`), url);
    assert.ok(!html.includes('{%'), url);
    assert.ok(!html.includes('## '), url);
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.ok(schemas.some(s => s['@graph']?.some(n => n['@type'] === 'Article')), url);
    for (const match of html.matchAll(/href="\/ecommerce-ai-tools([^"?#]*)/g)) {
      assert.ok(fs.existsSync(path.join(build, decodeURIComponent(match[1]))), `${url}: ${match[1]}`);
    }
  }
});
