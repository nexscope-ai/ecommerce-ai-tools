"""Contract tests for the public snapshot publication gate."""

import unittest
from datetime import date, timedelta

from scripts.validate_market_insights import SnapshotError, validate


TODAY = date.today()
AS_OF = TODAY - timedelta(days=2)
DOCS = "https://www.nexscope.ai/api-docs/"


def valid_snapshot():
    categories = []
    for ident, name in (
        ("home-kitchen", "Home & Kitchen"),
        ("beauty-personal-care", "Beauty & Personal Care"),
        ("pet-supplies", "Pet Supplies"),
    ):
        categories.append({
            "id": ident,
            "name": name,
            "market": "US",
            "nodeIdPath": "1:2",
            "observedAt": AS_OF.isoformat(),
            "sampleSize": 100,
            "metrics": {"avgPriceUsd": 25.5, "avgRating": 4.2, "avgBsr": 1234, "newProductPercent": 8.5},
            "candidates": [{"asin": "B012345678", "title": "Synthetic test product", "priceUsd": 19.99, "rating": 4.1, "bsr": 123, "observedAt": AS_OF.isoformat()}],
            "sources": {"marketStats": DOCS + "amazon-market-statistics", "opportunitySearch": DOCS + "amazon-opportunity-search-by-metrics"},
            "limitations": "Synthetic fixture; never publish.",
        })
    return {
        "schemaVersion": 1,
        "status": "published",
        "asOf": AS_OF.isoformat(),
        "period": {"start": (AS_OF - timedelta(days=29)).isoformat(), "end": AS_OF.isoformat(), "timezone": "Asia/Shanghai"},
        "platform": {
            "activeUsersApprox": 100,
            "successfulCallsApprox": 1000,
            "topApis": [
                {"name": f"Synthetic API {i}", "successfulCallsApprox": n, "docsUrl": DOCS + "amazon-market-statistics"}
                for i, n in enumerate((300, 200, 150, 100, 50), 1)
            ],
            "source": "Synthetic admin report fixture",
            "methodology": "Test users excluded; successful calls only.",
        },
        "categories": categories,
        "keywordPoolDefinition": "Synthetic fixed seed list for tests only.",
        "keywords": [
            {"term": f"synthetic phrase {i}", "categoryId": "home-kitchen", "monthlySearchVolumeEstimate": 1000 - i * 10, "observedAt": AS_OF.isoformat(), "market": "US", "language": "en", "source": DOCS + "seo-keyword-metrics"}
            for i in range(10)
        ],
        "trends": [],
        "history": [],
    }


class ValidateMarketInsightsTest(unittest.TestCase):
    def test_complete_snapshot(self):
        validate(valid_snapshot())

    def test_waiting_snapshot_is_empty(self):
        validate({"schemaVersion": 1, "status": "awaiting_verified_data", "asOf": None, "period": None, "platform": None, "categories": [], "keywordPoolDefinition": None, "keywords": [], "trends": [], "history": []})

    def test_missing_field_fails(self):
        data = valid_snapshot()
        del data["platform"]["source"]
        with self.assertRaises(SnapshotError):
            validate(data)

    def test_stale_snapshot_is_allowed_with_visible_date(self):
        data = valid_snapshot()
        stale = (TODAY - timedelta(days=90)).isoformat()
        data["asOf"] = stale
        data["period"] = {"start": (TODAY - timedelta(days=119)).isoformat(), "end": stale, "timezone": "Asia/Shanghai"}
        for category in data["categories"]:
            category["observedAt"] = stale
            for candidate in category["candidates"]:
                candidate["observedAt"] = stale
        for keyword in data["keywords"]:
            keyword["observedAt"] = stale
        validate(data)

    def test_empty_results_fail(self):
        for field in ("categories", "keywords"):
            with self.subTest(field=field):
                data = valid_snapshot()
                data[field] = []
                with self.assertRaises(SnapshotError):
                    validate(data)

    def test_anomalous_value_or_rank_fails(self):
        changes = (
            lambda d: d["categories"][0]["metrics"].update(avgRating=7),
            lambda d: d["keywords"][0].update(monthlySearchVolumeEstimate=-1),
            lambda d: d["keywords"].reverse(),
            lambda d: d["period"].update(end=(AS_OF - timedelta(days=1)).isoformat()),
        )
        for change in changes:
            with self.subTest(change=change):
                data = valid_snapshot()
                change(data)
                with self.assertRaises(SnapshotError):
                    validate(data)

    def test_private_fields_and_email_fail(self):
        for mutation in (
            lambda d: d["platform"].update(userId="123"),
            lambda d: d["categories"][0]["candidates"][0].update(title="contact@example.com"),
            lambda d: d["platform"].update(source="Bearer abcdefgh12345"),
        ):
            with self.subTest(mutation=mutation):
                data = valid_snapshot()
                mutation(data)
                with self.assertRaises(SnapshotError):
                    validate(data)


if __name__ == "__main__":
    unittest.main()
