import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Compass,
  MapPinned,
  MessageSquareText,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.blinkad.kr'
const PAGE_URL = `${SITE_URL}/google-map-marketing`

export const metadata: Metadata = {
  title: '구글맵 마케팅 대행 | 구글 지도 상위노출·리뷰·프로필 관리 - BlinkAd',
  description:
    '구글맵 마케팅 전문 대행사 블링크애드. Google 비즈니스 프로필 정비, 구글 지도 상위노출, 리뷰 운영, 사진·게시물 관리로 지도에서 발견되고 방문으로 이어지는 구조를 만듭니다. 식당, 카페, 병원, 뷰티, 로컬 매장 무료 진단.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: '구글맵 마케팅 대행 | BlinkAd',
    description:
      'Google 비즈니스 프로필, 구글 지도 상위노출, 리뷰 운영을 연결해 지도에서 발견되고 방문으로 이어지는 구조를 만듭니다.',
    url: PAGE_URL,
    siteName: 'BlinkAd',
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
    title: '구글맵 마케팅 대행 | BlinkAd',
    description:
      '구글 지도 상위노출, 리뷰, 프로필 관리로 지도에서 발견되고 방문으로 이어지는 구조를 만듭니다.',
    images: [`${SITE_URL}/og-image.png`],
  },
}

const rankingFactors = [
  {
    icon: Search,
    title: '관련성 (Relevance)',
    description:
      '고객의 검색어와 프로필 정보가 얼마나 일치하는지입니다. 카테고리, 소개문, 서비스·메뉴 정보가 검색어 기준으로 정리되어 있어야 후보에 올라갑니다.',
  },
  {
    icon: Compass,
    title: '거리 (Distance)',
    description:
      '검색 위치와 매장의 거리입니다. 거리 자체는 바꿀 수 없지만, 상권·지역 키워드를 프로필과 콘텐츠에 정확히 반영하면 검색 반경 안에서의 경쟁력이 달라집니다.',
  },
  {
    icon: TrendingUp,
    title: '인지도 (Prominence)',
    description:
      '리뷰 수와 평점, 사진, 웹사이트, 외부에서의 언급까지 포함한 신뢰 신호입니다. 구글맵 마케팅에서 시간이 가장 오래 걸리지만 격차가 가장 크게 벌어지는 영역입니다.',
  },
]

const services = [
  {
    icon: MapPinned,
    title: '프로필 정보 정비',
    description: '카테고리, 소개문, 영업정보, 서비스·메뉴, 속성 정보를 검색어 기준으로 재정리합니다.',
  },
  {
    icon: Star,
    title: '리뷰 운영·답변 대행',
    description: '리뷰 요청 동선을 설계하고, 한국어·외국어 리뷰에 매장 톤에 맞는 답변을 운영합니다.',
  },
  {
    icon: MessageSquareText,
    title: '사진·게시물 관리',
    description: '클릭을 만드는 사진 구성과 주기적인 게시물로 "운영 중인 매장" 신호를 유지합니다.',
  },
  {
    icon: Bot,
    title: 'AI 검색 대응 (AEO)',
    description: '구글맵 데이터는 Gemini와 AI 검색 답변의 재료가 됩니다. AI가 매장을 정확히 인용하도록 정보 구조를 맞춥니다.',
  },
  {
    icon: BarChart3,
    title: '월간 성과 리포트',
    description: '노출수, 검색어, 길찾기, 전화, 웹사이트 클릭을 매월 리포트로 보고합니다. 감이 아니라 숫자로 확인합니다.',
  },
  {
    icon: ShieldCheck,
    title: '정책 준수 운영',
    description: '트래픽 조작, 리뷰 구매 같은 편법을 쓰지 않습니다. 계정 정지 위험 없이 오래 가는 방식만 사용합니다.',
  },
]

