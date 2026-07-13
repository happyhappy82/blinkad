#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const NOTION_VERSION = '2022-06-28'
const DEFAULT_BIGQUERY_DATASET = 'gbp_ops'
const DEFAULT_BIGQUERY_LOCATION = 'asia-northeast3'
const REVIEW_DATA_SOURCE = (process.env.GBP_REVIEW_DATA_SOURCE || 'auto').toLowerCase()
const BIGQUERY_LOOKBACK_DAYS = Number(process.env.GBP_REVIEW_BIGQUERY_LOOKBACK_DAYS || 120)
const DATAFORSEO_REVIEW_DEPTH = Number(process.env.GBP_REVIEW_DATAFORSEO_DEPTH || 10)
const DATAFORSEO_REVIEW_TIMEOUT_MS = Number(process.env.GBP_REVIEW_DATAFORSEO_TIMEOUT_MS || 180000)
const HISTORY_FILE = process.env.GBP_REVIEW_HISTORY_FILE || ''
const TELEGRAM_TOKEN_KEYCHAIN_SERVICE =
  process.env.GBP_REVIEW_TELEGRAM_TOKEN_KEYCHAIN_SERVICE ||
  process.env.GOOGLE_ADS_TELEGRAM_TOKEN_KEYCHAIN_SERVICE ||
  'blinkad-google-ads-telegram-bot-token'
const TELEGRAM_CHAT_KEYCHAIN_SERVICE =
  process.env.GBP_REVIEW_TELEGRAM_CHAT_KEYCHAIN_SERVICE ||
  process.env.GOOGLE_ADS_TELEGRAM_CHAT_KEYCHAIN_SERVICE ||
  'blinkad-google-ads-telegram-chat-id'
const TELEGRAM_KEYCHAIN_ACCOUNT =
  process.env.GBP_REVIEW_TELEGRAM_KEYCHAIN_ACCOUNT ||
  process.env.GOOGLE_ADS_TELEGRAM_KEYCHAIN_ACCOUNT ||
  'BA_Ads_alert_bot'

const DEFAULT_STORE_NAMES = [
  '언리미티드',
  '웰믹스 광화문점',
  '도르도뉴',
  '오닉스',
  '주도락 강남점',
  '주도락 마곡발산점',
  '바다당 해운대점',
]

const DATAFORSEO_STORE_CONFIG = {
  언리미티드: {
    query: '언리미티드 건대',
    expected: ['언리미티드', 'unlimited'],
  },
  '웰믹스 광화문점': {
    query: '웰믹스 광화문점',
    expected: ['웰믹스', 'wellmix'],
  },
  도르도뉴: {
    query: '도르도뉴(Dordogne)',
    cid: '5895233767778032679',
    expected: ['도르도뉴', 'dordogne'],
    locationCoordinate: '37.5113232,127.0566288,1000',
  },
  오닉스: {
    query: '오닉스 이태원 ONYX ITAEWON',
    expected: ['오닉스', 'onyx'],
  },
  '주도락 강남점': {
    query: '주도락 강남점',
    expected: ['주도락', 'judorak'],
  },
  '주도락 마곡발산점': {
    query: '주도락 마곡 발산',
    expected: ['주도락', 'judorak'],
  },
  '바다당 해운대점': {
    query: '바다당 해운대점',
    expected: ['바다당', 'badadang'],
  },
}

const args = new Set(process.argv.slice(2))
const isDryRun = args.has('--dry-run')
const isTest = args.has('--test')

loadSharedEnv()

