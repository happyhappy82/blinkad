import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.blinkad.kr'
const PAGE_URL = `${SITE_URL}/reddit-marketing`

export const metadata: Metadata = {
  title: '레딧 마케팅 대행 | 해외 고객·구글·AI 검색 대응 | 블링크애드',
  description:
    '블링크애드 레딧 마케팅은 관련 커뮤니티와 고객 질문을 조사하고 맥락에 맞는 콘텐츠를 기획해 해외 고객 접점과 구글·AI 검색의 브랜드 근거를 만듭니다.',
  keywords: ['레딧 마케팅', '레딧 마케팅 대행', 'Reddit 마케팅', '해외 마케팅', '외국인 고객 유치'],
  authors: [{ name: '블링크애드', url: SITE_URL }],
  category: '마케팅',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: '레딧 마케팅 대행 | 해외 고객·구글·AI 검색 대응 | 블링크애드',
    description: '관련 커뮤니티와 고객 질문을 조사하고 맥락에 맞는 콘텐츠로 해외 고객 접점과 검색 근거를 만드는 레딧 마케팅 서비스입니다.',
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
    title: '레딧 마케팅 대행 | 블링크애드',
    description: '해외 고객 접점과 구글·AI 검색의 브랜드 근거를 만드는 레딧 마케팅 서비스입니다.',
    images: [`${SITE_URL}/og-image.png`],
  },
}

const audiences = [
  {
    icon: Building2,
    text: '외국인 고객을 유치하려는 병원·여행·로컬 비즈니스',
  },
  {
    icon: Search,
    text: '구글 검색과 AI 검색에서 브랜드 근거를 늘리고 싶은 기업',
  },
]

const processSteps = [
  {
    number: '01',
    title: '관련 커뮤니티와 질문 조사',
    description: '브랜드·업종과 연결되는 Reddit 커뮤니티와 해외 고객의 질문을 먼저 살펴봅니다.',
  },
  {
    number: '02',
    title: '맥락에 맞는 콘텐츠 기획',
    description: '각 커뮤니티의 주제와 규칙에 맞춰 정보 제공 중심의 콘텐츠 방향을 정합니다.',
  },
  {
    number: '03',
    title: '게시 후 반응 확인',
    description: '게시 이후의 반응을 확인하며 브랜드 상황에 맞는 다음 운영 방향을 살펴봅니다.',
  },
]

