/* Navigation for standalone, generated Data pages; no account or API access. */
(() => {
  const toggle = document.querySelector('.primary-menu-toggle');
  const navigation = document.querySelector('.primary-navigation');
  if (!toggle || !navigation) return;
  const compact = window.matchMedia('(max-width: 1050px)');
  const setOpen = (open, focus = false) => {
    const expanded = Boolean(open && compact.matches);
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
    navigation.classList.toggle('is-open', expanded);
    if (!expanded && focus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => { if (event.target.closest('a[href]')) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
    if (document.querySelector('.trends-header .nav-dropdown > details[open]')) return;
    setOpen(false, true);
  });
  document.addEventListener('click', event => { if (!navigation.contains(event.target) && !toggle.contains(event.target)) setOpen(false); });
  compact.addEventListener('change', () => setOpen(false));
  bindHeaderDropdowns(document);

  function bindHeaderDropdowns(doc) {
    const headerMenus = [...doc.querySelectorAll('.trends-header .nav-dropdown > details')];
    if (!headerMenus.length) return;
    const closeMenu = menu => { menu.open = false; };
    // A pointer press focuses the next summary before click. Closing an in-flow
    // mobile menu at that moment shifts the summary out from under the pointer.
    let pointerGesture = false;
    doc.addEventListener('pointerdown', () => { pointerGesture = true; }, true);
    doc.addEventListener('click', () => { pointerGesture = false; }, true);
    doc.addEventListener('pointerup', () => { setTimeout(() => { pointerGesture = false; }, 0); }, true);
    doc.addEventListener('pointercancel', () => { pointerGesture = false; }, true);
    headerMenus.forEach(menu => {
      menu.addEventListener('toggle', () => {
        if (!menu.open) return;
        headerMenus.forEach(other => { if (other !== menu) closeMenu(other); });
      });
      menu.addEventListener('focusout', event => {
        if (pointerGesture || !event.relatedTarget || menu.contains(event.relatedTarget)) return;
        closeMenu(menu);
      });
    });
    doc.addEventListener('click', event => {
      headerMenus.forEach(menu => {
        if (menu.open && !menu.contains(event.target)) closeMenu(menu);
      });
    }, true);
    doc.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const openMenus = headerMenus.filter(menu => menu.open);
      if (!openMenus.length) return;
      const focused = openMenus.find(menu => menu.contains(doc.activeElement)) || openMenus[openMenus.length - 1];
      event.preventDefault();
      openMenus.forEach(closeMenu);
      focused.querySelector('summary')?.focus();
    });
  }
})();
