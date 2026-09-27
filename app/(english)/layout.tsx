import type { Metadata } from 'next'
import '../globals.css'
import SiteDocument from '@/components/SiteDocument'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.blinkad.kr'),
  applicationName: 'BlinkAd',
  title: 'BlinkAd | Google, AEO & GEO Marketing Agency',
  description: 'Connect Google Search, Maps, websites and AI search to reach international customers. Marketing for healthcare, restaurants and local brands in Korea.',
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
}

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument language="en">{children}</SiteDocument>
}
