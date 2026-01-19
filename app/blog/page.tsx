import { Metadata } from 'next'
import BlogPage from '@/components/BlogPage'

export const metadata: Metadata = {
  title: 'Blog - Blink Ad',
  description: '검색 엔진 최적화(SEO)부터 디지털 브랜딩 전략까지. 프리미엄 SEO 에이전시 블링크애드의 인사이트.',
}

export default function Blog() {
  return <BlogPage />
}
