(() => {
  // Keep all official product links on the agreed marketing attribution.
  document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href);
    if (url.hostname !== 'www.nexscope.ai' && url.hostname !== 'nexscope.ai') return;
    url.searchParams.delete('fpr');
    url.searchParams.set('co-from', 'githubIO');
    link.href = url.href;
    link.setAttribute('data-track', 'start_using');
  });

  const reportEvent = (name, properties) => {
    if (typeof window.gtag !== 'function') return false;
    window.gtag('event', name, {
      ...properties,
      source_page: window.location.pathname,
      transport_type: 'beacon',
    });
    return true;
  };

  document.addEventListener('click', event => {
    const link = event.target.closest?.('.resource-card a[href]');
    if (!link) return;
    const url = new URL(link.href);
    reportEvent('resource_opened', {
      resource_path: url.pathname,
      resource_title: link.querySelector('h3')?.textContent?.trim() || link.textContent.trim().slice(0, 100),
      resource_topic: link.closest('.resource-card')?.dataset.topic || 'unknown',
      resource_kind: link.closest('.resource-card')?.dataset.kind || 'unknown',
    });
  });

  const scrollMilestones = new Set();
  let scrollMeasurementScheduled = false;
  const measureScrollDepth = () => {
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
    );
    const scrollableHeight = Math.max(1, documentHeight - window.innerHeight);
    const percent = Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100));
    [25, 50, 75, 90].forEach(milestone => {
      if (percent < milestone || scrollMilestones.has(milestone)) return;
      if (reportEvent('scroll_depth', { percent_scrolled: milestone })) {
        scrollMilestones.add(milestone);
      }
    });
    scrollMeasurementScheduled = false;
  };
  const scheduleScrollMeasurement = () => {
    if (scrollMeasurementScheduled) return;
    scrollMeasurementScheduled = true;
    requestAnimationFrame(measureScrollDepth);
  };
  window.addEventListener('scroll', scheduleScrollMeasurement, { passive: true });
  window.addEventListener('resize', scheduleScrollMeasurement);
  scheduleScrollMeasurement();

  const controls = document.querySelector('.trend-controls');
  if (controls) {
    controls.hidden = false;
    const input = controls.querySelector('input');
    const buttons = [...controls.querySelectorAll('[data-kind-filter]')];
    const cards = [...document.querySelectorAll('.trend-card')];
    const count = document.querySelector('.result-count');
    let kind = 'all';
    const filter = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const match = (kind === 'all' || card.dataset.kind === kind) && card.textContent.toLowerCase().includes(query);
        card.hidden = !match;
        if (match) visible++;
      });
      const label = count.dataset.label || 'article';
      count.textContent = `${visible} ${label}${visible === 1 ? '' : 's'}`;
      const empty = document.querySelector('.empty-results');
      if (empty) empty.hidden = visible > 0;
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      kind = button.dataset.kindFilter;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      filter();
    }));
    input.addEventListener('input', filter);
    document.querySelector('.reset-search')?.addEventListener('click', () => {
      input.value = '';
      kind = 'all';
      buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === 0)));
      filter();
      input.focus();
    });
    filter();
  }
  const sidebar = document.querySelector('.reading-sidebar');
  if (!sidebar) return;
  const article = document.querySelector('main article');
  const headings = [...article.querySelectorAll('h2[id]')];
  if (!headings.length) return;
  sidebar.hidden = false;
  if (window.matchMedia('(max-width: 900px)').matches) sidebar.querySelector('details').open = false;
  const nav = sidebar.querySelector('nav');
  const links = headings.map(heading => {
    const link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    nav.append(link);
    return link;
  });
  const bar = document.querySelector('.reading-progress span');
  let scheduled = false;
  const update = () => {
    const top = article.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(1, article.offsetHeight - window.innerHeight);
    bar.style.width = `${Math.min(100, Math.max(0, (window.scrollY - top) / distance * 100))}%`;
    let selected = -1;
    headings.forEach((heading, index) => { if (heading.getBoundingClientRect().top < 160) selected = index; });
    links.forEach((link, index) => {
      if (index === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
})();
