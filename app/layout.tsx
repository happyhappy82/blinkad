import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Blink Ad - Premium SEO Agency',
  description: '프리미엄 SEO 에이전시 블링크애드. 구글 첫 페이지는 목적지가 아닙니다. 그것은 기준입니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
