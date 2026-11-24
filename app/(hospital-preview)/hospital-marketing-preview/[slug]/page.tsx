import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHospitalPage, hospitalPages, PREVIEW_ROOT } from '@/components/hospital-preview/content'
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
  const index = hospitalPages.indexOf(page)
  const next = hospitalPages[(index + 1) % hospitalPages.length]
  return <div className="hp-site"><PreviewHeader detail />
    <main>
      <section className="hp-container hp-detail-hero"><div><nav className="hp-breadcrumb" aria-label="현재 위치"><Link href={PREVIEW_ROOT}>전체 안내</Link><span>/</span><span>{page.role}</span></nav><p className="hp-eyebrow">{page.role} <span className="hp-eyebrow-separator">/</span> {page.number} OF 07</p><h1>{page.title}</h1><p className="hp-hero-description">{page.description}</p><a className="hp-text-link" href={`#${page.sections[0].id}`}>내용 살펴보기 <span aria-hidden="true">↓</span></a></div>
        <aside className="hp-summary"><span className="hp-summary-number">{page.number}</span><p className="hp-eyebrow">이 페이지에서 확인할 것</p><ol>{page.points.map((point, i) => <li key={point}><span>{String(i + 1).padStart(2, '0')}</span>{point}</li>)}</ol><div className="hp-summary-bottom">{page.origin}<span>2026.11.24</span></div></aside>
      </section>
      <div className="hp-container hp-article-grid"><article className="hp-article">
        <div className="hp-direct-answer"><span className="hp-eyebrow">먼저 답해드립니다</span><p>{page.answer}</p></div>
        {page.sections.map((section, i) => <section id={section.id} key={section.id} className="hp-content-section"><div className="hp-heading-line"><span>{String(i + 1).padStart(2, '0')}</span><h2>{section.title}</h2></div>
          {section.paragraphs?.map(text => <p key={text}>{text}</p>)}
          {section.items && <div className="hp-item-list">{section.items.map(item => <div key={item.title} className="hp-item"><h3>{item.title}</h3><p>{item.text}</p></div>)}</div>}
          {section.table && <div className="hp-table-scroll" tabIndex={0} role="region" aria-label={`${section.title} 비교표`}><table><thead><tr>{section.table.heads.map(head => <th key={head} scope="col">{head}</th>)}</tr></thead><tbody>{section.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th key={cellIndex} scope="row">{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>}
          {section.image && <figure className="hp-figure"><img src={section.image.src} alt={section.image.alt} width="1200" height="800" loading="lazy" /><figcaption>{section.image.caption}</figcaption></figure>}
          {section.note && <div className="hp-note">{section.note}</div>}
        </section>)}
        <section className="hp-sources" aria-labelledby="sources"><h2 id="sources">내용을 확인한 자료</h2><p>확인일 2026.11.24 · 블링크애드 작성 초안</p><ul>{page.sources.map(source => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.title}<span aria-hidden="true"> ↗</span></a></li>)}</ul></section>
      </article><aside className="hp-toc"><div className="hp-toc-inner"><p className="hp-eyebrow">이 페이지의 안내</p><nav aria-label="본문 목차">{page.sections.map((section, i) => <a key={section.id} href={`#${section.id}`}><span>{String(i + 1).padStart(2, '0')}</span>{section.title}</a>)}</nav><div className="hp-toc-bottom"><span>{page.number} / 07</span><Link href={PREVIEW_ROOT}>전체 목록 ↗</Link></div></div></aside></div>
      <section className="hp-container hp-related"><div className="hp-section-intro"><div><p className="hp-eyebrow">READ NEXT</p><h2>이어서 확인하실 내용</h2></div></div><div className="hp-related-grid">{page.related.map(slug => { const item = getHospitalPage(slug)!; return <Link key={slug} href={`${PREVIEW_ROOT}/${slug}`}><span>{item.number} / {item.role}</span><h3>{item.shortTitle}</h3><p>{item.description}</p><b aria-hidden="true">↗</b></Link> })}</div></section>
      <div className="hp-container"><ConsultationNote /><div className="hp-next-row"><Link href={PREVIEW_ROOT}>← 전체 7개 안내</Link><Link href={`${PREVIEW_ROOT}/${next.slug}`}>다음: {next.shortTitle} →</Link></div></div>
    </main><PreviewFooter /></div>
}
