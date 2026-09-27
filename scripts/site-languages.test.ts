import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import { ENGLISH_PAGES, SITE_LANGUAGES, LANGUAGE_INFO, englishPath, localizedPath, splitLanguagePath, languageAlternates, validInternationalPhone } from '../lib/site-languages'

test('public routes get an English equivalent with query and fragment preserved', () => {
  for (const path of ENGLISH_PAGES) assert.equal(englishPath(path), `/en${path === '/' ? '' : path}`)
  assert.equal(englishPath('/contact?service=doctornest&topic=h2#form'), '/en/contact?service=doctornest&topic=h2#form')
  assert.equal(englishPath('/news/blinkad-news-board-open'), '/en/news/blinkad-news-board-open')
})

test('private routes, assets, external URLs and untranslated articles are never localized', () => {
  for (const path of ['/erp', '/api/erp/clients', '/client-intake', '/blog/original-article', '/logo-white-nav.png', 'https://example.com/services', '/en/services']) assert.equal(englishPath(path), path)
})

test('reciprocal language alternates keep Korean as the default', () => {
  assert.deepEqual(languageAlternates('/services'), { ko: 'https://www.blinkad.kr/services', en: 'https://www.blinkad.kr/en/services', ja: 'https://www.blinkad.kr/ja/services', 'zh-Hans': 'https://www.blinkad.kr/zh/services', 'x-default': 'https://www.blinkad.kr/services' })
  assert.equal(languageAlternates('/').en, 'https://www.blinkad.kr/en')
})

test('four-language subdirectories preserve pages, query strings and anchors', () => {
  for (const language of SITE_LANGUAGES) {
    for (const path of ENGLISH_PAGES) {
      const localized = localizedPath(path, language)
      assert.deepEqual(splitLanguagePath(localized), { language, path })
    }
    const expected = language === 'ko' ? '/' : `/${language}`
    assert.equal(localizedPath('/?utm_source=test#contact', language), `${expected}?utm_source=test#contact`)
    assert.equal(localizedPath('/contact?service=doctornest&topic=h2#form', language), `${language === 'ko' ? '' : '/' + language}/contact?service=doctornest&topic=h2#form`)
  }
  assert.deepEqual(splitLanguagePath('/zh?ref=test'), { language: 'zh', path: '/?ref=test' })
  for (const language of ['en', 'ja', 'zh'] as const) {
    for (const path of ['/erp', '/api/contact', '/client-intake', '/blog/untranslated', '/logo.png', '/news/a/b', '/news/image.png', 'https://example.com/services', '/en/services']) assert.equal(localizedPath(path, language), path)
  }
})

test('Japanese and Simplified Chinese dictionaries cover the full reviewed source inventory', () => {
  const en = JSON.parse(fs.readFileSync('i18n/en.json', 'utf8'))
  for (const language of ['ja', 'zh']) {
    const translated = JSON.parse(fs.readFileSync(`i18n/${language}.json`, 'utf8'))
    assert.deepEqual(Object.keys(translated), Object.keys(en))
    for (const [source, target] of Object.entries(translated) as [string, string][]) {
      assert.ok(target.trim(), source)
      assert.doesNotMatch(target, /[가-힣]/, source)
      if (source.includes('<p>')) assert.deepEqual(target.match(/<\/?[a-z][^>]*>/g), source.match(/<\/?[a-z][^>]*>/g), source.slice(0,50))
    }
    const navbar = fs.readFileSync(`localized/${language}/components/Navbar.tsx`, 'utf8')
    assert.ok(navbar.includes(`href: "/${language}/services"`))
    assert.match(navbar, /@\/components\/LanguageSwitch/)
    for (const name of ['Contact', 'DiagnosisModal', 'NestInquiry']) {
      const form = fs.readFileSync(`localized/${language}/components/${name}.tsx`, 'utf8')
      assert.match(form, /validInternationalPhone/)
      assert.match(form, /method: 'POST'/)
    }
  }
  assert.equal(LANGUAGE_INFO.zh.html, 'zh-Hans')
})

test('international phone validation supports country codes without accepting arbitrary text', () => {
  for (const phone of ['010-1234-5678', '+82 10 1234 5678', '+1 (415) 555-0123', '+44 20 7946 0958', '020 7946 0958']) assert.equal(validInternationalPhone(phone), true, phone)
  for (const phone of ['', '123', 'abc1234567', '++821012345678', '1234567890123456', '+1<script>']) assert.equal(validInternationalPhone(phone), false, phone)
})

test('English generated forms retain the receiver and enable international phone validation', () => {
  for (const name of ['Contact', 'DiagnosisModal', 'NestInquiry']) {
    const text = fs.readFileSync(`localized/en/components/${name}.tsx`, 'utf8')
    assert.match(text, /validInternationalPhone/)
    assert.doesNotMatch(text, /\^\(01\[0-9\]/)
    assert.match(text, /method: 'POST'/)
  }
  assert.match(fs.readFileSync('components/DiagnosisModal.tsx', 'utf8'), /\^\(01\[0-9\]/)
})

test('English modules reuse assets and omit the Korean blog body payload', () => {
  const constants = fs.readFileSync('localized/en/constants/index.ts', 'utf8')
  assert.doesNotMatch(constants, /export const BLOG_POSTS/)
  assert.match(constants, /keyword: '한식당'/)
  const navbar = fs.readFileSync('localized/en/components/Navbar.tsx', 'utf8')
  assert.match(navbar, /href: "\/en\/services"/)
  assert.match(navbar, /src="\/logo-white-nav.png"/)
  assert.match(navbar, /@\/components\/LanguageSwitch/)
})
