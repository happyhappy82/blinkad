import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Globe2,
  Languages,
  MapPinned,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.blinkad.kr'
const PAGE_URL = `${SITE_URL}/foreign-marketing`

export const metadata: Metadata = {
  title: '외국인마케팅 대행사 | 구글맵·리뷰·다국어 콘텐츠 외국인 고객 유입 - BlinkAds',
  description:
    '블링크애드는 Google 비즈니스 프로필, 구글맵 리뷰, 다국어 콘텐츠, 웹사이트·블로그를 연결해 외국인 고객 유입을 설계하는 외국인마케팅 대행사입니다. 식당, 카페, 병원, 뷰티, 로컬 브랜드의 검색 노출과 문의 전환을 진단합니다.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: '외국인마케팅 대행사 | BlinkAds',
    description:
      '구글맵, 리뷰, 다국어 콘텐츠, 웹사이트·블로그를 연결해 외국인 고객이 검색하고 비교하고 문의하는 흐름을 설계합니다.',
    url: PAGE_URL,
    siteName: 'BlinkAds',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 734,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '외국인마케팅 대행사 | BlinkAds',
    description:
      '구글맵, 리뷰, 다국어 콘텐츠, 웹사이트·블로그를 연결해 외국인 고객 유입과 문의 전환을 설계합니다.',
    images: [`${SITE_URL}/og-image.png`],
  },
}

const industries = [
  '식당·카페',
  '피부과·병원',
  '미용실·뷰티샵',
  '숙박·체험',
  '관광상권 매장',
  '로컬 브랜드',
]

const problems = [
  {
    icon: MapPinned,
    title: 'Google Maps에서 비교되지 않음',
    description: '외국인 고객은 방문 전 Google 검색과 Google Maps에서 위치, 사진, 리뷰, 영업시간을 먼저 확인합니다.',
  },
  {
    icon: Languages,
    title: '외국어 정보가 부족함',
    description: '메뉴, 서비스, 예약, 결제 안내가 한국어 중심이면 검색 후에도 실제 방문이나 문의로 이어지기 어렵습니다.',
  },
  {
    icon: MessageSquareText,
    title: '리뷰와 답변이 전환을 막음',
    description: '리뷰 언어, 답변 톤, 최근 운영 흔적이 부족하면 같은 상권의 경쟁 매장으로 쉽게 넘어갑니다.',
  },
]

const processSteps = [
  {
    title: '현재 노출 진단',
    description: '브랜드명, 업종 키워드, 지역 키워드로 Google 검색·지도 노출 상태와 경쟁 업체를 확인합니다.',
  },
  {
    title: '프로필 기본 정보 정비',
    description: '카테고리, 소개문, 사진, 영업정보, 서비스·메뉴 정보를 외국인 고객 기준으로 정리합니다.',
  },
  {
    title: '리뷰·게시물 운영',
    description: '리뷰 응대 기준과 Google 게시물 운영으로 방문 전 신뢰를 쌓고 최신 운영 신호를 남깁니다.',
  },
  {
    title: '웹사이트·블로그 확장',
    description: '프로필에서 설명되지 않는 가격, 예약, FAQ, 업종별 질문을 공식 콘텐츠로 연결합니다.',
  },
  {
    title: 'AI 검색 대응',
    description: '브랜드 설명과 질문형 답변을 일관되게 쌓아 Google AI 검색과 답변형 검색 환경에 대비합니다.',
  },
]

const diagnosisItems = [
  'Google 비즈니스 프로필 완성도',
  '외국어 리뷰와 리뷰 답변 상태',
  '사진·메뉴·서비스 정보 최신성',
  '지역·업종 검색 시 경쟁 업체와의 차이',
  '웹사이트·예약·문의 동선',
  '외국인 고객 질문에 대한 FAQ 콘텐츠',
]

