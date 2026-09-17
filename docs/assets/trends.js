(() => {
  // Keep all official product links on the agreed marketing attribution.
  document.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href);
    if (url.hostname !== 'www.nexscope.ai' && url.hostname !== 'nexscope.ai') return;
    url.searchParams.delete('fpr');
    url.searchParams.set('co-from', 'githubIO');
    link.href = url.href;
  });
  const controls = document.querySelector('.trend-controls');
  if (controls) {
    controls.hidden = false;
    const input = controls.querySelector('input');
    const buttons = [...controls.querySelectorAll('[data-topic]')];
    const cards = [...document.querySelectorAll('.trend-card')];
    const count = document.querySelector('.result-count');
    let topic = 'all';
    const filter = () => {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const match = (topic === 'all' || card.dataset.topic === topic) && card.textContent.toLowerCase().includes(query);
        card.hidden = !match;
        if (match) visible++;
      });
      const label = count.dataset.label || 'article';
      count.textContent = `${visible} ${label}${visible === 1 ? '' : 's'}`;
      document.querySelector('.empty-results').hidden = visible > 0;
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      topic = button.dataset.topic;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      filter();
    }));
    input.addEventListener('input', filter);
    document.querySelector('.reset-search').addEventListener('click', () => {
      input.value = '';
      buttons[0].click();
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
