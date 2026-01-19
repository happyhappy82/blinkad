import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const hostname = context.request.headers.get('host') || '';
  const url = new URL(context.request.url);

  // blog.blinkad.kr로 접속한 경우
  if (hostname === 'blog.blinkad.kr' || hostname.startsWith('blog.blinkad.kr:')) {
    // 이미 /blog 경로면 그대로 진행
    if (url.pathname.startsWith('/blog')) {
      return next();
    }

    // 정적 파일은 그대로 진행
    if (url.pathname.startsWith('/_astro') ||
        url.pathname === '/favicon.svg' ||
        url.pathname === '/robots.txt' ||
        url.pathname.startsWith('/sitemap')) {
      return next();
    }

    // /blog 경로로 rewrite
    const newPath = url.pathname === '/' ? '/blog' : `/blog${url.pathname}`;
    return context.rewrite(newPath);
  }

  return next();
});
