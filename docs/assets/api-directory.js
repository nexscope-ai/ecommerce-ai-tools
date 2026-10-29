/* All API links and content remain available when JavaScript is disabled. */
(() => {
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
    count.textContent = `${total} ${total === 1 ? 'API matches' : 'APIs match'} your selection`;
    empty.hidden = total > 0;
  }
  filters.hidden = false;
  search.addEventListener('input', update);
  category.addEventListener('change', update);
})();
