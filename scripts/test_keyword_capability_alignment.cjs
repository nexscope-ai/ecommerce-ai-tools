const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs');
const build = path.join(root, '.tmp-creative-models-site');
const targets = [
  ['guides/competitor-keyword-traffic-api.md', '/guides/competitor-keyword-traffic-api/', '2026-10-23'],
  ['guides/backlink-referring-domains-api.md', '/guides/backlink-referring-domains-api/', '2026-10-23'],
  ['ecommerce-trends/seo-keyword-api-content-plan.md', '/ecommerce-trends/seo-keyword-api-content-plan/', '2026-10-20'],
  ['guides/ecommerce-product-data-enrichment.md', '/ecommerce-product-data-enrichment/', '2026-10-13'],
  ['guides/ecommerce-data-extraction-api.md', '/ecommerce-data-extraction-api/', '2026-10-20'],
  ['guides/amazon-competitor-keyword-research.md', '/amazon-competitor-keyword-research/', '2026-09-15'],
];
const read = file => fs.readFileSync(path.join(docs, file), 'utf8');

test('keyword updates preserve existing destinations, original publication dates and current reviews', () => {
  for (const [file, url, published] of targets) {
    const text = read(file);
    const body = text.replace(/^---[\s\S]*?\r?\n---\r?\n/, '');
    assert.ok(text.includes(`permalink: ${url}`), file);
    assert.ok(text.includes(`date_published: ${published}`), file);
    assert.ok(text.includes('last_reviewed: 2026-10-26'), file);
    assert.equal((body.match(/^# /gm) || []).length, 1, file);
    assert.ok(!/^## .+\r?\n\s*## /m.test(body), `${file}: no empty sections`);
    const h2s = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1].trim());
    assert.equal(new Set(h2s).size, h2s.length, `${file}: no duplicate H2s`);
  }
});

test('ranking research and tracking are separated with the documented locale and bounded examples', () => {
  const text = read(targets[0][0]);
  assert.ok(text.includes('keyword ranking API'));
  assert.ok(text.includes('Keyword ranking API or keyword tracking API'));
  assert.ok(text.includes('default 10, maximum 20'));
  assert.ok(text.includes('US, English, desktop; up to 10 results'));
  assert.ok(text.includes('scheduling, storage and comparison logic'));
  assert.ok(text.includes('not an executed request or measured result'));
  const example = JSON.parse(text.match(/```json\s*([\s\S]*?)```/)[1]);
  assert.deepEqual(example, { target: 'nexscope.ai', market: 'US', language: 'en', limit: 10 });
  assert.ok(!/global real-time rank tracker|automatic daily ranking alerts/i.test(text));
});

test('backlink object targets and string history targets are not combined', () => {
  const text = read(targets[1][0]);
  const example = JSON.parse(text.match(/```json\s*([\s\S]*?)```/)[1]);
  assert.deepEqual(example, { target: { kind: 'DOMAIN', target: 'nexscope.ai' }, limit: 10 });
  for (const field of ['returnedCount', 'providerTotalCount', 'truncated', 'fromUrl', 'toUrl', 'bucketPolicy', 'zeroMeaning']) assert.ok(text.includes(`\`${field}\``), field);
  assert.ok(text.includes('uses a **string** `target`'));
  assert.ok(text.includes('not a list of every changed source URL'));
});

test('keyword research owns idea and metrics intent without duplicating the ranking workflow', () => {
  const text = read(targets[2][0]);
  for (const slug of ['seo-keyword-expand', 'seo-keyword-metrics', 'seo-keyword-ideas']) assert.ok(text.includes(`/api-docs/${slug}?view=playground&co-from=learn`), slug);
  assert.ok(text.includes('US English'));
  assert.ok(text.includes('80 characters and ten whitespace-separated words'));
  assert.ok(text.includes("'/guides/competitor-keyword-traffic-api/' | relative_url"));
  assert.ok(text.includes('placement="article-middle"'));
});

test('feed enrichment and extraction stay evidence-only rather than claiming catalog writes', () => {
  const feed = read(targets[3][0]);
  const extraction = read(targets[4][0]);
  for (const text of [feed, extraction]) {
    assert.ok(text.includes('/api-docs/seo-page-evidence?view=playground&co-from=learn'));
    assert.ok(text.includes('missing'));
    assert.ok(text.includes('paid'));
  }
  assert.ok(feed.includes('illustrative review sheet, not a returned API result'));
  assert.ok(feed.includes('Leave unresolved; never generate an identifier'));
  assert.ok(feed.includes('Neither entry point establishes Merchant Center submission'));
  assert.ok(extraction.includes('not necessarily one atomic product record'));
  assert.ok(extraction.includes('does not establish complete JavaScript rendering'));
  assert.ok(extraction.includes('id: page_evidence_api'));
  assert.ok(extraction.includes('{% include api-guide-entry.html %}'));
  assert.ok(extraction.includes('placement="article-middle"'));
});

test('Amazon competitor guide adds current ASIN inputs while preserving dated Google-only test attribution', () => {
  const text = read(targets[5][0]);
  for (const field of ['asin', 'country', 'timePieceType', 'timePieceValue', 'pageNum', 'pageSize']) assert.ok(text.includes(`\`${field}\``), field);
  assert.ok(text.includes('recent-day values are 7 or 30'));
  assert.ok(text.includes('did not execute a reverse-ASIN request'));
  assert.ok(text.includes('We did **not** run a reverse-ASIN benchmark'));
  assert.ok(text.includes('**Google US English**'));
  assert.ok(text.includes('placement="article-middle"'));
});

test('built keyword updates have canonical URLs, valid schema, working internal links and unique snippets', () => {
  assert.ok(fs.existsSync(build), 'build the Jekyll site before running this validation');
  const titles = new Set();
  const descriptions = new Set();
  for (const [, url] of targets) {
    const html = fs.readFileSync(path.join(build, url, 'index.html'), 'utf8');
    assert.ok(html.includes(`rel="canonical" href="https://learn.nexscope.ai/ecommerce-ai-tools${url}"`), url);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/<meta name="description" content="(.*?)">/)[1];
    assert.ok(!titles.has(title), url); titles.add(title);
    assert.ok(!descriptions.has(description), url); descriptions.add(description);
    assert.ok(!html.includes('{%'), url);
    assert.ok(!html.includes('## '), url);
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    assert.ok(scripts.some(s => s['@graph']?.some(n => n['@type'] === 'Article')), url);
    for (const match of html.matchAll(/href="\/ecommerce-ai-tools([^"?#]*)/g)) assert.ok(fs.existsSync(path.join(build, decodeURIComponent(match[1]))), `${url}: ${match[1]}`);
  }
});
