---
layout: default
title: Manage Product Submission | Nexscope
description: Privately check, edit or take a Nexscope product showcase submission offline.
permalink: /product-showcase/manage/
robots: noindex,nofollow,noarchive,nosnippet,noimageindex
sitemap: false
standalone_page: true
product_showcase_page: true
private_page: true
---
<section class="showcase-status-shell" data-management-page data-api-base="{{ site.product_showcase_api_base }}" data-public-page-base="{{ '/product-showcase/product' | relative_url }}" data-showcase-url="{{ '/product-showcase/' | relative_url }}" aria-busy="true">
  <header class="management-page-intro">
    <div class="management-page-intro-main">
      <div class="management-page-status-row">
        <div class="management-header-statuses" aria-label="Current product status" aria-live="polite">
          <strong class="management-status-badge" data-moderation-status aria-label="Editorial review status: loading">Loading</strong>
          <strong class="management-status-badge" data-publish-status aria-label="Product visibility status: loading">Loading</strong>
        </div>
      </div>
      <h1>Manage your product submission.</h1>
      <p>Keep this private link bookmarked. Your product-page feedback will appear here after editorial review. You can also check publishing status, update product information, or take a published product offline.</p>
      <p class="management-feedback" data-management-feedback role="status" hidden></p>
    </div>
    <a class="showcase-primary management-public-link" data-view-public-product href="" target="_blank" rel="noopener noreferrer" hidden>View product detail page <span aria-hidden="true">↗</span></a>
  </header>
  <p class="form-error" role="alert" hidden></p>
  <div class="management-skeleton" data-management-skeleton role="status" aria-label="Loading product submission">
    <span class="management-skeleton-announcement">Loading your latest product submission.</span>
    <section class="management-skeleton-form" aria-hidden="true">
      <div class="management-skeleton-form-card">
        <div class="management-skeleton-form-label"><span class="skeleton-dot"></span><span><i class="skeleton-line skeleton-line-subtitle"></i><i class="skeleton-line skeleton-line-copy-short"></i></span></div>
        <div class="management-skeleton-fields"><span class="skeleton-line skeleton-line-label"></span><span class="skeleton-input"></span><span class="skeleton-line skeleton-line-label"></span><span class="skeleton-textarea"></span></div>
      </div>
    </section>
  </div>
  <div class="management-panel" hidden>
    <section class="management-review-insights" data-review-insights aria-labelledby="management-review-insights-title" hidden>
      <header>
        <div class="management-review-source" aria-label="Official recommendations from Nexscope">
          <img src="https://learn.nexscope.ai/logo.png" alt="Nexscope" width="116" height="29">
          <span>Official recommendations</span>
        </div>
        <h2 id="management-review-insights-title">Editorial feedback on your product page.</h2>
        <p>Recommendations prepared by the Nexscope editorial team from the product information you submitted.</p>
        <p class="management-review-help">Questions about a recommendation? <a data-community-action="editorial_feedback_question" href="https://github.com/nexscope-ai/ecommerce-ai-tools/discussions/categories/q-a?utm_source=learn.nexscope.ai&amp;utm_medium=product_management&amp;utm_campaign=product_showcase_support&amp;utm_content=editorial_feedback_question" target="_blank" rel="noopener noreferrer">Ask in Discussions <span aria-hidden="true">↗</span></a> <span aria-hidden="true">·</span> Found a page bug? <a data-community-action="editorial_feedback_bug" href="https://github.com/nexscope-ai/ecommerce-ai-tools/issues/new/choose?utm_source=learn.nexscope.ai&amp;utm_medium=product_management&amp;utm_campaign=product_showcase_support&amp;utm_content=editorial_feedback_bug" target="_blank" rel="noopener noreferrer">Report an Issue <span aria-hidden="true">↗</span></a></p>
        <p class="management-review-privacy">Share only public product information. Never post this private management link or unpublished review details.</p>
      </header>
      <div class="management-score-badge" data-review-score hidden>
        <span>Product score</span>
        <strong data-review-score-value>—</strong>
        <small>/ 100</small>
      </div>
      <div class="markdown-preview management-suggestion-markdown" data-review-suggestion hidden></div>
    </section>

    <section class="management-edit-section" id="edit-product-information" aria-label="Edit product information and resubmit">
      <form class="management-edit-form" novalidate>
        <section class="management-form-section">
          <div class="management-form-section-heading"><span>01</span><div><h3>Product information</h3><p>Update the name and description shown to the editorial team.</p></div></div>
          <div class="management-form-section-body management-form-grid">
            <label class="management-field-full"><strong class="field-label">Product name <span class="required-mark" aria-label="required">*</span></strong><span>2–120 characters.</span><input name="productName" type="text" minlength="2" maxlength="120" required><small class="field-error" data-error-for="productName" role="alert" hidden></small></label>
            <div class="markdown-field management-field-full">
              <div class="markdown-field-header">
                <div><strong id="management-product-details-label">Product details <span class="required-mark" aria-label="required">*</span></strong><span>Markdown, 20–5000 characters. Use headings, lists and links to make the product easier to review.</span></div>
                <button class="markdown-editor-open" type="button" data-open-markdown>Open Markdown editor</button>
              </div>
              <textarea name="productDetails" minlength="20" maxlength="5000" rows="9" required aria-labelledby="management-product-details-label"></textarea>
              <small class="field-error" data-error-for="productDetails" role="alert" hidden></small>
              <small class="character-count" data-count="productDetails">0 / 5000</small>
            </div>
          </div>
        </section>

        <section class="management-form-section">
          <div class="management-form-section-heading"><span>02</span><div><h3>Product media</h3><p>Review the current configuration or upload different product media.</p></div></div>
          <div class="management-form-section-body">
            <div class="management-current-media-note"><strong>Current media configuration</strong><span>Preview or remove the attachments below. To use a different file, remove the current one and upload the new file.</span></div>
            <div class="media-field" data-media-upload="IMAGE" data-max-files="5" data-max-bytes="10485760">
              <div class="media-field-header"><div><strong>Product images <span class="required-mark" aria-label="required">*</span></strong><span>Keep or replace 1–5 JPEG, PNG or WebP images, up to 10 MB each. The first image is used as the main product image.</span></div><span class="media-limit">0 / 5</span></div>
              <input type="hidden" name="imageUploadKeys" value="[]">
              <input class="media-file-input" data-media-input type="file" accept="image/jpeg,image/png,image/webp" multiple>
              <button class="media-dropzone" type="button" data-media-choose><span class="media-dropzone-icon" aria-hidden="true">＋</span><span><strong>Add product images</strong><small>Choose files or drop them here</small></span></button>
              <div class="media-upload-list image-upload-list" data-media-list aria-live="polite"></div>
              <small class="field-error" data-error-for="imageUploadKeys" role="alert" hidden></small>
            </div>
            <div class="media-field video-field" data-video-field>
              <div class="media-field-header"><div><strong>Product video</strong><span>Optional: keep, replace (MP4/WebM up to 100 MB), or use a link. A good video may boost your media score and reach. <a class="video-generator-link" href="https://www.nexscope.ai/seller/video-generation/image-to-video?co-from=learn&amp;utm_source=learn.nexscope.ai&amp;utm_medium=referral&amp;utm_campaign=product_showcase_management&amp;utm_content=video_hint" data-utm-campaign="product_showcase_management" data-utm-content="video_hint" target="_blank" rel="noopener noreferrer">Create one from an image <span aria-hidden="true">↗</span></a></span></div></div>
              <input type="hidden" name="videoUrl">
              <div class="media-mode-switch" role="tablist" aria-label="Video source">
                <button type="button" role="tab" aria-selected="true" data-video-mode="UPLOAD">Upload video</button>
                <button type="button" role="tab" aria-selected="false" data-video-mode="URL">Use video URL</button>
              </div>
              <div data-video-panel="UPLOAD">
                <div data-media-upload="VIDEO" data-max-files="1" data-max-bytes="104857600">
                  <input class="media-file-input" data-media-input type="file" accept="video/mp4,video/webm">
                  <button class="media-dropzone media-dropzone-compact" type="button" data-media-choose><span class="media-dropzone-icon" aria-hidden="true">＋</span><span><strong>Add the product video</strong><small>MP4 or WebM</small></span></button>
                  <div class="media-upload-list video-upload-list" data-media-list aria-live="polite"></div>
                </div>
              </div>
              <div data-video-panel="URL" hidden><input data-video-url-input type="url" maxlength="2048" inputmode="url" placeholder="https://cdn.example.com/product-video.mp4"></div>
              <small class="field-error" data-error-for="videoUrl" role="alert" hidden></small>
            </div>
          </div>
        </section>

        <section class="management-form-section">
          <div class="management-form-section-heading"><span>03</span><div><h3>Product source</h3><p>Keep a public product page or identify the Amazon listing.</p></div></div>
          <div class="management-form-section-body">
            <div class="source-options" role="radiogroup" aria-label="Product source">
              <label class="source-option"><input name="sourceType" type="radio" value="PRODUCT_URL"><span><strong>Product page link</strong><small>One independent-store or other public HTTPS product page.</small></span></label>
              <label class="source-option"><input name="sourceType" type="radio" value="AMAZON_ASIN"><span><strong>Amazon ASIN</strong><small>Marketplace plus 10-character ASIN.</small></span></label>
            </div>
            <small class="field-error" data-error-for="sourceType" role="alert" hidden></small>
            <div data-source-fields="PRODUCT_URL"><label><strong class="field-label">Product page link <span class="required-mark" aria-label="required">*</span></strong><span>One public HTTPS product URL.</span><input name="productUrl" type="url" maxlength="2048" inputmode="url"><small class="field-error" data-error-for="productUrl" role="alert" hidden></small></label></div>
            <div data-source-fields="AMAZON_ASIN" hidden>
              <div class="field-pair">
                <div class="form-field">
                  <strong class="field-label" id="management-amazon-marketplace-label">Amazon marketplace <span class="required-mark" aria-label="required">*</span></strong>
                  <span class="field-hint">Choose the storefront where the ASIN is listed.</span>
                  <div class="select-component" data-select-component>
                    <select name="amazonMarketplace" aria-labelledby="management-amazon-marketplace-label"><option value="US">United States</option><option value="UK">United Kingdom</option><option value="CA">Canada</option><option value="DE">Germany</option><option value="FR">France</option><option value="IT">Italy</option><option value="ES">Spain</option><option value="JP">Japan</option><option value="AU">Australia</option><option value="IN">India</option><option value="MX">Mexico</option><option value="BR">Brazil</option><option value="NL">Netherlands</option><option value="SE">Sweden</option><option value="PL">Poland</option><option value="BE">Belgium</option><option value="SG">Singapore</option><option value="AE">United Arab Emirates</option><option value="SA">Saudi Arabia</option><option value="TR">Türkiye</option></select>
                  </div>
                  <small class="field-error" data-error-for="amazonMarketplace" role="alert" hidden></small>
                </div>
                <label class="form-field"><strong class="field-label">ASIN <span class="required-mark" aria-label="required">*</span></strong><span class="field-hint">Use 10 letters or numbers, for example B0ABC12345.</span><input name="amazonAsin" type="text" minlength="10" maxlength="10" pattern="[A-Za-z0-9]{10}" autocomplete="off"><small class="field-error" data-error-for="amazonAsin" role="alert" hidden></small></label>
              </div>
            </div>
          </div>
        </section>

        <section class="management-form-section">
          <div class="management-form-section-heading"><span>04</span><div><h3>Private contact</h3><p>Used only to verify important ownership, update or removal requests.</p></div></div>
          <div class="management-form-section-body">
            <label><strong class="field-label">Contact email</strong><span>Kept private and fixed to the email used for the original submission.</span><input name="submitterEmail" type="email" maxlength="254" required readonly aria-readonly="true" autocomplete="email" inputmode="email"><small class="field-error" data-error-for="submitterEmail" role="alert" hidden></small></label>
            <div class="management-resubmit-note"><strong>What happens after you save?</strong><span>The updated version becomes Under review and Offline immediately. It will not return online until it is approved and published again.</span></div>
            <div class="management-edit-actions"><button class="showcase-primary" type="submit" data-management-save>Save changes and resubmit <span aria-hidden="true">↗</span></button></div>
          </div>
        </section>
      </form>
    </section>

    <section class="management-community" aria-labelledby="management-community-title">
      <div class="management-community-intro">
        <span class="eyebrow">Nexscope on GitHub</span>
        <h2 id="management-community-title">Improve your product page with the community.</h2>
        <p>Bring one public product-page question to sellers, operators and builders working on clearer ecommerce experiences. Compare approaches, learn from practical examples and decide what to test before your next submission.</p>
        <a class="showcase-primary management-community-primary" data-community-action="product_page_feedback" href="https://github.com/nexscope-ai/ecommerce-ai-tools/discussions/categories/show-and-tell?utm_source=learn.nexscope.ai&amp;utm_medium=product_management&amp;utm_campaign=product_showcase_community&amp;utm_content=product_page_feedback" target="_blank" rel="noopener noreferrer">Ask for product-page feedback <span aria-hidden="true">↗</span></a>
      </div>
      <div class="management-community-paths" aria-label="GitHub community options">
        <a data-community-action="api_workflow_qa" href="https://github.com/nexscope-ai/ecommerce-ai-tools/discussions/categories/q-a?utm_source=learn.nexscope.ai&amp;utm_medium=product_management&amp;utm_campaign=product_showcase_community&amp;utm_content=api_workflow_qa" target="_blank" rel="noopener noreferrer">
          <span>Q&amp;A</span>
          <strong>Ask about an API or workflow</strong>
          <small>Share a redacted request, the result you expected and what happened.</small>
          <b>Open community Q&amp;A <span aria-hidden="true">↗</span></b>
        </a>
        <a data-community-action="workflow_idea" href="https://github.com/nexscope-ai/ecommerce-ai-tools/discussions/categories/ideas?utm_source=learn.nexscope.ai&amp;utm_medium=product_management&amp;utm_campaign=product_showcase_community&amp;utm_content=workflow_idea" target="_blank" rel="noopener noreferrer">
          <span>Ideas</span>
          <strong>Suggest a better ecommerce workflow</strong>
          <small>Describe the decision you need to make and how you handle it today.</small>
          <b>Share an idea <span aria-hidden="true">↗</span></b>
        </a>
      </div>
      <p class="management-community-privacy"><strong>Keep your private link private.</strong> Share only public product information. Never post this management URL, contact email, account credentials or unpublished review details.</p>
    </section>

    <section class="management-offline-panel" data-offline-panel hidden>
      <div><h2>Take this product offline</h2><p>The product will disappear from the Product Gallery immediately. Its approved submission and private management page will remain available.</p></div>
      <button class="showcase-offline" type="button" data-take-offline>Take product offline</button>
    </section>

  </div>

  <dialog class="markdown-editor-dialog" data-markdown-dialog aria-labelledby="management-markdown-editor-title">
    <div class="markdown-dialog-header">
      <div><span class="eyebrow">Product details</span><h2 id="management-markdown-editor-title">Edit Markdown with a live preview</h2><p>Raw HTML is shown as text. Headings, emphasis, lists, links, quotes and code are supported.</p></div>
      <button class="markdown-dialog-close" type="button" data-close-markdown aria-label="Close Markdown editor">×</button>
    </div>
    <div class="markdown-editor-grid">
      <section class="markdown-editor-pane" aria-labelledby="management-markdown-input-title">
        <div class="markdown-pane-heading"><strong id="management-markdown-input-title">Markdown</strong><span>Write</span></div>
        <textarea data-markdown-input maxlength="5000" spellcheck="true" aria-labelledby="management-markdown-input-title"></textarea>
      </section>
      <section class="markdown-preview-pane" aria-labelledby="management-markdown-preview-title">
        <div class="markdown-pane-heading"><strong id="management-markdown-preview-title">Rendered preview</strong><span class="markdown-readonly-label">Read only</span></div>
        <article class="markdown-preview" data-markdown-preview aria-live="polite" aria-readonly="true"></article>
      </section>
    </div>
    <div class="markdown-dialog-footer"><span><strong data-count="productDetails">0 / 5000</strong> · Saved into this resubmission as Markdown.</span><button class="showcase-primary" type="button" data-close-markdown>Done editing</button></div>
  </dialog>

  <dialog class="management-confirm-dialog" data-management-confirm-dialog aria-labelledby="management-confirm-title" aria-describedby="management-confirm-description">
    <div class="management-confirm-header">
      <div><span class="eyebrow">Confirm action</span><h2 id="management-confirm-title" data-management-confirm-title></h2></div>
      <button class="management-confirm-close" type="button" data-management-confirm-cancel aria-label="Cancel and close">×</button>
    </div>
    <p id="management-confirm-description" data-management-confirm-description></p>
    <div class="management-confirm-actions">
      <button class="showcase-secondary" type="button" data-management-confirm-cancel>Cancel</button>
      <button class="showcase-primary" type="button" data-management-confirm-submit></button>
    </div>
  </dialog>
</section>
