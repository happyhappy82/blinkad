import type { Metadata } from 'next'
import Link from 'next/link'
import { hospitalPages, PREVIEW_ROOT } from '@/components/hospital-preview/content'
import { PreviewFooter, PreviewHeader } from '@/components/hospital-preview/PreviewShell'

export const metadata: Metadata = { title: '병원마케팅 7개 페이지 검토' }

export default function HospitalPreviewIndex() {
  return <div className="hp-site"><PreviewHeader />
    <main>
      <section className="hp-container hp-index-hero">
        <div><p className="hp-eyebrow"><span className="hp-status-dot" /> LOCAL PREVIEW · 7 PAGES</p><h1>병원이 맡길 일을<br /><span>명확하게 설명합니다.</span></h1><p className="hp-hero-description">병원마케팅 서비스부터 대행사 선택, AI 검색과 홈페이지,<br className="hp-desktop-break" /> 해외 마케팅·공개 업무 기록까지 이어지는 7개 핵심 안내입니다.</p><Link className="hp-primary" href={`${PREVIEW_ROOT}/hospital-marketing`}>대표 안내부터 보기 <span aria-hidden="true">↗</span></Link></div>
        <div className="hp-route-map" aria-label="7개 안내의 읽기 흐름"><div className="hp-map-top"><span>읽기 흐름</span><span>01 → 07</span></div><div className="hp-map-main"><span className="hp-map-icon">B</span><div><small>START HERE</small><strong>병원마케팅 대행</strong></div><span>↗</span></div><div className="hp-map-branches"><span>대행사 선택</span><span>GEO·AI 검색</span><span>홈페이지·비용</span><span>외국인 마케팅</span></div><div className="hp-map-end"><span className="hp-status-dot" /> 공개 업무 기록과 상담 준비</div><p>각 안내에서 필요한 상세 설명으로 이동하고,<br />실제로 맡길 업무를 확인할 수 있습니다.</p></div>
      </section>
      <section className="hp-container hp-index-list" aria-labelledby="page-list"><div className="hp-section-intro"><div><p className="hp-eyebrow">CONTENTS</p><h2 id="page-list">페이지를 하나씩 살펴보세요.</h2></div><p>아래 제목을 누르면 본문 전체를 볼 수 있습니다.<br />상세 화면 상단에서 언제든 이 목록으로 돌아옵니다.</p></div>
        <div className="hp-page-list">{hospitalPages.map(page => <Link key={page.slug} href={`${PREVIEW_ROOT}/${page.slug}`} className="hp-page-row"><span className="hp-page-number">{page.number}</span><div className="hp-page-row-main"><div className="hp-row-kicker">{page.role}<span>{page.number === '01' || page.number === '07' ? '신규 초안' : '기존 글 보강안'}</span></div><h3>{page.shortTitle}</h3><p>{page.description}</p><div className="hp-keywords">{page.keywords.map(word => <span key={word}>{word}</span>)}</div></div><span className="hp-row-arrow" aria-hidden="true">↗</span></Link>)}</div>
        <aside className="hp-review-note"><span className="hp-eyebrow">검토 범위</span><p>실제 운영 페이지를 바꾸지 않은 로컬 초안입니다. 병원 업무 기록에는 공개된 교육·컨설팅만 담았으며, 확인되지 않은 환자·매출 증가 수치는 넣지 않았습니다.</p></aside>
      </section>
    </main><PreviewFooter /></div>
}
