import Link from 'next/link'
import BackButton from './BackButton'
import { hospitalPages, PREVIEW_ROOT } from './content'

export function PreviewHeader({ detail = false }: { detail?: boolean }) {
  return <header className="hp-header"><div className="hp-header-inner">
    <Link href={PREVIEW_ROOT} className="hp-logo" aria-label="블링크애드 7개 페이지 목록"><img src="/logo-white-nav.png" alt="BlinkAd" width="125" height="34" /></Link>
    <span className="hp-header-label">HOSPITAL MARKETING</span>
    <nav aria-label="검토 페이지 이동" className="hp-header-actions">
      {detail && <BackButton />}
      <Link href={PREVIEW_ROOT} className="hp-list-link">전체 목록 <span className="hp-count">7</span></Link>
    </nav>
  </div></header>
}

export function PreviewFooter() {
  return <footer className="hp-footer"><div className="hp-container hp-footer-grid">
    <div><img src="/logo-white-nav.png" alt="BlinkAd" width="110" height="30" /><p>병원의 진료가 정확히 설명되고,<br />필요한 환자가 문의할 수 있도록.</p></div>
    <div><span className="hp-eyebrow">살펴볼 안내</span><div className="hp-footer-links">{hospitalPages.map(page => <Link key={page.slug} href={`${PREVIEW_ROOT}/${page.slug}`}>{page.shortTitle}</Link>)}</div></div>
  </div><div className="hp-container hp-footer-bottom"><span>블링크애드 · 대표 권순현</span><span>로컬 검토 초안 · 2026.11.24</span></div></footer>
}

export function ConsultationNote() {
  return <section className="hp-consult" id="consultation"><div><p className="hp-eyebrow">NEXT CONVERSATION</p><h2>우리 병원에서<br />먼저 바꿀 일은 무엇일까요?</h2><p>홈페이지·지도 주소, 우선 진료와 목표 언어,<br className="hp-desktop-break" /> 현재 고민을 함께 살펴보고 맡길 범위를 정합니다.</p></div><a className="hp-primary" href="https://www.blinkad.kr/contact" target="_blank" rel="noreferrer">공식 상담 페이지 열기 <span aria-hidden="true">↗</span></a><p className="hp-consult-caption">상담 링크는 현재 운영 중인 공식 페이지로 연결됩니다.</p></section>
}
