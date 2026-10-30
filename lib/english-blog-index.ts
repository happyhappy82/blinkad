import posts from '@/content/blog/en/index.json'

export const ENGLISH_BLOG_POSTS = posts

export function getEnglishBlogPost(slug: string) {
  return ENGLISH_BLOG_POSTS.find(post => post.id === slug)
}

export function formatEnglishArticleDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(date))
}
