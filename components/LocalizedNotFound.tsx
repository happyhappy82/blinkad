import Link from 'next/link'
import { siteCopy } from '@/i18n/site'
import type { ForeignLanguage } from '@/lib/site-languages'

export default function LocalizedNotFound({ language }: { language: ForeignLanguage }) {
  const copy = siteCopy[language]
  return <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
    <div><p className="mb-4 text-7xl font-bold text-brand-blue">404</p><h1 className="mb-4 text-2xl font-semibold">{copy.notFound}</h1><p className="mb-8 text-gray-400">{copy.notFoundDescription}</p><Link href={`/${language}`} className="rounded-full bg-brand-blue px-6 py-3 font-medium">{copy.backHome}</Link></div>
  </main>
}
