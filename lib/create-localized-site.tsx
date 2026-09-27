import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LocalizedBlog from '@/components/EnglishBlog'
import HospitalSample from '@/app/(korean)/hospital-sample/HospitalSampleClient'
import RestaurantSample from '@/app/(korean)/restaurant-sample/RestaurantSampleClient'
import { englishHomeCopy, siteCopy } from '@/i18n/site'
import { LOCALIZED_PAGES, LANGUAGE_INFO, languageAlternates, type ForeignLanguage } from '@/lib/site-languages'

type Query = Promise<Record<string, string | string[] | undefined>>
type Props = { params: Promise<{ path?: string[] }>; searchParams: Query }
type PageModule = { default: React.ComponentType; metadata?: Metadata }
type Config = {
  pages: Record<string, PageModule>
  Contact: { default: React.ComponentType<{ searchParams: Query }>; generateMetadata: (props: { searchParams: Query }) => Promise<Metadata> }
  NewsPost: { default: React.ComponentType<{ params: Promise<{ slug: string }> }>; generateMetadata: (props: { params: Promise<{ slug: string }> }) => Promise<Metadata> }
  news: { id: string }[]
  Navbar: React.ComponentType
  Footer: React.ComponentType
}

export function createLocalizedSite(language: ForeignLanguage, config: Config) {
  const copy = siteCopy[language]
  const pages: Record<string, PageModule> = {
    ...config.pages,
    blog: { default: () => <LocalizedBlog language={language} Navbar={config.Navbar} Footer={config.Footer} />, metadata: { title: `${copy.insights} | BlinkAd`, description: copy.insightsDescription } },
    'hospital-sample': { default: () => <HospitalSample initialLang={language} />, metadata: { title: copy.hospitalTitle, description: copy.hospitalDescription, robots: { index: false, follow: false } } },
    'restaurant-sample': { default: () => <RestaurantSample initialLang={language} />, metadata: { title: copy.restaurantTitle, description: copy.restaurantDescription, robots: { index: false, follow: false } } },
  }
  const isNews = (path: string[]) => path.length === 2 && path[0] === 'news' && config.news.some(post => post.id === path[1])
  return {
    generateStaticParams() {
      return [...LOCALIZED_PAGES.map(path => ({ path: path === '/' ? [] : path.slice(1).split('/') })), ...config.news.map(post => ({ path: ['news', post.id] }))]
    },
    async generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
      const { path = [] } = await params
      const key = path.join('/')
      let metadata: Metadata
      if (key === 'contact') metadata = await config.Contact.generateMetadata({ searchParams })
      else if (isNews(path)) metadata = await config.NewsPost.generateMetadata({ params: Promise.resolve({ slug: path[1] }) })
      else if (pages[key]) metadata = { title: copy.title, description: copy.description, ...pages[key].metadata }
      else notFound()
      if (language === 'en' && key === '') metadata.title = englishHomeCopy.title
      const url = `https://www.blinkad.kr/${language}${key ? '/' + key : ''}`
      const title = typeof metadata.title === 'string' ? metadata.title : 'BlinkAd'
      return {
        ...metadata,
        alternates: { canonical: url, languages: languageAlternates('/' + key) },
        openGraph: { ...metadata.openGraph, title, description: metadata.description || undefined, url, siteName: 'BlinkAd', locale: LANGUAGE_INFO[language].og, alternateLocale: Object.entries(LANGUAGE_INFO).filter(([key]) => key !== language).map(([, value]) => value.og), images: metadata.openGraph?.images || ['/og-image.png'] },
        twitter: { card: 'summary_large_image', title, description: metadata.description || undefined, images: ['/og-image.png'] },
      }
    },
    async Page({ params, searchParams }: Props) {
      const { path = [] } = await params
      const key = path.join('/')
      if (key === 'contact') return <config.Contact.default searchParams={searchParams} />
      if (isNews(path)) return <config.NewsPost.default params={Promise.resolve({ slug: path[1] })} />
      const page = pages[key]
      if (!page) notFound()
      return <page.default />
    },
  }
}
