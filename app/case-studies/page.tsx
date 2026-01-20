import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, TrendingUp, Quote, Star, CheckCircle, Clock } from 'lucide-react'
import { CASE_STUDIES } from '@/constants'

export const metadata: Metadata = {
  title: '성공사례 - Blink Ad',
  description: '블링크애드와 함께 성장한 맛집들의 실제 성공 스토리. 구글맵 상위노출, 릴스 바이럴, 매출 증가 사례.',
}

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo-white-nav.png" alt="Blink Ad" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/services" className="text-sm text-gray-400 hover:text-white transition-colors">서비스</Link>
            <Link href="/case-studies" className="text-sm text-white">성공사례</Link>
            <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">블로그</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="group inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">홈으로 돌아가기</span>
          </Link>
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-4">Success Stories</p>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">실제 성과로<br />증명합니다.</h1>
          <p className="text-xl text-gray-500 keep-all max-w-2xl">
            말이 아닌 숫자로 보여드립니다. 블링크애드와 함께 성장한 맛집들의 실제 성공 스토리입니다.
          </p>
        </div>
      </header>

      {/* Stats Banner */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '50+', label: '성공 프로젝트' },
            { value: '98%', label: '고객 만족도' },
            { value: '3개월', label: '평균 성과 달성' },
            { value: '4.9', label: '평균 평점' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-3xl md:text-4xl font-bold text-brand-blue mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Case Studies */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div className="space-y-24">
          {CASE_STUDIES.map((study, index) => (
            <article key={study.id} className="relative">
              {/* 번호 뱃지 */}
              <div className="absolute -left-4 md:-left-12 top-0 w-8 h-8 md:w-12 md:h-12 bg-brand-blue rounded-full flex items-center justify-center font-bold text-lg md:text-xl">
                {index + 1}
              </div>

              <div className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-brand-dark to-black border border-white/10">
                {/* 이미지 헤더 */}
                <div className="relative h-64 md:h-96 overflow-hidden">
                  <img
                    src={study.imageUrl}
                    alt={study.client}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Before/After 오버레이 */}
                  <div className="absolute top-6 left-6 flex gap-3">
                    <div className="bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-full">
                      <p className="text-xs text-white/80">BEFORE</p>
                      <p className="text-sm font-bold text-white">{study.beforeValue}</p>
                    </div>
                    <div className="bg-green-500/90 backdrop-blur-sm px-4 py-2 rounded-full">
                      <p className="text-xs text-white/80">AFTER</p>
                      <p className="text-sm font-bold text-white">{study.afterValue}</p>
                    </div>
                  </div>

                  {/* 기간 뱃지 */}
                  <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4 text-brand-blue" />
                    <span className="text-sm font-medium">{study.duration}</span>
                  </div>

                  {/* 타이틀 오버레이 */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-2 text-brand-blue text-sm font-medium mb-2">
                      <span className="w-2 h-2 bg-brand-blue rounded-full" />
                      {study.industry}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">{study.client}</h2>
                    <p className="text-gray-400">{study.description}</p>
                  </div>
                </div>

                {/* 컨텐츠 */}
                <div className="p-8 md:p-12">
                  <div className="grid md:grid-cols-2 gap-12">
                    {/* 왼쪽: 주요 성과 */}
                    <div>
                      <div className="flex items-baseline gap-3 mb-8">
                        <span className="text-6xl md:text-7xl font-bold text-brand-blue">{study.value}</span>
                        <span className="text-xl text-gray-400">{study.metric}</span>
                      </div>

                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        주요 성과
                      </h3>
                      <ul className="space-y-3">
                        {study.keyResults.map((result, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 오른쪽: 고객 후기 */}
                    <div>
                      <div className="relative bg-white/5 rounded-2xl p-8 border border-white/10 h-full">
                        <Quote className="absolute -top-4 -left-2 w-10 h-10 text-brand-blue/40" />

                        <p className="text-lg text-gray-200 italic mb-8 keep-all leading-relaxed">
                          "{study.testimonial}"
                        </p>

                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-brand-blue to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-white">{study.customerName[0]}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-white text-lg">{study.customerName}</p>
                            <p className="text-gray-500">{study.customerRole}</p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* CTA */}
      <section className="bg-gradient-to-b from-black to-brand-dark border-t border-white/10 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">다음 성공 사례의<br />주인공이 되세요</h2>
          <p className="text-gray-400 mb-8 keep-all max-w-xl mx-auto">
            무료 상담을 통해 매장에 맞는 최적의 마케팅 전략을 제안해 드립니다.
            지금 바로 시작하세요.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-full font-medium hover:bg-blue-600 transition-colors text-lg group"
          >
            무료 상담 받기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Link href="/" className="inline-block mb-4 hover:opacity-80 transition-opacity">
            <img src="/logo-white-nav.png" alt="Blink Ad" className="h-8 w-auto" />
          </Link>
          <p className="text-gray-500 text-sm">Premium SEO Agency</p>
          <p className="text-gray-600 text-xs mt-4">© {new Date().getFullYear()} Blink Ad. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
