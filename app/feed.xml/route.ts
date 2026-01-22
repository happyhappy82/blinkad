import { BLOG_POSTS } from '@/constants'

function formatDateToRFC822(dateStr: string): string {
  // 2026.01.22 → Wed, 22 Jan 2026 00:00:00 GMT
  const [year, month, day] = dateStr.split('.')
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`)
  return date.toUTCString()
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const baseUrl = 'https://blog.blinkad.kr'

  const rssItems = BLOG_POSTS.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/${post.id}</link>
      <guid isPermaLink="true">${baseUrl}/${post.id}</guid>
      <pubDate>${formatDateToRFC822(post.date)}</pubDate>
      <description>${escapeXml(post.excerpt || post.title)}</description>
      <category>${escapeXml(post.category)}</category>
    </item>`).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blink Ad Blog</title>
    <link>${baseUrl}</link>
    <description>검색 엔진 최적화(SEO)부터 디지털 브랜딩 전략까지. 프리미엄 SEO 에이전시 블링크애드의 인사이트.</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
