import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, ChevronDown, ExternalLink } from 'lucide-react'
import { getHospitalPage, hospitalPages, HOSPITAL_SERVICE_PATH, PREVIEW_ROOT } from '@/components/hospital-preview/content'
import { ConsultationNote, PreviewFooter, PreviewHeader } from '@/components/hospital-preview/PreviewShell'

export const dynamicParams = false
export const generateStaticParams = () => hospitalPages.map(page => ({ slug: page.slug }))
type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getHospitalPage((await params).slug)
  return { title: page?.shortTitle || '페이지를 찾을 수 없습니다', description: page?.description, robots: { index: false, follow: false } }
}

export default async function HospitalPreviewDetail({ params }: Props) {
  const page = getHospitalPage((await params).slug)
  if (!page) notFound()
  const isService = page.slug === 'hospital-marketing'
  const next = hospitalPages[(hospitalPages.indexOf(page) + 1) % hospitalPages.length]

  return (
    <div className="hp-site min-h-screen bg-black text-white">
      <PreviewHeader detail />
      <main>
        <article className="px-6 pb-20 pt-32">
          <div className={isService ? 'mx-auto max-w-4xl' : 'mx-auto max-w-3xl'}>
            {isService ? (
              <p className="mb-6 text-sm text-gray-400">서비스 <span aria-hidden="true">/</span> 병원마케팅</p>
            ) : (
              <Link href={HOSPITAL_SERVICE_PATH} className="hp-return">
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
                        const guide = getHospitalPage(slug)!
                        return (
                          <li key={slug}>
                            <Link href={PREVIEW_ROOT + '/' + slug} className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium hover:border-brand-blue/60">
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
                    <span className="text-gray-400">검토본 · <time dateTime="2026-11-24">2026.11.24</time></span>
                  </div>
                  <h1 className="mb-6 text-4xl font-bold leading-tight keep-all md:text-5xl">{page.title}</h1>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue text-sm font-bold" aria-hidden="true">BA</span>
                    <div><p className="font-medium">BlinkAd Team</p><p className="text-sm text-gray-400">AEO·GEO Marketing Agency</p></div>
                  </div>
                </>
              )}
            </header>

            <div className="hp-copy">
              {!isService && <p>{page.description}</p>}
              <p>{page.answer}</p>
              <details className="hp-contents">
                <summary>본문 목차 <ChevronDown size={18} aria-hidden="true" /></summary>
                <nav aria-label="본문 목차">
                  {page.sections.map(section => <a key={section.id} href={'#' + section.id}>{section.title}</a>)}
                </nav>
              </details>

              {page.sections.map(section => (
                <section key={section.id} id={section.id}>
                  <h2>{section.title}</h2>
                  {section.paragraphs?.map(text => <p key={text}>{text}</p>)}
                  {section.items?.map(item => (
                    <div key={item.title}><h3>{item.title}</h3><p>{item.text}</p></div>
                  ))}
                  {section.table && (
                    <div className="hp-table-scroll" tabIndex={0} role="region" aria-label={section.title + ' 비교표'}>
                      <table>
                        <thead><tr>{section.table.heads.map(head => <th key={head} scope="col">{head}</th>)}</tr></thead>
                        <tbody>{section.table.rows.map(row => (
                          <tr key={row[0]}><th scope="row">{row[0]}</th>{row.slice(1).map((cell, i) => <td key={i}>{cell}</td>)}</tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                  {section.image && <figure>
                    <img src={section.image.src} alt={section.image.alt} width="1200" height="800" loading="lazy" />
                    <figcaption>{section.image.caption}</figcaption>
                  </figure>}
                  {section.note && <aside className="hp-note">{section.note}</aside>}
                </section>
              ))}
            </div>

            <section className="mt-16 border-t border-white/10 pt-10">
              <h2 className="mb-4 text-2xl font-bold">참고 자료</h2>
              <ul>{page.sources.map(source => (
                <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-blue-400 hover:underline">
                  {source.title}<ExternalLink size={14} aria-hidden="true" className="shrink-0" />
                </a></li>
              ))}</ul>
            </section>
            {!isService && <section aria-labelledby="related-title" className="mt-16 border-t border-white/10 pt-12">
              <h2 id="related-title" className="mb-6 text-2xl font-bold">이어서 읽어보세요</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {page.related.map(slug => {
                  const item = getHospitalPage(slug)!
                  return (
                    <Link key={slug} href={PREVIEW_ROOT + '/' + slug} className="group flex flex-col rounded-xl border border-white/10 bg-gray-900/50 p-5 transition-colors hover:border-brand-blue/50">
                      <h3 className="text-lg font-bold group-hover:text-blue-400">{item.shortTitle}</h3>
                      <p className="mb-5 mt-3 text-sm leading-relaxed text-gray-400">{item.description}</p>
                      <span className="mt-auto text-sm font-medium text-blue-400">글 읽기 →</span>
                    </Link>
                  )
                })}
              </div>
            </section>}
            <nav aria-label="가이드 이동" className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-gray-400">
              <Link href={PREVIEW_ROOT} className="hp-page-link"><ArrowLeft size={16} /> 전체 목록</Link>
              <Link href={PREVIEW_ROOT + '/' + next.slug} className="hp-page-link">{next.shortTitle} <ArrowRight size={16} /></Link>
            </nav>
          </div>
        </article>
        <ConsultationNote />
      </main>
      <PreviewFooter />
    </div>
  )
}
