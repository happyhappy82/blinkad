import { BigQuery } from '@google-cloud/bigquery'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type AdsSummary = {
  rowCount: number
  impressions: number
  clicks: number
  costMicros: number
  localActionDirectionRequests: number
  localActionCalls: number
  localActionWebsiteClicks: number
  localActions: number
}

type GoogleAdsCampaign = {
  id: string
  name: string
  status: string
  channel: string
  startDate: string
  endDate: string
}

type GoogleAdsCampaignSummary = GoogleAdsCampaign &
  AdsSummary & {
    previousSummary: AdsSummary
  }

type GoogleAdsSearchTermSummary = {
  searchTerm: string
  campaignName: string
  adGroupName: string
  impressions: number
  clicks: number
  costMicros: number
}

type GoogleAdsSearchRow = {
  campaign?: {
    id?: string | number
    name?: string
    status?: string
    advertisingChannelType?: string
    startDate?: string
    endDate?: string
  }
  customer?: {
    id?: string | number
    descriptiveName?: string
    manager?: boolean
  }
  customerClient?: {
    id?: string | number
    descriptiveName?: string
    manager?: boolean
    level?: string | number
    status?: string
  }
  adGroup?: {
    id?: string | number
    name?: string
  }
  searchTermView?: {
    searchTerm?: string
  }
  metrics?: {
    impressions?: string | number
    clicks?: string | number
    costMicros?: string | number
  }
  segments?: {
    date?: string
  }
}

type ResolvedAdsAccount = {
  customerId: string
  loginCustomerId: string
}

type LiveAdsStoreConfig = {
  envPrefixes: string[]
  aliases: string[]
  defaultCampaignName: string
  campaignNameIncludes?: string[]
  notFoundLabel: string
}

class GoogleAdsLiveError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GoogleAdsLiveError'
    this.status = status
  }
}

function loadSharedEnv() {
  const envPaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', 'blinkad', '.env.local'),
    path.resolve(process.cwd(), '..', 'blinkad', '.env'),
    path.resolve(process.cwd(), '../..', '.env'),
  ]

  envPaths.forEach((envPath) => {
    if (!fs.existsSync(envPath)) return

    fs.readFileSync(envPath, 'utf-8')
      .split('\n')
      .forEach((rawLine) => {
        const line = rawLine.trim()
        if (!line || line.startsWith('#') || !line.includes('=')) return
        const [rawKey, ...valueParts] = line.split('=')
        const key = rawKey.trim()
        if (!key || process.env[key]) return
        process.env[key] = valueParts.join('=').trim()
      })
  })
}

function safeIdentifier(value: string, pattern: RegExp) {
  return pattern.test(value) ? value : ''
}

function numberValue(value: unknown) {
  if (value && typeof value === 'object' && 'value' in value) {
    return Number((value as { value?: string | number }).value || 0)
  }
  return Number(value || 0)
}

function dateValue(value: unknown) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'object' && 'value' in value) {
    return String((value as { value?: string }).value || '').slice(0, 10)
  }
  return String(value).slice(0, 10)
}

function timestampValue(value: unknown) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && 'value' in value) {
    return String((value as { value?: string }).value || '')
  }
  return String(value)
}

function toSummary(row: Record<string, unknown> | undefined): AdsSummary {
  const localActionDirectionRequests = numberValue(row?.local_action_direction_requests)
  const localActionCalls = numberValue(row?.local_action_calls)
  const localActionWebsiteClicks = numberValue(row?.local_action_website_clicks)

  return {
    rowCount: numberValue(row?.row_count),
    impressions: numberValue(row?.impressions),
    clicks: numberValue(row?.clicks),
    costMicros: numberValue(row?.cost_micros),
    localActionDirectionRequests,
    localActionCalls,
    localActionWebsiteClicks,
    localActions: localActionDirectionRequests + localActionCalls + localActionWebsiteClicks,
  }
}

function emptySummary(): AdsSummary {
  return {
    rowCount: 0,
    impressions: 0,
    clicks: 0,
    costMicros: 0,
    localActionDirectionRequests: 0,
    localActionCalls: 0,
    localActionWebsiteClicks: 0,
    localActions: 0,
  }
}

function connectionErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('Could not load the default credentials')) {
    return 'BigQuery 인증 정보가 없어 Google Ads 데이터를 불러오지 못했습니다.'
  }
  if (message.includes('Not found')) {
    return 'Google Ads BigQuery 테이블을 찾지 못했습니다.'
  }
  return message || 'Google Ads 데이터를 불러오지 못했습니다.'
}

