(() => {
  'use strict';
  // This bundle intentionally supports reads only. No submission, upload or update requests.
  document.querySelectorAll('[data-showcase-form] form, [data-management-page] form').forEach(form => {
    form.addEventListener('submit', event => event.preventDefault());
  });
  const page = document.querySelector('[data-management-page]');
  if (!page) return;
  const error = page.querySelector('.form-error');
  const skeleton = page.querySelector('[data-management-skeleton]');
  const panel = page.querySelector('.management-panel');
  const form = page.querySelector('.management-edit-form');
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const match = window.location.pathname.match(/\/product-showcase\/manage\/([^/]+)\/?$/);
  let uuid = match?.[1] || '';
  try {
    uuid ||= sessionStorage.getItem('nexscopeProductShowcaseManagementUuid') || '';
    sessionStorage.removeItem('nexscopeProductShowcaseManagementUuid');
  } catch { /* A private management URL also works without session storage. */ }
  const finishLoading = () => {
    if (skeleton) skeleton.hidden = true;
    page.setAttribute('aria-busy', 'false');
  };
  const showError = message => {
    if (error) { error.textContent = message; error.hidden = false; }
    finishLoading();
  };
  if (!uuidPattern.test(uuid)) {
    showError('Open your original private management link to view an existing submission. New submissions and updates are temporarily unavailable.');
    return;
  }
  const text = (selector, value) => {
    const target = page.querySelector(selector);
    if (target) target.textContent = value;
  };
  const safeMediaUrl = value => {
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
    catch { return null; }
  };
  const load = async () => {
    try {
      const response = await fetch(`${page.dataset.apiBase}/submissions/manage`, {
        method: 'GET', headers: { 'X-Management-UUID': uuid }, cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok || result.code !== 0 || !result.data) throw new Error('unavailable');
      const data = result.data;
      const moderation = { PENDING: 'UNDER REVIEW', APPROVED: 'APPROVED', REJECTED: 'CHANGES REQUESTED', WITHDRAWN: 'WITHDRAWN' };
      text('[data-moderation-status]', moderation[data.moderationStatus] || 'UNKNOWN');
      text('[data-publish-status]', data.publishStatus === 'ONLINE' ? 'LIVE' : 'OFFLINE');
      for (const name of ['productName', 'productDetails', 'submitterEmail', 'productUrl', 'amazonAsin', 'amazonMarketplace', 'videoUrl']) {
        const field = form?.elements.namedItem(name);
        if (field) field.value = typeof data[name] === 'string' ? data[name] : '';
      }
      form?.querySelectorAll('[name="sourceType"]').forEach(input => { input.checked = input.value === data.sourceType; });
      form?.querySelectorAll('[data-source-fields]').forEach(section => {
        section.hidden = section.dataset.sourceFields !== (data.sourceType || 'PRODUCT_URL');
      });
      const images = page.querySelector('[data-media-upload="IMAGE"] [data-media-list]');
      if (images && Array.isArray(data.imageUrls)) {
        images.replaceChildren();
        data.imageUrls.forEach(value => {
          const url = safeMediaUrl(value);
          if (!url) return;
          const image = document.createElement('img');
          image.src = url; image.alt = 'Previously submitted product image'; image.loading = 'lazy';
          image.referrerPolicy = 'no-referrer'; image.style.cssText = 'max-width:120px;max-height:120px;object-fit:contain';
          images.append(image);
        });
      }
      const suggestion = typeof data.suggestion === 'string' ? data.suggestion.trim() : '';
      const insights = page.querySelector('[data-review-insights]');
      const preview = page.querySelector('[data-review-suggestion]');
      if (insights) insights.hidden = !suggestion;
      if (preview && suggestion) {
        preview.hidden = false;
        if (window.ProductShowcaseMarkdown?.render) window.ProductShowcaseMarkdown.render(preview, suggestion);
        else preview.textContent = suggestion;
      }
      const score = data.score == null || data.score === '' ? NaN : Number(data.score);
      const scoreBlock = page.querySelector('[data-review-score]');
      if (scoreBlock && suggestion && Number.isFinite(score) && score >= 0 && score <= 100) {
        scoreBlock.hidden = false;
        text('[data-review-score-value]', String(Math.round(score)));
      }
      if (panel) panel.hidden = false;
    } catch {
      showError('We could not load this submission. Check your private management link and try again later.');
    } finally { finishLoading(); }
  };
  void load();
})();
