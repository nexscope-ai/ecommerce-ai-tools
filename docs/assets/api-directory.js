/* Build-time HTML remains browsable without JavaScript. No API requests here. */
(() => {
  function track(name, properties) {
    if (typeof window.gtag !== 'function') return;
    const traffic = window.nexscopeTrafficAttribution || {};
    window.gtag('event', name, {
      ...properties, source_page: window.location.pathname,
      traffic_source: traffic.trafficSource || 'direct_or_unknown',
      traffic_medium: traffic.trafficMedium || 'none',
      traffic_landing_path: traffic.trafficLandingPath || window.location.pathname,
      transport_type: 'beacon',
    });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-data-category]');
    if (!link) return;
    const apiSlug = link.getAttribute('data-api-slug');
    track(apiSlug ? 'data_api_open' : 'data_api_category_click', {
      data_category: link.getAttribute('data-data-category'), api_slug: apiSlug || undefined,
      link_path: new URL(link.href, window.location.href).pathname,
      co_from: apiSlug ? 'learn' : undefined,
    });
  });
  const directory = document.querySelector('[data-data-directory]');
  if (!directory) return;
  const search = document.getElementById('api-search');
  const count = directory.querySelector('[data-api-count]');
  const empty = directory.querySelector('[data-api-empty]');
  const clear = directory.querySelector('[data-clear-search]');
  const platformButtons = [...directory.querySelectorAll('[data-platform-filter]')];
  const viewButtons = [...directory.querySelectorAll('[data-directory-view]')];
  const sections = [...directory.querySelectorAll('[data-results-kind]')];
  const isRoot = directory.dataset.directoryKind === 'root';
  let platform = '';
  let view = isRoot ? 'categories' : 'apis';
  function update() {
    const words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const activeView = words.length && isRoot ? 'apis' : view;
    let total = 0;
    for (const section of sections) {
      let visible = 0;
      for (const card of section.querySelectorAll('[data-api-search]')) {
        const match = (!platform || card.dataset.platform === platform) && words.every(word => card.dataset.apiSearch.includes(word));
        card.hidden = !match;
        if (match) visible++;
      }
      section.hidden = section.dataset.resultsKind !== activeView || visible === 0;
      if (section.dataset.resultsKind === activeView) total += visible;
    }
    count.textContent = `${total} ${activeView === 'categories' ? (total === 1 ? 'category' : 'categories') : (total === 1 ? 'API' : 'APIs')} ${words.length || platform ? 'matching your selection' : 'available'}`;
    empty.hidden = total > 0;
    clear.hidden = words.length === 0;
    for (const button of platformButtons) button.setAttribute('aria-pressed', String(button.getAttribute('data-platform-filter') === platform));
    for (const button of viewButtons) button.setAttribute('aria-pressed', String(button.getAttribute('data-directory-view') === activeView));
  }
  search.addEventListener('input', update);
  clear.addEventListener('click', () => { search.value = ''; update(); search.focus(); });
  for (const button of platformButtons) button.addEventListener('click', () => {
    platform = button.getAttribute('data-platform-filter'); update();
    track('data_api_platform_filter', { data_platform: platform || 'all' });
  });
  for (const button of viewButtons) button.addEventListener('click', () => {
    view = button.getAttribute('data-directory-view');
    if (view === 'categories') search.value = '';
    update();
  });
  directory.querySelector('[data-reset-filters]').addEventListener('click', () => { platform = ''; search.value = ''; view = isRoot ? 'categories' : 'apis'; update(); search.focus(); });
  for (const control of directory.querySelectorAll('[data-api-filters], [data-platform-filters], [data-view-switch]')) control.hidden = false;
  update();
})();