const processSteps = [
  {
    title: '무료 진단',
    description: '업종·지역 키워드로 현재 지도 노출 순위, 프로필 완성도, 경쟁 매장과의 격차를 확인해 드립니다.',
  },
  {
    title: '프로필 초기 정비',
    description: '카테고리부터 사진, 영업정보, 메뉴·서비스까지 첫 달에 기본 구조를 완성합니다.',
  },
  {
    title: '리뷰·게시물 운영',
    description: '리뷰 요청 루틴과 답변 운영, 월 게시물 발행으로 인지도 신호를 쌓습니다.',
  },
  {
    title: '웹사이트·콘텐츠 연결',
    description: '프로필로 다 설명되지 않는 가격, 예약, FAQ를 웹사이트와 블로그로 연결해 전환을 높입니다.',
  },
  {
    title: '월간 리포트·개선',
    description: '노출·행동 데이터를 매월 보고하고, 검색어 데이터 기반으로 다음 달 작업을 조정합니다.',
  },
]

const diagnosisItems = [
  '업종·지역 키워드 지도 노출 순위',
  'Google 비즈니스 프로필 완성도',
  '리뷰 수·평점·답변 상태',
  '사진 품질과 최신성',
  '경쟁 매장 3곳과의 격차',
  'AI 검색(ChatGPT·Gemini)에서의 매장 정보 정확도',
]

const faqs = [
  {
    question: '구글맵 상위노출은 얼마나 걸리나요?',
    answer:
      '프로필 정보 정비 효과는 보통 2~4주 안에 노출 데이터로 확인됩니다. 다만 리뷰와 인지도 신호는 누적이 필요해서, 경쟁이 있는 상권 키워드는 통상 2~3개월 단위로 순위 변화를 봅니다. 그래서 월간 리포트로 노출수·검색어·행동 데이터를 함께 확인합니다.',
  },
  {
    question: '리뷰를 대신 만들어 주나요?',
    answer:
      '아니요. 리뷰 구매나 조작은 구글 정책 위반으로 프로필 정지 위험이 있어 하지 않습니다. 대신 실제 방문 고객이 리뷰를 남기기 쉽게 요청 동선(QR, 안내 멘트)을 설계하고, 남겨진 리뷰에 답변을 운영해 다음 고객의 신뢰를 만드는 방식으로 리뷰를 늘립니다.',
  },
  {
    question: '네이버 지도만 잘해도 되지 않나요?',
    answer:
      '한국 고객은 네이버, 외국인 고객은 구글맵을 먼저 봅니다. 특히 외국인 관광객·거주자 비중이 있는 상권이라면 구글맵이 사실상 유일한 유입 경로입니다. 또한 구글맵 데이터는 Gemini 등 AI 검색 답변의 재료로 쓰이기 때문에, AI에게 추천받는 매장이 되려면 구글 쪽 기반이 필요합니다.',
  },
  {
    question: '구글 광고(Google Ads)와는 무엇이 다른가요?',
    answer:
      '광고는 비용을 내는 동안만 노출되고, 구글맵 마케팅은 프로필·리뷰·콘텐츠 자산이 누적되어 광고를 멈춰도 남습니다. 두 가지는 대체 관계가 아니라 보완 관계입니다. 블링크애드는 구글애즈 운영도 함께 하기 때문에, 광고 검색어 데이터를 지도·콘텐츠 작업에 재사용하는 구조로 운영합니다.',
  },
]

