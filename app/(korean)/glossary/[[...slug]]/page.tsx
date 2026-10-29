import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GlossaryList from '@/components/glossary/GlossaryList'
import { GLOSSARY_PAGES, GLOSSARY_REDIRECTS } from '@/lib/glossary'
import '../glossary.css'

type Props = { params: Promise<{ slug?: string[] }> }
const origin = 'https://www.blinkad.kr'
const routePath = (slug?: string[]) => '/glossary' + (slug?.length ? '/' + slug.join('/') : '')

export function generateStaticParams() {
  return [...GLOSSARY_PAGES.map(page => page.path), ...Object.keys(GLOSSARY_REDIRECTS)]
    .map(path => ({ slug: path.slice('/glossary'.length).split('/').filter(Boolean) }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = GLOSSARY_PAGES.find(page => page.path === routePath(slug))
  if (!page) return {}
  return {
    title: page.title, description: page.description,
    alternates: { canonical: origin + page.path },
    robots: { index: true, follow: true },
    openGraph: { title: page.title, description: page.description, url: origin + page.path, siteName: 'BlinkAd', locale: 'ko_KR', type: 'website' },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description },
  }
}

export default async function GlossaryPage({ params }: Props) {
  const { slug } = await params
  const path = routePath(slug)
  if (GLOSSARY_REDIRECTS[path]) permanentRedirect(GLOSSARY_REDIRECTS[path])
  const page = GLOSSARY_PAGES.find(page => page.path === path)
  if (!page) notFound()
  return <>
    <Navbar />
    <main id="glossary-top" className={`dictionary-page${page.kind === 'term' ? ' term-page' : ''}`}>
      {page.config ? <>
        <div dangerouslySetInnerHTML={{ __html: page.headingHTML }} />
        <GlossaryList key={path} config={page.config} categoriesHTML={page.categoriesHTML} />
        <div dangerouslySetInnerHTML={{ __html: page.nextHTML }} />
      </> : <div dangerouslySetInnerHTML={{ __html: page.mainHTML }} />}
    </main>
    <Footer />
    <a className="glossary-backtop" href="#glossary-top" aria-label="맨 위로">↑</a>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page.schema).replace(/</g, '\\u003c') }} />
  </>
}
