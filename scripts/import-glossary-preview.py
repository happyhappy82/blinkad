"""Import reviewed glossary content into native Next.js routes, without preview assets."""
import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://www.blinkad.kr'


def clean_url(value, old_origin):
    if value.startswith(old_origin):
        value = ORIGIN + value[len(old_origin):]
    if value.startswith('/glossary/') or value.startswith(ORIGIN + '/glossary/'):
        parts = urlsplit(value)
        value = urlunsplit((parts.scheme, parts.netloc, parts.path.rstrip('/'), parts.query, parts.fragment))
    return value


def normalize(value, old_origin):
    if isinstance(value, dict):
        return {key: normalize(item, old_origin) for key, item in value.items()}
    if isinstance(value, list):
        return [normalize(item, old_origin) for item in value]
    return clean_url(value, old_origin) if isinstance(value, str) else value


def main(source):
    manifest = json.loads((source / 'page-manifest.json').read_text(encoding='utf-8'))
    pages = []
    for row in manifest['pages']:
        soup = BeautifulSoup((source / row['path'].strip('/') / 'index.html').read_text(encoding='utf-8'), 'html.parser')
        for dot in soup.select('.title-dot'):
            dot.decompose()
        for heading in soup.select('h1,h2,h3,h4,h5,h6'):
            # Remove decorative sentence endings, preserving robots.txt and Schema.org.
            last = next((text for text in reversed(list(heading.strings)) if text.strip()), None)
            if last and last.rstrip().endswith('.'):
                last.replace_with(last.rstrip().rstrip('.'))
        main = soup.find('main')
        for link in main.select('a[href]'):
            link['href'] = clean_url(link['href'], manifest['baseUrl'])
        config = soup.select_one('#glossary-data')
        pages.append({
            'path': row['path'].rstrip('/'), 'kind': row['kind'], 'title': soup.title.get_text(),
            'description': soup.select_one('meta[name=description]')['content'],
            'schema': normalize(json.loads(soup.select_one('script[type="application/ld+json"]').string), manifest['baseUrl']),
            'mainHTML': main.decode_contents() if not config else '',
            'headingHTML': str(main.select_one('.dictionary-breadcrumb')) + str(main.select_one('.dictionary-heading')) if config else '',
            'categoriesHTML': str(main.select_one('.dictionary-categories')) if config else '',
            'nextHTML': str(main.select_one('.dictionary-next')) if config else '',
            'config': normalize(json.loads(config.string), manifest['baseUrl']) if config else None,
        })
    target = ROOT / 'content/glossary/pages.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(pages, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    css = (source / 'preview.css').read_text(encoding='utf-8')
    css = css[css.index('.sound-only'):]
    css = re.sub(r'\.mobile-menu\{.*?(?=@media\(max-width:1100px\))', '', css, flags=re.S)
    css = css.replace('.mobile-inner .mobile-cta{display:flex;justify-content:center;border:0;border-radius:999px;padding:12px 20px;margin:16px 0 0;background:var(--accent)}', '')
    css = css.replace('.backtop', '.glossary-backtop').replace('html{scroll-behavior:auto}', '.dictionary-page{scroll-behavior:auto}')
    css = re.sub(r'\.title-dot\{[^}]*\}', '', css)
    css = css.replace('.eyebrow', '.dictionary-page .eyebrow').replace('.sound-only', '.dictionary-page .sound-only').replace('.empty', '.dictionary-page .empty')
    css = css.replace('#search', '.dictionary-page #search').replace('#clear', '.dictionary-page #clear')
    prefix = '.dictionary-page{--ink:#fff;--muted:#9ca3af;--accent:#0066ff;--line:rgba(255,255,255,.1);--paper:#000;word-break:keep-all;color-scheme:dark}\n'
    (ROOT / 'app/(korean)/glossary/glossary.css').write_text(prefix + css, encoding='utf-8')
    print(f'Imported {len(pages)} native pages, content and scoped styles.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    main(parser.parse_args().source.resolve())
