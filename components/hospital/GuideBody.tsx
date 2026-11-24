import Link from 'next/link'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { getHospitalPage, type HospitalPage } from '@/lib/hospital-content'
import { hospitalPaths } from '@/lib/hospital-paths'
import './hospital.css'

export default function GuideBody({ page }: { page: HospitalPage }) {
  const isService = page.slug === 'hospital-marketing'
  const sources = page.sources.filter(source => source.href !== 'https://www.blinkad.kr' + hospitalPaths[page.slug])
  return (
    <div className="hp-site">
      <div className="hp-copy">
        {!isService && <p>{page.description}</p>}
        <p>{page.answer}</p>
        <details className="hp-contents">
          <summary>본문 목차 <ChevronDown size={18} aria-hidden="true" /></summary>
          <nav aria-label="본문 목차">
            {page.sections.map(section => <a key={section.id} href={'#guide-' + section.id}>{section.title}</a>)}
          </nav>
        </details>

        {page.sections.map(section => (
          <section key={section.id} id={'guide-' + section.id}>
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
        <ul>{sources.map(source => (
          <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-blue-400 hover:underline">
            {source.title}<ExternalLink size={14} aria-hidden="true" className="shrink-0" />
          </a></li>
        ))}</ul>
      </section>
      {!isService && <section aria-labelledby="related-title" className="mt-16 border-t border-white/10 pt-12">
        <h2 id="related-title" className="mb-6 text-2xl font-bold">이어서 읽어보세요</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {page.related.map(slug => {
            const item = getHospitalPage(slug)
            return (
              <Link key={slug} href={hospitalPaths[slug]} className="group flex flex-col rounded-xl border border-white/10 bg-gray-900/50 p-5 transition-colors hover:border-brand-blue/50">
                <h3 className="text-lg font-bold group-hover:text-blue-400">{item.shortTitle}</h3>
                <p className="mb-5 mt-3 text-sm leading-relaxed text-gray-400">{item.description}</p>
                <span className="mt-auto text-sm font-medium text-blue-400">글 읽기 →</span>
              </Link>
            )
          })}
        </div>
      </section>}
    </div>
  )
}
