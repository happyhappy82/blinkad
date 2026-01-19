import { Metadata } from 'next'
import Link from 'next/link'
import { Search, MapPin, BarChart3, ArrowLeft, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: '서비스 - Blink Ad',
  description: '블링크애드의 프리미엄 SEO 서비스. 구글 첫 페이지 선점, 지도 최적화, 비즈니스 프로필 관리.',
}

const services = [
  {
    id: 'seo',
    title: '프리미엄 SEO',
    subtitle: '구글 첫 페이지 선점',
    description: '기술적 정교함과 콘텐츠 권위를 바탕으로 구글 검색 결과 첫 페이지를 선점합니다. 키워드 분석부터 온페이지/오프페이지 최적화까지 체계적인 SEO 전략을 제공합니다.',
    features: [
      '심층 키워드 리서치 및 경쟁사 분석',
      '기술적 SEO 진단 및 최적화',
      '고품질 콘텐츠 전략 수립',
      '백링크 프로필 구축',
      '월간 성과 리포트 제공'
    ],
    icon: Search
  },
  {
    id: 'local',
    title: '지도 최적화 (Local SEO)',
    subtitle: '지역 검색 1위',
    description: '네이버 지도, 구글 지도 검색에서 귀하의 비즈니스가 가장 먼저 노출되도록 최적화합니다. 지역 고객의 방문과 전화 문의를 극대화합니다.',
    features: [
      '구글/네이버 비즈니스 프로필 최적화',
      '지역 키워드 타겟팅',
      '리뷰 관리 및 평점 개선 전략',
      '로컬 디렉토리 등록',
      '지역 기반 콘텐츠 제작'
    ],
    icon: MapPin
  },
  {
    id: 'profile',
    title: '비즈니스 프로필 관리',
    subtitle: '디지털 평판 관리',
    description: '구글 비즈니스 프로필을 체계적으로 관리하여 온라인 가시성과 신뢰도를 높입니다. 고객 리뷰 대응부터 정보 업데이트까지 전담 관리합니다.',
    features: [
      '프로필 정보 최적화',
      '사진/동영상 콘텐츠 관리',
      '고객 리뷰 모니터링 및 대응',
      'Q&A 섹션 관리',
      '인사이트 분석 및 개선'
    ],
    icon: BarChart3
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
            데이터 기반의 체계적인 SEO 전략으로<br />
            귀하의 비즈니스 성장을 가속화합니다.
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
