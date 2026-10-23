const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

test('seller landing and submission clicks retain acquisition source and reject unrelated destinations', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const location = new URL('https://learn.nexscope.ai/ecommerce-ai-tools/seller-help/product-visibility/?email=private@example.com');
  const listeners = {};
  const window = {
    location,
    localStorage: { getItem() { return 'granted'; } },
    nexscopeTrafficAttribution: { trafficSource: 'outreach_email', trafficMedium: 'email', trafficCampaign: 'product_gallery_invite', trafficLandingPath: '/ecommerce-ai-tools/' },
  };
  const document = {
    title: 'Product visibility help', referrer: '',
    head: { appendChild() {} },
    body: { append() {}, getAttribute() { return 'product-visibility'; } },
    createElement() { return { style: {}, setAttribute() {}, append() {}, querySelector() { return { focus() {} }; } }; },
    addEventListener(name, listener) { (listeners[name] ||= []).push(listener); },
  };
  const context = { window, document, location, URL, URLSearchParams, Date };
  runInNewContext(script, context);
  runInNewContext(script, context);
  const click = (href, attributes) => {
    const link = { href, textContent: 'Get feedback', getAttribute(name) { return attributes[name] || null; } };
    listeners.click[0]({ target: { closest() { return link; } } });
  };
  click('https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/submit/?token=private', { 'data-showcase-submit-cta': 'product-visibility-hero' });
  click('https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/submit/', { 'data-cta-placement': 'article-end' });
  click('https://learn.nexscope.ai/ecommerce-ai-tools/seller-help/product-page-review/', { 'data-seller-help': 'product-page-review' });
  click('https://other.example/ecommerce-ai-tools/product-showcase/submit/', { 'data-showcase-submit-cta': 'wrong-site' });
  click('https://learn.nexscope.ai/ecommerce-ai-tools/other/', { 'data-showcase-submit-cta': 'wrong-path' });
  const events = window.dataLayer.map(entry => Array.from(entry)).filter(entry => entry[0] === 'event');
  assert.equal(events.filter(entry => entry[1] === 'seller_help_view').length, 1);
  const submission = events.filter(entry => entry[1] === 'product_showcase_submit_click');
  assert.equal(submission.length, 2);
  assert.equal(submission[1][2].cta_placement, 'article-end');
  assert.equal(submission[0][2].traffic_source, 'outreach_email');
  assert.equal(submission[0][2].traffic_campaign, 'product_gallery_invite');
  assert.equal(submission[0][2].cta_placement, 'product-visibility-hero');
  assert.equal(events.filter(entry => entry[1] === 'seller_help_open').length, 1);
  assert.equal(JSON.stringify(events).includes('private@example.com'), false);
  assert.equal(JSON.stringify(events).includes('token=private'), false);
  // The shared analytics handler owns this click; the Gallery script must not send it again.
  assert.equal(readFileSync(join(__dirname, '..', 'docs', 'assets', 'product-showcase.js'), 'utf8').includes("event('product_showcase_submit_click'"), false);
});

test('Learn analytics uses the shared GA4 stream and cross-subdomain linker', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const listeners = {};
  const link = {
    href: 'https://www.nexscope.ai/api-docs?co-from=learn',
    textContent: 'API docs',
    hasAttribute() { return false; },
    getAttribute(name) {
      return { 'data-cta-placement': 'home-task', 'data-step-id': 'amazon_search' }[name] || null;
    },
  };
  const window = {
    nexscopeAnalyticsLoaded: false,
    dataLayer: [],
    location: { href: 'https://learn.nexscope.ai/ecommerce-ai-tools/guides/?utm_source=chatgpt.com' },
    localStorage: { getItem() { return 'granted'; } },
    nexscopeTrafficAttribution: {
      trafficSource: 'chatgpt.com',
      trafficMedium: 'ai_referral',
      trafficCampaign: '',
      trafficReferrerHost: 'chatgpt.com',
      trafficLandingPath: '/ecommerce-ai-tools/guides/',
    },
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
  assert.equal(config[2].send_page_view, false);

  const pageViews = calls.filter(entry => entry[0] === 'event' && entry[1] === 'page_view');
  assert.equal(pageViews.length, 1);
  assert.equal(pageViews[0][2].page_referrer, 'https://chatgpt.com/c/example');
  assert.equal(pageViews[0][2].landing_source, 'chatgpt.com');
  assert.equal(pageViews[0][2].landing_medium, 'ai_referral');
  assert.equal(pageViews[0][2].landing_path, '/ecommerce-ai-tools/guides/');

  listeners.click[0]({ target: { closest(selector) { return selector === 'a[href]' ? link : null; } } });
  const click = window.dataLayer.map(entry => Array.from(entry)).find(entry => entry[0] === 'event' && entry[1] === 'start_using_click');
  assert.equal(click[2].co_from, 'learn');
  assert.equal(click[2].cta_placement, 'home-task');
  assert.equal(click[2].step_id, 'amazon_search');
});

