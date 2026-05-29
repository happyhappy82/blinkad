import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, FileText, Bot, ArrowLeft, Check, Globe2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: '외국인마케팅 서비스 | 구글 비즈니스 프로필·블로그·AEO 운영 - BlinkAd',
  description: '블링크애드는 외국인 고객 유입을 위해 Google 비즈니스 프로필, 구글맵 리뷰, 브랜드 블로그, 웹사이트 콘텐츠, AI 검색 최적화를 연결해 운영합니다.',
  alternates: {
    canonical: 'https://www.blinkad.kr/services',
  },
  openGraph: {
    title: '외국인마케팅 서비스 | BlinkAd',
    description: 'Google Maps, 리뷰, 웹사이트, 블로그, AI 검색을 연결해 외국인 고객 유입 구조를 만듭니다.',
    url: 'https://www.blinkad.kr/services',
    siteName: 'BlinkAd',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://www.blinkad.kr/og-image.png',
        width: 1200,
        height: 734,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '외국인마케팅 서비스 | BlinkAd',
    description: 'Google Maps, 리뷰, 웹사이트, 블로그, AI 검색을 연결해 외국인 고객 유입 구조를 만듭니다.',
    images: ['https://www.blinkad.kr/og-image.png'],
  },
}

const services = [
  {
    id: 'foreign-marketing',
    title: '외국인마케팅 대행',
    subtitle: '외국인 고객 유입 설계',
    description: '식당, 카페, 병원, 뷰티, 관광상권 매장이 Google 검색과 Google Maps에서 발견되고 문의로 이어지도록 프로필, 리뷰, 콘텐츠, 문의 동선을 함께 설계합니다.',
    features: [
      '외국인 고객 검색 동선 진단',
      'Google Maps 경쟁 업체 비교',
      '업종별 다국어 정보 구조 정리',
      '리뷰·사진·게시물 운영 기준 수립',
      '웹사이트·블로그·프로필 내부 연결'
    ],
    icon: Globe2,
    href: '/foreign-marketing',
    cta: '외국인마케팅 보기'
  },
  {
    id: 'gbp',
    title: '구글 비즈니스 프로필 관리',
    subtitle: '지역 검색 기반 구축',
    description: '지역 검색 노출과 지도 신뢰도를 높이기 위해 구글 비즈니스 프로필을 체계적으로 운영합니다. 비즈니스 정보를 최신 상태로 유지하고, 지역 검색에서 발견될 가능성을 높입니다.',
    features: [
      '구글 비즈니스 프로필 기본 정보 최적화',
      '카테고리 및 진료 관련 항목 정비',
      '리뷰 응답 및 평판 관리 운영',
      '게시물·사진·업데이트 관리',
      '월간 인사이트 점검 및 리포트 제공'
    ],
    icon: MapPin,
    href: '/foreign-marketing#contact',
    cta: '무료 진단 신청'
  },
  {
    id: 'blog',
    title: '브랜드 블로그 운영',
    subtitle: '브랜드 콘텐츠 축적',
    description: '브랜드의 전문성과 강점을 꾸준한 콘텐츠로 정리해 브랜드 자산을 쌓습니다. 검색 의도를 반영한 운영으로 신뢰도 높은 콘텐츠 기반을 만듭니다.',
    features: [
      '진료과목·시술 키워드 기반 주제 기획',
      '전문성 중심 콘텐츠 작성 및 발행',
      '브랜드 톤앤매너에 맞춘 블로그 운영',
      '내부 링크 및 카테고리 구조 관리',
      '월간 운영 리포트 제공'
    ],
    icon: FileText,
    href: '/blog',
    cta: '콘텐츠 보기'
  },
  {
    id: 'ai-search',
    title: 'AI 검색 최적화',
    subtitle: 'AEO · GEO 구축',
    description: 'AEO·GEO 기반으로 ChatGPT, Perplexity, Google AI 검색에서 브랜드가 인용될 수 있도록 콘텐츠 구조와 엔티티 신호를 설계합니다. 단순 노출이 아니라 AI 검색 환경에 맞는 디지털 자산을 구축합니다.',
    features: [
      '질문형 랜딩 구조 및 답변형 콘텐츠 설계',
      'FAQ·Schema·엔티티 최적화',
      'ChatGPT·Perplexity·Google AI 검색 대응',
      '웹사이트·블로그·GBP 연결 구조 정비',
      'AI 검색 노출 및 인용 흐름 모니터링'
    ],
    icon: Bot,
    href: '/foreign-marketing',
    cta: '구조 보기'
  }
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Header */}
      <header className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="group inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">홈으로 돌아가기</span>
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 keep-all">외국인 고객 유입을 위한 블링크애드 서비스</h1>
          <p className="text-xl text-gray-500 keep-all">
            Google Maps, 리뷰, 웹사이트, 블로그, AI 검색을 연결해<br />
            온라인에서 발견되고 선택받는 브랜드를 만듭니다.
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
                    href={service.href}
                    className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-full font-medium hover:bg-blue-600 transition-colors"
                  >
                    {service.cta}
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
            href="/foreign-marketing#contact"
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-8 py-4 rounded-full font-medium hover:bg-blue-600 transition-colors text-lg"
          >
            외국인 고객 유입 무료진단
            <span>→</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
