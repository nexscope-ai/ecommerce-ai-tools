// Editorial copy is keyed by stable public identifiers, independently of feed refreshes.
// This layer describes selection intent; it never changes an API contract or route.
export const copyReviewedAt = '2026-11-02T00:00:00Z';
const category = (name, description, chooseWhen) => ({name, description, chooseWhen});
export const categoryCopyMap = {
  'woocommerce': category('WooCommerce Products, Variations & Store Research', 'Research products, variations, reviews, taxonomies and collection statistics within one specified public WooCommerce store.', 'Start with a public store URL, then inspect products and their variations. Store version and configuration affect available data; this is not a global store search or access to private orders.'),
  'jev': category('API Discovery & Content Evaluation', 'Discover a matching published API or evaluate supplied content with Nexscope JEV.', 'Use routing to inspect a suggested API, or evaluate content you are authorized to submit. Routing does not execute the suggested API; review results and current access requirements.'),
  'ai-content-generation': category('Product Description Generation', 'Generate product-description copy from supplied product information.', 'Provide accurate product facts and review the generated wording before publication. Generation does not verify product claims.'),
  'data-1688-sourcing': category('1688 Product & Supplier Research', 'Find wholesale offers by keyword or image, then inspect product, SKU and supplier details.', 'You need to shortlist wholesale offers. Use search to discover products and detail lookup to check a specific offer before comparing suppliers.'),
  'data-shopee-product-selection': category('Shopee Product Search & Details', 'Search Shopee listings and inspect individual products for marketplace research.', 'You want to move from a product keyword to listing details. Keep the marketplace consistent when comparing products.'),
  'data-fm-tiktok': category('TikTok Product Discovery & Bestsellers', 'Explore product discovery and top-selling product operations to build a research shortlist.', 'You are looking for product candidates rather than detailed creator, video or shop analytics.'),
  'data-sr-ozon': category('Ozon Keywords, Markets & Shops', 'Research Ozon keywords, product reports, categories and shops from a market-research starting point.', 'Your question starts with market demand, keywords or competitors. Use the report and search operations that match that question.'),
  'data-cj-tiktok': category('TikTok Products, Creators & Ad Research', 'Connect TikTok product research with related creators, videos, shops, livestreams and ads.', 'You need to research relationships around a product or creator. Choose a search operation first, then inspect the matching entity or related content.'),
  'data-et-tiktok': category('TikTok Product, Seller & Video Lookup', 'Find TikTok products, sellers and videos, with batch-detail and ranking operations for follow-up research.', 'You need product or seller discovery, video lookup, or batch details. Check the identifiers required by each follow-up operation.'),
  'data-kd-tiktok': category('TikTok Shop, Creator & Video Analytics', 'Inspect product, shop, creator, video and livestream analytics, including available ranking operations.', 'You already know the entity you want to analyse, or need a ranking list. Metric definitions and time ranges depend on the selected operation.'),
  'data-amazon-front-data': category('Amazon Product Search, Details & Reviews', 'Search Amazon listings, inspect product details and retrieve reviews for a product-research workflow.', 'You need listing-level information or review content. Start with search for discovery, then use the identifiers required by detail or review lookup.'),
  'data-gb-temu': category('Temu Product, Keyword & Shop Research', 'Explore Temu products by keyword or image, then research categories, shops and product details.', 'You need product discovery plus keyword or shop research. Check the available sites before comparing results across markets.'),
  'data-mp-ozon': category('Ozon Product, Brand & Seller Research', 'Find Ozon products and explore product trends, brand catalogs, categories and seller listings.', 'You want to build a product shortlist or inspect a brand or seller catalog, rather than begin with keyword mining.'),
  'data-ss': category('Amazon Competitors, Markets & Traffic Keywords', 'Research Amazon competitors, market statistics and traffic keywords alongside product discovery.', 'You need market context or competitor keywords to assess a shortlist. Check the selected metric and marketplace before comparing products.'),
  'data-kp': category('Amazon Price & Product History', 'Explore product history, price series and database search for Amazon product research.', 'You need a historical view rather than only a current listing. Check the available history, time range and price fields in the chosen operation.'),
  'data-js': category('Amazon Keywords & Sales Estimates', 'Research keyword expansion, search history, share of voice and product sales estimates.', 'You need keyword context or an estimated sales signal. Treat estimates as research inputs and check the reported period before comparing them.'),
  'data-sf-search-intelligence': category('Amazon ASIN Keywords & Traffic Research', 'Look up ASIN keywords, keyword summaries and ASIN traffic summaries for competitor research.', 'You have an ASIN or keyword and want to understand its search context. Inspect which traffic and keyword fields the chosen operation returns.'),
  'data-jm': category('Amazon Niche Discovery & Review Research', 'Explore product niches by keyword or ASIN, with related products and niche-review research.', 'You are comparing a niche rather than a single listing. Use keyword or ASIN lookup according to the starting information you have.'),
  'data-etsy-data': category('Etsy Products, Stores & Categories', 'Find Etsy products and stores, inspect product details and explore categories.', 'You need to discover listings or compare a store catalog. Use product detail lookup for a specific item after discovery.'),
  'data-temu-data': category('Temu Product & Store Catalog Research', 'Query Temu products, stores and categories to organize a marketplace research shortlist.', 'You need product or store lookup. For image search and keyword research, compare the separate Temu product, keyword and shop category.'),
  'data-st': category('Amazon Product Discovery & Market Details', 'Search market products and inspect individual product details for an Amazon research shortlist.', 'You want to pair market product search with detail lookup. Compare the returned fields with the separate listing, keyword and history categories.'),
  'data-st-walmart': category('Walmart Keywords & Category Research', 'Research Walmart keywords, category markets and product-analysis data.', 'You need keyword or category context around a product. For listing search and detail lookup, use the separate Walmart product category.'),
  'data-walmart-product-selection': category('Walmart Product Search & Details', 'Search Walmart products and inspect a specific listing before building a comparison.', 'You need to discover products or retrieve listing details. Check location and marketplace inputs in the official documentation.'),
  'data-shopify-data': category('Shopify Store & Product Lookup', 'Look up Shopify stores and products to support catalog and competitor research.', 'You need store or product information for research. Check the documented coverage; these operations are not a replacement for managing your own store.'),
  'data-google-tools': category('Google Trends, AI Search & Patents', 'Compare search-interest trends, retrieve AI Mode search results or research patent records.', 'Choose trends for relative interest over time, AI Mode search for search results, or patent search for intellectual-property research. These outputs answer different questions.'),
  'data-amazon-business-insight': category('Amazon Opportunities, Keywords & Policy Updates', 'Research opportunities by keyword or metrics and inspect Amazon policy updates.', 'You need opportunity research or policy context. Select the relevant operation; a policy feed and an opportunity report are different outputs.'),
  'data-mercado-selection': category('Mercado Libre Product Selection', 'Explore the available product-selection operation for Mercado Libre research.', 'You want a product-selection starting point. Check its marketplace, required inputs and response fields before planning a larger workflow.'),
  'product-market-research': category('Mercado Libre Market Research', 'Inspect the available Mercado Libre market-research operation for product planning.', 'You need market-research data. Verify the documented scope before treating the results as a full marketplace overview.'),
  'amazon-marketplace-intelligence': category('Amazon Image Search & Category Lookup', 'Find products from an image or look up Amazon category information.', 'Your research starts with a product image or category question, rather than a keyword or an existing product listing.'),
  'amazon-advertising': category('Amazon Ads Reports & Insights', 'Explore advertising reports, audience data and search impression-share report operations.', 'You need advertising reports or their status and download operations. Check account access and whether report creation is asynchronous.'),
  'data-amazon-ads': category('Amazon Ads Accounts & Campaign Operations', 'Explore account access, report creation and campaign operations for Sponsored Products, Brands and Display.', 'You need an advertising account or campaign workflow. Distinguish reading data from changing campaigns, and confirm authorization before any write operation.'),
  'data-ebay-product-selection': category('eBay Product Search', 'Find eBay products with the available search operation for a focused research task.', 'You want to discover listings from a search query. Check supported filters and result fields before building your comparison.'),
  'data-web-search': category('Web Search for Ecommerce Research', 'Retrieve web-search results as starting sources for market and product research.', 'You need sources beyond a marketplace catalog. Review the returned pages and verify claims against their original sources.'),
  'data-zy-patent': category('Patent Search, Claims & Legal Records', 'Research patent records, claims, families, citations, legal status and document translations.', 'You need patent-document research. Select the record or document section you need; results do not establish freedom to operate.'),
  'patent-ip-risk': category('Design & Patent Image Similarity', 'Explore image-based design similarity and patent-image research operations.', 'You have a reference image to investigate. Similarity results are research leads and require specialist review before a legal conclusion.'),
  'data-rg-ip-detection': category('Trademark, Copyright & Patent Screening', 'Explore text and image screening operations for trademarks, copyright, patents and product-risk research.', 'You need an initial risk screen. Match the operation to the rights or product issue and obtain qualified review before making a legal decision.'),
  'data-md-product-tro-detection': category('Product TRO Risk Screening', 'Inspect the product TRO detection operation as an initial product-risk research step.', 'You need to investigate potential TRO-related risk. Automated results are not legal advice or a guarantee that a product is safe to sell.'),
  'data-tiktok-shop-product-detail': category('TikTok Shop Product Details', 'Look up a specific TikTok Shop product using the product-detail operation.', 'You already have a product to inspect. Check the required identifier and marketplace inputs; use a discovery category if you still need product candidates.'),
};

