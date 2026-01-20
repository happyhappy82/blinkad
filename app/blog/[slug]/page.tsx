import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BLOG_POSTS } from '@/constants'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
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

  return {
    title: `${post.title} - Blink Ad Blog`,
    description: post.excerpt || post.title,
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.id === slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation - 메인 사이트와 동일 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          <Link
            href="https://blinkad.kr"
            className="hover:opacity-80 transition-opacity"
          >
            <img src="/logo-white-nav.png" alt="Blink Ad" className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="https://blinkad.kr/services" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">서비스</Link>
            <Link href="https://blinkad.kr/case-studies" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">성공사례</Link>
            <Link href="/" className="text-sm font-medium text-white transition-colors">블로그</Link>
            <Link href="https://blinkad.kr/#contact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">문의하기</Link>
          </div>

          <Link
            href="https://blinkad.kr/#contact"
            className="bg-brand-blue text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            무료 진단하기
          </Link>
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
              <time className="text-gray-500 text-sm">{post.date}</time>
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
                <p className="text-gray-500 text-sm">Premium SEO Agency</p>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="rounded-2xl overflow-hidden mb-12">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full aspect-video object-cover"
            />
          </div>

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
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Link href="https://blinkad.kr" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <img src="/logo-white-nav.png" alt="Blink Ad" className="h-8 w-auto" />
          </Link>
          <p className="text-gray-500 text-sm">Premium SEO Agency</p>
          <p className="text-gray-600 text-xs mt-4">© {new Date().getFullYear()} Blink Ad. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
