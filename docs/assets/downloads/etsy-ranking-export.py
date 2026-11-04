#!/usr/bin/env python3
"""Python 3.10+ starter: one request or result lookup, raw JSON and review CSV.

Uses only the standard library. No automatic paid retry, polling or pagination.
Use --from-response for offline inspection; the input request is still required.
"""
import argparse
import csv
from datetime import datetime, timezone
import json
import math
import os
from pathlib import Path
import re
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.request import Request, HTTPRedirectHandler, build_opener
from uuid import UUID
from urllib.parse import urlsplit

ORIGIN = "https://api.nexscope.ai"
PATHS = {"etsy": "/eh/etsy/productQuery", "rankings": "/seo/domainRankedKeywords"}
DOMAINS = {"com", "ca", "co.uk", "in", "de", "fr", "it", "es", "co.jp",
           "com.au", "com.br", "nl", "se", "com.mx", "ae"}


def normalized(text):
    return unicodedata.normalize("NFC", text.strip()).casefold()


def validate(mode, request):
    if not isinstance(request, dict):
        raise ValueError("Request must be an object")
    if mode == "etsy":
        if set(request) != {"searchKey", "page", "pageSize", "currencyCode"}:
            raise ValueError("Starter accepts searchKey, page, pageSize, currencyCode only")
        if not isinstance(request["searchKey"], str) or not request["searchKey"].strip():
            raise ValueError("Set a nonempty searchKey")
        if type(request["page"]) is not int or request["page"] != 1:
            raise ValueError("Starter fetches page 1 only")
        if type(request["pageSize"]) is not int or not 1 <= request["pageSize"] <= 10:
            raise ValueError("Starter pageSize is 1..10; no automatic pagination")
        if request["currencyCode"] != "USD":
            raise ValueError("Starter compares USD only")
    else:
        if set(request) != {"target", "market", "language", "limit"}:
            raise ValueError("Use target, market, language, limit only")
        if domain(request["target"]) != request["target"].lower():
            raise ValueError("Starter requires a bare domain without scheme, path or port")
        if request["market"] != "US" or request["language"] != "en":
            raise ValueError("Current scope is US English")
        if type(request["limit"]) is not int or not 1 <= request["limit"] <= 20:
            raise ValueError("Use a limit of 1..20")


def domain(value):
    if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?", value):
        raise ValueError("Invalid domain")
    labels = value.lower().split(".")
    if len(value) > 253 or len(labels) < 2 or any(not x or len(x) > 63 or x.startswith("-") or x.endswith("-") for x in labels):
        raise ValueError("Invalid domain")
    return value.lower()


def objects(value, label):
    if not isinstance(value, list) or any(not isinstance(x, dict) for x in value):
        raise ValueError("Expected an object array: " + label)
    return value


def numeric(value, minimum):
    if value is not None and (type(value) not in (int, float) or not math.isfinite(value) or value < minimum):
        raise ValueError("Invalid numeric metric")


def transform(mode, request, body):
    if not isinstance(body, dict) or type(body.get("code")) is not int or body["code"] != 0:
        raise ValueError("Business code must be integer zero")
    data = body.get("data")
    if not isinstance(data, dict):
        raise ValueError("Expected data object")
    rows = []
    if mode == "etsy":
        records = objects(data.get("products"), "data.products")
        if len(records) > request["pageSize"]:
            raise ValueError("Response exceeds requested pageSize")
        if data.get("sourceType") not in (None, "etsy"):
            raise ValueError("Unexpected marketplace")
        fields = ["productUrl", "title", "storeName", "category", "price", "status", "reviews",
                  "reviewsWeekly", "favorites", "favoritesWeekly", "salesTotal", "salesWeekly",
                  "shipsFrom", "releaseTime", "tags", "isBestsell", "isPick", "isRaving"]
        seen = set()
        for item in records:
            url = item.get("productUrl")
            parsed = urlsplit(url) if isinstance(url, str) else None
            if not parsed or parsed.scheme not in {"http", "https"} or parsed.username or parsed.password or not (parsed.hostname == "etsy.com" or (parsed.hostname or "").endswith(".etsy.com")) or not re.match(r"/listing/[0-9]+(?:/|$)", parsed.path):
                raise ValueError("Missing or invalid public Etsy listing identity")
            listing_id = re.match(r"/listing/([0-9]+)", parsed.path).group(1)
            if listing_id in seen:
                raise ValueError("Duplicate listing identity; inspect raw records")
            seen.add(listing_id)
            for name in ["price", "reviews", "reviewsWeekly", "favorites", "favoritesWeekly", "salesTotal", "salesWeekly"]:
                numeric(item.get(name), 0)
            rows.append({"searchKey": request["searchKey"], "requestedCurrency": request["currencyCode"],
                         "requestedPage": request["page"], "listingIdFromUrl": listing_id,
                         **{f: item.get(f) for f in fields}, "comparable": "", "research_note": ""})
        return rows, {"status": "exported_for_review", "reported_total": data.get("total"),
                      "reported_productNum": data.get("productNum"), "sourceType": data.get("sourceType"),
                      "scope_note": "One page only; requested currency is not independent verification"}
    status = data.get("status")
    if status not in {"SUCCESS", "PARTIAL", "EMPTY"}:
        return [], {"status": "not_exported", "call_status": status, "callId": data.get("callId")}
    result = data.get("result")
    if not isinstance(result, dict) or result.get("inputTarget") != request["target"] or result.get("target") != request["target"].lower() or result.get("market") != request["market"] or result.get("language") != request["language"] or result.get("requestedLimit") != request["limit"] or result.get("searchType") != "organic":
        raise ValueError("Returned target or research scope mismatch")
    records = objects(result.get("items"), "data.result.items")
    if len(records) > request["limit"] or type(result.get("returnedCount")) is not int or result["returnedCount"] != len(records) or (status == "EMPTY" and records):
        raise ValueError("Inconsistent bounded result count")
    seen = set()
    for item in records:
        if not isinstance(item.get("keyword"), str) or not item["keyword"].strip() or item.get("serpType") != "organic":
            raise ValueError("Missing keyword or unexpected SERP type")
        identity = (item["keyword"].strip().casefold(), item.get("url"))
        if identity in seen:
            raise ValueError("Duplicate keyword and URL; inspect raw response")
        seen.add(identity)
        for field in ("rankAbsolute", "rankGroup"):
            if item.get(field) is not None and (type(item[field]) is not int or item[field] < 1):
                raise ValueError("Invalid ranking position")
        numeric(item.get("searchVolume"), 0)
        url = item.get("url")
        match = "unknown"
        if url is not None:
            parsed = urlsplit(url) if isinstance(url, str) else None
            host = (parsed.hostname or "").lower() if parsed else ""
            if not parsed or parsed.scheme not in {"http", "https"} or parsed.username or parsed.password or not host:
                raise ValueError("Invalid returned ranking URL")
            target = request["target"].lower()
            match = "matches_target" if host == target or host.endswith("." + target) else "outside_target_review"
        fields = ["keyword", "url", "rankAbsolute", "rankGroup", "searchVolume", "cpcUsd", "serpType", "missing"]
        rows.append({"target": request["target"], "market": request["market"], "language": request["language"],
                     "url_scope_check": match, **{f: item.get(f) for f in fields}, "content_action": "", "evidence_note": ""})
    return rows, {"status": "exported_for_review", "call_status": status, "callId": data.get("callId"),
                  "coverage": data.get("coverage"), "result_missing": result.get("missing"),
                  "source": data.get("source"), "requestedAt": data.get("requestedAt"),
                  "completedAt": data.get("completedAt"), "usage": data.get("usage"),
                  "scope_note": "Database sample, not scheduled live rank tracking"}


