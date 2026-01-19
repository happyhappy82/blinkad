import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Phone, Target } from 'lucide-react'

export const metadata: Metadata = {
  title: '성공사례 - Blink Ad',
  description: '블링크애드의 SEO 성공사례. 실제 고객사들의 트래픽 증가와 비즈니스 성장 스토리.',
}

const caseStudies = [
  {
    id: '1',
    client: '어반 에스테틱',
    industry: '뷰티/에스테틱',
    metric: '유기적 트래픽',
    value: '+420%',
    description: '6개월 만에 시장 리더로 도약한 성공 사례.',
    details: '경쟁이 치열한 뷰티 업계에서 차별화된 콘텐츠 전략과 기술적 SEO 최적화를 통해 업계 평균 대비 4배 이상의 트래픽 성장을 달성했습니다.',
    icon: TrendingUp,
    color: 'blue'
  },
  {
    id: '2',
    client: '로펌 파트너스',
    industry: '법률 서비스',
    metric: '지도 전화 문의',
    value: '3.5x',
    description: '로컬 지배력 강화 전략 실행.',
    details: '구글 비즈니스 프로필 최적화와 지역 키워드 타겟팅을 통해 지도 검색 노출 1위를 달성하고, 전화 문의가 3.5배 증가했습니다.',
    icon: Phone,
    color: 'green'
  },
  {
    id: '3',
    client: '테크 솔루션',
    industry: 'IT/SaaS',
    metric: '리드 전환',
    value: '+180%',
    description: '구매 의도가 높은 키워드 타겟팅.',
    details: 'B2B 고객사를 위한 심층 키워드 분석과 컨버전 최적화를 통해 양질의 리드 확보와 실제 계약 전환율을 대폭 개선했습니다.',
    icon: Target,
    color: 'purple'
  }
]

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight hover:text-gray-300 transition-colors">
            Blink Ad
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Success Stories.</h1>
          <p className="text-xl text-gray-500 keep-all">
            데이터가 증명하는 블링크애드의 성과.<br />
            실제 고객사들의 성장 스토리를 확인하세요.
          </p>
        </div>
      </header>

      {/* Case Studies */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div className="space-y-12">
          {caseStudies.map((study) => {
            const IconComponent = study.icon
            return (
              <article key={study.id} className="bg-white/5 rounded-3xl p-8 md:p-12 border border-white/10 hover:border-white/20 transition-colors">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20">
                        <IconComponent className="w-6 h-6 text-brand-blue" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{study.client}</h2>
                        <p className="text-gray-500 text-sm">{study.industry}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed keep-all">{study.details}</p>
                  </div>
                  <div className="flex flex-col justify-center items-center md:items-end text-center md:text-right">
                    <p className="text-gray-500 text-sm mb-2">{study.metric}</p>
                    <p className="text-5xl md:text-6xl font-bold text-brand-blue mb-2">{study.value}</p>
                    <p className="text-gray-400 text-sm keep-all">{study.description}</p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      {/* CTA */}
      <section className="bg-white/5 border-t border-white/10 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">다음 성공 사례의 주인공이 되세요</h2>
          <p className="text-gray-400 mb-8 keep-all">
            무료 SEO 진단을 통해 귀하의 웹사이트 현황을 파악하고<br />
            맞춤형 개선 전략을 제안해 드립니다.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-full font-medium hover:bg-blue-600 transition-colors text-lg"
          >
            무료 진단 받기
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Link href="/" className="text-xl font-semibold tracking-tight mb-4 inline-block">Blink Ad</Link>
          <p className="text-gray-500 text-sm">Premium SEO Agency</p>
          <p className="text-gray-600 text-xs mt-4">© {new Date().getFullYear()} Blink Ad. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
