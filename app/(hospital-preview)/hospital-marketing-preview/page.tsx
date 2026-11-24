import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Bot, Building2, Check, ClipboardList,
  FileText, Globe2, Monitor, ReceiptText,
} from 'lucide-react'
import { hospitalPages, HOSPITAL_SERVICE_PATH, PREVIEW_ROOT } from '@/components/hospital-preview/content'
import { ConsultationNote, PreviewFooter, PreviewHeader } from '@/components/hospital-preview/PreviewShell'

export const metadata: Metadata = { title: '병원마케팅 초안 검토 목록' }

const icons = [Building2, ClipboardList, Bot, Monitor, ReceiptText, Globe2, FileText]

export default function HospitalPreviewIndex() {
  return (
    <div className="hp-site min-h-screen bg-black text-white">
      <PreviewHeader />
      <main>
        <header className="px-6 pb-16 pt-32">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-[2.375rem] font-bold leading-tight keep-all sm:text-5xl md:text-6xl">병원마케팅 초안 검토 목록</h1>
            <p className="max-w-2xl text-xl text-gray-400 keep-all">
              대표 서비스 페이지와 분야별 가이드 6편을 모았습니다.
            </p>
            <Link href={HOSPITAL_SERVICE_PATH} className="hp-primary mt-6">
              대표 서비스 페이지 보기 <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </header>

        <div id="guides" className="mx-auto max-w-6xl scroll-mt-24 space-y-16 px-6 pb-24 md:space-y-24">
          {hospitalPages.map((page, index) => {
            const Icon = icons[index]
            const href = PREVIEW_ROOT + '/' + page.slug
            return (
              <section key={page.slug} className="grid items-start gap-6 md:grid-cols-2 md:gap-12">
                <div className={index % 2 ? 'md:order-2' : ''}>
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-blue/20 bg-brand-blue/10">
                    <Icon className="h-8 w-8 text-brand-blue" aria-hidden="true" />
                  </div>
                  <p className="mb-2 text-sm font-medium text-brand-blue">{page.role}</p>
                  <h2 className="mb-4 text-3xl font-bold md:text-4xl"><Link href={href}>{page.shortTitle}</Link></h2>
                  <p className="mb-8 leading-relaxed text-gray-400 keep-all">{page.description}</p>
                  <Link href={href} className="hp-primary" aria-label={page.shortTitle + ' 자세히 보기'}>
                    {page.shortTitle} 보기 <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
                  <h3 className="mb-6 text-lg font-semibold">이 안내에서 확인할 내용</h3>
                  <ul className="space-y-4">
                    {page.points.map(point => (
                      <li key={point} className="flex items-start gap-3 text-gray-300">
                        <Check size={20} className="mt-0.5 shrink-0 text-brand-blue" aria-hidden="true" />{point}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )
          })}
        </div>
        <ConsultationNote />
      </main>
      <PreviewFooter />
    </div>
  )
}
