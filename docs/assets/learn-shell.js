/* Navigation for standalone, generated Data pages; no account or API access. */
(() => {
  const toggle = document.querySelector('.primary-menu-toggle');
  const navigation = document.querySelector('.primary-navigation');
  if (!toggle || !navigation) return;
  const compact = window.matchMedia('(max-width: 1180px)');
  const setOpen = (open, focus = false) => {
    const expanded = Boolean(open && compact.matches);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
    navigation.classList.toggle('is-open', expanded);
    if (!expanded && focus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => { if (event.target.closest('a[href]')) setOpen(false); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true); });
  document.addEventListener('click', event => { if (!navigation.contains(event.target) && !toggle.contains(event.target)) setOpen(false); });
  compact.addEventListener('change', () => setOpen(false));
})();
