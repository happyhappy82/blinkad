import Link from 'next/link'
import Image from 'next/image'
import { BLOG_POSTS } from '@/constants'
import { siteCopy } from '@/i18n/site'
import type { ForeignLanguage } from '@/lib/site-languages'

export default function LocalizedBlog({ language, Navbar, Footer }: { language: ForeignLanguage; Navbar: React.ComponentType; Footer: React.ComponentType }) {
  const copy = siteCopy[language]
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-5 md:px-6">
          <header className="mb-14">
            <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">{copy.insights}.</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-gray-300">{copy.insightsDescription}</p>
            <p className="mt-5 max-w-2xl border-l-2 border-brand-blue pl-4 text-sm leading-relaxed text-gray-400">{copy.archive}</p>
          </header>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
            {BLOG_POSTS.map((post, index) => (
              <article key={post.id}>
                <Link href={`/blog/${post.id}`} hrefLang="ko" className="group flex h-full flex-col">
                  {post.imageUrl && <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-white/5 bg-gray-900">
                    <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" priority={index < 3} />
                  </div>}
                  <div className="flex-1 space-y-3">
                    <div className="text-sm text-gray-400"><time dateTime={post.date.replace(/\./g, '-')}>{post.date}</time> · BlinkAd Team</div>
                    <h2 lang="ko" className="keep-all text-2xl font-bold leading-snug text-white transition-colors group-hover:text-brand-blue">{post.title}</h2>
                    {post.excerpt && <p lang="ko" className="keep-all line-clamp-3 text-sm leading-relaxed text-gray-400">{post.excerpt}</p>}
                  </div>
                  <span className="mt-6 text-sm font-semibold text-brand-blue">{copy.readOriginal}</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
