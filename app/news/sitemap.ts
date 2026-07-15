import { MetadataRoute } from 'next';
import { NEWS_POSTS } from '@/constants/news';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.blinkad.kr/news';

  const newsMain: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  const newsPosts: MetadataRoute.Sitemap = NEWS_POSTS.map((post) => ({
    url: `${baseUrl}/${post.id}`,
    lastModified: new Date(post.date.replace(/\./g, '-')),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...newsMain, ...newsPosts];
}