def cell(value):
    if value is None:
        return ""
    text = json.dumps(value, ensure_ascii=False) if isinstance(value, (list, dict, bool)) else str(value)
    if isinstance(value, str) and (text.startswith(("\t", "\n", "\r")) or text.lstrip().startswith(("=", "+", "-", "@"))):
        return "'" + text
    return text


def export_csv(path, rows):
    fields = list(rows[0]) if rows else []
    fields += ["missing_fields"]
    with path.open("x", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({**{k: cell(v) for k, v in row.items()},
                             "missing_fields": ";".join(k for k, v in row.items() if v is None)})


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise URLError("Redirect refused; inspect the current endpoint")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=PATHS)
    parser.add_argument("request", type=Path)
    parser.add_argument("--output", type=Path, required=True, help="New output directory")
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--from-response", type=Path, help="Offline JSON; no key or network")
    source.add_argument("--call-id", help="Rankings only: one GET of an existing owner result")
    args = parser.parse_args(argv)
    try:
        request = json.loads(args.request.read_text(encoding="utf-8-sig"))
        validate(args.mode, request)
        if args.call_id:
            if args.mode != "rankings":
                raise ValueError("Result lookup is supported only for rankings")
            args.call_id = str(UUID(args.call_id))
        key = "" if args.from_response else os.environ.get("NEXSCOPE_API_KEY", "").strip()
        if not args.from_response and (not key or "\r" in key or "\n" in key):
            raise ValueError("Set NEXSCOPE_API_KEY locally")
        args.output.mkdir(parents=True, exist_ok=False)
    except (ValueError, OSError) as exc:
        parser.error(str(exc))
    path = PATHS[args.mode] + ("/calls/" + args.call_id if args.call_id else "")
    meta = {"request": request, "mode": args.mode, "endpoint": ORIGIN + path,
            "source_mode": "offline" if args.from_response else ("result_lookup" if args.call_id else "live_run"),
            "client_observed_at_utc": datetime.now(timezone.utc).isoformat(),
            "automatic_retries": 0, "status": "started"}
    exit_code = 1
    try:
        if args.from_response:
            raw = args.from_response.read_bytes()
        else:
            req = Request(ORIGIN + path, method="GET" if args.call_id else "POST",
                          data=None if args.call_id else json.dumps(request).encode(),
                          headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
            try:
                with build_opener(NoRedirect).open(req, timeout=90) as response:
                    raw, meta["http_status"] = response.read(), response.status
            except HTTPError as exc:
                raw, meta["http_status"] = exc.read(), exc.code
        (args.output / "response.json").write_bytes(raw)
        if not args.from_response and not 200 <= meta["http_status"] < 300:
            raise ValueError("Unsuccessful HTTP status; no automatic retry")
        body = json.loads(raw)
        if args.call_id:
            if not isinstance(body, dict) or not isinstance(body.get("data"), dict) or body["data"].get("callId") != args.call_id:
                raise ValueError("Returned callId does not match the lookup")
        rows, details = transform(args.mode, request, body)
        meta.update(details, exported_rows=len(rows))
        if meta["status"] == "exported_for_review":
            export_csv(args.output / "rows.csv", rows)
            exit_code = 0
        else:
            exit_code = 2
    except (ValueError, TypeError, KeyError, OSError, URLError) as exc:
        meta.update(status="stopped_inspect_response", error_type=type(exc).__name__)
    finally:
        (args.output / "manifest.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    print(meta["status"] + ": inspect response.json and manifest.json")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