function loadSharedEnv() {
  const envPaths = [
    path.resolve(ROOT, '.env.local'),
    path.resolve(ROOT, '.env'),
    path.resolve(ROOT, '..', 'blinkad', '.env.local'),
    path.resolve(ROOT, '..', 'blinkad', '.env'),
    path.resolve(ROOT, '../..', '.env'),
    '/Users/mcbookpro/Documents/Claude Code/.env',
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

function notionToken() {
  const envToken = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
  if (envToken) return envToken

  try {
    return execFileSync('python3', ['-c', 'from ops.notion_api import NOTION_TOKEN; print(NOTION_TOKEN)'], {
      cwd: path.resolve(ROOT, '../..'),
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 5000,
    }).trim()
  } catch {
    return ''
  }
}

function dataForSeoCredentials() {
  const login = process.env.DATAFORSEO_LOGIN || process.env.DATA_FOR_SEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD || process.env.DATA_FOR_SEO_PASSWORD
  if (!login || !password) throw new Error('DATAFORSEO_LOGIN 또는 DATAFORSEO_PASSWORD가 없습니다.')
  return { login, password }
}

function dataForSeoAuthHeader() {
  const { login, password } = dataForSeoCredentials()
  return `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`
}

function telegramToken() {
  return (
    process.env.GBP_REVIEW_TELEGRAM_BOT_TOKEN ||
    process.env.GOOGLE_ADS_TELEGRAM_BOT_TOKEN ||
    keychainValue(TELEGRAM_TOKEN_KEYCHAIN_SERVICE) ||
    process.env.TELEGRAM_BOT_TOKEN
  )
}

function telegramChatIds() {
  const rawValue =
    process.env.GBP_REVIEW_TELEGRAM_CHAT_ID ||
    process.env.GOOGLE_ADS_TELEGRAM_CHAT_ID ||
    keychainValue(TELEGRAM_CHAT_KEYCHAIN_SERVICE) ||
    process.env.TELEGRAM_CHAT_ID

  return String(rawValue || '')
    .split(/[,\s]+/)
    .map((value) => value.trim())
    .filter(Boolean)
}

function configuredStoreNames() {
  return (process.env.GBP_REVIEW_STORE_NAMES || DEFAULT_STORE_NAMES.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function uniqueValues(values) {
  return Array.from(new Set(values.filter(Boolean)))
}

function metricDatabaseIds() {
  return uniqueValues([
    process.env.GBP_REVIEW_METRICS_DATABASE_ID,
    process.env.NOTION_GBP_MINIMAL_DAILY_METRICS_DB_ID,
    process.env.NOTION_GBP_DAILY_SUMMARY_DB_ID,
  ])
}

function bigQueryTableName(tableName) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT
  const dataset = process.env.BIGQUERY_DATASET || DEFAULT_BIGQUERY_DATASET
  if (!projectId) throw new Error('GOOGLE_CLOUD_PROJECT가 없습니다.')
  if (!/^[A-Za-z0-9_-]+$/.test(projectId)) throw new Error('GOOGLE_CLOUD_PROJECT 형식이 올바르지 않습니다.')
  if (!/^[A-Za-z0-9_]+$/.test(dataset)) throw new Error('BIGQUERY_DATASET 형식이 올바르지 않습니다.')
  if (!/^[A-Za-z0-9_]+$/.test(tableName)) throw new Error('BigQuery 테이블명이 올바르지 않습니다.')
  return `\`${projectId}.${dataset}.${tableName}\``
}

function storeDatabaseIds() {
  return uniqueValues([
    process.env.GBP_REVIEW_STORE_DATABASE_ID,
    process.env.NOTION_GBP_MINIMAL_STORE_DB_ID,
    process.env.NOTION_GBP_STORE_DB_ID,
  ])
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function notionRequest(pathname, options = {}, attempt = 0) {
  const token = notionToken()
  if (!token) throw new Error('NOTION_TOKEN 또는 NOTION_API_KEY가 없습니다.')

  const response = await fetch(`https://api.notion.com/v1/${pathname}`, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      'notion-version': NOTION_VERSION,
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const data = await response.json().catch(() => ({}))

  if (response.status === 429 && attempt < 5) {
    const retryAfter = Number(response.headers.get('retry-after') || 1)
    await sleep(Math.max(retryAfter, 1) * 1000)
    return notionRequest(pathname, options, attempt + 1)
  }

  if (!response.ok) {
    throw new Error(`Notion API ${response.status}: ${data.message || JSON.stringify(data).slice(0, 300)}`)
  }

  return data
}

async function retrieveDatabase(databaseId) {
  return notionRequest(`databases/${encodeURIComponent(databaseId)}`)
}

async function queryDatabase(databaseId, body = {}, maxPages = 20) {
  const results = []
  let cursor = ''
  let page = 0

  do {
    const data = await notionRequest(`databases/${encodeURIComponent(databaseId)}/query`, {
      method: 'POST',
      body: JSON.stringify({
        page_size: 100,
        ...body,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    })
    results.push(...(data.results || []))
    cursor = data.has_more ? data.next_cursor : ''
    page += 1
  } while (cursor && page < maxPages)

  return results
}

function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s_\-()[\]{}·:|/\\.]/g, '')
}

function findPropertyName(properties, candidates) {
  const entries = Object.keys(properties || {})
  const normalized = new Map(entries.map((name) => [normalizeKey(name), name]))

  for (const candidate of candidates) {
    const exact = normalized.get(normalizeKey(candidate))
    if (exact) return exact
  }

  for (const candidate of candidates) {
    const key = normalizeKey(candidate)
    const match = entries.find((name) => normalizeKey(name).includes(key) || key.includes(normalizeKey(name)))
    if (match) return match
  }

  return ''
}

function propText(prop) {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title?.map((item) => item.plain_text).join('') || ''
  if (prop.type === 'rich_text') return prop.rich_text?.map((item) => item.plain_text).join('') || ''
  if (prop.type === 'select') return prop.select?.name || ''
  if (prop.type === 'status') return prop.status?.name || ''
  if (prop.type === 'multi_select') return prop.multi_select?.map((item) => item.name).join(', ') || ''
  if (prop.type === 'phone_number') return prop.phone_number || ''
  if (prop.type === 'email') return prop.email || ''
  if (prop.type === 'url') return prop.url || ''
  if (prop.type === 'number') return String(prop.number ?? '')
  if (prop.type === 'formula') return formulaText(prop.formula)
  if (prop.type === 'rollup') return rollupText(prop.rollup)
  if (prop.type === 'created_time') return prop.created_time || ''
  if (prop.type === 'last_edited_time') return prop.last_edited_time || ''
  return ''
}

function formulaText(formula = {}) {
  if (formula.type === 'string') return formula.string || ''
  if (formula.type === 'number') return String(formula.number ?? '')
  if (formula.type === 'date') return formula.date?.start || ''
  if (formula.type === 'boolean') return formula.boolean ? 'true' : 'false'
  return ''
}

function rollupText(rollup = {}) {
  if (rollup.type === 'number') return String(rollup.number ?? '')
  if (rollup.type === 'date') return rollup.date?.start || ''
  if (rollup.type === 'array') return (rollup.array || []).map(propText).filter(Boolean).join(', ')
  return ''
}

function propNumber(prop) {
  if (!prop) return null
  if (prop.type === 'number' && Number.isFinite(prop.number)) return prop.number
  if (prop.type === 'formula' && prop.formula?.type === 'number' && Number.isFinite(prop.formula.number)) {
    return prop.formula.number
  }
  if (prop.type === 'rollup' && prop.rollup?.type === 'number' && Number.isFinite(prop.rollup.number)) {
    return prop.rollup.number
  }

  const parsed = Number(propText(prop).replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : null
}

function propDate(prop) {
  if (!prop) return ''
  if (prop.type === 'date') return prop.date?.start?.slice(0, 10) || ''
  if (prop.type === 'created_time') return prop.created_time?.slice(0, 10) || ''
  if (prop.type === 'last_edited_time') return prop.last_edited_time?.slice(0, 10) || ''
  if (prop.type === 'formula' && prop.formula?.type === 'date') return prop.formula.date?.start?.slice(0, 10) || ''
  if (prop.type === 'rollup' && prop.rollup?.type === 'date') return prop.rollup.date?.start?.slice(0, 10) || ''

  const text = propText(prop)
  const match = text.match(/20\d{2}[-./]\d{1,2}[-./]\d{1,2}/)
  if (!match) return ''
  const [year, month, day] = match[0].split(/[-./]/).map(Number)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function relationIds(prop) {
  return prop?.type === 'relation' ? prop.relation?.map((item) => item.id).filter(Boolean) || [] : []
}

function canonicalStoreName(rawValue, storeNames = configuredStoreNames()) {
  const raw = String(rawValue || '').trim()
  if (!raw) return ''
  const compact = normalizeKey(raw)

  const exact = storeNames.find((store) => normalizeKey(store) === compact)
  if (exact) return exact

  if (compact.includes('unlimited') || compact.includes('언리미티드')) return '언리미티드'
  if (compact.includes('wellmix') || compact.includes('웰믹스')) return '웰믹스 광화문점'
  if (compact.includes('dordogne') || compact.includes('도르도뉴')) return '도르도뉴'
  if (compact.includes('onyx') || compact.includes('오닉스')) return '오닉스'
  if (compact.includes('badadang') || compact.includes('바다당')) return '바다당 해운대점'
  if (compact.includes('주도락') && compact.includes('강남')) return '주도락 강남점'
  if (compact.includes('judorak') && compact.includes('gangnam')) return '주도락 강남점'
  if (compact.includes('주도락') && (compact.includes('마곡') || compact.includes('발산'))) return '주도락 마곡발산점'
  if (compact.includes('judorak') && (compact.includes('magok') || compact.includes('balsan'))) {
    return '주도락 마곡발산점'
  }

  return storeNames.find((store) => compact.includes(normalizeKey(store)) || normalizeKey(store).includes(compact)) || raw
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

function shiftDate(dateString, days) {
  const [year, month, day] = dateString.split('-').map(Number)
  const value = new Date(Date.UTC(year, month - 1, day))
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

function formatCount(value) {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value).toLocaleString('ko-KR')}개` : '확인 불가'
}

function formatRating(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toFixed(1) : '확인 불가'
}

function formatDelta(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '확인 불가'
  if (value > 0) return `🔴 증가 +${Math.round(value).toLocaleString('ko-KR')}`
  if (value < 0) return `🔵 감소 ${Math.round(value).toLocaleString('ko-KR')}`
  return '⚪ 유지 0'
}

function formatReviewDelta(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '기준 없음'
  if (value > 0) return `🔴 +${Math.round(value).toLocaleString('ko-KR')}개`
  if (value < 0) return `🔵 ${Math.round(value).toLocaleString('ko-KR')}개`
  return '⚪ 0개'
}

function numberEmoji(index) {
  return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index - 1] || `${index}.`
}

function statusText(row) {
  if (!row.current) return '데이터 없음'
  if (row.dayDelta < 0 || row.weekDelta < 0) return '리뷰 감소 확인'
  if (row.dayDelta > 0) return '신규 리뷰 발생'
  if (row.weekDelta > 0) return '주간 증가'
  if (row.dayDelta === null || row.weekDelta === null) return '현재값 확인'
  return '변동 없음'
}

function htmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function tableHtml(headers, rows) {
  return [
    '<table bordered striped>',
    `<tr>${headers.map((header) => `<th>${htmlEscape(header)}</th>`).join('')}</tr>`,
    ...rows.map((row) => `<tr>${row.map((cell) => `<td>${htmlEscape(cell)}</td>`).join('')}</tr>`),
    '</table>',
  ].join('\n')
}

function textTable(headers, rows) {
  return [
    headers.join(' │ '),
    headers.map(() => '---').join(' │ '),
    ...rows.map((row) => row.join(' │ ')),
  ].join('\n')
}

function storeSummaryRows(report) {
  return report.rows.map((row, index) => [
    numberEmoji(index + 1),
    row.storeName,
    row.current?.matchedTitle || '확인 불가',
    formatCount(row.current?.reviewCount),
    formatReviewDelta(row.dayDelta),
    formatReviewDelta(row.weekDelta),
    row.latestReviewDate || '확인 불가',
  ])
}

function metricRowsForStore(row) {
  const rows = [
    ['리뷰 수', formatCount(row.current?.reviewCount), `전일 ${formatDelta(row.dayDelta)} / 7일 ${formatDelta(row.weekDelta)}`],
    ['최근 리뷰일', row.latestReviewDate || '확인 불가', statusText(row)],
  ]

  if (typeof row.current?.rating === 'number' || row.current?.matchedTitle) {
    rows.push(['평점', formatRating(row.current?.rating), row.current?.matchedTitle ? `매칭: ${row.current.matchedTitle}` : ''])
  }

  if (row.current?.category || typeof row.current?.photoCount === 'number') {
    rows.push([
      '분류/사진',
      row.current?.category || '확인 불가',
      typeof row.current?.photoCount === 'number' ? `${row.current.photoCount.toLocaleString('ko-KR')}장` : '사진 수 확인 불가',
    ])
  }

  if (row.current?.latestReviewSnippet) {
    rows.push(['최근 리뷰', row.current.latestReviewSnippet, ''])
  }

  return rows
}

async function loadStoreNameMap() {
  const map = new Map()
  for (const databaseId of storeDatabaseIds()) {
    try {
      const database = await retrieveDatabase(databaseId)
      const titleProp =
        findPropertyName(database.properties, ['매장명', '상호', 'Name', '이름', 'Store', '업체명']) ||
        Object.entries(database.properties || {}).find(([, prop]) => prop.type === 'title')?.[0] ||
        ''
      const pages = await queryDatabase(databaseId, {}, 10)
      for (const page of pages) {
        const name = canonicalStoreName(propText(page.properties?.[titleProp]))
        if (name) map.set(page.id, name)
      }
    } catch {}
  }
  return map
}

function metricSchemaMap(properties) {
  return {
    store:
      findPropertyName(properties, [
        '매장명',
        '상호',
        '업체명',
        '고객명',
        '클라이언트',
        'Store',
        'storeName',
        'Location',
        '프로필명',
        'Name',
      ]) || '',
    storeRelation:
      findPropertyName(properties, ['매장', 'Store Relation', 'Store DB', 'Location Relation', 'Profile']) || '',
    date:
      findPropertyName(properties, ['날짜', '일자', '기준일', '수집일', 'Date', 'date', 'snapshotDate', '기준 날짜']) || '',
    reviewCount:
      findPropertyName(properties, [
        '리뷰 수',
        '리뷰수',
        '리뷰 개수',
        '리뷰개수',
        'Google 리뷰 수',
        '구글 리뷰 수',
        '총 리뷰 수',
        'Review Count',
        'Reviews',
        'review_count',
        'reviewCount',
        'totalReviews',
      ]) || '',
    latestReviewDate:
      findPropertyName(properties, [
        '최근 리뷰일',
        '최신 리뷰일',
        '마지막 리뷰일',
        '마지막 리뷰 날짜',
        '최근 리뷰 날짜',
        'Last Review Date',
        'Latest Review Date',
        'latestReviewDate',
        'latest_review_date',
      ]) || '',
  }
}

function parseMetricPage(page, schema, storeNameByPageId) {
  const properties = page.properties || {}
  let storeName = canonicalStoreName(propText(properties[schema.store]))

  if (!storeName && schema.storeRelation) {
    for (const id of relationIds(properties[schema.storeRelation])) {
      storeName = storeNameByPageId.get(id) || ''
      if (storeName) break
    }
  }

  const reviewCount = propNumber(properties[schema.reviewCount])
  const date = propDate(properties[schema.date]) || page.created_time?.slice(0, 10) || ''
  const latestReviewDate = propDate(properties[schema.latestReviewDate])

  if (!storeName || typeof reviewCount !== 'number' || !date) return null

  return {
    storeName,
    date,
    reviewCount,
    latestReviewDate,
  }
}

async function dataForSeoRequest(pathname, options = {}) {
  const response = await fetch(`https://api.dataforseo.com${pathname}`, {
    method: options.method || 'GET',
    headers: {
      authorization: dataForSeoAuthHeader(),
      'content-type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || Number(data.status_code || 0) >= 40000) {
    throw new Error(`${pathname} ${response.status}: ${data.status_message || JSON.stringify(data).slice(0, 300)}`)
  }
  return data
}

function dataForSeoStoreConfig(storeName) {
  return DATAFORSEO_STORE_CONFIG[storeName] || {
    query: storeName,
    expected: [storeName],
  }
}

function pickBestMapItem(storeName, items = []) {
  const config = dataForSeoStoreConfig(storeName)
  const candidates = items.filter((item) => item.type === 'maps_search')
  if (!candidates.length) return null

  const scored = candidates.map((item) => {
    const haystack = normalizeKey(`${item.title || ''} ${item.original_title || ''} ${item.address || ''} ${item.category || ''}`)
    const score = (config.expected || [storeName]).reduce(
      (sum, token) => sum + (haystack.includes(normalizeKey(token)) ? 10 : 0),
      0
    )
    return { item, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0].score > 0 ? scored[0].item : null
}

async function fetchDataForSeoMapItem(storeName) {
  const config = dataForSeoStoreConfig(storeName)
  const task = {
    keyword: config.query || storeName,
    language_code: 'ko',
    depth: 10,
    ...(config.locationCoordinate ? { location_coordinate: config.locationCoordinate } : { location_name: 'South Korea' }),
  }
  const data = await dataForSeoRequest('/v3/serp/google/maps/live/advanced', {
    method: 'POST',
    body: [task],
  })
  const result = data.tasks?.[0]?.result?.[0]
  return pickBestMapItem(storeName, result?.items || [])
}

async function postDataForSeoReviewTasks(mapRows) {
  const payload = mapRows
    .map((row) => {
      const config = dataForSeoStoreConfig(row.storeName)
      const cid = config.cid || row.mapItem?.cid
      const placeId = row.mapItem?.place_id
      if (!cid && !placeId) return null

      return {
        ...(cid ? { cid } : { place_id: placeId }),
        location_name: 'South Korea',
        language_code: 'ko',
        depth: DATAFORSEO_REVIEW_DEPTH,
        sort_by: 'newest',
        priority: 2,
        tag: row.storeName,
      }
    })
    .filter(Boolean)

  if (!payload.length) return new Map()

  const data = await dataForSeoRequest('/v3/business_data/google/reviews/task_post', {
    method: 'POST',
    body: payload,
  })

  const idsByStoreName = new Map()
  for (const task of data.tasks || []) {
    const storeName = task.data?.tag
    if (storeName && task.id) idsByStoreName.set(storeName, task.id)
  }
  return idsByStoreName
}

async function getDataForSeoReviewTask(id) {
  return dataForSeoRequest(`/v3/business_data/google/reviews/task_get/${encodeURIComponent(id)}`)
}

async function pollDataForSeoReviewTasks(idsByStoreName) {
  const pending = new Map(idsByStoreName)
  const results = new Map()
  const startedAt = Date.now()

  while (pending.size && Date.now() - startedAt < DATAFORSEO_REVIEW_TIMEOUT_MS) {
    for (const [storeName, taskId] of [...pending]) {
      try {
        const data = await getDataForSeoReviewTask(taskId)
        const task = data.tasks?.[0]
        if (task?.status_code === 20000 && task.result?.length) {
          results.set(storeName, task.result[0])
          pending.delete(storeName)
        } else if (Number(task?.status_code || 0) >= 40000 && task?.status_code !== 40602) {
          results.set(storeName, { error: task?.status_message || 'DataForSEO 리뷰 작업 실패' })
          pending.delete(storeName)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (!message.includes('not completed') && !message.includes('Not Found')) {
          results.set(storeName, { error: message })
          pending.delete(storeName)
        }
      }
    }
    if (pending.size) await sleep(5000)
  }

  for (const [storeName] of pending) {
    results.set(storeName, { error: 'DataForSEO 리뷰 작업 대기 시간 초과' })
  }

  return results
}

function timestampToKstDate(timestamp) {
  if (!timestamp) return ''
  const isoValue = String(timestamp).replace(' +00:00', 'Z').replace(' ', 'T')
  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) return String(timestamp).slice(0, 10)
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function latestReviewDateFromDataForSeo(reviewResult = {}) {
  const dates = (reviewResult.items || [])
    .map((item) => timestampToKstDate(item.timestamp))
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))
  return dates[0] || ''
}

function latestReviewSnippetFromDataForSeo(reviewResult = {}) {
  const item = (reviewResult.items || [])
    .filter((entry) => entry.timestamp)
    .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)))[0]
  if (!item) return ''

  const rating = item.rating?.value ? `${item.rating.value}점` : '평점 없음'
  const text = String(item.review_text || item.original_review_text || '').replace(/\s+/g, ' ').trim()
  return text ? `${rating} · ${text.slice(0, 46)}${text.length > 46 ? '...' : ''}` : rating
}

async function loadDataForSeoReviewMetricRows() {
  dataForSeoCredentials()

  const mapRows = []
  for (const storeName of configuredStoreNames()) {
    try {
      const mapItem = await fetchDataForSeoMapItem(storeName)
      mapRows.push({ storeName, mapItem })
    } catch (error) {
      mapRows.push({ storeName, mapError: error instanceof Error ? error.message : String(error) })
    }
  }

  const idsByStoreName = await postDataForSeoReviewTasks(mapRows)
  const reviewResults = await pollDataForSeoReviewTasks(idsByStoreName)
  const today = kstNow().slice(0, 10)

  return mapRows
    .map((row) => {
      const reviewResult = reviewResults.get(row.storeName) || {}
      const rating = row.mapItem?.rating?.value ?? reviewResult.rating?.value
      const reviewCount = row.mapItem?.rating?.votes_count ?? reviewResult.reviews_count
      const latestReviewDate = latestReviewDateFromDataForSeo(reviewResult)

      return {
        storeName: row.storeName,
        date: today,
        reviewCount: typeof reviewCount === 'number' ? reviewCount : Number(reviewCount),
        latestReviewDate,
        source: 'dataforseo',
        rating: typeof rating === 'number' ? rating : Number(rating),
        matchedTitle: row.mapItem?.title || reviewResult.title || '',
        category: row.mapItem?.category || '',
        photoCount: typeof row.mapItem?.total_photos === 'number' ? row.mapItem.total_photos : null,
        address: row.mapItem?.address || reviewResult.sub_title || '',
        latestReviewSnippet: latestReviewSnippetFromDataForSeo(reviewResult),
        error: row.mapError || reviewResult.error || '',
      }
    })
    .filter((row) => Number.isFinite(row.reviewCount))
}

async function loadReviewMetricRows() {
  const errors = []

  if (REVIEW_DATA_SOURCE === 'auto' || REVIEW_DATA_SOURCE === 'dataforseo') {
    try {
      const rows = await loadDataForSeoReviewMetricRows()
      if (rows.length) return rows
      errors.push('DataForSEO: 대상 매장 리뷰 데이터가 없습니다.')
    } catch (error) {
      errors.push(`DataForSEO: ${error.message}`)
      if (REVIEW_DATA_SOURCE === 'dataforseo') {
        throw new Error(`GBP 리뷰 지표 데이터를 찾지 못했습니다. ${errors.join(' / ')}`)
      }
    }
  }

  if (REVIEW_DATA_SOURCE === 'auto' || REVIEW_DATA_SOURCE === 'bigquery') {
    try {
      const rows = await loadBigQueryReviewMetricRows()
      if (rows.length) return rows
      errors.push('BigQuery: 대상 매장 리뷰 데이터가 없습니다.')
    } catch (error) {
      errors.push(`BigQuery: ${error.message}`)
      if (REVIEW_DATA_SOURCE === 'bigquery') {
        throw new Error(`GBP 리뷰 지표 데이터를 찾지 못했습니다. ${errors.join(' / ')}`)
      }
    }
  }

  if (REVIEW_DATA_SOURCE === 'auto' || REVIEW_DATA_SOURCE === 'notion') {
    try {
      const rows = await loadNotionReviewMetricRows()
      if (rows.length) return rows
      errors.push('Notion: 대상 매장 리뷰 데이터가 없습니다.')
    } catch (error) {
      errors.push(`Notion: ${error.message}`)
    }
  }

  throw new Error(`GBP 리뷰 지표 데이터를 찾지 못했습니다. ${errors.join(' / ')}`)
}

async function loadBigQueryReviewMetricRows() {
  const { BigQuery } = await import('@google-cloud/bigquery')
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT
  const location = process.env.BIGQUERY_LOCATION || DEFAULT_BIGQUERY_LOCATION
  const bigquery = new BigQuery({ projectId })
  const configuredStores = new Set(configuredStoreNames())

  const metricQuery = `
    SELECT
      CAST(summary_date AS STRING) AS date,
      store_name,
      review_count
    FROM ${bigQueryTableName('gbp_daily_metrics')}
    WHERE summary_date >= DATE_SUB(CURRENT_DATE("Asia/Seoul"), INTERVAL @lookbackDays DAY)
      AND review_count IS NOT NULL
    ORDER BY summary_date DESC
  `
  const [metricRows] = await bigquery.query({
    query: metricQuery,
    params: { lookbackDays: BIGQUERY_LOOKBACK_DAYS },
    location,
  })

  const reviewDateQuery = `
    SELECT
      store_name,
      CAST(MAX(DATE(review_date, "Asia/Seoul")) AS STRING) AS latest_review_date
    FROM ${bigQueryTableName('gbp_reviews')}
    WHERE review_date IS NOT NULL
    GROUP BY store_name
  `
  let latestReviewDateByStore = new Map()
  try {
    const [reviewRows] = await bigquery.query({ query: reviewDateQuery, location })
    latestReviewDateByStore = new Map(
      reviewRows
        .map((row) => [canonicalStoreName(row.store_name), row.latest_review_date])
        .filter(([storeName, latestReviewDate]) => configuredStores.has(storeName) && latestReviewDate)
    )
  } catch {}

  return metricRows
    .map((row) => ({
      storeName: canonicalStoreName(row.store_name),
      date: String(row.date || ''),
      reviewCount: Number(row.review_count),
      latestReviewDate: latestReviewDateByStore.get(canonicalStoreName(row.store_name)) || '',
    }))
    .filter(
      (row) =>
        configuredStores.has(row.storeName) &&
        row.date &&
        typeof row.reviewCount === 'number' &&
        Number.isFinite(row.reviewCount)
    )
}

async function loadNotionReviewMetricRows() {
  const storeNameByPageId = await loadStoreNameMap()
  const configuredStores = new Set(configuredStoreNames())
  const errors = []

  for (const databaseId of metricDatabaseIds()) {
    try {
      const database = await retrieveDatabase(databaseId)
      const schema = metricSchemaMap(database.properties || {})
      if (!schema.reviewCount) {
        errors.push(`${databaseId}: 리뷰 수 컬럼을 찾지 못했습니다.`)
        continue
      }

      const query = schema.date ? { sorts: [{ property: schema.date, direction: 'descending' }] } : {}
      const pages = await queryDatabase(databaseId, query, 20)
      const rows = pages
        .map((page) => parseMetricPage(page, schema, storeNameByPageId))
        .filter(Boolean)
        .map((row) => ({
          ...row,
          storeName: canonicalStoreName(row.storeName),
        }))
        .filter((row) => configuredStores.has(row.storeName))

      if (rows.length) return rows
      errors.push(`${databaseId}: 대상 매장 리뷰 데이터가 없습니다.`)
    } catch (error) {
      errors.push(`${databaseId}: ${error.message}`)
    }
  }

  throw new Error(errors.join(' / '))
}

function latestOnOrBefore(rows, date) {
  return rows.find((row) => row.date <= date) || null
}

function inferLatestReviewDate(rows) {
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date))
  for (let index = sorted.length - 1; index > 0; index -= 1) {
    if (sorted[index].reviewCount > sorted[index - 1].reviewCount) return sorted[index].date
  }
  return ''
}

function loadHistoryRows() {
  if (!HISTORY_FILE) return []
  const historyPath = path.resolve(ROOT, HISTORY_FILE)
  if (!fs.existsSync(historyPath)) return []

  try {
    const parsed = JSON.parse(fs.readFileSync(historyPath, 'utf-8'))
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => ({
        ...row,
        storeName: canonicalStoreName(row.storeName),
        date: String(row.date || ''),
        reviewCount: Number(row.reviewCount),
      }))
      .filter((row) => row.storeName && row.date && Number.isFinite(row.reviewCount))
  } catch {
    return []
  }
}

function serializableMetricRow(row) {
  return {
    storeName: row.storeName,
    date: row.date,
    reviewCount: row.reviewCount,
    latestReviewDate: row.latestReviewDate || '',
    source: row.source || '',
    rating: Number.isFinite(row.rating) ? row.rating : null,
    matchedTitle: row.matchedTitle || '',
    category: row.category || '',
    photoCount: Number.isFinite(row.photoCount) ? row.photoCount : null,
    address: row.address || '',
    latestReviewSnippet: row.latestReviewSnippet || '',
  }
}

function persistHistoryRows(currentRows) {
  if (!HISTORY_FILE || !currentRows?.length) return

  const historyPath = path.resolve(ROOT, HISTORY_FILE)
  fs.mkdirSync(path.dirname(historyPath), { recursive: true })

  const byKey = new Map()
  for (const row of loadHistoryRows()) {
    byKey.set(`${row.storeName}|${row.date}`, serializableMetricRow(row))
  }
  for (const row of currentRows) {
    byKey.set(`${row.storeName}|${row.date}`, serializableMetricRow(row))
  }

  const rows = Array.from(byKey.values())
    .sort((a, b) => a.storeName.localeCompare(b.storeName, 'ko') || a.date.localeCompare(b.date))
    .slice(-1000)
  fs.writeFileSync(historyPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf-8')
}

function kstWeekday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return new Date(Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day))).getUTCDay()
}

