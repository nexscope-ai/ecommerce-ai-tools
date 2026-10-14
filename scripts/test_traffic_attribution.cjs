const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const script = fs.readFileSync('docs/assets/traffic-attribution.js', 'utf8');
const values = new Map();
const sessionStorage = {
  getItem: key => values.get(key) || null,
  setItem: (key, value) => values.set(key, value),
};

function visit(url, referrer, now) {
  const parsed = new URL(url);
  const window = {
    location: { search: parsed.search, pathname: parsed.pathname, hostname: parsed.hostname },
    sessionStorage,
  };
  vm.runInNewContext(script, { window, document: { referrer }, URL, URLSearchParams, Date: { now: () => now } });
  return window.nexscopeTrafficAttribution;
}

let traffic = visit('https://learn.nexscope.ai/ecommerce-ai-tools/guides/example/?private=secret',
  'https://chatgpt.com/c/secret-conversation', 1000);
assert.equal(traffic.trafficSource, 'chatgpt.com');
assert.equal(traffic.trafficMedium, 'ai_referral');
assert.equal(traffic.trafficReferrerHost, 'chatgpt.com');
assert.equal(traffic.trafficLandingPath, '/ecommerce-ai-tools/guides/example/');
assert.equal(JSON.stringify(traffic).includes('secret'), false);

traffic = visit('https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/submit/',
  'https://learn.nexscope.ai/ecommerce-ai-tools/guides/example/', 2000);
assert.equal(traffic.trafficSource, 'chatgpt.com');
assert.equal(traffic.trafficLandingPath, '/ecommerce-ai-tools/guides/example/');

traffic = visit('https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/submit/?utm_source=newsletter&utm_medium=email&utm_campaign=october',
  '', 3000);
assert.equal(traffic.trafficSource, 'newsletter');
assert.equal(traffic.trafficMedium, 'email');
assert.equal(traffic.trafficCampaign, 'october');
assert.equal(traffic.trafficEvidence, 'utm');

traffic = visit('https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/submit/', '', 31 * 60 * 1000 + 3000);
assert.equal(traffic.trafficSource, 'direct_or_unknown');
assert.equal(traffic.trafficEvidence, 'none');

traffic = visit('https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/submit/?gclid=private-click-id',
  '', 31 * 60 * 1000 + 4000);
assert.equal(traffic.trafficSource, 'google');
assert.equal(traffic.trafficMedium, 'cpc');
assert.equal(traffic.trafficEvidence, 'click_id');
assert.equal(JSON.stringify(traffic).includes('private-click-id'), false);

traffic = visit('https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/submit/',
  'https://gemini.google.com/app/private-chat', 31 * 60 * 1000 + 5000);
assert.equal(traffic.trafficSource, 'gemini.google.com');
assert.equal(traffic.trafficMedium, 'ai_referral');

console.log('Traffic attribution checks passed');
