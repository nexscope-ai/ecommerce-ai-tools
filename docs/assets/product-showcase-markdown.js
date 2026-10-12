(function (root) {
  'use strict';

  const escapeCell = value => value.trim().replace(/\|/g, '\\|').replace(/\n/g, ' ');

  // Older editorial notes were pasted as tab-separated text rather than Markdown.
  // Normalize those notes at display time so existing reviews keep their structure.
  const normalizeReviewSuggestion = source => {
    const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');
    const output = [];
    for (let index = 0; index < lines.length;) {
      const cells = lines[index].split('\t');
      if (cells.length >= 2 && cells.every(cell => cell.trim())) {
        const rows = [];
        while (index < lines.length) {
          const row = lines[index].split('\t');
          if (row.length !== cells.length || !row.every(cell => cell.trim())) break;
          rows.push(row);
          index += 1;
        }
        if (rows.length >= 2) {
          if (output.length && output[output.length - 1].trim()) output.push('');
          output.push(`| ${rows[0].map(escapeCell).join(' | ')} |`);
          output.push(`| ${rows[0].map(() => '---').join(' | ')} |`);
          rows.slice(1).forEach(row => output.push(`| ${row.map(escapeCell).join(' | ')} |`));
          output.push('');
        } else {
          output.push(...rows.map(row => row.join('\t')));
        }
        continue;
      }

      const line = lines[index];
      const trimmed = line.trim();
      if (/^(?:Submitted product detail page (?:SEO|GEO)|Submitted description, images, and video)$/i.test(trimmed)) {
        if (output.length && output[output.length - 1].trim()) output.push('');
        output.push(`## ${trimmed}`, '');
      } else if (/^Suggested meta description,.*:$/i.test(trimmed)) {
        if (output.length && output[output.length - 1].trim()) output.push('');
        output.push(`### ${trimmed}`, '');
      } else if (/^Content optimization score:\s*\d{1,3}\/100$/i.test(trimmed)) {
        output.push(`**${trimmed}**`);
      } else {
        output.push(line);
      }
      index += 1;
    }
    return output.join('\n');
  };

  const taskListPlugin = parser => {
    parser.core.ruler.after('inline', 'product-showcase-task-lists', state => {
      const tokens = state.tokens;
      tokens.forEach((token, index) => {
        if (token.type !== 'inline' || index < 2 || tokens[index - 2].type !== 'list_item_open') return;
        const first = token.children?.[0];
        if (!first || first.type !== 'text') return;
        const match = first.content.match(/^\[([ xX])\]\s+/);
        if (!match) return;

        first.content = first.content.slice(match[0].length);
        const checkbox = new state.Token('html_inline', '', 0);
        checkbox.content = `<input type="checkbox" disabled tabindex="-1"${match[1].toLowerCase() === 'x' ? ' checked' : ''}>`;
        token.children.unshift(checkbox);
        tokens[index - 2].attrJoin('class', 'task-list-item');

        for (let parentIndex = index - 3; parentIndex >= 0; parentIndex -= 1) {
          if (tokens[parentIndex].type === 'bullet_list_open' || tokens[parentIndex].type === 'ordered_list_open') {
            tokens[parentIndex].attrJoin('class', 'contains-task-list');
            break;
          }
        }
      });
    });
  };

  const createParser = markdownit => {
    if (typeof markdownit !== 'function') return null;
    const parser = markdownit({
      breaks: true,
      html: false,
      linkify: true,
      typographer: false,
    });
    const validateLink = parser.validateLink.bind(parser);
    parser.validateLink = value => {
      try {
        const url = new URL(value, root.location?.href || 'https://learn.nexscope.ai/');
        return ['http:', 'https:'].includes(url.protocol)
          && !url.username
          && !url.password
          && validateLink(value);
      } catch (_) {
        return false;
      }
    };
    parser.disable('image');
    parser.use(taskListPlugin);
    return parser;
  };

  const compactTableValue = value => /^(?:\d{1,4}(?:\.\d+)?\s*\/\s*\d{1,4}(?:\.\d+)?|[-+]?\d{1,6}(?:\.\d+)?%?)$/.test(value);

  const decorateTable = table => {
    const rows = Array.from(table.rows);
    const bodyRows = Array.from(table.tBodies).flatMap(body => Array.from(body.rows));
    const columnCount = rows.reduce((count, row) => Math.max(count, row.cells.length), 0);

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const values = bodyRows
        .map(row => row.cells[columnIndex]?.textContent.replace(/\s+/g, ' ').trim() || '')
        .filter(Boolean);
      if (!values.length || !values.every(compactTableValue)) continue;
      rows.forEach(row => row.cells[columnIndex]?.classList.add('markdown-table-compact'));
    }

    const hasNarrativeCell = bodyRows.some(row => Array.from(row.cells).some(cell => cell.textContent.trim().length >= 40));
    table.classList.toggle('markdown-table-wide', columnCount >= 3 && hasNarrativeCell);
  };

  let linkPreviewCard;
  let linkPreviewShowTimer;
  let linkPreviewHideTimer;
  let activePreviewLink;

  const safeWebUrl = (value, base = root.location?.href || 'https://learn.nexscope.ai/') => {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    try {
      const url = new URL(raw, base);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url : null;
    } catch (_) {
      return null;
    }
  };

  const shorten = (value, limit) => {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    return clean.length <= limit ? clean : `${clean.slice(0, limit - 1).trimEnd()}…`;
  };

  const googleFaviconUrl = url => `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url.origin)}&sz=64`;

  const setFavicon = (container, value) => {
    const image = container.querySelector('img');
    const source = safeWebUrl(value)?.href;
    container.classList.remove('is-fallback');
    image.hidden = !source;
    image.onerror = () => {
      image.hidden = true;
      container.classList.add('is-fallback');
    };
    if (source) image.src = source;
    else container.classList.add('is-fallback');
  };

  const createFavicon = (url, className = '') => {
    const icon = document.createElement('span');
    icon.className = `markdown-link-favicon${className ? ` ${className}` : ''}`;
    icon.setAttribute('aria-hidden', 'true');
    icon.dataset.initial = (url.hostname.replace(/^www\./i, '')[0] || '↗').toUpperCase();
    const image = document.createElement('img');
    image.alt = '';
    image.width = 16;
    image.height = 16;
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    icon.append(image);
    setFavicon(icon, googleFaviconUrl(url));
    return icon;
  };

  const ensureLinkPreviewCard = link => {
    const host = link?.closest('dialog[open]') || document.body;
    if (linkPreviewCard?.isConnected) {
      if (linkPreviewCard.parentElement !== host) host.append(linkPreviewCard);
      return linkPreviewCard;
    }
    const card = document.createElement('aside');
    card.className = 'markdown-link-preview';
    card.setAttribute('role', 'tooltip');
    card.hidden = true;
    host.append(card);
    linkPreviewCard = card;
    root.addEventListener?.('resize', () => {
      if (activePreviewLink && !card.hidden) positionLinkPreview(activePreviewLink, card);
    }, { passive: true });
    document.addEventListener('scroll', () => {
      if (activePreviewLink && !card.hidden) positionLinkPreview(activePreviewLink, card);
    }, { capture: true, passive: true });
    return card;
  };

  const positionLinkPreview = (link, card) => {
    const rect = link.getBoundingClientRect();
    const margin = 10;
    const edge = 10;
    const width = card.offsetWidth || 360;
    const height = card.offsetHeight || 180;
    let left = rect.left + Math.min(rect.width / 2, 70) - 24;
    left = Math.max(edge, Math.min(left, root.innerWidth - width - edge));
    let top = rect.bottom + margin;
    if (top + height > root.innerHeight - edge) top = rect.top - height - margin;
    top = Math.max(edge, Math.min(top, root.innerHeight - height - edge));
    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;
  };

  const previewModel = (link, url) => {
    const host = url.hostname.replace(/^www\./i, '');
    const path = `${host}${url.pathname === '/' ? '' : url.pathname}`;
    return {
      faviconUrl: googleFaviconUrl(url),
      siteName: shorten(host, 80),
      title: shorten(link.textContent || host, 180),
      url,
      urlLabel: shorten(path, 100),
    };
  };

  const renderLinkPreview = (link, url) => {
    const card = ensureLinkPreviewCard(link);
    const model = previewModel(link, url);
    const header = document.createElement('div');
    header.className = 'markdown-link-preview-header';
    const icon = createFavicon(model.url, 'markdown-link-preview-favicon');
    setFavicon(icon, model.faviconUrl);
    const site = document.createElement('span');
    site.textContent = model.siteName;
    const external = document.createElement('span');
    external.className = 'markdown-link-preview-external';
    external.setAttribute('aria-hidden', 'true');
    external.textContent = '↗';
    header.append(icon, site, external);

    const title = document.createElement('strong');
    title.className = 'markdown-link-preview-title';
    title.textContent = model.title;
    const destination = document.createElement('span');
    destination.className = 'markdown-link-preview-url';
    destination.textContent = model.urlLabel;
    card.replaceChildren(header, title, destination);
    card.hidden = false;
    positionLinkPreview(link, card);
    return model;
  };

  const showLinkPreview = (link, url) => {
    root.clearTimeout(linkPreviewHideTimer);
    root.clearTimeout(linkPreviewShowTimer);
    activePreviewLink = link;
    linkPreviewShowTimer = root.setTimeout(() => {
      if (activePreviewLink !== link || !link.isConnected) return;
      renderLinkPreview(link, url);
    }, 180);
  };

  const hideLinkPreview = link => {
    root.clearTimeout(linkPreviewShowTimer);
    linkPreviewHideTimer = root.setTimeout(() => {
      if (activePreviewLink !== link) return;
      activePreviewLink = null;
      if (linkPreviewCard) linkPreviewCard.hidden = true;
    }, 100);
  };

  const enhanceLink = (link, url) => {
    if (link.dataset.richLinkEnhanced === 'true') return;
    link.dataset.richLinkEnhanced = 'true';
    link.classList.add('markdown-rich-link');
    link.prepend(createFavicon(url));
    link.addEventListener('pointerenter', () => showLinkPreview(link, url));
    link.addEventListener('pointerleave', () => hideLinkPreview(link));
    link.addEventListener('focus', () => showLinkPreview(link, url));
    link.addEventListener('blur', () => hideLinkPreview(link));
    link.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      activePreviewLink = null;
      if (linkPreviewCard) linkPreviewCard.hidden = true;
    });
  };

  const decorate = target => {
    target.querySelectorAll('a[href]').forEach(link => {
      try {
        const url = new URL(link.getAttribute('href'), root.location?.href || 'https://learn.nexscope.ai/');
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
          link.replaceWith(document.createTextNode(link.textContent));
          return;
        }
        link.href = url.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        enhanceLink(link, url);
      } catch (_) {
        link.replaceWith(document.createTextNode(link.textContent));
      }
    });

    target.querySelectorAll('img[src]').forEach(image => {
      try {
        const url = new URL(image.getAttribute('src'), root.location?.href || 'https://learn.nexscope.ai/');
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
          image.remove();
          return;
        }
        image.src = url.href;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.referrerPolicy = 'no-referrer';
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        image.removeAttribute('usemap');
      } catch (_) {
        image.remove();
      }
    });

    target.querySelectorAll('input').forEach(input => {
      if (input.type !== 'checkbox') {
        input.remove();
        return;
      }
      input.disabled = true;
      input.tabIndex = -1;
    });

    target.querySelectorAll('table').forEach(table => {
      decorateTable(table);
      if (table.parentElement?.classList.contains('markdown-table-scroll')) return;
      const scroll = document.createElement('div');
      scroll.className = 'markdown-table-scroll';
      table.replaceWith(scroll);
      scroll.append(table);
    });
  };

  const enhanceCopy = target => {
    if (target.dataset.markdownCopyEnhanced === 'true') return;
    target.dataset.markdownCopyEnhanced = 'true';
    target.addEventListener('copy', event => {
      const selection = root.getSelection?.();
      if (!selection || selection.rangeCount !== 1 || selection.isCollapsed || !event.clipboardData) return;
      const range = selection.getRangeAt(0);
      const common = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;
      if (common !== target && !target.contains(common)) return;

      const selectedLinks = Array.from(target.querySelectorAll('a[href]')).filter(link => {
        try {
          return range.intersectsNode(link);
        } catch (_) {
          return false;
        }
      });
      if (!selectedLinks.length) return;

      const rich = document.createElement('div');
      rich.append(range.cloneContents());
      rich.querySelectorAll('.markdown-link-favicon').forEach(node => node.remove());
      const startElement = range.startContainer.nodeType === Node.ELEMENT_NODE
        ? range.startContainer
        : range.startContainer.parentElement;
      const endElement = range.endContainer.nodeType === Node.ELEMENT_NODE
        ? range.endContainer
        : range.endContainer.parentElement;
      const startLink = startElement?.closest?.('a[href]');
      const endLink = endElement?.closest?.('a[href]');
      if (!rich.querySelector('a[href]') && startLink && startLink === endLink) {
        const link = startLink.cloneNode(false);
        link.textContent = selection.toString();
        rich.replaceChildren(link);
      }

      const plain = rich.cloneNode(true);
      plain.querySelectorAll('a[href]').forEach(link => {
        const label = link.textContent.trim();
        const url = link.href;
        link.replaceWith(document.createTextNode(label && label !== url ? `${label} (${url})` : url));
      });
      plain.style.cssText = 'position:fixed;left:-10000px;top:0;white-space:pre-wrap;';
      document.body.append(plain);
      let plainText = (plain.innerText || plain.textContent || '').trim();
      plain.remove();

      const missingLinks = selectedLinks.filter(link => !plainText.includes(link.href));
      if (missingLinks.length) {
        const references = missingLinks.map(link => {
          const label = link.textContent.trim();
          return label && label !== link.href ? `${label}: ${link.href}` : link.href;
        });
        plainText += `${plainText ? '\n\n' : ''}Links:\n- ${references.join('\n- ')}`;
      }

      event.clipboardData.setData('text/plain', plainText);
      event.clipboardData.setData('text/html', rich.innerHTML);
      event.preventDefault();
    });
  };

  const render = (target, source, options = {}) => {
    const value = String(source || '');
    target.__markdownSource = value;
    enhanceCopy(target);
    target.replaceChildren();

    if (!value.trim()) {
      const empty = document.createElement('p');
      empty.className = 'markdown-preview-empty';
      empty.textContent = options.emptyText || 'Start writing Markdown to see the product details preview.';
      target.append(empty);
      return;
    }

    const parser = options.parser;
    if (!parser) {
      const plain = document.createElement('p');
      plain.className = 'markdown-preview-plain';
      plain.textContent = value;
      target.append(plain);
      return;
    }

    const content = options.reviewSuggestion ? normalizeReviewSuggestion(value) : value;
    target.innerHTML = parser.render(content);
    decorate(target);
  };

  const copySource = async target => {
    const value = typeof target.__markdownSource === 'string' ? target.__markdownSource : '';
    if (!value) return false;
    if (root.navigator?.clipboard && root.isSecureContext) {
      await root.navigator.clipboard.writeText(value);
      return true;
    }
    const fallback = document.createElement('textarea');
    fallback.value = value;
    fallback.setAttribute('readonly', '');
    fallback.style.cssText = 'position:fixed;left:-10000px;top:0;';
    document.body.append(fallback);
    fallback.select();
    const copied = document.execCommand('copy');
    fallback.remove();
    return copied;
  };

  const api = { copySource, createParser, decorate, normalizeReviewSuggestion, render };
  root.ProductShowcaseMarkdown = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
