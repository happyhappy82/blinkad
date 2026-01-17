import type { APIRoute } from 'astro';
import { BLOG_POSTS } from '../constants';

const siteUrl = 'https://blinkad.co.kr';

export const GET: APIRoute = async () => {
  const sortedPosts = [...BLOG_POSTS].sort((a, b) => {
    const dateA = new Date(a.date.replace(/\./g, '-'));
    const dateB = new Date(b.date.replace(/\./g, '-'));
    return dateB.getTime() - dateA.getTime();
  });

  const rssItems = sortedPosts.map((post) => {
    const dateISO = `${post.date.replace(/\./g, '-')}T00:00:00+09:00`;
    const description = post.excerpt || post.title;

    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.id}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.id}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${new Date(dateISO).toUTCString()}</pubDate>
      <category>${post.category}</category>
      <enclosure url="${post.imageUrl}" type="image/jpeg" />
    </item>`;
  }).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Blink Ad Blog</title>
    <description>검색 엔진 최적화(SEO)부터 디지털 브랜딩 전략까지. 프리미엄 SEO 에이전시 블링크애드의 인사이트.</description>
    <link>${siteUrl}/blog</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro</generator>
    <image>
      <url>${siteUrl}/favicon.svg</url>
      <title>Blink Ad Blog</title>
      <link>${siteUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'max-age=3600',
    },
  });
};
