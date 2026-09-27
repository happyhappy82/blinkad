/** Read-only integration checks. No form submission or external data changes. */
import assert from 'node:assert/strict'
import { LOCALIZED_PAGES, LANGUAGE_INFO, localizedPath, languageAlternates } from '../lib/site-languages'
import { englishHomeCopy, siteCopy } from '../i18n/site'
import { NEWS_POSTS } from '../constants/news'
import { BLOG_POSTS } from '../constants'

const base = process.argv[2] || 'http://localhost:3152'
const languages = ['en', 'ja', 'zh'] as const
const get = async (path: string) => {
  const response = await fetch(base + path)
  assert.equal(response.status, 200, path)
  return response.text()
}
async function main() {
  const paths = [...LOCALIZED_PAGES, ...NEWS_POSTS.map(post => `/news/${post.id}`)]
  let checks = 0
  for (const language of languages) {
    for (const path of paths) {
      const url = localizedPath(path, language)
      const html = await get(url)
      assert.ok(html.includes(`<html lang="${LANGUAGE_INFO[language].html}"`), `HTML language ${url}`)
      assert.ok(html.includes(`rel="canonical" href="https://www.blinkad.kr${url}"`), `canonical ${url}`)
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `one H1 ${url}`)
      if (path === '/') {
        const title = (html.match(/<title>(.*?)<\/title>/)?.[1] || '').replaceAll('&amp;', '&')
        assert.equal(title, language === 'en' ? englishHomeCopy.title : siteCopy[language].title, `home title ${url}`)
        const heading = (html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
        if (language === 'en') {
          assert.equal(heading, englishHomeCopy.heading, `approved H1 ${url}`)
          const encodedTitle = englishHomeCopy.title.replaceAll('&', '&amp;')
          assert.ok(html.includes(`property="og:title" content="${encodedTitle}"`))
          assert.ok(html.includes(`name="twitter:title" content="${encodedTitle}"`))
        } else assert.equal(heading.replace(/\s/g, ''), language === 'ja' ? 'Googleで見つかり、AIに伝わるブランドへ。' : '让Google找到您，让AI理解您的品牌。')
      } else assert.ok(!html.includes(englishHomeCopy.heading), `homepage copy must not leak into ${url}`)
      for (const [lang, href] of Object.entries(languageAlternates(path))) assert.ok(html.includes(`hrefLang="${lang}" href="${href}"`), `alternate ${lang} ${url}`)
      for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(script[1])
      const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<a\b[^>]*lang="ko"[^>]*>[\s\S]*?<\/a>/g, '').replace(/<[^>]+>/g, ' ')
      if (!['/blog', '/case-studies', '/hospital-sample', '/restaurant-sample'].includes(path)) assert.doesNotMatch(visible, /[가-힣]/, `untranslated text ${url}`)
      if (path === '/blog') {
        assert.ok(html.includes(siteCopy[language].archive), `original-language disclosure ${url}`)
        assert.ok(html.includes(`/blog/${BLOG_POSTS[0].id}`))
        assert.ok(!html.includes(`href="/${language}/blog/${BLOG_POSTS[0].id}"`))
      }
      if (path.includes('-sample')) assert.match(html, /noindex/)
      checks++
    }
    const inquiry = await get(`/${language}/contact?service=doctornest&topic=h2`)
    assert.match(inquiry, /value="h2" selected/)
    for (const path of ['/not-a-page', '/erp', '/api/erp/clients', `/blog/${BLOG_POSTS[0].id}`, '/news/not-a-post']) {
      const response = await fetch(`${base}/${language}${path}`)
      assert.equal(response.status, 404, `no fake or private language pages: ${language}${path}`)
      assert.ok((await response.text()).includes(siteCopy[language].notFound))
    }
  }
  for (const path of paths.filter(path => !path.includes('-sample'))) {
    const html = await get(path)
    assert.match(html, /<html lang="ko"/)
    for (const [lang, href] of Object.entries(languageAlternates(path))) assert.ok(html.includes(`hrefLang="${lang}" href="${href}"`), `Korean reciprocal ${path} ${lang}`)
  }
  const original = await get(`/blog/${BLOG_POSTS[0].id}`)
  assert.match(original, /<html lang="ko"/)
  const sitemap = await get('/sitemap.xml')
  for (const language of languages) {
    for (const path of paths.filter(path => !path.includes('-sample'))) assert.ok(sitemap.includes(`https://www.blinkad.kr${localizedPath(path, language)}`))
    assert.ok(!sitemap.includes(`https://www.blinkad.kr/${language}/blog/${BLOG_POSTS[0].id}`))
  }
  for (const post of BLOG_POSTS) assert.ok(sitemap.includes(`https://www.blinkad.kr/blog/${post.id}`))
  console.log(`PASS: ${checks} language pages, Korean reciprocal links, metadata/HTML/JSON-LD, ${BLOG_POSTS.length} original articles preserved, query context, protected routes/404s and sitemap. No forms submitted.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