const clusterLinks = [
  {
    title: '구글 마이비즈니스 등록부터 관리까지',
    href: '/blog/gugeul-maibijeuniseu-deunglogbuteo-goanlikkaji-2026nyeon-choisin-gaideu',
    description: '프로필 등록과 인증, 기본 관리 순서를 정리한 가이드입니다.',
  },
  {
    title: 'GBP 사진이 클릭률을 바꿉니다',
    href: '/blog/gbp-sajin-i-5jang-i-keulliglyul-eul-2baelo-mandeubnida',
    description: '어떤 사진을 몇 장 올려야 하는지 데이터로 설명합니다.',
  },
  {
    title: '구글 리뷰 늘리는 방법',
    href: '/blog/gugeul-libyu-neullineun-bangbeob-sonnim-ege-jayeonseuleobge-yocheonghaneun-menteu-5gaji',
    description: '고객에게 자연스럽게 리뷰를 요청하는 멘트 5가지입니다.',
  },
  {
    title: '구글 지도 리뷰 vs 네이버 플레이스 리뷰',
    href: '/blog/gugeul-jido-libyu-vs-neibeo-peulleiseu-libyu-eodiga-maechul-e-doumdoilkka',
    description: '두 플랫폼 리뷰가 매출에 기여하는 방식의 차이를 비교했습니다.',
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

export default function GoogleMapMarketingPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '구글맵 마케팅 대행',
    serviceType: 'Google Maps marketing / Google Business Profile management',
    url: PAGE_URL,
    areaServed: {
      '@type': 'Country',
      name: 'KR',
    },
    provider: {
      '@type': 'Organization',
      name: 'BlinkAd',
      alternateName: ['블링크애드', 'Blink Ad'],
      url: SITE_URL,
      logo: `${SITE_URL}/logo-white-nav.png`,
    },
    description:
      'Google 비즈니스 프로필 정비, 구글 지도 상위노출, 리뷰 운영, 사진·게시물 관리로 지도에서 발견되고 방문으로 이어지는 구조를 만드는 구글맵 마케팅 대행 서비스입니다.',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: `${PAGE_URL}#contact`,
      itemOffered: {
        '@type': 'Service',
        name: '구글맵 노출 무료 진단',
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
        name: '구글맵 마케팅',
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
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5 bg-black px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(30,111,255,0.22),transparent_32%),radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.08),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-blue">Google Maps Marketing</p>
              <h1 className="mt-5 max-w-4xl text-[2.7rem] font-black leading-[1.04] tracking-tight text-white md:text-6xl lg:text-7xl keep-all">
                구글맵 마케팅,
                <br />
                지도에서 발견
                <br />
                그리고 방문까지
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-gray-300 md:text-xl md:leading-9 keep-all">
                고객은 방문 전에 구글 지도에서 위치, 사진, 리뷰, 영업시간을 먼저 확인합니다. 블링크애드는 Google 비즈니스 프로필, 리뷰, 사진, 웹사이트를 연결해 검색 → 지도 → 방문으로 이어지는 구조를 만듭니다.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-gray-200 md:text-base"
                >
                  구글맵 노출 무료진단
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/foreign-marketing"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/35 hover:bg-white/10 md:text-base"
                >
                  외국인마케팅 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-10 -top-6 h-24 rounded-full bg-brand-blue/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#07101d] p-5 shadow-2xl shadow-black/40 md:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">Map Visibility Check</p>
                    <p className="mt-2 text-2xl font-black text-white">구글맵 노출 진단</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                    <MapPinned className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ['지도 순위', 'Ranking'],
                    ['리뷰·평점', 'Review'],
                    ['사진 최신성', 'Photo'],
                    ['길찾기·전화', 'Action'],
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
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Customer Journey</p>
                      <p className="mt-2 text-2xl font-black tracking-tight">검색 → 지도 → 방문</p>
                    </div>
                    <Compass className="h-7 w-7 text-brand-blue" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {['키워드로 검색', '지도에서 비교', '리뷰·사진으로 확신', '길찾기 누르고 방문'].map((item, index) => (
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

        {/* Why now */}
        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Why Google Maps</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                지도는 이제 검색의 끝이 아니라, AI 추천의 시작입니다.
              </h2>
              <p className="mt-6 text-base leading-8 text-gray-400 keep-all">
                구글맵 데이터는 구글 검색과 지도뿐 아니라 Gemini, AI 검색 답변이 매장을 소개할 때 참조하는 기본 재료입니다. 프로필이 비어 있으면 지도에서도, AI 추천에서도 후보에 오르지 못합니다.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  stat: '2위',
                  label: '구글은 한국에서 네이버 다음으로 많이 쓰이는 검색엔진이며, 외국인 고객에게는 사실상 첫 번째 검색 경로입니다.',
                },
                {
                  stat: '45%',
                  label: '소비자 45%가 AI 도구로 지역 업체 추천을 받아본 경험이 있습니다. 1년 전 6%에서 급증했습니다. (BrightLocal 2026)',
                },
                {
                  stat: '83%',
                  label: '그런데 식당의 83%는 ChatGPT 답변에 아예 등장하지 않습니다. 지도·프로필 기반이 없는 매장이 대부분입니다. (Local Falcon)',
                },
              ].map((item) => (
                <article key={item.stat} className="rounded-3xl border border-white/10 bg-white/[0.045] p-7">
                  <p className="text-4xl font-black text-brand-blue">{item.stat}</p>
                  <p className="mt-4 text-sm leading-7 text-gray-300 keep-all">{item.label}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Ranking factors (guide) */}
        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">How ranking works</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                구글 지도 상위노출을 결정하는 3가지 기준
              </h2>
              <p className="mt-6 text-base leading-8 text-gray-400 keep-all">
                구글은 지도 순위가 관련성, 거리, 인지도로 결정된다고 공식적으로 밝히고 있습니다. 구글맵 마케팅은 이 세 가지 기준에 맞춰 프로필과 신뢰 신호를 하나씩 채우는 일입니다.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {rankingFactors.map((factor) => {
                const Icon = factor.icon
                return (
                  <article key={factor.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/15 text-brand-blue">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-white keep-all">{factor.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-400 keep-all">{factor.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">What we do</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                구글맵 마케팅 대행, 이렇게 운영합니다.
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon
                return (
                  <article key={service.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/15 text-brand-blue">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-black text-white keep-all">{service.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-400 keep-all">{service.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Process</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                진단부터 리포트까지, 5단계로 진행합니다.
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-5">
              {processSteps.map((step, index) => (
                <article key={step.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-black text-white keep-all">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-400 keep-all">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Diagnosis */}
        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Free diagnosis</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                지금 우리 매장이 구글맵 어디쯤 있는지, 무료로 확인해 드립니다.
              </h2>
              <p className="mt-6 text-base leading-8 text-gray-400 keep-all">
                업종과 지역 키워드 기준으로 지도 노출 순위와 프로필 상태, 경쟁 매장과의 격차를 확인해 드립니다. AI 검색(ChatGPT·Gemini)이 매장을 어떻게 소개하는지도 함께 점검합니다.
              </p>
              <Link
                href="#contact"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-gray-200 md:text-base"
              >
                무료 진단 신청하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-7">
              <p className="text-sm font-bold text-white">진단에서 확인하는 6가지</p>
              <ul className="mt-5 space-y-3">
                {diagnosisItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand-blue" />
                    <span className="text-sm leading-7 text-gray-300 keep-all">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">FAQ</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                구글맵 마케팅, 자주 묻는 질문
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <article key={faq.question} className="rounded-3xl border border-white/10 bg-white/[0.045] p-7">
                  <h3 className="text-lg font-black text-white keep-all">{faq.question}</h3>
                  <p className="mt-4 text-sm leading-7 text-gray-400 keep-all">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Cluster links */}
        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Guides</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                직접 해보고 싶다면, 이 가이드부터 읽어보세요.
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {clusterLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-3xl border border-white/10 bg-white/[0.045] p-6 transition-colors hover:border-brand-blue/40 hover:bg-white/[0.07]"
                >
                  <h3 className="text-base font-black text-white keep-all">{link.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400 keep-all">{link.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand-blue">
                    읽어보기
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
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
