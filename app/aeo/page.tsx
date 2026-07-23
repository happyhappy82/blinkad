import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  FileSearch,
  Layers,
  MessageCircleQuestion,
  Radar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.blinkad.kr'
const PAGE_URL = `${SITE_URL}/aeo`

export const metadata: Metadata = {
  title: 'AI 검색 최적화(AEO·GEO) 대행 | ChatGPT·Gemini에 인용되는 브랜드 - BlinkAds',
  description:
    'AEO(답변 엔진 최적화)·GEO 전문 대행사 블링크애드. ChatGPT, Gemini, Perplexity에 질문을 직접 던져 실측하고, 웹사이트·스키마·콘텐츠·리뷰를 정비해 AI가 추천하는 브랜드를 만듭니다. AI 가시성 무료 진단 제공.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'AI 검색 최적화(AEO·GEO) 대행 | BlinkAds',
    description:
      'ChatGPT, Gemini, Perplexity에 질문을 직접 던져 실측하고, AI가 추천하는 브랜드 구조를 만듭니다.',
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
    title: 'AI 검색 최적화(AEO·GEO) 대행 | BlinkAds',
    description: 'AI에게 질문을 직접 던져 실측하고, AI가 추천하는 브랜드 구조를 만듭니다.',
    images: [`${SITE_URL}/og-image.png`],
  },
}

const questionLayers = [
  {
    icon: MessageCircleQuestion,
    title: '브랜드 질문',
    example: '"○○매장 어때? 가볼만해?"',
    description:
      'AI가 브랜드를 알고 있는지, 그리고 주소·영업시간·메뉴 같은 정보를 정확하게 답하는지 확인합니다. 실제 진단에서는 다른 지역의 동명 매장과 혼동하는 오답이 자주 발견됩니다.',
  },
  {
    icon: Layers,
    title: '카테고리 질문',
    example: '"강남 ○○ 추천해줘"',
    description:
      '업종 추천 질문에서 경쟁 매장 대신 우리 브랜드가 등장하는지 확인합니다. 여기서 등장해야 AI 검색이 실제 방문과 매출로 이어집니다.',
  },
  {
    icon: Sparkles,
    title: '롱테일 질문',
    example: '"주차되는 ○○ 있어?"',
    description:
      '상황·조건이 붙은 구체적 질문입니다. 경쟁이 얕아 가장 먼저 이길 수 있는 구간이지만, 답변 재료가 되는 콘텐츠가 없으면 영원히 비어 있습니다.',
  },
]

const services = [
  {
    icon: Radar,
    title: 'AI 가시성 실측 진단',
    description:
      '고객이 실제로 묻는 질문 수십 개를 ChatGPT·Gemini·Perplexity·Google AI에 직접 던져 등장률과 정보 정확도를 측정합니다. 추측이 아니라 실측으로 시작합니다.',
  },
  {
    icon: FileSearch,
    title: '웹사이트·스키마 정비',
    description:
      'AI가 로컬 답변을 만들 때 가장 많이 참조하는 것은 자사 웹사이트입니다. 메뉴·가격·위치·FAQ를 AI가 읽을 수 있는 구조(Schema)로 정리합니다.',
  },
  {
    icon: Bot,
    title: '질문형 콘텐츠 제작',
    description:
      '고객 질문에 대한 답을 통계와 출처를 갖춘 콘텐츠로 발행합니다. 연구에 따르면 통계를 포함한 콘텐츠는 AI 인용률이 크게 올라갑니다.',
  },
  {
    icon: Layers,
    title: '프로필·디렉토리·멘션 정비',
    description:
      '구글 비즈니스 프로필, 리뷰 플랫폼, 외부 사이트의 브랜드 언급을 정비합니다. AI 노출은 백링크보다 브랜드 멘션과의 상관이 3배 높습니다.',
  },
  {
    icon: BarChart3,
    title: '월간 AI 가시성 리포트',
    description:
      '같은 질문 세트를 매월 반복 측정해 등장률 변화를 숫자로 보고합니다. AI발 웹사이트 방문도 별도 채널로 분리해 추적합니다.',
  },
  {
    icon: ShieldCheck,
    title: '정직한 측정 원칙',
    description:
      'AI 답변은 매번 달라지므로 특정 순위를 보장하지 않습니다. 대신 측정 방법을 공개하고, 반복 측정의 추세로 성과를 판단합니다.',
  },
]

