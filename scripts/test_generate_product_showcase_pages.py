import json
import re
import tempfile
import unittest
from pathlib import Path

from scripts.generate_product_showcase_pages import BuildError, GENERATED_MARKER, generate


PUBLIC_UUID = "b05186f4-94f9-43d0-9fc7-931404589234"
DETAIL_URL = f"https://api.nexscope.ai/api/product-showcase/products/{PUBLIC_UUID}"
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
            "product_showcase_api_base: https://api.nexscope.ai/api/product-showcase\n",
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
                "robots": "index,follow,max-image-preview:large",
                "author": "Nexscope Editorial",
                "themeColor": "#6550f2",
                "language": "en-US",
                "canonicalUrl": "https://spam.example.com/not-the-product",
                "openGraph": {
                    "title": "Open Graph product title",
                    "description": "Open Graph product description.",
                    "image": "https://cdn.example.com/social-product.webp",
                    "imageAlt": "Static product social preview",
                },
                "twitter": {
                    "card": "summary_large_image",
                    "title": "Twitter product title",
                    "description": "Twitter product description.",
                    "site": "@nexscope_ai",
                },
                "alternates": {
                    "en": "https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/",
                },
                "schema": {
                    "@type": "Product",
                    "name": "This must not replace the public product name",
                    "brand": {"@type": "Brand", "name": "Example Brand"},
                },
                "geo": {
                    "answerSummary": "A product for daily workflows.",
                    "schema": {
                        "@type": "Thing",
                        "@id": "https://learn.nexscope.ai/#workflow-product",
                        "name": "Workflow product",
                    },
                },
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
            self.assertIn('<html lang="en-US">', html)
            self.assertIn(
                '<meta name="robots" content="index,follow,max-image-preview:large">',
                html,
            )
            self.assertIn('<meta name="author" content="Nexscope Editorial">', html)
            self.assertIn('<meta name="theme-color" content="#6550f2">', html)
            self.assertIn(
                '<meta property="og:title" content="Open Graph product title">',
                html,
            )
            self.assertIn(
                '<meta name="twitter:title" content="Twitter product title">',
                html,
            )
            self.assertIn('<meta name="twitter:site" content="@nexscope_ai">', html)
            self.assertIn(
                '<link rel="alternate" hreflang="en" '
                'href="https://learn.nexscope.ai/ecommerce-ai-tools/product-showcase/">',
                html,
            )
            self.assertNotIn(
                '<link rel="canonical" href="https://spam.example.com/not-the-product">',
                html,
            )
            self.assertIn("<h3>Product benefits</h3>", html)
            self.assertIn("<strong>useful</strong>", html)
            self.assertIn('"@type":"Product"', html)
            self.assertIn('"brand":{"@type":"Brand","name":"Example Brand"}', html)
            self.assertIn(
                '"@type":"Thing","@id":"https://learn.nexscope.ai/#workflow-product",'
                '"name":"Workflow product"',
                html,
            )
            self.assertIn(
                '<script type="application/json" id="nexscope-product-seo-config">',
                html,
            )
            self.assertIn('"answerSummary":"A product for daily workflows."', html)
            json_ld_match = re.search(
                r'<script type="application/ld\+json">(.*?)</script>', html
            )
            self.assertIsNotNone(json_ld_match)
            graph = json.loads(json_ld_match.group(1))["@graph"]
            product_schema = next(node for node in graph if node.get("@type") == "Product")
            self.assertEqual("Static product", product_schema["name"])
            self.assertIn('"@type":"VideoObject"', html)
            self.assertIn("product-side.webp", html)
            self.assertIn('<nav class="listing-tabs" aria-label="On this page">', html)
            self.assertIn('href="#product-media">Images</a>', html)
            self.assertIn('href="#product-overview-title">Overview</a>', html)
            self.assertIn('href="#product-video-title">Video</a>', html)
            self.assertIn('class="listing-layout"', html)
            self.assertIn('class="product-sidebar"', html)
            self.assertIn('aria-label="Open product image 2 in a new tab"', html)
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

    def test_rebuild_replaces_all_old_product_pages_and_manifest_entries(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            old_uuid = "11111111-1111-4111-8111-111111111111"
            old_product = source / "product-showcase" / "product" / old_uuid
            old_product.mkdir(parents=True)
            (old_product / "index.html").write_text(
                "<!doctype html><title>Old unmarked product</title>",
                encoding="utf-8",
            )
            legacy_product = source / "product-showcase" / "product" / "legacy-product"
            legacy_product.mkdir(parents=True)
            (legacy_product / "index.html").write_text("legacy", encoding="utf-8")
            manifest_path = source / "_data" / "product_showcase_pages.json"
            manifest_path.parent.mkdir(parents=True)
            manifest_path.write_text(
                json.dumps([{"publicUuid": old_uuid, "path": f"/old/{old_uuid}/"}]),
                encoding="utf-8",
            )
            product = self.product()

            self.assertEqual(
                1,
                generate(
                    source,
                    self.list_loader([product]),
                    lambda _url: {"code": 0, "data": product},
                ),
            )

            product_root = source / "product-showcase" / "product"
            self.assertFalse((product_root / old_uuid).exists())
            self.assertFalse((product_root / "legacy-product").exists())
            self.assertTrue((product_root / PUBLIC_UUID / "index.html").is_file())
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            self.assertEqual([PUBLIC_UUID], [item["publicUuid"] for item in manifest])

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

    def test_accepts_a_serialized_long_publication_timestamp(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            summary = self.product()
            detail = self.product()
            summary["publishedAt"] = "1790566911000"
            detail["publishedAt"] = "1790566911000"

            self.assertEqual(
                1,
                generate(
                    source,
                    self.list_loader([summary]),
                    lambda _url: {"code": 0, "data": detail},
                ),
            )

            output = source / "product-showcase" / "product" / PUBLIC_UUID / "index.html"
            self.assertTrue(output.is_file())
            manifest = json.loads(
                (source / "_data" / "product_showcase_pages.json").read_text(encoding="utf-8")
            )
            self.assertEqual("2026-09-28T03:41:51Z", manifest[0]["lastModified"])

    def test_missing_seo_description_does_not_reuse_product_details(self):
        with tempfile.TemporaryDirectory() as directory:
            source = self.source(Path(directory))
            product = self.product()
            product["productDetails"] = "Private product body used only in the overview."
            product["seoConfig"].pop("description")
            product["seoConfig"]["openGraph"].pop("description")
            product["seoConfig"]["twitter"].pop("description")

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
            fallback = "Explore Static product in the Nexscope Product Gallery."
            self.assertIn(f'<meta name="description" content="{fallback}">', html)
            self.assertIn(f'<meta property="og:description" content="{fallback}">', html)
            self.assertIn(f'<meta name="twitter:description" content="{fallback}">', html)
            self.assertNotIn(
                '<meta name="description" content="Private product body used only in the overview.">',
                html,
            )
            self.assertIn("Private product body used only in the overview.", html)

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
