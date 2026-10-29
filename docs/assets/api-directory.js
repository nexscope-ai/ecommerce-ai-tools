/* All API links and content remain available when JavaScript is disabled. */
(() => {
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-data-category]');
    if (!link || typeof window.gtag !== 'function') return;
    const apiSlug = link.getAttribute('data-api-slug');
    const traffic = window.nexscopeTrafficAttribution || {};
    window.gtag('event', apiSlug ? 'data_api_open' : 'data_api_category_click', {
      data_category: link.getAttribute('data-data-category'),
      api_slug: apiSlug || undefined,
      source_page: window.location.pathname,
      link_path: new URL(link.href, window.location.href).pathname,
      co_from: apiSlug ? 'learn' : undefined,
      traffic_source: traffic.trafficSource || 'direct_or_unknown',
      traffic_medium: traffic.trafficMedium || 'none',
      traffic_landing_path: traffic.trafficLandingPath || window.location.pathname,
      transport_type: 'beacon',
    });
  });
  const filters = document.querySelector('[data-api-filters]');
  if (!filters) return;
  const search = document.getElementById('api-search');
  const category = document.getElementById('api-category');
  const groups = [...document.querySelectorAll('[data-api-group]')];
  const count = document.querySelector('[data-api-count]');
  const empty = document.querySelector('[data-api-empty]');
  function update() {
    const words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let total = 0;
    for (const group of groups) {
      let visible = 0;
      for (const card of group.querySelectorAll('[data-api-search]')) {
        const match = (!category.value || category.value === group.dataset.apiGroup)
          && words.every(word => card.dataset.apiSearch.includes(word));
        card.hidden = !match;
        if (match) visible++;
      }
      group.hidden = visible === 0;
      total += visible;
    }
    const unit = count.dataset?.unit === 'category' ? (total === 1 ? 'category matches' : 'categories match') : (total === 1 ? 'API matches' : 'APIs match');
    count.textContent = `${total} ${unit} your selection`;
    empty.hidden = total > 0;
  }
  filters.hidden = false;
  search.addEventListener('input', update);
  category.addEventListener('change', update);
})();
