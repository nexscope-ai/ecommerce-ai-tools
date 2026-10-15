(() => {
  if (window.nexscopeAnalyticsLoaded) return;
  window.nexscopeAnalyticsLoaded = true;

  // This public identifier is intentionally shared with www.nexscope.ai so GA4
  // can report Learn and the main site together. It is not an API credential.
  const measurementId = 'G-55CJ5T3HHS';
  const consentKey = 'nexscope_marketing_analytics_consent';
  const learnHost = 'learn.nexscope.ai';
  const linkedDomains = ['learn.nexscope.ai', 'www.nexscope.ai', 'nexscope.ai'];
  let consent;
  try { consent = localStorage.getItem(consentKey); } catch (_) { /* Storage unavailable. */ }

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
  try { referrer = new URL(document.referrer).origin; } catch (_) { /* No usable referrer. */ }

  window.gtag('config', measurementId, {
    page_location: page.href,
    page_title: document.title,
    page_referrer: referrer,
    page_hostname: learnHost,
    cookie_domain: 'nexscope.ai',
    linker: { domains: linkedDomains, decorate_forms: false },
    content_group: 'learn',
    site_surface: 'learn',
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

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
    const isMainSite = ['www.nexscope.ai', 'nexscope.ai'].includes(url.hostname);
    if (isMainSite && link.hasAttribute('data-track')) {
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
      try { localStorage.setItem(consentKey, value); } catch (_) { /* Choice applies this visit. */ }
      panel.remove();
      window.gtag('consent', 'update', { analytics_storage: value });
    };
    actions.append(button);
  }
  panel.append(actions);
  if (!consent) document.body.append(panel);
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest?.('a[href]');
    if (!trigger || trigger.hash !== '#analytics-preferences' || trigger.origin !== location.origin) return;
    event.preventDefault();
    document.body.append(panel);
    panel.querySelector('button')?.focus();
  }, true);
})();
