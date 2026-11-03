import posts from '@/content/blog/zh/index.json'

export const CHINESE_BLOG_POSTS = posts

export function getChineseBlogPost(slug: string) {
  return CHINESE_BLOG_POSTS.find(post => post.id === slug)
}

export function formatChineseArticleDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(date))
}