const faqs = [
  {
    question: '외국인마케팅은 광고부터 시작해야 하나요?',
    answer:
      '광고보다 먼저 Google 프로필, 사진, 리뷰, 영업정보, 웹사이트 문의 동선을 정비하는 것이 안전합니다. 기본 정보가 약하면 광고 클릭이 생겨도 방문이나 문의 전환이 낮아질 수 있습니다.',
  },
  {
    question: '홈페이지가 없어도 외국인 고객 유입을 시작할 수 있나요?',
    answer:
      '초기에는 Google 비즈니스 프로필 관리만으로도 시작할 수 있습니다. 다만 서비스 설명, 가격대, 예약 안내, FAQ가 필요한 업종은 웹사이트나 랜딩페이지가 함께 있어야 신뢰와 전환에 유리합니다.',
  },
  {
    question: '식당, 병원, 뷰티 업종은 방식이 다르나요?',
    answer:
      '다릅니다. 식당은 메뉴와 결제, 병원·피부과는 시술 설명과 예약, 뷰티 업종은 사진과 리뷰가 더 중요합니다. 블링크애드는 업종별로 외국인 고객이 확인하는 정보를 다르게 정리합니다.',
  },
  {
    question: '외국인마케팅 대행 효과는 언제 확인할 수 있나요?',
    answer:
      'Google 프로필 정보 정비와 콘텐츠 반영은 비교적 빠르게 확인할 수 있지만, 검색 순위와 AI 답변 신호는 누적이 필요합니다. 그래서 월간 리포트로 조회, 검색어, 행동 데이터를 같이 봅니다.',
  },
]

const clusterLinks = [
  {
    title: '외국인 관광객 통계와 추이',
    href: '/blog/oigug-in-goangoanggaeg-tonggyeoa-chui-2026nyeon-oigug-inmaketing-i-jung-yohan-iyu',
    description: '방한 외국인 증가가 매장 마케팅 방식에 주는 영향을 정리했습니다.',
  },
  {
    title: '구글 비즈니스 프로필 관리',
    href: '/services',
    description: '지도, 리뷰, 사진, 게시물, 웹사이트 콘텐츠를 연결하는 서비스 구조입니다.',
  },
  {
    title: '성공사례',
    href: '/case-studies',
    description: 'Google 프로필 운영 성과와 검색 노출, 조회수, 상호작용 데이터를 확인합니다.',
  },
]

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

