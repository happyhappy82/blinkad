import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
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
      <Navbar />

      <main className="pb-20 pt-28 md:pb-28 md:pt-32">
        <section className="mx-auto max-w-6xl px-5 md:px-6">
          <div className="mb-12 border-b border-white/10 pb-10 md:mb-14 md:flex md:items-end md:justify-between md:pb-12">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase text-brand-blue">Company News</p>
              <h1 className="text-4xl font-bold text-white md:text-5xl">회사소식</h1>
            </div>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-400 keep-all md:mt-0 md:text-right">
              블링크애드의 서비스 업데이트, 운영 공지, 브랜드 활동을 모아 전합니다.
            </p>
          </div>

          {featuredPost ? (
            <div>
              <Link
                href={`/news/${featuredPost.id}`}
                className="group grid gap-7 border-b border-white/10 pb-12 md:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] md:items-center md:gap-10 md:pb-14"
              >
                {featuredPost.imageUrls?.[0] && (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-gray-900">
                    <Image
                      src={featuredPost.imageUrls[0]}
                      alt={featuredPost.imageAlt ?? featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) calc(100vw - 40px), 680px"
                      priority
                    />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-brand-blue">
                      {featuredPost.category}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-600" />
                    <time dateTime={formatDateToISO(featuredPost.date)} className="text-gray-500">
                      {featuredPost.date}
                    </time>
                  </div>
                  <h2 className="mt-5 text-2xl font-bold leading-snug text-white transition-colors keep-all group-hover:text-brand-blue md:text-3xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-gray-400 keep-all md:text-base">
                    {featuredPost.excerpt}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    자세히 보기
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>

              {otherPosts.length > 0 && (
                <div className="divide-y divide-white/10">
                  {otherPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.id}`}
                      className="group grid gap-5 py-8 md:grid-cols-[150px_minmax(0,1fr)_auto] md:items-center md:gap-8"
                    >
                      <div className="hidden md:block">
                        {post.imageUrls?.[0] ? (
                          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-gray-900">
                          <Image
                            src={post.imageUrls[0]}
                            alt={post.imageAlt ?? post.title}
                            fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              sizes="150px"
                          />
                          </div>
                        ) : (
                          <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-white/[0.04] text-xs font-semibold text-gray-600">
                            BlinkAd
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-semibold text-brand-blue">
                            {post.category}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-gray-600" />
                          <time dateTime={formatDateToISO(post.date)} className="text-xs text-gray-500">
                            {post.date}
                          </time>
                        </div>
                        <h2 className="mt-3 text-xl font-bold leading-snug text-white transition-colors keep-all group-hover:text-brand-blue md:text-2xl">
                          {post.title}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400 keep-all">
                          {post.excerpt}
                        </p>
                      </div>
                      <ArrowUpRight className="hidden h-5 w-5 text-gray-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white md:block" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="border-y border-white/10 px-6 py-16 text-center">
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
