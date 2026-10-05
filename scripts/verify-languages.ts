/** Read-only integration checks. No form submission or external data changes. */
import assert from 'node:assert/strict'
import { LOCALIZED_PAGES, LANGUAGE_INFO, localizedPath, languageAlternates } from '../lib/site-languages'
import { englishHomeCopy, siteCopy } from '../i18n/site'
import { NEWS_POSTS } from '../constants/news'
import { BLOG_POSTS } from '../constants'
import { hospitalSampleCopy } from '../app/(korean)/hospital-sample/HospitalSampleClient'
import { restaurantSampleCopy } from '../app/(korean)/restaurant-sample/RestaurantSampleClient'

const base = process.argv[2] || 'http://localhost:3152'
const languages = ['en', 'ja', 'zh'] as const
const get = async (path: string) => {
  const response = await fetch(base + path)
  assert.equal(response.status, 200, path)
  return response.text()
}
const imageMetadata = (html: string, key: 'og:image' | 'twitter:image') => [...html.matchAll(/<meta\b[^>]*>/g)]
  .filter(([tag]) => tag.includes(`property="${key}"`) || tag.includes(`name="${key}"`))
  .map(([tag]) => (tag.match(/\bcontent="([^"]*)"/)?.[1] || '').replaceAll('&amp;', '&'))
async function main() {
  const paths = [...LOCALIZED_PAGES, ...NEWS_POSTS.map(post => `/news/${post.id}`)]
  const newsByPath = new Map(NEWS_POSTS.map(post => [`/news/${post.id}`, post]))
  const checkedImages = new Set<string>()
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
      const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(script => JSON.parse(script[1]))
      const newsPost = newsByPath.get(path)
      if (newsPost) {
        const articles = schemas.filter(schema => schema['@type'] === 'NewsArticle')
        assert.equal(articles.length, 1, `one NewsArticle ${url}`)
        const article = articles[0]
        const canonical = `https://www.blinkad.kr${url}`
        assert.equal(article.url, canonical, `NewsArticle URL ${url}`)
        assert.equal(article.mainEntityOfPage?.['@id'], canonical, `NewsArticle mainEntityOfPage ${url}`)
        const expectedImage = new URL(newsPost.imageUrls?.[0] || '/og-image.png', 'https://www.blinkad.kr').href
        assert.equal(article.image, newsPost.imageUrls?.[0] ? expectedImage : undefined, `NewsArticle shared image ${url}`)
        assert.deepEqual(imageMetadata(html, 'og:image'), [expectedImage], `OG shared image ${url}`)
        assert.deepEqual(imageMetadata(html, 'twitter:image'), [expectedImage], `Twitter shared image ${url}`)
        if (!checkedImages.has(expectedImage)) {
          const sharedImage = new URL(expectedImage)
          const response = await fetch(new URL(sharedImage.pathname + sharedImage.search, base))
          assert.equal(response.status, 200, `shared news image ${expectedImage}`)
          assert.match(response.headers.get('content-type') || '', /^image\//, `shared news image type ${expectedImage}`)
          assert.ok((await response.arrayBuffer()).byteLength, `shared news image body ${expectedImage}`)
          checkedImages.add(expectedImage)
        }
      }
      const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<a\b[^>]*lang="ko"[^>]*>[\s\S]*?<\/a>/g, '').replace(/<[^>]+>/g, ' ')
      if (!['/blog', '/case-studies', '/hospital-sample', '/restaurant-sample'].includes(path)) assert.doesNotMatch(visible, /[가-힣]/, `untranslated text ${url}`)
      if (path === '/blog') {
        assert.ok(html.includes(siteCopy[language].archive), `original-language disclosure ${url}`)
        assert.ok(html.includes(`/blog/${BLOG_POSTS[0].id}`))
        assert.ok(!html.includes(`href="/${language}/blog/${BLOG_POSTS[0].id}"`))
      }
      if (path.includes('-sample')) assert.match(html, /noindex/)
      if (path === '/hospital-sample') {
        const copy = hospitalSampleCopy[language]
        assert.ok(visible.includes(copy.demo), `visible hospital demo notice ${url}`)
        const positions = copy.answers.items.map(item => visible.indexOf(item.q))
        assert.ok(positions[0] >= 0 && positions[0] < positions[1] && positions[1] < positions[2], `question parity ${url}`)
        for (const row of copy.procedures.rows) assert.ok(visible.includes(row[0]), `procedure parity ${url}`)
        assert.doesNotMatch(visible, /InMode|インモード/)
      }
      if (path === '/restaurant-sample') assert.ok(visible.includes(restaurantSampleCopy[language].demo), `visible restaurant demo notice ${url}`)
      if (path === '/news/pnj-google-marketing-seminar') {
        assert.match(visible, /PNJ/)
        assert.doesNotMatch(visible, /P(?:&|&amp;)J/)
      }
      if (path === '/news/medical-tourism-association-aeo-geo-education') {
        assert.match(visible, /Kihyun Kang/)
        assert.doesNotMatch(visible, /Kang Gihyun|董事/)
      }
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
  console.log(`PASS: ${checks} language pages, Korean reciprocal links, metadata/HTML/JSON-LD, ${checkedImages.size} shared news images, ${BLOG_POSTS.length} original articles preserved, query context, protected routes/404s and sitemap. No forms submitted.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
