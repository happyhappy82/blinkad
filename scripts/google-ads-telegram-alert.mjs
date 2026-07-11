#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const GOOGLE_ADS_API_VERSION = /^v\d+$/.test(process.env.GOOGLE_ADS_API_VERSION || '')
  ? process.env.GOOGLE_ADS_API_VERSION
  : 'v22'

const TELEGRAM_TOKEN_KEYCHAIN_SERVICE =
  process.env.GOOGLE_ADS_TELEGRAM_TOKEN_KEYCHAIN_SERVICE || 'blinkad-google-ads-telegram-bot-token'
const TELEGRAM_CHAT_KEYCHAIN_SERVICE =
  process.env.GOOGLE_ADS_TELEGRAM_CHAT_KEYCHAIN_SERVICE || 'blinkad-google-ads-telegram-chat-id'
const TELEGRAM_KEYCHAIN_ACCOUNT = process.env.GOOGLE_ADS_TELEGRAM_KEYCHAIN_ACCOUNT || 'BA_Ads_alert_bot'

const args = new Set(process.argv.slice(2))
const mode = args.has('--discover-chat-id')
  ? 'discover'
  : args.has('--alert-only')
    ? 'alert'
    : 'daily'
const isTest = args.has('--test')
const isDryRun = args.has('--dry-run')

loadSharedEnv()

function loadSharedEnv() {
  const envPaths = [
    path.resolve(ROOT, '.env.local'),
    path.resolve(ROOT, '.env'),
    path.resolve(ROOT, '..', 'blinkad', '.env.local'),
    path.resolve(ROOT, '..', 'blinkad', '.env'),
    path.resolve(ROOT, '../..', '.env'),
  ]

  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue

    for (const rawLine of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#') || !line.includes('=')) continue

      const separatorIndex = line.indexOf('=')
      const key = line.slice(0, separatorIndex).trim()
      let value = line.slice(separatorIndex + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (key && !process.env[key]) process.env[key] = value
    }
  }
}

function keychainValue(service, account = TELEGRAM_KEYCHAIN_ACCOUNT) {
  if (process.platform !== 'darwin') return ''
  try {
    return execFileSync('security', ['find-generic-password', '-w', '-s', service, '-a', account], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name])
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

function digits(value) {
  return String(value || '').replace(/\D/g, '')
}

function maskGoogleAdsId(value) {
  const id = digits(value)
  return id ? `***${id.slice(-4)}` : ''
}

function formatWon(value) {
  return `${Math.round(value || 0).toLocaleString('ko-KR')}원`
}

function formatNumber(value) {
  return Math.round(value || 0).toLocaleString('ko-KR')
}

function percentChange(current, previous) {
  if (!previous && !current) return null
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

function formatChange(current, previous, suffix = '') {
  const change = percentChange(current, previous)
  if (change === null) {
    if (!previous && current) return '신규'
    return '0%'
  }
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%${suffix}`
}

function cpcWon(metrics) {
  return metrics.clicks > 0 ? Math.round(metrics.costMicros / 1_000_000 / metrics.clicks) : 0
}

function costWon(metrics) {
  return Math.round(metrics.costMicros / 1_000_000)
}

function emptyMetrics() {
  return {
    impressions: 0,
    clicks: 0,
    costMicros: 0,
    conversions: 0,
  }
}

function addMetrics(target, source) {
  target.impressions += Number(source.impressions || 0)
  target.clicks += Number(source.clicks || 0)
  target.costMicros += Number(source.costMicros || 0)
  target.conversions += Number(source.conversions || 0)
}

function kstNow() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .replace(' ', ' ')
}

function kstDateOnly(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function shiftDate(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number)
  const value = new Date(Date.UTC(year, month - 1, day))
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function dateRanges(today = kstDateOnly()) {
  return {
    current: {
      start: shiftDate(today, -6),
      end: today,
      label: `${shiftDate(today, -6)} ~ ${today}`,
    },
    previous: {
      start: shiftDate(today, -13),
      end: shiftDate(today, -7),
      label: `${shiftDate(today, -13)} ~ ${shiftDate(today, -7)}`,
    },
  }
}

async function fetchGoogleAdsAccessToken() {
  requireEnv([
    'GOOGLE_ADS_DEVELOPER_TOKEN',
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET',
    'GOOGLE_ADS_REFRESH_TOKEN',
  ])

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(`Google Ads OAuth ${response.status}: ${text.slice(0, 300)}`)
  }

  const data = JSON.parse(text)
  if (!data.access_token) throw new Error('Google Ads OAuth response did not include access_token.')
  return data.access_token
}

async function googleAdsSearch(accessToken, customerId, query, loginCustomerId = '') {
  const headers = {
    authorization: `Bearer ${accessToken}`,
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    'content-type': 'application/json',
  }
  if (loginCustomerId) headers['login-customer-id'] = loginCustomerId

  const response = await fetch(
    `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    }
  )
  const text = await response.text()
  if (!response.ok) {
    let detail = text.slice(0, 500)
    try {
      const parsedBody = JSON.parse(text)
      const parsed = Array.isArray(parsedBody) ? parsedBody[0] : parsedBody
      const apiError = parsed?.error?.details?.[0]?.errors?.[0]
      detail = apiError?.message || parsed?.error?.message || detail
    } catch {}
    throw new Error(`Google Ads API ${response.status}: ${detail}`)
  }

  return JSON.parse(text || '[]').flatMap((chunk) => chunk.results || [])
}

