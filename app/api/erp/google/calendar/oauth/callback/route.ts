import { NextResponse } from 'next/server'
import {
  exchangeCalendarCode,
  getGoogleOAuthConfig,
  saveCalendarAccountToken,
} from '@/lib/erp-google-calendar-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function decodeState(value: string | null) {
  if (!value) return { memberId: 'owner', returnTo: '/erp?menu=calendarIntegration' }

  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as {
      memberId?: string
      returnTo?: string
    }

    return {
      memberId: parsed.memberId || 'owner',
      returnTo: parsed.returnTo || '/erp?menu=calendarIntegration',
    }
  } catch {
    return { memberId: 'owner', returnTo: '/erp?menu=calendarIntegration' }
  }
}

function redirectWithStatus(origin: string, returnTo: string, status: string) {
  const target = new URL(returnTo, origin)
  target.searchParams.set('menu', 'calendarIntegration')
  target.searchParams.set('calendarOAuth', status)
  return NextResponse.redirect(target)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const { memberId, returnTo } = decodeState(url.searchParams.get('state'))
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig(request)

  if (error) {
    return redirectWithStatus(url.origin, returnTo, error)
  }

  if (!code || !clientId || !clientSecret) {
    return redirectWithStatus(url.origin, returnTo, 'missing-oauth-config')
  }

  try {
    const token = await exchangeCalendarCode({ code, redirectUri })
    await saveCalendarAccountToken({
      memberId,
      accessToken: token.access_token || '',
      refreshToken: token.refresh_token,
      expiresIn: token.expires_in,
      scope: token.scope,
    })

    return redirectWithStatus(url.origin, returnTo, 'connected')
  } catch {
    return redirectWithStatus(url.origin, returnTo, 'token-exchange-failed')
  }
}
