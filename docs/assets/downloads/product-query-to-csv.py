"""One Nexscope eBay/Shopify query to raw JSON, review CSV and a manifest.

Python 3.10+. No dependencies. Reads NEXSCOPE_API_KEY only at request time.
Use --help before running; a request uses API credits. No retries/pagination.
"""
import argparse
import csv
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ENDPOINTS = {
    "ebay": "https://api.nexscope.ai/ebay/search",
    "shopify": "https://api.nexscope.ai/eh/shopify/productQuery",
}
FIELDS = {
    "ebay": ["productId", "title", "link", "price", "minPrice", "maxPrice",
             "currency", "shipping", "condition", "sellerName", "sponsored"],
    "shopify": ["productId", "storeId", "shopId", "title", "productLink",
                "storeLink", "minPrice", "maxPrice", "country",
                "weekOrderCount", "weekRevenueCount"],
}


def build_request(args):
    if args.platform == "ebay":
        return {"keyword": args.query, "ebayDomain": "ebay.com",
                "page": 1, "pageSize": 25, "orderBy": "12"}
    return {"searchKey": args.query, "country": "US",
            "page": 1, "pageSize": 20}


def csv_cell(value):
    """Keep zero/false; leave null blank; neutralize spreadsheet formulas.

    Raw JSON remains authoritative because CSV loses types and null semantics.
    """
    if value is None:
        return ""
    if isinstance(value, (list, dict, bool)):
        text = json.dumps(value, ensure_ascii=False)
    else:
        text = str(value)
    if isinstance(value, str) and (text.startswith(("\t", "\r", "\n"))
                                  or text.lstrip().startswith(("=", "+", "-", "@"))):
        return "'" + text
    return text


def parse_products(body):
    if not isinstance(body, dict) or type(body.get("code")) is not int:
        raise ValueError("Missing integer business code; inspect response.json.")
    if body["code"] != 0:
        raise ValueError("Nonzero business code; no CSV was created.")
    data = body.get("data")
    if not isinstance(data, dict) or not isinstance(data.get("products"), list):
        raise ValueError("Expected data.products array; no CSV was created.")
    if any(not isinstance(item, dict) for item in data["products"]):
        raise ValueError("A product is not an object; no CSV was created.")
    return data, data["products"]


def review_status(product, platform):
    identifier = product.get("productId")
    if not isinstance(identifier, (str, int)) or isinstance(identifier, bool) \
            or not str(identifier).strip():
        return "missing_product_id"
    link_field = "link" if platform == "ebay" else "productLink"
    if not isinstance(product.get("title"), str) or not product["title"].strip() \
            or not isinstance(product.get(link_field), str) \
            or not product[link_field].strip():
        return "missing_title_or_link"
    return "ready_for_manual_review"


def export_csv(body, platform, destination, observed_at):
    data, products = parse_products(body)
    columns = ["row_number", "observed_at_utc", "api_platform", "review_status",
               "missing_fields"] + FIELDS[platform]
    flagged = 0
    with destination.open("x", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        for index, product in enumerate(products, 1):
            status = review_status(product, platform)
            flagged += status != "ready_for_manual_review"
            row = {field: csv_cell(product.get(field)) for field in FIELDS[platform]}
            row.update(row_number=index, observed_at_utc=observed_at,
                       api_platform=platform, review_status=status,
                       missing_fields=";".join(field for field in FIELDS[platform]
                                               if product.get(field) is None))
            writer.writerow(row)
    return {"returned_rows": len(products), "flagged_rows": flagged,
            "empty_returned_page": not products,
            "provider_metadata": {key: data[key] for key in
                                  ("page", "pageSize", "total", "productNum",
                                   "sourceType", "sourceTool", "dataSnapshotMonth")
                                  if key in data}}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("platform", choices=ENDPOINTS)
    parser.add_argument("query", help="Keyword; Shopify also documents product/store URLs")
    parser.add_argument("--output", default="product-query-output",
                        help="New directory to create; existing paths are never overwritten")
    args = parser.parse_args(argv)
    args.query = args.query.strip()
    if not args.query:
        parser.error("query must not be empty")
    if args.platform == "ebay" and len(args.query) > 1024:
        parser.error("eBay keyword exceeds 1024 characters")
    api_key = os.environ.get("NEXSCOPE_API_KEY", "").strip()
    if not api_key or "\r" in api_key or "\n" in api_key:
        parser.error("set NEXSCOPE_API_KEY to a valid key before requesting data")
    output = Path(args.output)
    output.mkdir(parents=True, exist_ok=False)
    payload = build_request(args)
    manifest = {"platform": args.platform, "endpoint": ENDPOINTS[args.platform],
                "request": payload, "request_count": 1,
                "started_at_utc": datetime.now(timezone.utc).isoformat(),
                "status": "started", "automatic_retries": 0}
    exit_code = 1
    try:
        request = Request(ENDPOINTS[args.platform], method="POST",
                          data=json.dumps(payload).encode("utf-8"),
                          headers={"Authorization": "Bearer " + api_key,
                                   "Content-Type": "application/json"})
        try:
            with urlopen(request, timeout=90) as response:
                raw = response.read()
                manifest["http_status"] = response.status
        except HTTPError as exc:
            raw = exc.read()
            manifest["http_status"] = exc.code
        observed_at = datetime.now(timezone.utc).isoformat()
        manifest["observed_at_utc"] = observed_at
        (output / "response.json").write_bytes(raw)
        if not 200 <= manifest["http_status"] < 300:
            raise ValueError("Non-success HTTP response; no automatic retry.")
        body = json.loads(raw)
        manifest.update(export_csv(body, args.platform, output / "products.csv", observed_at))
        manifest["status"] = "exported_for_review"
        exit_code = 0
    except (ValueError, URLError, TimeoutError, OSError) as exc:
        # Never print provider error bodies or request headers to the terminal.
        manifest["status"] = "failed_inspect_saved_files_before_retry"
        manifest["error_type"] = type(exc).__name__
        print("No completed export. Inspect the saved files before deciding to retry.")
    finally:
        (output / "manifest.json").write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    if exit_code == 0:
        print(f"Saved {manifest['returned_rows']} returned rows; "
              f"{manifest['flagged_rows']} flagged. Review JSON, CSV and manifest together.")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
