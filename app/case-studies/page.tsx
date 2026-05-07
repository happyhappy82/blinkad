import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import CaseStudies from '@/components/CaseStudies'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: '성공사례 - BlinkAd',
  description: '블링크애드의 실제 Google 비즈니스 프로필 운영 성과와 검색 노출, 조회수, 상호작용 데이터를 확인하세요.',
}

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-blue selection:text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo-white-nav.png" alt="BlinkAd" className="h-8 w-auto" />
          </Link>
          <div className="hidden sm:flex items-center gap-6 md:gap-8">
            <Link href="/#services" className="text-sm text-gray-400 hover:text-white transition-colors">서비스</Link>
            <Link href="/case-studies" className="text-sm text-white">성공사례</Link>
            <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">블로그</Link>
          </div>
          <Link
            href="/#contact"
            className="hidden sm:inline-flex bg-brand-blue text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            무료 진단하기
          </Link>
        </div>
      </nav>

      <main className="pt-8 md:pt-12">
        <CaseStudies />

        <section className="bg-[#050505] border-t border-white/10 py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-5 md:px-6 text-center">
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Next Case</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 keep-all">
              다음 성과는 우리 브랜드에서 만들 수 있습니다.
            </h2>
            <p className="text-base md:text-lg text-gray-400 mb-8 keep-all leading-relaxed">
              현재 검색, 지도, AI 답변 노출 상태를 먼저 확인하고 가장 빠르게 개선할 지점을 제안드립니다.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-white text-black px-7 py-3.5 rounded-full text-sm md:text-base font-semibold hover:bg-gray-200 transition-colors group"
            >
              무료 진단 신청하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