async function listAccessibleCustomers(accessToken) {
  const response = await fetch(
    `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
    {
      headers: {
        authorization: `Bearer ${accessToken}`,
        'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
      },
    }
  )
  const text = await response.text()
  if (!response.ok) throw new Error(`Google Ads accessible customers ${response.status}: ${text}`)
  const data = JSON.parse(text)
  return (data.resourceNames || []).map((name) => name.replace('customers/', ''))
}

async function resolveBlinkAdAccount(accessToken) {
  const explicitLoginCustomerId = digits(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID)
  const accessibleIds = await listAccessibleCustomers(accessToken)
  const managerIds = new Set(explicitLoginCustomerId ? [explicitLoginCustomerId] : [])
  const accounts = []

  for (const id of accessibleIds) {
    try {
      const rows = await googleAdsSearch(
        accessToken,
        id,
        'SELECT customer.id, customer.descriptive_name, customer.manager FROM customer LIMIT 1'
      )
      const customer = rows[0]?.customer
      if (!customer) continue

      const customerId = digits(customer.id || id)
      if (customer.manager) {
        managerIds.add(customerId)
      } else {
        accounts.push({
          id: customerId,
          name: customer.descriptiveName || '',
          loginCustomerId: explicitLoginCustomerId || '',
        })
      }
    } catch {}
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
            customer_client.status
          FROM customer_client
          WHERE customer_client.status = ENABLED
          LIMIT 500
        `
      )
      for (const row of rows) {
        const client = row.customerClient
        const id = digits(client?.id)
        if (!client || client.manager || !id || accounts.some((account) => account.id === id)) continue
        accounts.push({
          id,
          name: client.descriptiveName || '',
          loginCustomerId: managerId,
        })
      }
    } catch {}
  }

  const account = accounts.find((candidate) => candidate.name.includes('블링크애드')) || accounts[0]
  if (!account) throw new Error('Google Ads 활성 고객 계정을 찾지 못했습니다.')
  return account
}

