/** Read-only HTTP checks against a running local or deployed build. Never submits forms. */
import assert from 'node:assert/strict'
import { ENGLISH_PAGES, englishPath } from '../lib/site-languages'
import { NEWS_POSTS } from '../constants/news'
import { BLOG_POSTS } from '../constants'

const base = process.argv[2] || 'http://localhost:3152'
async function main() {
const pairs = [...ENGLISH_PAGES, ...NEWS_POSTS.map(post => `/news/${post.id}`)]
let checks = 0
const get = async (path: string) => {
  const response = await fetch(base + path)
  assert.equal(response.status, 200, path)
  return response.text()
}
for (const path of pairs) {
  const en = englishPath(path)
  const html = await get(en)
  assert.match(html, /<html lang="en"/)
  assert.ok(html.includes(`rel="canonical" href="https://www.blinkad.kr${en}"`), `canonical ${en}`)
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `one H1 ${en}`)
  assert.match(html, /hrefLang="ko"/)
  assert.match(html, /hrefLang="en"/)
  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(script[1])
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')
  if (!['/blog', '/case-studies', '/hospital-sample', '/restaurant-sample'].includes(path)) assert.doesNotMatch(visible, /[가-힣]/, `untranslated content ${en}`)
  if (!path.includes('-sample')) {
    const ko = await get(path)
    assert.match(ko, /<html lang="ko"/)
    assert.ok(ko.includes(`hrefLang="en" href="https://www.blinkad.kr${en}"`), `reciprocal alternate ${path}`)
  }
  checks++
}
const inquiry = await get('/en/contact?service=doctornest&topic=h2')
assert.match(inquiry, /DoctorNest implementation consultation/)
assert.match(inquiry, /value="h2" selected/)
const original = await get(`/blog/${BLOG_POSTS[0].id}`)
assert.match(original, /<html lang="ko"/)
for (const path of ['/en/not-a-page', '/en/erp', '/en/api/erp/clients']) {
  const response = await fetch(base + path)
  assert.equal(response.status, 404, path)
  const html = await response.text()
  assert.match(html, /Page not found/)
}
const sitemap = await get('/sitemap.xml')
for (const path of pairs.filter(path => !path.includes('-sample'))) assert.ok(sitemap.includes(`https://www.blinkad.kr${englishPath(path)}`), `sitemap ${path}`)
console.log(`PASS: ${checks} English pages, Korean counterparts, metadata/schema, forms, article preservation, 404 isolation and sitemap. No forms submitted.`)
}
main().catch(error => { console.error(error); process.exitCode = 1 })
