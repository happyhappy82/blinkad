import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getHospitalPage } from '@/lib/hospital-content'
import { hospitalPaths } from '@/lib/hospital-paths'
import GuideBody from './GuideBody'

type LandingTopic = 'hospital-marketing' | 'hospital-work'

export function hospitalMetadata(topic: LandingTopic): Metadata {
  const page = getHospitalPage(topic)
  const title = page.title + ' | 블링크애드'
  const url = 'https://www.blinkad.kr' + hospitalPaths[topic]
  const image = page.sections.find(section => section.image)?.image?.src || '/og-image.png'
  return {
    title, description: page.description, alternates: { canonical: url },
    openGraph: { title, description: page.description, url, siteName: 'BlinkAd', locale: 'ko_KR', type: 'website', images: [image] },
    twitter: { card: 'summary_large_image', title, description: page.description, images: [image] },
  }
}

export function HospitalLanding({ topic }: { topic: LandingTopic }) {
  const page = getHospitalPage(topic)
  const isService = topic === 'hospital-marketing'
  return (
    <div className="hp-site min-h-screen bg-black text-white">
      <Navbar />
      <main>
        <article className="px-6 pb-20 pt-32">
          <div className={isService ? 'mx-auto max-w-4xl' : 'mx-auto max-w-3xl'}>
            {isService ? (
              <p className="mb-6 text-sm text-gray-400"><Link href="/services" className="hover:underline">서비스</Link> <span aria-hidden="true">/</span> 병원마케팅</p>
            ) : (
              <Link href={hospitalPaths['hospital-marketing']} className="hp-return">
                <ArrowLeft size={20} aria-hidden="true" /> 병원마케팅 대행
              </Link>
            )}
            <header className="mb-12">
              {isService ? (
                <>
                  <h1 className="mb-6 text-5xl font-bold keep-all md:text-6xl">{page.shortTitle}</h1>
                  <p className="max-w-2xl text-xl text-gray-400 keep-all">{page.description}</p>
                  <nav aria-labelledby="service-guides-title" className="mt-10">
                    <h2 id="service-guides-title" className="mb-3 text-lg font-bold">분야별 가이드</h2>
                    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {page.related.map(slug => {
                        const guide = getHospitalPage(slug)
                        return (
                          <li key={slug}>
                            <Link href={hospitalPaths[slug]} className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium hover:border-brand-blue/60">
                              {guide.shortTitle}<ArrowRight size={16} aria-hidden="true" className="shrink-0 text-blue-400" />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </nav>
                </>
              ) : (
                <>
                  <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <span className="rounded-full bg-brand-blue/20 px-3 py-1 font-medium text-blue-400">{page.role}</span>
                    <span className="text-gray-400"><time dateTime="2026-11-24">2026.11.24</time></span>
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight keep-all md:text-5xl">{page.title}</h1>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-sm font-bold" aria-hidden="true">BA</span>
                    <div><p className="font-medium">BlinkAd Team</p><p className="text-sm text-gray-400">AEO·GEO Marketing Agency</p></div>
                  </div>
                </>
              )}
            </header>

            <GuideBody page={page} />
          </div>
        </article>
        <ConsultationNote />
      </main>
      <Footer />
    </div>
  )
}

function ConsultationNote() {
  return (
    <section id="consultation" className="border-t border-white/10 bg-white/5 px-6 py-16 text-center md:py-24">
      <h2 className="mb-6 text-3xl font-bold md:text-4xl">병원마케팅 상담을 원하시나요?</h2>
      <p className="mx-auto mb-8 max-w-xl text-gray-400 keep-all">
        홈페이지와 지도 주소, 먼저 알리고 싶은 진료, 환자에게 답변할 수 있는 언어를 알려주세요.
        담당자가 살펴보고 어떤 일부터 맡기면 좋을지 말씀드리겠습니다.
      </p>
      <a href="/contact" className="hp-primary">
        병원마케팅 상담하기 <ArrowRight size={18} aria-hidden="true" />
      </a>
    </section>
  )
}