async function fetchCampaignReport() {
  const today = kstDateOnly()
  const ranges = dateRanges(today)
  const accessToken = await fetchGoogleAdsAccessToken()
  const account = await resolveBlinkAdAccount(accessToken)

  const campaignRows = await googleAdsSearch(
    accessToken,
    account.id,
    `
      SELECT
        customer.id,
        customer.descriptive_name,
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.primary_status,
        campaign.primary_status_reasons,
        campaign.serving_status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.status != REMOVED
      ORDER BY campaign.id DESC
      LIMIT 500
    `,
    account.loginCustomerId
  )

  const campaigns = new Map()
  for (const row of campaignRows) {
    const campaignId = digits(row.campaign?.id)
    if (!campaignId) continue
    campaigns.set(campaignId, {
      id: campaignId,
      publicId: maskGoogleAdsId(campaignId),
      accountName: row.customer?.descriptiveName || account.name,
      accountId: maskGoogleAdsId(account.id),
      name: row.campaign?.name || '',
      status: row.campaign?.status || '',
      primaryStatus: row.campaign?.primaryStatus || '',
      primaryStatusReasons: row.campaign?.primaryStatusReasons || [],
      servingStatus: row.campaign?.servingStatus || '',
      channel: row.campaign?.advertisingChannelType || '',
      biddingStrategy: row.campaign?.biddingStrategyType || '',
      budgetWon: Math.round(Number(row.campaignBudget?.amountMicros || 0) / 1_000_000),
      current: emptyMetrics(),
      previous: emptyMetrics(),
    })
  }

  for (const [period, range] of Object.entries(ranges)) {
    const rows = await googleAdsSearch(
      accessToken,
      account.id,
      `
        SELECT
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions
        FROM campaign
        WHERE campaign.status != REMOVED
          AND segments.date BETWEEN '${range.start}' AND '${range.end}'
        LIMIT 500
      `,
      account.loginCustomerId
    )

    for (const row of rows) {
      const campaignId = digits(row.campaign?.id)
      const campaign =
        campaigns.get(campaignId) ||
        {
          id: campaignId,
          publicId: maskGoogleAdsId(campaignId),
          accountName: account.name,
          accountId: maskGoogleAdsId(account.id),
          name: row.campaign?.name || '',
          status: '',
          primaryStatus: '',
          primaryStatusReasons: [],
          servingStatus: '',
          channel: '',
          biddingStrategy: '',
          budgetWon: 0,
          current: emptyMetrics(),
          previous: emptyMetrics(),
        }

      addMetrics(campaign[period], row.metrics || {})
      campaigns.set(campaignId, campaign)
    }
  }

  const reportCampaigns = Array.from(campaigns.values())
    .filter((campaign) => {
      const hasCurrentData =
        campaign.current.impressions || campaign.current.clicks || campaign.current.costMicros
      const hasPreviousData =
        campaign.previous.impressions || campaign.previous.clicks || campaign.previous.costMicros
      return campaign.status === 'ENABLED' || hasCurrentData || hasPreviousData
    })
    .sort(
      (a, b) =>
        b.current.costMicros - a.current.costMicros ||
        b.current.clicks - a.current.clicks ||
        a.name.localeCompare(b.name, 'ko')
    )

  const currentTotal = emptyMetrics()
  const previousTotal = emptyMetrics()
  for (const campaign of reportCampaigns) {
    addMetrics(currentTotal, campaign.current)
    addMetrics(previousTotal, campaign.previous)
  }

  return {
    checkedAt: kstNow(),
    account,
    ranges,
    currentTotal,
    previousTotal,
    campaigns: reportCampaigns,
  }
}

