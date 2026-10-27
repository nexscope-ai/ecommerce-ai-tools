"""Audit both Learn builds, optionally checking each unique image over public HTTP."""
import argparse
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import sys
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.finalize_learning_site import Page, resource_errors, BASE, ORIGIN

def audit(library, root_site, network=False):
    issues = []
    image_urls = defaultdict(set)
    page_count = 0
    pages_with_srcset_issues = set()
    for directory, prefix in ((Path(library), BASE), (Path(root_site), '')):
        for path in sorted(directory.rglob('*.html')):
            relative = path.relative_to(directory).as_posix()
            route = prefix + '/' + (relative[:-10] if relative.endswith('index.html') else relative)
            canonical = ORIGIN + route
            page = Page(path.read_text(encoding='utf-8'))
            if page.redirect: continue
            page_count += 1
            issues.extend(resource_errors(page, canonical, library, root_site))
            if page.resource_errors: pages_with_srcset_issues.add(canonical)
            for kind, href in page.resources:
                if kind.startswith(('img ', 'source ', 'video poster', 'social image')):
                    url = urljoin(canonical, href)
                    if urlsplit(url).scheme in ('http', 'https'): image_urls[url].add(canonical)
    http_results = []
    if network:
        def check(url):
            try:
                with urlopen(Request(url, method='HEAD', headers={'User-Agent':'NexscopeResourceAudit/1.0'}), timeout=20) as response:
                    status, content_type = response.status, response.headers.get('Content-Type', '')
                ok = status == 200 and (content_type.startswith(('image/', 'video/')) or url.endswith('.svg'))
                return {'url': url, 'status': status, 'type': content_type, 'ok': ok}
            except HTTPError as error: return {'url': url, 'status': error.code, 'ok': False}
            except (URLError, TimeoutError, OSError) as error: return {'url': url, 'error': str(error), 'ok': False}
        with ThreadPoolExecutor(max_workers=8) as pool: http_results = list(pool.map(check, sorted(image_urls)))
    return {'pages_checked': page_count, 'unique_image_urls': len(image_urls), 'pages_with_srcset_issues': sorted(pages_with_srcset_issues), 'local_issues': sorted(set(issues)), 'http_results': http_results, 'http_failures': [r for r in http_results if not r['ok']]}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('library')
    parser.add_argument('root_site')
    parser.add_argument('--network', action='store_true')
    parser.add_argument('--report', required=True)
    args = parser.parse_args()
    report = audit(args.library, args.root_site, args.network)
    Path(args.report).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({key: value for key, value in report.items() if key != 'http_results'}, ensure_ascii=False, indent=2))
