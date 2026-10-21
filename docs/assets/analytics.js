(() => {
  if (window.nexscopeAnalyticsLoaded) return;
  window.nexscopeAnalyticsLoaded = true;

  // This public identifier is intentionally shared with www.nexscope.ai so GA4
  // can report Learn and the main site together. It is not an API credential.
  const measurementId = 'G-55CJ5T3HHS';
  const consentKey = 'nexscope_marketing_analytics_consent';
  const consentCookieKey = 'nexscope_analytics_consent_v1';
  const learnHost = 'learn.nexscope.ai';
  const linkedDomains = ['learn.nexscope.ai', 'www.nexscope.ai', 'nexscope.ai'];

  const readConsentCookie = () => {
    try {
      const match = document.cookie.match(new RegExp('(?:^|; )' + consentCookieKey + '=([^;]*)'));
      const value = match ? decodeURIComponent(match[1]) : '';
      return value === 'granted' || value === 'denied' ? value : '';
    } catch (_) { return ''; }
  };
  const readConsent = () => {
    try {
      const value = window.localStorage.getItem(consentKey);
      if (value === 'granted' || value === 'denied') return value;
    } catch (_) { /* Storage unavailable. */ }
    return readConsentCookie();
  };
  const writeConsent = (value) => {
    try { window.localStorage.setItem(consentKey, value); } catch (_) { /* Storage unavailable. */ }
    // A first-party cookie is the only consent signal that can cross the Learn
    // and main-site subdomains. The main site can adopt this key without
    // exposing analytics identifiers or user data.
    try {
      document.cookie = `${consentCookieKey}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; Domain=.nexscope.ai; SameSite=Lax`;
    } catch (_) { /* Cookie writes may be blocked. */ }
  };
  let consent = readConsent();

  window.dataLayer = window.dataLayer || [];
  // oxlint-disable-next-line prefer-rest-params -- Google gtag.js requires the Arguments object.
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: consent === 'granted' ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('js', new Date());

  const page = new URL(location.href);
  page.search = '';
  page.hash = '';
  for (const name of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = new URLSearchParams(location.search).get(name);
    if (value && /^[\w .-]{1,100}$/.test(value)) page.searchParams.set(name, value);
  }
  let referrer = '';
  try {
    const sourceUrl = new URL(document.referrer);
    referrer = sourceUrl.origin + sourceUrl.pathname.slice(0, 500);
  } catch (_) { /* No usable referrer. */ }
  window.gtag('config', measurementId, {
    page_location: page.href,
    page_title: document.title,
    page_hostname: learnHost,
    cookie_domain: 'nexscope.ai',
    linker: { domains: linkedDomains, decorate_forms: false },
    send_page_view: false,
    content_group: 'learn',
    site_surface: 'learn',
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    url_passthrough: true,
  });

  // Keep the page-view contract explicit. A new visitor starts with consent
  // denied, so do not queue a page_view until analytics is explicitly allowed.
  // The guard still ensures that a document sends at most one page_view.
  let pageViewSent = false;
  const sendPageView = () => {
    if (pageViewSent || consent !== 'granted') return;
    pageViewSent = true;
    const attribution = window.nexscopeTrafficAttribution || {};
    window.gtag('event', 'page_view', {
      page_location: page.href,
      page_title: document.title,
      page_referrer: referrer || undefined,
      page_hostname: learnHost,
      content_group: 'learn',
      site_surface: 'learn',
      // Keep the landing source available in GA4 even when the visitor moves
      // between Learn pages before the first conversion. These are derived
      // from UTM/referrer metadata and contain no user-identifying values.
      landing_source: attribution.trafficSource || 'direct_or_unknown',
      landing_medium: attribution.trafficMedium || 'none',
      landing_campaign: attribution.trafficCampaign || undefined,
      landing_referrer_host: attribution.trafficReferrerHost || undefined,
      landing_path: attribution.trafficLandingPath || location.pathname,
      transport_type: 'beacon',
      ...(new URLSearchParams(location.search).get('ga_debug') === '1' ? { debug_mode: true } : {}),
    });
  };
  if (consent === 'granted') sendPageView();

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(script);

  // Keep the event useful for Learn -> main-site analysis while preserving the
  // existing co-from=learn handoff and the original acquisition source.
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    const workflow = link.getAttribute('data-track-tool');
    if (workflow && /^[a-z0-9-]{1,80}$/.test(workflow) && url.origin === location.origin) {
      window.gtag('event', 'workflow_open_click', {
        workflow,
        source_page: location.pathname,
        transport_type: 'beacon',
      });
    }
    const communityAction = link.getAttribute('data-track-community');
    if (
      communityAction
      && /^[a-z0-9_-]{1,80}$/.test(communityAction)
      && url.hostname === 'github.com'
      && url.pathname.startsWith('/nexscope-ai/ecommerce-ai-tools/')
    ) {
      window.gtag('event', 'community_open_click', {
        community_action: communityAction,
        link_path: url.pathname,
        source_page: location.pathname,
        transport_type: 'beacon',
      });
    }
    const isMainSite = ['www.nexscope.ai', 'nexscope.ai'].includes(url.hostname);
    if (isMainSite) {
      window.gtag('event', 'start_using_click', {
        link_domain: url.hostname,
        link_path: url.pathname,
        link_text: link.textContent.trim().slice(0, 120),
        co_from: url.searchParams.get('co-from') || undefined,
        source_page: location.pathname,
        site_surface: learnHost,
        transport_type: 'beacon',
      });
    }
  });

  const panel = document.createElement('div');
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Analytics preferences');
  panel.style.cssText = 'position:fixed;bottom:16px;right:16px;width:min(380px,calc(100vw - 32px));z-index:9999;background:#fff;color:#211f26;border:1px solid #ded9f2;border-radius:14px;padding:16px 18px;box-shadow:0 16px 48px #211f2626;font:13px/1.5 Arial';
  const message = document.createElement('p');
  message.textContent = 'Allow analytics cookies? Rejecting keeps limited, cookieless measurement.';
  message.style.cssText = 'margin:0;line-height:1.5';
  panel.append(message);
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:12px';
  for (const [label, value] of [['Allow analytics', 'granted'], ['Reject', 'denied']]) {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = value === 'granted'
      ? 'padding:9px 12px;border:1px solid #6250e9;border-radius:8px;cursor:pointer;background:#6250e9;color:white;font-weight:600'
      : 'padding:9px 12px;border:1px solid #ded9f2;border-radius:8px;cursor:pointer;background:white;color:#4032a0;font-weight:600';
    button.onclick = () => {
      consent = value;
      writeConsent(value);
      panel.remove();
      window.gtag('consent', 'update', { analytics_storage: value });
      if (value === 'granted') sendPageView();
    };
    actions.append(button);
  }
  panel.append(actions);
  const showPanel = () => {
    if (!document.body || panel.isConnected) return;
    document.body.append(panel);
  };
  if (!consent) {
    if (document.body) showPanel();
    else document.addEventListener('DOMContentLoaded', showPanel, { once: true });
  }
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest?.('a[href]');
    if (!trigger || trigger.hash !== '#analytics-preferences' || trigger.origin !== location.origin) return;
    event.preventDefault();
    showPanel();
    panel.querySelector('button')?.focus();
  }, true);
})();
