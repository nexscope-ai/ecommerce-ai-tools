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

test('Learn analytics uses the shared GA4 stream and decorates only outbound main-site links', () => {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const listeners = {};
  const link = {
    href: 'https://www.nexscope.ai/api-docs?co-from=learn',
    textContent: 'API docs',
    hasAttribute() { return false; },
    getAttribute(name) {
      return { 'data-cta-placement': 'home-task', 'data-step-id': 'amazon_search', 'data-buyer-intent': 'api-evaluation' }[name] || null;
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
  assert.equal(Array.from(config[2].linker.domains).join(','), 'www.nexscope.ai,nexscope.ai');
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
  assert.equal(click[2].buyer_intent, 'api-evaluation');
  assert.equal(click[2].landing_source, 'chatgpt.com');
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

function loadConsentPage({ consent = null, cookie = '', href = 'https://learn.nexscope.ai/ecommerce-ai-tools/' } = {}) {
  const script = readFileSync(join(__dirname, '..', 'docs', 'assets', 'analytics.js'), 'utf8');
  const appended = [];
  const created = [];
  const listeners = {};
  const stored = { value: consent };
  const location = new URL(href);
  const history = {
    pushState(_state, _title, url) {
      if (url) location.href = new URL(url, location).href;
    },
    replaceState(_state, _title, url) {
      if (url) location.href = new URL(url, location).href;
    },
  };
  const window = {
    nexscopeAnalyticsLoaded: false,
    dataLayer: [],
    location,
    history,
    localStorage: {
      getItem() { return stored.value; },
      setItem(_key, value) { stored.value = value; },
    },
    addEventListener(name, listener) { (listeners[name] ||= []).push(listener); },
  };
  const document = {
    title: 'Learn',
    referrer: '',
    cookie,
    head: { appendChild() {} },
    body: {
      append(node) {
        node.isConnected = true;
        appended.push(node);
      },
    },
    createElement() {
      const node = {
        style: {},
        attrs: {},
        children: [],
        listeners: {},
        setAttribute(name, value) { this.attrs[name] = value; },
        append(...nodes) { this.children.push(...nodes); },
        querySelector() { return { focus() {} }; },
        remove() { this.isConnected = false; },
        addEventListener(type, fn) { this.listeners[type] = fn; },
      };
      created.push(node);
      return node;
    },
    addEventListener(name, listener) { (listeners[name] ||= []).push(listener); },
  };
  runInNewContext(script, { window, document, location, URL, URLSearchParams, Date, setInterval, clearInterval });
  const panel = created.find(node => node.attrs['aria-label'] === 'Analytics preferences');
  const tag = created.find(node => typeof node.src === 'string' && node.src.includes('gtag/js'));
  return { window, document, appended, panel, tag, listeners, location };
}

function pageViews(dataLayer) {
  return dataLayer.map(entry => Array.from(entry)).filter(entry => entry[0] === 'event' && entry[1] === 'page_view');
}

function consentDefaults(dataLayer) {
  return dataLayer.map(entry => Array.from(entry)).filter(entry => entry[0] === 'consent' && entry[1] === 'default');
}

test('visitors without a stored choice are measured outside opt-in regions', () => {
  const { window, appended, tag } = loadConsentPage();
  const defaults = consentDefaults(window.dataLayer);
  assert.equal(defaults.length, 2);
  assert.equal(defaults[0][2].analytics_storage, 'denied');
  assert.equal(defaults[0][2].ad_storage, 'denied');
  assert.equal(defaults[0][2].ad_user_data, 'denied');
  assert.equal(defaults[0][2].ad_personalization, 'denied');
  for (const code of ['DE', 'FR', 'GB', 'CH', 'IS', 'NO']) {
    assert.equal(defaults[0][2].region.includes(code), true, code);
  }
  assert.equal(defaults[0][2].region.includes('US'), false);
  assert.equal(defaults[1][2].analytics_storage, 'granted');
  assert.equal(defaults[1][2].ad_storage, 'granted');
  assert.equal(defaults[1][2].ad_user_data, 'granted');
  assert.equal(defaults[1][2].ad_personalization, 'granted');
  assert.equal(defaults[1][2].region, undefined);
  assert.equal(pageViews(window.dataLayer).length, 1);
  assert.equal(window.dataLayer.map(entry => Array.from(entry)).some(entry => entry[0] === 'set' && entry[1] === 'url_passthrough' && entry[2] === true), true);
  assert.equal(appended.length, 0);

  window.google_tag_data = { ics: { entries: { analytics_storage: { default: true } } } };
  tag.listeners.load();
  assert.equal(appended.length, 0, 'granted regions do not show the banner');
});

test('an opt-in region shows the banner and Allow re-queues the same page view', () => {
  const { window, appended, panel, tag } = loadConsentPage();
  assert.equal(pageViews(window.dataLayer).length, 1);
  window.google_tag_data = { ics: { entries: { analytics_storage: { default: false } } } };
  tag.listeners.load();
  assert.equal(appended.length, 1);

  panel.children[1].children[0].onclick();
  const views = pageViews(window.dataLayer);
  assert.equal(views.length, 2);
  assert.equal(views[1][2].page_location, views[0][2].page_location);
  const update = window.dataLayer.map(entry => Array.from(entry)).find(entry => entry[0] === 'consent' && entry[1] === 'update');
  assert.equal(update[2].analytics_storage, 'granted');
  assert.equal(update[2].ad_storage, 'granted');
  assert.equal(update[2].ad_user_data, 'granted');
  assert.equal(update[2].ad_personalization, 'granted');
});

test('Reject in an opt-in region keeps one cookieless page view and denies every signal', () => {
  const { window, panel, tag } = loadConsentPage();
  window.google_tag_data = { ics: { entries: { analytics_storage: { default: false } } } };
  tag.listeners.load();
  panel.children[1].children[1].onclick();
  const calls = window.dataLayer.map(entry => Array.from(entry));
  assert.equal(calls.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 1);
  const update = calls.find(entry => entry[0] === 'consent' && entry[1] === 'update');
  assert.equal(update[2].analytics_storage, 'denied');
  assert.equal(update[2].ad_storage, 'denied');
  assert.equal(update[2].ad_user_data, 'denied');
  assert.equal(update[2].ad_personalization, 'denied');
});

test('a stored grant or denial overrides the regional default and local storage wins over the cookie', () => {
  const shared = loadConsentPage({ cookie: 'nexscope_analytics_consent_v1=granted' });
  const granted = consentDefaults(shared.window.dataLayer);
  assert.equal(granted.length, 1);
  assert.equal(granted[0][2].analytics_storage, 'granted');
  assert.equal(granted[0][2].ad_storage, 'granted');
  assert.equal(granted[0][2].region, undefined);
  assert.equal(pageViews(shared.window.dataLayer).length, 1);
  shared.window.google_tag_data = { ics: { entries: { analytics_storage: { default: true } } } };
  shared.tag.listeners.load();
  assert.equal(shared.appended.length, 0);

  const denied = loadConsentPage({ consent: 'denied' });
  const deniedDefault = consentDefaults(denied.window.dataLayer)[0][2];
  assert.equal(deniedDefault.analytics_storage, 'denied');
  assert.equal(deniedDefault.ad_storage, 'denied');
  assert.equal(deniedDefault.ad_user_data, 'denied');
  assert.equal(deniedDefault.ad_personalization, 'denied');
  assert.equal(deniedDefault.region, undefined);
  denied.window.google_tag_data = { ics: { entries: { analytics_storage: { default: false } } } };
  denied.tag.listeners.load();
  assert.equal(denied.appended.length, 0);

  const localWins = loadConsentPage({
    consent: 'denied',
    cookie: 'nexscope_analytics_consent_v1=granted',
  });
  assert.equal(consentDefaults(localWins.window.dataLayer)[0][2].analytics_storage, 'denied');
});

test('Cookie settings opens the banner even where measurement is already allowed', () => {
  const { window, appended, listeners } = loadConsentPage({ consent: 'granted' });
  assert.equal(appended.length, 0);
  const link = {
    href: 'https://learn.nexscope.ai/ecommerce-ai-tools/#analytics-preferences',
    hash: '#analytics-preferences',
    origin: 'https://learn.nexscope.ai',
    textContent: 'Cookie settings',
    getAttribute() { return null; },
  };
  let prevented = false;
  listeners.click[1]({
    target: { closest(selector) { return selector === 'a[href]' ? link : null; } },
    preventDefault() { prevented = true; },
  });
  assert.equal(prevented, true);
  assert.equal(appended.length, 1);
  assert.equal(pageViews(window.dataLayer).length, 1);
});

test('page location keeps ads click ids and drops unrelated query params', () => {
  const gclid = `CjwKCAjw${'A'.repeat(120)}`;
  const href = `https://learn.nexscope.ai/ecommerce-ai-tools/?utm_source=google&utm_medium=cpc&utm_id=camp-1&gclid=${gclid}&gbraid=0A1B_gbraid.1&wbraid=WBRAID-1&gclsrc=aw.ds&dclid=display-1&gad_source=1&gad_campaignid=99&srsltid=shop-1&msclkid=bing-click&token=private&fbclid=social#section`;
  const { window } = loadConsentPage({ consent: 'granted', href });
  const location = window.dataLayer.map(entry => Array.from(entry)).find(entry => entry[0] === 'config')[2].page_location;
  const params = new URL(location).searchParams;
  assert.equal(params.get('utm_source'), 'google');
  assert.equal(params.get('utm_medium'), 'cpc');
  assert.equal(params.get('utm_id'), 'camp-1');
  assert.equal(params.get('gclid'), gclid);
  assert.equal(params.get('gbraid'), '0A1B_gbraid.1');
  assert.equal(params.get('wbraid'), 'WBRAID-1');
  assert.equal(params.get('gclsrc'), 'aw.ds');
  assert.equal(params.get('dclid'), 'display-1');
  assert.equal(params.get('gad_source'), '1');
  assert.equal(params.get('gad_campaignid'), '99');
  assert.equal(params.get('srsltid'), 'shop-1');
  assert.equal(params.get('msclkid'), 'bing-click');
  assert.equal(params.has('token'), false);
  assert.equal(params.has('fbclid'), false);
  assert.equal(location.includes('private'), false);
  assert.equal(location.includes('#'), false);
  const view = pageViews(window.dataLayer)[0][2];
  assert.equal(view.page_location, location);
});

test('client-side navigations send one page view per sanitized URL', () => {
  const { window, listeners, location } = loadConsentPage({
    consent: 'granted',
    href: 'https://learn.nexscope.ai/ecommerce-ai-tools/guides/?utm_source=chatgpt.com&token=private',
  });
  assert.equal(pageViews(window.dataLayer).length, 1);
  window.history.pushState({}, '', '/ecommerce-ai-tools/pricing/?token=private&gclid=CLICKID');
  const views = pageViews(window.dataLayer);
  assert.equal(views.length, 2);
  assert.equal(views[1][2].page_location, 'https://learn.nexscope.ai/ecommerce-ai-tools/pricing/?gclid=CLICKID');
  assert.equal(views[1][2].page_referrer, 'https://learn.nexscope.ai/ecommerce-ai-tools/guides/?utm_source=chatgpt.com');
  assert.equal(views[1][2].landing_path, '/ecommerce-ai-tools/guides/');
  window.history.replaceState({}, '', '/ecommerce-ai-tools/pricing/?token=private&gclid=CLICKID');
  assert.equal(pageViews(window.dataLayer).length, 2);
  location.href = 'https://learn.nexscope.ai/ecommerce-ai-tools/guides/?utm_source=chatgpt.com&token=private';
  listeners.popstate[0]();
  const restored = pageViews(window.dataLayer);
  assert.equal(restored.length, 3);
  assert.equal(restored[2][2].page_location, 'https://learn.nexscope.ai/ecommerce-ai-tools/guides/?utm_source=chatgpt.com');
});
