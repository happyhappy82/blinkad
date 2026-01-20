import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://blinkad.kr'),
  verification: {
    google: 'hITjCfw5G-GhQuvrWCZ7vMCcXwt4-zSr_-K-vNruL6E',
    other: {
      'naver-site-verification': '0880a9beee76c3bee3d9675800122348c1dd6204',
    },
  },
  title: 'Blink Ad - Premium SEO Agency',
  description: '프리미엄 SEO 에이전시 블링크애드. 구글 첫 페이지는 목적지가 아닙니다. 그것은 기준입니다.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Blink Ad - Premium SEO Agency',
    description: '프리미엄 SEO 에이전시 블링크애드. 구글 첫 페이지는 목적지가 아닙니다. 그것은 기준입니다.',
    url: 'https://blinkad.kr',
    siteName: 'Blink Ad',
    images: [
      {
        url: 'https://blinkad.kr/og-image.png',
        width: 1200,
        height: 734,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blink Ad - Premium SEO Agency',
    description: '프리미엄 SEO 에이전시 블링크애드. 구글 첫 페이지는 목적지가 아닙니다. 그것은 기준입니다.',
    images: ['https://blinkad.kr/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