function cpcChangeAlerts(campaigns) {
  return campaigns
    .map((campaign) => {
      const currentCpc = cpcWon(campaign.current)
      const previousCpc = cpcWon(campaign.previous)
      const change = percentChange(currentCpc, previousCpc)
      if (change === null || Math.abs(change) < 30) return null
      return {
        campaign,
        currentCpc,
        previousCpc,
        change,
      }
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}

function performanceLine(current, previous) {
  return [
    `노출 ${formatNumber(current.impressions)} (${formatChange(current.impressions, previous.impressions)})`,
    `클릭 ${formatNumber(current.clicks)} (${formatChange(current.clicks, previous.clicks)})`,
    `비용 ${formatWon(costWon(current))} (${formatChange(costWon(current), costWon(previous))})`,
    `CPC ${formatWon(cpcWon(current))} (${formatChange(cpcWon(current), cpcWon(previous))})`,
    `전환 ${formatNumber(current.conversions)} (${formatChange(current.conversions, previous.conversions)})`,
  ].join(' / ')
}

function storeNameFromCampaign(campaign) {
  const name = campaign.name || ''
  const knownStores = ['바다당', '도르도뉴', '웰믹스', '오닉스', '블링크애드']
  const knownStore = knownStores.find((store) => name.includes(store))
  if (knownStore) return knownStore

  const firstToken = name.split(/[_\s-]/).find(Boolean)
  return firstToken || '기타'
}

function groupedCampaignsByStore(campaigns) {
  const groups = new Map()

  for (const campaign of campaigns) {
    const storeName = storeNameFromCampaign(campaign)
    const group =
      groups.get(storeName) ||
      {
        storeName,
        current: emptyMetrics(),
        previous: emptyMetrics(),
        campaigns: [],
      }

    addMetrics(group.current, campaign.current)
    addMetrics(group.previous, campaign.previous)
    group.campaigns.push(campaign)
    groups.set(storeName, group)
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      campaigns: group.campaigns.sort(
        (a, b) =>
          b.current.costMicros - a.current.costMicros ||
          b.current.clicks - a.current.clicks ||
          a.name.localeCompare(b.name, 'ko')
      ),
    }))
    .sort(
      (a, b) =>
        b.current.costMicros - a.current.costMicros ||
        b.current.clicks - a.current.clicks ||
        a.storeName.localeCompare(b.storeName, 'ko')
    )
}

function campaignSummaryLine(campaign, index) {
  const status = campaign.status === 'ENABLED' ? 'ON' : campaign.status || '-'
  return [
    `   ${index}. ${campaign.name}`,
    `     ${status} · ${campaign.channel || '-'} · 예산 ${formatWon(campaign.budgetWon)}`,
    `     ${performanceLine(campaign.current, campaign.previous)}`,
  ].join('\n')
}

function storeSummaryLine(group, index) {
  return [
    `✅ ${index}. ${group.storeName} (${group.campaigns.length}개 캠페인)`,
    `   합계: ${performanceLine(group.current, group.previous)}`,
    ...group.campaigns.map((campaign, campaignIndex) => campaignSummaryLine(campaign, campaignIndex + 1)),
  ].join('\n')
}

function buildDailyMessage(report) {
  const alerts = cpcChangeAlerts(report.campaigns)
  const storeGroups = groupedCampaignsByStore(report.campaigns)
  const title = isTest ? '[테스트] BlinkAd Google Ads 일일 보고' : 'BlinkAd Google Ads 일일 보고'
  const lines = [
    title,
    `기준: ${report.checkedAt} KST`,
    `계정: ${report.account.name} ${maskGoogleAdsId(report.account.id)}`,
    `최근 7일: ${report.ranges.current.label}`,
    `지난주: ${report.ranges.previous.label}`,
    '',
    '[전체]',
    performanceLine(report.currentTotal, report.previousTotal),
    '',
    '[CPC 30% 이상 변화]',
  ]

  if (alerts.length) {
    alerts.forEach((alert) => {
      lines.push(
        `- ${alert.campaign.name}: ${formatWon(alert.previousCpc)} -> ${formatWon(alert.currentCpc)} (${formatChange(alert.currentCpc, alert.previousCpc)})`
      )
    })
  } else {
    lines.push('- 없음')
  }

  lines.push('', '[매장별 캠페인 성과]')
  storeGroups.forEach((group, index) => {
    lines.push(storeSummaryLine(group, index + 1))
  })

  return lines.join('\n')
}

