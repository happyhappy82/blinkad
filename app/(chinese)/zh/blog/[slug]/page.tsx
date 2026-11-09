import BlogCTA from '@/components/BlogCTA'
import { getBlogConsultation } from '@/lib/blog-consultation'
import { BLOG_POSTS } from '@/constants'
import { NEST_ARTICLES } from '@/lib/nest-content'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import fs from 'node:fs'
import path from 'node:path'
import Navbar from '@/localized/zh/components/Navbar'
import Footer from '@/localized/zh/components/Footer'
import { CHINESE_BLOG_POSTS, getChineseBlogPost, formatChineseArticleDate } from '@/lib/chinese-blog-index'
import { languageAlternates } from '@/lib/site-languages'

const SITE_URL = 'https://www.blinkad.kr'
type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return CHINESE_BLOG_POSTS.map(post => ({ slug: post.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getChineseBlogPost(slug)
  if (!post) notFound()
  const url = `${SITE_URL}/zh/blog/${post.id}`
  const image = post.imageUrl ? new URL(post.imageUrl, SITE_URL).href : `${SITE_URL}/og-image.png`
  return {
    title: `${post.title} | BlinkAd行业洞察`,
    description: post.excerpt,
    alternates: { canonical: url, languages: languageAlternates(`/blog/${post.id}`) },
    openGraph: {
      type: 'article', locale: 'zh_CN', siteName: 'BlinkAd',
      title: post.title, description: post.excerpt, url, images: [image],
      publishedTime: post.publishedAt, modifiedTime: post.publishedAt,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images: [image] },
  }
}

export default async function ChineseBlogPost({ params }: Props) {
  const { slug } = await params
  const post = getChineseBlogPost(slug)
  if (!post) notFound()
  const content = fs.readFileSync(path.join(process.cwd(), 'content/blog/zh', `${post.id}.html`), 'utf8')
  const url = `${SITE_URL}/zh/blog/${post.id}`
  const originalUrl = `${SITE_URL}/blog/${post.id}`
  const schema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: post.title, description: post.excerpt, inLanguage: 'zh-Hans',
    datePublished: post.publishedAt, dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'BlinkAd编辑部', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'BlinkAd', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, url,
  }
  const original = BLOG_POSTS.find(item => item.id === post.id) || post
  const hasProductConsultation = NEST_ARTICLES.some(item => item.slug === post.id)
  return (
    <div className="min-h-screen bg-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />
      <article lang="zh-Hans" className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-3xl">
          <Link href="/zh/blog" className="mb-8 inline-block text-sm text-gray-400 hover:text-white">← 返回行业洞察</Link>
          <header className="mb-12">
            <p className="mb-4 text-sm font-medium text-brand-blue">{post.category}</p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">{post.title}</h1>
            <div className="space-y-2 text-sm text-gray-400">
              <p>BlinkAd编辑部</p>
              <p>简体中文版发布日期：<time dateTime={post.publishedAt}>{formatChineseArticleDate(post.publishedAt)}</time></p>
              <p>韩文原文发布日期：<time dateTime={post.originalPublishedAt}>{formatChineseArticleDate(post.originalPublishedAt)}</time>{' · '}
                <a href={originalUrl} hrefLang="ko" className="underline underline-offset-4">阅读韩文原文</a>
              </p>
            </div>
          </header>
          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-2xl prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-white prose-a:text-brand-blue prose-blockquote:text-gray-300 prose-table:w-full prose-th:border prose-th:border-gray-700 prose-th:bg-gray-900 prose-th:p-3 prose-th:text-left prose-td:border prose-td:border-gray-700 prose-td:p-3"
            dangerouslySetInnerHTML={{ __html: content }} />
          {!hasProductConsultation && <BlogCTA language="zh" copy={getBlogConsultation(original, "zh")} />}
        </div>
      </article>
      <Footer />
    </div>
  )
}
