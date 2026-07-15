import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { NEWS_POSTS } from '@/constants/news';

const SITE_URL = 'https://www.blinkad.kr';
const NEWS_URL = `${SITE_URL}/news`;

export const metadata: Metadata = {
  title: '회사소식 | BlinkAd',
  description: '블링크애드의 서비스 업데이트, 운영 공지, 브랜드 소식을 전하는 회사소식 게시판입니다.',
  alternates: {
    canonical: NEWS_URL,
  },
  openGraph: {
    title: '회사소식 | BlinkAd',
    description: '블링크애드의 서비스 업데이트, 운영 공지, 브랜드 소식을 전하는 회사소식 게시판입니다.',
    url: NEWS_URL,
    siteName: 'BlinkAd',
    locale: 'ko_KR',
    type: 'website',
  },
};

function formatDateToISO(dateStr: string): string {
  return dateStr.replace(/\./g, '-');
}

export default function NewsPage() {
  const [featuredPost, ...otherPosts] = NEWS_POSTS;

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center py-4">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo-white-nav.png" alt="BlinkAd" className="h-8 w-auto" />
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/foreign-marketing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">외국인마케팅</Link>
            <Link href="/services" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">서비스</Link>
            <Link href="/case-studies" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">성공사례</Link>
            <Link href="/blog" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">블로그</Link>
            <Link href="/news" className="text-sm font-medium text-white transition-colors">회사소식</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">문의하기</Link>
          </div>

          <Link
            href="/contact"
            className="bg-brand-blue text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
          >
            무료 진단하기
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-24">
        <section className="max-w-7xl mx-auto px-6">
          <div className="mb-16 md:mb-20">
            <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-brand-blue">Company News</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">회사소식.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 keep-all md:text-xl">
              블링크애드의 서비스 업데이트, 운영 공지, 브랜드 활동을 모아 전합니다.
            </p>
          </div>

          {featuredPost ? (
            <div className="space-y-8">
              <Link
                href={`/news/${featuredPost.id}`}
                className="group grid gap-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-brand-blue/50 md:grid-cols-[1.1fr_0.9fr] md:p-8"
              >
                {featuredPost.imageUrls?.[0] && (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-gray-900">
                    <Image
                      src={featuredPost.imageUrls[0]}
                      alt={featuredPost.imageAlt ?? featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 55vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
                  </div>
                )}

                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <span className="inline-flex rounded-full border border-brand-blue/20 bg-brand-blue/15 px-3 py-1 text-xs font-semibold text-brand-blue">
                      {featuredPost.category}
                    </span>
                    <time dateTime={formatDateToISO(featuredPost.date)} className="mt-5 block text-sm text-gray-400">
                      {featuredPost.date}
                    </time>
                  </div>
                  <span className="text-sm font-semibold text-brand-blue group-hover:underline underline-offset-4">
                    자세히 보기
                  </span>
                </div>

                <div>
                  <h2 className="text-3xl font-bold leading-tight text-white keep-all group-hover:text-brand-blue transition-colors md:text-5xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-400 keep-all md:text-lg">
                    {featuredPost.excerpt}
                  </p>
                </div>
              </Link>

              {otherPosts.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {otherPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.id}`}
                      className="group overflow-hidden rounded-xl border border-white/10 bg-gray-900/40 transition-colors hover:border-brand-blue/50"
                    >
                      {post.imageUrls?.[0] && (
                        <div className="relative aspect-video overflow-hidden bg-gray-950">
                          <Image
                            src={post.imageUrls[0]}
                            alt={post.imageAlt ?? post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="mb-8 flex items-center justify-between gap-4">
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-gray-300">
                            {post.category}
                          </span>
                          <time dateTime={formatDateToISO(post.date)} className="text-xs text-gray-500">
                            {post.date}
                          </time>
                        </div>
                        <h2 className="text-xl font-bold leading-snug text-white keep-all group-hover:text-brand-blue transition-colors">
                          {post.title}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed text-gray-400 keep-all">
                          {post.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <h2 className="text-2xl font-bold text-white">등록된 회사소식이 없습니다.</h2>
              <p className="mt-3 text-gray-400">새로운 소식이 생기면 이곳에 안내드리겠습니다.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
