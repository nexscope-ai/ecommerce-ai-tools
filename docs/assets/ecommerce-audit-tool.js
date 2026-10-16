(() => {
  const forms = document.querySelectorAll('[data-ecommerce-audit-form]');
  if (!forms.length) return;

  forms.forEach(form => {
    const tool = form.closest('.ecommerce-audit-tool');
    const result = tool?.querySelector('[data-audit-results]');
    const score = tool?.querySelector('[data-audit-score]');
    const headline = tool?.querySelector('[data-audit-headline]');
    const summary = tool?.querySelector('[data-audit-summary]');
    const actions = tool?.querySelector('[data-audit-actions]');
    const checks = [...form.querySelectorAll('[data-audit-check]')];
    const resetButton = form.querySelector('[data-audit-reset]');
    if (!result || !score || !headline || !summary || !actions || !checks.length) return;

    const render = event => {
      event?.preventDefault();
      const rows = checks.map(check => {
        const selected = check.querySelector('input:checked')?.value || 'unknown';
        return {
          label: check.dataset.label || 'Audit check',
          weight: Number(check.dataset.weight) || 1,
          status: selected,
        };
      });
      const totalWeight = rows.reduce((total, row) => total + row.weight, 0);
      const goodWeight = rows.filter(row => row.status === 'good').reduce((total, row) => total + row.weight, 0);
      const unknownWeight = rows.filter(row => row.status === 'unknown').reduce((total, row) => total + row.weight, 0);
      const readiness = Math.round(((goodWeight + (unknownWeight * 0.5)) / totalWeight) * 100);
      const needsWork = rows.filter(row => row.status === 'needs-work').sort((a, b) => b.weight - a.weight);
      const unknown = rows.filter(row => row.status === 'unknown').sort((a, b) => b.weight - a.weight);
      const answered = rows.length - unknown.length;

      score.textContent = String(readiness);
      headline.textContent = readiness >= 80 ? 'Strong baseline — verify and monitor the remaining gaps' : readiness >= 55 ? 'Mixed baseline — fix the highest-risk template issues first' : 'High-priority gaps — start with access, index, and product facts';
      summary.textContent = `${answered} of ${rows.length} checks marked as reviewed. The plan below treats “Needs work” as a known risk and “Not checked” as a verification task; it is not a Google ranking score.`;
      actions.innerHTML = '';

      const priorities = [
        ...needsWork.map(row => `Fix ${row.label.toLowerCase()} and record the affected URL pattern, owner, and verification date.`),
        ...unknown.map(row => `Verify ${row.label.toLowerCase()} with Search Console, a representative URL sample, or a crawler.`),
      ].slice(0, 5);
      if (!priorities.length) priorities.push('Keep a dated baseline, recheck the highest-value templates after releases, and watch clicks, conversions, and indexing separately.');
      priorities.forEach(text => {
        const item = document.createElement('li');
        item.textContent = text;
        actions.append(item);
      });

      result.hidden = false;
      result.focus({ preventScroll: true });
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'audit_tool_completed', {
          audit_readiness: readiness,
          audit_checks: rows.length,
          audit_needs_work: needsWork.length,
          audit_unchecked: unknown.length,
          source_page: window.location.pathname,
          transport_type: 'beacon',
        });
      }
    };

    form.addEventListener('submit', render);
    resetButton?.addEventListener('click', () => {
      checks.forEach(check => {
        const unknown = check.querySelector('input[value="unknown"]');
        if (unknown) unknown.checked = true;
      });
      result.hidden = true;
      actions.innerHTML = '';
    });
  });
})();
