(() => {
  const form = document.querySelector('[data-showcase-form] form');
  const save = form?.querySelector('[data-draft-save]');
  if (!form || !save) return;
  const restore = form.querySelector('[data-draft-restore]');
  const clear = form.querySelector('[data-draft-clear]');
  const status = form.querySelector('[data-draft-status]');
  const key = 'nexscope_submission_text_draft_v1';
  const fields = { productName: 120, productDetails: 5000 };
  const emit = action => {
    if (typeof window.gtag === 'function') window.gtag('event', 'product_submission_draft', {
      draft_action: action, source_page: location.pathname, transport_type: 'beacon',
    });
  };
  const read = () => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (!draft) return null;
      const age = Date.now() - draft.savedAt;
      if (!Number.isFinite(age) || age < 0 || age >= 86400000) {
        sessionStorage.removeItem(key);
        return null;
      }
      if (!Object.entries(fields).every(([name, limit]) => typeof draft[name] === 'string' && draft[name].length <= limit)) return null;
      return draft;
    } catch { return null; }
  };
  const update = () => { const exists = Boolean(read()); restore.hidden = !exists; clear.hidden = !exists; };
  save.addEventListener('click', () => {
    if (!Object.keys(fields).some(name => form.elements.namedItem(name).value.trim())) {
      status.textContent = 'Add a product name or description before saving.';
      return;
    }
    try {
      const draft = { savedAt: Date.now() };
      for (const name of Object.keys(fields)) draft[name] = form.elements.namedItem(name).value.slice(0, fields[name]);
      sessionStorage.setItem(key, JSON.stringify(draft));
      status.textContent = 'Text saved in this browser tab. Save again after making changes.';
      update(); emit('save');
    } catch { status.textContent = 'Browser storage is unavailable. Copy your description before leaving.'; }
  });
  restore.addEventListener('click', () => {
    const draft = read();
    if (!draft) { update(); status.textContent = 'No saved text is available.'; return; }
    const changed = Object.keys(fields).some(name => { const value = form.elements.namedItem(name).value; return value.trim() && value !== draft[name]; });
    if (changed && !window.confirm('Replace the current product name and description with your saved text?')) return;
    for (const name of Object.keys(fields)) {
      const field = form.elements.namedItem(name);
      field.value = draft[name];
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    status.textContent = 'Text restored. Add your product link, images and contact email before submitting.';
    emit('restore');
  });
  const remove = () => { try { sessionStorage.removeItem(key); } catch { /* Storage unavailable. */ } update(); };
  clear.addEventListener('click', () => { remove(); status.textContent = 'Saved text deleted. Your current form is unchanged.'; emit('delete'); });
  form.addEventListener('showcase-submitted', remove);
  update();
})();
