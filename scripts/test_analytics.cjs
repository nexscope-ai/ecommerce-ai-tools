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
    hasAttribute() { return false; },
    getAttribute() { return null; },
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
});

test('Learn analytics waits for consent before sending the first page view', () => {
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
  assert.equal(beforeConsent.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 0);

  const allowButton = appended[0].children[1].children[0];
  allowButton.onclick();
  const afterConsent = window.dataLayer.map(entry => Array.from(entry));
  assert.equal(afterConsent.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 1);
  assert.equal(afterConsent.filter(entry => entry[0] === 'consent' && entry[1] === 'update')[0][2].analytics_storage, 'granted');
});

test('Learn analytics does not send a page view after rejecting analytics', () => {
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
  assert.equal(calls.filter(entry => entry[0] === 'event' && entry[1] === 'page_view').length, 0);
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