function normalizedStoreName(value: string) {
  return value.replace(/\s+/g, '').toLowerCase()
}

function liveAdsStoreConfig(store: string): LiveAdsStoreConfig | null {
  const normalized = normalizedStoreName(store)

  if (normalized.includes('블링크애드') || normalized.includes('blinkad')) {
    return {
      envPrefixes: ['BLINKAD'],
      aliases: ['블링크애드', 'BlinkAd', 'blinkad'],
      defaultCampaignName: '블링크애드 클라이언트유치',
      campaignNameIncludes: ['블링크애드 클라이언트유치'],
      notFoundLabel: '블링크애드',
    }
  }

  if (normalized.includes('웰믹스') || normalized.includes('wellmix')) {
    return {
      envPrefixes: ['WELLMIX_GWANGHWAMUN', 'WELLMIX'],
      aliases: ['웰믹스 광화문점', '웰믹스', 'Wellmix', 'wellmix'],
      defaultCampaignName: '웰믹스',
      campaignNameIncludes: ['웰믹스'],
      notFoundLabel: '웰믹스 광화문점',
    }
  }

  if (normalized.includes('도르도뉴') || normalized.includes('dordogne')) {
    return {
      envPrefixes: ['DORDOGNE'],
      aliases: ['도르도뉴', 'Dordogne', 'dordogne'],
      defaultCampaignName: '도르도뉴',
      campaignNameIncludes: ['도르도뉴', 'Dordogne', 'dordogne'],
      notFoundLabel: '도르도뉴',
    }
  }

  return null
}

function googleAdsConfigMissing() {
  return [
    'GOOGLE_ADS_DEVELOPER_TOKEN',
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET',
    'GOOGLE_ADS_REFRESH_TOKEN',
  ].filter((key) => !process.env[key])
}

function googleAdsId(value: string | undefined) {
  return (value || '').replace(/\D/g, '')
}

function envValueFromPrefixes(prefixes: string[], suffix: string) {
  for (const prefix of prefixes) {
    const value = process.env[`${prefix}_${suffix}`]
    if (value) return value
  }
  return ''
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function campaignMatchTokens(config: LiveAdsStoreConfig, campaignName: string) {
  return uniqueStrings([campaignName, config.defaultCampaignName, ...(config.campaignNameIncludes || [])])
}

function liveCampaignNameMatches(name: string, config: LiveAdsStoreConfig, campaignName: string) {
  const normalizedName = normalizedStoreName(name)
  return campaignMatchTokens(config, campaignName).some((token) =>
    normalizedName.includes(normalizedStoreName(token))
  )
}

function googleAdsCampaignId(row: GoogleAdsSearchRow) {
  return googleAdsId(String(row.campaign?.id || ''))
}

function publicGoogleAdsId(value: string | number | undefined) {
  const id = String(value || '').replace(/\D/g, '')
  return id ? `***${id.slice(-4)}` : ''
}

function googleAdsApiVersion() {
  const version = process.env.GOOGLE_ADS_API_VERSION || 'v22'
  return /^v\d+$/.test(version) ? version : 'v22'
}

function utcDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

function addUtcDays(value: Date, days: number) {
  const next = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function dateRange(days: number) {
  const end = addUtcDays(new Date(), 0)
  const start = addUtcDays(end, -(days - 1))
  const previousEnd = addUtcDays(start, -1)
  const previousStart = addUtcDays(previousEnd, -(days - 1))

  return {
    startDate: utcDateOnly(start),
    endDate: utcDateOnly(end),
    previousStartDate: utcDateOnly(previousStart),
    previousEndDate: utcDateOnly(previousEnd),
  }
}

async function fetchGoogleAdsAccessToken() {
  const missing = googleAdsConfigMissing()
  if (missing.length) {
    throw new GoogleAdsLiveError(`Google Ads API 환경변수가 부족합니다: ${missing.join(', ')}`)
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET || '',
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN || '',
    grant_type: 'refresh_token',
  })
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  if (!response.ok) {
    throw new GoogleAdsLiveError('Google Ads OAuth 토큰을 갱신하지 못했습니다.', response.status)
  }

  const data = (await response.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new GoogleAdsLiveError('Google Ads OAuth 응답에 access token이 없습니다.')
  }
  return data.access_token
}

async function googleAdsSearch(
  accessToken: string,
  customerId: string,
  query: string,
  loginCustomerId?: string
) {
  const headers: Record<string, string> = {
    authorization: `Bearer ${accessToken}`,
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
    'content-type': 'application/json',
  }
  if (loginCustomerId) headers['login-customer-id'] = loginCustomerId

  const response = await fetch(
    `https://googleads.googleapis.com/${googleAdsApiVersion()}/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    }
  )
  const text = await response.text()

  if (!response.ok) {
    let detail = ''
    try {
      const parsedBody = JSON.parse(text) as
        | {
            error?: {
              message?: string
              details?: Array<{ errors?: Array<{ message?: string; errorCode?: Record<string, string> }> }>
            }
          }
        | Array<{
            error?: {
              message?: string
              details?: Array<{ errors?: Array<{ message?: string; errorCode?: Record<string, string> }> }>
            }
          }>
      const parsed = Array.isArray(parsedBody) ? parsedBody[0] : parsedBody
      const apiError = parsed.error?.details?.[0]?.errors?.[0]
      const code = apiError?.errorCode ? Object.values(apiError.errorCode)[0] : ''
      detail = apiError?.message || parsed.error?.message || code
    } catch {
      detail = ''
    }
    throw new GoogleAdsLiveError(detail || 'Google Ads API 조회에 실패했습니다.', response.status)
  }

  const chunks = JSON.parse(text) as Array<{ results?: GoogleAdsSearchRow[] }>
  return chunks.flatMap((chunk) => chunk.results || [])
}

async function listAccessibleGoogleAdsCustomers(accessToken: string) {
  const response = await fetch(
    `https://googleads.googleapis.com/${googleAdsApiVersion()}/customers:listAccessibleCustomers`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
      },
    }
  )
  if (!response.ok) {
    throw new GoogleAdsLiveError('접근 가능한 Google Ads 고객 계정을 조회하지 못했습니다.', response.status)
  }
  const data = (await response.json()) as { resourceNames?: string[] }
  return (data.resourceNames || []).map((name) => name.replace('customers/', ''))
}

