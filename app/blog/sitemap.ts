import { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/constants'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://blog.blinkad.kr'

  // 블로그 메인 페이지
  const blogMain: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // 동적 블로그 포스트들
  const blogPosts: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/${post.id}`,
    lastModified: new Date(post.date.replace(/\./g, '-')),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...blogMain, ...blogPosts]
}