function shouldSendReportToday() {
  const rawValue = process.env.GBP_REVIEW_SEND_WEEKDAYS || ''
  if (!rawValue.trim()) return true
  const allowedDays = new Set(
    rawValue
      .split(/[,\s]+/)
      .map((value) => value.trim())
      .filter(Boolean)
  )
  return allowedDays.has(String(kstWeekday()))
}

async function buildReviewReport() {
  const currentRows = await loadReviewMetricRows()
  const rows = [...currentRows, ...loadHistoryRows()]
  const grouped = new Map()
  for (const row of rows) {
    const list = grouped.get(row.storeName) || []
    list.push(row)
    grouped.set(row.storeName, list)
  }

  const stores = configuredStoreNames()
  const reportRows = stores.map((storeName) => {
    const storeRows = (grouped.get(storeName) || []).sort((a, b) => b.date.localeCompare(a.date))
    const current = storeRows[0] || null
    const previousDay = current ? latestOnOrBefore(storeRows.slice(1), shiftDate(current.date, -1)) : null
    const previousWeek = current ? latestOnOrBefore(storeRows.slice(1), shiftDate(current.date, -7)) : null
    const latestReviewDate = current?.latestReviewDate || inferLatestReviewDate(storeRows)

    return {
      storeName,
      current,
      previousDay,
      previousWeek,
      dayDelta: current && previousDay ? current.reviewCount - previousDay.reviewCount : null,
      weekDelta: current && previousWeek ? current.reviewCount - previousWeek.reviewCount : null,
      latestReviewDate,
      status: '',
    }
  })

  return {
    checkedAt: kstNow(),
    source: rows.find((row) => row.source)?.source || REVIEW_DATA_SOURCE,
    currentRows,
    rows: reportRows.map((row) => ({ ...row, status: statusText(row) })),
  }
}

