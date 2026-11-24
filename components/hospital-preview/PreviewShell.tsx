import Link from 'next/link'
import { ArrowRight, List } from 'lucide-react'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import BackButton from './BackButton'
import { HOSPITAL_SERVICE_PATH, PREVIEW_ROOT } from './content'

const siteOrigin = 'https://www.blinkad.kr'

export function PreviewHeader({ detail = false }: { detail?: boolean }) {
  return (
    <Navbar preview={{ siteOrigin, serviceLink: { label: '병원마케팅', href: HOSPITAL_SERVICE_PATH } }}>
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
      <h2 className="mb-6 text-3xl font-bold md:text-4xl">병원마케팅 상담을 원하시나요?</h2>
      <p className="mx-auto mb-8 max-w-xl text-gray-400 keep-all">
        홈페이지와 지도 주소, 먼저 알리고 싶은 진료, 환자에게 답변할 수 있는 언어를 알려주세요.
        담당자가 살펴보고 어떤 일부터 맡기면 좋을지 말씀드리겠습니다.
      </p>
      <a href={siteOrigin + '/contact'} target="_blank" rel="noreferrer" className="hp-primary">
        병원마케팅 상담하기 <ArrowRight size={18} aria-hidden="true" />
      </a>
    </section>
  )
}
