// Match the root homepage and learning-library navigation for generated Data pages.
export function learnDataHeader(path) {
  return `<header class="trends-header"><div class="wrap">
  <a class="brand" href="/" aria-label="Nexscope learning home"><img src="/logo.png" alt="Nexscope" width="165" height="32"></a>
  <button class="primary-menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation menu"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></button>
  <nav class="primary-navigation" id="primary-navigation" aria-label="Primary navigation"><ul>
    <li><a href="/data/" data-track-tool="data-directory" aria-current="${path === '/data/' ? 'page' : 'location'}">Data APIs</a></li>
    <li><a href="/ecommerce-ai-tools/product-showcase/" data-track-tool="product-gallery">Product Gallery</a></li>
    <li><a href="/tools/">Tools</a></li>
    <li><a href="/ecommerce-ai-tools/">Guides &amp; resources</a></li>
    <li><a href="/pricing/">Pricing</a></li>
    <li><a class="nav-cta" href="/ecommerce-ai-tools/product-showcase/submit/" data-showcase-submit-cta="data-navigation">List a product free →</a></li>
  </ul></nav></div></header>`;
}

export function learnDataFooter() {
  return `<footer class="learn-site-footer"><div class="wrap resource-footer">
  <div><a href="/">Nexscope Learn</a><p>Ecommerce data. Clearer product discovery.</p></div>
  <nav aria-label="Footer">
    <a href="/data/">Data APIs</a><a href="/ecommerce-ai-tools/product-showcase/">Product Gallery</a>
    <a href="/ecommerce-ai-tools/product-showcase/submit/" data-showcase-submit-cta="data-footer">List a product free</a>
    <a href="/tools/">Tools</a><a href="/pricing/">Pricing</a><a href="/ecommerce-ai-tools/">Learning library</a>
    <a href="/ecommerce-ai-tools/community/">Community</a><a href="/about/">About</a><a href="/security/">Security</a><a href="/contact/">Contact</a>
    <a href="https://www.nexscope.ai/privacy?co-from=learn">Privacy</a><a href="https://www.nexscope.ai/terms?co-from=learn">Terms</a><a href="#analytics-preferences">Cookie settings</a>
  </nav><p class="learn-footer-disclosure">Nexscope publishes this directory and Product Gallery. Product submission, review and approved display are free. API access and credits follow the selected operation’s official documentation.</p>
  </div></footer>`;
}
