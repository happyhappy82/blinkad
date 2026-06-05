import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ERP_AUTH_REALM = 'BlinkAd ERP'
const DEFAULT_ERP_AUTH_USER = 'blinkad'
const DEFAULT_ERP_AUTH_PASSWORD_SHA256 =
  'bf0747c7604dd7dacb73bd9908d7e9e212a664d617211e13ac287cc98c8a1c84'

function isProtectedErpPath(pathname: string) {
  return (
    pathname === '/erp' ||
    pathname.startsWith('/erp/') ||
    pathname === '/api/erp' ||
    pathname.startsWith('/api/erp/')
  )
}

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${ERP_AUTH_REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
    },
  })
}

function decodeBasicCredentials(authorization: string | null) {
  if (!authorization?.startsWith('Basic ')) {
    return null
  }

  try {
    const decoded = atob(authorization.slice('Basic '.length))
    const separatorIndex = decoded.indexOf(':')

    if (separatorIndex < 0) {
      return null
    }

    return {
      user: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    }
  } catch {
    return null
  }
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  )

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function isErpAuthorized(request: NextRequest) {
  const credentials = decodeBasicCredentials(request.headers.get('authorization'))

  if (!credentials) {
    return false
  }

  const envUser = process.env.ERP_AUTH_USER?.trim()
  const envPassword = process.env.ERP_AUTH_PASSWORD

  if (envUser && envPassword) {
    return credentials.user === envUser && credentials.password === envPassword
  }

  if (credentials.user !== DEFAULT_ERP_AUTH_USER) {
    return false
  }

  return (await sha256Hex(credentials.password)) === DEFAULT_ERP_AUTH_PASSWORD_SHA256
}

export async function middleware(request: NextRequest) {
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

  if (isProtectedErpPath(pathname) && !(await isErpAuthorized(request))) {
    return unauthorized()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/erp/:path*',
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
