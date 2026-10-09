"""Add Learn attribution to rendered links that leave for the Nexscope app.

Run after Jekyll builds the site, so links from Markdown, includes, and data
templates receive the same treatment without changing canonical or JSON-LD URLs.
"""

from __future__ import annotations

import argparse
import html
import re
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


ANCHOR_HREF = re.compile(
    r"(?P<prefix><a\b[^>]*?\bhref\s*=\s*)(?P<quote>['\"])(?P<href>.*?)(?P=quote)",
    re.IGNORECASE | re.DOTALL,
)
OFFICIAL_HOSTS = {"nexscope.ai", "www.nexscope.ai"}


def is_official_link(href: str) -> bool:
    parsed = urlsplit(html.unescape(href))
    return parsed.scheme == "https" and parsed.hostname in OFFICIAL_HOSTS


def attribute_url(href: str, page: Path, index: int) -> str:
    url = urlsplit(html.unescape(href))
    query = dict(parse_qsl(url.query, keep_blank_values=True))
    query["co-from"] = "learn"
    query["utm_source"] = "learn.nexscope.ai"
    query["utm_medium"] = "referral"
    query.setdefault("utm_campaign", "learning_center")
    page_name = "_".join(page.with_suffix("").parts).replace("_index", "") or "home"
    query.setdefault("utm_content", f"{page_name}_link_{index}")
    target = url._replace(query=urlencode(query), netloc="www.nexscope.ai")
    return html.escape(urlunsplit(target), quote=True)


def attribute_html(markup: str, page: Path) -> tuple[str, int]:
    count = 0

    def replace(match: re.Match[str]) -> str:
        nonlocal count
        href = match.group("href")
        if not is_official_link(href):
            return match.group(0)
        count += 1
        updated = attribute_url(href, page, count)
        return f'{match.group("prefix")}{match.group("quote")}{updated}{match.group("quote")}'

    return ANCHOR_HREF.sub(replace, markup), count


def process_site(site: Path) -> tuple[int, int]:
    pages = sorted(site.rglob("*.html"))
    if not pages:
        raise ValueError(f"No HTML pages found in {site}")
    changed_pages = 0
    attributed_links = 0
    for page in pages:
        original = page.read_text(encoding="utf-8")
        updated, count = attribute_html(original, page.relative_to(site))
        if updated != original:
            page.write_text(updated, encoding="utf-8")
            changed_pages += 1
        attributed_links += count
        for match in ANCHOR_HREF.finditer(updated):
            if not is_official_link(match.group("href")):
                continue
            query = dict(parse_qsl(urlsplit(html.unescape(match.group("href"))).query))
            if any(not query.get(key) for key in ("co-from", "utm_source", "utm_medium", "utm_campaign", "utm_content")):
                raise ValueError(f"Unattributed official link in {page}")
    return changed_pages, attributed_links


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("site", type=Path, help="Built Jekyll site directory")
    args = parser.parse_args()
    pages, links = process_site(args.site)
    print(f"Attributed {links} official links across {pages} built HTML pages.")


if __name__ == "__main__":
    main()
