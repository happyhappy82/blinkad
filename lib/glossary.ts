import data from '@/content/glossary/pages.json'

export type GlossaryTerm = {
  id: number; name: string; english: string; definition: string
  categoryName: string; category: string; url: string; search: string
}
export type GlossaryList = {
  terms: GlossaryTerm[]; allTerms: { id: number; url: string }[]
  category: string | null; categoryName: string; basePath: string
  page: number; pageSize: number
}
export type GlossaryPage = {
  path: string; kind: string; title: string; description: string
  schema: object; mainHTML: string; headingHTML: string
  categoriesHTML: string; nextHTML: string; config: GlossaryList | null
}

export const GLOSSARY_PAGES = data as GlossaryPage[]
export const GLOSSARY_UPDATED_AT = '2026-10-29'
export const GLOSSARY_REDIRECTS: Record<string, string> = {
  '/glossary/seo': '/glossary/basics/seo',
  '/glossary/geo': '/glossary/basics/geo',
  '/glossary/indexing': '/glossary/crawling-indexing/indexing',
}
