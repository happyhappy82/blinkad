"""Create a public-assets-only review of the existing GEO article with one photo."""
from pathlib import Path
from urllib.parse import urlsplit, urljoin
from bs4 import BeautifulSoup
import hashlib
import json
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / '.peche-article-share/public'
EVIDENCE = ROOT / 'docs/research/geo-photo-20261125'
URL = 'https://www.blinkad.kr/blog/geo-marketing-brand-description'
ROUTE = '/blog/geo-marketing-brand-description/'
PHOTO = '/media/geo-coffee-machine.jpg'
SOURCE = 'https://unsplash.com/photos/espresso-machine-and-grinder-in-cafe-RuJWgkv0Shg'


def get(url):
    return subprocess.check_output(['/usr/bin/curl', '-fsSL', url])


soup = BeautifulSoup(get(URL), 'html.parser')
article = soup.select_one('article')
assert article
before = article.get_text(' ', strip=True)
paragraph = [p for p in article.select('p') if '우리가 해주는 일까지 제대로 전달되는지 읽어보는 것이지요.' in p.get_text()]
assert len(paragraph) == 1
following_heading = paragraph[0].find_next('h2')
assert following_heading and following_heading.get_text(strip=True) == '소개가 달라지면 고객이 기대하는 것도 달라집니다'
figure = BeautifulSoup(f'''<figure id="geo-coffee-photo" style="margin:40px 0;scroll-margin-top:100px">
<img src="{PHOTO}" alt="카페 카운터에 놓인 에스프레소 머신과 커피 그라인더" width="1600" height="1088" style="display:block;width:100%;height:auto;border-radius:12px" loading="eager" decoding="async">
<figcaption style="margin-top:10px;font-size:12px;line-height:1.7;color:#9ca3af">커피머신 예시 사진 · <a href="{SOURCE}" target="_blank" rel="noopener noreferrer" style="text-decoration:underline;text-underline-offset:3px">Ali Aziz / Unsplash</a></figcaption></figure>''', 'html.parser').figure
paragraph[0].insert_after(figure)

for node in soup.select('script, noscript, iframe, link[rel="preload"], link[rel="modulepreload"], link[rel="preconnect"], link[as="script"], link[href*="googletagmanager.com"]'):
    node.decompose()
for node in soup.select('link[rel="stylesheet"]'):
    original = urljoin(URL, node['href'])
    assert urlsplit(original).netloc == 'www.blinkad.kr'
    css = get(original).decode()
    css = re.sub(r'/\*[#@]\s*sourceMappingURL=.*?\*/', '', css, flags=re.S)
    route = '/assets/' + hashlib.sha256(css.encode()).hexdigest()[:12] + '.css'
    path = PUBLIC / route.lstrip('/')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(css)
    node['href'] = route
robots = soup.select_one('meta[name="robots"]')
if not robots:
    robots = soup.new_tag('meta', attrs={'name':'robots'})
    soup.head.append(robots)
robots['content'] = 'noindex,nofollow,noarchive'
soup.title.string = '사진 대안 검토 | GEO 브랜드 소개'
nav = soup.select_one('nav')
assert nav
nav.clear()
nav.append(BeautifulSoup('''<div style="height:64px;max-width:80rem;margin:auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:16px"><a href="/blog/" style="font-size:18px;font-weight:700">BlinkAd</a><span style="font-size:13px;color:#9ca3af">사진 대안 검토</span></div>''', 'html.parser'))
for a in soup.select('a[href]'):
    href = a['href']
    if href.startswith('#') or urlsplit(href).scheme:
        continue
    if href.rstrip('/') == '/blog':
        a['href'] = '/blog/'
    elif href.rstrip('/') == ROUTE.rstrip('/'):
        a['href'] = ROUTE
    elif href.startswith('/'):
        a['href'] = 'https://www.blinkad.kr' + href
        a['target'] = '_blank'
        a['rel'] = ['noopener','noreferrer']
for img in soup.select('img[src]'):
    if img['src'].startswith('/_next/'):
        img['src'] = 'https://www.blinkad.kr' + img['src']
        img.attrs.pop('srcset', None)
style = soup.new_tag('style')
style.string = '''body{padding-bottom:calc(110px + env(safe-area-inset-bottom))!important}#review-footer{position:fixed;bottom:0;left:0;right:0;z-index:100;background:rgba(12,14,18,.98);border-top:1px solid #364152;padding:8px 12px calc(8px + env(safe-area-inset-bottom));display:flex;justify-content:center;gap:8px}#review-footer a,#review-footer button{font:inherit;font-size:14px;line-height:1.4;min-height:44px;padding:10px 16px;border-radius:7px;color:#d6deeb;text-decoration:none;display:flex;align-items:center;justify-content:center;background:transparent;border:0;cursor:pointer}#review-footer button{background:#235ac5;color:white}#review-footer :focus-visible{outline:2px solid white;outline-offset:2px}@media(max-width:500px){#review-footer a,#review-footer button{flex:1;padding:10px 8px}}'''
soup.head.append(style)
soup.body.append(BeautifulSoup('''<div id="review-footer"><a id="review-back" href="/blog/">뒤로가기</a><a href="/blog/">전체 원고/목록</a><button id="review-photo" type="button">사진 보기</button></div>''', 'html.parser'))
script = soup.new_tag('script')
script.string = '''document.querySelector('#review-photo').addEventListener('click',()=>document.querySelector('#geo-coffee-photo').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));document.querySelector('#review-back').addEventListener('click',e=>{if(document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1){e.preventDefault();history.back()}});'''
soup.body.append(script)
target = PUBLIC / ROUTE.lstrip('/') / 'index.html'
target.parent.mkdir(parents=True, exist_ok=True)
(PUBLIC / PHOTO.lstrip('/')).parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(EVIDENCE / 'coffee-machine.jpg', PUBLIC / PHOTO.lstrip('/'))
target.write_text(str(soup))
index = PUBLIC / 'blog/index.html'
s = index.read_text()
if ROUTE not in s:
    link = f'<a style="margin-top:16px" href="{ROUTE}">GEO 브랜드 소개 · 커피머신 사진 대안<br><span style="font-size:14px;color:#91a4bd">본문에서 사진 배치 보기 →</span></a>'
    index.write_text(s.replace('</main>',link+'</main>'))
check = BeautifulSoup(target.read_text(), 'html.parser')
assert len(check.select('#geo-coffee-photo')) == 1
check.select_one('#geo-coffee-photo').decompose()
assert check.select_one('article').get_text(' ', strip=True) == before
assert '__next_f' not in str(check) and 'googletagmanager.com' not in str(check) and not check.select('form,iframe')
result = {'date_kst':'2026-11-25','article':URL,'preview_route':ROUTE,'source_photo_page':SOURCE,'photographer':'Ali Aziz','license':'https://unsplash.com/license','image_path':PHOTO,'image_bytes':(EVIDENCE/'coffee-machine.jpg').stat().st_size,'image_sha256':hashlib.sha256((EVIDENCE/'coffee-machine.jpg').read_bytes()).hexdigest(),'insertion':'After introduction paragraph 3, before first h2','article_text_preserved':True,'figure_count':1,'photo_edited':False,'credits_used':0,'production_applied':False,'production_deployed':False}
(EVIDENCE/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))
