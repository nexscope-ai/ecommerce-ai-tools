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

ORIGIN = "https://api.nexscope.ai"
PATHS = {"keywords": "/seo/keywordMetrics", "reviews": "/amazon/reviews/list"}
DOMAINS = {"com", "ca", "co.uk", "in", "de", "fr", "it", "es", "co.jp",
           "com.au", "com.br", "nl", "se", "com.mx", "ae"}


def normalized(text):
    return unicodedata.normalize("NFC", text.strip()).casefold()


def validate(mode, request):
    if not isinstance(request, dict):
        raise ValueError("Request must be an object")
    if mode == "keywords":
        if set(request) != {"keywords", "market", "language"}:
            raise ValueError("Use keywords, market and language only")
        if request["market"] != "US" or request["language"] != "en":
            raise ValueError("This reference supports US English")
        words = request["keywords"]
        if not isinstance(words, list) or not 1 <= len(words) <= 20:
            raise ValueError("Use 1..20 keyword phrases")
        if any(not isinstance(w, str) or not 1 <= len(w.strip()) <= 80
               or len(w.split()) > 10 or any(ord(c) < 32 for c in w) for w in words):
            raise ValueError("Use phrases of 1..80 characters, at most ten words")
        if len({normalized(w) for w in words}) != len(words):
            raise ValueError("Remove duplicate normalized inputs before running")
        request["keywords"] = [w.strip() for w in words]
    else:
        allowed = {"asin", "domainCode", "sortBy", "reviewerType"} | {
            f"star{i}Num" for i in range(1, 6)}
        if set(request) - allowed or not re.fullmatch(r"[A-Z0-9]{10}", str(request.get("asin", ""))):
            raise ValueError("Use one uppercase 10-character ASIN and supported sample fields")
        if request.get("domainCode") not in DOMAINS:
            raise ValueError("Set a supported domainCode explicitly")
        if request.get("sortBy", "recent") not in {"recent", "helpful"}:
            raise ValueError("Unsupported sortBy")
        if request.get("reviewerType", "all_reviews") not in {"all_reviews", "avp_only_reviews"}:
            raise ValueError("Unsupported reviewerType")
        counts = [request.get(f"star{i}Num", 0) for i in range(1, 6)]
        if any(type(c) is not int or not 0 <= c <= 100 for c in counts) or not 1 <= sum(counts) <= 20:
            raise ValueError("This starter requires an explicit total sample of 1..20")
        for i, count in enumerate(counts, 1):
            request[f"star{i}Num"] = count


def objects(value, label):
    if not isinstance(value, list) or any(not isinstance(x, dict) for x in value):
        raise ValueError("Expected an object array: " + label)
    return value


def transform(mode, request, body):
    if not isinstance(body, dict) or type(body.get("code")) is not int or body["code"] != 0:
        raise ValueError("Business code must be integer zero; inspect the raw response")
    data = body.get("data")
    if not isinstance(data, dict):
        raise ValueError("Expected a data object")
    if mode == "keywords":
        status = data.get("status")
        if status not in {"SUCCESS", "PARTIAL", "EMPTY"}:
            return [], {"status": "not_exported", "call_status": status,
                        "callId": data.get("callId"), "reason": data.get("reason")}
        result = data.get("result")
        if not isinstance(result, dict) or result.get("market") != request["market"] or result.get("language") != request["language"]:
            raise ValueError("Missing result or mismatched result scope")
        items = objects(result.get("items"), "data.result.items")
        wanted = {normalized(w): w for w in request["keywords"]}
        found = {}
        for item in items:
            label = item.get("inputKeyword")
            if not isinstance(label, str) or normalized(label) not in wanted or normalized(label) in found:
                raise ValueError("Unmatched or duplicate inputKeyword; do not join by array position")
            if item.get("status") not in {"AVAILABLE", "NO_COVERAGE"}:
                raise ValueError("Unknown keyword item state")
            for field in ("searchVolume", "keywordDifficulty", "competition"):
                value = item.get(field)
                if value is not None and (type(value) not in (int, float) or not math.isfinite(value) or value < 0):
                    raise ValueError("Malformed numeric metric")
            found[normalized(label)] = item
        fields = ["inputIndex", "normalizedKeyword", "searchVolume", "keywordDifficulty",
                  "cpcUsd", "competition", "competitionLevel", "dataUpdatedAt", "monthlySearches", "missing"]
        rows = []
        for word in request["keywords"]:
            item = found.get(normalized(word), {})
            row = {"inputKeyword": word, "itemStatus": item.get("status", "NOT_RETURNED"),
                   "market": result["market"], "language": result["language"]}
            row.update({field: item.get(field) for field in fields})
            rows.append(row)
        return rows, {"status": "exported_for_review", "call_status": status,
                      "callId": data.get("callId"), "source": data.get("source"),
                      "coverage": data.get("coverage"), "usage": data.get("usage"),
                      "returned_items": len(items), "omitted_inputs": [w for w in request["keywords"] if normalized(w) not in found]}
    records = objects(data.get("data"), "data.data")
    rows, seen, duplicates, skipped = [], {}, 0, 0
    for review in records:
        if review.get("statusCode") is not None and review["statusCode"] != 200:
            skipped += 1
            continue
        if review.get("domainCode") is not None and review["domainCode"] != request["domainCode"]:
            raise ValueError("Returned review domain differs from the requested domain")
        rid = review.get("reviewId")
        if rid is not None:
            if not isinstance(rid, str) or not rid.strip():
                raise ValueError("Malformed reviewId")
            signature = json.dumps(review, sort_keys=True, ensure_ascii=False)
            if rid in seen:
                if seen[rid] != signature:
                    raise ValueError("Conflicting duplicate reviewId; inspect the raw records")
                duplicates += 1
                continue
            seen[rid] = signature
        fields = ["reviewId", "asin", "variationId", "variationList", "domainCode", "title",
                  "text", "rating", "date", "verified", "vine", "numberOfHelpful", "filters", "locale"]
        row = {"requestedAsin": request["asin"], "requestedDomain": request["domainCode"]}
        row.update({field: review.get(field) for field in fields})
        row.update(theme="", evidence_note="", next_question="", human_review="")
        rows.append(row)
    return rows, {"status": "exported_for_review", "requested_reviews": sum(request[f"star{i}Num"] for i in range(1, 6)),
                  "raw_returned_records": len(records), "reported_total": data.get("total"),
                  "duplicate_records_removed": duplicates, "error_records_skipped": skipped,
                  "missing_review_ids": sum(r["reviewId"] is None for r in rows)}


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
    source.add_argument("--call-id", help="Keywords only: one GET of an existing owner result")
    args = parser.parse_args(argv)
    try:
        request = json.loads(args.request.read_text(encoding="utf-8-sig"))
        validate(args.mode, request)
        if args.call_id:
            if args.mode != "keywords":
                raise ValueError("Result lookup is supported only for keywords")
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
