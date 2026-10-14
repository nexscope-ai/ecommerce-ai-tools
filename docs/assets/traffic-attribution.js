(() => {
  const storageKey = 'nexscope_learn_traffic_attribution_v1';
  const maxAge = 30 * 60 * 1000;
  const params = new URLSearchParams(window.location.search);
  const token = value => /^[a-z0-9_. -]{1,100}$/i.test(value || '') ? value.trim().toLowerCase() : '';
  const host = value => /^[a-z0-9.-]{1,100}$/i.test(value || '') ? value.toLowerCase() : '';
  let referrerHost = '';
  try { referrerHost = host(new URL(document.referrer).hostname); } catch (_) { /* No usable referrer. */ }
  const externalHost = referrerHost && referrerHost !== window.location.hostname.toLowerCase()
    ? referrerHost : '';
  const utmSource = token(params.get('utm_source'));
  const utmMedium = token(params.get('utm_medium'));
  const utmCampaign = token(params.get('utm_campaign'));
  // Only the presence of an ad click ID is used; its value never leaves the browser.
  const paidSearchSource = params.has('gclid') || params.has('gbraid') || params.has('wbraid')
    ? 'google' : params.has('msclkid') ? 'bing' : '';
  const source = utmSource || paidSearchSource || externalHost || 'direct_or_unknown';
  const aiHost = /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|poe\.com|grok\.com|you\.com)$/.test(source)
    || /^(chatgpt|perplexity|claude|copilot|gemini)$/.test(source)
    || /^(gemini\.google\.com|copilot\.microsoft\.com)$/.test(source);
  const searchHost = /(^|\.)(google|bing|yahoo|duckduckgo|baidu|yandex)\./.test(source)
    || /^(google|bing|yahoo|duckduckgo|baidu|yandex)$/.test(source);
  const socialHost = /(^|\.)(x\.com|twitter\.com|facebook\.com|instagram\.com|linkedin\.com|t\.co)$/.test(source)
    || /^(x|twitter|facebook|instagram|linkedin)$/.test(source);
  const fresh = {
    trafficSource: source,
    trafficMedium: utmMedium || (paidSearchSource ? 'cpc' : aiHost ? 'ai_referral' : searchHost ? 'organic' : socialHost ? 'social' : externalHost ? 'referral' : 'none'),
    trafficCampaign: utmCampaign,
    trafficReferrerHost: externalHost,
    trafficLandingPath: window.location.pathname.slice(0, 256),
    trafficEvidence: utmSource ? 'utm' : paidSearchSource ? 'click_id' : externalHost ? 'referrer' : 'none',
    savedAt: Date.now(),
  };
  let previous = null;
  try { previous = JSON.parse(window.sessionStorage.getItem(storageKey) || 'null'); } catch (_) { /* Storage may be unavailable. */ }
  const internalNavigation = !utmSource && !paidSearchSource && !externalHost;
  const age = Date.now() - previous?.savedAt;
  const attribution = internalNavigation && previous && age >= 0 && age < maxAge ? previous : fresh;
  attribution.savedAt = Date.now();
  try { window.sessionStorage.setItem(storageKey, JSON.stringify(attribution)); } catch (_) { /* Attribution must not block the form. */ }
  window.nexscopeTrafficAttribution = Object.freeze({
    trafficSource: attribution.trafficSource,
    trafficMedium: attribution.trafficMedium,
    trafficCampaign: attribution.trafficCampaign,
    trafficReferrerHost: attribution.trafficReferrerHost,
    trafficLandingPath: attribution.trafficLandingPath,
    trafficEvidence: attribution.trafficEvidence,
  });
})();
