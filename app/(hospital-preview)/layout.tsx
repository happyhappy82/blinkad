import type { Metadata } from 'next'
import '../globals.css'
import './preview.css'

export const metadata: Metadata = {
  title: { default: '병원마케팅 페이지 미리보기 | BlinkAd', template: '%s | BlinkAd 미리보기' },
  description: '블링크애드 병원마케팅 7개 핵심 페이지의 로컬 검토 초안입니다.',
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: '/favicon.svg' },
}

export default function HospitalPreviewLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body className="hp-body">{children}</body></html>
}
