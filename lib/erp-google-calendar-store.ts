import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'
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

const notionTokenProperties = {
  title: '이름',
  memberId: '멤버ID',
  email: '이메일',
  role: '역할',
  calendarId: '캘린더ID',
  accessToken: 'Access Token Enc',
  refreshToken: 'Refresh Token Enc',
  expiresAt: '만료시간',
  scope: 'Scope',
  status: '연동상태',
  updatedAt: '최근갱신일',
} as const

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

function notionTokenDatabaseId() {
  return (
    process.env.NOTION_CALENDAR_TOKEN_DB_ID ||
    process.env.NOTION_CALENDAR_TOKEN_DATABASE_ID ||
    process.env.ERP_GOOGLE_CALENDAR_NOTION_DB_ID ||
    ''
  )
}

function tokenEncryptionSecret() {
  return (
    process.env.TOKEN_ENCRYPTION_KEY ||
    process.env.CALENDAR_TOKEN_ENCRYPTION_KEY ||
    process.env.ERP_TOKEN_ENCRYPTION_KEY ||
    ''
  )
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

function resolveNotionToken() {
  const envToken = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
  if (envToken) return envToken

  try {
    const projectRoot = path.resolve(process.cwd(), '../..')
    return execFileSync('python3', ['-c', 'from ops.notion_api import NOTION_TOKEN; print(NOTION_TOKEN)'], {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 5000,
    }).trim()
  } catch {
    return ''
  }
}

function encryptionKey() {
  const secret = tokenEncryptionSecret()
  return secret ? createHash('sha256').update(secret).digest() : null
}

function encryptToken(value?: string) {
  const key = encryptionKey()
  if (!value || !key) return ''

  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return `v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`
}

function decryptToken(value?: string) {
  const key = encryptionKey()
  if (!value) return ''
  if (!value.startsWith('v1:')) return value
  if (!key) return ''

  try {
    const [, ivText, tagText, encryptedText] = value.split(':')
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivText, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(encryptedText, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    return ''
  }
}

function richText(value?: string) {
  return value
    ? {
        rich_text: [
          {
            text: {
              content: value,
            },
          },
        ],
      }
    : { rich_text: [] }
}

function titleText(value: string) {
  return {
    title: [
      {
        text: {
          content: value,
        },
      },
    ],
  }
}

function plainText(property: any): string {
  if (!property) return ''
  if (property.type === 'title') return property.title?.map((item: any) => item.plain_text).join('') || ''
  if (property.type === 'rich_text') return property.rich_text?.map((item: any) => item.plain_text).join('') || ''
  if (property.type === 'email') return property.email || ''
  if (property.type === 'number') return String(property.number ?? '')
  if (property.type === 'date') return property.date?.start || ''
  return ''
}

function notionStoreConfig() {
  const databaseId = notionTokenDatabaseId()
  const token = databaseId && tokenEncryptionSecret() ? resolveNotionToken() : ''

  return {
    databaseId,
    token,
    encryptionEnabled: Boolean(tokenEncryptionSecret()),
    enabled: Boolean(databaseId && token && tokenEncryptionSecret()),
  }
}

export function calendarTokenStoreStatus() {
  const databaseId = notionTokenDatabaseId()

  if (!databaseId) {
    return {
      source: 'file' as const,
      configured: false,
      message: 'Notion 토큰 DB가 지정되지 않아 로컬 파일 저장소를 사용합니다.',
    }
  }

  if (!tokenEncryptionSecret()) {
    return {
      source: 'file' as const,
      configured: false,
      message: 'TOKEN_ENCRYPTION_KEY가 없어 로컬 파일 저장소를 사용합니다.',
    }
  }

  if (!resolveNotionToken()) {
    return {
      source: 'file' as const,
      configured: false,
      message: 'NOTION_TOKEN 또는 NOTION_API_KEY가 없어 로컬 파일 저장소를 사용합니다.',
    }
  }

  return {
    source: 'notion' as const,
    configured: true,
    message: '캘린더 토큰은 Notion DB에 암호화 저장됩니다.',
  }
}

async function readFileAccounts() {
  try {
    const raw = await readFile(storePath(), 'utf8')
    const data = JSON.parse(raw) as { accounts?: CalendarAccount[] }
    return Array.isArray(data.accounts) ? data.accounts : []
  } catch {
    return []
  }
}

async function writeFileAccounts(accounts: CalendarAccount[]) {
  const filePath = storePath()
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify({ accounts }, null, 2), 'utf8')
}

function accountFromNotionPage(page: any): CalendarAccount {
  const properties = page.properties || {}
  const expiresAtText = plainText(properties[notionTokenProperties.expiresAt])
  const updatedAt = plainText(properties[notionTokenProperties.updatedAt]) || page.last_edited_time || ''

  return {
    memberId: plainText(properties[notionTokenProperties.memberId]) || page.id,
    name: plainText(properties[notionTokenProperties.title]),
    email: plainText(properties[notionTokenProperties.email]),
    role: plainText(properties[notionTokenProperties.role]),
    calendarId: plainText(properties[notionTokenProperties.calendarId]) || 'primary',
    accessToken: decryptToken(plainText(properties[notionTokenProperties.accessToken])),
    refreshToken: decryptToken(plainText(properties[notionTokenProperties.refreshToken])),
    expiresAt: expiresAtText ? Number(expiresAtText) : undefined,
    scope: plainText(properties[notionTokenProperties.scope]),
    updatedAt,
  }
}

async function readNotionAccounts() {
  const config = notionStoreConfig()
  if (!config.enabled) return null

  const notion = new Client({ auth: config.token })
  const response = await notion.databases.query({
    database_id: config.databaseId,
    page_size: 100,
  })

  return response.results.map(accountFromNotionPage)
}

async function findNotionAccountPage(notion: Client, databaseId: string, memberId: string) {
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 1,
    filter: {
      property: notionTokenProperties.memberId,
      rich_text: {
        equals: memberId,
      },
    },
  })

  return response.results[0]
}