const processSteps = [
  {
    title: '무료 AI 진단',
    description: 'ChatGPT에 우리 매장을 물어보면 뭐라고 답하는지, 등장은 하는지 실측해 보여드립니다.',
  },
  {
    title: '기반 정비 (1~2개월)',
    description: '웹사이트 핵심 페이지, 스키마, 프로필, 디렉토리 등재까지 AI가 참조할 기반을 완성합니다.',
  },
  {
    title: '콘텐츠·리뷰 축적 (3~5개월)',
    description: '질문형 콘텐츠를 발행하고 리뷰 신호를 쌓아 카테고리·롱테일 질문에서의 등장을 만듭니다.',
  },
  {
    title: '멘션 확장 (6개월~)',
    description: '외부 사이트·미디어의 브랜드 언급을 늘려 AI가 신뢰하는 브랜드 신호를 강화합니다.',
  },
  {
    title: '월간 리포트·조정',
    description: 'AI 인용처는 수시로 바뀝니다. 매월 실측 데이터를 보고 작업 배분을 다시 조정합니다.',
  },
]

const faqs = [
  {
    question: 'AEO가 정확히 무엇인가요? SEO와 무엇이 다른가요?',
    answer:
      'AEO(Answer Engine Optimization)는 ChatGPT, Gemini, Perplexity 같은 AI가 고객 질문에 답할 때 우리 브랜드를 인용·추천하도록 만드는 작업입니다. SEO가 검색 결과 링크의 순위를 높이는 일이라면, AEO는 AI의 답변 문장 안에 들어가는 일입니다. 참조하는 신호가 달라서 SEO 상위 매장도 AI 답변에는 없는 경우가 많습니다.',
  },
  {
    question: '정말 AI 검색으로 손님이 오나요?',
    answer:
      '소비자 조사에서 45%가 AI 도구로 지역 업체 추천을 받아본 경험이 있다고 답했고, 1년 전 6%에서 급증했습니다. 또한 AI 답변을 보고 웹사이트로 넘어온 방문자는 일반 검색 유입보다 전환율이 크게 높다는 데이터가 있습니다. 이미 결정 직전 단계에서 AI에게 확인하고 오기 때문입니다.',
  },
  {
    question: '효과는 언제부터 확인할 수 있나요?',
    answer:
      '첫 달 진단에서 현재 상태(베이스라인)를 숫자로 확인하고, 기반 정비 효과는 보통 2~3개월 차 측정부터 나타납니다. 다만 AI 인용은 최신성의 영향이 커서, 꾸준히 갱신하는 매장과 한 번 하고 멈춘 매장의 격차가 시간이 갈수록 벌어집니다. 그래서 월 단위 운영으로 설계합니다.',
  },
  {
    question: 'AI 답변에 우리 매장이 나오게 보장할 수 있나요?',
    answer:
      '보장할 수 없고, 보장한다고 말하는 업체를 주의하셔야 합니다. AI 답변은 질문할 때마다 달라지는 확률적 결과이기 때문입니다. 블링크애드는 대신 측정 방법을 공개하고, 같은 질문 세트를 매월 반복 측정한 등장률 추세로 성과를 판단합니다. 오르는지 내리는지는 정확하게 알 수 있습니다.',
  },
]

