"""Build canonical-only sitemaps and audit the rendered learning architecture."""
from __future__ import annotations
import argparse
import json
from collections import Counter
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

ORIGIN = 'https://learn.nexscope.ai'
BASE = '/ecommerce-ai-tools'
NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
IMAGE_NS = 'http://www.google.com/schemas/sitemap-image/1.1'
ET.register_namespace('', NS)
ET.register_namespace('image', IMAGE_NS)

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.canonical = ''
        self.robots = ''
        self.redirect = False
        self.links = []
        self.images = []
        self.dates = []
        self.h1_count = 0
        self.jsonld = []
        self.script_type = ''
        self.script_text = ''
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'link' and a.get('rel') == 'canonical': self.canonical = a.get('href', '')
        if tag == 'meta':
            if a.get('name', '').lower() in ('robots', 'googlebot'): self.robots += a.get('content', '').lower()
            if a.get('http-equiv', '').lower() == 'refresh': self.redirect = True
            if a.get('property') == 'article:modified_time': self.dates.append(a.get('content', ''))
            if a.get('property') == 'og:image': self.images.append(a.get('content', ''))
        if tag == 'a': self.links.append(a.get('href', ''))
        if tag == 'h1': self.h1_count += 1
        if tag == 'script':
            self.script_type = a.get('type', '')
            self.script_text = ''
    def handle_data(self, data):
        if self.script_type == 'application/ld+json': self.script_text += data
    def handle_endtag(self, tag):
        if tag == 'script':
            if self.script_type == 'application/ld+json': self.jsonld.append(json.loads(self.script_text))
            self.script_type = ''

def finalize(directory, root_site=None):
    directory = Path(directory)
    old_dates = {}
    old_sitemap = directory / 'sitemap.xml'
    if old_sitemap.exists():
        tree = ET.parse(old_sitemap)
        for entry in tree.findall(f'{{{NS}}}url'):
            old_dates[entry.findtext(f'{{{NS}}}loc')] = entry.findtext(f'{{{NS}}}lastmod', '')
    sitemap = ET.Element(f'{{{NS}}}urlset')
    pages = {}
    excluded = Counter()
    errors = []
    for path in sorted(directory.rglob('*.html')):
        relative = path.relative_to(directory).as_posix()
        page = Page(path.read_text(encoding='utf-8'))
        if relative == '404.html' or page.redirect or 'noindex' in page.robots:
            excluded['redirect/private/noindex'] += 1
            continue
        if not page.canonical:
            excluded['non-content/verification'] += 1
            continue
        canonical = urlsplit(page.canonical)
        expected_path = BASE + '/' + (relative[:-10] if relative.endswith('index.html') else relative)
        if canonical.scheme != 'https' or canonical.netloc != 'learn.nexscope.ai' or canonical.query or canonical.fragment:
            errors.append(f'Invalid canonical: {relative}: {page.canonical}')
            continue
        if canonical.path != expected_path:
            excluded['canonical-alias'] += 1
            continue
        if page.canonical in pages:
            errors.append(f'Duplicate canonical: {page.canonical}')
            continue
        if page.h1_count != 1: errors.append(f'Expected one H1: {relative}: {page.h1_count}')
        nodes = [node for graph in page.jsonld for node in graph.get('@graph', [graph])]
        if any(node.get('@type') == 'Article' for node in nodes) and 'aria-label="Source and scope"' not in path.read_text(encoding='utf-8'):
            errors.append(f'Article missing evidence context: {relative}')
        pages[page.canonical] = page
        entry = ET.SubElement(sitemap, f'{{{NS}}}url')
        ET.SubElement(entry, f'{{{NS}}}loc').text = page.canonical
        dates = [old_dates.get(page.canonical, ''), *page.dates]
        # This fixed release changes navigation and evidence context, not editorial review dates.
        if 'product-showcase/product/' not in canonical.path: dates.append('2026-10-27')
        valid_dates = []
        for date in dates:
            if not date: continue
            try: datetime.fromisoformat(date.replace('Z', '+00:00'))
            except ValueError:
                errors.append(f'Invalid lastmod on {relative}: {date}')
                continue
            valid_dates.append(date)
        if valid_dates: ET.SubElement(entry, f'{{{NS}}}lastmod').text = max(valid_dates)
        for image in page.images[:1]:
            if image.startswith('https://'):
                node = ET.SubElement(entry, f'{{{IMAGE_NS}}}image')
                ET.SubElement(node, f'{{{IMAGE_NS}}}loc').text = image
    link_sources = dict(pages)
    if root_site:
        for path in Path(root_site).rglob('*.html'):
            page = Page(path.read_text(encoding='utf-8'))
            if page.canonical and not page.redirect and 'noindex' not in page.robots:
                link_sources[page.canonical] = page
    for canonical, page in link_sources.items():
        for href in page.links:
            parsed = urlsplit(href)
            if parsed.scheme not in ('', 'https', 'http') or parsed.netloc not in ('', 'learn.nexscope.ai'): continue
            if parsed.path.startswith(BASE + '/'):
                relative = unquote(parsed.path[len(BASE)+1:])
                target = directory / relative
            elif root_site and parsed.path.startswith('/'):
                target = Path(root_site) / unquote(parsed.path.lstrip('/'))
            else: continue
            if not (target.is_file() or (target / 'index.html').is_file()):
                errors.append(f'Broken local link: {canonical} -> {href}')
    for topic in ('research', 'visibility', 'sourcing', 'agents', 'creative', 'evidence'):
        if f'{ORIGIN}{BASE}/topics/{topic}/' not in pages: errors.append(f'Missing topic hub: {topic}')
    if errors: raise SystemExit('\n'.join(sorted(set(errors))))
    ET.indent(sitemap)
    ET.ElementTree(sitemap).write(old_sitemap, encoding='utf-8', xml_declaration=True)
    print(f'Canonical learning sitemap: {len(pages)} pages; excluded {dict(excluded)}. Internal links and six topic hubs verified.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('directory')
    parser.add_argument('--root-site')
    args = parser.parse_args()
    finalize(args.directory, args.root_site)
