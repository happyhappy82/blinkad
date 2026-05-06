import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  const search = request.nextUrl.search

  // blog.blinkad.kr의 기존 URL 신호를 www.blinkad.kr/blog로 영구 이전한다.
  if (hostname === 'blog.blinkad.kr' || hostname.startsWith('blog.blinkad.kr:')) {
    const redirectTo = (targetPath: string) => (
      NextResponse.redirect(`https://www.blinkad.kr${targetPath}${search}`, 308)
    )

    if (pathname === '/sitemap.xml') {
      return redirectTo('/sitemap.xml')
    }

    if (pathname === '/feed.xml') {
      return redirectTo('/feed.xml')
    }

    // 정적 파일과 Next.js 내부 자산은 같은 경로의 www 호스트로 보낸다.
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.') // 파일 확장자가 있는 경우 (이미지, favicon 등)
    ) {
      return redirectTo(pathname)
    }

    if (pathname === '/' || pathname === '') {
      return redirectTo('/blog')
    }

    // 기존 /slug와 잘못 퍼진 /blog/slug 모두 새 /blog/slug로 정규화한다.
    if (pathname !== '/') {
      const targetPath = pathname.startsWith('/blog')
        ? pathname
        : `/blog${pathname}`
      return redirectTo(targetPath)
    }
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
