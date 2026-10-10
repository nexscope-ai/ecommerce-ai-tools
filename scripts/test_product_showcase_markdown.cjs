const { test } = require('node:test');
const assert = require('node:assert/strict');
const markdownit = require('../docs/assets/vendor/markdown-it-14.3.2.min.js');
const { createParser, normalizeReviewSuggestion } = require('../docs/assets/product-showcase-markdown.js');

const parser = createParser(markdownit);

test('renders standard Markdown headings, lists, and tables', () => {
  const html = parser.render('# Product\n\n| Area | Score |\n| --- | ---: |\n| SEO | 22/30 |\n\n1. First\n2. Second');
  assert.match(html, /<h1>Product<\/h1>/);
  assert.match(html, /<table>/);
  assert.match(html, /<td style="text-align:right">22\/30<\/td>/);
  assert.match(html, /<ol>/);
});

test('preserves the structure of older tab-separated review suggestions', () => {
  const oldReview = [
    'Content optimization score: 50/100',
    'Area\tScore\tReason',
    'Submitted product detail page SEO\t22/30\tNeeds clearer copy.',
    'Submitted product detail page GEO\t16/30\tNeeds answers.',
    'Evidence and positioning. Seller-provided facts.',
    'Submitted product detail page SEO',
    '1. Confirm the specifications.',
    'Suggested meta description, once confirmed:',
    'A clear product description.',
  ].join('\n');
  const html = parser.render(normalizeReviewSuggestion(oldReview));
  assert.match(html, /<table>/);
  assert.match(html, /<td>22\/30<\/td>/);
  assert.match(html, /<h2>Submitted product detail page SEO<\/h2>/);
  assert.match(html, /<h3>Suggested meta description, once confirmed:<\/h3>/);
  assert.match(html, /<ol>/);
  assert.doesNotMatch(html, /Area\s+Score\s+Reason\s+Submitted/);
});

test('escapes HTML and refuses unsafe links and embedded images', () => {
  const html = parser.render('<script>alert(1)</script>\n\n[bad](javascript:alert(1)) [good](https://example.com)\n\n![remote](https://example.com/image.png)');
  assert.doesNotMatch(html, /<script|href="javascript:|<img/i);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /href="https:\/\/example.com"/);
});
