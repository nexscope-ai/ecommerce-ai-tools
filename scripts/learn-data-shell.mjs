// Match the root Learn homepage and learning-library navigation for generated Data pages.
export function learnDataHeader(path) {
  const apiCurrent = path === '/data/' ? 'page' : 'location';
  return `<header class="trends-header">
<div class="wrap">
  <a class="brand" href="/" aria-label="Nexscope learning home"><img src="/logo.png" alt="Nexscope" width="165" height="32"></a>
  <button class="primary-menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation menu"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></button>
  <nav class="primary-navigation" id="primary-navigation" aria-label="Primary navigation"><ul>
    <li class="nav-dropdown"><details class="learning-menu">
      <summary aria-current="${apiCurrent}">APIs <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg></summary>
      <ul class="nav-dropdown-menu">
        <li><a href="/data/" data-track-tool="data-directory" aria-current="${apiCurrent}">Data APIs</a></li>
        <li><a href="/social/" data-track-tool="social-directory">Social APIs</a></li>
        <li><a href="/video-apis/" data-track-tool="video-api-directory">Video &amp; Image APIs</a></li>
      </ul>
    </details></li>
    <li><a href="/video/" data-track-tool="video-directory">Video workflows</a></li>
    <li><a href="/ecommerce-ai-tools/product-showcase/" data-track-tool="product-gallery">Product Gallery</a></li>
    <li><a href="/product-growth-report/" data-track-tool="product-growth-report">Product Growth Report</a></li>
    <li class="nav-dropdown"><details>
      <summary>Resources <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg></summary>
      <ul class="nav-dropdown-menu">
        <li><a href="/ecommerce-ai-tools/">Guides &amp; resources</a></li>
        <li><a href="/pricing/">Pricing</a></li>
      </ul>
    </details></li>
    <li><a class="nav-cta" href="/ecommerce-ai-tools/product-showcase/submit/" data-showcase-submit-cta="data-navigation">List a product free →</a></li>
  </ul></nav></div></header>`;
}

export function learnDataFooter() {
  return `<footer class="learn-site-footer"><div class="wrap resource-footer">
  <div><a href="/">Nexscope Learn</a><p>Ecommerce data. Clearer product discovery.</p></div>
  <nav aria-label="Footer">
    <a href="/data/">Data APIs</a><a href="/social/">Social APIs</a><a href="/video-apis/" data-track-tool="video-api-directory">Video &amp; Image APIs</a><a href="/video/" data-track-tool="video-directory">Video workflows</a><a href="/ecommerce-ai-tools/product-showcase/">Product Gallery</a>
    <a href="/ecommerce-ai-tools/product-showcase/submit/" data-showcase-submit-cta="data-footer">List a product free</a>
    <a href="/tools/">Tools</a><a href="/pricing/">Pricing</a><a href="/ecommerce-ai-tools/">Learning library</a>
    <a href="/ecommerce-ai-tools/community/">Community</a><a href="/about/">About</a><a href="/security/">Security</a><a href="/contact/">Contact</a>
    <a href="https://www.nexscope.ai/privacy?co-from=learn">Privacy</a><a href="https://www.nexscope.ai/terms?co-from=learn">Terms</a><a href="#analytics-preferences">Cookie settings</a>
  </nav><p class="learn-footer-disclosure">Nexscope publishes this directory and Product Gallery. Product submission, review and approved display are free. API access and credits follow the selected operation’s official documentation.</p>
  </div></footer>`;
}
