"""Checks for the rendered outbound-link attribution pass."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from scripts.attribute_outbound_links import attribute_html, process_site


class AttributionTests(unittest.TestCase):
    def test_only_official_anchors_change_and_fragments_survive(self) -> None:
        source = (
            '<link rel="canonical" href="https://www.nexscope.ai/api-docs">'
            '<script type="application/ld+json">{"url":"https://www.nexscope.ai/"}</script>'
            '<a href="https://www.nexscope.ai/api-docs?view=api&amp;utm_campaign=guide#online-test">Docs</a>'
            '<a href="https://learn.nexscope.ai/tools/">Tools</a>'
        )
        result, count = attribute_html(source, Path("guides/example/index.html"))
        self.assertEqual(count, 1)
        self.assertIn('href="https://www.nexscope.ai/api-docs">', result)
        self.assertIn('"url":"https://www.nexscope.ai/"', result)
        self.assertIn("view=api&amp;utm_campaign=guide", result)
        self.assertIn("co-from=learn", result)
        self.assertIn("utm_source=learn.nexscope.ai", result)
        self.assertIn("utm_content=guides_example_link_1", result)
        self.assertIn("#online-test", result)
        self.assertIn('href="https://learn.nexscope.ai/tools/"', result)
        self.assertEqual(attribute_html(result, Path("guides/example/index.html"))[0], result)

    def test_process_site_includes_tool_and_article_pages(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in ("tools/index.html", "amazon-guide/index.html"):
                page = root / name
                page.parent.mkdir(parents=True)
                page.write_text('<a href="https://nexscope.ai/tools/ai-video-generator">Open</a>', encoding="utf-8")
            pages, links = process_site(root)
            self.assertEqual((pages, links), (2, 2))
            for page in root.rglob("*.html"):
                self.assertIn("co-from=learn", page.read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