async function fetchMatchingLiveCampaignRows(
  accessToken: string,
  customerId: string,
  loginCustomerId: string,
  config: LiveAdsStoreConfig,
  campaignName: string
) {
  const rows = await googleAdsSearch(
    accessToken,
    customerId,
    `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.start_date,
        campaign.end_date
      FROM campaign
      WHERE campaign.status != REMOVED
      ORDER BY campaign.id DESC
      LIMIT 200
    `,
    loginCustomerId || undefined
  )

  return rows.filter((row) => liveCampaignNameMatches(row.campaign?.name || '', config, campaignName))
}

async function resolveLiveAdsAccount(
  accessToken: string,
  config: LiveAdsStoreConfig,
  campaignName: string
): Promise<ResolvedAdsAccount> {
  const explicitCustomerId = googleAdsId(envValueFromPrefixes(config.envPrefixes, 'GOOGLE_ADS_CUSTOMER_ID'))
  const explicitLoginCustomerId = googleAdsId(
    envValueFromPrefixes(config.envPrefixes, 'GOOGLE_ADS_LOGIN_CUSTOMER_ID') || process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
  )

  if (explicitCustomerId) {
    return { customerId: explicitCustomerId, loginCustomerId: explicitLoginCustomerId }
  }

  const accessibleCustomerIds = await listAccessibleGoogleAdsCustomers(accessToken)
  const managerIds = new Set<string>()
  const candidateAccounts = new Map<string, string>()
  if (explicitLoginCustomerId) managerIds.add(explicitLoginCustomerId)

  for (const customerId of accessibleCustomerIds) {
    try {
      const rows = await googleAdsSearch(
        accessToken,
        customerId,
        'SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1'
      )
      const customer = rows[0]?.customer
      if (
        customer?.manager &&
        config.aliases.some((alias) => String(customer.descriptiveName || '').includes(alias))
      ) {
        managerIds.add(customerId)
      }
      if (customer && !customer.manager) {
        candidateAccounts.set(customerId, '')
        if (config.aliases.some((alias) => String(customer.descriptiveName || '').includes(alias))) {
          return { customerId, loginCustomerId: explicitLoginCustomerId }
        }
      }
    } catch {
      // Some accessible accounts require manager scoping; those are handled by the child lookup below.
    }
  }

  for (const managerId of managerIds) {
    try {
      const rows = await googleAdsSearch(
        accessToken,
        managerId,
        `
          SELECT
            customer_client.id,
            customer_client.descriptive_name,
            customer_client.manager,
            customer_client.level,
            customer_client.status
          FROM customer_client
          WHERE customer_client.level = 1
            AND customer_client.status = ENABLED
          LIMIT 100
        `
      )
      const child = rows.find((row) => {
        const client = row.customerClient
        return (
          client &&
          !client.manager &&
          config.aliases.some((alias) => String(client.descriptiveName || '').includes(alias))
        )
      })
      const childId = googleAdsId(String(child?.customerClient?.id || ''))
      if (childId) {
        return { customerId: childId, loginCustomerId: managerId }
      }

      rows.forEach((row) => {
        const client = row.customerClient
        const childCandidateId = googleAdsId(String(client?.id || ''))
        if (client && !client.manager && childCandidateId) {
          candidateAccounts.set(childCandidateId, managerId)
        }
      })
    } catch {
      // Keep searching other manager candidates when a stale login-customer-id is configured.
    }
  }

  if (campaignName && candidateAccounts.size) {
    for (const [customerId, loginCustomerId] of candidateAccounts) {
      try {
        const campaignRows = await fetchMatchingLiveCampaignRows(
          accessToken,
          customerId,
          loginCustomerId,
          config,
          campaignName
        )
        if (campaignRows.length) {
          return { customerId, loginCustomerId }
        }
      } catch {
        // Continue checking other accessible child accounts.
      }
    }
  }

  const fallbackCustomerId = googleAdsId(process.env.GOOGLE_ADS_CUSTOMER_ID)
  if (fallbackCustomerId) {
    return { customerId: fallbackCustomerId, loginCustomerId: explicitLoginCustomerId }
  }

  throw new GoogleAdsLiveError(`${config.notFoundLabel} 하위 Google Ads 고객 계정을 찾지 못했습니다.`)
}