function buildAlertOnlyMessage(report) {
  const alerts = cpcChangeAlerts(report.campaigns)
  if (!alerts.length) return ''

  const title = isTest ? '[테스트] Google Ads CPC 변화 알림' : 'Google Ads CPC 변화 알림'
  return [
    title,
    `기준: ${report.checkedAt} KST`,
    `비교: ${report.ranges.current.label} vs ${report.ranges.previous.label}`,
    '',
    ...alerts.map(
      (alert) =>
        `- ${alert.campaign.name}: ${formatWon(alert.previousCpc)} -> ${formatWon(alert.currentCpc)} (${formatChange(alert.currentCpc, alert.previousCpc)})`
    ),
  ].join('\n')
}

function telegramToken() {
  return (
    process.env.GOOGLE_ADS_TELEGRAM_BOT_TOKEN ||
    keychainValue(TELEGRAM_TOKEN_KEYCHAIN_SERVICE) ||
    process.env.TELEGRAM_BOT_TOKEN
  )
}

function telegramChatId() {
  return (
    process.env.GOOGLE_ADS_TELEGRAM_CHAT_ID ||
    keychainValue(TELEGRAM_CHAT_KEYCHAIN_SERVICE) ||
    process.env.TELEGRAM_CHAT_ID
  )
}

async function telegramApi(method, payload = {}) {
  const token = telegramToken()
  if (!token) {
    throw new Error(
      'Telegram bot token이 없습니다. GOOGLE_ADS_TELEGRAM_BOT_TOKEN 또는 macOS Keychain 값을 설정하세요.'
    )
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.ok) {
    throw new Error(`Telegram ${method} failed: ${JSON.stringify(data).slice(0, 500)}`)
  }
  return data.result
}

function chunkTelegramMessage(message) {
  const chunks = []
  let remaining = message
  while (remaining.length > 3800) {
    let splitAt = remaining.lastIndexOf('\n', 3800)
    if (splitAt < 1000) splitAt = 3800
    chunks.push(remaining.slice(0, splitAt))
    remaining = remaining.slice(splitAt).trimStart()
  }
  if (remaining) chunks.push(remaining)
  return chunks
}

async function sendTelegramMessage(message) {
  const chatId = telegramChatId()
  if (!chatId) {
    throw new Error(
      'Telegram chat_id가 없습니다. 먼저 봇에 /start를 보낸 뒤 npm run ads:telegram:discover-chat 을 실행하세요.'
    )
  }

  const chunks = chunkTelegramMessage(message)
  for (const [index, chunk] of chunks.entries()) {
    await telegramApi('sendMessage', {
      chat_id: chatId,
      text: chunks.length > 1 ? `${chunk}\n\n(${index + 1}/${chunks.length})` : chunk,
      disable_web_page_preview: true,
    })
  }
  return chunks.length
}

async function discoverChatId() {
  const updates = await telegramApi('getUpdates', {})
  const chats = updates
    .map((update) => update.message?.chat || update.channel_post?.chat || update.edited_message?.chat)
    .filter(Boolean)
    .map((chat) => ({
      id: String(chat.id),
      type: chat.type,
      title: chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' '),
      username: chat.username || '',
    }))

  const unique = []
  const seen = new Set()
  for (const chat of chats.reverse()) {
    if (seen.has(chat.id)) continue
    seen.add(chat.id)
    unique.push(chat)
  }

  return unique
}

async function main() {
  if (mode === 'discover') {
    const chats = await discoverChatId()
    if (!chats.length) {
      console.log('No Telegram chats found. Send /start to the bot first, then retry.')
      return
    }
    console.log(JSON.stringify(chats, null, 2))
    return
  }

  const report = await fetchCampaignReport()
  const message = mode === 'alert' ? buildAlertOnlyMessage(report) : buildDailyMessage(report)

  if (!message) {
    console.log('No CPC alerts to send.')
    return
  }

  if (isDryRun) {
    console.log(message)
    return
  }

  const sentChunks = await sendTelegramMessage(message)
  console.log(`Telegram message sent in ${sentChunks} chunk(s).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
