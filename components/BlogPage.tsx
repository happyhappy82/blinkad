'use client';

import React from 'react';
import Link from 'next/link';
import { BLOG_POSTS } from '@/constants';

const BlogPage: React.FC = () => {
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

      <section className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header */}
          <div className="mb-20">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Insights.</h1>
            <p className="text-xl text-gray-400 max-w-2xl keep-all leading-relaxed">
              검색 엔진 최적화(SEO)부터 디지털 브랜딩 전략까지.<br/>
              블링크애드의 전문적인 인사이트를 만나보세요.
            </p>
          </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
          {BLOG_POSTS.map((post) => (
            <article key={post.id}>
              <Link
                href={`/blog/${post.id}`}
                className="group cursor-pointer flex flex-col h-full"
              >
                <div className="relative overflow-hidden rounded-2xl mb-6 aspect-[4/3] bg-gray-900 border border-white/5">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-xs font-medium text-white">{post.category}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span>{post.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>Blink Ad Team</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-brand-blue transition-colors keep-all leading-snug">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed keep-all">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <span className="text-brand-blue text-sm font-semibold group-hover:underline underline-offset-4">Read Article →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Newsletter / CTA */}
        <div className="mt-32 p-12 rounded-3xl bg-gray-900 border border-white/5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-blue/5" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">최신 마케팅 트렌드를 놓치지 마세요.</h3>
            <p className="text-gray-400 mb-8">
              매주 발행되는 블링크애드의 뉴스레터를 통해 경쟁사보다 한발 앞서 나가세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                className="px-6 py-3 rounded-full bg-black border border-white/10 text-white focus:outline-none focus:border-brand-blue w-full sm:w-80"
              />
              <button className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors">
                구독하기
              </button>
            </div>
          </div>
        </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Link href="https://blinkad.kr" className="text-xl font-semibold tracking-tight mb-4 inline-block hover:text-gray-300 transition-colors">
            Blink Ad
          </Link>
          <p className="text-gray-500 text-sm">Premium SEO Agency</p>
          <p className="text-gray-600 text-xs mt-4">© {new Date().getFullYear()} Blink Ad. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
