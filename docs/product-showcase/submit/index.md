---
layout: default
title: Submit an Ecommerce Product for Review | Nexscope
description: Submit an ecommerce product page or Amazon ASIN for editorial review, practical page recommendations, and possible inclusion in the Nexscope Product Gallery.
permalink: /product-showcase/submit/
robots: index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1
sitemap:
  priority: 1.0
  changefreq: weekly
standalone_page: true
product_showcase_page: true
image: /assets/product-showcase-review-api.webp
image_alt: A public ecommerce product page under editorial review with research, keyword, sourcing, and creative API capabilities
image_caption: The Nexscope product submission workflow combines public product information with editorial review and optional ecommerce API workflows.
---
<section class="showcase-form-shell" data-showcase-form data-api-base="{{ site.product_showcase_api_base }}">
  <header class="showcase-form-intro">
    <div class="showcase-form-heading">
      <span class="eyebrow">Product showcase submission</span>
      <h1>Submit your ecommerce product<br><span>for editorial review.</span></h1>
      <p>Share a public product page or Amazon ASIN for possible inclusion in the Nexscope Product Gallery and practical recommendations for a clearer public product page. No store connection, seller token or payment access is required.</p>
      <div class="showcase-form-heading-actions">
        <a class="showcase-primary submission-hero-jump" href="#product-submission-form">Start your submission <span aria-hidden="true">↓</span></a>
      </div>
    </div>
    <aside class="submission-promise" aria-label="Submission promises">
      <span class="submission-promise-label">BEFORE YOU START</span>
      <strong>Have these ready</strong>
      <p>Your submission stays offline until it is reviewed and approved.</p>
      <ul>
        <li>One public product URL or Amazon ASIN</li>
        <li>Product name, details and 1–5 images</li>
        <li>A contact email for update or removal requests</li>
      </ul>
    </aside>
  </header>

  <section class="submission-visual" aria-labelledby="submission-visual-title">
    <div class="submission-visual-copy">
      <span class="eyebrow">More than a submission</span>
      <h2 id="submission-visual-title">A clearer product page, with practical next steps.</h2>
      <p>If approved, your product can gain another public place to be discovered. Our editorial review may suggest ways to strengthen the positioning, details, imagery, video and destination links you share.</p>
      <div class="submission-api-note">
        <strong>Start with more visibility, then improve what people see</strong>
        <span>An approved submission gives your product another public page, helping more shoppers, researchers and AI-assisted discovery tools find and understand it. To make that exposure more useful, Nexscope APIs can help your team <a href="https://www.nexscope.ai/api-docs/amazon-product-research?view=api&amp;co-from=learn&amp;utm_source=learn.nexscope.ai&amp;utm_medium=referral&amp;utm_campaign=product_showcase&amp;utm_content=submit_amazon_research">compare Amazon listings</a>, <a href="https://www.nexscope.ai/api-docs/seo-keyword-metrics?view=api&amp;co-from=learn&amp;utm_source=learn.nexscope.ai&amp;utm_medium=referral&amp;utm_campaign=product_showcase&amp;utm_content=submit_keyword_metrics">check keyword signals</a>, <a href="https://www.nexscope.ai/api-docs/1688-search-by-image?view=api&amp;co-from=learn&amp;utm_source=learn.nexscope.ai&amp;utm_medium=referral&amp;utm_campaign=product_showcase&amp;utm_content=submit_1688_image_search">find similar products on 1688</a>, or <a href="https://www.nexscope.ai/api-docs?tab=creative&amp;co-from=learn&amp;utm_source=learn.nexscope.ai&amp;utm_medium=referral&amp;utm_campaign=product_showcase&amp;utm_content=submit_creative_apis">create supporting images and video</a>. These tools are optional and are never run automatically on your submission.</span>
      </div>
      <div class="submission-visual-actions">
        <a class="showcase-quiet-link" href="https://www.nexscope.ai/api-docs?co-from=learn&amp;utm_source=learn.nexscope.ai&amp;utm_medium=referral&amp;utm_campaign=product_showcase&amp;utm_content=submission_api_capabilities">See what each API can do <span aria-hidden="true">↗</span></a>
      </div>
      <small class="showcase-disclaimer">Recommendations are editorial guidance, not a guarantee of rankings, traffic or sales.</small>
    </div>
    <figure class="submission-visual-art">
      <img src="{{ '/assets/product-showcase-review-api.webp' | relative_url }}" width="1536" height="1024" loading="lazy" alt="A public product page being reviewed with connected ecommerce research, keyword, sourcing and creative capabilities">
    </figure>
  </section>

  <div class="submission-layout" id="product-submission-form">
    <form class="showcase-form" novalidate>
      <div class="form-section">
        <div class="form-section-heading"><span class="form-number">01</span><div><h2>Describe the product</h2><p>Give the editorial team enough context to review it accurately.</p></div></div>
        <div class="form-section-body">
          <div class="media-field" data-media-upload="IMAGE" data-max-files="5" data-max-bytes="10485760">
            <div class="media-field-header"><div><strong>Product images <span class="required-mark" aria-label="required">*</span></strong><span>Upload 1–5 JPEG, PNG or WebP images, up to 10 MB each.</span></div><span class="media-limit">0 / 5</span></div>
            <input type="hidden" name="imageUploadKeys" value="[]">
            <input class="media-file-input" data-media-input type="file" accept="image/jpeg,image/png,image/webp" multiple>
            <button class="media-dropzone" type="button" data-media-choose><span class="media-dropzone-icon" aria-hidden="true">＋</span><span><strong>Add product images</strong><small>Choose files or drop them here</small></span></button>
            <div class="media-upload-list image-upload-list" data-media-list aria-live="polite"></div>
            <small class="field-error" id="imageUploadKeys-error" data-error-for="imageUploadKeys" role="alert" hidden></small>
          </div>
          <label><strong class="field-label">Product name <span class="required-mark" aria-label="required">*</span></strong><span>2–120 characters</span><input name="productName" type="text" minlength="2" maxlength="120" required autocomplete="off" placeholder="What should people call this product?"><small class="field-error" id="productName-error" data-error-for="productName" role="alert" hidden></small></label>
          <div class="markdown-field">
            <div class="markdown-field-header">
              <div><strong id="product-details-label">Product details <span class="required-mark" aria-label="required">*</span></strong><span>Markdown, 20–5000 characters. Use headings, lists and links to make the product easier to review.</span></div>
              <button class="markdown-editor-open" type="button" data-open-markdown>Open Markdown editor</button>
            </div>
            <textarea name="productDetails" minlength="20" maxlength="5000" rows="7" required aria-labelledby="product-details-label" placeholder="## Product overview&#10;Explain what the product does and who it is for.&#10;&#10;- Primary use case&#10;- Key differentiator"></textarea>
            <small class="field-error" id="productDetails-error" data-error-for="productDetails" role="alert" hidden></small>
            <small class="character-count" data-count="productDetails">0 / 5000</small>
          </div>
          <div class="media-field video-field" data-video-field>
            <div class="media-field-header"><div><strong>Product video</strong><span>Optional. Upload one MP4/WebM video up to 100 MB, or use a public HTTPS link.</span></div></div>
            <input type="hidden" name="videoUrl">
            <div class="media-mode-switch" role="tablist" aria-label="Video source">
              <button type="button" role="tab" aria-selected="true" data-video-mode="UPLOAD">Upload video</button>
              <button type="button" role="tab" aria-selected="false" data-video-mode="URL">Use video URL</button>
            </div>
            <div data-video-panel="UPLOAD">
              <div data-media-upload="VIDEO" data-max-files="1" data-max-bytes="104857600">
                <input class="media-file-input" data-media-input type="file" accept="video/mp4,video/webm">
                <button class="media-dropzone media-dropzone-compact" type="button" data-media-choose><span class="media-dropzone-icon" aria-hidden="true">＋</span><span><strong>Add a product video</strong><small>MP4 or WebM</small></span></button>
                <div class="media-upload-list video-upload-list" data-media-list aria-live="polite"></div>
              </div>
            </div>
            <div data-video-panel="URL" hidden><input data-video-url-input type="url" maxlength="2048" inputmode="url" placeholder="https://cdn.example.com/product-video.mp4"></div>
            <small class="field-error" id="videoUrl-error" data-error-for="videoUrl" role="alert" hidden></small>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-heading"><span class="form-number">02</span><div><h2>Choose the product source <span class="required-mark" aria-label="required">*</span></h2><p>Add a public reference after describing the product.</p></div></div>
        <div class="form-section-body">
          <div class="source-options" role="radiogroup" aria-label="Product source">
            <label class="source-option"><input name="sourceType" type="radio" value="PRODUCT_URL" checked><span><strong>Product page link</strong><small>Add one public Shopify, WooCommerce or other product page.</small></span></label>
            <label class="source-option"><input name="sourceType" type="radio" value="AMAZON_ASIN"><span><strong>Amazon ASIN</strong><small>Use a marketplace and 10-character ASIN—no seller authorization.</small></span></label>
          </div>
          <small class="field-error" id="sourceType-error" data-error-for="sourceType" role="alert" hidden></small>

          <div data-source-fields="PRODUCT_URL">
            <label><strong class="field-label">Product page link <span class="required-mark" aria-label="required">*</span></strong><span>One public HTTPS product URL. Nexscope does not log in to or automatically fetch this page.</span><input name="productUrl" type="url" maxlength="2048" inputmode="url" placeholder="https://your-store.com/products/example" required><small class="field-error" id="productUrl-error" data-error-for="productUrl" role="alert" hidden></small></label>
          </div>

          <div data-source-fields="AMAZON_ASIN" hidden>
            <div class="field-pair">
              <div class="form-field">
                <strong class="field-label" id="amazon-marketplace-label">Amazon marketplace <span class="required-mark" aria-label="required">*</span></strong>
                <span class="field-hint">Choose the storefront where the ASIN is listed.</span>
                <div class="select-component" data-select-component>
                  <select name="amazonMarketplace" aria-labelledby="amazon-marketplace-label"><option value="US">United States</option><option value="UK">United Kingdom</option><option value="CA">Canada</option><option value="DE">Germany</option><option value="FR">France</option><option value="IT">Italy</option><option value="ES">Spain</option><option value="JP">Japan</option><option value="AU">Australia</option><option value="IN">India</option><option value="MX">Mexico</option><option value="BR">Brazil</option><option value="NL">Netherlands</option><option value="SE">Sweden</option><option value="PL">Poland</option><option value="BE">Belgium</option><option value="SG">Singapore</option><option value="AE">United Arab Emirates</option><option value="SA">Saudi Arabia</option><option value="TR">Türkiye</option></select>
                </div>
                <small class="field-error" id="amazonMarketplace-error" data-error-for="amazonMarketplace" role="alert" hidden></small>
              </div>
              <label class="form-field"><strong class="field-label">ASIN <span class="required-mark" aria-label="required">*</span></strong><span class="field-hint">Use 10 letters or numbers, for example B0ABC12345.</span><input name="amazonAsin" type="text" minlength="10" maxlength="10" pattern="[A-Za-z0-9]{10}" autocomplete="off" placeholder="B0ABC12345"><small class="field-error" id="amazonAsin-error" data-error-for="amazonAsin" role="alert" hidden></small></label>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section form-section-submit">
        <div class="form-section-heading"><span class="form-number">03</span><div><h2>Provide a secure contact</h2><p>This helps us verify important requests about your product information.</p></div></div>
        <div class="form-section-body">
          <label><strong class="field-label">Contact email <span class="required-mark" aria-label="required">*</span></strong><span>Kept private and never displayed on the public product page.</span><input name="submitterEmail" type="email" maxlength="254" required autocomplete="email" inputmode="email" placeholder="you@company.com"><small class="field-error" id="submitterEmail-error" data-error-for="submitterEmail" role="alert" hidden></small></label>
          <div class="trust-note"><strong>Your email stays private.</strong><span>It is used only to verify important requests to update or remove product information, and never for marketing.</span></div>
          <p class="form-error" role="alert" hidden></p>
          <div class="submission-actions"><button class="showcase-primary" type="submit">Submit product for review <span aria-hidden="true">↗</span></button><small>Use an inbox you can access later.</small></div>
        </div>
      </div>
    </form>
  </div>

  <dialog class="markdown-editor-dialog" data-markdown-dialog aria-labelledby="markdown-editor-title">
    <div class="markdown-dialog-header">
      <div><span class="eyebrow">Product details</span><h2 id="markdown-editor-title">Edit Markdown with a live preview</h2><p>Raw HTML is shown as text. Headings, emphasis, lists, links, quotes and code are supported.</p></div>
      <button class="markdown-dialog-close" type="button" data-close-markdown aria-label="Close Markdown editor">×</button>
    </div>
    <div class="markdown-editor-grid">
      <section class="markdown-editor-pane" aria-labelledby="markdown-input-title">
        <div class="markdown-pane-heading"><strong id="markdown-input-title">Markdown</strong><span>Write</span></div>
        <textarea data-markdown-input maxlength="5000" spellcheck="true" aria-labelledby="markdown-input-title"></textarea>
      </section>
      <section class="markdown-preview-pane" aria-labelledby="markdown-preview-title">
        <div class="markdown-pane-heading"><strong id="markdown-preview-title">Rendered preview</strong><span class="markdown-readonly-label">Read only</span></div>
        <article class="markdown-preview" data-markdown-preview aria-live="polite" aria-readonly="true"></article>
      </section>
    </div>
    <div class="markdown-dialog-footer"><span><strong data-count="productDetails">0 / 5000</strong> · Saved into this submission as Markdown.</span><button class="showcase-primary" type="button" data-close-markdown>Done editing</button></div>
  </dialog>

</section>
