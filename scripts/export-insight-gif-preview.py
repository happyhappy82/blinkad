"""Freeze the one reviewed Insights article and its assets for HTTPS sharing."""
from copy import deepcopy
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import urlopen
import hashlib
import json
import re

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.insight-gif-share' / 'public'
ORIGIN = 'http://127.0.0.1:18951'
SLUG = 'google-jidoeneun-naoneunde-mun-euiga-eobsdamyeon-eodibuteo-bolkka'
ARTICLE = '/blog/' + SLUG + '/'
OUT.mkdir(parents=True, exist_ok=True)

with urlopen(ORIGIN + ARTICLE, timeout=40) as response:
    soup = BeautifulSoup(response.read(), 'html.parser')
assert soup.select_one('#inquiry-gap-demo'), 'The GIF must be present before export'
title = soup.select_one('h1').get_text(' ', strip=True)

for node in soup.select('script, link[as="script"], link[rel="modulepreload"]'):
    node.decompose()

for node in soup.select('link[rel="stylesheet"]'):
    href = node['href']
    assert href.startswith('/_next/static/css/')
    with urlopen(ORIGIN + href, timeout=30) as response:
        css = response.read().decode()
    css = re.sub(r'/\*[#@]\s*sourceMappingURL=.*?\*/', '', css, flags=re.S)
    asset = '/assets/' + hashlib.sha256(css.encode()).hexdigest()[:12] + '.css'
    target = OUT / asset.lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(css)
    node['href'] = asset

for node in soup.select('link[rel="preload"]'):
    node.decompose()

robots = soup.select_one('meta[name="robots"]')
assert robots and 'noindex' in robots['content']

# Use an inert brand header; only the reviewed article is shared, not the app.
header = soup.select_one('nav:not([aria-label="검토 화면 이동"])')
assert header
header.clear()
brand = BeautifulSoup('''<div style="max-width:80rem;margin:auto;height:4rem;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem">
<a href="/blog/" aria-label="인사이트 검토 목록"><img src="/logo-white-nav.png" alt="BlinkAd" style="height:2rem;width:auto"></a>
<div style="display:flex;align-items:center;gap:1.25rem;font-size:.875rem"><a href="/blog/">인사이트</a><a href="https://www.blinkad.kr/" target="_blank" rel="noopener noreferrer">공식 사이트 ↗</a></div></div>''', 'html.parser')
header.append(brand)

navigation = soup.select_one('nav[aria-label="검토 화면 이동"]')
back = navigation.select_one('button')
back.name = 'a'
back.attrs.pop('type', None)
back['href'] = '/blog/'
back['data-preview-back'] = 'true'

for node in soup.select('a[href]'):
    href = node['href']
    parsed = urlsplit(href)
    if parsed.scheme or href.startswith('#'):
        continue
    if parsed.path.rstrip('/') == '/blog':
        node['href'] = '/blog/' + ('#' + parsed.fragment if parsed.fragment else '')
    elif parsed.path.rstrip('/') == ARTICLE.rstrip('/'):
        node['href'] = ARTICLE + ('#' + parsed.fragment if parsed.fragment else '')
    elif href.startswith('/'):
        node['href'] = 'https://www.blinkad.kr' + href
        node['target'] = '_blank'
        node['rel'] = ['noopener', 'noreferrer']

button = soup.select_one('#inquiry-gap-demo button')
button['data-preview-motion'] = 'true'
button['disabled'] = ''

for asset in ['/favicon.svg', '/logo-white-nav.png',
              '/media/insights/inquiry-gap.gif', '/media/insights/inquiry-gap.png']:
    source = ROOT / 'public' / asset.lstrip('/')
    target = OUT / asset.lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(source.read_bytes())

script = soup.new_tag('script', src='/assets/preview.js', defer='')
soup.body.append(script)
article_file = OUT / ARTICLE.lstrip('/') / 'index.html'
article_file.parent.mkdir(parents=True, exist_ok=True)
article_file.write_text(str(soup))

# A real, one-article index keeps back/list navigation within this review.
index = deepcopy(soup)
article = index.select_one('article')
article.clear()
index.select_one('title').string = '인사이트 검토 | BlinkAd'
heading = index.new_tag('h1')
heading['class'] = ['text-4xl', 'font-bold', 'mb-8']
heading.string = '인사이트 검토'
card = index.new_tag('a', href=ARTICLE)
card['style'] = 'display:block;padding:1.5rem;border:1px solid #374151;border-radius:1rem;line-height:1.6;max-width:48rem'
card.string = title
wrap = index.new_tag('div')
wrap['class'] = ['max-w-3xl', 'mx-auto']
wrap.extend([heading, card])
article.append(wrap)
target = OUT / 'blog/index.html'
target.parent.mkdir(exist_ok=True)
target.write_text(str(index))

(OUT / 'assets/preview.js').write_text('''(() => {
  const figure = document.getElementById('inquiry-gap-demo');
  if (figure) {
    const image = figure.querySelector('img');
    const button = figure.querySelector('[data-preview-motion]');
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let playing = !preference.matches;
    const render = () => {
      image.src = '/media/insights/inquiry-gap.' + (playing ? 'gif' : 'png');
      button.textContent = playing ? '움직임 멈추기' : '움직임 재생';
      button.setAttribute('aria-label', playing ? '흐름도 움직임 멈추기' : '흐름도 움직임 재생');
      button.disabled = false;
    };
    button.addEventListener('click', () => { playing = !playing; render(); });
    preference.addEventListener('change', () => { playing = !preference.matches; render(); });
    render();
  }
  document.querySelectorAll('[data-preview-back]').forEach(link => {
    link.addEventListener('click', event => {
      if (!document.referrer) return;
      const referrer = new URL(document.referrer);
      if (referrer.origin === location.origin && referrer.pathname.startsWith('/blog/') && referrer.href !== location.href && history.length > 1) {
        event.preventDefault();
        location.assign(referrer.href);
      }
    });
  });
})();
''')
(OUT / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
for path in [article_file, target]:
    html = path.read_text()
    assert '__next_f' not in html and '/_next/' not in html
    assert 'googletagmanager.com' not in html and '<form' not in html
    assert len(BeautifulSoup(html, 'html.parser').select('h1')) == 1
print(json.dumps({'output': str(OUT), 'pages': 2, 'article': ARTICLE,
                  'api_routes': 0, 'next_runtime': False}, ensure_ascii=False))
