import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()

  // blog.blinkad.kr 서브도메인 처리
  if (hostname === 'blog.blinkad.kr' || hostname.startsWith('blog.blinkad.kr:')) {
    // 이미 /blog 경로면 그대로 진행
    if (url.pathname.startsWith('/blog')) {
      return NextResponse.next()
    }

    // sitemap.xml은 /blog/sitemap.xml로 rewrite
    if (url.pathname === '/sitemap.xml') {
      url.pathname = '/blog/sitemap.xml'
      return NextResponse.rewrite(url)
    }

    // 정적 파일은 그대로
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.includes('.') // 파일 확장자가 있는 경우 (이미지, favicon 등)
    ) {
      return NextResponse.next()
    }

    // /blog 경로로 rewrite
    if (url.pathname === '/') {
      url.pathname = '/blog'
    } else {
      url.pathname = `/blog${url.pathname}`
    }

    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
