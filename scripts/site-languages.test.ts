import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import { ENGLISH_PAGES, englishPath, languageAlternates, validInternationalPhone } from '../lib/site-languages'

test('public routes get an English equivalent with query and fragment preserved', () => {
  for (const path of ENGLISH_PAGES) assert.equal(englishPath(path), `/en${path === '/' ? '' : path}`)
  assert.equal(englishPath('/contact?service=doctornest&topic=h2#form'), '/en/contact?service=doctornest&topic=h2#form')
  assert.equal(englishPath('/news/blinkad-news-board-open'), '/en/news/blinkad-news-board-open')
})

test('private routes, assets, external URLs and untranslated articles are never localized', () => {
  for (const path of ['/erp', '/api/erp/clients', '/client-intake', '/blog/original-article', '/logo-white-nav.png', 'https://example.com/services', '/en/services']) assert.equal(englishPath(path), path)
})

test('reciprocal language alternates keep Korean as the default', () => {
  assert.deepEqual(languageAlternates('/services'), { ko: 'https://www.blinkad.kr/services', en: 'https://www.blinkad.kr/en/services', 'x-default': 'https://www.blinkad.kr/services' })
  assert.equal(languageAlternates('/').en, 'https://www.blinkad.kr/en')
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
