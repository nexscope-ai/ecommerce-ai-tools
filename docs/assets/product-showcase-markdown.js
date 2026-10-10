(function (root) {
  'use strict';

  // Older editorial notes were pasted as tab-separated text rather than Markdown.
  // Normalize those notes at display time so existing reviews keep their structure.
  const escapeCell = value => value.trim().replace(/\|/g, '\\|').replace(/\n/g, ' ');

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

  const createParser = markdownit => {
    if (typeof markdownit !== 'function') return null;
    const parser = markdownit({ html: false, linkify: false, typographer: false });
    parser.disable('image');
    const validateLink = parser.validateLink.bind(parser);
    parser.validateLink = url => /^https?:\/\//i.test(url) && validateLink(url);
    return parser;
  };

  const api = { normalizeReviewSuggestion, createParser };
  root.ProductShowcaseMarkdown = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
