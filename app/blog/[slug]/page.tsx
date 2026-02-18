import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BLOG_POSTS } from '@/constants'
import { ArrowLeft } from 'lucide-react'
import BlogCTA from '@/components/BlogCTA'

interface Props {
  params: Promise<{ slug: string }>
}

// 날짜 형식 변환 (2026.01.22 → 2026-01-22)
function formatDateToISO(dateStr: string): string {
  return dateStr.replace(/\./g, '-')
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
      title: 'Post Not Found - Blink Ad',
    }
  }

  const canonicalUrl = `https://blog.blinkad.kr/${post.id}`
  const description = post.excerpt && post.excerpt.length > 50
    ? post.excerpt
    : `${post.title} - 블링크애드 블로그에서 자세히 알아보세요. 프리미엄 SEO 에이전시의 전문적인 인사이트를 제공합니다.`

  return {
    title: `${post.title} - Blink Ad Blog`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${post.title} - Blink Ad Blog`,
      description,
      url: canonicalUrl,
      siteName: 'Blink Ad',
      images: post.imageUrl ? [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
        },
      ] : [
        {
          url: 'https://blinkad.kr/og-image.png',
          width: 1200,
          height: 734,
        },
      ],
      locale: 'ko_KR',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - Blink Ad Blog`,
      description,
      images: post.imageUrl ? [post.imageUrl] : ['https://blinkad.kr/og-image.png'],
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

  // 관련 글 추천 (같은 카테고리, 최대 3개)
  const relatedPosts = BLOG_POSTS
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, 3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    ...(post.imageUrl && { image: post.imageUrl }),
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      '@type': 'Organization',
      name: 'Blink Ad',
      url: 'https://blinkad.kr',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Blink Ad',
      logo: {
        '@type': 'ImageObject',
        url: 'https://blinkad.kr/logo-white-nav.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://blog.blinkad.kr/${post.id}`,
    },
    url: `https://blog.blinkad.kr/${post.id}`,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: 'https://blinkad.kr',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '블로그',
        item: 'https://blog.blinkad.kr',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://blog.blinkad.kr/${post.id}`,
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

      {/* Navigation - 메인 사이트와 동일 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          <a
            href="https://blinkad.kr"
            className="hover:opacity-80 transition-opacity"
          >
            <img src="/logo-white-nav.png" alt="Blink Ad" className="h-8 w-auto" />
          </a>

          <div className="hidden md:flex space-x-8">
            <a href="https://blinkad.kr/services" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">서비스</a>
            <a href="https://blinkad.kr/case-studies" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">성공사례</a>
            <Link href="/blog" className="text-sm font-medium text-white transition-colors">블로그</Link>
            <a href="https://blinkad.kr/#contact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">문의하기</a>
          </div>

          <a
            href="https://blinkad.kr/#contact"
            className="bg-brand-blue text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            무료 진단하기
          </a>
        </div>
      </nav>

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
                <p className="text-white font-medium">Blink Ad Team</p>
                <p className="text-gray-400 text-sm">Premium SEO Agency</p>
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
          <a href="https://blinkad.kr" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <img src="/logo-white-nav.png" alt="Blink Ad" className="h-8 w-auto" />
          </a>
          <p className="text-gray-400 text-sm">Premium SEO Agency</p>
          <p className="text-gray-500 text-xs mt-4">© {new Date().getFullYear()} Blink Ad. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
