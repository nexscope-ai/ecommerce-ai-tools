from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
import json
from tempfile import TemporaryDirectory
import unittest
import xml.etree.ElementTree as ET
from scripts.finalize_learning_site import finalize, NS, ORIGIN, BASE

class CanonicalSitemapTests(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.directory = Path(self.temp.name)
        for topic in ('research', 'visibility', 'sourcing', 'agents', 'creative', 'evidence'):
            self.page(f'topics/{topic}/')
    def tearDown(self): self.temp.cleanup()
    def page(self, route, head='', body=''):
        directory = self.directory / route
        directory.mkdir(parents=True, exist_ok=True)
        (directory / 'index.html').write_text(f'<html><head><link rel="canonical" href="{ORIGIN}{BASE}/{route}">{head}</head><body><h1>Test</h1>{body}</body></html>', encoding='utf-8')
    def run_finalize(self):
        with redirect_stdout(StringIO()): finalize(self.directory)
        return ET.parse(self.directory / 'sitemap.xml')
    def test_private_redirect_and_assets_are_excluded(self):
        self.page('private/', '<meta name="robots" content="noindex,nofollow">')
        self.page('redirect/', '<meta http-equiv="refresh" content="0;url=/">')
        (self.directory / 'asset.js').write_text('/* asset */', encoding='utf-8')
        tree = self.run_finalize()
        self.assertEqual(len(tree.findall(f'{{{NS}}}url')), 6)
    def test_broken_internal_link_fails_the_build(self):
        self.page('broken/', body=f'<a href="{BASE}/missing/">Missing</a>')
        with self.assertRaisesRegex(SystemExit, 'Broken local link'): self.run_finalize()
    def test_product_detail_reuses_published_gallery_header_and_assets(self):
        assets = self.directory / 'assets'
        assets.mkdir()
        for filename in ('primary-navigation.css', 'trends.js'):
            (assets / filename).touch()
        head = (
            f'<link rel="stylesheet" href="{BASE}/assets/primary-navigation.css?v=8">'
            f'<script src="{BASE}/assets/trends.js?v=20" defer></script>'
        )
        header = (
            '<header class="trends-header"><nav>'
            f'<a href="{BASE}/product-showcase/" aria-current="page">Product Gallery</a>'
            '</nav></header>'
        )
        self.page('product-showcase/', head=head, body=header)
        route = 'product-showcase/product/example/'
        self.page(route, body='<!-- shared Learn navigation -->')

        self.run_finalize()

        html = (self.directory / route / 'index.html').read_text(encoding='utf-8')
        self.assertIn(header.replace('aria-current="page"', 'aria-current="location"'), html)
        self.assertIn('primary-navigation.css?v=8', html)
        self.assertIn('trends.js?v=20', html)
    def test_dates_remain_stable_when_rebuilding(self):
        first = ET.tostring(self.run_finalize().getroot())
        second = ET.tostring(self.run_finalize().getroot())
        self.assertEqual(first, second)
    def test_image_sitemap_contains_page_images_instead_of_an_index(self):
        self.page('illustrated/', '<meta property="og:image" content="https://example.com/product.webp">')
        self.page('generic/', '<meta property="og:image" content="https://learn.nexscope.ai/og-default.png">')
        self.run_finalize()
        root = ET.parse(self.directory / 'image-sitemap.xml').getroot()
        self.assertEqual(root.tag, f'{{{NS}}}urlset')
        urls = root.findall(f'{{{NS}}}url')
        self.assertEqual(len(urls), 1)
        self.assertEqual(urls[0].findtext(f'{{{NS}}}loc'), f'{ORIGIN}{BASE}/illustrated/')
    def api_snapshot(self):
        path = self.directory / 'contract.json'
        path.write_text(json.dumps({'generatedAt': '2026-10-28T09:45:47.193Z', 'entries': [{'slug': 'example-api'}]}), encoding='utf-8')
        return path
    def test_api_pages_match_current_contract_and_use_its_publication_date(self):
        for route in ('api/', 'api/quickstart/', 'api/example-api/'): self.page(route)
        finalize(self.directory, api_snapshot=self.api_snapshot())
        tree = ET.parse(self.directory / 'sitemap.xml')
        api_urls = [node for node in tree.findall(f'{{{NS}}}url') if '/api/' in node.findtext(f'{{{NS}}}loc')]
        self.assertEqual(len(api_urls), 3)
        self.assertTrue(all(node.findtext(f'{{{NS}}}lastmod') == '2026-10-28T09:45:47.193Z' for node in api_urls))
    def test_missing_or_stale_api_page_blocks_deployment(self):
        for route in ('api/', 'api/quickstart/', 'api/retired-api/'): self.page(route)
        with self.assertRaisesRegex(SystemExit, 'Missing API sitemap page'):
            finalize(self.directory, api_snapshot=self.api_snapshot())
        self.page('api/example-api/')
        with self.assertRaisesRegex(SystemExit, 'Stale API sitemap page'):
            finalize(self.directory, api_snapshot=self.api_snapshot())
    def test_missing_srcset_url_fails_the_build(self):
        self.page('broken-image/', body='<img srcset="720w, /ecommerce-ai-tools/large.webp 1440w">')
        with self.assertRaisesRegex(SystemExit, 'Malformed srcset: 720w'): self.run_finalize()
    def test_missing_srcset_file_fails_even_when_main_image_exists(self):
        (self.directory / 'large.webp').write_bytes(b'fixture')
        self.page('broken-image/', body='<img src="/ecommerce-ai-tools/large.webp" srcset="/ecommerce-ai-tools/missing.webp 720w, /ecommerce-ai-tools/large.webp 1440w">')
        with self.assertRaisesRegex(SystemExit, 'Missing img srcset'): self.run_finalize()
    def test_single_image_without_srcset_is_a_valid_fallback(self):
        (self.directory / 'image.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg"/>', encoding='utf-8')
        self.page('single-image/', body='<img src="/ecommerce-ai-tools/image.svg">')
        tree = self.run_finalize()
        self.assertEqual(len(tree.findall(f'{{{NS}}}url')), 7)

if __name__ == '__main__': unittest.main()