const faqs = [
  {
    question: '레딧 마케팅이란 무엇인가요?',
    answer:
      '브랜드와 관련된 Reddit 커뮤니티와 고객 질문을 조사하고, 각 대화의 맥락과 규칙에 맞는 정보성 콘텐츠로 해외 고객과의 접점을 만드는 마케팅입니다.',
  },
  {
    question: '어떤 기업에 레딧 마케팅이 적합한가요?',
    answer:
      '외국인 고객을 유치하려는 병원·여행·로컬 비즈니스와 구글 검색 및 AI 검색에서 브랜드 근거를 늘리고 싶은 기업에 적합합니다.',
  },
  {
    question: '블링크애드의 레딧 마케팅은 어떻게 진행되나요?',
    answer:
      '관련 커뮤니티와 고객 질문을 조사한 뒤 맥락에 맞는 콘텐츠를 기획하고, 게시 후 반응을 확인하는 순서로 진행합니다.',
  },
  {
    question: '같은 내용을 반복해서 대량으로 게시하나요?',
    answer:
      '아닙니다. 반복 게시나 대량 홍보가 아니라 각 질문과 커뮤니티에 맞는 정보 제공 중심의 운영을 지향합니다.',
  },
]

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export default function RedditMarketingPage() {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '레딧 마케팅 대행',
    serviceType: 'Reddit community marketing',
    url: PAGE_URL,
    provider: {
      '@type': 'Organization',
      name: 'BlinkAd',
      alternateName: ['블링크애드', 'Blink Ad'],
      url: SITE_URL,
    },
    description:
      '브랜드와 관련된 Reddit 질문과 대화를 조사하고 커뮤니티의 맥락과 규칙에 맞는 콘텐츠로 해외 고객 접점과 검색 근거를 만드는 서비스입니다.',
    mainEntityOfPage: PAGE_URL,
    audience: audiences.map((audience) => ({
      '@type': 'Audience',
      audienceType: audience.text,
    })),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      url: `${PAGE_URL}#contact`,
      itemOffered: {
        '@type': 'Service',
        name: '레딧 마케팅 상담',
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
        name: '블링크애드',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '레딧 마케팅',
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
        <section className="relative overflow-hidden border-b border-white/5 px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(30,111,255,0.22),transparent_32%),radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.08),transparent_28%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <nav aria-label="현재 위치" className="mb-8 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Link href="/" className="transition-colors hover:text-white">블링크애드</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-gray-300">레딧 마케팅</span>
            </nav>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FF4500]/30 bg-[#FF4500]/10 shadow-[0_0_32px_rgba(255,69,0,0.14)]">
              <Image
                src="/reddit-logo.png"
                alt="Reddit"
                width={44}
                height={44}
                priority
                className="h-11 w-11"
              />
            </div>
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.24em] text-brand-blue">Reddit Marketing</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-[2.7rem] font-black leading-[1.04] tracking-tight md:text-6xl lg:text-7xl keep-all">
              레딧 마케팅
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-gray-300 md:text-xl md:leading-9 keep-all">
              해외 고객이 질문하고 비교하는 곳에서 브랜드가 발견되도록 만듭니다.
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-gray-400 md:text-lg md:leading-9 keep-all">
              블링크애드는 브랜드와 관련된 Reddit 질문과 대화를 조사하고, 커뮤니티의 맥락과 규칙에 맞는 콘텐츠를 통해 해외 고객과의 접점을 만듭니다. 이를 통해 구글 검색과 AI 검색이 참고할 수 있는 브랜드 근거를 늘립니다.
            </p>
            <Link
              href="#contact"
              className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-bold text-black transition-colors hover:bg-gray-200 md:text-base"
            >
              레딧 마케팅 상담받기
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mx-auto mt-5 max-w-2xl text-xs leading-5 text-gray-600 keep-all">
              Reddit은 Reddit, Inc.의 상표입니다. 블링크애드는 Reddit과 제휴·후원 관계가 없는 독립 마케팅 대행사입니다.
            </p>
          </div>
        </section>

        <section className="border-b border-white/5 px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Why Reddit Marketing</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl keep-all">레딧 마케팅이 필요한 이유</h2>
            <div className="mt-8 space-y-5 text-base leading-8 text-gray-300 md:text-lg md:leading-9 keep-all">
              <p>Reddit에는 여행지, 병원, 숙박, 음식점과 로컬 서비스를 직접 경험한 사람들의 질문과 후기가 쌓입니다.</p>
              <p>블링크애드는 이 대화 속에서 브랜드와 연결되는 질문을 찾고, 커뮤니티에 필요한 정보를 제공해 해외 고객이 브랜드를 발견할 수 있는 접점을 만듭니다.</p>
            </div>
          </div>
        </section>

        <section className="border-b border-white/5 bg-white/[0.03] px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">How We Work</p>
            <h2 className="mt-4 text-center text-3xl font-bold md:text-5xl keep-all">블링크애드 레딧 마케팅 진행 방식</h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
              {processSteps.map((step) => (
                <article key={step.number} className="bg-black p-7 md:p-9">
                  <span className="text-sm font-bold text-brand-blue">{step.number}</span>
                  <h3 className="mt-5 text-xl font-bold leading-8 keep-all">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-400 keep-all">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-5xl">
            <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">Who It&apos;s For</p>
            <h2 className="mt-4 text-center text-3xl font-bold md:text-5xl keep-all">이런 기업에 적합합니다</h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {audiences.map((audience) => {
                const Icon = audience.icon
                return (
                  <div key={audience.text} className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 md:p-9">
                    <Icon className="h-7 w-7 text-brand-blue" />
                    <p className="mt-5 text-lg font-semibold leading-8 text-white md:text-xl keep-all">{audience.text}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 rounded-3xl border border-brand-blue/20 bg-brand-blue/[0.08] px-6 py-8 text-center md:px-10">
              <p className="text-base leading-8 text-gray-200 md:text-lg keep-all">
                커뮤니티 조사부터 콘텐츠 기획, 게시 후 반응 확인까지 브랜드 상황에 맞춰 진행합니다.
              </p>
              <p className="mt-2 text-sm leading-7 text-gray-500 keep-all">
                반복 게시나 대량 홍보가 아닌 정보 제공 중심으로 운영합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 px-5 py-20 md:px-6 md:py-28">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">FAQ</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl keep-all">레딧 마케팅 자주 묻는 질문</h2>
            <dl className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {faqs.map((faq) => (
                <div key={faq.question} className="py-7 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] md:gap-10 md:py-8">
                  <dt className="text-lg font-bold leading-8 text-white keep-all">{faq.question}</dt>
                  <dd className="mt-3 text-sm leading-7 text-gray-400 md:mt-0 md:text-base md:leading-8 keep-all">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-y border-white/5 bg-white/[0.03] px-5 py-20 text-center md:px-6 md:py-28">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold leading-tight md:text-5xl keep-all">
              우리 브랜드에 맞는 Reddit 기회부터 확인해보세요.
            </h2>
            <p className="mt-5 text-base leading-8 text-gray-400 md:text-lg keep-all">
              브랜드와 업종을 알려주시면 관련 커뮤니티와 고객 질문을 살펴보고 상담해드립니다.
            </p>
            <Link
              href="#contact"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-blue-600 md:text-base"
            >
              레딧 마케팅 상담받기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </div>
  )
}
