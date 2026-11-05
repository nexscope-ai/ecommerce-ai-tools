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
PATHS = {"amazon": "/sf/asinKeywords", "backlinks": "/seo/referringDomains"}
DOMAINS = {"com", "ca", "co.uk", "in", "de", "fr", "it", "es", "co.jp",
           "com.au", "com.br", "nl", "se", "com.mx", "ae"}


def normalized(text):
    return unicodedata.normalize("NFC", text.strip()).casefold()


def domain(value):
    if not isinstance(value, str) or not re.fullmatch(r"[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?", value):
        raise ValueError("Use a lowercase bare domain")
    if len(value) > 253 or len(value.split(".")) < 2 or any(not x or len(x) > 63 or x.startswith("-") or x.endswith("-") for x in value.split(".")):
        raise ValueError("Invalid domain")
    return value


def validate(mode, request):
    if not isinstance(request, dict):
        raise ValueError("Request must be an object")
    if mode == "amazon":
        allowed = {"asin", "country", "timePieceType", "timePieceValue", "pageNum", "pageSize"}
        if set(request) != allowed or not re.fullmatch(r"[A-Z0-9]{10}", str(request.get("asin", ""))) or "X" * 5 in request["asin"]:
            raise ValueError("Set one real uppercase ASIN and the six starter fields")
        if request["country"] != "US" or request["timePieceType"] != "latelyDay" or request["timePieceValue"] not in {"7", "30"}:
            raise ValueError("Starter supports US and an explicit 7 or 30 recent days")
        if type(request["pageNum"]) is not int or request["pageNum"] != 1 or type(request["pageSize"]) is not int or request["pageSize"] != 10:
            raise ValueError("Starter fetches first page of ten only")
    else:
        if set(request) != {"target", "limit"} or not isinstance(request["target"], dict) or set(request["target"]) != {"kind", "target"} or request["target"]["kind"] != "DOMAIN":
            raise ValueError("Starter requires DOMAIN target and limit")
        domain(request["target"]["target"])
        if type(request["limit"]) is not int or not 1 <= request["limit"] <= 20:
            raise ValueError("Limit must be 1..20")


def objects(value, label):
    if not isinstance(value, list) or any(not isinstance(x, dict) for x in value):
        raise ValueError("Expected object array: " + label)
    return value


def count(value):
    if value is None:
        return
    if type(value) is int and value >= 0:
        return
    if isinstance(value, str) and re.fullmatch(r"0|[1-9][0-9]*", value):
        return
    raise ValueError("Invalid count or rank")


def transform(mode, request, body):
    if not isinstance(body, dict) or type(body.get("code")) is not int or body["code"] != 0:
        raise ValueError("Outer business code must be integer zero")
    data=body.get("data")
    if not isinstance(data, dict):
        raise ValueError("Expected data object")
    rows=[]
    if mode == "amazon":
        if data.get("code") not in (None, "1"):
            raise ValueError("Provider business code is not successful")
        records=objects(data.get("data"), "data.data")
        if len(records) > request["pageSize"]:
            raise ValueError("Result exceeds bounded page size")
        seen=set()
        fields=["asin", "keyword", "translateKeyword", "productNaturalRank", "naturalRankDisplay",
                "productAdRank", "adRankDisplay", "weeklySearchVolume", "trafficShare", "naturalTrafficShare",
                "paidTrafficShare", "displayPositionTypes", "periodEndDate", "updateTime",
                "lastNaturalRankTime", "lastAdRankTime"]
        for item in records:
            if not isinstance(item.get("keyword"), str) or not item["keyword"].strip() or item.get("asin") != request["asin"]:
                raise ValueError("Missing keyword or mismatched returned ASIN; review parent/variant scope")
            identity=normalized(item["keyword"])
            if identity in seen:
                raise ValueError("Duplicate normalized keyword for this ASIN; inspect raw rows")
            seen.add(identity)
            for f in ["productNaturalRank", "productAdRank", "weeklySearchVolume"]:
                count(item.get(f))
            rows.append({"requestedAsin":request["asin"], "country":request["country"],
                         "timePieceType":request["timePieceType"], "timePieceValue":request["timePieceValue"],
                         "normalized_keyword":identity, **{f:item.get(f) for f in fields},
                         "comparable_asin":"", "brand_or_generic":"", "your_listing_coverage":"", "decision":"", "evidence_note":""})
        return rows,{"status":"exported_for_review", "provider_code":data.get("code"),
                     "isParentAsin":data.get("isParentAsin"), "hasVaiants":data.get("hasVaiants"),
                     "abaCreateDateWeek":data.get("abaCreateDateWeek"), "reported_total":data.get("total"),
                     "scope_note":"One bounded ASIN sample; never sum keyword estimates across ASINs"}
    status=data.get("status")
    if status not in {"SUCCESS", "PARTIAL", "EMPTY"}:
        return [],{"status":"not_exported", "call_status":status, "callId":data.get("callId")}
    result=data.get("result")
    if not isinstance(result, dict) or result.get("inputTarget") != request["target"] or result.get("normalizedTarget") != request["target"] or result.get("requestedLimit") != request["limit"] or result.get("sourceKind") != "dataforseo_backlink_index":
        raise ValueError("Target or provider scope mismatch")
    records=objects(result.get("items"), "data.result.items")
    if type(result.get("returnedCount")) is not int or result["returnedCount"] != len(records) or len(records)>request["limit"] or (status=="EMPTY" and records):
        raise ValueError("Inconsistent result count")
    seen=set()
    for item in records:
        host=domain(item.get("domain"))
        if host in seen:
            raise ValueError("Duplicate referring domain")
        seen.add(host)
        for f in ["rank", "backlinks", "referringPages", "firstSeenAt", "lostAt"]:
            count(item.get(f))
        fields=["domain", "rank", "backlinks", "referringPages", "firstSeenAt", "lostAt", "missing"]
        rows.append({"target_kind":request["target"]["kind"], "target":request["target"]["target"],
                     **{f:item.get(f) for f in fields}, "source_page_checked":"", "relevance_note":"", "decision":""})
    return rows,{"status":"exported_for_review", "call_status":status, "callId":data.get("callId"),
                 "coverage":data.get("coverage"), "usage":data.get("usage"), "requestedAt":data.get("requestedAt"),
                 "completedAt":data.get("completedAt"), "truncated":result.get("truncated"),
                 "providerTotalCount":result.get("providerTotalCount"), "sourceScope":result.get("sourceScope"),
                 "missing":result.get("missing"), "normalizedTarget":result.get("normalizedTarget")}


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
    source.add_argument("--call-id", help="Backlinks only: one GET of an existing owner result")
    args = parser.parse_args(argv)
    try:
        request = json.loads(args.request.read_text(encoding="utf-8-sig"))
        validate(args.mode, request)
        if args.call_id:
            if args.mode != "backlinks":
                raise ValueError("Result lookup is supported only for backlinks")
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
