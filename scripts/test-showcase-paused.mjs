import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const source = await readFile(new URL('../docs/assets/product-showcase.js', import.meta.url), 'utf8');
const uuid = 'b05186f4-94f9-43d0-9fc7-931404589234';
function context(path) {
  const calls = [], fields = new Map();
  const error = { hidden: true, textContent: '' }, panel = { hidden: true };
  const form = { elements: { namedItem(name) { if (!fields.has(name)) fields.set(name, {}); return fields.get(name); } }, querySelectorAll: () => [] };
  const page = { dataset: { apiBase: 'https://api.example.test/product-showcase' }, setAttribute() {}, querySelector(selector) { return ({ '.form-error': error, '.management-panel': panel, '[data-management-skeleton]': {}, '.management-edit-form': form })[selector] || null; } };
  const fetch = async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ code: 0, data: { productName: 'Existing product', moderationStatus: 'APPROVED', publishStatus: 'ONLINE' } }) }; };
  return { calls, error, panel, fields, globals: { document: { querySelectorAll: () => [], querySelector: () => page }, window: { location: { pathname: path } }, sessionStorage: { getItem: () => null, removeItem() {} }, fetch, URL } };
}
test('management only reads existing submissions', async () => {
  const c = context(`/product-showcase/manage/${uuid}`);
  vm.runInNewContext(source, c.globals);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(c.calls.length, 1);
  assert.equal(c.calls[0].options.method, 'GET');
  assert.equal(c.calls[0].options.headers['X-Management-UUID'], uuid);
  assert.equal(c.fields.get('productName').value, 'Existing product');
  assert.equal(c.panel.hidden, false);
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PUT|PATCH|DELETE)|XMLHttpRequest|presign/);
});
test('invalid management links do not request or redirect', () => {
  const c = context('/product-showcase/manage/invalid');
  vm.runInNewContext(source, c.globals);
  assert.equal(c.calls.length, 0);
  assert.equal(c.error.hidden, false);
  assert.match(c.error.textContent, /temporarily unavailable/);
});
test('forms and action buttons are disabled before JavaScript loads', async () => {
  for (const name of ['submit', 'status']) {
    const html = await readFile(new URL(`../docs/product-showcase/${name}/index.md`, import.meta.url), 'utf8');
    assert.match(html, /<fieldset disabled/);
    assert.match(html, /Temporarily unavailable/);
    for (const button of html.matchAll(/<button\b[^>]*>/g)) assert.match(button[0], /\bdisabled\b/);
  }
});
