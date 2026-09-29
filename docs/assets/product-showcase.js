(() => {
  const analyticsSourcePath = window.location.pathname.replace(
    /(\/product-showcase\/manage\/)[^/]+\/?$/,
    '$1:private-management-link',
  );
  const event = (name, properties = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, {
        ...properties,
        source_page: analyticsSourcePath,
        transport_type: 'beacon',
      });
    }
  };

  if (document.querySelector('[data-showcase-view]')) event('product_showcase_view');

  document.addEventListener('click', clickEvent => {
    const communityLink = clickEvent.target.closest?.('[data-community-action][href]');
    if (!communityLink) return;
    const destination = new URL(communityLink.href, window.location.href);
    event('product_showcase_community_open', {
      community_action: communityLink.dataset.communityAction,
      destination_path: destination.pathname,
    });
  });

  const json = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.code !== 0) {
      throw new Error(body.msg || body.message || `Request failed (${response.status})`);
    }
    return body.data;
  };

  const assertHttpsUrl = (value, label) => {
    let url;
    try {
      url = new URL(value);
    } catch (_) {
      throw new Error(`${label} must be a valid URL.`);
    }
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) {
      throw new Error(`${label} must be a public HTTPS URL without embedded credentials.`);
    }
  };

  const uploadToPresignedUrl = (file, presign, onProgress) => new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', presign.putUrl, true);
    Object.entries(presign.requiredHeaders || { 'Content-Type': presign.contentType })
      .forEach(([name, value]) => request.setRequestHeader(name, value));
    request.upload.addEventListener('progress', progress => {
      if (progress.lengthComputable) onProgress(Math.round((progress.loaded / progress.total) * 100));
    });
    request.addEventListener('load', () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error(`Upload failed (${request.status || 'network error'}).`));
    });
    request.addEventListener('error', () => reject(new Error('Upload failed. Check the connection and retry.')));
    request.addEventListener('abort', () => reject(new Error('Upload cancelled.')));
    request.send(file);
  });

  const createMediaActionButton = (label, iconName, tone, fallback, onClick) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `media-action-button media-action-${tone}`;
    button.setAttribute('aria-label', label);
    button.title = label;
    const icon = document.createElement('i');
    icon.className = 'media-action-icon';
    icon.dataset.lucide = iconName;
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = fallback;
    button.append(icon);
    button.addEventListener('click', onClick);
    return button;
  };

  const openMediaPreview = (entry, mediaType, label) => {
    let dialog = document.querySelector('[data-media-preview-dialog]');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'media-preview-dialog';
      dialog.dataset.mediaPreviewDialog = '';

      const header = document.createElement('header');
      header.className = 'media-preview-header';
      const heading = document.createElement('div');
      const eyebrow = document.createElement('span');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = 'Uploaded media';
      const title = document.createElement('h2');
      title.dataset.mediaPreviewTitle = '';
      heading.append(eyebrow, title);

      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'media-preview-close';
      closeButton.setAttribute('aria-label', 'Close media preview');
      closeButton.textContent = '×';

      const stage = document.createElement('div');
      stage.className = 'media-preview-stage';
      stage.dataset.mediaPreviewStage = '';
      header.append(heading, closeButton);
      dialog.append(header, stage);
      document.body.append(dialog);

      closeButton.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', clickEvent => {
        if (clickEvent.target === dialog) dialog.close();
      });
      dialog.addEventListener('close', () => {
        const video = stage.querySelector('video');
        if (video) {
          video.pause();
          video.removeAttribute('src');
          video.load();
        }
        stage.replaceChildren();
        document.body.classList.remove('media-preview-opened');
      });
    }

    const title = dialog.querySelector('[data-media-preview-title]');
    const stage = dialog.querySelector('[data-media-preview-stage]');
    const preview = document.createElement(mediaType === 'IMAGE' ? 'img' : 'video');
    preview.src = entry.previewUrl;
    if (mediaType === 'IMAGE') {
      preview.alt = label;
    } else {
      preview.controls = true;
      preview.playsInline = true;
      preview.preload = 'metadata';
    }
    title.textContent = label;
    stage.replaceChildren(preview);
    document.body.classList.add('media-preview-opened');
    dialog.showModal();
  };

  const wireMediaUploads = (scope, form, api) => {
    const controllers = [];
    const managesExistingMedia = form.classList.contains('management-edit-form');
    const videoField = scope.querySelector('[data-video-field]');
    const videoValue = videoField?.querySelector('[name="videoUrl"]');
    const videoUrlInput = videoField?.querySelector('[data-video-url-input]');

    scope.querySelectorAll('[data-media-upload]').forEach(root => {
      const mediaType = root.dataset.mediaUpload;
      const input = root.querySelector('[data-media-input]');
      const choose = root.querySelector('[data-media-choose]');
      const list = root.querySelector('[data-media-list]');
      const counter = root.closest('.media-field')?.querySelector('.media-limit');
      const maximumFiles = Number(root.dataset.maxFiles || 1);
      const maximumBytes = Number(root.dataset.maxBytes || 0);
      const entries = [];

      const completedUrls = () => entries
        .filter(entry => entry.status === 'complete')
        .map(entry => entry.uploadKey)
        .filter(Boolean);
      const existingUrls = () => entries
        .filter(entry => entry.status === 'complete' && entry.existingUrl)
        .map(entry => entry.existingUrl);
      const syncValues = () => {
        if (mediaType === 'IMAGE') {
          form.imageUploadKeys.value = JSON.stringify(completedUrls());
          if (managesExistingMedia) form.__showcaseImageUrls = existingUrls();
          if (counter) counter.textContent = `${entries.length} / ${maximumFiles}`;
          form.imageUploadKeys.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (videoField?.dataset.mode !== 'URL') {
          form.__showcaseVideoUploadKey = completedUrls()[0] || '';
          videoValue.value = form.__showcaseVideoUploadKey ? '' : (existingUrls()[0] || '');
          videoValue.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };

      const stateText = entry => entry.status === 'uploading'
        ? `Uploading ${entry.progress}%`
        : entry.status === 'complete'
          ? entry.existingUrl ? 'Currently attached' : 'Ready to save'
          : entry.error || 'Upload failed';

      const updateEntryPresentation = entry => {
        if (!entry.elements) return;
        entry.elements.card.className = `media-upload-item is-${entry.status}`;
        entry.elements.state.textContent = stateText(entry);
        entry.elements.progressBar.style.width = `${entry.progress}%`;
      };

      const render = () => {
        list.replaceChildren();
        entries.forEach((entry, index) => {
          const card = document.createElement('article');
          card.className = `media-upload-item is-${entry.status}`;
          const preview = document.createElement(mediaType === 'IMAGE' ? 'img' : 'video');
          preview.src = entry.previewUrl;
          preview.alt = mediaType === 'IMAGE' ? `Selected product image ${index + 1}` : '';
          if (mediaType === 'VIDEO') {
            preview.muted = true;
            preview.playsInline = true;
            preview.preload = 'metadata';
          }
          const detail = document.createElement('div');
          detail.className = 'media-upload-detail';
          const title = document.createElement('strong');
          title.textContent = mediaType === 'IMAGE'
            ? index === 0 ? 'Main product image' : `Product image ${index + 1}`
            : 'Product video';
          const state = document.createElement('span');
          state.textContent = stateText(entry);
          const progress = document.createElement('span');
          progress.className = 'media-upload-progress';
          const progressBar = document.createElement('i');
          progressBar.style.width = `${entry.progress}%`;
          progress.append(progressBar);
          detail.append(title, state, progress);
          const actions = document.createElement('div');
          actions.className = 'media-upload-actions';
          const mediaLabel = mediaType === 'IMAGE'
            ? index === 0 ? 'Main product image' : `Product image ${index + 1}`
            : 'Product video';
          if (entry.status === 'complete') {
            const previewButton = createMediaActionButton(
              `Preview ${mediaLabel.toLowerCase()}`,
              'eye',
              'preview',
              '◉',
              () => openMediaPreview(entry, mediaType, mediaLabel),
            );
            actions.append(previewButton);
          }
          if (entry.status === 'error') {
            const retry = createMediaActionButton(
              `Retry ${mediaType === 'IMAGE' ? `product image ${index + 1}` : 'product video'} upload`,
              'rotate-cw',
              'retry',
              '↻',
              () => upload(entry),
            );
            actions.append(retry);
          }
          const remove = createMediaActionButton(
            `Remove ${mediaType === 'IMAGE' ? `product image ${index + 1}` : 'product video'}`,
            'trash-2',
            'remove',
            '×',
            () => {
              if (entry.objectUrl) URL.revokeObjectURL(entry.previewUrl);
              entries.splice(entries.indexOf(entry), 1);
              syncValues();
              render();
            },
          );
          actions.append(remove);
          card.append(preview, detail, actions);
          list.append(card);
          entry.elements = { card, state, progressBar };
        });
        if (window.lucide?.createIcons) {
          window.lucide.createIcons({
            root: list,
            attrs: { width: 17, height: 17, 'stroke-width': 2 },
          });
        }
        root.classList.toggle('has-files', entries.length > 0);
        choose.hidden = entries.length >= maximumFiles;
      };

      const upload = async entry => {
        entry.status = 'uploading';
        entry.progress = 0;
        entry.error = '';
        render();
        try {
          const presign = await json(`${api}/media/presign`, {
            method: 'POST',
            body: JSON.stringify({
              fileName: entry.file.name,
              contentType: entry.file.type,
              fileSize: entry.file.size,
              mediaType,
            }),
          });
          await uploadToPresignedUrl(entry.file, presign, progress => {
            entry.progress = progress;
            updateEntryPresentation(entry);
          });
          entry.status = 'complete';
          entry.progress = 100;
          entry.uploadKey = presign.uploadKey;
          event('product_upload_complete');
        } catch (cause) {
          entry.status = 'error';
          entry.error = cause.message || 'Upload failed';
        }
        syncValues();
        render();
      };

      const addFiles = files => {
        const incoming = [...files];
        if (entries.length + incoming.length > maximumFiles) {
          throw new Error(mediaType === 'IMAGE'
            ? `Upload no more than ${maximumFiles} product images.`
            : 'Only one product video can be uploaded.');
        }
        const prepared = incoming.map(file => {
          if (!input.accept.split(',').includes(file.type)) {
            throw new Error(mediaType === 'IMAGE'
              ? 'Images must be JPEG, PNG or WebP files.'
              : 'Video must be an MP4 or WebM file.');
          }
          if (file.size <= 0 || file.size > maximumBytes) {
            throw new Error(mediaType === 'IMAGE'
              ? 'Each product image must be 10 MB or smaller.'
              : 'The product video must be 100 MB or smaller.');
          }
          return {
            file,
            previewUrl: URL.createObjectURL(file),
            objectUrl: true,
            existingUrl: '',
            uploadKey: '',
            status: 'uploading',
            progress: 0,
            error: '',
          };
        });
        entries.push(...prepared);
        prepared.forEach(entry => {
          upload(entry);
        });
        syncValues();
        render();
      };

      choose.addEventListener('click', () => input.click());
      input.addEventListener('change', () => {
        try {
          clearFieldError(form, mediaType === 'IMAGE' ? 'imageUploadKeys' : 'videoUrl');
          if (input.files.length) addFiles(input.files);
        } catch (cause) {
          setFieldError(form, mediaType === 'IMAGE' ? 'imageUploadKeys' : 'videoUrl', cause.message);
        }
        input.value = '';
      });
      choose.addEventListener('dragover', drag => {
        drag.preventDefault();
        choose.classList.add('is-dragging');
      });
      choose.addEventListener('dragleave', () => choose.classList.remove('is-dragging'));
      choose.addEventListener('drop', drop => {
        drop.preventDefault();
        choose.classList.remove('is-dragging');
        try {
          clearFieldError(form, mediaType === 'IMAGE' ? 'imageUploadKeys' : 'videoUrl');
          addFiles(drop.dataTransfer.files);
        } catch (cause) {
          setFieldError(form, mediaType === 'IMAGE' ? 'imageUploadKeys' : 'videoUrl', cause.message);
        }
      });

      const controller = {
        mediaType,
        entries,
        completedUrls,
        hasPending: () => entries.some(entry => entry.status === 'uploading'),
        hasError: () => entries.some(entry => entry.status === 'error'),
        setExisting: urls => {
          entries.filter(entry => entry.objectUrl).forEach(entry => URL.revokeObjectURL(entry.previewUrl));
          entries.splice(0, entries.length, ...(Array.isArray(urls) ? urls : [])
            .filter(url => typeof url === 'string' && url.trim())
            .slice(0, maximumFiles)
            .map(url => ({
              file: null,
              previewUrl: url.trim(),
              objectUrl: false,
              existingUrl: url.trim(),
              uploadKey: '',
              status: 'complete',
              progress: 100,
              error: '',
            })));
          syncValues();
          render();
        },
      };
      controllers.push(controller);
      syncValues();
      render();
    });

    if (videoField) {
      const modes = videoField.querySelectorAll('[data-video-mode]');
      const panels = videoField.querySelectorAll('[data-video-panel]');
      const videoController = controllers.find(controller => controller.mediaType === 'VIDEO');
      const switchMode = mode => {
        videoField.dataset.mode = mode;
        modes.forEach(button => button.setAttribute('aria-selected', String(button.dataset.videoMode === mode)));
        panels.forEach(panel => { panel.hidden = panel.dataset.videoPanel !== mode; });
        form.__showcaseVideoUploadKey = mode === 'UPLOAD'
          ? videoController?.completedUrls()[0] || ''
          : '';
        const existingVideoUrl = videoController?.entries
          .find(entry => entry.status === 'complete' && entry.existingUrl)?.existingUrl || '';
        videoValue.value = mode === 'URL'
          ? videoUrlInput.value.trim()
          : form.__showcaseVideoUploadKey ? '' : existingVideoUrl;
        clearFieldError(form, 'videoUrl');
      };
      modes.forEach(button => button.addEventListener('click', () => switchMode(button.dataset.videoMode)));
      videoUrlInput.addEventListener('input', () => {
        if (videoField.dataset.mode === 'URL') videoValue.value = videoUrlInput.value.trim();
      });
      switchMode('UPLOAD');
    }

    form.__showcaseMediaControllers = controllers;
    return controllers;
  };

  const appendInlineMarkdown = (target, source) => {
    const pattern = /(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|`([^`\n]+)`|\*([^*\n]+)\*|_([^_\n]+)_)/g;
    let cursor = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      if (match.index > cursor) target.append(document.createTextNode(source.slice(cursor, match.index)));
      let element;
      let text;
      if (match[2] && match[3]) {
        try {
          const url = new URL(match[3]);
          if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol');
          element = document.createElement('a');
          element.href = url.href;
          element.target = '_blank';
          element.rel = 'noopener noreferrer';
          text = match[2];
        } catch (_) {
          target.append(document.createTextNode(match[0]));
          cursor = pattern.lastIndex;
          continue;
        }
      } else if (match[4] || match[5]) {
        element = document.createElement('strong');
        text = match[4] || match[5];
      } else if (match[6]) {
        element = document.createElement('code');
        text = match[6];
      } else {
        element = document.createElement('em');
        text = match[7] || match[8];
      }
      element.textContent = text;
      target.append(element);
      cursor = pattern.lastIndex;
    }
    if (cursor < source.length) target.append(document.createTextNode(source.slice(cursor)));
  };

  const renderMarkdown = (target, source) => {
    target.replaceChildren();
    if (!source.trim()) {
      const empty = document.createElement('p');
      empty.className = 'markdown-preview-empty';
      empty.textContent = 'Start writing Markdown to see the product details preview.';
      target.append(empty);
      return;
    }

    const lines = source.replace(/\r/g, '').split('\n');
    const isBlockStart = line => /^(?:#{1,3}\s+|```|>\s?|[-*]\s+|\d+\.\s+|_{3,}\s*$|-{3,}\s*$)/.test(line);
    let index = 0;
    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) {
        index += 1;
        continue;
      }

      if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        const content = [];
        index += 1;
        while (index < lines.length && !lines[index].startsWith('```')) {
          content.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        if (language) code.dataset.language = language;
        code.textContent = content.join('\n');
        pre.append(code);
        target.append(pre);
        continue;
      }

      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        const element = document.createElement(`h${heading[1].length}`);
        appendInlineMarkdown(element, heading[2]);
        target.append(element);
        index += 1;
        continue;
      }

      if (/^(?:_{3,}|-{3,})\s*$/.test(line)) {
        target.append(document.createElement('hr'));
        index += 1;
        continue;
      }

      if (/^>\s?/.test(line)) {
        const quoteLines = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) {
          quoteLines.push(lines[index].replace(/^>\s?/, ''));
          index += 1;
        }
        const quote = document.createElement('blockquote');
        const paragraph = document.createElement('p');
        appendInlineMarkdown(paragraph, quoteLines.join(' '));
        quote.append(paragraph);
        target.append(quote);
        continue;
      }

      const unordered = /^[-*]\s+/.test(line);
      const ordered = /^\d+\.\s+/.test(line);
      if (unordered || ordered) {
        const list = document.createElement(ordered ? 'ol' : 'ul');
        const expression = ordered ? /^\d+\.\s+(.+)$/ : /^[-*]\s+(.+)$/;
        while (index < lines.length) {
          const itemMatch = lines[index].match(expression);
          if (!itemMatch) break;
          const item = document.createElement('li');
          appendInlineMarkdown(item, itemMatch[1]);
          list.append(item);
          index += 1;
        }
        target.append(list);
        continue;
      }

      const paragraphLines = [line.trim()];
      index += 1;
      while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
        paragraphLines.push(lines[index].trim());
        index += 1;
      }
      const paragraph = document.createElement('p');
      appendInlineMarkdown(paragraph, paragraphLines.join(' '));
      target.append(paragraph);
    }
  };

  const wireMarkdownEditor = (scope, form) => {
    const dialog = scope.querySelector('[data-markdown-dialog]');
    const openButton = scope.querySelector('[data-open-markdown]');
    const source = form.productDetails;
    if (!dialog || !openButton || !source) return;

    const editor = dialog.querySelector('[data-markdown-input]');
    const preview = dialog.querySelector('[data-markdown-preview]');
    const counts = scope.querySelectorAll('[data-count="productDetails"]');
    const sync = (value, origin) => {
      if (origin !== source) {
        source.value = value;
        source.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (origin !== editor) editor.value = value;
      counts.forEach(count => { count.textContent = `${value.length} / 5000`; });
      renderMarkdown(preview, value);
    };
    const close = () => {
      if (dialog.open) dialog.close();
    };

    source.addEventListener('input', () => sync(source.value, source));
    editor.addEventListener('input', () => sync(editor.value, editor));
    openButton.addEventListener('click', () => {
      sync(source.value, source);
      document.body.classList.add('markdown-editor-opened');
      dialog.showModal();
      requestAnimationFrame(() => editor.focus());
    });
    dialog.querySelectorAll('[data-close-markdown]').forEach(button => button.addEventListener('click', close));
    dialog.addEventListener('click', event => {
      if (event.target === dialog) close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('markdown-editor-opened');
      openButton.focus();
    });
    sync(source.value, source);
  };

  const enhanceSelects = scope => {
    scope.querySelectorAll('[data-select-component]').forEach((root, index) => {
      const select = root.querySelector('select');
      if (!select || root.classList.contains('is-enhanced')) return;

      const trigger = document.createElement('button');
      const value = document.createElement('span');
      const menu = document.createElement('div');
      const menuId = `select-component-menu-${index}`;
      const valueId = `select-component-value-${index}`;
      trigger.type = 'button';
      trigger.className = 'select-component-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-controls', menuId);
      value.className = 'select-component-value';
      value.id = valueId;
      trigger.setAttribute('aria-labelledby', [select.getAttribute('aria-labelledby'), valueId].filter(Boolean).join(' '));
      trigger.append(value);
      menu.id = menuId;
      menu.className = 'select-component-menu';
      menu.setAttribute('role', 'listbox');
      menu.hidden = true;

      [...select.options].forEach(option => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'select-component-option';
        item.setAttribute('role', 'option');
        item.dataset.value = option.value;
        item.textContent = option.textContent;
        item.addEventListener('click', () => {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          root.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          menu.hidden = true;
          trigger.focus();
        });
        menu.append(item);
      });

      const sync = () => {
        const selected = select.options[select.selectedIndex];
        value.textContent = selected ? selected.textContent : '';
        trigger.disabled = select.disabled;
        menu.querySelectorAll('[role="option"]').forEach(item => {
          item.setAttribute('aria-selected', String(item.dataset.value === select.value));
        });
      };
      const open = () => {
        if (trigger.disabled) return;
        root.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
      };
      const close = () => {
        root.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      };

      trigger.addEventListener('click', () => menu.hidden ? open() : close());
      trigger.addEventListener('keydown', event => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        open();
        const selected = menu.querySelector('[aria-selected="true"]') || menu.firstElementChild;
        if (selected) selected.focus();
      });
      menu.addEventListener('keydown', event => {
        const options = [...menu.querySelectorAll('[role="option"]')];
        const current = options.indexOf(document.activeElement);
        if (event.key === 'Escape') {
          close();
          trigger.focus();
          return;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        options[(current + direction + options.length) % options.length].focus();
      });
      document.addEventListener('click', event => {
        if (!root.contains(event.target)) close();
      });
      select.addEventListener('change', sync);
      select.addEventListener('selectstatechange', sync);
      root.append(trigger, menu);
      root.classList.add('is-enhanced');
      select.tabIndex = -1;
      select.setAttribute('aria-hidden', 'true');
      sync();
    });
  };

  const wireSourceFields = (form, scope) => {
    const sync = () => {
      const selected = form.sourceType.value;
      scope.querySelectorAll('[data-source-fields]').forEach(section => {
        section.hidden = section.dataset.sourceFields !== selected;
      });
      form.productUrl.required = selected === 'PRODUCT_URL';
      form.productUrl.disabled = selected !== 'PRODUCT_URL';
      form.amazonAsin.required = selected === 'AMAZON_ASIN';
      form.amazonAsin.disabled = selected !== 'AMAZON_ASIN';
      form.amazonMarketplace.required = selected === 'AMAZON_ASIN';
      form.amazonMarketplace.disabled = selected !== 'AMAZON_ASIN';
      form.amazonMarketplace.dispatchEvent(new Event('selectstatechange'));
    };
    [...form.querySelectorAll('[name="sourceType"]')]
      .forEach(input => input.addEventListener('change', sync));
    sync();
    return sync;
  };

  const validationTarget = (form, name) => {
    if (name === 'sourceType') return form.querySelector('.source-options');
    if (name === 'imageUploadKeys') {
      return form.querySelector('[data-media-upload="IMAGE"] [data-media-choose]');
    }
    if (name === 'videoUrl') {
      const videoField = form.querySelector('[data-video-field]');
      return videoField?.dataset.mode === 'URL'
        ? videoField.querySelector('[data-video-url-input]')
        : videoField?.querySelector('[data-media-upload="VIDEO"] [data-media-choose]') || form.videoUrl;
    }
    if (name === 'amazonMarketplace') {
      const select = form.elements.namedItem(name);
      return select?.closest('.select-component')?.querySelector('.select-component-trigger') || select;
    }
    return form.elements.namedItem(name);
  };

  const validationGroup = target => target?.closest(
    '.media-field, .markdown-field, .form-field, label, .source-options, .select-component',
  ) || target;

  const ensureFieldError = (form, name) => {
    let error = form.querySelector(`[data-error-for="${name}"]`);
    if (error) return error;
    const target = validationTarget(form, name);
    if (!target) return null;
    error = document.createElement('small');
    error.className = 'field-error';
    error.dataset.errorFor = name;
    error.id = `${name}-error`;
    error.setAttribute('role', 'alert');
    error.hidden = true;
    const group = validationGroup(target);
    if (group?.classList.contains('source-options')) group.insertAdjacentElement('afterend', error);
    else (group || target.parentElement).append(error);
    return error;
  };

  const clearFieldError = (form, name) => {
    const error = form.querySelector(`[data-error-for="${name}"]`);
    const target = validationTarget(form, name);
    if (error) {
      error.textContent = '';
      error.hidden = true;
      if (error.id && target) {
        const describedBy = (target.getAttribute('aria-describedby') || '')
          .split(/\s+/)
          .filter(id => id && id !== error.id);
        if (describedBy.length) target.setAttribute('aria-describedby', describedBy.join(' '));
        else target.removeAttribute('aria-describedby');
      }
    }
    if (target) target.removeAttribute('aria-invalid');
    validationGroup(target)?.classList.remove('has-field-error');
  };

  const setFieldError = (form, name, message) => {
    const target = validationTarget(form, name);
    const error = ensureFieldError(form, name);
    if (!target || !error) return target;
    error.textContent = message;
    error.hidden = false;
    target.setAttribute('aria-invalid', 'true');
    const describedBy = new Set((target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
    describedBy.add(error.id);
    target.setAttribute('aria-describedby', [...describedBy].join(' '));
    validationGroup(target)?.classList.add('has-field-error');
    return target;
  };

  const clearFieldErrors = form => {
    form.querySelectorAll('[data-error-for]').forEach(error => clearFieldError(form, error.dataset.errorFor));
  };

  const wireInlineValidation = form => {
    const clearChangedField = event => {
      const name = event.target.name
        || (event.target.matches?.('[data-video-url-input]') ? 'videoUrl' : '');
      if (name) clearFieldError(form, name);
      if (name === 'sourceType') {
        clearFieldError(form, 'productUrl');
        clearFieldError(form, 'amazonMarketplace');
        clearFieldError(form, 'amazonAsin');
      }
    };
    form.addEventListener('input', clearChangedField);
    form.addEventListener('change', clearChangedField);
  };

  const validateProduct = form => {
    clearFieldErrors(form);
    const issues = [];
    const addIssue = (name, message) => {
      if (!issues.some(issue => issue.name === name)) issues.push({ name, message });
    };
    const imageController = form.__showcaseMediaControllers
      ?.find(controller => controller.mediaType === 'IMAGE');
    if (imageController?.hasPending()) {
      addIssue('imageUploadKeys', 'Wait for all product images to finish uploading.');
    } else if (imageController?.hasError()) {
      addIssue('imageUploadKeys', 'Retry or remove each failed product image before submitting.');
    }
    const uploadedImages = form.imageUploadKeys
      ? (() => {
        try { return JSON.parse(form.imageUploadKeys.value || '[]'); } catch (_) { return []; }
      })()
      : [];
    const retainedImages = form.__showcaseImageUrls || [];
    if (!imageController?.hasPending() && !imageController?.hasError()) {
      const imageCount = uploadedImages.length + retainedImages.length;
      if (imageCount < 1) addIssue('imageUploadKeys', 'Upload at least one product image.');
      else if (imageCount > 5) addIssue('imageUploadKeys', 'Keep no more than five product images.');
    }

    const productName = form.productName.value.trim();
    if (!productName) addIssue('productName', 'Enter the product name.');
    else if (productName.length < 2) addIssue('productName', 'Product name must contain at least 2 characters.');

    const productDetails = form.productDetails.value.trim();
    if (!productDetails) addIssue('productDetails', 'Add product details for the editorial review.');
    else if (productDetails.length < 20) {
      addIssue('productDetails', 'Product details must contain at least 20 characters.');
    } else if (productDetails.length > 5000) {
      addIssue('productDetails', 'Product details cannot exceed 5000 characters.');
    }

    const videoController = form.__showcaseMediaControllers
      ?.find(controller => controller.mediaType === 'VIDEO');
    const videoField = form.querySelector('[data-video-field]');
    const validatesVideoUpload = !videoField || videoField.dataset.mode !== 'URL';
    if (validatesVideoUpload && videoController?.hasPending()) {
      addIssue('videoUrl', 'Wait for the product video to finish uploading.');
    } else if (validatesVideoUpload && videoController?.hasError()) {
      addIssue('videoUrl', 'Retry or remove the failed product video before submitting.');
    }
    if (form.videoUrl.value.trim()) {
      try {
        assertHttpsUrl(form.videoUrl.value.trim(), 'Video URL');
      } catch (cause) {
        addIssue('videoUrl', cause.message);
      }
    }

    const sourceType = form.sourceType?.value || '';
    if (!sourceType) addIssue('sourceType', 'Choose a product source.');
    if (sourceType === 'PRODUCT_URL') {
      const productUrl = form.productUrl.value.trim();
      if (!productUrl) addIssue('productUrl', 'Add the public product page link.');
      else {
        try {
          assertHttpsUrl(productUrl, 'Product link');
        } catch (cause) {
          addIssue('productUrl', cause.message);
        }
      }
    } else if (sourceType === 'AMAZON_ASIN') {
      if (!form.amazonMarketplace.value) {
        addIssue('amazonMarketplace', 'Choose the Amazon marketplace where this ASIN is listed.');
      }
      const asin = form.amazonAsin.value.trim();
      if (!asin) addIssue('amazonAsin', 'Enter the product ASIN.');
      else if (!/^[A-Za-z0-9]{10}$/.test(asin)) {
        addIssue('amazonAsin', 'Enter a valid 10-character Amazon ASIN.');
      }
    }

    const email = form.submitterEmail.value.trim();
    if (!email) addIssue('submitterEmail', 'Enter a contact email.');
    else if (!form.submitterEmail.checkValidity()) {
      addIssue('submitterEmail', 'Enter a valid email address.');
    }

    if (issues.length) {
      let firstTarget;
      issues.forEach(issue => {
        const target = setFieldError(form, issue.name, issue.message);
        if (!firstTarget && target) firstTarget = target;
      });
      if (firstTarget) {
        firstTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => firstTarget.focus?.({ preventScroll: true }), 220);
      }
      return false;
    }
    return true;
  };

  const productBody = form => {
    const body = {
      submitterEmail: form.submitterEmail.value.trim(),
      sourceType: form.sourceType.value,
      productName: form.productName.value.trim(),
      productDetails: form.productDetails.value.trim(),
      productUrl: form.sourceType.value === 'PRODUCT_URL' ? form.productUrl.value.trim() : null,
      videoUploadKey: form.__showcaseVideoUploadKey || null,
      videoUrl: form.videoUrl.value.trim() || null,
      amazonAsin: form.sourceType.value === 'AMAZON_ASIN'
        ? form.amazonAsin.value.trim().toUpperCase()
        : null,
      amazonMarketplace: form.sourceType.value === 'AMAZON_ASIN'
        ? form.amazonMarketplace.value
        : null,
    };
    if (form.imageUploadKeys) {
      body.imageUploadKeys = JSON.parse(form.imageUploadKeys.value || '[]');
      if (Array.isArray(form.__showcaseImageUrls)) body.imageUrls = form.__showcaseImageUrls;
    } else {
      body.imageUrls = form.__showcaseImageUrls || [];
    }
    return body;
  };

  const formShell = document.querySelector('[data-showcase-form]');
  if (formShell) {
    const form = formShell.querySelector('form');
    const error = formShell.querySelector('.form-error');
    const api = formShell.dataset.apiBase;
    let submitting = false;

    enhanceSelects(formShell);
    wireInlineValidation(form);
    wireSourceFields(form, formShell);
    wireMarkdownEditor(formShell, form);
    wireMediaUploads(formShell, form, api);

    const showError = message => {
      error.textContent = message;
      error.hidden = false;
    };
    const clearError = () => {
      error.textContent = '';
      error.hidden = true;
    };
    clearError();

    const run = async () => {
      if (submitting) return;
      const submitButton = form.querySelector('[type="submit"]');
      clearError();
      if (!validateProduct(form)) return;
      try {
        submitting = true;
        submitButton.disabled = true;
        event('product_submission_start');
        const result = await json(`${api}/submissions`, {
          method: 'POST',
          body: JSON.stringify(productBody(form)),
        });
        event('product_submission_success');
        if (!result.managementUrl) throw new Error('The private management link was not returned.');
        const managementUrl = new URL(result.managementUrl, window.location.href);
        if (['127.0.0.1', 'localhost'].includes(window.location.hostname)) {
          managementUrl.protocol = window.location.protocol;
          managementUrl.host = window.location.host;
        }
        window.location.replace(managementUrl.href);
      } catch (cause) {
        showError(cause.message || 'Submission failed. Please retry.');
      } finally {
        submitting = false;
        submitButton.disabled = false;
      }
    };

    form.addEventListener('submit', e => {
      e.preventDefault();
      run();
    });
  }

  const managementPage = document.querySelector('[data-management-page]');
  if (managementPage) {
    const editForm = managementPage.querySelector('.management-edit-form');
    const editSection = managementPage.querySelector('.management-edit-section');
    const panel = managementPage.querySelector('.management-panel');
    const skeleton = managementPage.querySelector('[data-management-skeleton]');
    const statusAnchor = managementPage.querySelector('.management-page-intro');
    const error = managementPage.querySelector('.form-error');
    const offlinePanel = managementPage.querySelector('[data-offline-panel]');
    const offlineButton = managementPage.querySelector('[data-take-offline]');
    const saveButton = managementPage.querySelector('[data-management-save]');
    const feedback = managementPage.querySelector('[data-management-feedback]');
    const publicProductLink = managementPage.querySelector('[data-view-public-product]');
    const moderationBadge = managementPage.querySelector('[data-moderation-status]');
    const publishBadge = managementPage.querySelector('[data-publish-status]');
    const reviewInsights = managementPage.querySelector('[data-review-insights]');
    const reviewSuggestion = managementPage.querySelector('[data-review-suggestion]');
    const reviewScore = managementPage.querySelector('[data-review-score]');
    const reviewScoreValue = managementPage.querySelector('[data-review-score-value]');
    const confirmDialog = managementPage.querySelector('[data-management-confirm-dialog]');
    const confirmTitle = confirmDialog.querySelector('[data-management-confirm-title]');
    const confirmDescription = confirmDialog.querySelector('[data-management-confirm-description]');
    const confirmSubmit = confirmDialog.querySelector('[data-management-confirm-submit]');
    const confirmCancel = confirmDialog.querySelector('.management-confirm-actions [data-management-confirm-cancel]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let resolveConfirmation;

    const confirmManagementAction = ({ title, description, actionLabel, intent }) => new Promise(resolve => {
      if (confirmDialog.open) {
        resolve(false);
        return;
      }
      confirmTitle.textContent = title;
      confirmDescription.textContent = description;
      confirmSubmit.textContent = actionLabel;
      confirmSubmit.classList.toggle('showcase-offline', intent === 'offline');
      confirmSubmit.classList.toggle('showcase-primary', intent !== 'offline');
      confirmDialog.returnValue = 'cancel';
      resolveConfirmation = resolve;
      confirmDialog.showModal();
      confirmCancel.focus();
    });

    confirmDialog.querySelectorAll('[data-management-confirm-cancel]').forEach(button => {
      button.addEventListener('click', () => confirmDialog.close('cancel'));
    });
    confirmSubmit.addEventListener('click', () => confirmDialog.close('confirm'));
    confirmDialog.addEventListener('click', e => {
      if (e.target === confirmDialog) confirmDialog.close('cancel');
    });
    confirmDialog.addEventListener('close', () => {
      const resolve = resolveConfirmation;
      resolveConfirmation = null;
      resolve?.(confirmDialog.returnValue === 'confirm');
    });

    const setManagementLoading = loading => {
      if (skeleton) skeleton.hidden = !loading;
      managementPage.setAttribute('aria-busy', String(loading));
    };

    enhanceSelects(managementPage);
    wireInlineValidation(editForm);
    wireMarkdownEditor(managementPage, editForm);
    const syncEditSource = wireSourceFields(editForm, editForm);
    const managementMediaControllers = wireMediaUploads(
      editSection,
      editForm,
      managementPage.dataset.apiBase,
    );
    const managementImageController = managementMediaControllers
      .find(controller => controller.mediaType === 'IMAGE');
    const managementVideoController = managementMediaControllers
      .find(controller => controller.mediaType === 'VIDEO');
    const managementVideoUrlInput = editForm.querySelector('[data-video-url-input]');
    const managementMatch = window.location.pathname.match(
      /\/product-showcase\/manage\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/?$/i,
    );
    const currentManagementUuid = managementMatch?.[1]
      || sessionStorage.getItem('nexscopeProductShowcaseManagementUuid')
      || '';
    if (!managementMatch && currentManagementUuid) {
      const basePath = window.location.pathname.replace(/\/?$/, '/');
      window.history.replaceState(null, '', `${basePath}${currentManagementUuid}`);
    }
    sessionStorage.removeItem('nexscopeProductShowcaseManagementUuid');

    const setStatusBadge = (element, state, label, accessibleLabel) => {
      element.dataset.state = String(state || '').toLowerCase();
      element.textContent = label;
      element.setAttribute('aria-label', `${accessibleLabel}: ${label}`);
    };
    const show = (data, feedbackMessage = '') => {
      const moderationCopy = {
        PENDING: 'UNDER REVIEW',
        APPROVED: 'APPROVED',
        REJECTED: 'CHANGES REQUESTED',
        WITHDRAWN: 'WITHDRAWN',
      }[data.moderationStatus] || data.moderationStatus || 'UNKNOWN';
      const publishCopy = data.publishStatus === 'ONLINE' ? 'LIVE' : 'OFFLINE';
      setStatusBadge(moderationBadge, data.moderationStatus, moderationCopy, 'Editorial review status');
      setStatusBadge(publishBadge, data.publishStatus, publishCopy, 'Product visibility status');
      const suggestion = typeof data.suggestion === 'string' ? data.suggestion.trim() : '';
      const score = data.score === null || data.score === undefined || data.score === ''
        ? null
        : Number(data.score);
      const hasSuggestion = suggestion.length > 0;
      // A default score of 0 is not editorial feedback on its own.
      const hasScore = hasSuggestion && Number.isFinite(score) && score >= 0 && score <= 100;
      reviewInsights.hidden = !hasSuggestion;
      reviewSuggestion.hidden = !hasSuggestion;
      if (hasSuggestion) renderMarkdown(reviewSuggestion, suggestion);
      else reviewSuggestion.replaceChildren();
      reviewScore.hidden = !hasScore;
      if (hasScore) {
        reviewScoreValue.textContent = String(Math.round(score));
        reviewScore.dataset.tone = score >= 80
          ? 'strong'
          : score >= 60
            ? 'fair'
            : score >= 40
              ? 'needs-work'
              : 'critical';
        reviewScore.setAttribute('aria-label', `Product score ${Math.round(score)} out of 100`);
      } else {
        reviewScoreValue.textContent = '—';
        reviewScore.removeAttribute('data-tone');
        reviewScore.removeAttribute('aria-label');
      }
      editForm.submitterEmail.value = data.submitterEmail || '';
      editForm.productName.value = data.productName || '';
      editForm.productDetails.value = data.productDetails || '';
      editForm.productDetails.dispatchEvent(new Event('input', { bubbles: true }));
      editForm.productUrl.value = data.sourceType === 'PRODUCT_URL' ? (data.productUrl || '') : '';
      managementVideoUrlInput.value = data.videoUrl || '';
      managementImageController?.setExisting(data.imageUrls || []);
      managementVideoController?.setExisting(data.videoUrl ? [data.videoUrl] : []);
      editForm.amazonAsin.value = data.amazonAsin || '';
      editForm.amazonMarketplace.value = data.amazonMarketplace || 'US';
      editForm.amazonMarketplace.dispatchEvent(new Event('selectstatechange'));
      const source = editForm.querySelector(`[name="sourceType"][value="${data.sourceType}"]`);
      if (source) source.checked = true;
      syncEditSource();
      feedback.textContent = feedbackMessage;
      feedback.hidden = !feedbackMessage;
      const withdrawn = data.moderationStatus === 'WITHDRAWN';
      const canTakeOffline = data.moderationStatus === 'APPROVED' && data.publishStatus === 'ONLINE';
      const publicUuid = typeof data.publicUuid === 'string' ? data.publicUuid.trim() : '';
      const hasPublicPage = canTakeOffline && Boolean(publicUuid);
      editSection.hidden = withdrawn;
      offlinePanel.hidden = !canTakeOffline;
      publicProductLink.hidden = !hasPublicPage;
      if (hasPublicPage) {
        publicProductLink.href = `${managementPage.dataset.publicPageBase}/${encodeURIComponent(publicUuid)}`;
      } else {
        publicProductLink.removeAttribute('href');
      }
      panel.hidden = false;
    };

    const load = async () => {
      error.hidden = true;
      panel.hidden = true;
      setManagementLoading(true);
      event('product_submission_status_check');
      try {
        const data = await json(`${managementPage.dataset.apiBase}/submissions/manage`, {
          headers: { 'X-Management-UUID': currentManagementUuid },
        });
        show(data);
      } catch (cause) {
        error.textContent = cause.message || 'Submission could not be loaded.';
        error.hidden = false;
      } finally {
        setManagementLoading(false);
      }
    };

    editForm.addEventListener('submit', async e => {
      e.preventDefault();
      error.hidden = true;
      if (!validateProduct(editForm)) return;
      if (!await confirmManagementAction({
        title: 'Save changes and resubmit?',
        description: 'This product will be taken offline immediately and returned to Under review. It must be approved and published again before it appears in the Product Gallery.',
        actionLabel: 'Save and resubmit',
        intent: 'resubmit',
      })) return;
      const saveLabel = saveButton.innerHTML;
      saveButton.disabled = true;
      saveButton.textContent = 'Saving changes…';
      try {
        const data = await json(`${managementPage.dataset.apiBase}/submissions/manage`, {
          method: 'PATCH',
          headers: { 'X-Management-UUID': currentManagementUuid },
          body: JSON.stringify(productBody(editForm)),
        });
        event('product_submission_update');
        show(data, 'Changes saved. This product is now Under review and Offline.');
        statusAnchor.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      } catch (cause) {
        error.textContent = cause.message || 'Changes could not be saved.';
        error.hidden = false;
        error.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = saveLabel;
      }
    });

    offlineButton.addEventListener('click', async () => {
      if (!await confirmManagementAction({
        title: 'Take this product offline?',
        description: 'It will disappear from the Product Gallery immediately. The approved submission will remain available on this private management page.',
        actionLabel: 'Take product offline',
        intent: 'offline',
      })) return;
      error.hidden = true;
      const offlineLabel = offlineButton.textContent;
      offlineButton.disabled = true;
      offlineButton.textContent = 'Taking product offline…';
      try {
        const data = await json(`${managementPage.dataset.apiBase}/submissions/manage/offline`, {
          method: 'POST',
          headers: { 'X-Management-UUID': currentManagementUuid },
        });
        event('product_submission_offline');
        show(data, 'This approved product is now Offline and no longer appears in the Product Gallery.');
        statusAnchor.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      } catch (cause) {
        error.textContent = cause.message || 'The product could not be taken offline.';
        error.hidden = false;
        error.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      } finally {
        offlineButton.disabled = false;
        offlineButton.textContent = offlineLabel;
      }
    });

    if (currentManagementUuid) load();
    else window.location.replace(managementPage.dataset.showcaseUrl || '/product-showcase/');
  }

})();
