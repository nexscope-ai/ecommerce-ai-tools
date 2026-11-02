"""Python 3.10+; one bounded Nexscope request or offline response review.

Usage: python commerce-evidence-export.py MODE request.json --output NEW_DIR
Modes: woo-products, woo-variations, tiktok-batch, amazon-sales.
Add --from-response response.json to review a saved response without a Key/call.
Network mode uses credits. No automatic retries, paging, joins or totals.
"""
import argparse
import csv
import json
import os
import re
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

ENDPOINTS = {
    "woo-products": "/woocommerce/products",
    "woo-variations": "/woocommerce/productVariations",
    "tiktok-batch": "/et/batchProductDetail",
    "amazon-sales": "/js/sales-estimates/query",
}


def store_identity(url):
    if not isinstance(url, str):
        raise ValueError("storeUrl must be a string")
    parts = urlsplit(url)
    if parts.scheme != "https" or not parts.hostname or parts.query or parts.fragment \
            or parts.username or parts.password:
        raise ValueError("Use a public HTTPS store installation URL without query/fragment")
    return "https://" + parts.netloc.lower() + parts.path.rstrip("/")


def validate_input(mode, payload):
    if not isinstance(payload, dict):
        raise ValueError("Request must be a JSON object")
    if mode.startswith("woo-"):
        allowed = {"storeUrl", "pageNum", "pageSize"}
        allowed.add("keyword" if mode == "woo-products" else "productId")
        store_identity(payload.get("storeUrl"))
        if type(payload.get("pageNum", 1)) is not int or payload.get("pageNum", 1) < 1:
            raise ValueError("pageNum must be a positive integer")
        if type(payload.get("pageSize", 20)) is not int or not 1 <= payload.get("pageSize", 20) <= 100:
            raise ValueError("pageSize must be 1..100")
        if mode == "woo-variations":
            if not isinstance(payload.get("productId"), str) or not re.fullmatch(r"[1-9][0-9]{0,18}", payload["productId"]):
                raise ValueError("productId must be a positive decimal string, at most 19 digits")
        elif "keyword" in payload and (not isinstance(payload["keyword"], str) or len(payload["keyword"]) > 200):
            raise ValueError("keyword must be a string of at most 200 characters")
    elif mode == "tiktok-batch":
        allowed = {"productIds"}
        ids = payload.get("productIds")
        if not isinstance(ids, list) or not 1 <= len(ids) <= 5:
            raise ValueError("This starter accepts 1..5 IDs; larger batches need a separate budget decision")
        if any(not isinstance(item, str) or not re.fullmatch(r"[0-9]+", item) for item in ids) or len(ids) != len(set(ids)):
            raise ValueError("Use distinct decimal-string product IDs")
    else:
        allowed = {"marketplace", "asin", "startDate", "endDate"}
        if payload.get("marketplace") not in {"us", "uk", "de", "in", "ca", "fr", "it", "es", "mx", "jp"}:
            raise ValueError("Unsupported marketplace")
        if not isinstance(payload.get("asin"), str) or not re.fullmatch(r"[A-Z0-9]{10}", payload["asin"]):
            raise ValueError("Use one uppercase 10-character ASIN")
        start, end = date.fromisoformat(payload["startDate"]), date.fromisoformat(payload["endDate"])
        if not start <= end < date.today() or (end - start).days >= 31:
            raise ValueError("Use 1..31 past calendar days, with endDate before today")
    if set(payload) - allowed:
        raise ValueError("Unexpected input fields; keep this starter's request bounded")


def object_array(value, label):
    if not isinstance(value, list) or any(not isinstance(item, dict) for item in value):
        raise ValueError("Expected an object array: " + label)
    return value


def identifier(value):
    if isinstance(value, bool) or not isinstance(value, (str, int)) or not str(value).strip():
        raise ValueError("Missing or malformed returned identifier")
    return str(value)


