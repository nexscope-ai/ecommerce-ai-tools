const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const script = readFileSync(require('node:path').join(__dirname, '../docs/assets/product-submission-draft.js'), 'utf8');
function setup({ blocked = false, confirm = true } = {}) {
  const storage = new Map(), events = [], listeners = {};
  const field = value => ({ value, dispatchEvent() {} });
  const fields = { productName: field('Roller kit'), productDetails: field('A factual description.'), submitterEmail: field('private@example.com'), productUrl: field('https://private.example/?token=secret') };
  const controls = {};
  for (const name of ['save', 'restore', 'clear']) controls[name] = { hidden: false, addEventListener: (_, fn) => { controls[name].click = fn; } };
  controls.status = { textContent: '' };
  const form = { elements: { namedItem: name => fields[name] }, querySelector: selector => controls[selector.match(/draft-(\w+)/)[1]], addEventListener: (name, fn) => { listeners[name] = fn; } };
  runInNewContext(script, { document: { querySelector: () => form }, location: { pathname: '/ecommerce-ai-tools/product-showcase/submit/' }, window: { confirm: () => confirm, gtag: (...args) => events.push(args) }, sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => { if (blocked) throw new Error('blocked'); storage.set(key, value); }, removeItem: key => storage.delete(key) }, Date, Event: class {} });
  return { storage, fields, controls, events, listeners };
}
test('drafts store only the chosen product text and clear after successful submission', () => {
  const s = setup(); s.controls.save.click();
  const saved = [...s.storage.values()][0];
  assert.equal(saved.includes('private'), false); assert.equal(saved.includes('secret'), false);
  assert.equal(JSON.stringify(s.events).includes('Roller'), false);
  s.fields.productName.value = ''; s.fields.productDetails.value = ''; s.controls.restore.click();
  assert.equal(s.fields.productName.value, 'Roller kit');
  s.listeners['showcase-submitted'](); assert.equal(s.storage.size, 0); assert.equal(s.controls.restore.hidden, true);
});
test('restore never overwrites edited text when confirmation is declined', () => {
  const s = setup({ confirm: false }); s.controls.save.click(); s.fields.productName.value = 'New text'; s.controls.restore.click();
  assert.equal(s.fields.productName.value, 'New text');
});
test('expired drafts are removed and unavailable storage does not break the form', () => {
  const s = setup(); s.controls.save.click(); const key = [...s.storage.keys()][0]; const draft = JSON.parse(s.storage.get(key)); draft.savedAt -= 86400001; s.storage.set(key, JSON.stringify(draft)); s.controls.restore.click(); assert.equal(s.storage.size, 0);
  const blocked = setup({ blocked: true }); assert.doesNotThrow(() => blocked.controls.save.click()); assert.match(blocked.controls.status.textContent, /unavailable/);
});
