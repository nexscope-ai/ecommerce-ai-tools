const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const script = readFileSync(join(__dirname, '../docs/assets/product-submission-draft.js'), 'utf8');
test('paused submission draft helper installs no handlers or storage writes', () => {
  const unexpected = () => { throw new Error('Paused helper must remain inactive'); };
  assert.doesNotThrow(() => runInNewContext(script, { document: { querySelector: unexpected }, sessionStorage: { getItem: unexpected, setItem: unexpected }, fetch: unexpected }));
});
test('the paused submission page no longer loads the draft helper or advertises saving drafts', () => {
  const layout = readFileSync(join(__dirname, '../docs/_layouts/default.html'), 'utf8');
  const page = readFileSync(join(__dirname, '../docs/product-showcase/submit/index.md'), 'utf8');
  assert.doesNotMatch(layout, /src="[^\"]*product-submission-draft\.js/);
  assert.doesNotMatch(page, /data-draft-save|data-draft-restore|data-draft-clear/);
});
