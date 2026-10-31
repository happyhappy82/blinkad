import posts from '@/content/blog/ja/index.json'

export const JAPANESE_BLOG_POSTS = posts

export function getJapaneseBlogPost(slug: string) {
  return JAPANESE_BLOG_POSTS.find(post => post.id === slug)
}

export function formatJapaneseArticleDate(date: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(date))
}
