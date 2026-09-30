"""Reject unverified or unsafe public market-insights snapshots before Pages builds."""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlparse


SNAPSHOT = Path(__file__).resolve().parents[1] / "docs/_data/market_insights.json"
CATEGORIES = {
    "home-kitchen": "Home & Kitchen",
    "beauty-personal-care": "Beauty & Personal Care",
    "pet-supplies": "Pet Supplies",
}
DOCS = {
    "market": "amazon-market-statistics",
    "opportunity": "amazon-opportunity-search-by-metrics",
    "keyword": "seo-keyword-metrics",
    "trends": "google-trends-by-time",
    "history": "amazon-product-price-series",
}
FORBIDDEN_KEYS = re.compile(
    r"(?:email|token|secret|password|api.?key|authorization|cookie|user.?id|account.?id|raw.?calls|phone|address)",
    re.IGNORECASE,
)
EMAIL = re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
SECRET = re.compile(r"(?i)(?:bearer\s+[\w.-]+|(?:sk|pk)_[\w-]{12,})")


class SnapshotError(ValueError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SnapshotError(message)


def keys(obj: object, expected: set[str], path: str) -> dict:
    require(isinstance(obj, dict), f"{path} must be an object")
    require(set(obj) == expected, f"{path}: expected fields {sorted(expected)}, got {sorted(obj)}")
    return obj


def nonempty(value: object, path: str) -> str:
    require(isinstance(value, str) and bool(value.strip()), f"{path} must be nonempty text")
    require(len(value) <= 250, f"{path} is too long")
    return value


def number(value: object, path: str, minimum: float = 0, maximum: float = 1_000_000_000) -> float:
    require(type(value) in (int, float) and minimum <= value <= maximum, f"{path} must be a finite number between {minimum} and {maximum}")
    return value


def whole(value: object, path: str, minimum: int = 0, maximum: int = 1_000_000_000) -> int:
    require(type(value) is int and minimum <= value <= maximum, f"{path} must be an integer between {minimum} and {maximum}")
    return value


def day(value: object, path: str) -> date:
    require(isinstance(value, str), f"{path} must be ISO date text")
    try:
        parsed = date.fromisoformat(value)
    except ValueError as exc:
        raise SnapshotError(f"{path} must be a valid YYYY-MM-DD date") from exc
    require(parsed <= date.today() + timedelta(days=1), f"{path} cannot be in the future")
    return parsed


def doc_url(value: object, slug: str, path: str) -> None:
    nonempty(value, path)
    parsed = urlparse(value)
    require(parsed.scheme == "https" and parsed.netloc == "www.nexscope.ai" and parsed.path == f"/api-docs/{slug}" and not parsed.query and not parsed.fragment, f"{path} must link to the official {slug} API documentation")


def check_secrets(value: object, path: str = "snapshot") -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            require(not FORBIDDEN_KEYS.search(key), f"{path}.{key} is not safe for a public snapshot")
            check_secrets(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            check_secrets(child, f"{path}[{index}]")
    elif isinstance(value, str):
        require(not EMAIL.search(value) and not SECRET.search(value), f"{path} appears to contain private data")


def validate(snapshot: object) -> None:
    data = keys(snapshot, {"schemaVersion", "status", "asOf", "period", "platform", "categories", "keywordPoolDefinition", "keywords", "trends", "history"}, "snapshot")
    require(data["schemaVersion"] == 1, "Unsupported schemaVersion")
    check_secrets(data)
    if data["status"] == "awaiting_verified_data":
        require(data["asOf"] is None and data["period"] is None and data["platform"] is None and data["keywordPoolDefinition"] is None, "Awaiting-data snapshot must not imply verified metrics")
        require(all(data[key] == [] for key in ("categories", "keywords", "trends", "history")), "Awaiting-data snapshot must be empty")
        return
    require(data["status"] == "published", "status must be published or awaiting_verified_data")
    as_of = day(data["asOf"], "asOf")
    period = keys(data["period"], {"start", "end", "timezone"}, "period")
    start, end = day(period["start"], "period.start"), day(period["end"], "period.end")
    require((end - start).days == 29 and end <= as_of, "period must cover exactly 30 days and end by asOf")
    require(period["timezone"] == "Asia/Shanghai", "period.timezone must match the admin report")

    platform = keys(data["platform"], {"activeUsersApprox", "successfulCallsApprox", "topApis", "source", "methodology"}, "platform")
    for field in ("activeUsersApprox", "successfulCallsApprox"):
        value = whole(platform[field], f"platform.{field}")
        require(value > 0 and value % 10 == 0, f"platform.{field} must be a positive rounded multiple of 10")
    require(platform["activeUsersApprox"] <= platform["successfulCallsApprox"], "Active users cannot exceed successful calls")
    require(len(platform["topApis"]) == 5, "platform.topApis needs five verified APIs")
    calls = []
    names = set()
    for index, item in enumerate(platform["topApis"]):
        api = keys(item, {"name", "successfulCallsApprox", "docsUrl"}, f"topApis[{index}]")
        name = nonempty(api["name"], f"topApis[{index}].name")
        require(name not in names, "Top API names must be unique")
        names.add(name)
        calls.append(whole(api["successfulCallsApprox"], f"topApis[{index}].successfulCallsApprox", 1))
        url = urlparse(nonempty(api["docsUrl"], f"topApis[{index}].docsUrl"))
        require(url.scheme == "https" and url.netloc == "www.nexscope.ai" and url.path.startswith("/api-docs/") and not url.query and not url.fragment, "Top API docs must be on the official site without query parameters")
    require(calls == sorted(calls, reverse=True), "Top APIs must be sorted by successful calls")
    require(sum(calls) <= platform["successfulCallsApprox"] + 50, "Top API calls exceed the approximate total")
    nonempty(platform["source"], "platform.source")
    nonempty(platform["methodology"], "platform.methodology")

    categories = data["categories"]
    require(isinstance(categories, list) and len(categories) == 3, "Exactly three US categories are required")
    seen = set()
    for index, item in enumerate(categories):
        path = f"categories[{index}]"
        category = keys(item, {"id", "name", "market", "nodeIdPath", "observedAt", "sampleSize", "metrics", "candidates", "sources", "limitations"}, path)
        ident = category["id"]
        require(ident in CATEGORIES and ident not in seen and category["name"] == CATEGORIES[ident], f"{path} has an invalid or duplicate category")
        seen.add(ident)
        require(category["market"] == "US", f"{path}.market must be US")
        nonempty(category["nodeIdPath"], f"{path}.nodeIdPath")
        require(day(category["observedAt"], f"{path}.observedAt") <= as_of, f"{path} cannot be newer than asOf")
        whole(category["sampleSize"], f"{path}.sampleSize", 1)
        metrics = keys(category["metrics"], {"avgPriceUsd", "avgRating", "avgBsr", "newProductPercent"}, f"{path}.metrics")
        number(metrics["avgPriceUsd"], f"{path}.avgPriceUsd", 0.01, 1_000_000)
        number(metrics["avgRating"], f"{path}.avgRating", 0, 5)
        whole(metrics["avgBsr"], f"{path}.avgBsr", 1)
        number(metrics["newProductPercent"], f"{path}.newProductPercent", 0, 100)
        candidates = category["candidates"]
        require(isinstance(candidates, list) and 1 <= len(candidates) <= 5, f"{path}.candidates needs 1–5 selected samples")
        asins = set()
        for j, candidate in enumerate(candidates):
            cp = f"{path}.candidates[{j}]"
            product = keys(candidate, {"asin", "title", "priceUsd", "rating", "bsr", "observedAt"}, cp)
            require(isinstance(product["asin"], str) and bool(re.fullmatch(r"[A-Z0-9]{10}", product["asin"])) and product["asin"] not in asins, f"{cp}.asin must be a unique ASIN")
            asins.add(product["asin"])
            nonempty(product["title"], f"{cp}.title")
            number(product["priceUsd"], f"{cp}.priceUsd", 0.01, 1_000_000)
            number(product["rating"], f"{cp}.rating", 0, 5)
            whole(product["bsr"], f"{cp}.bsr", 1)
            require(day(product["observedAt"], f"{cp}.observedAt") <= as_of, f"{cp} cannot be newer than asOf")
        sources = keys(category["sources"], {"marketStats", "opportunitySearch"}, f"{path}.sources")
        doc_url(sources["marketStats"], DOCS["market"], f"{path}.sources.marketStats")
        doc_url(sources["opportunitySearch"], DOCS["opportunity"], f"{path}.sources.opportunitySearch")
        nonempty(category["limitations"], f"{path}.limitations")
    require(seen == set(CATEGORIES), "All fixed categories must be present")

    nonempty(data["keywordPoolDefinition"], "keywordPoolDefinition")
    keywords = data["keywords"]
    require(isinstance(keywords, list) and 10 <= len(keywords) <= 100, "The fixed keyword pool needs 10–100 measured terms")
    volumes, words = [], set()
    for index, item in enumerate(keywords):
        path = f"keywords[{index}]"
        keyword = keys(item, {"term", "categoryId", "monthlySearchVolumeEstimate", "observedAt", "market", "language", "source"}, path)
        term = nonempty(keyword["term"], f"{path}.term").casefold()
        require(term not in words and keyword["categoryId"] in CATEGORIES, f"{path} has duplicate term or invalid category")
        words.add(term)
        volumes.append(whole(keyword["monthlySearchVolumeEstimate"], f"{path}.monthlySearchVolumeEstimate"))
        require(keyword["market"] == "US" and keyword["language"] == "en", f"{path} must use US/English")
        require(day(keyword["observedAt"], f"{path}.observedAt") <= as_of, f"{path} cannot be newer than asOf")
        doc_url(keyword["source"], DOCS["keyword"], f"{path}.source")
    require(volumes == sorted(volumes, reverse=True), "Keywords must be sorted by estimated monthly volume")

    for field, slug in (("trends", DOCS["trends"]), ("history", DOCS["history"])):
        require(isinstance(data[field], list), f"{field} must be a list")
        for index, item in enumerate(data[field]):
            path = f"{field}[{index}]"
            if field == "trends":
                series = keys(item, {"term", "observedAt", "market", "source", "points"}, path)
                nonempty(series["term"], f"{path}.term")
                require(series["market"] == "US", f"{path}.market must be US")
                require(isinstance(series["points"], list) and len(series["points"]) >= 2, f"{path}.points needs at least two observations")
                for point in series["points"]:
                    keys(point, {"date", "index"}, f"{path}.point")
                    day(point["date"], f"{path}.point.date")
                    whole(point["index"], f"{path}.point.index", 0, 100)
            else:
                series = keys(item, {"asin", "categoryId", "observedAt", "market", "source", "points"}, path)
                require(series["categoryId"] in CATEGORIES and series["market"] == "US", f"{path} must identify a US category")
                require(isinstance(series["asin"], str) and bool(re.fullmatch(r"[A-Z0-9]{10}", series["asin"])), f"{path}.asin is invalid")
                require(isinstance(series["points"], list) and len(series["points"]) >= 2, f"{path}.points needs at least two observations")
                for point in series["points"]:
                    keys(point, {"date", "priceUsd", "bsr"}, f"{path}.point")
                    day(point["date"], f"{path}.point.date")
                    number(point["priceUsd"], f"{path}.point.priceUsd", 0.01, 1_000_000)
                    whole(point["bsr"], f"{path}.point.bsr", 1)
            require(day(series["observedAt"], f"{path}.observedAt") <= as_of, f"{path} cannot be newer than asOf")
            doc_url(series["source"], slug, f"{path}.source")
            points = [day(point["date"], f"{path}.point.date") for point in series["points"]]
            require(points == sorted(set(points)) and points[-1] <= as_of, f"{path}.points must have unique ascending dates")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", nargs="?", type=Path, default=SNAPSHOT)
    args = parser.parse_args()
    try:
        data = json.loads(args.path.read_text(encoding="utf-8"))
        validate(data)
    except (OSError, json.JSONDecodeError, SnapshotError) as exc:
        print(f"Invalid public market snapshot: {exc}", file=sys.stderr)
        return 1
    print(f"Market snapshot valid: {data['status']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
