import { NextResponse } from 'next/server'
import { getGoogleOAuthConfig } from '@/lib/erp-google-calendar-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const calendarScopes = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
]

function encodeState(state: Record<string, string | number>) {
  return Buffer.from(JSON.stringify(state)).toString('base64url')
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const memberId = url.searchParams.get('memberId') || 'owner'
  const returnTo = url.searchParams.get('returnTo') || '/erp?menu=calendarIntegration'
  const { clientId, redirectUri } = getGoogleOAuthConfig(request)

  if (!clientId) {
    return NextResponse.redirect(
      new URL('/erp?menu=calendarIntegration&calendarOAuth=missing-client-id', url.origin)
    )
  }

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', calendarScopes.join(' '))
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')
  authUrl.searchParams.set('include_granted_scopes', 'true')
  authUrl.searchParams.set('state', encodeState({ memberId, returnTo, issuedAt: Date.now() }))

  return NextResponse.redirect(authUrl)
}
