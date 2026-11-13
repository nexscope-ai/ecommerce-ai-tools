// Editorial starting points; only currently published operations are rendered.
export const dataStarts = {
  'data-amazon-front-data': {
    title: 'Check one Amazon product before building a comparison',
    bring: 'An ASIN and the marketplace you want to research.',
    result: 'Product facts, pricing and ratings to review before selecting a larger shortlist.',
    steps: [
      ['amazon-product-detail', 'Inspect a known product', 'Start here when you already have an ASIN.'],
      ['amazon-search', 'Find products first', 'Use keyword search if you do not have a product to inspect.'],
      ['amazon-reviews-list', 'Read customer feedback', 'Review customer comments after choosing the product.'],
    ],
  },
  'data-amazon-ads': {
    title: 'Start with a read-only Amazon Ads reporting task',
    bring: 'An authorized advertiser account, report dates and the metrics you need.',
    result: 'A report job and status information for your connected advertising account.',
    steps: [
      ['amazon-ads-api-access', 'Check account access', 'Confirm the account connection before requesting reports.'],
      ['data-amazon-ads-developer-proxy-reporting-reports', 'Request a report', 'Choose the report configuration documented for your account.'],
      ['data-amazon-ads-developer-proxy-reporting-reports-report-id', 'Check the report status', 'Use the returned report ID; submission does not mean the report is ready.'],
    ],
  },
  'data-zy-patent': {
    title: 'Find a relevant patent and check its record',
    bring: 'Keywords for your product idea, or a patent publication number if you already know it.',
    result: 'Candidate patent records, bibliographic details and reported legal status.',
    steps: [
      ['patent-search', 'Search for matching patent records', 'Start with the product and its most distinctive feature.'],
      ['patent-core-bibliography', 'Review a specific patent', 'Check publication details before comparing related results.'],
      ['patent-legal-status-data', 'Check the reported legal status', 'Confirm consequential findings with the relevant patent office.'],
    ],
  },
  'data-1688-sourcing': {
    title: 'Find supplier candidates from one product image',
    bring: 'A publicly accessible product image URL, or a sourcing keyword.',
    result: 'Candidate offers, followed by product, price, MOQ and supplier details where returned.',
    steps: [
      ['1688-search-by-image', 'Search from a product image', 'Find visually similar offers to investigate.'],
      ['1688-product-search', 'Search with a keyword', 'Choose keyword search when you do not have an image.'],
      ['1688-product-detail', 'Inspect a shortlisted offer', 'Check the selected offer before contacting a supplier.'],
    ],
  },
};
