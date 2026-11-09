/** Fetch only public documentation feeds; no keys, accounts or web project builds. */
import {readFile, writeFile, rename} from 'node:fs/promises';
import {join, resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {projectDirectoryMembership, dataCollectionSlugs} from './data-directory-membership.mjs';
import {supplementAnnouncedData} from './announced-data-apis.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const FEED='https://www.nexscope.ai/api/skill-api/catalog';
export const SITEMAP='https://www.nexscope.ai/sitemap.xml';
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const clean=value=>String(value??'').replace(/[^.!?\n]*\bMCP\b[^.!?\n]*[.!?]?/gi,'').trim();

export function projectFeed(payload, sitemap, previous, now=new Date().toISOString(), membership) {
  if (payload?.code != null && payload.code !== 0) throw new Error('Public API feed rejected the request');
  const data=payload.data??payload;
  if (data.source !== 'server') throw new Error('Official catalog is not backed by current server data');
  if (!Array.isArray(data.skills)||!data.skills.length||!Array.isArray(data.categories)) throw new Error('Empty or malformed public API feed');
  const eligible=dataCollectionSlugs(membership);
  const published=new Set([...sitemap.matchAll(/<loc>https:\/\/www\.nexscope\.ai\/api-docs\/([a-z0-9-]+)\/?<\/loc>/g)].map(match=>match[1]));
  if (!published.size) throw new Error('Official sitemap has no published API detail pages');
  const withdrawn=new Set(data.withdrawnSlugs??[]);
  const categories=new Map([...(membership.categories??[]),...data.categories].map(item=>[item.slug,item]));
  const old=new Map((previous?.entries??[]).map(item=>[item.slug,item]));
  const entries=new Map();
  const sourceSlugs=new Set();
  const liveSlugs=new Set(data.skills.map(item=>item.slug));
  const skills=[...data.skills,...(membership.skills??[]).filter(item=>eligible.has(item.slug)&&!liveSlugs.has(item.slug))];
  for (const skill of skills) {
    if (sourceSlugs.has(skill.slug)) throw new Error(`Duplicate API source slug: ${skill.slug}`);
    sourceSlugs.add(skill.slug);
    if (!eligible.has(skill.slug)||skill.apiReady===false) continue;
    const slug=skill.slug;
    if (!slugPattern.test(slug)||withdrawn.has(skill.slug)||withdrawn.has(slug)||!published.has(slug)) continue;
    const prior=old.get(slug);
    const category=categories.get(skill.categorySlug)||(prior?{name:prior.group,description:prior.categoryDescription}:null);
    if (!category) throw new Error(`Missing public API category: ${skill.categorySlug}`);
    if (typeof skill.endpoint !== 'string'||!skill.endpoint.trim()) throw new Error(`Missing public API contract: ${slug}`);
    const endpoint=new URL(skill.endpoint,'https://api.nexscope.ai');
    if (endpoint.origin !== 'https://api.nexscope.ai'||endpoint.username||endpoint.password||endpoint.search||endpoint.hash) throw new Error(`Invalid official API endpoint: ${slug}`);
    // Official copy can change without a new slug. Prefer the current publication;
    // cached copy is only a fallback when the source omits usable text.
    const entry={slug,collection:'ecommerce',name:clean(skill.name)||prior?.name,description:clean(skill.description)||clean(skill.summary)||prior?.description||clean(skill.name),
      group:clean(category.name),categoryDescription:clean(category.description),categorySlug:skill.categorySlug,method:'POST',path:endpoint.pathname};
    if (!entry.name||!entry.description) throw new Error(`Empty public API copy: ${slug}`);
    entries.set(slug,entry);
  }
  if (!entries.size) throw new Error('No published Data APIs remain after validation');
  const result={schemaVersion:1,scope:'data',generatedAt:now,entries:[...entries.values()].sort((a,b)=>a.slug.localeCompare(b.slug))};
  if (JSON.stringify(result.entries)===JSON.stringify(previous?.entries)) result.generatedAt=previous.generatedAt;
  return result;
}

async function publicText(url) {
  for (let attempt=0;attempt<2;attempt++) {
    try {
      const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(25000),headers:{Accept:'application/json, application/xml, text/xml','Cache-Control':'no-cache'}});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text=await response.text();
      if (text.length>20000000) throw new Error('Response exceeds public feed size limit');
      return text;
    } catch(error) { if (attempt===1) throw new Error(`Public API refresh failed for ${new URL(url).pathname}: ${error.name}`); }
  }
}

export async function refreshSnapshot(directory=root) {
  const file=join(directory,'scripts/data/api-docs.public.json');
  const [feed,sitemap,previous]=await Promise.all([publicText(FEED),publicText(SITEMAP),readFile(file,'utf8').then(JSON.parse)]);
  const payload=JSON.parse(feed);
  const membership=projectDirectoryMembership(payload);
  const current=projectFeed(payload,sitemap,previous,new Date().toISOString(),membership);
  const snapshot=supplementAnnouncedData(current,(payload.data??payload).withdrawnSlugs??[]);
  if (JSON.stringify(snapshot.entries)===JSON.stringify(previous.entries)) snapshot.generatedAt=previous.generatedAt;
  // Validate the safe public projection before changing the snapshot or generated output.
  const {validate}=await import('./build_api_docs.mjs');
  validate(snapshot);
  const temporary=file+'.tmp';
  await writeFile(temporary,JSON.stringify(snapshot,null,2)+'\n');
  await rename(temporary,file);
  console.log(`Refreshed ${current.entries.length} official Data APIs and ${snapshot.entries.length-current.entries.length} release-announcement references.`);
  return snapshot;
}

if (process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) refreshSnapshot().catch(error=>{console.error(error.message);process.exitCode=1;});