// Focused overrides for frequently searched tasks. Unmapped operations retain feed copy.
export const operationCopyMap = {
  'jev-route': 'Match an intent to a published API or evaluation preset. Returns discovery metadata; it does not execute the suggested API or invent missing inputs.',
  'jev-evaluate': 'Evaluate content you are authorized to submit using a preset or typed questions. Review advisory results before making a decision.',
  'product-description-generator': 'Generate description copy from supplied product facts, then review accuracy and claims before publication.',
  'woocommerce-products': 'Search products within one specified public WooCommerce store. Keep the store URL with each product ID and check pagination before treating the catalog as complete.',
  'woocommerce-product-detail': 'Inspect a product in its source WooCommerce store. Review its facts before making a separate request for variations.',
  'woocommerce-product-variations': 'Retrieve variations for a selected parent product within one store. Preserve the store and parent identity when comparing SKUs.',
  'woocommerce-product-categories': 'Retrieve public product categories from a specified WooCommerce store to plan product research.',
  'woocommerce-product-tags': 'Retrieve public product tags within one WooCommerce store. Tag coverage depends on the store.',
  'woocommerce-product-brands': 'Retrieve public product brands from a supported WooCommerce store. Store version and configuration determine availability.',
  'woocommerce-product-attributes': 'List public product attributes within one specified WooCommerce store.',
  'woocommerce-product-attribute-detail': 'Inspect a selected product attribute within its WooCommerce store.',
  'woocommerce-product-attribute-terms': 'Retrieve terms for a selected product attribute, such as the values used for size or color.',
  'woocommerce-product-reviews': 'Retrieve public reviews from a specified WooCommerce store, optionally restricted to a product or category. Protected product reviews remain hidden.',
  'woocommerce-product-collection-data': 'Request collection statistics such as price ranges, ratings, stock-status counts and taxonomy counts. Unsupported store fields may be absent or null.',
  '1688-product-search': 'Find wholesale product candidates from a keyword. Follow up with product detail lookup to compare the relevant offer and SKU information.',
  '1688-search-by-image': 'Start a sourcing shortlist from a reference image, then inspect candidate offers before comparing suppliers.',
  '1688-product-detail': 'Inspect one 1688 offer, including its available SKU, pricing, logistics and supplier information.',
  'amazon-search': 'Find Amazon listings for a product query. Use returned identifiers for follow-up detail and review research.',
  'amazon-product-detail': 'Inspect an Amazon product listing to collect the product facts needed for a comparison or catalog workflow.',
  'amazon-reviews-list': 'Retrieve Amazon review content for product-feedback research. Check the available filters and pagination before collecting a sample.',
  'tiktok-shop-product-detail': 'Look up one TikTok Shop product for a listing-level research task. Check the required product identifier, market and response fields in the official docs.',
  'google-trends-by-keywords': 'Compare relative search interest for product or topic keywords. Keep geography and time range consistent; the index is not an absolute search-volume count.',
  'google-trends-by-time': 'Explore how search interest changes over time to investigate seasonality. Check the time range and normalization before comparing trends.',
  'google-ai-mode-search': 'Retrieve Google AI Mode search results for a research query. Review the returned answer and source information; this operation does not make your site appear in AI answers.',
  'shopee-product-search': 'Discover Shopee products from a query, then inspect shortlisted listings in the same marketplace.',
  'shopee-product-detail': 'Inspect a Shopee listing before comparing product facts. Check the meaning and period of any returned sales metrics.',
};

