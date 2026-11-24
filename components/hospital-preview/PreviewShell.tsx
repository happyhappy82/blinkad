import Link from 'next/link'
import { ArrowRight, List } from 'lucide-react'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import BackButton from './BackButton'
import { PREVIEW_ROOT } from './content'

const siteOrigin = 'https://www.blinkad.kr'

export function PreviewHeader({ section = '/services', detail = false }: {
  section?: '/services' | '/blog'
  detail?: boolean
}) {
  return (
    <Navbar preview={{ siteOrigin, section }}>
      <div className="hp-review-links" role="group" aria-label="검토 페이지 이동">
        {detail && <BackButton />}
        <Link href={detail ? PREVIEW_ROOT : '#guides'} className="hp-list-link">
          <List size={15} aria-hidden="true" /> 전체 목록
        </Link>
      </div>
    </Navbar>
  )
}

export function PreviewFooter() {
  return <Footer siteOrigin={siteOrigin} />
}

export function ConsultationNote() {
  return (
    <section id="consultation" className="border-t border-white/10 bg-white/5 px-6 py-16 text-center md:py-24">
      <h2 className="mb-6 text-3xl font-bold md:text-4xl">우리 병원은 어디부터 시작할까요?</h2>
      <p className="mx-auto mb-8 max-w-xl text-gray-400 keep-all">
        홈페이지와 지도 주소, 우선 진료, 상담 가능한 언어를 알려주세요.
        담당자가 현재 상황을 살펴보고 먼저 손볼 곳을 안내합니다.
      </p>
      <a href={siteOrigin + '/contact'} target="_blank" rel="noreferrer" className="hp-primary">
        병원마케팅 상담하기 <ArrowRight size={18} aria-hidden="true" />
      </a>
    </section>
  )
}