function notionAccountProperties(account: CalendarAccount) {
  const connected = Boolean(account.refreshToken || account.accessToken)

  return {
    [notionTokenProperties.title]: titleText(account.name || account.memberId),
    [notionTokenProperties.memberId]: richText(account.memberId),
    [notionTokenProperties.email]: { email: account.email || null },
    [notionTokenProperties.role]: richText(account.role || ''),
    [notionTokenProperties.calendarId]: richText(account.calendarId || 'primary'),
    [notionTokenProperties.accessToken]: richText(encryptToken(account.accessToken)),
    [notionTokenProperties.refreshToken]: richText(encryptToken(account.refreshToken)),
    [notionTokenProperties.expiresAt]: { number: account.expiresAt || null },
    [notionTokenProperties.scope]: richText(account.scope || ''),
    [notionTokenProperties.status]: richText(connected ? '연결됨' : '해제됨'),
    [notionTokenProperties.updatedAt]: account.updatedAt
      ? { date: { start: account.updatedAt } }
      : { date: null },
  }
}

async function writeNotionAccounts(accounts: CalendarAccount[]) {
  const config = notionStoreConfig()
  if (!config.enabled) return false

  const notion = new Client({ auth: config.token })

  for (const account of accounts) {
    const page = await findNotionAccountPage(notion, config.databaseId, account.memberId)
    const properties = notionAccountProperties(account)

    if (page) {
      await notion.pages.update({
        page_id: page.id,
        properties,
      })
    } else {
      await notion.pages.create({
        parent: {
          database_id: config.databaseId,
        },
        properties,
      })
    }
  }

  return true
}

async function writeAccounts(accounts: CalendarAccount[]) {
  try {
    const storedInNotion = await writeNotionAccounts(accounts)
    if (storedInNotion) return
  } catch (error) {
    console.error('Failed to write Google Calendar tokens to Notion.', error)
  }

  await writeFileAccounts(accounts)
}

export async function readCalendarAccounts() {
  const storedAccounts = (await readNotionAccounts().catch(() => null)) || (await readFileAccounts())
  const merged = new Map<string, CalendarAccount>()

  defaultAccounts.forEach((account) => merged.set(account.memberId, account))
  storedAccounts.forEach((account) => {
    merged.set(account.memberId, {
      ...(merged.get(account.memberId) || {}),
      ...account,
    })
  })

  return Array.from(merged.values())
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

  if (!response.ok || !data.access_token) {
    if (data.error === 'invalid_grant') {
      await clearCalendarAccountToken(account.memberId)
    }
    return ''
  }

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
