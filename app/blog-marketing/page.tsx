import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  CalendarClock,
  CheckCircle2,
  FileText,
  Link2,
  PenLine,
  Quote,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.blinkad.kr'
const PAGE_URL = `${SITE_URL}/blog-marketing`

export const metadata: Metadata = {
  title: '브랜드 블로그 운영 대행 | 블로그 마케팅·콘텐츠 자산 구축 - BlinkAds',
  description:
    '블로그 마케팅 전문 대행사 블링크애드. 검색 의도 기반 주제 기획, 통계·출처를 갖춘 콘텐츠 발행, 내부링크 구조 관리로 검색과 AI가 인용하는 브랜드 블로그를 운영합니다. 식당·병원·로컬 브랜드 무료 진단.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: '브랜드 블로그 운영 대행 | BlinkAds',
    description:
      '검색 의도 기반 기획과 통계·출처를 갖춘 콘텐츠로, 검색과 AI가 인용하는 브랜드 블로그를 운영합니다.',
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
    title: '브랜드 블로그 운영 대행 | BlinkAds',
    description: '검색과 AI가 인용하는 브랜드 블로그를 운영합니다.',
    images: [`${SITE_URL}/og-image.png`],
  },
}

const services = [
  {
    icon: BookOpenText,
    title: '검색 의도 기반 주제 기획',
    description:
      '광고 검색어 리포트와 키워드 데이터에서 고객이 실제로 묻는 질문을 뽑아 주제로 만듭니다. 쓰고 싶은 글이 아니라 찾고 있는 글을 씁니다.',
  },
  {
    icon: PenLine,
    title: '통계·출처를 갖춘 본문 작성',
    description:
      '연구에 따르면 통계와 출처를 포함한 콘텐츠는 AI 인용률이 크게 올라갑니다. 근거 있는 문장으로 검색과 AI 양쪽에서 신뢰받는 글을 만듭니다.',
  },
  {
    icon: Quote,
    title: '브랜드 고유 이야기 수집',
    description:
      '사장님 인터뷰로 매장만의 경험과 일화를 수집해 콘텐츠에 녹입니다. 어디서 베낄 수 없는 이야기가 콘텐츠의 경쟁력이 됩니다.',
  },
  {
    icon: Link2,
    title: '내부링크·카테고리 구조 관리',
    description:
      '글이 쌓일수록 서로 연결되도록 허브-스포크 구조로 운영합니다. 개별 글이 아니라 사이트 전체의 주제 권위를 만듭니다.',
  },
  {
    icon: CalendarClock,
    title: '주기적 갱신 운영',
    description:
      'AI가 인용하는 콘텐츠의 대부분은 최근에 갱신된 글입니다. 발행하고 끝이 아니라 기존 글도 주기적으로 업데이트합니다.',
  },
  {
    icon: BarChart3,
    title: '월간 운영 리포트',
    description:
      '발행 목록, 검색 노출·클릭, AI발 유입까지 매월 리포트로 보고합니다. 콘텐츠가 자산으로 쌓이는 과정을 숫자로 확인합니다.',
  },
]

const processSteps = [
  {
    title: '키워드·질문 진단',
    description: '업종·지역 키워드와 고객 질문을 조사해 6개월 콘텐츠 지도를 만듭니다.',
  },
  {
    title: '핵심 페이지 우선 발행',
    description: '가격, 예약, FAQ 등 전환에 직결되는 핵심 주제부터 발행합니다.',
  },
  {
    title: '월 정기 발행',
    description: '합의된 편수를 매월 발행하고, 사장님 인터뷰 소재를 콘텐츠에 반영합니다.',
  },
  {
    title: '내부링크 연결',
    description: '새 글과 기존 글, 서비스 페이지를 연결해 사이트 구조를 강화합니다.',
  },
  {
    title: '리포트·갱신',
    description: '성과 데이터를 보고 잘 되는 주제는 확장, 오래된 글은 갱신합니다.',
  },
]

const faqs = [
  {
    question: '네이버 블로그와 무엇이 다른가요?',
    answer:
      '네이버 블로그는 네이버 검색 안에서만 작동하지만, 자사 웹사이트 블로그는 구글 검색과 ChatGPT·Gemini 같은 AI 답변의 재료가 됩니다. 실측 연구에서 AI 로컬 답변의 절반 이상이 업체 자체 웹사이트를 근거로 사용했습니다. 외국인 고객이나 AI 검색 대응이 필요하다면 자사 블로그가 기반이 됩니다.',
  },
  {
    question: '한 달에 몇 편을 발행하나요?',
    answer:
      '업종과 목표에 따라 월 4~8편 사이에서 설계합니다. 편수보다 중요한 것은 검색 의도와 일치하는 주제 선정, 그리고 꾸준함입니다. 한 번에 20편을 올리고 멈추는 것보다 매월 4편씩 지속하는 쪽이 검색과 AI 양쪽에서 유리합니다.',
  },
  {
    question: 'AI로 쓴 글은 검색에서 불이익이 있지 않나요?',
    answer:
      '구글은 작성 도구가 아니라 콘텐츠 품질을 기준으로 평가한다고 공식적으로 밝히고 있습니다. 문제는 AI 사용 여부가 아니라 근거 없는 양산형 글입니다. 블링크애드는 실제 데이터, 출처, 매장 고유의 이야기를 결합해 도구와 무관하게 품질 기준을 통과하는 콘텐츠를 만듭니다.',
  },
  {
    question: '블로그 효과는 언제부터 나타나나요?',
    answer:
      '신규 사이트 기준으로 검색 노출은 통상 2~3개월, 의미 있는 유입은 4~6개월부터 쌓입니다. 대신 블로그는 광고와 달리 멈춰도 사라지지 않는 자산입니다. 발행이 누적될수록 글끼리 서로 밀어주면서 후반부에 성장 속도가 빨라집니다.',
  },
]