export default function ForeignMarketingPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '외국인마케팅 대행',
    serviceType: 'Foreign customer acquisition marketing',
    url: PAGE_URL,
    areaServed: {
      '@type': 'Country',
      name: 'KR',
    },
    provider: {
      '@type': 'Organization',
      name: 'BlinkAds',
      alternateName: ['블링크애드', 'Blink Ad'],
      url: SITE_URL,
      logo: `${SITE_URL}/logo-white-nav.png`,
    },
    description:
      'Google 비즈니스 프로필, 구글맵 리뷰, 다국어 콘텐츠, 웹사이트·블로그를 연결해 외국인 고객 유입과 문의 전환을 설계하는 외국인마케팅 대행 서비스입니다.',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: `${PAGE_URL}#contact`,
      itemOffered: {
        '@type': 'Service',
        name: '외국인 고객 유입 무료 진단',
      },
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '외국인마케팅 대행사',
        item: PAGE_URL,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-blue selection:text-white">
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-white/5 bg-black px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(30,111,255,0.22),transparent_32%),radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.08),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-blue">Foreign Customer Marketing</p>
              <h1 className="mt-5 max-w-4xl text-[2.7rem] font-black leading-[1.04] tracking-tight text-white md:text-6xl lg:text-7xl keep-all">
                외국인마케팅 대행사,
                <br />
                구글에서 발견되고
                <br />
                문의까지 이어지게 만듭니다.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-gray-300 md:text-xl md:leading-9 keep-all">
                블링크애드는 Google 비즈니스 프로필, 구글맵 리뷰, 다국어 콘텐츠, 웹사이트·블로그를 연결해 외국인 고객이 검색하고 비교하고 문의하는 흐름을 설계합니다.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-gray-200 md:text-base"
                >
                  외국인 고객 유입 무료진단
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/35 hover:bg-white/10 md:text-base"
                >
                  서비스 구조 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-10 -top-6 h-24 rounded-full bg-brand-blue/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#07101d] p-5 shadow-2xl shadow-black/40 md:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">Google Visibility Check</p>
                    <p className="mt-2 text-2xl font-black text-white">외국인 고객 유입 진단</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                    <Search className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ['지도 노출', 'Maps'],
                    ['리뷰 언어', 'Review'],
                    ['사진 최신성', 'Photo'],
                    ['문의 동선', 'Lead'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                      <p className="text-xs font-semibold text-gray-400">{value}</p>
                      <p className="mt-2 text-lg font-black text-white keep-all">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl bg-white p-5 text-black">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Search Journey</p>
                      <p className="mt-2 text-2xl font-black tracking-tight">검색 → 비교 → 문의</p>
                    </div>
                    <Globe2 className="h-7 w-7 text-brand-blue" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {['Google Maps에서 발견', '사진과 리뷰로 비교', '웹사이트와 FAQ로 확신', '상담·예약으로 전환'].map((item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-gray-100 px-4 py-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-black text-white">
                          {index + 1}
                        </span>
                        <span className="text-sm font-bold keep-all">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Who needs it</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                외국인 고객을 받을 수 있는 업종이라면, 검색 기준부터 달라져야 합니다.
              </h2>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {industries.map((industry) => (
                <div key={industry} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <Store className="h-5 w-5 text-brand-blue" />
                  <p className="mt-4 text-sm font-bold text-white keep-all">{industry}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Problem</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                외국인마케팅은 번역보다 먼저 발견 구조를 봐야 합니다.
              </h2>
              <p className="mt-6 text-base leading-8 text-gray-400 keep-all">
                외국인 고객은 네이버보다 Google 검색, Google Maps, 리뷰, 사진, 웹사이트를 먼저 확인하는 경우가 많습니다. 그래서 광고만 집행하기보다 검색과 지도에서 신뢰를 만드는 기본 구조가 먼저 필요합니다.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {problems.map((problem) => {
                const Icon = problem.icon
                return (
                  <article key={problem.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/15 text-brand-blue">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 text-xl font-black text-white keep-all">{problem.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-gray-400 keep-all">{problem.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">BlinkAds Method</p>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                  구글맵, 리뷰, 콘텐츠, AI 검색까지 하나의 흐름으로 연결합니다.
                </h2>
                <p className="mt-6 text-base leading-8 text-gray-400 keep-all">
                  블링크애드는 외국인마케팅 대행을 단발 광고가 아니라 브랜드 자산 정비로 봅니다. 고객이 실제로 확인하는 접점을 순서대로 정리하고 매달 데이터를 보며 개선합니다.
                </p>
              </div>
              <div className="space-y-4">
                {processSteps.map((step, index) => (
                  <article key={step.title} className="grid grid-cols-[auto_1fr] gap-5 rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-black">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-white keep-all">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-gray-400 keep-all">{step.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Free Diagnosis</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                상담 전에 먼저 확인할 항목을 데이터로 정리합니다.
              </h2>
              <p className="mt-6 text-base leading-8 text-gray-400 keep-all">
                무료 진단은 광고비 제안서가 아니라 현재 발견 구조를 확인하는 작업입니다. 외국인 고객이 찾고, 비교하고, 문의하기 전 어디에서 이탈하는지 먼저 봅니다.
              </p>
              <Link
                href="#contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-600 md:text-base"
              >
                구글맵 외국인 노출 진단 신청
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-5 md:p-7">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-6 w-6 text-brand-blue" />
                <h3 className="text-xl font-black text-white">진단 체크리스트</h3>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {diagnosisItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-black/40 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                    <p className="text-sm font-semibold leading-6 text-gray-200 keep-all">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Content Hub</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                외국인마케팅 자료를 공식 사이트 안에서 연결합니다.
              </h2>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {clusterLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-3xl border border-white/10 bg-white/[0.045] p-6 transition-colors hover:border-brand-blue/45 hover:bg-brand-blue/10"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                    {link.href === '/case-studies' ? <BarChart3 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  </div>
                  <h3 className="mt-6 text-xl font-black text-white keep-all">{link.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-400 keep-all">{link.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-blue">
                    자세히 보기
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">FAQ</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                외국인마케팅 대행 전 자주 묻는 질문
              </h2>
            </div>
            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-brand-blue" />
                    <div>
                      <h3 className="text-lg font-black text-white keep-all">{faq.question}</h3>
                      <p className="mt-3 text-sm leading-7 text-gray-400 keep-all">{faq.answer}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </div>
  )
}
