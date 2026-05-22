import type { Metadata } from 'next'
import ErpClient from './ErpClient'

export const metadata: Metadata = {
  title: 'BlinkAd ERP | 운영 대시보드',
  description:
    '블링크애드의 문의 CRM, 진단자료, 견적서, 프로필 운영, 리포트 현황을 관리하는 ERP 프로토타입입니다.',
}

export default function ErpPage() {
  return <ErpClient />
}
