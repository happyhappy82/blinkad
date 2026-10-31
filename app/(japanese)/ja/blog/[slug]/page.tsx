import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import fs from 'node:fs'
import path from 'node:path'
import Navbar from '@/localized/ja/components/Navbar'
import Footer from '@/localized/ja/components/Footer'
import { JAPANESE_BLOG_POSTS, getJapaneseBlogPost, formatJapaneseArticleDate } from '@/lib/japanese-blog-index'
import { languageAlternates } from '@/lib/site-languages'

const SITE_URL = 'https://www.blinkad.kr'
type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return JAPANESE_BLOG_POSTS.map(post => ({ slug: post.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getJapaneseBlogPost(slug)
  if (!post) notFound()
  const url = `${SITE_URL}/ja/blog/${post.id}`
  const image = post.imageUrl ? new URL(post.imageUrl, SITE_URL).href : `${SITE_URL}/og-image.png`
  return {
    title: `${post.title} | BlinkAdインサイト`,
    description: post.excerpt,
    alternates: { canonical: url, languages: languageAlternates(`/blog/${post.id}`) },
    openGraph: {
      type: 'article', locale: 'ja_JP', siteName: 'BlinkAd',
      title: post.title, description: post.excerpt, url, images: [image],
      publishedTime: post.publishedAt, modifiedTime: post.publishedAt,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images: [image] },
  }
}

export default async function JapaneseBlogPost({ params }: Props) {
  const { slug } = await params
  const post = getJapaneseBlogPost(slug)
  if (!post) notFound()
  const content = fs.readFileSync(path.join(process.cwd(), 'content/blog/ja', `${post.id}.html`), 'utf8')
  const url = `${SITE_URL}/ja/blog/${post.id}`
  const originalUrl = `${SITE_URL}/blog/${post.id}`
  const schema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: post.title, description: post.excerpt, inLanguage: 'ja',
    datePublished: post.publishedAt, dateModified: post.publishedAt,
    author: { '@type': 'Organization', name: 'BlinkAd編集部', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'BlinkAd', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url }, url,
  }
  return (
    <div className="min-h-screen bg-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Navbar />
      <article lang="ja" className="px-6 pb-20 pt-32">
        <div className="mx-auto max-w-3xl">
          <Link href="/ja/blog" className="mb-8 inline-block text-sm text-gray-400 hover:text-white">← インサイト一覧に戻る</Link>
          <header className="mb-12">
            <p className="mb-4 text-sm font-medium text-brand-blue">{post.category}</p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">{post.title}</h1>
            <div className="space-y-2 text-sm text-gray-400">
              <p>BlinkAd編集部</p>
              <p>日本語版公開日：<time dateTime={post.publishedAt}>{formatJapaneseArticleDate(post.publishedAt)}</time></p>
              <p>韓国語原文公開日：<time dateTime={post.originalPublishedAt}>{formatJapaneseArticleDate(post.originalPublishedAt)}</time>{' · '}
                <a href={originalUrl} hrefLang="ko" className="underline underline-offset-4">韓国語の原文を読む</a>
              </p>
            </div>
          </header>
          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-2xl prose-p:text-gray-300 prose-p:leading-relaxed prose-strong:text-white prose-a:text-brand-blue prose-blockquote:text-gray-300 prose-table:w-full prose-th:border prose-th:border-gray-700 prose-th:bg-gray-900 prose-th:p-3 prose-th:text-left prose-td:border prose-td:border-gray-700 prose-td:p-3"
            dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </article>
      <Footer />
    </div>
  )
}
