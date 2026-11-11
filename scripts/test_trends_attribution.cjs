const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

test('model experience clicks retain top, middle and end placement in both conversion events', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'trends.js'), 'utf8');
  for (const placement of ['article-top', 'article-middle', 'article-end']) {
    const link = {
      href: 'https://www.nexscope.ai/api-docs/seedance-2-0-video-generation?view=playground&co-from=learn',
      dataset: { ctaPlacement: placement, stepId: 'seedance_2_0_video_generation', buyerIntent: 'api-evaluation' },
      setAttribute(name, value) { this[name] = value; },
    };
    const events = [];
    const window = {
      location: new URL('https://learn.nexscope.ai/ecommerce-ai-tools/guides/seedance-2-0-video/'),
      sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
      addEventListener() {},
      gtag(...args) { events.push(args); },
      nexscopeTrafficAttribution: { trafficSource: 'google.com' },
    };
    const document = {
      referrer: '',
      querySelectorAll: selector => selector === 'a[href]' ? [link] : [],
      querySelector: () => null,
      addEventListener(name, listener) { if (name === 'click') this.click = listener; },
    };
    runInNewContext(script, { window, document, URL, URLSearchParams, Date, requestAnimationFrame() {} });
    document.click({ target: { closest: () => link } });
    const mainClick = events.find(e => e[1] === 'learn_to_main_click');
    const modelClick = events.find(e => e[1] === 'article_next_step_click');
    assert.equal(mainClick[2].cta_placement, placement);
    assert.equal(mainClick[2].next_step, 'seedance_2_0_video_generation');
    assert.equal(mainClick[2].buyer_intent, 'api-evaluation');
    assert.equal(mainClick[2].traffic_source, 'google.com');
    assert.equal(modelClick[2].cta_placement, placement);
    assert.equal(modelClick[2].next_step, 'seedance_2_0_video_generation');
    assert.equal(new URL(link.href).searchParams.get('view'), 'playground');
  }
});

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
    querySelectorAll: selector => selector === 'a[href]' ? [link] : [],
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
// Keep the attribution setup realistic while observing only public CTA metadata.
test('article CTA exposure is counted once per visible placement without private query data', () => {
  const events = [], callbacks = [];
  const link = { href: 'https://www.nexscope.ai/api-docs/amazon-product-detail?co-from=learn&token=private', dataset: { stepId: 'amazon_detail', ctaPlacement: 'article-intro' }, setAttribute() {} };
  const window = { location: new URL('https://learn.nexscope.ai/ecommerce-ai-tools/guides/example/'), sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} }, addEventListener() {}, gtag: (...args) => events.push(args) };
  const document = { referrer: '', querySelector: () => null, querySelectorAll: selector => ['a[href]', '[data-article-next-step][href]'].includes(selector) ? [link] : [], addEventListener() {} };
  runInNewContext(readFileSync(join(__dirname, '../docs/assets/trends.js'), 'utf8'), { window, document, URL, URLSearchParams, Date, requestAnimationFrame() {}, IntersectionObserver: class { constructor(callback) { callbacks.push(callback); } observe() {} unobserve() {} } });
  assert.equal(callbacks.length, 1);
  callbacks[0]([{ target: link, intersectionRatio: .2 }]); assert.equal(events.length, 0);
  callbacks[0]([{ target: link, intersectionRatio: .6 }]); callbacks[0]([{ target: link, intersectionRatio: 1 }]);
  assert.equal(events.length, 1); assert.equal(events[0][1], 'article_next_step_view'); assert.equal(events[0][2].cta_placement, 'article-intro'); assert.equal(JSON.stringify(events).includes('private'), false);
});
