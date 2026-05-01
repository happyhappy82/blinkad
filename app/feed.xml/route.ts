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
    <description>구글 AEO·GEO 외국인 마케팅 전문 블링크애드의 인사이트. 의료관광·맛집·로컬 브랜드의 검색·AI 답변 노출 전략과 케이스를 다룹니다.</description>
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