test('Learn analytics records attributed community entry clicks', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const listeners = {};
  const link = {
    href: 'https://github.com/nexscope-ai/ecommerce-ai-tools/discussions/16?utm_source=learn.nexscope.ai',
    textContent: 'Join the product-page clinic',
    hasAttribute() { return false; },
    getAttribute(name) { return name === 'data-track-community' ? 'product_page_clinic' : null; },
  };
  const window = {
    nexscopeAnalyticsLoaded: false,
    dataLayer: [],
    location: {
      href: 'https://learn.nexscope.ai/ecommerce-ai-tools/community/',
      pathname: '/ecommerce-ai-tools/community/',
    },
    localStorage: { getItem() { return 'granted'; } },
  };
  const document = {
    title: 'Community',
    referrer: '',
    head: { appendChild() {} },
    body: { append() {} },
    createElement() {
      return { style: {}, setAttribute() {}, append() {}, querySelector() { return { focus() {} }; } };
    },
    addEventListener(name, listener) { (listeners[name] ||= []).push(listener); },
  };
  runInNewContext(script, { window, document, location: window.location, URL, URLSearchParams, Date });

  listeners.click[0]({ target: { closest(selector) { return selector === 'a[href]' ? link : null; } } });
  const click = window.dataLayer.map(entry => Array.from(entry))
    .find(entry => entry[0] === 'event' && entry[1] === 'community_open_click');
  assert.equal(click[2].community_action, 'product_page_clinic');
  assert.equal(click[2].link_path, '/nexscope-ai/ecommerce-ai-tools/discussions/16');
  assert.equal(click[2].source_page, '/ecommerce-ai-tools/community/');
});

test('Product Gallery clicks record the product and placement without exposing merchant URL parameters', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const listeners = {};
  const productId = 'b05186f4-94f9-43d0-9fc7-931404589234';
  const relatedId = '11111111-1111-4111-8111-111111111111';
  const productPath = `/ecommerce-ai-tools/product-showcase/product/${productId}/`;
  const window = {
    nexscopeAnalyticsLoaded: false,
    dataLayer: [],
    location: {
      href: 'https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/?ga_debug=1',
      origin: 'https://learn.nexscope.ai',
      pathname: '/ecommerce-ai-tools/product-showcase/',
      search: '?ga_debug=1',
    },
    localStorage: { getItem() { return 'granted'; } },
  };
  const document = {
    title: 'Product Gallery',
    referrer: '',
    head: { appendChild() {} },
    body: { append() {} },
    createElement() {
      return { style: {}, setAttribute() {}, append() {}, querySelector() { return { focus() {} }; } };
    },
    addEventListener(name, listener) { (listeners[name] ||= []).push(listener); },
  };
  runInNewContext(script, { window, document, location: window.location, URL, URLSearchParams, Date });
  const clickLink = (href, attributes) => {
    const link = { href, textContent: 'View product', getAttribute(name) { return attributes[name] || null; } };
    listeners.click[0]({ target: { closest(selector) { return selector === 'a[href]' ? link : null; } } });
  };
  const events = () => window.dataLayer.map(entry => Array.from(entry))
    .filter(entry => entry[0] === 'event' && entry[1].startsWith('product_'));

  clickLink(`https://learn.nexscope.ai${productPath}`, {
    'data-track-product': 'gallery', 'data-product-id': productId, 'data-product-placement': 'featured-hub',
  });
  assert.equal(events().length, 1);
  assert.equal(events()[0][1], 'product_gallery_click');
  assert.equal(events()[0][2].product_id, productId);
  assert.equal(events()[0][2].placement, 'featured-hub');
  assert.equal(events()[0][2].destination_path, productPath);
  assert.equal(events()[0][2].debug_mode, true);

  window.location.href = `https://learn.nexscope.ai${productPath}`;
  window.location.pathname = productPath;
  window.location.search = '';
  clickLink('https://seller.example.com/item?email=someone@example.com', {
    'data-track-product': 'source', 'data-product-id': productId, 'data-product-placement': 'sidebar',
  });
  assert.equal(events().length, 2);
  assert.equal(events()[1][1], 'product_source_click');
  assert.equal(events()[1][2].destination_host, 'seller.example.com');
  assert.equal(events()[1][2].destination_path, undefined);
  assert.equal(JSON.stringify(events()[1]).includes('someone@example.com'), false);

  clickLink(`https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/product/${relatedId}/`, {
    'data-track-product': 'related', 'data-product-id': relatedId, 'data-product-placement': 'related-products',
  });
  assert.equal(events()[2][1], 'product_related_click');
  assert.equal(events()[2][2].product_id, relatedId);
  assert.equal(events()[2][2].source_page, productPath);

  clickLink('https://seller.example.com/item', {
    'data-track-product': 'source', 'data-product-id': 'invalid', 'data-product-placement': 'sidebar',
  });
  assert.equal(events().length, 3);
});

