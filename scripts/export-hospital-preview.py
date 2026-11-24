"""Freeze only the eight hospital review pages and their assets for mobile sharing."""
from pathlib import Path
from urllib.parse import urlsplit
import hashlib
import json
import re
import urllib.request
from html.parser import HTMLParser
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.hospital-preview-share' / 'public'
ORIGIN = 'http://127.0.0.1:18896'
PREFIX = '/hospital-marketing-preview'
SLUGS = ['', 'hospital-marketing', 'agency-selection', 'hospital-geo',
         'hospital-website', 'website-cost', 'foreign-patients', 'hospital-work']
ASSETS = {'/favicon.svg'}
CSS = {}
OUT.mkdir(parents=True, exist_ok=True)

class Inventory(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1 = 0
        self.robots = []
        self.attrs = {}

    def handle_starttag(self, tag, attrs):
        self.attrs = dict(attrs)
        if tag == 'h1':
            self.h1 += 1
        if tag == 'meta' and self.attrs.get('name') == 'robots':
            self.robots.append(self.attrs.get('content', ''))

def attributes(tag):
    parser = Inventory()
    parser.feed(tag)
    return parser.attrs

def rewrite_link(match):
    tag = match.group(0)
    attrs = attributes(tag)
    rel = attrs.get('rel', '').split()
    if attrs.get('as') == 'script' or 'modulepreload' in rel:
        return ''
    href = attrs.get('href', '')
    if 'stylesheet' in rel:
        assert href.startswith('/_next/static/css/'), href
        if href not in CSS:
            data = urllib.request.urlopen(ORIGIN + href, timeout=30).read().decode()
            data = re.sub(r'/\*[#@]\s*sourceMappingURL=.*?\*/', '', data, flags=re.S)
            name = '/assets/' + hashlib.sha256(data.encode()).hexdigest()[:12] + '.css'
            target = OUT / name.lstrip('/')
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(data)
            CSS[href] = name
        return '<link rel="stylesheet" href="' + escape(CSS[href], quote=True) + '">'
    if attrs.get('as') == 'image' and href.startswith('/'):
        ASSETS.add(href)
    return tag

def rewrite_back_button(match):
    tag, content = match.group(1), match.group(2)
    if 'hp-back' in attributes(tag).get('class', '').split():
        return '<a class="hp-back" data-preview-back="true" href="' + PREFIX + '">' + content + '</a>'
    return match.group(0)

for slug in SLUGS:
    route = PREFIX + ('/' + slug if slug else '')
    with urllib.request.urlopen(ORIGIN + route, timeout=30) as response:
        html = response.read().decode()
    inventory = Inventory()
    inventory.feed(html)
    assert inventory.h1 == 1, route
    assert any('noindex' in value for value in inventory.robots), route
    # This is our own known Next.js HTML, not a general third-party HTML transform.
    html = re.sub(r'<script\b[^>]*>.*?</script\s*>', '', html, flags=re.S | re.I)
    html = re.sub(r'<link\b[^>]*>', rewrite_link, html, flags=re.I)
    for img in re.findall(r'<img\b[^>]*>', html, flags=re.I):
        src = attributes(img).get('src', '')
        assert src.startswith('/logo-') or src.startswith('/news/'), src
        ASSETS.add(src)
    html = re.sub(r'(<button\b[^>]*>)(.*?)</button>', rewrite_back_button, html, flags=re.S | re.I)
    html = html.replace('</body>', '<script src="/assets/preview-nav.js" defer></script></body>')
    assert 'googletagmanager.com' not in html
    assert '__next_f' not in html and '/_next/' not in html
    target = OUT / route.lstrip('/') / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html)

for asset in ASSETS:
    path = urlsplit(asset).path
    assert '..' not in Path(path).parts
    source = ROOT / 'public' / path.lstrip('/')
    assert source.is_file(), path
    target = OUT / path.lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(source.read_bytes())

(OUT / 'assets/preview-nav.js').write_text('''document.addEventListener('click', function(event) {
  var link = event.target.closest('[data-preview-back]');
  if (!link) return;
  var prefix = location.origin + '/hospital-marketing-preview';
  if (document.referrer.startsWith(prefix) && document.referrer !== location.href && history.length > 1) {
    event.preventDefault(); history.back();
  }
});
''')
(OUT / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
print(json.dumps({'pages': len(SLUGS), 'output': str(OUT),
                  'css_files': len(set(CSS.values())), 'image_icon_assets': len(ASSETS),
                  'next_runtime_removed': True, 'api_routes_exported': 0}, ensure_ascii=False))