export function categoryEditorialCopy(key, entries) {
  return categoryCopyMap[key] || {
    name: entries[0].group,
    description: entries[0].categoryDescription || `Compare the available ${entries[0].group} operations and inspect their official documentation.`,
  };
}
export function operationEditorialCopy(entry) {
  return {...entry, description: operationCopyMap[entry.slug] || entry.description};
}

export const researchWorkflows = [
  {category:'woocommerce',title:'Research a public WooCommerce store',description:'Find products in one store, inspect selected variations and review public product facts.',guide:'/ecommerce-ai-tools/guides/woocommerce-products-python/',guideLabel:'Follow the WooCommerce Python workflow'},
  {category:'data-amazon-front-data',title:'Compare Amazon listings and reviews',description:'Discover candidates, inspect listing facts and collect review content for a focused comparison.',guide:'/ecommerce-ai-tools/amazon-product-research-api-pilot/',guideLabel:'Plan a product research pilot'},
  {category:'data-sf-search-intelligence',title:'Research competitor ASIN keywords',description:'Start from an ASIN and inspect its keyword and traffic context before planning content or ads.',guide:'/ecommerce-ai-tools/amazon-competitor-keyword-research/',guideLabel:'Follow the competitor keyword workflow'},
  {category:'data-tiktok-shop-product-detail',title:'Inspect a TikTok Shop product',description:'Check a specific product, then choose discovery or creator research when you need a broader shortlist.',guide:'/ecommerce-ai-tools/guides/tiktok-shop-api-guide/',guideLabel:'Choose a TikTok research workflow'},
  {category:'data-1688-sourcing',title:'Shortlist 1688 wholesale offers',description:'Search by keyword or image and inspect candidate offers before comparing MOQ and price.',guide:'/ecommerce-ai-tools/guides/1688-product-search-api/',guideLabel:'Filter offers by MOQ and price'},
  {category:'data-google-tools',title:'Check product seasonality',description:'Compare relative interest using a consistent region and time range before committing to inventory.',guide:'/ecommerce-ai-tools/guides/google-trends-api/',guideLabel:'Read the seasonality guide'},
  {category:'data-amazon-ads',title:'Plan an Amazon Ads reporting workflow',description:'Check account access, report creation and status retrieval before automating your reporting.',guide:'/ecommerce-ai-tools/guides/amazon-ads-api/',guideLabel:'Plan an advertising API integration'},
];
