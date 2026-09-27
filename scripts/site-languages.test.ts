import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import { hospitalSampleCopy } from '../app/(korean)/hospital-sample/HospitalSampleClient'
import { restaurantSampleCopy } from '../app/(korean)/restaurant-sample/RestaurantSampleClient'
import { englishHomeCopy, siteCopy } from '../i18n/site'
import { ENGLISH_PAGES, SITE_LANGUAGES, LANGUAGE_INFO, englishPath, localizedPath, splitLanguagePath, languageAlternates, validInternationalPhone } from '../lib/site-languages'

test('approved inbound-tourism wording is exact and separate from other page defaults', () => {
  assert.equal(englishHomeCopy.title, 'BlinkAd | Korea Inbound Tourism Marketing Agency for Foreign Tourists — Google Maps & Google Business Profile')
  assert.equal(englishHomeCopy.heading, 'BlinkAd is an inbound tourism marketing agency in Korea. We help Korean hospitals, clinics, restaurants and local brands attract foreign tourists through Google Maps and Google Business Profile.')
  assert.equal(siteCopy.en.title, 'BlinkAd | Google, AEO & GEO Marketing Agency')
  assert.equal(siteCopy.ja.title, 'BlinkAd | Google・AEO・GEOマーケティング')
  assert.equal(siteCopy.zh.title, 'BlinkAd | Google、AEO与GEO营销服务')
  assert.match(fs.readFileSync('localized/en/app/(korean)/page.tsx', 'utf8'), /<Hero heading=\{englishHomeCopy.heading\} \/>/)
  for (const file of ['app/(korean)/page.tsx', 'localized/ja/app/(korean)/page.tsx', 'localized/zh/app/(korean)/page.tsx']) {
    const source = fs.readFileSync(file, 'utf8')
    assert.match(source, /<Hero \/>/)
    assert.doesNotMatch(source, /englishHomeCopy/)
  }
})

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

test('reviewed copy retains source structure and consistent display names', () => {
  for (const language of ['en', 'ja', 'zh']) {
    const dictionary = JSON.parse(fs.readFileSync(`i18n/${language}.json`, 'utf8')) as Record<string, string>
    const all = Object.values(dictionary).join('\n')
    assert.doesNotMatch(all, /P&J|Kang Gihyun|Kwon Soonhyun|董事Kihyun|走向向|产品导入咨询|咨询医疗机构咨询管理|相談時の案内整理を相談/)
    for (const [source, target] of Object.entries(dictionary)) {
      if (language === 'en' && source !== '해외 마케팅') assert.doesNotMatch(target, /international marketing|inbound marketing/i)
      if (source.includes('권순현')) assert.match(target, /Soonhyun Kwon/)
      if (source.includes('강기현')) assert.match(target, /Kihyun Kang/)
      if (source.includes('주식회사 피엔제이')) assert.match(target, /PNJ/)
      if (source.includes('<p>')) assert.deepEqual(target.match(/<\/?[a-z][^>]*>/g), source.match(/<\/?[a-z][^>]*>/g))
    }
    const statistic = Object.entries(dictionary).find(([key]) => key.includes('한국인의 54.5%'))![1]
    assert.match(statistic, /2025/)
    assert.match(statistic, /989/)
    assert.match(statistic, /990/)
    assert.doesNotMatch(statistic, /a year earlier|1年前の39|一年前的39/)
    assert.match(Object.entries(dictionary).find(([key]) => key.includes('근거의 58%'))![1], /2024/)
    assert.match(Object.entries(dictionary).find(([key]) => key.includes('3.2배 많'))![1], /independently verified|独立した検証|独立验证/)
  }
})

test('hospital demo preserves question and procedure topics across all four languages', () => {
  const expected = {
    ko: [/여드름/, /보톡스/, /기미/],
    en: [/acne/i, /Botox/, /melasma/i],
    ja: [/ニキビ/, /ボトックス/, /肝斑/],
    zh: [/痤疮/, /肉毒素/, /黄褐斑/],
  }
  for (const language of ['ko', 'en', 'ja', 'zh'] as const) {
    const copy = hospitalSampleCopy[language]
    assert.equal(copy.answers.items.length, 3)
    assert.equal(copy.procedures.rows.length, 4)
    assert.equal(copy.quick.length, 4)
    assert.equal(copy.visit.items.length, 3)
    assert.ok(copy.demo.length > 30)
    assert.doesNotMatch(JSON.stringify(copy), /InMode|インモード|publicly citeable/)
    for (const [index, pattern] of expected[language].entries()) {
      assert.match(copy.answers.items[index].q, pattern)
      assert.match(copy.procedures.rows[index + 1][0], pattern)
    }
    assert.equal(copy.footer.phone, hospitalSampleCopy.ko.footer.phone)
  }
})

test('restaurant demo labels examples and corrects food translations without reserving bar seats', () => {
  assert.match(JSON.stringify(restaurantSampleCopy.ja), /伝統的な発酵調味料/)
  assert.match(JSON.stringify(restaurantSampleCopy.ja), /北村散策のあとの夕食/)
  assert.match(JSON.stringify(restaurantSampleCopy.zh), /糖煮梨/)
  assert.doesNotMatch(JSON.stringify(restaurantSampleCopy), /伝統味噌|梨子果酱|Bar seats are kept/)
  for (const language of ['ko', 'en', 'ja', 'zh'] as const) assert.ok(restaurantSampleCopy[language].demo.length > 30)
})

test('demo opacity utilities use supported arbitrary values and mobile clinic header stays in flow', () => {
  for (const page of ['hospital-sample/HospitalSampleClient.tsx', 'restaurant-sample/RestaurantSampleClient.tsx']) {
    const source = fs.readFileSync(`app/(korean)/${page}`, 'utf8')
    assert.doesNotMatch(source, /(?:text|bg|border|from|via|to)-(?:white|black|\[#[a-fA-F0-9]+\])\/\d+/)
  }
  const hospital = fs.readFileSync('app/(korean)/hospital-sample/HospitalSampleClient.tsx', 'utf8')
  assert.match(hospital, /<header className="relative [^"]+ sm:absolute"/)
})
