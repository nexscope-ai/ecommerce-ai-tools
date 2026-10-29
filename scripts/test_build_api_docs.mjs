import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, readdir, mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {project, validate, build, buildRoot, buildPages, officialApiUrl} from './build_api_docs.mjs';
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
test('category square links to category pages and category cards link to official API details',()=>{
  const pages=buildPages(snapshot);
  assert.deepEqual([...pages.keys()],['index.md','data-amazon-front-data.md']);
  const index=pages.get('index.md');
  const category=pages.get('data-amazon-front-data.md');
  assert.ok(index.includes('href="/data/amazon-front-data/"'));
  assert.ok(!index.includes('href="https://www.nexscope.ai/api-docs/'));
  assert.ok(category.includes('&lt;example&gt;'));
  assert.ok(category.includes(officialApiUrl('test-api')));
  assert.ok(category.includes('data-track="start_using"'));
  assert.ok(category.includes('src="/data/logos/amazon.webp"'));
  assert.ok(!category.includes('api-icon--word'));
  assert.ok(!category.includes('#online-test'));
  assert.ok(!category.includes('href="/data/test-api/"'));
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
  assert.ok(index.includes('https://learn.nexscope.ai/data/'));
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
test('root export generates category pages, no local API details, and removes stale output',async()=>{
  const output=await mkdtemp(join(tmpdir(),'nexscope-root-data-'));
  await buildRoot(snapshot,output);
  await mkdir(join(output,'test-api'));
  await writeFile(join(output,'test-api/index.html'),'old detail page');
  assert.deepEqual(await buildRoot(snapshot,output),['/data/','/data/amazon-front-data/']);
  const page=await readFile(join(output,'amazon-front-data/index.html'),'utf8');
  assert.ok(page.includes('href="https://learn.nexscope.ai/data/amazon-front-data/"'));
  assert.ok(page.includes('href="/data/api-reference.css"'));
  assert.ok(page.includes(officialApiUrl('test-api')));
  assert.ok(page.includes('src="/data/api-directory.js"'));
  assert.ok((await readFile(join(output,'logos','amazon.webp'))).length > 0);
  assert.ok(!page.includes('href="/data/test-api/"'));
  assert.ok(!(await readdir(output)).includes('test-api'));
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
  const document={addEventListener(){},querySelector:s=>({'[data-api-filters]':filters,'[data-api-count]':count,'[data-api-empty]':empty}[s]),getElementById:id=>id==='api-search'?input:select,querySelectorAll:()=>groups};
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

test('category and API clicks retain source context without resetting acquisition',async()=>{
  const source=await readFile(new URL('../docs/assets/api-directory.js',import.meta.url),'utf8');
  let click;
  const calls=[];
  const document={addEventListener(type,handler){click=handler;},querySelector:()=>null};
  const window={location:{pathname:'/data/amazon-front-data/',href:'https://learn.nexscope.ai/data/amazon-front-data/'},nexscopeTrafficAttribution:{trafficSource:'google',trafficMedium:'organic',trafficLandingPath:'/data/'},gtag:(...args)=>calls.push(args)};
  runInNewContext(source,{document,window,URL});
  const attrs={'data-api-slug':'test-api','data-data-category':'data-amazon-front-data'};
  const link={href:officialApiUrl('test-api'),getAttribute:name=>attrs[name]};
  click({target:{closest:()=>link}});
  assert.equal(calls[0][1],'data_api_open');
  assert.equal(calls[0][2].co_from,'learn');
  assert.equal(calls[0][2].source_page,'/data/amazon-front-data/');
  assert.equal(calls[0][2].traffic_source,'google');
  delete attrs['data-api-slug'];link.href='/data/amazon-front-data/';
  click({target:{closest:()=>link}});
  assert.equal(calls[1][1],'data_api_category_click');
});
