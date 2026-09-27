import '../globals.css'
import SiteDocument from '@/components/SiteDocument'
export { metadata } from '@/components/SiteDocument'

export default function KoreanLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument language="ko">{children}</SiteDocument>
}