const clusterLinks = [
  {
    title: '환자가 ChatGPT에 물어보면 왜 우리 병원이 안 나올까',
    href: '/blog/hoanjaga-chatgpte-gangnam-chigoa-chucheon-mul-eobomyeon-uli-byeong-ueon-i-an-naoneun-iyu',
    description: 'AI 추천에서 빠지는 병원들의 공통점을 정리했습니다.',
  },
  {
    title: 'Perplexity·ChatGPT가 추천하는 병원의 5가지 공통점',
    href: '/blog/perplexity-chatgptga-hoanjaege-chucheonhaneun-byeong-ueon-eui-5gaji-gongtongjeom',
    description: 'AI가 실제로 인용하는 병원들의 데이터 신호를 분석했습니다.',
  },
  {
    title: '구글 AI 오버뷰 시대, 병원 광고는 어떻게 바뀌나',
    href: '/blog/gugeul-ai-obeobyu-sidae-byeong-ueon-goanggo-eotteohge-bakkuina-byeong-ueon-maketeo-pildog',
    description: 'AI 오버뷰 등장 이후 검색 광고 환경의 변화를 정리했습니다.',
  },
  {
    title: 'AI 검색에 인용되는 5문장 답변 구조',
    href: '/blog/2026-byeong-ueon-beullogeu-jalsseuneunbeob-ai-geomsaeg-e-in-yongdoineun-5munjang-dabbyeon-gujo',
    description: 'AI가 인용하기 좋은 콘텐츠 문장 구조를 예시와 함께 설명합니다.',
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

export default function AeoPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI 검색 최적화(AEO·GEO) 대행',
    serviceType: 'Answer Engine Optimization / Generative Engine Optimization',
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
      'ChatGPT, Gemini, Perplexity에 고객 질문을 직접 던져 실측하고, 웹사이트·스키마·콘텐츠·프로필·멘션을 정비해 AI가 추천하는 브랜드를 만드는 AI 검색 최적화(AEO·GEO) 대행 서비스입니다.',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: `${PAGE_URL}#contact`,
      itemOffered: {
        '@type': 'Service',
        name: 'AI 가시성 무료 진단',
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
        name: 'AI 검색 최적화(AEO)',
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
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-blue">AEO · GEO</p>
              <h1 className="mt-5 max-w-4xl text-[2.7rem] font-black leading-[1.04] tracking-tight text-white md:text-6xl lg:text-7xl keep-all">
                AI 검색 최적화,
                <br />
                AI가 추천하는
                <br />
                브랜드로
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-gray-300 md:text-xl md:leading-9 keep-all">
                고객은 이제 검색창 대신 AI에게 묻습니다. 블링크애드는 고객의 실제 질문을 AI에 직접 던져 실측하고, 웹사이트·콘텐츠·프로필·리뷰를 정비해 AI 답변에 등장하는 브랜드를 만듭니다.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-gray-200 md:text-base"
                >
                  AI 가시성 무료진단
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/google-map-marketing"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/35 hover:bg-white/10 md:text-base"
                >
                  구글맵 마케팅 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-10 -top-6 h-24 rounded-full bg-brand-blue/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#07101d] p-5 shadow-2xl shadow-black/40 md:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">AI Visibility Check</p>
                    <p className="mt-2 text-2xl font-black text-white">AI 가시성 진단</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                    <Bot className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ['등장률', 'Mention'],
                    ['정보 정확도', 'Accuracy'],
                    ['인용 소스', 'Source'],
                    ['AI발 방문', 'Traffic'],
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
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Measured Engines</p>
                      <p className="mt-2 text-2xl font-black tracking-tight">질문 → 실측 → 개선</p>
                    </div>
                    <Radar className="h-7 w-7 text-brand-blue" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {['ChatGPT에 직접 질문', 'Gemini·Perplexity 교차 측정', '등장률·정확도 기록', '매월 같은 질문으로 추세 확인'].map((item, index) => (
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
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Why now</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                검색은 줄고, 질문은 늘고 있습니다.
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  stat: '6% → 45%',
                  label: 'AI 도구로 지역 업체 추천을 받아본 소비자 비율이 1년 만에 6%에서 45%로 늘었습니다. (BrightLocal 2026)',
                },
                {
                  stat: '54.5%',
                  label: '한국인의 54.5%가 최근 3개월 내 ChatGPT로 정보를 검색했습니다. 1년 전 39.6%에서 계속 오르는 중입니다. (OpenSurvey)',
                },
                {
                  stat: '83%',
                  label: '그런데 식당의 83%는 ChatGPT 답변에 등장하지 않습니다. 구글에서는 14%만 안 보이는 것과 대비됩니다. (Local Falcon)',
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

        {/* Question layers */}
        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Our method</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                AEO의 단위는 키워드가 아니라 질문입니다.
              </h2>
              <p className="mt-6 text-base leading-8 text-gray-400 keep-all">
                블링크애드는 고객 질문을 3층으로 나눠 측정하고 공략합니다. 어느 층에서 등장하고 어느 층에서 빠지는지가 곧 작업 우선순위가 됩니다.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {questionLayers.map((layer) => {
                const Icon = layer.icon
                return (
                  <article key={layer.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/15 text-brand-blue">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-black text-white keep-all">{layer.title}</h3>
                    <p className="mt-1 text-sm font-bold text-brand-blue keep-all">{layer.example}</p>
                    <p className="mt-3 text-sm leading-7 text-gray-400 keep-all">{layer.description}</p>
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
                AI 검색 최적화 대행, 이렇게 운영합니다.
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
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Roadmap</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                진단 → 기반 → 콘텐츠 → 멘션 → 리포트
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-gray-400 keep-all">
                AI가 로컬 답변에서 가장 많이 참조하는 순서(자사 웹사이트 → 외부 멘션 → 디렉토리)를 그대로 작업 로드맵에 반영했습니다.
              </p>
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

        {/* FAQ */}
        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">FAQ</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                AI 검색 최적화, 자주 묻는 질문
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
        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Insights</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                AI 검색이 바꿔놓은 것이 무엇인지 궁금하다면 더 읽어보세요.
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
