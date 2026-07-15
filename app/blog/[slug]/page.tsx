import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BLOG_POSTS } from '@/constants'
import { ArrowLeft } from 'lucide-react'
import BlogCTA from '@/components/BlogCTA'
import Navbar from '@/components/Navbar'

const SITE_URL = 'https://www.blinkad.kr'
const BLOG_BASE_URL = `${SITE_URL}/blog`
const SITE_NAME = 'BlinkAd'

interface Props {
  params: Promise<{ slug: string }>
}

// 날짜 형식 변환 (2026.01.22 → 2026-01-22)
function formatDateToISO(dateStr: string): string {
  return dateStr.replace(/\./g, '-')
}

function toAbsoluteUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.id,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.id === slug)

  if (!post) {
    return {
      title: `Post Not Found - ${SITE_NAME}`,
    }
  }

  const canonicalUrl = `${BLOG_BASE_URL}/${post.id}`
  const imageUrl = post.imageUrl ? toAbsoluteUrl(post.imageUrl) : ''
  const description = post.excerpt && post.excerpt.length > 50
    ? post.excerpt
    : `${post.title} - 블링크애드 블로그에서 자세히 알아보세요. 구글 AEO·GEO 외국인 마케팅 전문 에이전시의 인사이트를 제공합니다.`

  return {
    title: `${post.title} - ${SITE_NAME} Blog`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} - ${SITE_NAME} Blog`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ] : [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 734,
        },
      ],
      locale: 'ko_KR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - ${SITE_NAME} Blog`,
      description,
      images: imageUrl ? [imageUrl] : [`${SITE_URL}/og-image.png`],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.id === slug)

  if (!post) {
    notFound()
  }

  const isoDate = formatDateToISO(post.date)
  const imageUrl = post.imageUrl ? toAbsoluteUrl(post.imageUrl) : ''
  const canonicalUrl = `${BLOG_BASE_URL}/${post.id}`

  // 관련 글 추천 (같은 카테고리, 최대 3개)
  const relatedPosts = BLOG_POSTS
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    ...(imageUrl && { image: imageUrl }),
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-white-nav.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '블로그',
        item: BLOG_BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Schema.org - Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Schema.org - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      {/* Article */}
      <article className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/blog"
            className="group inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">블로그로 돌아가기</span>
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-brand-blue/20 text-brand-blue text-sm font-medium rounded-full">
                {post.category}
              </span>
              <time dateTime={isoDate} className="text-gray-400 text-sm">{post.date}</time>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 keep-all leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center">
                <span className="text-white font-bold text-sm">BA</span>
              </div>
              <div>
                <p className="text-white font-medium">{SITE_NAME} Team</p>
                <p className="text-gray-400 text-sm">AEO·GEO Marketing Agency</p>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.imageUrl && (
            <div className="rounded-2xl overflow-hidden mb-12 relative aspect-video">
              <Image
                src={post.imageUrl}
                alt={`${post.title} - 블링크애드 블로그 대표 이미지`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
              prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
              prose-li:text-gray-300
              prose-strong:text-white
              prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
              prose-table:border-collapse prose-table:w-full prose-table:my-6
              prose-th:border prose-th:border-gray-700 prose-th:bg-gray-800 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-white
              prose-td:border prose-td:border-gray-700 prose-td:px-4 prose-td:py-2 prose-td:text-gray-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* CTA Section */}
          <BlogCTA />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-16 border-t border-white/10">
              <h2 className="text-2xl font-bold text-white mb-8">관련 글</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.id}`}
                    className="group block bg-gray-900/50 rounded-xl overflow-hidden border border-white/5 hover:border-brand-blue/50 transition-all duration-300"
                  >
                    {relatedPost.imageUrl && (
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={relatedPost.imageUrl}
                          alt={`${relatedPost.title} - 관련 글`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className="text-xs text-brand-blue font-medium">
                        {relatedPost.category}
                      </span>
                      <h3 className="text-white font-bold mt-2 group-hover:text-brand-blue transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <time className="text-xs text-gray-400 mt-2 block">
                        {relatedPost.date}
                      </time>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <a href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <img src="/logo-white-nav.png" alt={SITE_NAME} className="h-8 w-auto" />
          </a>
          <p className="text-gray-400 text-sm">AEO·GEO Marketing Agency</p>
          <p className="text-gray-500 text-xs mt-4">© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
