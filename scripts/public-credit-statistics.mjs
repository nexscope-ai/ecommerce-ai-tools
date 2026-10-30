export const CREDIT_STATISTICS_URL = 'https://api.nexscope.ai/api/skill-api/v1/credit-statistics';

function credit(value) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value)) return null;
  const number = Number(value);
  return number > 0 && Number.isSafeInteger(Math.round(number * 100)) ? number : null;
}

export function projectCreditStatistics(payload, checkedAt = new Date().toISOString()) {
  if (payload?.code !== 0 || payload?.data?.available !== true || !payload.data.statistics || typeof payload.data.statistics !== 'object' || Array.isArray(payload.data.statistics)) throw new Error('Public credit statistics unavailable');
  const statistics = {};
  for (const [slug, row] of Object.entries(payload.data.statistics)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !row || typeof row !== 'object') continue;
    const minimum = credit(row.minimum), average = credit(row.average), maximum = credit(row.maximum);
    if (minimum === null || average === null || maximum === null || minimum > average || average > maximum) continue;
    statistics[slug] = { minimum, average, maximum };
  }
  return { available: true, checkedAt, statistics };
}

export async function fetchPublicCreditStatistics(fetcher = fetch) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetcher(CREDIT_STATISTICS_URL, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Credit statistics HTTP error');
      return projectCreditStatistics(await response.json());
    } catch {
      if (attempt === 1) return { available: false, checkedAt: new Date().toISOString(), statistics: {} };
    }
  }
}

export function withPublicCreditStatistics(usage, credits) {
  const apis = {};
  // Retain approved counts, but never silently fall back to the old CSV credit ranges.
  for (const [slug, metrics] of Object.entries(usage.apis)) {
    const { creditMin: _oldMin, creditMax: _oldMax, ...counts } = metrics;
    apis[slug] = counts;
  }
  if (credits.available) for (const [slug, row] of Object.entries(credits.statistics)) {
    apis[slug] = { ...apis[slug], creditMin: row.minimum, creditMax: row.maximum };
  }
  return { ...usage, apis, creditBasis: 'public-historical-statistics', creditUpdatedAt: credits.checkedAt };
}
