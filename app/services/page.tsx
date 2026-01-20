import { Metadata } from 'next'
import Link from 'next/link'
import { Video, MapPin, Globe, ArrowLeft, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: '서비스 - Blink Ad',
  description: '블링크애드의 프리미엄 서비스. 맛집 릴스 제작대행, 구글맵 상위노출, SEO 웹사이트 제작.',
}

const services = [
  {
    id: 'reels',
    title: '맛집 릴스 제작대행',
    subtitle: '바이럴 콘텐츠 제작',
    description: '인스타그램에서 폭발적인 반응을 이끌어내는 맛집 릴스 콘텐츠를 기획부터 촬영, 편집까지 원스톱으로 제작해 드립니다. 트렌디한 영상으로 매장 인지도를 높이세요.',
    features: [
      '트렌드 분석 기반 콘텐츠 기획',
      '전문 촬영팀의 현장 촬영',
      '바이럴 최적화 편집 및 자막',
      '인스타그램 알고리즘 맞춤 업로드',
      '성과 분석 리포트 제공'
    ],
    icon: Video
  },
  {
    id: 'maps',
    title: '구글맵 상위노출',
    subtitle: '지역 검색 1위',
    description: '구글 지도 검색에서 귀하의 비즈니스가 가장 먼저 노출되도록 최적화합니다. 지역 고객의 방문과 전화 문의를 극대화하여 실질적인 매출 증가를 만들어냅니다.',
    features: [
      '구글 비즈니스 프로필 최적화',
      '지역 키워드 타겟팅',
      '리뷰 관리 및 평점 개선 전략',
      '로컬 디렉토리 등록',
      '경쟁사 분석 및 차별화 전략'
    ],
    icon: MapPin
  },
  {
    id: 'website',
    title: 'SEO 웹사이트 제작',
    subtitle: '검색 최적화 사이트',
    description: '처음부터 SEO를 고려하여 설계된 고성능 웹사이트를 제작합니다. 빠른 로딩 속도, 모바일 최적화, 구조화된 데이터까지 구글이 좋아하는 사이트를 만들어 드립니다.',
    features: [
      '모바일 퍼스트 반응형 디자인',
      'Core Web Vitals 최적화',
      '구조화된 데이터(Schema) 적용',
      'SEO 친화적 URL 및 메타 설정',
      '구글 서치콘솔 연동 및 설정'
    ],
    icon: Globe
  }
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img src="/logo-white-nav.png" alt="Blink Ad" className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/services" className="text-sm text-white">서비스</Link>
            <Link href="/case-studies" className="text-sm text-gray-400 hover:text-white transition-colors">성공사례</Link>
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Services.</h1>
          <p className="text-xl text-gray-500 keep-all">
            맛집 마케팅의 모든 것.<br />
            온라인에서 발견되고 선택받는 매장을 만듭니다.
          </p>
        </div>
      </header>

      {/* Services */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div className="space-y-24">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <section key={service.id} className="grid md:grid-cols-2 gap-12 items-start">
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 mb-6">
                    <IconComponent className="w-8 h-8 text-brand-blue" />
                  </div>
                  <p className="text-brand-blue text-sm font-medium mb-2">{service.subtitle}</p>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{service.title}</h2>
                  <p className="text-gray-400 leading-relaxed mb-8 keep-all">{service.description}</p>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
                  >
                    무료 상담 신청
                    <span>→</span>
                  </Link>
                </div>
                <div className={`bg-white/5 rounded-3xl p-8 border border-white/10 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <h3 className="text-lg font-semibold mb-6">포함 서비스</h3>
                  <ul className="space-y-4">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )
          })}
        </div>
      </main>

      {/* CTA */}
      <section className="bg-white/5 border-t border-white/10 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">지금 바로 시작하세요</h2>
          <p className="text-gray-400 mb-8 keep-all">
            무료 상담을 통해 매장에 맞는 최적의 마케팅 전략을<br />
            제안해 드립니다.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-full font-medium hover:bg-blue-600 transition-colors text-lg"
          >
            무료 상담 받기
            <span>→</span>
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
