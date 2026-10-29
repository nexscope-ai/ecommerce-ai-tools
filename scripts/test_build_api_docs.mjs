import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, readdir, mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {project, validate, build, buildRoot, buildPages, officialTestUrl} from './build_api_docs.mjs';
import {runInNewContext} from 'node:vm';

const entry={slug:'test-api',name:'Test API',description:'Public <example>',group:'Data',categorySlug:'data-amazon-front-data',method:'POST',path:'/test',requestSchema:{type:'object',properties:{query:{type:'string',description:'Query'}},required:['query']},requestExample:{query:'example'}};
const snapshot={schemaVersion:1,scope:'data',generatedAt:'2026-10-29T00:00:00Z',entries:[entry]};
test('projection preserves public endpoints and excludes internal fields',()=>{
  const result=project({generatedAt:snapshot.generatedAt,apiSlugs:[entry.slug],apiDetailsBySlug:{[entry.slug]:{route:{kind:'upstream-skill',record:{...entry,mcpToolName:'private_tool',primaryProxy:'internal'}},catalog:{skills:[{...entry,endpoint:'/public/test'}],categories:[]}}}});
  assert.equal(result.entries[0].path,'/public/test');
  assert.equal(result.entries[0].mcpToolName,undefined);
  assert.equal(result.entries[0].primaryProxy,undefined);
});
test('projection excludes SEO, creative, routing and account contracts',()=>{
  const categories=['data-tiktok','amazon-advertising','video-generation-models','image-generation-models','multimodal-ai','ai-content-generation','jev','marketing','account-apis'];
  const models=Object.fromEntries(categories.map((categorySlug,index)=>{
    const slug=`sample-${index}`;
    return [slug,{route:{kind:categorySlug==='marketing'?'marketing-contract':categorySlug==='account-apis'?'account-doc':'upstream-skill',record:entry},catalog:{skills:[{...entry,slug,categorySlug,endpoint:'/test'}],categories:[]}}];
  }));
  const result=project({generatedAt:snapshot.generatedAt,apiSlugs:Object.keys(models),apiDetailsBySlug:models});
  assert.deepEqual(result.entries.map(e=>e.slug),['sample-0','sample-1']);
  assert.throws(()=>validate({...snapshot,entries:[{...entry,categorySlug:'video-generation-models'}]}),/Non-data/);
});
test('validation rejects traversal, duplicate contracts and literal keys',()=>{
  for(const e of [{...entry,slug:'../escape'},{...entry,slug:'quickstart'},{...entry,path:'//other.example'},{...entry,path:"/test'bad"},{...entry,description:'nk-abcdefghijklmnopqrstuv'}]) assert.throws(()=>validate({...snapshot,entries:[e]}));
  assert.throws(()=>validate({...snapshot,entries:[entry,entry]}));
});
test('directory escapes content and links only to official testers',()=>{
  const pages=buildPages(snapshot);
  assert.deepEqual([...pages.keys()],['index.md']);
  const result=pages.get('index.md');
  assert.ok(result.includes('&lt;example&gt;'));
  assert.ok(result.includes(officialTestUrl('test-api')));
  assert.ok(!result.includes('href="/api/test-api/"'));
  assert.ok(!result.includes('/api/quickstart/'));
});
test('build clears all old output before regeneration and leaves sibling files alone',async()=>{
  const parent=await mkdtemp(join(tmpdir(),'nexscope-api-docs-'));
  const dir=join(parent,'generated');
  await writeFile(join(parent,'keep.txt'),'outside generated output');
  assert.equal(await build(snapshot,dir),1);
  const first=await readFile(join(dir,'index.md'),'utf8');
  await build(snapshot,dir);
  assert.equal(await readFile(join(dir,'index.md'),'utf8'),first);
  const index = await readFile(join(dir,'index.md'),'utf8');
  assert.ok(index.includes('https://learn.nexscope.ai/api/'));
  assert.ok(index.includes('http-equiv="refresh"'));
  await writeFile(join(dir,'orphan.md'),'stale page missing from old manifest');
  await mkdir(join(dir,'old-api'));
  await writeFile(join(dir,'old-api','index.html'),'stale rendered page');
  await build({...snapshot,entries:[{...entry,slug:'new-api'}]},dir);
  assert.ok(!(await readdir(dir)).includes('test-api.md'));
  assert.ok(!(await readdir(dir)).includes('orphan.md'));
  assert.ok(!(await readdir(dir)).includes('old-api'));
  assert.equal(await readFile(join(parent,'keep.txt'),'utf8'),'outside generated output');
  assert.deepEqual((await readdir(dir)).sort(),['.api-docs-generated','index.md']);
});
test('root export keeps only the square and removes all old detail pages',async()=>{
  const output=await mkdtemp(join(tmpdir(),'nexscope-root-api-'));
  await buildRoot(snapshot,output);
  await mkdir(join(output,'test-api'));
  await writeFile(join(output,'test-api/index.html'),'old detail page');
  await mkdir(join(output,'quickstart'));
  await writeFile(join(output,'quickstart/index.html'),'old quick start');
  assert.deepEqual(await buildRoot(snapshot,output),['/api/']);
  const page=await readFile(join(output,'index.html'),'utf8');
  assert.ok(page.includes('href="https://learn.nexscope.ai/api/"'));
  assert.ok(page.includes('href="/api/api-reference.css"'));
  assert.ok(page.includes(officialTestUrl('test-api')));
  assert.ok(page.includes('data-api-search'));
  assert.ok(!page.includes('/api/test-api/'));
  assert.deepEqual((await readdir(output)).sort(),['.api-docs-generated','api-directory.js','api-reference.css','index.html']);
});
test('invalid input never clears previously generated documentation',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'nexscope-api-docs-invalid-'));
  await build(snapshot,dir);
  const previous=await readFile(join(dir,'index.md'),'utf8');
  await assert.rejects(build({...snapshot,entries:[]},dir));
  assert.equal(await readFile(join(dir,'index.md'),'utf8'),previous);
});
test('directory combines word search with category selection and recovers from no matches',async()=>{
  const source=await readFile(new URL('../docs/assets/api-directory.js',import.meta.url),'utf8');
  const input={value:'',addEventListener(type,handler){this[type]=handler;}};
  const select={value:'',addEventListener(type,handler){this[type]=handler;}};
  const card1={dataset:{apiSearch:'amazon reviews list'},hidden:false};
  const card2={dataset:{apiSearch:'seo keyword research'},hidden:false};
  const groups=[{dataset:{apiGroup:'Amazon'},querySelectorAll:()=>[card1]}, {dataset:{apiGroup:'SEO'},querySelectorAll:()=>[card2]}];
  const filters={hidden:true},count={},empty={hidden:true};
  const document={querySelector:s=>({'[data-api-filters]':filters,'[data-api-count]':count,'[data-api-empty]':empty}[s]),getElementById:id=>id==='api-search'?input:select,querySelectorAll:()=>groups};
  runInNewContext(source,{document});
  assert.equal(filters.hidden,false);
  input.value='Amazon reviews'; input.input();
  assert.equal(card1.hidden,false); assert.equal(card2.hidden,true);
  select.value='SEO'; select.change();
  assert.equal(empty.hidden,false);
  input.value=''; input.input();
  assert.equal(card2.hidden,false); assert.equal(empty.hidden,true);
  select.value=''; select.change();
  assert.equal(card1.hidden,false); assert.equal(card2.hidden,false);
});
test('never overwrites an existing unmanaged directory',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'nexscope-api-docs-unmanaged-'));
  await writeFile(join(dir,'index.md'),'manual');
  await assert.rejects(build(snapshot,dir),/unmanaged/);
});
