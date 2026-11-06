// Public release announcement approved for directory display and direct links.
// Current official feed entries take precedence as the publication catches up.
export const procurementCategory = 'data-1688-procurement';
export const announcedProcurement = [
  ['authorize-url','Authorize URL','authorizeUrl','Get the authorization link for your own 1688 account. Authorization is supported by LinkFox Agent; Nexscope keeps each user bound to their own authorized account.'],
  ['authorized-stores','Authorized Accounts','authorizedStores','List your authorized 1688 accounts, authorization status and expiry.'],
  ['receive-address-list','Shipping Addresses','receiveAddressList','Read shipping addresses from your authorized account and identify the address ID needed for an order.'],
  ['sku','Product SKUs','sku','Inspect product specifications, SKU identifiers, prices and inventory before preparing an order.'],
  ['order-preview','Order Preview','orderPreview','Preview product amounts and shipping charges without creating a purchase order.'],
  ['create-order','Create Order','createOrder','Create a purchase order after explicit user confirmation.'],
  ['payment-url','Payment URL','paymentUrl','Get an order payment link after explicit confirmation. This does not automatically pay the order.'],
  ['order-status','Order Status','orderStatus','Read the current status of a purchase order.'],
  ['logistics','Order Logistics','logistics','Read the shipping company, tracking number and logistics record ID for an order.'],
  ['logistics-trace','Logistics Tracking','logisticsTrace','Read shipment events, times and transport status.'],
  ['confirm-receive','Confirm Receipt','confirmReceive','Confirm receipt of an order only after explicit user confirmation.'],
  ['cancel-order','Cancel Order','cancelOrder','Request cancellation after explicit user confirmation. Cancellation does not mean a refund.'],
  ['invoice-amount','Invoice Amount','invoiceAmount','Read the amount eligible for an invoice application.'],
  ['invoice-apply','Apply for Invoice','invoiceApply','Submit an invoice application after explicit confirmation and inspect successful and failed results.'],
].map(([suffix,name,endpoint,description])=>({
  slug:`data-alibaba1688-${suffix}`,collection:'ecommerce',name:`1688 ${name}`,description,
  group:'1688 Procurement',categoryDescription:'Authorize your own 1688 account, prepare purchase orders and follow up on shipping and invoices.',
  categorySlug:procurementCategory,method:'POST',path:`/alibaba1688/${endpoint}`,
}));

export function supplementAnnouncedData(snapshot, withdrawnSlugs=[]) {
  const present=new Set(snapshot.entries.map(e=>e.slug)),withdrawn=new Set(withdrawnSlugs);
  const additions=announcedProcurement.filter(e=>!present.has(e.slug)&&!withdrawn.has(e.slug));
  if (!additions.length) return snapshot;
  return {...snapshot,entries:[...snapshot.entries,...additions].sort((a,b)=>a.slug.localeCompare(b.slug))};
}
