import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

export type CalendarAccount = {
  memberId: string
  name: string
  email: string
  role: string
  calendarId: string
  accessToken?: string
  refreshToken?: string
  expiresAt?: number
  scope?: string
  updatedAt?: string
}

type TokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
  error?: string
  error_description?: string
}

const defaultAccounts: CalendarAccount[] = [
  {
    memberId: 'owner',
    name: '권순현',
    email: 'blinkadceo@gmail.com',
    role: '관리자',
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  },
  {
    memberId: 'ops',
    name: '운영 담당',
    email: 'ops@blinkad.kr',
    role: '운영',
    calendarId: 'primary',
  },
  {
    memberId: 'pm',
    name: '외주 PM',
    email: 'pm@blinkad.kr',
    role: '외주',
    calendarId: 'primary',
  },
]

function storePath() {
  return process.env.ERP_GOOGLE_CALENDAR_STORE_PATH || path.join(process.cwd(), '.erp-private', 'google-calendar-accounts.json')
}

function clientId() {
  return process.env.GOOGLE_CALENDAR_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || ''
}

function clientSecret() {
  return process.env.GOOGLE_CALENDAR_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || ''
}

function fallbackToken() {
  return process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.GOOGLE_ACCESS_TOKEN || ''
}

async function writeAccounts(accounts: CalendarAccount[]) {
  const filePath = storePath()
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify({ accounts }, null, 2), 'utf8')
}

export async function readCalendarAccounts() {
  try {
    const raw = await readFile(storePath(), 'utf8')
    const data = JSON.parse(raw) as { accounts?: CalendarAccount[] }
    const storedAccounts = Array.isArray(data.accounts) ? data.accounts : []
    const merged = new Map<string, CalendarAccount>()

    defaultAccounts.forEach((account) => merged.set(account.memberId, account))
    storedAccounts.forEach((account) => {
      merged.set(account.memberId, {
        ...(merged.get(account.memberId) || {}),
        ...account,
      })
    })

    return Array.from(merged.values())
  } catch {
    return defaultAccounts
  }
}

export async function getCalendarAccount(memberId = 'owner') {
  const accounts = await readCalendarAccounts()
  return accounts.find((account) => account.memberId === memberId) || accounts[0] || defaultAccounts[0]
}

export async function saveCalendarAccountToken({
  memberId,
  accessToken,
  refreshToken,
  expiresIn,
  scope,
}: {
  memberId: string
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  scope?: string
}) {
  const accounts = await readCalendarAccounts()
  const index = accounts.findIndex((account) => account.memberId === memberId)
  const current = index >= 0 ? accounts[index] : { ...defaultAccounts[0], memberId }
  const next: CalendarAccount = {
    ...current,
    accessToken,
    refreshToken: refreshToken || current.refreshToken,
    expiresAt: Date.now() + Math.max(60, expiresIn || 3600) * 1000,
    scope: scope || current.scope,
    updatedAt: new Date().toISOString(),
  }

  if (index >= 0) {
    accounts[index] = next
  } else {
    accounts.push(next)
  }

  await writeAccounts(accounts)
  return next
}

export async function clearCalendarAccountToken(memberId: string) {
  const accounts = await readCalendarAccounts()
  await writeAccounts(
    accounts.map((account) =>
      account.memberId === memberId
        ? {
            ...account,
            accessToken: undefined,
            refreshToken: undefined,
            expiresAt: undefined,
            scope: undefined,
            updatedAt: new Date().toISOString(),
          }
        : account
    )
  )
}

export function getGoogleOAuthConfig(request: Request) {
  const url = new URL(request.url)
  return {
    clientId: clientId(),
    clientSecret: clientSecret(),
    redirectUri:
      process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
      `${url.protocol}//${url.host}/api/erp/google/calendar/oauth/callback`,
  }
}

export async function exchangeCalendarCode({
  code,
  redirectUri,
}: {
  code: string
  redirectUri: string
}) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const data = (await response.json()) as TokenResponse

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || `Google OAuth token API ${response.status}`)
  }

  return data
}

async function refreshAccessToken(account: CalendarAccount) {
  if (!account.refreshToken || !clientId() || !clientSecret()) return ''

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = (await response.json()) as TokenResponse

  if (!response.ok || !data.access_token) return ''

  const saved = await saveCalendarAccountToken({
    memberId: account.memberId,
    accessToken: data.access_token,
    expiresIn: data.expires_in,
    scope: data.scope || account.scope,
  })

  return saved.accessToken || ''
}

export async function getCalendarAuth(memberId = 'owner') {
  const account = await getCalendarAccount(memberId)

  if (account.accessToken && account.expiresAt && account.expiresAt > Date.now() + 60_000) {
    return {
      accessToken: account.accessToken,
      calendarId: account.calendarId || 'primary',
      memberId: account.memberId,
      source: 'stored' as const,
    }
  }

  const refreshedToken = await refreshAccessToken(account)
  if (refreshedToken) {
    return {
      accessToken: refreshedToken,
      calendarId: account.calendarId || 'primary',
      memberId: account.memberId,
      source: 'stored' as const,
    }
  }

  const envToken = fallbackToken()
  return {
    accessToken: envToken,
    calendarId: process.env.GOOGLE_CALENDAR_ID || account.calendarId || 'primary',
    memberId: account.memberId,
    source: envToken ? ('env' as const) : ('none' as const),
  }
}

export function publicCalendarAccount(account: CalendarAccount) {
  return {
    memberId: account.memberId,
    name: account.name,
    email: account.email,
    role: account.role,
    calendarId: account.calendarId || 'primary',
    connected: Boolean(account.refreshToken || (account.accessToken && account.expiresAt && account.expiresAt > Date.now())),
    updatedAt: account.updatedAt,
    expiresAt: account.expiresAt,
  }
}
