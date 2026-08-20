import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, MessagesSquare, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.blinkad.kr'
const PAGE_URL = `${SITE_URL}/reddit-marketing`

export const metadata: Metadata = {
  title: '레딧 마케팅 대행 | 해외 고객 질문·검색·AI 브랜드 근거 - BlinkAd',
  description:
    '블링크애드는 브랜드와 관련된 Reddit 질문과 대화를 조사하고, 커뮤니티의 맥락과 규칙에 맞는 콘텐츠로 해외 고객 접점과 구글·AI 검색의 브랜드 근거를 만듭니다.',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: '레딧 마케팅 대행 | BlinkAd',
    description: '해외 고객이 질문하고 비교하는 Reddit에서 브랜드가 발견될 수 있는 접점을 만듭니다.',
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
    title: '레딧 마케팅 대행 | BlinkAd',
    description: '해외 고객이 질문하고 비교하는 Reddit에서 브랜드가 발견될 수 있는 접점을 만듭니다.',
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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-blue selection:text-white">
      <JsonLd data={serviceSchema} />
      <Navbar />

      <main>
        <section className="relative overflow-hidden border-b border-white/5 px-5 pb-20 pt-32 md:px-6 md:pb-28 md:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(30,111,255,0.22),transparent_32%),radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.08),transparent_28%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-blue/20 bg-brand-blue/10">
              <MessagesSquare className="h-8 w-8 text-brand-blue" />
            </div>
            <p className="mt-7 text-sm font-bold uppercase tracking-[0.24em] text-brand-blue">Reddit Marketing</p>
            <h1 className="mx-auto mt-5 max-w-4xl text-[2.7rem] font-black leading-[1.04] tracking-tight md:text-6xl lg:text-7xl keep-all">
              해외 고객이 질문하고 비교하는 곳에서
              <br className="hidden md:block" /> 브랜드가 발견되도록 만듭니다.
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-gray-300 md:text-xl md:leading-9 keep-all">
              Reddit에는 여행지, 병원, 숙박, 음식점과 로컬 서비스를 직접 경험한 사람들의 질문과 후기가 쌓입니다.
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
