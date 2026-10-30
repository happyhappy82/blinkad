import { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/constants'
import { ENGLISH_BLOG_POSTS, getEnglishBlogPost } from '@/lib/english-blog-index'
import { BLOG_REWRITE_DATES } from '@/lib/blog-editorial-dates'
import { languageAlternates } from '@/lib/site-languages'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.blinkad.kr/blog'

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
    ...(getEnglishBlogPost(post.id) && { alternates: { languages: languageAlternates(`/blog/${post.id}`) } }),
    lastModified: new Date(BLOG_REWRITE_DATES[post.id] || post.date.replace(/\./g, '-')),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const englishBlogPosts: MetadataRoute.Sitemap = ENGLISH_BLOG_POSTS.map((post) => ({
    url: `https://www.blinkad.kr/en/blog/${post.id}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: { languages: languageAlternates(`/blog/${post.id}`) },
  }))

  return [...blogMain, ...blogPosts, ...englishBlogPosts]
}