function mapGoogleAdsCampaign(row: GoogleAdsSearchRow): GoogleAdsCampaign {
  return {
    id: publicGoogleAdsId(row.campaign?.id),
    name: row.campaign?.name || '',
    status: row.campaign?.status || '',
    channel: row.campaign?.advertisingChannelType || '',
    startDate: row.campaign?.startDate || '',
    endDate: row.campaign?.endDate || '',
  }
}

function aggregateGoogleAdsRows(rows: GoogleAdsSearchRow[]): AdsSummary {
  return rows.reduce(
    (summary, row) => ({
      ...summary,
      impressions: summary.impressions + numberValue(row.metrics?.impressions),
      clicks: summary.clicks + numberValue(row.metrics?.clicks),
      costMicros: summary.costMicros + numberValue(row.metrics?.costMicros),
    }),
    { ...emptySummary(), rowCount: rows.length }
  )
}

function buildGoogleAdsCampaignSummaries(
  campaignRows: GoogleAdsSearchRow[],
  summaryRows: GoogleAdsSearchRow[],
  previousRows: GoogleAdsSearchRow[]
): GoogleAdsCampaignSummary[] {
  return campaignRows.map((campaignRow) => {
    const campaignId = googleAdsCampaignId(campaignRow)
    const currentSummary = aggregateGoogleAdsRows(
      summaryRows.filter((row) => googleAdsCampaignId(row) === campaignId)
    )
    const previousSummary = aggregateGoogleAdsRows(
      previousRows.filter((row) => googleAdsCampaignId(row) === campaignId)
    )

    return {
      ...mapGoogleAdsCampaign(campaignRow),
      ...currentSummary,
      previousSummary,
    }
  })
}

function buildGoogleAdsSearchTermSummaries(rows: GoogleAdsSearchRow[]): GoogleAdsSearchTermSummary[] {
  const grouped = new Map<string, GoogleAdsSearchTermSummary>()

  rows.forEach((row) => {
    const searchTerm = (row.searchTermView?.searchTerm || '').trim()
    if (!searchTerm) return

    const campaignName = row.campaign?.name || ''
    const adGroupName = row.adGroup?.name || ''
    const key = `${searchTerm}\u0000${campaignName}\u0000${adGroupName}`
    const current =
      grouped.get(key) || {
        searchTerm,
        campaignName,
        adGroupName,
        impressions: 0,
        clicks: 0,
        costMicros: 0,
      }

    current.impressions += numberValue(row.metrics?.impressions)
    current.clicks += numberValue(row.metrics?.clicks)
    current.costMicros += numberValue(row.metrics?.costMicros)
    grouped.set(key, current)
  })

  return Array.from(grouped.values()).sort(
    (a, b) => b.clicks - a.clicks || b.impressions - a.impressions || b.costMicros - a.costMicros
  )
}

