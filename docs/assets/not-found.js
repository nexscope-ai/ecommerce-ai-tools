(() => {
  const path = document.querySelector('[data-requested-path]');
  if (path) path.textContent = window.location.pathname;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_not_found', { source_page: '404', transport_type: 'beacon' });
  }
})();
