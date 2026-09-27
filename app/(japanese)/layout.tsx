import type { Metadata } from 'next'
import '../globals.css'
import SiteDocument from '@/components/SiteDocument'
import { siteCopy } from '@/i18n/site'
export const metadata: Metadata = {
  metadataBase: new URL('https://www.blinkad.kr'), applicationName: 'BlinkAd',
  title: siteCopy.ja.title, description: siteCopy.ja.description,
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
}
export default function JapaneseLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument language="ja">{children}</SiteDocument>
}