async function loadStoreLiveAds(store: string, days: number, config: LiveAdsStoreConfig) {
  const accessToken = await fetchGoogleAdsAccessToken()
  const campaignName =
    envValueFromPrefixes(config.envPrefixes, 'GOOGLE_ADS_CAMPAIGN_NAME') || config.defaultCampaignName
  const { customerId, loginCustomerId } = await resolveLiveAdsAccount(accessToken, config, campaignName)
  const { startDate, endDate, previousStartDate, previousEndDate } = dateRange(days)
  const campaignRows = await fetchMatchingLiveCampaignRows(
    accessToken,
    customerId,
    loginCustomerId,
    config,
    campaignName
  )
  const campaigns = campaignRows.map(mapGoogleAdsCampaign)
  const campaignIds = uniqueStrings(campaignRows.map(googleAdsCampaignId))

  if (!campaigns.length || !campaignIds.length) {
    return {
      source: 'google_ads_api',
      connected: true,
      status: 'campaign_not_found',
      store,
      message: `${config.notFoundLabel} 기준 캠페인을 Google Ads API에서 찾지 못했습니다.`,
      period: { days, firstDate: startDate, lastDate: endDate },
      summary: emptySummary(),
      previousSummary: emptySummary(),
      daily: [],
      adsCustomerIds: [publicGoogleAdsId(customerId)],
      campaigns,
      campaignSummaries: [],
      searchTerms: [],
      sourceSyncedAt: new Date().toISOString(),
    }
  }

  const campaignWhere = `campaign.id IN (${campaignIds.join(', ')}) AND campaign.status != REMOVED`
  const summaryRows = await googleAdsSearch(
    accessToken,
    customerId,
    `
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM campaign
      WHERE ${campaignWhere}
        AND segments.date BETWEEN '${startDate}' AND '${endDate}'
    `,
    loginCustomerId
  )
  const previousRows = await googleAdsSearch(
    accessToken,
    customerId,
    `
      SELECT
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM campaign
      WHERE ${campaignWhere}
        AND segments.date BETWEEN '${previousStartDate}' AND '${previousEndDate}'
    `,
    loginCustomerId
  )
  const dailyRows = await googleAdsSearch(
    accessToken,
    customerId,
    `
      SELECT
        segments.date,
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros
      FROM campaign
      WHERE ${campaignWhere}
        AND segments.date BETWEEN '${startDate}' AND '${endDate}'
      ORDER BY segments.date DESC
      LIMIT 90
    `,
    loginCustomerId
  )
  let searchTerms: GoogleAdsSearchTermSummary[] = []
  let searchTermMessage = ''
  try {
    const searchTermRows = await googleAdsSearch(
      accessToken,
      customerId,
      `
        SELECT
          campaign.name,
          ad_group.name,
          search_term_view.search_term,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros
        FROM search_term_view
        WHERE ${campaignWhere}
          AND segments.date BETWEEN '${startDate}' AND '${endDate}'
          AND metrics.clicks > 0
        ORDER BY metrics.clicks DESC
        LIMIT 50
      `,
      loginCustomerId
    )
    searchTerms = buildGoogleAdsSearchTermSummaries(searchTermRows).slice(0, 50)
  } catch (error) {
    searchTermMessage =
      error instanceof Error
        ? `검색어 세부 데이터를 불러오지 못했습니다: ${error.message}`
        : '검색어 세부 데이터를 불러오지 못했습니다.'
  }

  const statuses = Array.from(new Set(campaigns.map((campaign) => campaign.status).filter(Boolean)))
  const campaignSummaries = buildGoogleAdsCampaignSummaries(campaignRows, summaryRows, previousRows)

  return {
    source: 'google_ads_api',
    connected: true,
    status: 'connected',
    store,
    message: `${config.notFoundLabel} Google Ads 캠페인 ${campaigns.length}개를 불러왔습니다.${
      statuses.length ? ` 현재 상태: ${statuses.join(', ')}` : ''
    }`,
    period: { days, firstDate: startDate, lastDate: endDate },
    summary: aggregateGoogleAdsRows(summaryRows),
    previousSummary: aggregateGoogleAdsRows(previousRows),
    daily: dailyRows.map((row) => ({
      date: row.segments?.date || '',
      storeName: store,
      campaignName: row.campaign?.name || campaignName,
      campaignStatus: row.campaign?.status || '',
      adsCustomerId: publicGoogleAdsId(customerId),
      impressions: numberValue(row.metrics?.impressions),
      clicks: numberValue(row.metrics?.clicks),
      costMicros: numberValue(row.metrics?.costMicros),
      localActionDirectionRequests: 0,
      localActionCalls: 0,
      localActionWebsiteClicks: 0,
      sourceSyncedAt: new Date().toISOString(),
    })),
    adsCustomerIds: [publicGoogleAdsId(customerId)],
    campaigns,
    campaignSummaries,
    searchTerms,
    searchTermMessage,
    sourceSyncedAt: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  loadSharedEnv()

  const { searchParams } = new URL(request.url)
  const store = (searchParams.get('store') || '언리미티드').trim()
  const days = Math.min(Math.max(Number(searchParams.get('days') || 30), 7), 90)

  const liveConfig = liveAdsStoreConfig(store)
  if (liveConfig) {
    try {
      return NextResponse.json(await loadStoreLiveAds(store, days, liveConfig))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google Ads API 데이터를 불러오지 못했습니다.'
      return NextResponse.json({
        source: 'google_ads_api',
        connected: false,
        status: 'error',
        store,
        message,
        period: { days },
        summary: emptySummary(),
        previousSummary: emptySummary(),
        daily: [],
        adsCustomerIds: [],
        campaigns: [],
        campaignSummaries: [],
        searchTerms: [],
      })
    }
  }

  const project = safeIdentifier(process.env.GOOGLE_CLOUD_PROJECT || '', /^[A-Za-z0-9_-]+$/)
  const dataset = safeIdentifier(process.env.BIGQUERY_DATASET || 'gbp_ops', /^[A-Za-z0-9_]+$/)
  const location = process.env.BIGQUERY_LOCATION || 'asia-northeast3'
  const table = project && dataset ? `\`${project}.${dataset}.google_ads_local_actions_daily\`` : ''

  if (!project || !dataset) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      status: 'missing_config',
      store,
      message: 'GOOGLE_CLOUD_PROJECT 또는 BIGQUERY_DATASET 환경변수가 없어 Google Ads 데이터를 불러오지 못했습니다.',
      period: { days },
      summary: emptySummary(),
      previousSummary: emptySummary(),
      daily: [],
      adsCustomerIds: [],
    })
  }

  try {
    const bigquery = new BigQuery({ projectId: project })
    const tableCountSql = `SELECT COUNT(*) AS row_count FROM ${table}`
    const [tableCountRows] = await bigquery.query({ query: tableCountSql, location })
    const tableRowCount = numberValue((tableCountRows[0] as Record<string, unknown> | undefined)?.row_count)

    const matchWhere = `
      LOWER(REPLACE(store_name, ' ', '')) = LOWER(REPLACE(@store, ' ', ''))
      OR LOWER(store_name) LIKE CONCAT('%', LOWER(@store), '%')
      OR LOWER(@store) LIKE CONCAT('%', LOWER(store_name), '%')
    `
    const storeStatsSql = `
      SELECT
        COUNT(*) AS row_count,
        MIN(summary_date) AS first_date,
        MAX(summary_date) AS last_date,
        MAX(source_synced_at) AS source_synced_at,
        ARRAY_AGG(DISTINCT ads_customer_id IGNORE NULLS LIMIT 5) AS ads_customer_ids
      FROM ${table}
      WHERE ${matchWhere}
    `
    const [storeStatsRows] = await bigquery.query({
      query: storeStatsSql,
      params: { store },
      location,
    })
    const storeStats = storeStatsRows[0] as Record<string, unknown> | undefined
    const storeRowCount = numberValue(storeStats?.row_count)
    const lastDate = dateValue(storeStats?.last_date)
    const firstDate = dateValue(storeStats?.first_date)
    const sourceSyncedAt = timestampValue(storeStats?.source_synced_at)
    const adsCustomerIds = Array.isArray(storeStats?.ads_customer_ids) ? (storeStats?.ads_customer_ids as string[]) : []

    if (!storeRowCount || !lastDate) {
      return NextResponse.json({
        source: 'bigquery',
        connected: true,
        status: tableRowCount > 0 ? 'no_store_data' : 'empty_table',
        store,
        message:
          tableRowCount > 0
            ? `${store} Google Ads 데이터가 BigQuery 테이블에 아직 없습니다.`
            : 'Google Ads BigQuery 테이블은 연결됐지만 적재된 데이터가 아직 없습니다.',
        period: { days, firstDate, lastDate },
        summary: emptySummary(),
        previousSummary: emptySummary(),
        daily: [],
        adsCustomerIds,
        tableRowCount,
        sourceSyncedAt,
      })
    }

    const daysMinusOne = days - 1
    const summarySql = `
      WITH ranges AS (
        SELECT
          'current' AS period,
          DATE_SUB(DATE(@endDate), INTERVAL @daysMinusOne DAY) AS start_date,
          DATE(@endDate) AS end_date
        UNION ALL
        SELECT
          'previous' AS period,
          DATE_SUB(DATE(@endDate), INTERVAL @previousStartOffset DAY) AS start_date,
          DATE_SUB(DATE(@endDate), INTERVAL @days DAY) AS end_date
      )
      SELECT
        ranges.period,
        COUNT(ads.summary_date) AS row_count,
        SUM(COALESCE(ads.local_action_direction_requests, 0)) AS local_action_direction_requests,
        SUM(COALESCE(ads.local_action_calls, 0)) AS local_action_calls,
        SUM(COALESCE(ads.local_action_website_clicks, 0)) AS local_action_website_clicks,
        SUM(COALESCE(ads.impressions, 0)) AS impressions,
        SUM(COALESCE(ads.clicks, 0)) AS clicks,
        SUM(COALESCE(ads.cost_micros, 0)) AS cost_micros
      FROM ranges
      LEFT JOIN ${table} AS ads
        ON (${matchWhere})
        AND ads.summary_date BETWEEN ranges.start_date AND ranges.end_date
      GROUP BY ranges.period
    `
    const [summaryRows] = await bigquery.query({
      query: summarySql,
      params: {
        store,
        endDate: lastDate,
        days,
        daysMinusOne,
        previousStartOffset: days * 2 - 1,
      },
      location,
    })
    const summaryByPeriod = new Map(
      (summaryRows as Record<string, unknown>[]).map((row) => [String(row.period), toSummary(row)])
    )

    const dailySql = `
      SELECT
        summary_date,
        store_name,
        ads_customer_id,
        local_action_direction_requests,
        local_action_calls,
        local_action_website_clicks,
        impressions,
        clicks,
        cost_micros,
        source_synced_at
      FROM ${table}
      WHERE (${matchWhere})
        AND summary_date BETWEEN DATE_SUB(DATE(@endDate), INTERVAL @daysMinusOne DAY) AND DATE(@endDate)
      ORDER BY summary_date DESC
      LIMIT 90
    `
    const [dailyRows] = await bigquery.query({
      query: dailySql,
      params: { store, endDate: lastDate, daysMinusOne },
      location,
    })

    return NextResponse.json({
      source: 'bigquery',
      connected: true,
      status: 'connected',
      store,
      message: `${store} Google Ads 데이터를 BigQuery에서 불러왔습니다.`,
      period: { days, firstDate, lastDate },
      summary: summaryByPeriod.get('current') || emptySummary(),
      previousSummary: summaryByPeriod.get('previous') || emptySummary(),
      daily: (dailyRows as Record<string, unknown>[]).map((row) => ({
        date: dateValue(row.summary_date),
        storeName: row.store_name || store,
        adsCustomerId: row.ads_customer_id || '',
        impressions: numberValue(row.impressions),
        clicks: numberValue(row.clicks),
        costMicros: numberValue(row.cost_micros),
        localActionDirectionRequests: numberValue(row.local_action_direction_requests),
        localActionCalls: numberValue(row.local_action_calls),
        localActionWebsiteClicks: numberValue(row.local_action_website_clicks),
        sourceSyncedAt: timestampValue(row.source_synced_at),
      })),
      adsCustomerIds,
      tableRowCount,
      sourceSyncedAt,
    })
  } catch (error) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      status: 'error',
      store,
      message: connectionErrorMessage(error),
      period: { days },
      summary: emptySummary(),
      previousSummary: emptySummary(),
      daily: [],
      adsCustomerIds: [],
    })
  }
}