test('Learn analytics sends one cookieless page view before consent and does not duplicate it after opt-in', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const appended = [];
  const window = {
    nexscopeAnalyticsLoaded: false,
    dataLayer: [],
    location: { href: 'https://learn.nexscope.ai/ecommerce-ai-tools/' },
    localStorage: {
      getItem() { return null; },
      setItem() {},
    },
  };
  const document = {
    title: 'Learn',
    referrer: '',
    cookie: '',
    head: { appendChild() {} },
    body: { append(node) { appended.push(node); } },
    createElement() {
      return {
        style: {},
        children: [],
        setAttribute() {},
        append(...nodes) { this.children.push(...nodes); },
        querySelector() { return { focus() {} }; },
        remove() {},
      };
    },
    addEventListener() {},
  };
  runInNewContext(script, { window, document, location: window.location, URL, URLSearchParams, Date });

  const beforeConsent = window.dataLayer.map(entry => Array.from(entry));
  assert.equal(beforeConsent.find(entry => entry[0] === 'consent' && entry[1] === 'default')[2].analytics_storage, 'denied');
  assert.equal(beforeConsent.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 1);

  const allowButton = appended[0].children[1].children[0];
  allowButton.onclick();
  const afterConsent = window.dataLayer.map(entry => Array.from(entry));
  assert.equal(afterConsent.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 1);
  assert.equal(afterConsent.filter(entry => entry[0] === 'consent' && entry[1] === 'update')[0][2].analytics_storage, 'granted');
});

test('Learn analytics sends one cookieless page view when analytics is rejected', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const appended = [];
  const window = {
    nexscopeAnalyticsLoaded: false,
    dataLayer: [],
    location: { href: 'https://learn.nexscope.ai/ecommerce-ai-tools/' },
    localStorage: {
      getItem() { return null; },
      setItem() {},
    },
  };
  const document = {
    title: 'Learn',
    referrer: '',
    cookie: '',
    head: { appendChild() {} },
    body: { append(node) { appended.push(node); } },
    createElement() {
      return {
        style: {},
        children: [],
        setAttribute() {},
        append(...nodes) { this.children.push(...nodes); },
        querySelector() { return { focus() {} }; },
        remove() {},
      };
    },
    addEventListener() {},
  };
  runInNewContext(script, { window, document, location: window.location, URL, URLSearchParams, Date });

  const rejectButton = appended[0].children[1].children[1];
  rejectButton.onclick();
  const calls = window.dataLayer.map(entry => Array.from(entry));
  assert.equal(calls.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 1);
  assert.equal(calls.filter(entry => entry[0] === 'consent' && entry[1] === 'update')[0][2].analytics_storage, 'denied');
});

test('Learn analytics can read the shared consent cookie across subdomains', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const window = {
    nexscopeAnalyticsLoaded: false,
    dataLayer: [],
    location: { href: 'https://learn.nexscope.ai/ecommerce-ai-tools/' },
    localStorage: { getItem() { return null; } },
  };
  const document = {
    title: 'Learn',
    referrer: '',
    cookie: 'nexscope_analytics_consent_v1=granted',
    head: { appendChild() {} },
    body: { append() {} },
    createElement() {
      return { style: {}, setAttribute() {}, append() {}, querySelector() { return { focus() {} }; } };
    },
    addEventListener() {},
  };
  runInNewContext(script, { window, document, location: window.location, URL, URLSearchParams, Date });
  const calls = window.dataLayer.map(entry => Array.from(entry));
  assert.equal(calls.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 1);
});
