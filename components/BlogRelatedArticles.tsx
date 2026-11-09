import Link from 'next/link'
import type { RelatedBlogArticle } from '@/lib/blog-related-articles'
import type { SiteLanguage } from '@/lib/site-languages'

const LABELS = {
  ko: { heading: '이어서 읽어보세요', read: '글 읽기' },
  en: { heading: 'Read next', read: 'Read article' },
  ja: { heading: 'あわせて読みたい記事', read: '記事を読む' },
  zh: { heading: '继续阅读', read: '阅读文章' },
}

export default function BlogRelatedArticles({
  articles,
  language,
}: {
  articles: RelatedBlogArticle[]
  language: SiteLanguage
}) {
  if (!articles.length) return null
  const labels = LABELS[language]
  const prefix = language === 'ko' ? '' : `/${language}`

  return (
    <section aria-labelledby="related-articles-heading" data-blog-related="curated" className="mt-16 border-t border-white/10 pt-12">
      <h2 id="related-articles-heading" className="mb-6 text-2xl font-bold text-white">{labels.heading}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {articles.map(article => (
          <Link key={article.id} href={`${prefix}/blog/${article.id}`} data-related-post-id={article.id}
            className="group flex min-h-11 flex-col rounded-xl border border-white/10 bg-gray-900/50 p-5 transition-colors hover:border-brand-blue/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue">
            <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-brand-blue">{article.title}</h3>
            <p className="mb-5 mt-3 text-sm leading-relaxed text-gray-400">{article.description}</p>
            <span className="mt-auto text-sm font-medium text-brand-blue">{labels.read} <span aria-hidden="true">→</span></span>
          </Link>
        ))}
      </div>
    </section>
  )
}
