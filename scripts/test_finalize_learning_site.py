from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
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
    def test_dates_remain_stable_when_rebuilding(self):
        first = ET.tostring(self.run_finalize().getroot())
        second = ET.tostring(self.run_finalize().getroot())
        self.assertEqual(first, second)
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
