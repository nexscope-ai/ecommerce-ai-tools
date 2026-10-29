import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, writeFile, readdir, mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {project, validate, build, buildRoot, buildPages, officialApiUrl} from './build_api_docs.mjs';
import {runInNewContext} from 'node:vm';
import {applyUsage, validateUsage} from './data-api-usage.mjs';

const entry={slug:'test-api',name:'Test API',description:'Public <example>',group:'Data',categorySlug:'data-amazon-front-data',method:'POST',path:'/test',requestSchema:{type:'object',properties:{query:{type:'string',description:'Query'}},required:['query']},requestExample:{query:'example'}};
const snapshot={schemaVersion:1,scope:'data',generatedAt:'2026-10-29T00:00:00Z',entries:[entry]};

test('aggregate counts sort categories and API cards without summing distinct users',()=>{
  const entries=[entry,{...entry,slug:'popular-api',name:'Popular API'},
    {...entry,slug:'other-api',name:'Other API',categorySlug:'data-1688-sourcing'}];
  const usage={schemaVersion:1,period:'all-time',updatedAt:'2026-10-29T08:34:41.999Z',
    apis:{'test-api':{callCount:10,userCount:3},'popular-api':{callCount:50,userCount:8},'other-api':{callCount:40,userCount:6}},categories:{}};
  const result=applyUsage({...snapshot,entries},usage);
  assert.deepEqual(result.categoryUsage['data-amazon-front-data'],{callCount:60,userCount:null});
  const pages=buildPages(result);
  const root=pages.get('index.md');
  assert.ok(root.indexOf('href="/data/amazon-front-data/"')<root.indexOf('href="/data/1688-sourcing/"'));
  const all=root.slice(root.indexOf('<section data-results-kind="apis"'));
  assert.ok(all.indexOf('Popular API')<all.indexOf('Other API'));
  assert.ok(all.indexOf('Other API')<all.indexOf('Test API'));
  assert.match(root,/aria-label="60 recorded calls"/);
  assert.match(root,/<div class="api-card-actions"><div class="api-usage"/);
  assert.match(root,/aria-label="8 distinct API users"/);
  assert.doesNotMatch(root,/Explore category|View official API docs|<\/strong> calls|<\/strong> users/);
  assert.match(root,/Includes test accounts and all request statuses/);
  assert.doesNotMatch(root,/api-io|api-preview|Preview input/);
});

test('usage icons cap display values while retaining exact counts and sorting',()=>{
  const entries=[entry,{...entry,slug:'larger-api',name:'Larger API'}];
  const usage={schemaVersion:1,period:'all-time',updatedAt:'2026-10-29T08:34:41Z',
    apis:{'test-api':{callCount:10000,userCount:100},'larger-api':{callCount:10001,userCount:101}},categories:{}};
  const category=buildPages(applyUsage({...snapshot,entries},usage)).get(entry.categorySlug+'.md');
  assert.match(category,/title="10,001 recorded calls"[^>]*>[\s\S]*?<strong>9999\+<\/strong>/);
  assert.match(category,/title="101 distinct API users"[^>]*>[\s\S]*?<strong>99\+<\/strong>/);
  assert.match(category,/title="10,000 recorded calls"[^>]*>[\s\S]*?<strong>10,000<\/strong>/);
  assert.match(category,/title="100 distinct API users"[^>]*>[\s\S]*?<strong>100<\/strong>/);
  assert.ok(category.indexOf('Larger API')<category.indexOf('Test API'));
});

test('unknown counts remain unknown, and public metrics reject private identifiers',()=>{
  const usage={schemaVersion:1,period:'all-time',updatedAt:'2026-10-29T08:34:41Z',apis:{},categories:{}};
  assert.equal(applyUsage(snapshot,usage).categoryUsage[entry.categorySlug].callCount,null);
  assert.throws(()=>validateUsage({...usage,apis:{'test-api':{callCount:1,userId:'private'}}}),/aggregate/);
  assert.throws(()=>validateUsage({...usage,apis:{'test-api':{callCount:1,userCount:2}}}),/exceeds/);
});

