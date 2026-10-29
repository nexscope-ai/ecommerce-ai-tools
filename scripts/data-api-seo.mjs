/** Customer-facing selection help; the same answers are used in visible HTML and JSON-LD. */
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function selectionCopy(name, entries, kind='root') {
  const examples=entries.slice(0,3).map(e=>e.name.replace(/ API$/,'')).join(', ');
  const useCases={
    '1688':'Compare wholesale offers and supplier information before shortlisting products to source.',
    amazon:'Choose a focused operation for Amazon product, review, keyword or advertising research. Coverage depends on the API you select.',
    tiktok:'Research products, creators, shops or content using the operations available in this category.',
    shopee:'Build a Shopee product-research workflow by choosing search or product-detail operations.',
    shopify:'Look up Shopify store or product information to support catalog research and competitor comparisons.',
    ebay:'Use marketplace search operations to find products for a focused eBay research workflow.',
    etsy:'Choose an Etsy category, product or store operation for your next marketplace research task.',
    temu:'Choose among Temu product, store and category operations according to the information you need.',
    ozon:'Explore Ozon product, category, seller or keyword operations for marketplace research.',
    walmart:'Select a Walmart operation for product, keyword or category research.',
    patent:'Choose a patent research operation to examine records relevant to a product idea. Research results are not legal clearance.',
    detection:'Select a risk-research operation for an initial product check. Automated results need human review and are not legal advice.',
    google:'Use the available Google trend or search operations to research demand and discovery questions.',
    'web-search':'Retrieve web-search information as a source for a research or application workflow.',
    mercado:'Explore the available market-research operations and check their marketplace coverage before integration.',
  };
  const isRoot=kind==='root';
  const guides={
    '1688':{url:'/ecommerce-ai-tools/ecommerce-trends/1688-image-search-sourcing/',name:'1688 image-search sourcing workflow'},
    amazon:{url:'/ecommerce-ai-tools/amazon-product-research-api-pilot/',name:'Plan an Amazon product-research API pilot'},
    tiktok:{url:'/ecommerce-ai-tools/guides/tiktok-shop-api-guide/',name:'Choose a TikTok product and creator research API'},
    google:{url:'/ecommerce-ai-tools/guides/google-trends-api/',name:'Use Google Trends APIs for demand research'},
  };
  return {
    summary:isRoot?'Nexscope Data APIs let developers and AI agents find ecommerce research operations across marketplaces, sourcing, search and product-risk research. Choose a platform, compare API purposes and open the exact official documentation to inspect inputs, returned fields and credit requirements.':(useCases[kind]||`Explore ${name} operations for a focused ecommerce data workflow.`),
    guide:guides[kind],
    faqs:[
      {q:isRoot?'How do I choose an ecommerce data API?':`Which ${name} API should I choose?`,a:isRoot?'Start with the marketplace and the question you need to answer. Search for a task such as product search, reviews or keywords, then open that API’s official documentation to check required identifiers and returned fields.':`Available operations include ${examples}. Choose the operation that matches the information you need, then inspect its required identifiers and response fields in the official documentation.`},
      {q:'Where can I test an API?',a:'Select an API card to open its matching Nexscope API documentation. Use the online testing area there after supplying the credentials and required inputs shown for that operation. This directory does not execute API requests.'},
      {q:'Do all APIs have the same coverage and price?',a:'No. Marketplace coverage, inputs, returned fields and credit requirements vary by operation. Check the selected API’s official documentation before integration; do not assume that one API’s capabilities apply to another.'},
      {q:'Can I use these APIs in an app or AI agent?',a:'Yes. Developers can call the documented REST endpoints from an application or agent workflow. Keep API credentials in a protected server environment, and validate results before using them for business decisions.'},
    ],
  };
}

export function selectionHelp(copy) {
  return `<section class="api-selection-help" aria-labelledby="api-selection-title"><h2 id="api-selection-title">From API discovery to a first request</h2><ol><li><strong>Choose your task.</strong> Identify the marketplace and information you need.</li><li><strong>Check the contract.</strong> Open an API card and review inputs, returned fields and credit requirements.</li><li><strong>Test one request.</strong> Use the official online tester before adding the operation to your workflow.</li></ol>${copy.guide?`<p><a href="${esc(copy.guide.url)}">${esc(copy.guide.name)} →</a></p>`:''}<p><a href="/ecommerce-ai-tools/api-capabilities/">Explore Nexscope API capabilities and workflows →</a></p></section><section class="api-faq" aria-labelledby="api-faq-title"><h2 id="api-faq-title">API questions, answered</h2>${copy.faqs.map(({q,a})=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>`;
}

export function directorySchema({title,description,path,modifiedAt,items,faqs}) {
  const origin='https://learn.nexscope.ai';
  const url=origin+path;
  const breadcrumbs=[{name:'Nexscope Learn',item:origin+'/'},{name:'Data APIs',item:origin+'/data/'}];
  if (path!=='/data/') breadcrumbs.push({name:title.replace(/ APIs? \| Nexscope$/,''),item:url});
  return JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':origin+'/#nexscope',name:'Nexscope',url:'https://www.nexscope.ai/'},
    {'@type':'CollectionPage','@id':url+'#page',url,name:title,description,inLanguage:'en',dateModified:modifiedAt,publisher:{'@id':origin+'/#nexscope'},mainEntity:{'@id':url+'#apis'}},
    {'@type':'ItemList','@id':url+'#apis',numberOfItems:items.length,itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,url:item.url}))},
    {'@type':'BreadcrumbList',itemListElement:breadcrumbs.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))},
    {'@type':'FAQPage','@id':url+'#faq',mainEntity:faqs.map(({q,a})=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))},
  ]}).replace(/</g,'\\u003c');
}
