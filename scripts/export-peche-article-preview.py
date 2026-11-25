"""Export the reviewed article and only its public assets for mobile sharing."""
from pathlib import Path
from urllib.parse import urlsplit
import hashlib
import re
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / '.peche-article-share/public'
ORIGIN = 'http://127.0.0.1:18951'
SLUG = 'hospital-website-content-structure'
ARTICLE = '/blog/' + SLUG + '/'
MEDIA = '/media/insights/peche-clinic-navigation'
session = requests.Session()
response = session.get(ORIGIN + ARTICLE, timeout=90)
response.raise_for_status()
soup = BeautifulSoup(response.text, 'html.parser')
assert len(soup.select('#clinic-navigation-demo')) == 1
title = soup.h1.get_text(' ', strip=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

for node in soup.select('script, noscript, iframe, link[as="script"], link[rel="modulepreload"], link[rel="preload"], link[href*="googletagmanager.com"]'):
    node.decompose()
for node in soup.select('link[rel="stylesheet"]'):
    href = node['href']
    assert href.startswith('/_next/static/css/')
    result = session.get(ORIGIN + href, timeout=30)
    result.raise_for_status()
    css = re.sub(r'/\*[#@]\s*sourceMappingURL=.*?\*/', '', result.text, flags=re.S)
    asset = '/assets/' + hashlib.sha256(css.encode()).hexdigest()[:12] + '.css'
    target = PUBLIC / asset.lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(css)
    node['href'] = asset

robots = soup.select_one('meta[name="robots"]')
if not robots:
    robots = soup.new_tag('meta', attrs={'name': 'robots'})
    soup.head.append(robots)
robots['content'] = 'noindex,nofollow,noarchive'
soup.title.string = '본문 검토 | ' + title
header = soup.select_one('nav')
assert header
header.clear()
header.append(BeautifulSoup('''<div style="max-width:80rem;margin:auto;height:4rem;padding:0 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem">
<a href="/blog/" aria-label="인사이트 검토 목록"><img src="/logo-white-nav.png" alt="BlinkAd" style="height:2rem;width:auto"></a>
<a href="/blog/" style="font-size:.875rem;color:#cbd5e1">본문 검토 목록</a></div>''', 'html.parser'))

for link in soup.select('a[href]'):
    href = link['href']
    parsed = urlsplit(href)
    if parsed.scheme or href.startswith('#'):
        continue
    if parsed.path.rstrip('/') == '/blog':
        link['href'] = '/blog/'
    elif parsed.path.rstrip('/') == ARTICLE.rstrip('/'):
        link['href'] = ARTICLE
    elif href.startswith('/'):
        link['href'] = 'https://www.blinkad.kr' + href
        link['target'] = '_blank'
        link['rel'] = ['noopener', 'noreferrer']
for img in soup.select('img[src]'):
    if img['src'].startswith('/_next/'):
        img['src'] = 'https://www.blinkad.kr' + img['src']
        img.attrs.pop('srcset', None)

for asset in ['/logo-white-nav.png', '/favicon.svg', MEDIA + '.gif', MEDIA + '.png']:
    target = PUBLIC / asset.lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes((ROOT / 'public' / asset.lstrip('/')).read_bytes())

style = soup.new_tag('style')
style.string = '''body{padding-bottom:calc(92px + env(safe-area-inset-bottom))!important}
#preview-navigation{position:fixed;bottom:0;left:0;right:0;z-index:100;background:#090b0ff5;border-top:1px solid #303847;padding:8px 20px max(8px,env(safe-area-inset-bottom))}
#preview-navigation div{max-width:768px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:12px}
#preview-navigation a,#preview-navigation button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;color:#dbe3ef;font-size:14px;white-space:nowrap}
#preview-navigation button{border:1px solid #374151;border-radius:6px;padding:0 12px;background:#171c26}
#preview-navigation a:focus-visible,#preview-navigation button:focus-visible{outline:2px solid #9ec9ff;outline-offset:3px}'''
soup.head.append(style)
navigation = BeautifulSoup('''<nav id="preview-navigation" aria-label="검토 화면 이동"><div>
<a href="/blog/" data-preview-back>← 뒤로가기</a><a href="/blog/">전체 원고/목록</a><button type="button" id="preview-gif-jump">GIF 보기 ↓</button>
</div></nav>''', 'html.parser')
soup.body.append(navigation)
script = soup.new_tag('script', src='/assets/preview.js', defer='')
soup.body.append(script)
asset_dir = PUBLIC / 'assets'
asset_dir.mkdir(exist_ok=True)
(asset_dir / 'preview.js').write_text('''(() => {
const figure=document.getElementById('clinic-navigation-demo');
if(figure){const image=figure.querySelector('img'),button=figure.querySelector('button'),pref=matchMedia('(prefers-reduced-motion: reduce)');let playing=!pref.matches;
const render=()=>{image.src='/media/insights/peche-clinic-navigation.'+(playing?'gif':'png');button.textContent=playing?'움직임 멈추기':'움직임 재생';button.setAttribute('aria-label',playing?'사이트 예시 움직임 멈추기':'사이트 예시 움직임 재생')};
button.addEventListener('click',()=>{playing=!playing;render()});pref.addEventListener('change',()=>{playing=!pref.matches;render()});render();
document.getElementById('preview-gif-jump').addEventListener('click',()=>figure.scrollIntoView({behavior:pref.matches?'instant':'smooth',block:'center'}));}
document.querySelector('[data-preview-back]').addEventListener('click',e=>{if(!document.referrer)return;const r=new URL(document.referrer);if(r.origin===location.origin&&r.pathname.startsWith('/blog/')&&r.href!==location.href){e.preventDefault();location.assign(r.href)}});
})();''')
target = PUBLIC / ARTICLE.lstrip('/') / 'index.html'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(str(soup))
index = f'''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>인사이트 본문 검토</title>
<style>*{{box-sizing:border-box}}body{{background:#090b0f;color:#f1f3f5;margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif}}main{{max-width:768px;margin:auto}}h1{{font-size:28px;letter-spacing:-.03em}}p{{color:#9ca8b8;line-height:1.7}}a{{display:block;min-height:44px;padding:24px;color:#d0e2ff;border:1px solid #364152;border-radius:12px;font-size:19px;line-height:1.6;text-decoration:none}}</style>
<main><h1>인사이트 본문 검토</h1><p>페슈의원 실제 사이트 GIF를 넣은 본문입니다.</p><a href="{ARTICLE}">{title}<br><span style="font-size:14px;color:#91a4bd">전체 글과 GIF 보기 →</span></a></main></html>'''
(PUBLIC / 'blog/index.html').write_text(index)
(PUBLIC / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
html = target.read_text()
assert '__next_f' not in html and 'googletagmanager.com' not in html and '<form' not in html
assert len(soup.select('h1')) == 1 and len(soup.select('#clinic-navigation-demo')) == 1
print({'public': str(PUBLIC), 'article': ARTICLE, 'media_sha256': hashlib.sha256((PUBLIC / (MEDIA + '.gif').lstrip('/')).read_bytes()).hexdigest()})
