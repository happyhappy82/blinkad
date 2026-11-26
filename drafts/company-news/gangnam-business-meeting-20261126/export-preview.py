"""Export this draft using the live company-news markup; no live-site writes."""
from pathlib import Path
from urllib.parse import urljoin, urlparse
from hashlib import sha256
from copy import deepcopy
import json
import re
import shutil
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
DIST = ROOT / 'preview'
BASE = 'https://www.blinkad.kr'
TEMPLATE = BASE + '/news/gangnam-hospital-ai-search-brand-marketing-education'
POST = json.loads((ROOT / 'draft.json').read_text())
BODY = (ROOT / 'body.html').read_text()
DETAIL = '/news/' + POST['id'] + '/'
DIST.mkdir(exist_ok=True)
(DIST / 'assets').mkdir(exist_ok=True)
PHOTO = ROOT / 'gangnam-business-meeting-redacted.png'
if not PHOTO.exists():
    source = json.loads((ROOT / 'review-notes.json').read_text())['imageEdit']['generatedSource']
    shutil.copyfile(source, PHOTO)
shutil.copyfile(PHOTO, DIST / 'assets' / PHOTO.name)
for filename in POST.get('additionalAssets', []):
    shutil.copyfile(ROOT / filename, DIST / 'assets' / filename)

session = requests.Session()
response = session.get(TEMPLATE, timeout=30)
response.raise_for_status()
soup = BeautifulSoup(response.text, 'html.parser')
for tag in list(soup.find_all('script')) + list(soup.find_all('noscript')):
    tag.decompose()
for tag in list(soup.find_all('link')):
    if 'stylesheet' not in tag.get('rel', []):
        tag.decompose()
for tag in list(soup.find_all('meta')):
    if tag.get('property', '').startswith('og:') or tag.get('name', '').startswith('twitter:'):
        tag.decompose()
for tag in soup.find_all(True):
    for attribute in list(tag.attrs):
        if attribute.startswith('on'):
            del tag[attribute]

asset_cache = {}
def copy_asset(url):
    url = urljoin(BASE, url)
    if url not in asset_cache:
        data = session.get(url, timeout=30)
        data.raise_for_status()
        suffix = Path(urlparse(url).path).name
        filename = sha256(url.encode()).hexdigest()[:8] + '-' + suffix
        (DIST / 'assets' / filename).write_bytes(data.content)
        asset_cache[url] = '/assets/' + filename
    return asset_cache[url]

for tag in soup.find_all('link', rel='stylesheet'):
    url = urljoin(BASE, tag['href'])
    css_response = session.get(url, timeout=30)
    css_response.raise_for_status()
    css = css_response.text
    def local_css_asset(match):
        raw = match.group(1).strip('"\' ')
        if raw.startswith('data:') or raw.startswith('#'):
            return match.group(0)
        return 'url("' + copy_asset(urljoin(url, raw)) + '")'
    css = re.sub(r'url\(([^)]+)\)', local_css_asset, css)
    filename = Path(urlparse(url).path).name
    (DIST / 'assets' / filename).write_text(css)
    tag['href'] = '/assets/' + filename

article = soup.find('article')
article.find('h1').string = POST['title']
article.header.find('span', class_='font-semibold').string = POST['category']
article.header.find('time').string = POST['date']
article.header.find('time')['datetime'] = '2026-11-26'
article.find('div', class_='prose').clear()
body_container = article.find('div', class_='prose')
for element in list(BeautifulSoup(BODY, 'html.parser').contents):
    body_container.append(element)
photo = article.find('img')
photo['src'] = POST['imageUrls'][0]
photo['alt'] = POST['imageAlt']
photo['id'] = 'event-photo'
for attr in ['srcset', 'sizes', 'data-nimg']:
    photo.attrs.pop(attr, None)
photo_wrapper = photo.parent.parent
caption = soup.new_tag('p', attrs={'class': 'review-photo-caption'})
caption.string = POST['caption'] + ' '
full = soup.new_tag('a', href=POST['imageUrls'][0], target='_blank')
full.string = '사진 크게 보기 ↗'
caption.append(full)
photo_wrapper.append(caption)
for image_url in POST['imageUrls'][1:]:
    additional = deepcopy(photo.parent)
    additional.img['src'] = image_url
    additional.img['alt'] = POST['imageAlt']
    additional.img['id'] = 'additional-consultation-photo'
    additional.img['loading'] = 'lazy'
    caption.insert_before(additional)

for img in soup.find_all('img'):
    if img is photo:
        continue
    if img.get('src', '').startswith('/assets/') and (DIST / img['src'].lstrip('/')).exists():
        continue
    if img.get('src', '').startswith('data:'):
        continue
    img['src'] = copy_asset(img['src'])
    img.attrs.pop('srcset', None)

for anchor in soup.find_all('a', href=True):
    href = anchor['href']
    if href in ['/news', '/news/'] or (href == '/' and not article.find('a') is anchor):
        anchor['href'] = '/'
    elif href.startswith('/') and not href.startswith('/assets/'):
        anchor['href'] = urljoin(BASE, href)
