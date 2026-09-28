import json
import tempfile
import unittest
from pathlib import Path

from scripts.generate_product_showcase_pages import BuildError, GENERATED_MARKER, generate


PUBLIC_UUID = "b05186f4-94f9-43d0-9fc7-931404589234"
DETAIL_URL = f"https://api-test.nexscope.ai/api/product-showcase/products/{PUBLIC_UUID}"
PRODUCT_TEMPLATE = (
    Path(__file__).resolve().parent / "templates" / "product-showcase-product.html"
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
        target_template = root / "scripts" / "templates" / "product-showcase-product.html"
        target_template.parent.mkdir(parents=True)
        target_template.write_text(PRODUCT_TEMPLATE.read_text(encoding="utf-8"), encoding="utf-8")
        return source

    def product(self, public_uuid: str = PUBLIC_UUID, name: str = "Static product") -> dict:
        return {
            "publicUuid": public_uuid,
            "slug": "static-product",
            "productName": name,
            "productDetails": "## Product benefits\n\nA **useful** product for daily workflows.",
            "productUrl": "https://shop.example.com/static-product",
            "imageUrls": [
                "https://cdn.example.com/product.webp",
                "https://cdn.example.com/product-side.webp",
            ],
            "videoUrl": "https://cdn.example.com/product.mp4",
            "publishedAt": 1790566911000,
            "seoConfig": {
                "title": "SEO title for static product",
                "description": "A focused product description for search and AI discovery.",
                "keywords": ["static product", "workflow product"],
                "schema": {
                    "@type": "Product",
                    "brand": {"@type": "Brand", "name": "Example Brand"},
                },
                "geo": {"answerSummary": "A product for daily workflows."},
            },
        }

    def list_loader(self, products: list[dict]):
        return lambda _url: {"code": 0, "data": {"enabled": True, "products": products}}

    def test_generates_complete_static_html_and_manifest_from_json(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            stale = source / "product-showcase" / "product" / "11111111-1111-4111-8111-111111111111"
            stale.mkdir(parents=True)
            (stale / "index.html").write_text(GENERATED_MARKER, encoding="utf-8")
            product = self.product()

            def detail_loader(url):
                self.assertEqual(DETAIL_URL, url)
                return {"code": 0, "data": product}

            self.assertEqual(1, generate(source, self.list_loader([product]), detail_loader))
            output = source / "product-showcase" / "product" / PUBLIC_UUID / "index.html"
            html = output.read_text(encoding="utf-8")
            canonical = (
                "https://learn.nexscope.ai/ecommerce-ai-tools/"
                f"product-showcase/product/{PUBLIC_UUID}/"
            )
            self.assertIn(GENERATED_MARKER, html)
            self.assertIn(canonical, html)
            self.assertIn("<title>SEO title for static product | Nexscope Product Gallery</title>", html)
            self.assertIn('<meta name="keywords" content="static product, workflow product">', html)
            self.assertIn("<h3>Product benefits</h3>", html)
            self.assertIn("<strong>useful</strong>", html)
            self.assertIn('"@type":"Product"', html)
            self.assertIn('"brand":{"@type":"Brand","name":"Example Brand"}', html)
            self.assertIn('"@type":"VideoObject"', html)
            self.assertIn("product-side.webp", html)
            self.assertNotIn("{{", html)
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

            count = generate(
                source,
                lambda _url: {"code": 0, "data": {"enabled": False, "products": []}},
                lambda url: calls.append(url),
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

    def test_skips_a_product_without_an_online_publication_timestamp(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            product = self.product()
            product["publishedAt"] = 0
            detail_calls = []
            self.assertEqual(
                0,
                generate(
                    source,
                    self.list_loader([product]),
                    lambda url: detail_calls.append(url),
                ),
            )
            self.assertEqual([], detail_calls)
            self.assertFalse((source / "product-showcase" / "product" / PUBLIC_UUID).exists())

    def test_skips_only_the_product_whose_detail_request_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            failed_uuid = "11111111-1111-4111-8111-111111111111"
            failed_page = source / "product-showcase" / "product" / failed_uuid
            failed_page.mkdir(parents=True)
            (failed_page / "index.html").write_text(GENERATED_MARKER, encoding="utf-8")
            valid = self.product()
            failed = self.product(failed_uuid, "Broken product")

            def detail_loader(url):
                if failed_uuid in url:
                    raise BuildError("detail endpoint returned HTTP 503")
                return {"code": 0, "data": valid}

            self.assertEqual(
                1,
                generate(source, self.list_loader([valid, failed]), detail_loader),
            )
            self.assertTrue(
                (source / "product-showcase" / "product" / PUBLIC_UUID / "index.html").exists()
            )
            self.assertFalse(failed_page.exists())
            manifest = json.loads(
                (source / "_data" / "product_showcase_pages.json").read_text(encoding="utf-8")
            )
            self.assertEqual([PUBLIC_UUID], [item["publicUuid"] for item in manifest])

    def test_skips_an_invalid_json_detail_response(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            product = self.product()
            self.assertEqual(
                0,
                generate(
                    source,
                    self.list_loader([product]),
                    lambda _url: {"code": 503, "data": None},
                ),
            )
            self.assertFalse((source / "product-showcase" / "product" / PUBLIC_UUID).exists())
            manifest = json.loads(
                (source / "_data" / "product_showcase_pages.json").read_text(encoding="utf-8")
            )
            self.assertEqual([], manifest)

    def test_escapes_user_content_in_html_and_json_ld(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            product = self.product(name="Safe & Useful")
            product["productDetails"] = "A product with <script>alert(1)</script> details."
            product["seoConfig"]["title"] = "</script><script>alert(1)</script>"

            self.assertEqual(
                1,
                generate(
                    source,
                    self.list_loader([product]),
                    lambda _url: {"code": 0, "data": product},
                ),
            )
            html = (
                source / "product-showcase" / "product" / PUBLIC_UUID / "index.html"
            ).read_text(encoding="utf-8")
            self.assertIn("&lt;script&gt;alert(1)&lt;/script&gt;", html)
            self.assertIn("\\u003c/script\\u003e", html)
            self.assertNotIn("<script>alert(1)</script>", html)


if __name__ == "__main__":
    unittest.main()
