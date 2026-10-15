const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

test('Learn analytics uses the shared GA4 stream and cross-subdomain linker', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const listeners = {};
  const link = {
    href: 'https://www.nexscope.ai/api-docs?co-from=learn',
    textContent: 'API docs',
    hasAttribute(name) { return name === 'data-track'; },
    getAttribute() { return null; },
  };
  const window = {
    nexscopeAnalyticsLoaded: false,
    dataLayer: [],
    location: { href: 'https://learn.nexscope.ai/ecommerce-ai-tools/guides/?utm_source=chatgpt.com' },
    localStorage: { getItem() { return 'granted'; } },
  };
  const document = {
    title: 'Learn',
    referrer: 'https://chatgpt.com/c/example',
    head: { appendChild() {} },
    body: { append() {} },
    createElement() {
      return {
        style: {},
        setAttribute() {},
        append() {},
        querySelector() { return { focus() {} }; },
      };
    },
    addEventListener(name, listener) { (listeners[name] ||= []).push(listener); },
  };
  runInNewContext(script, { window, document, location: window.location, URL, URLSearchParams, Date });

  const calls = window.dataLayer.map(entry => Array.from(entry));
  const config = calls.find(([name]) => name === 'config');
  assert.equal(config[1], 'G-55CJ5T3HHS');
  assert.equal(Array.from(config[2].linker.domains).join(','), 'learn.nexscope.ai,www.nexscope.ai,nexscope.ai');
  assert.equal(config[2].content_group, 'learn');

  listeners.click[0]({ target: { closest(selector) { return selector === 'a[href]' ? link : null; } } });
  const click = window.dataLayer.map(entry => Array.from(entry)).find(entry => entry[0] === 'event' && entry[1] === 'start_using_click');
  assert.equal(click[2].co_from, 'learn');
});