test('published statistics match the approved retained-record snapshot',async()=>{
  const usage=JSON.parse(await readFile(new URL('./data/api-usage.public.json',import.meta.url),'utf8'));
  validateUsage(usage);
  assert.equal(Object.keys(usage.apis).length,233);
  assert.deepEqual(usage.apis['1688-product-detail'],{callCount:14559,userCount:93});
  assert.equal(Object.values(usage.apis).reduce((sum,item)=>sum+item.callCount,0),89220);
});
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
  assert.ok(index.includes('data-results-kind="apis"'));
  assert.ok(index.includes('data-platform-filter="amazon"'));
  assert.ok(index.includes(officialApiUrl('test-api')));
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
test('platform filters and global search switch between categories and direct API results',async()=>{
  const source=await readFile(new URL('../docs/assets/api-directory.js',import.meta.url),'utf8');
  const control=(attrs={})=>({hidden:true,value:'',attrs,events:{},dataset:{},focus(){},addEventListener(t,h){this.events[t]=h;},setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k];}});
  const search=control(),count=control(),empty=control(),clear=control(),reset=control(),filters=control();
  const platforms=['','amazon','tiktok'].map(value=>control({'data-platform-filter':value}));
  const views=['categories','apis'].map(value=>control({'data-directory-view':value}));
  for (const button of views) {
    button.badge = {textContent:''};
    button.querySelector = selector => selector === 'span' ? button.badge : null;
  }
  const card=(platform,text)=>({dataset:{platform,apiSearch:text},hidden:false});
  const categories=[card('amazon','amazon data'),card('tiktok','tiktok data')];
  const apis=[card('amazon','amazon reviews list'),card('amazon','amazon product detail'),card('tiktok','tiktok creators')];
  const sections=[{dataset:{resultsKind:'categories'},querySelectorAll:()=>categories},{dataset:{resultsKind:'apis'},querySelectorAll:()=>apis}];
  const directory={dataset:{directoryKind:'root'},querySelector:s=>({'[data-api-count]':count,'[data-api-empty]':empty,'[data-clear-search]':clear,'[data-reset-filters]':reset}[s]),querySelectorAll:s=>s==='[data-platform-filter]'?platforms:s==='[data-directory-view]'?views:s==='[data-results-kind]'?sections:[filters]};
  const document={addEventListener(){},querySelector:()=>directory,getElementById:()=>search};
  const window={location:{pathname:'/data/'},gtag(){}};
  runInNewContext(source,{document,window,URL});
  assert.equal(filters.hidden,false);assert.equal(sections[0].hidden,false);assert.equal(sections[1].hidden,true);
  assert.deepEqual(views.map(button=>button.badge.textContent),['2','3']);
  platforms[1].events.click();
  assert.equal(categories[0].hidden,false);assert.equal(categories[1].hidden,true);
  assert.equal(platforms[1].attrs['aria-pressed'],'true');
  assert.deepEqual(views.map(button=>button.badge.textContent),['1','2']);
  search.value='reviews';search.events.input();
  assert.equal(sections[0].hidden,true);assert.equal(sections[1].hidden,false);
  assert.equal(apis[0].hidden,false);assert.equal(apis[1].hidden,true);assert.equal(apis[2].hidden,true);
  assert.equal(count.textContent,'1 API matching your selection');
  assert.deepEqual(views.map(button=>button.badge.textContent),['0','1']);
  search.value='creators';search.events.input();assert.equal(empty.hidden,false);
  assert.deepEqual(views.map(button=>button.badge.textContent),['0','0']);
  platforms[2].events.click();assert.equal(empty.hidden,true);assert.equal(apis[2].hidden,false);
  clear.events.click();assert.equal(search.value,'');assert.equal(sections[0].hidden,false);
  reset.events.click();assert.equal(platforms[0].attrs['aria-pressed'],'true');
  assert.ok(categories.every(c=>!c.hidden));
  assert.deepEqual(views.map(button=>button.badge.textContent),['2','3']);
  views[1].events.click();assert.equal(sections[1].hidden,false);assert.ok(apis.every(c=>!c.hidden));
  views[0].events.click();assert.equal(sections[0].hidden,false);
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
  const document={addEventListener(type,handler){if(type==='click') click=handler;},querySelector:()=>null};
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

test('preview projection exposes only bounded published input examples and declared output fields',()=>{
  const record={...entry,requestExample:{query:'example',apiKey:'sensitive-value'},responseSchema:{fields:[{name:'code',description:'Status'},{name:'rating',description:'Product rating'}]}};
  const model={route:{kind:'upstream-skill',record},catalog:{skills:[{...record,endpoint:'/public/test'}],categories:[]}};
  const result=project({generatedAt:snapshot.generatedAt,apiSlugs:[entry.slug],apiDetailsBySlug:{[entry.slug]:model}});
  const preview=result.entries[0].preview;
  assert.equal(preview.inputs[0].name,'query');assert.equal(preview.inputs[0].required,true);
  assert.equal(preview.outputs[0].name,'rating');
  assert.equal(preview.requestExample.apiKey,'[YOUR_CREDENTIAL]');
  assert.ok(!JSON.stringify(result).includes('sensitive-value'));
  const category=buildPages(result).get('data-amazon-front-data.md');
  assert.ok(!category.includes('api-io'));
  assert.ok(!category.includes('data-api-preview'));
  assert.ok(category.includes('class="api-main-link"'));
  assert.ok(category.includes('co-from=learn'));
  assert.ok(category.includes('class="api-card-actions"'));
  assert.ok(!category.includes('<details><a'));
});
