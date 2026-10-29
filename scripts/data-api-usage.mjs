/** Public aggregate metrics only. Never export user/key identifiers or raw logs. */
import { readFile } from 'node:fs/promises';

const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const count = value => value === null || value === undefined || (Number.isSafeInteger(value) && value >= 0);
export function validateUsage(data) {
  if (data?.schemaVersion !== 1 || data.period !== 'all-time') throw new Error('Unsupported API usage statistics contract');
  if (Object.keys(data).some(key=>!['schemaVersion','period','updatedAt','apis','categories'].includes(key))) throw new Error('Only public aggregate statistics fields are allowed');
  for (const group of ['apis','categories']) {
    if (!data[group] || typeof data[group] !== 'object' || Array.isArray(data[group])) throw new Error(`Invalid usage ${group}`);
    for (const [key,metrics] of Object.entries(data[group])) {
      if (!slug.test(key) || !metrics || typeof metrics !== 'object' || Array.isArray(metrics)) throw new Error(`Invalid usage record: ${key}`);
      const allowed = group === 'apis' ? ['callCount','userCount'] : ['userCount'];
      if (Object.keys(metrics).some(field=>!allowed.includes(field))) throw new Error(`Only public aggregate counts are allowed: ${key}`);
      if (!count(metrics.callCount) || !count(metrics.userCount)) throw new Error(`Invalid usage counts: ${key}`);
      if (metrics.callCount != null && metrics.userCount != null && metrics.userCount > metrics.callCount) throw new Error(`User count exceeds calls: ${key}`);
    }
  }
  if ((Object.keys(data.apis).length || Object.keys(data.categories).length) && (typeof data.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(data.updatedAt) || Number.isNaN(Date.parse(data.updatedAt)))) throw new Error('Usage statistics need an ISO publication timestamp');
  return data;
}
export async function loadUsage(file) {
  return validateUsage(JSON.parse(await readFile(file,'utf8')));
}
export function applyUsage(snapshot, usage) {
  validateUsage(usage);
  const entries = snapshot.entries.map(entry=>({...entry,usage:usage.apis[entry.slug] || {}}));
  const categoryUsage = {};
  for (const [category,items] of Map.groupBy(entries,e=>e.categorySlug)) {
    const complete = items.every(e=>e.usage.callCount != null);
    const callCount = complete ? items.reduce((total,e)=>total+e.usage.callCount,0) : null;
    if (!count(callCount)) throw new Error(`Category call count exceeds supported range: ${category}`);
    // Distinct category users are NOT the sum of per-API distinct users.
    const userCount = usage.categories[category]?.userCount ?? null;
    const knownUsers = items.map(e=>e.usage.userCount).filter(value=>value != null);
    if (userCount != null && knownUsers.length && (userCount < Math.max(...knownUsers) || (knownUsers.length===items.length && userCount > knownUsers.reduce((a,b)=>a+b,0)))) throw new Error(`Inconsistent distinct category users: ${category}`);
    categoryUsage[category] = {callCount,userCount};
  }
  return {...snapshot,entries,categoryUsage,usageUpdatedAt:usage.updatedAt};
}
export function compareUsage(a,b) {
  const left = a?.callCount, right = b?.callCount;
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return right - left;
}
