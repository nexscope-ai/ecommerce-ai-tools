import json
import tempfile
import unittest
from pathlib import Path

from scripts.generate_product_showcase_pages import BuildError, GENERATED_MARKER, generate


PUBLIC_UUID = "b05186f4-94f9-43d0-9fc7-931404589234"
SOURCE_URL = (
    "https://api-test.nexscope.ai/ecommerce-ai-tools/"
    f"product-showcase/product/{PUBLIC_UUID}"
)


class GenerateProductShowcasePagesTest(unittest.TestCase):
    def source(self, root: Path) -> Path:
        source = root / "docs"
        source.mkdir()
        (source / "_config.yml").write_text(
            "url: https://learn.nexscope.ai\n"
            "baseurl: /ecommerce-ai-tools\n"
            "product_showcase_api_base: https://api-test.nexscope.ai/api/product-showcase\n",
            encoding="utf-8",
        )
        return source

    def test_generates_complete_static_html_and_manifest(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            stale = source / "product-showcase" / "product" / "11111111-1111-4111-8111-111111111111"
            stale.mkdir(parents=True)
            (stale / "index.html").write_text(GENERATED_MARKER, encoding="utf-8")

            product = {
                "publicUuid": PUBLIC_UUID,
                "productName": "Static product",
                "imageUrls": ["https://cdn.example.com/product.webp"],
                "publishedAt": 1790566911000,
            }

            def json_loader(_url):
                return {"code": 0, "data": {"enabled": True, "products": [product]}}

            def html_loader(url):
                self.assertEqual(SOURCE_URL, url)
                return (
                    "<!doctype html><html><head>"
                    f'<link rel="canonical" href="{SOURCE_URL}">'
                    f'<script type="application/ld+json">{{"url":"{SOURCE_URL}"}}</script>'
                    "</head><body>Static product</body></html>"
                )

            self.assertEqual(1, generate(source, json_loader, html_loader))
            output = source / "product-showcase" / "product" / PUBLIC_UUID / "index.html"
            html = output.read_text(encoding="utf-8")
            canonical = (
                "https://learn.nexscope.ai/ecommerce-ai-tools/"
                f"product-showcase/product/{PUBLIC_UUID}/"
            )
            self.assertIn(GENERATED_MARKER, html)
            self.assertIn(canonical, html)
            self.assertNotIn(SOURCE_URL, html)
            self.assertFalse(stale.exists())

            manifest = json.loads(
                (source / "_data" / "product_showcase_pages.json").read_text(encoding="utf-8")
            )
            self.assertEqual(f"/product-showcase/product/{PUBLIC_UUID}/", manifest[0]["path"])
            self.assertEqual("Static product", manifest[0]["title"])
            self.assertEqual("https://cdn.example.com/product.webp", manifest[0]["image"])

    def test_disabled_public_gallery_generates_no_product_pages(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            calls = []

            def html_loader(url):
                calls.append(url)
                return ""

            count = generate(
                source,
                lambda _url: {"code": 0, "data": {"enabled": False, "products": []}},
                html_loader,
            )
            self.assertEqual(0, count)
            self.assertEqual([], calls)
            self.assertFalse((source / "product-showcase" / "product").exists())
            manifest = json.loads(
                (source / "_data" / "product_showcase_pages.json").read_text(encoding="utf-8")
            )
            self.assertEqual([], manifest)

    def test_sitemap_templates_read_the_generated_manifest(self):
        docs = Path(__file__).resolve().parents[1] / "docs"
        for filename in ("sitemap.xml", "image-sitemap.xml"):
            template = (docs / filename).read_text(encoding="utf-8")
            self.assertIn("site.data.product_showcase_pages", template)

    def test_refuses_a_product_without_an_online_publication_timestamp(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            product = {
                "publicUuid": PUBLIC_UUID,
                "productName": "Not published",
                "imageUrls": [],
                "publishedAt": 0,
            }
            with self.assertRaises(BuildError):
                generate(
                    source,
                    lambda _url: {
                        "code": 0,
                        "data": {"enabled": True, "products": [product]},
                    },
                    lambda _url: "<!doctype html><html></html>",
                )


if __name__ == "__main__":
    unittest.main()
