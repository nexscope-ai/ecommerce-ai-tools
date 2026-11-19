---
layout: default
learning_topic: research
related_topics: [agents]
content_kind: guide
title: "Track Amazon Prices in Google Sheets with an API"
description: "Build a Google Sheets Amazon price tracker by ASIN and marketplace. Save dated price observations and schedule a daily Apps Script run."
permalink: /guides/amazon-price-tracker-google-sheets/
date_published: 2026-11-19
date_modified: 2026-11-19
last_modified_at: 2026-11-19
last_reviewed: 2026-11-19
author: Nexscope Team
schema_type: Article
og_type: article
topic: api
compact_evidence: true
evidence_scope: "Reviewed against published API contracts. Examples are templates for a first request."
suppress_article_help: true
next_step:
  id: amazon_price_tracker_google_sheets
  intent: api-evaluation
  title: "Try Amazon Product Detail"
  description: "Verify the example input and check current access and credits before running the request."
  label: Open the API tester
  url: "https://www.nexscope.ai/api-docs/amazon-product-detail?co-from=learn#online-test"
---

# How to track Amazon prices in Google Sheets with an API

Use a Google Sheet to record one Amazon price observation per ASIN each day. This is useful when you are watching competing offers during a promotion. Keep the ASIN, Amazon marketplace, currency and time with every row so you can compare like with like.

{% include api-guide-entry.html %}

## Set up the watchlist and observation tabs

Create a sheet named **Watchlist**. Enter `ASIN` in A1 and one child ASIN per row below it. To try the layout, start with `B072MQ5BRX`, the example ASIN in the [Amazon Product Detail reference](https://www.nexscope.ai/api-docs/amazon-product-detail). Use a separate watchlist per marketplace.

Create a second sheet named **Observations** and paste this header into A1.

```text
Observed at (UTC)	Marketplace	ASIN	Current price	Currency	Status
```

Open **Extensions → Apps Script → Project Settings → Script properties** and add `NEXSCOPE_API_KEY`. Keep the spreadsheet and script project restricted to people you trust with the key. An Apps Script project editor can read its script properties. [Google Apps Script properties](https://developers.google.com/apps-script/guides/properties)

## Fetch current prices with Apps Script

Paste the script below into the spreadsheet's bound Apps Script project. It reads at most ten unique ASINs per run and makes one Product Detail request for Amazon US. Change `marketplace` for a separate sheet used with another supported domain.

```javascript
function logAmazonPrices() {
  const key = PropertiesService.getScriptProperties().getProperty('NEXSCOPE_API_KEY');
  if (!key) throw new Error('Set the NEXSCOPE_API_KEY script property first.');

  const marketplace = 'amazon.com';
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const watchlist = spreadsheet.getSheetByName('Watchlist');
  const observations = spreadsheet.getSheetByName('Observations');
  if (!watchlist || !observations) throw new Error('Create the two sheet tabs first.');

  const rowCount = watchlist.getLastRow() - 1;
  if (rowCount < 1) return;
  const asins = [...new Set(watchlist.getRange(2, 1, rowCount, 1)
    .getDisplayValues().flat().map(value => value.trim().toUpperCase()).filter(Boolean))];
  if (!asins.length) return;
  if (asins.length > 10 || asins.some(asin => !/^[A-Z0-9]{10}$/.test(asin))) {
    throw new Error('Enter up to ten valid ASINs in the watchlist.');
  }

  const response = UrlFetchApp.fetch('https://api.nexscope.ai/amazon/product/detail', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify({ asins: asins.join(','), amazonDomain: marketplace }),
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() !== 200) {
    throw new Error('Price lookup returned HTTP ' + response.getResponseCode());
  }
  const payload = JSON.parse(response.getContentText());
  if (payload.code !== 0 || !Array.isArray(payload.data?.products)) {
    throw new Error('Price lookup did not return a usable product list.');
  }

  const byAsin = new Map(payload.data.products.map(product => [product.asin, product]));
  const timestamp = new Date().toISOString();
  const rows = asins.map(asin => {
    const product = byAsin.get(asin);
    const price = product?.extractedPrice ?? product?.price;
    const hasPrice = typeof price === 'number' && Number.isFinite(price) && price > 0;
    return [timestamp, marketplace, asin, hasPrice ? price : '',
      product?.currency ?? '', hasPrice ? 'Observed' : 'Unavailable'];
  });
  observations.getRange(observations.getLastRow() + 1, 1, rows.length, rows[0].length)
    .setValues(rows);
}
```

Run `logAmazonPrices` once and review the permissions and result. If the returned marketplace, prices and currency look right, add a daily time-driven trigger. A repeated manual run will append another observation, so use the timestamp to distinguish runs. Check current API access and credit cost before scheduling. [Google installable triggers](https://developers.google.com/apps-script/guides/triggers/installable)

## Compare observations with historical prices

The sheet records what the current-price endpoint returned when the script ran. Keep blank values when a price is unavailable and start a new series if the currency, marketplace or child ASIN changes. Record coupons and shipping separately if they affect your comparison.

For dates before you started collecting, use [Amazon Product Price Series](https://www.nexscope.ai/api-docs/amazon-product-price-series). Keep those historical series separate from your sheet's own observations unless the price type is comparable. See the [Amazon price history guide]({{ '/amazon-price-history/' | relative_url }}) for interpreting records around Black Friday, and the [ASIN lookup guide]({{ '/guides/amazon-asin-lookup-api/' | relative_url }}) for checking product identity.
