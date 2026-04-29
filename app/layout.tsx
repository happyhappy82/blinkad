import type { Metadata } from 'next'
import './globals.css'
import Tracker from '@/components/Tracker'

export const metadata: Metadata = {
  metadataBase: new URL('https://blinkad.kr'),
  verification: {
    google: 'hITjCfw5G-GhQuvrWCZ7vMCcXwt4-zSr_-K-vNruL6E',
    other: {
      'naver-site-verification': '4b64641c3d671cfe7ae80cb01821e64a9c6f16b7',
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K2TTW7SV');`,
          }}
        />
        {/* End Google Tag Manager */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Preconnect for external resources */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title="Blink Ad Blog RSS" href="https://blog.blinkad.kr/feed.xml" />
      </head>
      <body className="bg-black text-white antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K2TTW7SV"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* 통합 문의 추적 트래커 (Layout 마운트, Client Component) */}
        <Tracker />
        {/* Schema.org - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Blink Ad',
              url: 'https://blinkad.kr',
              description: '프리미엄 SEO 에이전시 블링크애드. 구글 첫 페이지는 목적지가 아닙니다. 그것은 기준입니다.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://blinkad.kr/blog?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* Schema.org - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Blink Ad',
              url: 'https://blinkad.kr',
              logo: 'https://blinkad.kr/logo-white-nav.png',
              description: '프리미엄 SEO 에이전시',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Korean'],
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  )
}
