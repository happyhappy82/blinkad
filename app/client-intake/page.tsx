import type { Metadata } from 'next'

import ClientIntakeForm from './ClientIntakeForm'

export const metadata: Metadata = {
  title: 'AEO·GEO 콘텐츠 자료 입력 | BlinkAd',
  description: '블링크애드 AEO·GEO 콘텐츠 제작을 위한 클라이언트 자료 입력 페이지입니다.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function ClientIntakePage() {
  return <ClientIntakeForm />
}
