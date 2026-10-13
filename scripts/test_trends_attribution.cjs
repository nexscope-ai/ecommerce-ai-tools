const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

test('Learn keeps the external source when linking to the main site', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'trends.js'), 'utf8');
  const link = {
    href: 'https://www.nexscope.ai/api-docs?view=api&co-from=learn&utm_source=learn.nexscope.ai&utm_medium=referral#examples',
    dataset: {},
    setAttribute(name, value) { this[name] = value; },
  };
  const events = [];
  const location = new URL('https://learn.nexscope.ai/ecommerce-ai-tools/guides/?utm_source=chatgpt.com');
  const window = {
    location,
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    addEventListener() {},
    gtag(...args) { events.push(args); },
  };
  const document = {
    referrer: 'https://chatgpt.com/c/example',
    querySelectorAll: () => [link],
    querySelector: () => null,
    addEventListener(name, listener) { if (name === 'click') this.click = listener; },
  };
  runInNewContext(script, { window, document, URL, URLSearchParams, Date, requestAnimationFrame() {} });

  const destination = new URL(link.href);
  assert.equal(destination.searchParams.get('view'), 'api');
  assert.equal(destination.searchParams.get('co-from'), 'learn');
  assert.equal(destination.searchParams.has('utm_source'), false);
  assert.equal(destination.searchParams.has('utm_medium'), false);
  assert.equal(destination.hash, '#examples');
  assert.equal(link['data-track'], 'start_using');

  document.click({ target: { closest: selector => selector.startsWith('a[data-track') ? link : null } });
  assert.equal(events[0][1], 'learn_to_main_click');
  assert.equal(events[0][2].learn_entry_source, 'chatgpt.com');
});