const clusterLinks = [
  {
    title: 'AI 검색에 인용되는 5문장 답변 구조',
    href: '/blog/2026-byeong-ueon-beullogeu-jalsseuneunbeob-ai-geomsaeg-e-in-yongdoineun-5munjang-dabbyeon-gujo',
    description: 'AI가 인용하기 좋은 콘텐츠 문장 구조를 예시와 함께 설명합니다.',
  },
  {
    title: '소상공인 온라인 마케팅 3단계',
    href: '/blog/sosanggong-in-onlain-maketing-gugeul-eseo-sonnim-badneun-3dangye',
    description: '구글에서 손님을 받는 기본 구조를 단계별로 정리했습니다.',
  },
  {
    title: '하이퍼로컬 마케팅이란',
    href: '/blog/haipeolokeol-maketing-ilan-bangyeong-1km-an-eseo-maechul-mandeuneun-jeonlyag',
    description: '반경 1km 안에서 매출을 만드는 콘텐츠 전략입니다.',
  },
  {
    title: '로컬 SEO란: 동네 장사 사장님을 위한 쉬운 설명',
    href: '/blog/lokeol-seolan-dongne-jangsahaneun-sajangnim-eul-uihan-suiun-seolmyeong',
    description: '로컬 검색이 작동하는 원리를 쉬운 말로 풀었습니다.',
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

export default function BlogMarketingPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '브랜드 블로그 운영 대행',
    serviceType: 'Brand blog operation / Content marketing',
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
      '검색 의도 기반 주제 기획, 통계·출처를 갖춘 콘텐츠 발행, 내부링크 구조 관리로 검색과 AI가 인용하는 브랜드 블로그를 운영하는 블로그 마케팅 대행 서비스입니다.',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: `${PAGE_URL}#contact`,
      itemOffered: {
        '@type': 'Service',
        name: '블로그 콘텐츠 무료 진단',
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
        name: '브랜드 블로그 운영',
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
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-blue">Brand Blog</p>
              <h1 className="mt-5 max-w-4xl text-[2.7rem] font-black leading-[1.04] tracking-tight text-white md:text-6xl lg:text-7xl keep-all">
                브랜드 블로그 운영,
                <br />
                검색과 AI가
                <br />
                인용하는 자산으로
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-8 text-gray-300 md:text-xl md:leading-9 keep-all">
                광고는 멈추면 사라지지만 콘텐츠는 쌓입니다. 블링크애드는 고객이 실제로 묻는 질문을 주제로, 통계와 매장 고유의 이야기를 갖춘 글을 발행해 구글 검색과 AI 답변이 인용하는 블로그 자산을 만듭니다.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-gray-200 md:text-base"
                >
                  블로그 콘텐츠 무료진단
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/35 hover:bg-white/10 md:text-base"
                >
                  발행 콘텐츠 보기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-10 -top-6 h-24 rounded-full bg-brand-blue/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#07101d] p-5 shadow-2xl shadow-black/40 md:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">Content Asset</p>
                    <p className="mt-2 text-2xl font-black text-white">콘텐츠 자산 구조</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ['주제 기획', 'Intent'],
                    ['근거·출처', 'Evidence'],
                    ['내부링크', 'Structure'],
                    ['정기 갱신', 'Freshness'],
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
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">Content Journey</p>
                      <p className="mt-2 text-2xl font-black tracking-tight">발행 → 노출 → 인용</p>
                    </div>
                    <BookOpenText className="h-7 w-7 text-brand-blue" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {['고객 질문을 주제로 발행', '구글 검색에 노출', 'AI 답변의 근거로 인용', '문의·방문으로 전환'].map((item, index) => (
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

        {/* Why */}
        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Why brand blog</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                AI 시대에 블로그가 오히려 더 중요해졌습니다.
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  stat: '58%',
                  label: 'ChatGPT가 지역 업체 답변을 만들 때 참조한 근거의 58%가 업체 자체 웹사이트였습니다. AI가 읽을 콘텐츠가 없으면 후보에서 빠집니다. (BrightLocal)',
                },
                {
                  stat: '3.2배',
                  label: '최근 30일 내 갱신된 콘텐츠는 오래된 콘텐츠보다 AI 인용이 3.2배 많습니다. 한 번 만들고 끝이 아니라 꾸준한 운영이 필요한 이유입니다. (ConvertMate)',
                },
                {
                  stat: '+41%',
                  label: '통계를 포함한 콘텐츠는 AI 인용 가시성이 41% 올라간다는 연구 결과가 있습니다. 근거 있는 글이 검색과 AI 양쪽에서 이깁니다. (Princeton GEO 연구)',
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

        {/* Services */}
        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">What we do</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                브랜드 블로그 운영 대행, 이렇게 운영합니다.
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
        <section className="bg-[#050505] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Process</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                기획부터 갱신까지, 5단계로 운영합니다.
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

        {/* FAQ */}
        <section className="border-y border-white/5 bg-black px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">FAQ</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl keep-all">
                블로그 마케팅, 자주 묻는 질문
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
                콘텐츠 전략이 궁금하다면? 더 읽어보세요.
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