function buildRichHtml(report) {
  const title = isTest ? '[테스트] BlinkAd GBP 리뷰 변동 보고' : 'BlinkAd GBP 리뷰 변동 보고'
  const blocks = [
    `<h3>${htmlEscape(title)}</h3>`,
    `<p>기준: ${htmlEscape(report.checkedAt)} KST</p>`,
    report.source === 'dataforseo'
      ? '<p>원천: DataForSEO Google Maps + Google Reviews(newest)</p>'
      : '<p>비교: 전일 / 최근 7일</p>',
    '<h4>매장 요약</h4>',
    tableHtml(
      ['번호', '매장', '매칭 프로필', '현재 리뷰', '전일 대비', '7일 전 대비', '최근 리뷰일'],
      storeSummaryRows(report)
    ),
  ]

  const warningRows = report.rows
    .filter((row) => !row.current || row.dayDelta < 0 || row.weekDelta < 0)
    .map((row) => [
      row.storeName,
      row.current ? formatCount(row.current.reviewCount) : '확인 불가',
      row.status,
    ])

  blocks.push('<h4>주의 매장</h4>')
  blocks.push(warningRows.length ? tableHtml(['매장', '현재 리뷰', '상태'], warningRows) : '<p>없음</p>')

  const todayReviews = report.rows.filter((row) => row.latestReviewDate === report.checkedAt.slice(0, 10)).length
  const currentCount = report.rows.filter((row) => row.current).length

  if (report.source === 'dataforseo') {
    blocks.push(
      '<h4>요약</h4>',
      tableHtml(
        ['구분', '매장 수'],
        [
          ['현재 조회 완료', `${currentCount}곳`],
          ['오늘 최신 리뷰', `${todayReviews}곳`],
          ['확인 필요', `${warningRows.length}곳`],
        ]
      )
    )
  } else {
    const increased = report.rows.filter((row) => row.dayDelta > 0 || row.weekDelta > 0).length
    const decreased = report.rows.filter((row) => row.dayDelta < 0 || row.weekDelta < 0).length
    const unchanged = report.rows.filter((row) => row.current && row.dayDelta === 0 && row.weekDelta === 0).length
    blocks.push(
      '<h4>요약</h4>',
      tableHtml(
        ['구분', '매장 수'],
        [
          ['리뷰 증가', `${increased}곳`],
          ['리뷰 감소', `${decreased}곳`],
          ['변동 없음', `${unchanged}곳`],
          ['오늘 신규 리뷰', `${todayReviews}곳`],
        ]
      )
    )
  }

  return blocks.join('\n')
}