for button in list(soup.find_all('button')):
    button.decompose()

soup.title.string = POST['title'] + ' | BlinkAd 회사소식 · 초안'
robots = soup.new_tag('meta', attrs={'name': 'robots', 'content': 'noindex,nofollow,noarchive'})
soup.head.append(robots)
description = soup.find('meta', attrs={'name': 'description'})
if description:
    description['content'] = POST['excerpt']
badge = soup.new_tag('p', attrs={'class': 'review-draft-badge'})
badge.string = '초안 검토 · 공식 발행 전'
article.insert(0, badge)
style = soup.new_tag('style')
style.string = '''
html{scroll-padding-bottom:110px}body{padding-bottom:calc(90px + env(safe-area-inset-bottom))}
.review-draft-badge{color:#94a3b8;font-size:12px;margin:0 0 20px;letter-spacing:.04em}
.review-photo-caption{color:#9ca3af;font-size:12px;line-height:1.8;margin:12px 0 0}
.review-photo-caption a{color:#8ebcff;text-decoration:underline;text-underline-offset:3px}
.prose .review-event-figure{max-width:560px;margin:36px auto 44px}.prose .review-event-figure img{display:block;width:100%;height:auto;max-width:100%;margin:0;border-radius:8px}.prose .review-event-figure figcaption{margin-top:12px;font-size:12px;line-height:1.8;color:#9ca3af}
.review-nav{position:fixed;bottom:calc(16px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:1000;display:flex;gap:4px;max-width:calc(100vw - 24px);padding:4px;background:#171717f5;border:1px solid #ffffff30;border-radius:16px;box-shadow:0 8px 30px #0009}
.review-nav a{display:flex;align-items:center;justify-content:center;min-height:44px;padding:0 16px;white-space:nowrap;color:#f9fafb;font-size:13px;border-radius:11px}
.review-nav a:hover{background:#ffffff12}.review-list-main{max-width:1152px;margin:auto;padding:128px 20px 80px}.review-list-main h1{font-size:40px;font-weight:700;margin:16px 0 36px}.review-card{display:grid;grid-template-columns:1.1fr 1fr;gap:32px;border:1px solid #ffffff20;border-radius:16px;overflow:hidden;background:#111}.review-card img{width:100%;height:100%;min-height:320px;object-fit:cover}.review-card-content{padding:40px 28px 40px 0;align-self:center}.review-card h2{font-size:28px;line-height:1.5;font-weight:700;margin:16px 0}.review-card p{font-size:16px;line-height:1.9;color:#aaa}.review-card small{color:#60a5fa}.review-card time{color:#999;margin-left:16px}.review-card .read{color:white;display:block;margin-top:24px}
@media(max-width:640px){.review-card{display:block}.review-card img{min-height:0;aspect-ratio:16/9}.review-card-content{padding:24px}.review-card h2{font-size:23px}.review-list-main h1{font-size:32px}.review-nav a{padding:0 12px}}
'''
soup.head.append(style)
nav = soup.new_tag('nav', attrs={'class': 'review-nav', 'aria-label': '검토 화면 이동'})
back = soup.new_tag('a', href='/', attrs={'id': 'review-back'})
back.string = '← 뒤로가기'
listing = soup.new_tag('a', href='/')
listing.string = '전체 회사소식'
nav.extend([back, listing])
soup.body.append(nav)
script = soup.new_tag('script')
script.string = "document.getElementById('review-back').addEventListener('click',function(e){if(document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1){e.preventDefault();history.back()}})"
soup.body.append(script)
detail_dir = DIST / DETAIL.strip('/')
detail_dir.mkdir(parents=True, exist_ok=True)
(detail_dir / 'index.html').write_text(str(soup))

listing_soup = BeautifulSoup(str(soup), 'html.parser')
listing_soup.title.string = '회사소식 초안 검토 | BlinkAd'
listing_main = listing_soup.find('main')
listing_main.clear()
listing_main.attrs = {'class': 'review-list-main'}
list_markup = '<p class="review-draft-badge">초안 검토 · 공식 발행 전</p><h1>회사소식</h1>'
list_markup += '<a class="review-card" href="' + DETAIL + '"><img src="' + POST['imageUrls'][0] + '" alt="' + POST['imageAlt'] + '"><div class="review-card-content"><small>' + POST['category'] + '</small><time>' + POST['date'] + '</time><h2>' + POST['title'] + '</h2><p>' + POST['excerpt'] + '</p><span class="read">소식 읽기 →</span></div></a>'
listing_main.append(BeautifulSoup(list_markup, 'html.parser'))
listing_soup.find('nav', attrs={'aria-label': '검토 화면 이동'}).decompose()
for script in listing_soup.find_all('script'):
    script.decompose()
(DIST / 'index.html').write_text(str(listing_soup))
(DIST / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
print(json.dumps({'preview': str(DIST), 'detail': DETAIL, 'articleTitle': POST['title'], 'copiedAssets': len(asset_cache), 'bodyParagraphs': len(BeautifulSoup(BODY, 'html.parser').find_all('p'))}, ensure_ascii=False))