def transform(mode, payload, body):
    if not isinstance(body, dict) or type(body.get("code")) is not int or body["code"] != 0:
        raise ValueError("Business code is not integer zero")
    data = body.get("data")
    if not isinstance(data, dict):
        raise ValueError("Expected data object")
    rows, seen = [], set()
    meta = {key: data[key] for key in ("fetchedAt", "cacheHit", "pageNum", "pageSize",
                                     "total", "totalPages", "hasMore", "dataSnapshotMonth",
                                     "sourceType", "sourceTool") if key in data}
    if mode.startswith("woo-"):
        if store_identity(data.get("storeUrl")) != store_identity(payload["storeUrl"]):
            raise ValueError("Returned store identity does not match input")
        if data.get("pageNum") != payload.get("pageNum", 1):
            raise ValueError("Returned page differs from requested page")
        if mode == "woo-variations" and data.get("parentId") != payload["productId"]:
            raise ValueError("Returned parentId does not match input")
        for product in object_array(data.get("products"), "data.products"):
            pid = identifier(product.get("id"))
            if pid in seen:
                raise ValueError("Duplicate returned product ID; inspect raw response")
            seen.add(pid)
            prices = product.get("prices")
            if prices is None:
                prices = {}
            if not isinstance(prices, dict):
                raise ValueError("Expected prices object or missing value")
            rows.append({"storeUrl": data["storeUrl"], "parentId": data.get("parentId"),
                         "id": pid, "name": product.get("name"), "sku": product.get("sku"),
                         "url": product.get("url"), "variation": product.get("variation"),
                         "price": prices.get("price"), "currency": prices.get("currency"),
                         "minorUnit": prices.get("minorUnit"), "priceMinor": prices.get("priceMinor"),
                         "isInStock": product.get("isInStock"), "stockQuantity": product.get("stockQuantity")})
    elif mode == "tiktok-batch":
        wanted = set(payload["productIds"])
        fields = ["productId", "productName", "region", "sellerId", "minPrice", "maxPrice",
                  "productRating", "reviewCount", "totalSale7dCnt", "totalSale30dCnt"]
        for product in object_array(data.get("products"), "data.products"):
            pid = identifier(product.get("productId"))
            if pid not in wanted or pid in seen:
                raise ValueError("Unexpected or duplicate product ID")
            seen.add(pid)
            rows.append({**{field: product.get(field) for field in fields}, "productId": pid})
        meta["missing_requested_ids"] = [pid for pid in payload["productIds"] if pid not in seen]
        meta["returned_regions"] = sorted({str(row["region"]) for row in rows if row["region"] is not None})
    else:
        start, end = date.fromisoformat(payload["startDate"]), date.fromisoformat(payload["endDate"])
        records = object_array(data.get("salesEstimateList"), "data.salesEstimateList")
        returned_asins = set()
        for record in records:
            if record.get("asin") != payload["asin"]:
                raise ValueError("Returned ASIN scope differs; inspect before flattening")
            if record["asin"] in returned_asins:
                raise ValueError("Duplicate ASIN result")
            returned_asins.add(record["asin"])
            for point in object_array(record.get("dailyEstimates"), "dailyEstimates"):
                day = date.fromisoformat(point["date"])
                if not start <= day <= end or point["date"] in seen:
                    raise ValueError("Duplicate or out-of-range returned date")
                seen.add(point["date"])
                units = point.get("estimatedUnitsSold")
                if units is not None and (type(units) is not int or units < 0):
                    raise ValueError("Estimated units must be a nonnegative integer or missing")
                rows.append({"asin": record["asin"], "marketplace": payload["marketplace"],
                             "date": point["date"], "estimatedUnitsSold": units,
                             "lastKnownPrice": point.get("lastKnownPrice"),
                             **{field: record.get(field) for field in
                                ("parentAsin", "isParent", "isVariant", "isStandalone", "variants")}})
        meta["missing_dates"] = [(start + timedelta(days=i)).isoformat()
                                 for i in range((end - start).days + 1)
                                 if (start + timedelta(days=i)).isoformat() not in seen]
    meta["exported_rows"] = len(rows)
    return rows, meta


def csv_value(value):
    if value is None:
        return ""
    text = json.dumps(value, ensure_ascii=False) if isinstance(value, (dict, list, bool)) else str(value)
    if isinstance(value, str) and (text.startswith(("\t", "\r", "\n")) or text.lstrip().startswith(("=", "+", "-", "@"))):
        text = "'" + text
    return text


def write_csv(path, rows):
    fields = list(rows[0]) if rows else []
    fields += ["missing_fields"]
    with path.open("x", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({**{key: csv_value(value) for key, value in row.items()},
                             "missing_fields": ";".join(key for key, value in row.items() if value is None)})


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=ENDPOINTS)
    parser.add_argument("request", type=Path)
    parser.add_argument("--output", type=Path, required=True, help="New directory; never overwritten")
    parser.add_argument("--from-response", type=Path, help="Offline mode; no network or Key")
    args = parser.parse_args(argv)
    payload = json.loads(args.request.read_text(encoding="utf-8-sig"))
    validate_input(args.mode, payload)
    key = "" if args.from_response else os.environ.get("NEXSCOPE_API_KEY", "").strip()
    if not args.from_response and (not key or "\r" in key or "\n" in key):
        parser.error("Set NEXSCOPE_API_KEY locally")
    args.output.mkdir(parents=True, exist_ok=False)
    meta = {"mode": args.mode, "request": payload, "offline": bool(args.from_response),
            "endpoint": "https://api.nexscope.ai" + ENDPOINTS[args.mode],
            "client_observed_at_utc": datetime.now(timezone.utc).isoformat(),
            "status": "started", "automatic_retries": 0}
    result = 1
    try:
        if args.from_response:
            raw = args.from_response.read_bytes()
        else:
            request = Request(meta["endpoint"], method="POST", data=json.dumps(payload).encode(),
                              headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
            try:
                with urlopen(request, timeout=90) as response:
                    raw, meta["http_status"] = response.read(), response.status
            except HTTPError as exc:
                raw, meta["http_status"] = exc.read(), exc.code
        (args.output / "response.json").write_bytes(raw)
        if not args.from_response and not 200 <= meta["http_status"] < 300:
            raise ValueError("Unsuccessful HTTP status")
        rows, details = transform(args.mode, payload, json.loads(raw))
        meta.update(details)
        write_csv(args.output / "rows.csv", rows)
        meta["status"] = "exported_for_review"
        result = 0
    except (ValueError, KeyError, TypeError, OSError, URLError) as exc:
        meta.update(status="stopped_inspect_response", error_type=type(exc).__name__)
    finally:
        (args.output / "manifest.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(meta["status"] + ": inspect response.json and manifest.json")
    return result


if __name__ == "__main__":
    raise SystemExit(main())