function buildTextMessage(report) {
  const title = isTest ? '[테스트] BlinkAd GBP 리뷰 변동 보고' : 'BlinkAd GBP 리뷰 변동 보고'
  const lines = [
    title,
    `기준: ${report.checkedAt} KST`,
    report.source === 'dataforseo' ? '원천: DataForSEO Google Maps + Google Reviews(newest)' : '비교: 전일 / 최근 7일',
    '',
    '[매장 요약]',
  ]

  lines.push(
    textTable(
      ['번호', '매장', '매칭 프로필', '현재 리뷰', '전일 대비', '7일 전 대비', '최근 리뷰일'],
      storeSummaryRows(report)
    )
  )

  const warnings = report.rows.filter((row) => !row.current || row.dayDelta < 0 || row.weekDelta < 0)
  lines.push('', '[주의 매장]')
  if (warnings.length) {
    warnings.forEach((row) => lines.push(`- ${row.storeName}: ${row.status}`))
  } else {
    lines.push('- 없음')
  }

  return lines.join('\n')
}

async function telegramApi(method, payload = {}) {
  const token = telegramToken()
  if (!token) throw new Error('Telegram bot token이 없습니다.')

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

async function sendTelegramTextToChat(chatId, message) {
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

async function sendTelegramMessage(textMessage, richHtml) {
  const chatIds = telegramChatIds()
  if (!chatIds.length) throw new Error('Telegram chat_id가 없습니다.')

  let sentMessages = 0
  for (const chatId of chatIds) {
    if (richHtml) {
      try {
        await telegramApi('sendRichMessage', {
          chat_id: chatId,
          rich_message: {
            html: richHtml,
            skip_entity_detection: true,
          },
        })
        sentMessages += 1
        continue
      } catch {
        console.warn(`sendRichMessage failed for ${chatId}; falling back to sendMessage.`)
      }
    }

    sentMessages += await sendTelegramTextToChat(chatId, textMessage)
  }
  return sentMessages
}

async function main() {
  const report = await buildReviewReport()
  const richHtml = buildRichHtml(report)
  const textMessage = buildTextMessage(report)

  if (isDryRun) {
    console.log(richHtml)
    return
  }

  if (!shouldSendReportToday()) {
    persistHistoryRows(report.currentRows)
    console.log(`Review snapshot saved; Telegram send skipped for KST weekday ${kstWeekday()}.`)
    return
  }

  const sentMessages = await sendTelegramMessage(textMessage, richHtml)
  persistHistoryRows(report.currentRows)
  console.log(`Telegram message sent in ${sentMessages} message(s).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
