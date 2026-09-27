import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import * as Home from '@/localized/en/app/(korean)/page'
import * as Services from '@/localized/en/app/(korean)/services/page'
import * as Foreign from '@/localized/en/app/(korean)/foreign-marketing/page'
import * as Maps from '@/localized/en/app/(korean)/google-map-marketing/page'
import * as BlogMarketing from '@/localized/en/app/(korean)/blog-marketing/page'
import * as Aeo from '@/localized/en/app/(korean)/aeo/page'
import * as Reddit from '@/localized/en/app/(korean)/reddit-marketing/page'
import * as Cases from '@/localized/en/app/(korean)/case-studies/page'
import * as Contact from '@/localized/en/app/(korean)/contact/page'
import * as News from '@/localized/en/app/(korean)/news/page'
import * as NewsPost from '@/localized/en/app/(korean)/news/[slug]/page'
import { NEWS_POSTS } from '@/localized/en/constants/news'
import EnglishBlog from '@/components/EnglishBlog'
import HospitalSample from '@/app/(korean)/hospital-sample/HospitalSampleClient'
import RestaurantSample from '@/app/(korean)/restaurant-sample/RestaurantSampleClient'
import { ENGLISH_PAGES, languageAlternates } from '@/lib/site-languages'

const pages: Record<string, { default: React.ComponentType; metadata?: Metadata }> = {
  '': Home, services: Services, 'foreign-marketing': Foreign, 'google-map-marketing': Maps,
  'blog-marketing': BlogMarketing, aeo: Aeo, 'reddit-marketing': Reddit, 'case-studies': Cases, news: News,
  blog: { default: EnglishBlog, metadata: { title: 'Insights | BlinkAd', description: 'Practical insights on Google marketing, international customers and AI search. Browse our Korean article archive.' } },
  'hospital-sample': { default: () => <HospitalSample initialLang="en" />, metadata: { title: 'BLINK Clinic | Website Demo', description: 'A multilingual clinic website demonstration.', robots: { index: false, follow: false } } },
  'restaurant-sample': { default: () => <RestaurantSample initialLang="en" />, metadata: { title: 'Haneul Table | Restaurant Website Demo', description: 'A multilingual restaurant website demonstration.', robots: { index: false, follow: false } } },
}
type Props = {
  params: Promise<{ path?: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function isNews(path: string[]) { return path.length === 2 && path[0] === 'news' && NEWS_POSTS.some(post => post.id === path[1]) }

export function generateStaticParams() {
  return [
    ...ENGLISH_PAGES.map(path => ({ path: path === '/' ? [] : path.slice(1).split('/') })),
    ...NEWS_POSTS.map(post => ({ path: ['news', post.id] })),
  ]
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { path = [] } = await params
  const key = path.join('/')
  let metadata: Metadata
  if (key === 'contact') metadata = await Contact.generateMetadata({ searchParams })
  else if (isNews(path)) metadata = await NewsPost.generateMetadata({ params: Promise.resolve({ slug: path[1] }) })
  else if (pages[key]) metadata = { title: 'BlinkAd | Google, AEO & GEO Marketing Agency', description: 'Connect Google Search, Maps, websites and AI search to reach international customers. Marketing for healthcare, restaurants and local brands in Korea.', ...pages[key].metadata }
  else notFound()
  const url = `https://www.blinkad.kr/en${key ? '/' + key : ''}`
  const title = typeof metadata.title === 'string' ? metadata.title : 'BlinkAd'
  return {
    ...metadata,
    alternates: { canonical: url, languages: languageAlternates('/' + key) },
    openGraph: { ...metadata.openGraph, title, description: metadata.description || undefined, url, siteName: 'BlinkAd', locale: 'en_US', alternateLocale: 'ko_KR', images: metadata.openGraph?.images || ['/og-image.png'] },
    twitter: { card: 'summary_large_image', title, description: metadata.description || undefined, images: ['/og-image.png'] },
  }
}

export default async function EnglishPage({ params, searchParams }: Props) {
  const { path = [] } = await params
  const key = path.join('/')
  if (key === 'contact') return <Contact.default searchParams={searchParams} />
  if (isNews(path)) return <NewsPost.default params={Promise.resolve({ slug: path[1] })} />
  const page = pages[key]
  if (!page) notFound()
  return <page.default />
}
