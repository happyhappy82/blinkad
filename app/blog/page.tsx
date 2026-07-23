import { Metadata } from 'next'
import BlogPage from '@/components/BlogPage'

export const metadata: Metadata = {
  title: '블로그 | BlinkAd - 구글 AEO·GEO 외국인 마케팅 전문',
  description: '구글 AEO·GEO 외국인 마케팅 전문 블링크애드의 인사이트. 의료관광·맛집·로컬 브랜드의 검색·AI 답변 노출 전략과 케이스를 다룹니다.',
  alternates: {
    canonical: 'https://www.blinkad.kr/blog',
  },
  openGraph: {
    title: '블로그 | BlinkAd - 구글 AEO·GEO 외국인 마케팅 전문',
    description: '구글 AEO·GEO 외국인 마케팅 전문 블링크애드의 인사이트. 의료관광·맛집·로컬 브랜드의 검색·AI 답변 노출 전략과 케이스를 다룹니다.',
    url: 'https://www.blinkad.kr/blog',
    siteName: 'BlinkAd',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function Blog() {
  return <BlogPage />
}
