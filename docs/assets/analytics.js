(() => {
  if (window.nexscopeAnalyticsLoaded) return;
  window.nexscopeAnalyticsLoaded = true;

  // This public identifier is intentionally shared with www.nexscope.ai so GA4
  // can report Learn and the main site together. It is not an API credential.
  const measurementId = 'G-55CJ5T3HHS';
  const consentKey = 'nexscope_marketing_analytics_consent';
  const consentCookieKey = 'nexscope_analytics_consent_v1';
  const learnHost = 'learn.nexscope.ai';
  // Learn pages share the nexscope.ai cookie domain. Only decorate links that
  // leave Learn for the main site; same-site navigation needs no `_gl`.
  const linkedDomains = ['www.nexscope.ai', 'nexscope.ai'];
  // Google matches these ISO codes to the visitor IP inside gtag.js. Everyone
  // else gets the unscoped default below. A stored choice replaces both.
  const optInRegions = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
  ];

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

  const signals = (value) => ({
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
  window.dataLayer = window.dataLayer || [];
  // oxlint-disable-next-line prefer-rest-params -- Google gtag.js requires the Arguments object.
  window.gtag = function () { window.dataLayer.push(arguments); };
  if (consent === 'granted' || consent === 'denied') {
    window.gtag('consent', 'default', signals(consent));
  } else {
    window.gtag('consent', 'default', { ...signals('denied'), region: optInRegions });
    window.gtag('consent', 'default', signals('granted'));
  }
  window.gtag('set', 'ads_data_redaction', true);
  // Keep ad click ids on the URL when ad storage is denied, instead of cookies.
  window.gtag('set', 'url_passthrough', true);
  window.gtag('js', new Date());

  const utmParams = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'utm_id', 'utm_source_platform', 'utm_creative_format', 'utm_marketing_tactic',
  ];
  const clickParams = [
    'gclid', 'gbraid', 'wbraid', 'gclsrc', 'dclid', 'gad_source',
    'gad_campaignid', 'srsltid', 'msclkid',
  ];
  const pageLocation = () => {
    const current = new URL(location.href);
    const params = new URLSearchParams(current.search);
    current.search = '';
    current.hash = '';
    for (const name of utmParams) {
      const value = params.get(name);
      if (value && /^[\w .-]{1,100}$/.test(value)) current.searchParams.set(name, value);
    }
    for (const name of clickParams) {
      const value = params.get(name);
      if (value && /^[A-Za-z0-9._~-]{1,500}$/.test(value)) current.searchParams.set(name, value);
    }
    return current.href;
  };
  const page = new URL(pageLocation());
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

  // One page view per distinct sanitized URL. send_page_view stays off so the
  // config hit is not counted again. History changes cover client-side routes;
  // a full load runs this script again. Same-URL replaceState is ignored.
  // Re-queuing the same URL after opt-in does not add a second page_view:
  // gtag keeps one and sends a granted engagement hit with the client id.
  let lastSent = '';
  let lastReferrer = referrer;
  const sendPageView = (force) => {
    const loc = pageLocation();
    if (!force && loc === lastSent) return;
    const referrerForHit = loc === lastSent ? lastReferrer : (lastSent || referrer);
    lastReferrer = referrerForHit;
    lastSent = loc;
    const attribution = window.nexscopeTrafficAttribution || {};
    window.gtag('event', 'page_view', {
      page_location: loc,
      page_title: document.title,
      page_referrer: referrerForHit || undefined,
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
      landing_path: attribution.trafficLandingPath || page.pathname,
      transport_type: 'beacon',
      ...(new URLSearchParams(location.search).get('ga_debug') === '1' ? { debug_mode: true } : {}),
    });
  };
  sendPageView();
  if (window.history && typeof window.history.pushState === 'function') {
    for (const name of ['pushState', 'replaceState']) {
      const original = window.history[name];
      window.history[name] = function historyChange(...args) {
        const result = Reflect.apply(original, this, args);
        sendPageView();
        return result;
      };
    }
    window.addEventListener?.('popstate', () => sendPageView());
  }

  const sellerIntents = new Set(['product-visibility', 'product-page-review', 'product-media-review']);
  const sellerEvent = (name, properties) => {
    const traffic = window.nexscopeTrafficAttribution || {};
    window.gtag('event', name, {
      ...properties,
      traffic_source: traffic.trafficSource || 'direct_or_unknown',
      traffic_medium: traffic.trafficMedium || 'none',
      traffic_campaign: traffic.trafficCampaign || undefined,
      traffic_landing_path: traffic.trafficLandingPath || page.pathname,
      source_page: page.pathname,
      transport_type: 'beacon',
    });
  };
  const sellerIntent = document.body?.getAttribute?.('data-seller-intent');
  if (sellerIntents.has(sellerIntent) && page.pathname === `/ecommerce-ai-tools/seller-help/${sellerIntent}/`) {
    sellerEvent('seller_help_view', { seller_intent: sellerIntent });
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;

  // Keep the event useful for Learn -> main-site analysis while preserving the
  // existing co-from=learn handoff and the original acquisition source.
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    const reviewPlacement = link.getAttribute('data-showcase-submit-cta')
      || link.getAttribute('data-cta-placement') || 'body-link';
    if (/^[a-z0-9-]{1,60}$/.test(reviewPlacement || '') && url.origin === page.origin
        && url.pathname === '/ecommerce-ai-tools/product-showcase/submit/'
        && url.pathname !== page.pathname) {
      sellerEvent('product_showcase_submit_click', { cta_placement: reviewPlacement });
    }
    const intent = link.getAttribute('data-seller-help');
    if (sellerIntents.has(intent) && url.origin === page.origin
        && url.pathname === `/ecommerce-ai-tools/seller-help/${intent}/`) {
      sellerEvent('seller_help_open', { seller_intent: intent });
    }
    const productAction = link.getAttribute('data-track-product');
    const productId = link.getAttribute('data-product-id');
    const placement = link.getAttribute('data-product-placement');
    if (
      ['gallery', 'source', 'related'].includes(productAction)
      && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(productId || '')
      && /^[a-z0-9-]{1,60}$/.test(placement || '')
    ) {
      const productPath = `/ecommerce-ai-tools/product-showcase/product/${productId}/`;
      const isDetailLink = url.origin === location.origin && url.pathname === productPath;
      const isCurrentDetailPage = /^\/ecommerce-ai-tools\/product-showcase\/product\/[0-9a-f-]{36}\/$/i.test(location.pathname);
      if ((productAction === 'source' && location.pathname === productPath &&
           /^https?:$/.test(url.protocol) && url.origin !== location.origin) ||
          (productAction === 'gallery' && isDetailLink) ||
          (productAction === 'related' && isCurrentDetailPage && isDetailLink)) {
        window.gtag('event', `product_${productAction}_click`, {
          product_id: productId,
          placement,
          source_page: location.pathname,
          destination_host: url.hostname,
          ...(isDetailLink ? { destination_path: url.pathname } : {}),
          transport_type: 'beacon',
          ...(new URLSearchParams(location.search).get('ga_debug') === '1' ? { debug_mode: true } : {}),
        });
      }
    }
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
    if (isMainSite && productAction !== 'source') {
      window.gtag('event', 'start_using_click', {
        link_domain: url.hostname,
        link_path: url.pathname,
        link_text: link.textContent.trim().slice(0, 120),
        co_from: url.searchParams.get('co-from') || undefined,
        cta_placement: link.getAttribute('data-cta-placement') || undefined,
        step_id: link.getAttribute('data-step-id') || undefined,
        buyer_intent: link.getAttribute('data-buyer-intent') || 'unspecified',
        landing_source: window.nexscopeTrafficAttribution?.trafficSource || 'direct_or_unknown',
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
  const analyticsGrantedNow = () => {
    const entry = window.google_tag_data?.ics?.entries?.analytics_storage;
    if (entry && typeof entry === 'object') {
      if (typeof entry.update === 'boolean') return entry.update;
      if (typeof entry.default === 'boolean') return entry.default;
    }
    return consent === 'granted';
  };
  for (const [label, value] of [['Allow analytics', 'granted'], ['Reject', 'denied']]) {
    const button = document.createElement('button');
    button.textContent = label;
    button.style.cssText = value === 'granted'
      ? 'padding:9px 12px;border:1px solid #6250e9;border-radius:8px;cursor:pointer;background:#6250e9;color:white;font-weight:600'
      : 'padding:9px 12px;border:1px solid #ded9f2;border-radius:8px;cursor:pointer;background:white;color:#4032a0;font-weight:600';
    button.onclick = () => {
      const alreadyGranted = analyticsGrantedNow();
      consent = value;
      writeConsent(value);
      panel.remove();
      window.gtag('consent', 'update', signals(value));
      // Re-queue the landing view after opt-in. gtag keeps one page_view for
      // this URL and sends a granted engagement hit that carries the client id.
      if (value === 'granted' && !alreadyGranted) sendPageView(true);
    };
    actions.append(button);
  }
  panel.append(actions);
  const showPanel = () => {
    if (!document.body || panel.isConnected) return;
    document.body.append(panel);
  };
  // Show the prompt only where gtag resolved a denied default: EEA, UK, and
  // Switzerland, by IP. The value is filled in as gtag.js starts, so check
  // until it is known. Granted regions are not interrupted. Cookie settings
  // can still open this panel anywhere.
  const consentResolved = () => {
    if (consent || panel.isConnected) return true;
    const entry = window.google_tag_data?.ics?.entries?.analytics_storage;
    const decided = entry?.default;
    if (decided === false) showPanel();
    return decided === true || decided === false;
  };
  if (typeof script.addEventListener === 'function') {
    script.addEventListener('load', () => {
      if (consentResolved()) return;
      let tries = 0;
      const timer = setInterval(() => {
        tries += 1;
        if (consentResolved() || tries > 25) clearInterval(timer);
      }, 100);
    });
  }
  document.head.appendChild(script);
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest?.('a[href]');
    if (!trigger || trigger.hash !== '#analytics-preferences' || trigger.origin !== location.origin) return;
    event.preventDefault();
    showPanel();
    panel.querySelector('button')?.focus();
  }, true);
})();
