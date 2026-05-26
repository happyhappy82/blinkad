import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DEFAULT_REPORT_DATABASE_ID = '357753ebc01381d29c36c774c4f2402f'

type ReportStatus = '초안' | '생성완료' | '보고대기' | '보고완료' | '실패' | '작성중'

type ReportItem = {
  id?: string
  dayOffset: number
  date: string
  status: ReportStatus
  title: string
  memo: string
  reporter?: string
  completedAt?: string
}

const productLabels: Record<string, string> = {
  googleProfile: '구글프로필',
  googleAds: '구글애즈',
  websiteBlog: '웹사이트·블로그',
}

const propertyCandidates = {
  title: ['보고명', '이름', 'Name', 'title'],
  store: ['매장명', '고객명', '업체명', '클라이언트', 'Store'],
  product: ['상품', '서비스', '작업구분', 'Product'],
  reportType: ['보고 유형', '보고유형', 'Report Type'],
  date: ['보고일', '날짜', '일자', 'Date'],
  periodStart: ['기준 시작일', '기준시작일', 'Period Start'],
  periodEnd: ['기준 종료일', '기준종료일', 'Period End'],
  weekday: ['요일', 'Weekday'],
  status: ['발송 상태', '발송상태', '보고상태', '상태', 'Status'],
  reporter: ['보고자', '담당자', '작성자', 'Owner'],
  completedAt: ['발송 시각', '발송시각', '완료시간', '보고완료시간', '완료일시', 'Completed At'],
  summary: ['카톡 메시지', '카톡메시지', '작업요약', '보고내용', '작업내용', '요약', 'Summary'],
  nextAction: ['다음작업', '다음 액션', 'Next Action'],
}

type GbpWinsorMetrics = {
  views?: number
  searches?: number
  actions?: number
  calls?: number
  directions?: number
  websiteClicks?: number
  topKeywords?: string[]
  keywordChanges?: string[]
  notes?: string[]
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

function reportDatabaseId() {
  return (
    process.env.BLINKAD_REPORT_DATABASE_ID ||
    process.env.BLINKAD_NOTION_REPORT_DATABASE_ID ||
    process.env.ERP_REPORT_DATABASE_ID ||
    DEFAULT_REPORT_DATABASE_ID
  )
}

function reportConnectionErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code || '') : ''
  const message = error instanceof Error ? error.message : ''
  const isMissingOrUnsharedDatabase =
    code === 'object_not_found' ||
    message.includes('Could not find database') ||
    message.includes('Make sure the relevant pages and databases are shared')

  if (isMissingOrUnsharedDatabase) {
    return 'Notion 보고 DB가 현재 Integration에 공유되지 않아 샘플 보고 데이터로 표시 중입니다. Notion 보고 DB 우측 상단 공유/연결에서 Integration 권한을 추가해주세요.'
  }

  return message || 'Notion 보고 DB 연결에 실패했습니다.'
}

function propText(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title?.map((item: any) => item.plain_text).join('') || ''
  if (prop.type === 'rich_text') return prop.rich_text?.map((item: any) => item.plain_text).join('') || ''
  if (prop.type === 'select') return prop.select?.name || ''
  if (prop.type === 'status') return prop.status?.name || ''
  if (prop.type === 'multi_select') return prop.multi_select?.map((item: any) => item.name).join(', ') || ''
  if (prop.type === 'date') return prop.date?.start || ''
  if (prop.type === 'url') return prop.url || ''
  if (prop.type === 'email') return prop.email || ''
  if (prop.type === 'phone_number') return prop.phone_number || ''
  if (prop.type === 'number') return String(prop.number ?? '')
  if (prop.type === 'checkbox') return prop.checkbox ? 'true' : 'false'
  return ''
}

function findPropertyName(properties: Record<string, any>, candidates: string[], type?: string) {
  for (const name of candidates) {
    if (properties[name] && (!type || properties[name].type === type)) return name
  }

  const entries = Object.entries(properties)
  const match = entries.find(([name, prop]) => {
    const lowerName = name.toLowerCase()
    const nameMatched = candidates.some((candidate) => lowerName.includes(candidate.toLowerCase()))
    return nameMatched && (!type || prop.type === type)
  })
  return match?.[0] || ''
}

function titlePropertyName(properties: Record<string, any>) {
  return findPropertyName(properties, propertyCandidates.title, 'title') || Object.entries(properties).find(([, prop]) => prop.type === 'title')?.[0] || ''
}

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDate(value?: string) {
  if (!value) return new Date()
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return new Date(value)
  return new Date(year, month - 1, day)
}

function weekDates(weekStart?: string) {
  const start = parseDate(weekStart)
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

function weekday(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date)
}

function normalizeReportStatus(value?: string, fallback: ReportStatus = '보고대기'): ReportStatus {
  if (value === '완료') return '보고완료'
  if (value === '예정') return '보고대기'
  if (value === '휴무') return '보고대기'
  if (
    value === '초안' ||
    value === '생성완료' ||
    value === '보고대기' ||
    value === '보고완료' ||
    value === '실패' ||
    value === '작성중'
  ) {
    return value
  }
  return fallback
}

function isReportSent(status: ReportStatus) {
  return status === '보고완료'
}

function fallbackReports(weekStart?: string): ReportItem[] {
  const dates = weekDates(weekStart).slice(0, 5)
  const titles = ['피드업데이트', '키워드순위보고', '종합 데이터 분석', '피드업데이트', '주간 마감 보고']
  const memos = [
    'Google 게시물과 소식지 업데이트를 진행합니다.',
    '주요 키워드 노출 순위와 변동을 확인합니다.',
    '조회, 검색, 상호작용 데이터를 종합 점검합니다.',
    '주중 운영 내용을 반영해 피드를 추가 업데이트합니다.',
    '이번 주 작업 결과와 다음 주 액션을 정리합니다.',
  ]

  return dates.map((date, index) => ({
    dayOffset: index,
    date: isoDate(date),
    status: index === 0 ? '작성중' : '보고대기',
    title: titles[index],
    memo: memos[index],
  }))
}

function fallbackReportsWithStatus(weekStart: string | undefined, date: string, status: ReportStatus) {
  return fallbackReports(weekStart).map((report) =>
    report.date === date
      ? {
          ...report,
          status,
          reporter: '블링크애드',
          completedAt: isReportSent(status) ? new Date().toISOString() : undefined,
        }
      : report
  )
}

function fallbackReportHistory(weekStart?: string): ReportItem[] {
  const baseStart = parseDate(weekStart)
  baseStart.setDate(baseStart.getDate() - 14)
  const reports: ReportItem[] = []
  const titles = ['피드업데이트', '키워드순위보고', '종합 데이터 분석', '피드업데이트', '주간 마감 보고']

  for (let index = 0; reports.length < 10; index += 1) {
    const date = new Date(baseStart)
    date.setDate(baseStart.getDate() + index)
    const day = date.getDay()
    if (day === 0 || day === 6) continue

    reports.push({
      dayOffset: reports.length % 5,
      date: isoDate(date),
      status: '보고완료' as ReportStatus,
      title: titles[reports.length % 5],
      memo: '보고 DB 연결 전 표시되는 샘플 과거 보고입니다.',
      reporter: '블링크애드',
      completedAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0, 0).toISOString(),
    })
  }

  return reports.reverse()
}

function propertyValue(propSchema: any, value: string) {
  if (!propSchema) return undefined
  if (propSchema.type === 'title') return { title: value ? [{ text: { content: value } }] : [] }
  if (propSchema.type === 'rich_text') return { rich_text: value ? [{ text: { content: value } }] : [] }
  if (propSchema.type === 'select') return value ? { select: { name: value } } : { select: null }
  if (propSchema.type === 'status') return value ? { status: { name: value } } : undefined
  if (propSchema.type === 'date') return value ? { date: { start: value } } : { date: null }
  if (propSchema.type === 'url') return { url: value || null }
  if (propSchema.type === 'email') return { email: value || null }
  if (propSchema.type === 'phone_number') return { phone_number: value || null }
  if (propSchema.type === 'number') return { number: Number(value) || null }
  if (propSchema.type === 'checkbox') return { checkbox: value === '보고완료' || value === '완료' || value === 'true' }
  return undefined
}

function setProperty(
  target: Record<string, any>,
  schema: Record<string, any>,
  name: string,
  value: string
) {
  if (!name) return
  const converted = propertyValue(schema[name], value)
  if (converted) target[name] = converted
}

function reportSchemaMap(schema: Record<string, any>) {
  return {
    title: titlePropertyName(schema),
    store: findPropertyName(schema, propertyCandidates.store),
    product: findPropertyName(schema, propertyCandidates.product),
    reportType: findPropertyName(schema, propertyCandidates.reportType),
    date: findPropertyName(schema, propertyCandidates.date),
    periodStart: findPropertyName(schema, propertyCandidates.periodStart),
    periodEnd: findPropertyName(schema, propertyCandidates.periodEnd),
    weekday: findPropertyName(schema, propertyCandidates.weekday),
    status: findPropertyName(schema, propertyCandidates.status),
    reporter: findPropertyName(schema, propertyCandidates.reporter),
    completedAt: findPropertyName(schema, propertyCandidates.completedAt),
    summary: findPropertyName(schema, propertyCandidates.summary),
    nextAction: findPropertyName(schema, propertyCandidates.nextAction),
  }
}

function reportTypeForTitle(title: string) {
  if (title.includes('키워드')) return '화요일 키워드 순위 보고'
  if (title.includes('종합') || title.includes('데이터')) return '수요일 주간 성과 보고'
  if (title.includes('마감')) return '금요일 주간 마감 보고'
  if (title.includes('피드')) return '소식지 발행 보고'
  return '일일 보고'
}

function displayTitleFromReportType(reportType: string, fallback: string) {
  if (reportType.includes('키워드')) return '키워드순위보고'
  if (reportType.includes('성과') || reportType.includes('데이터')) return '종합 데이터 분석'
  if (reportType.includes('마감')) return '주간 마감 보고'
  if (reportType.includes('소식지') || reportType.includes('피드')) return '피드업데이트'
  return fallback
}

function displayReportTitle(properties: Record<string, any>, map: ReturnType<typeof reportSchemaMap>, fallback: string) {
  const reportType = propText(properties[map.reportType])
  const title = propText(properties[map.title])
  if (reportType) return displayTitleFromReportType(reportType, fallback)
  if (title.includes('키워드순위보고')) return '키워드순위보고'
  if (title.includes('종합 데이터 분석')) return '종합 데이터 분석'
  if (title.includes('주간 마감 보고')) return '주간 마감 보고'
  if (title.includes('피드업데이트')) return '피드업데이트'
  return fallback
}

function pageMatches(
  page: any,
  map: ReturnType<typeof reportSchemaMap>,
  store: string,
  product: string,
  dateSet?: Set<string>
) {
  const properties = page.properties || {}
  const storeText = propText(properties[map.store])
  const productText = propText(properties[map.product])
  const dateText = propText(properties[map.date]).slice(0, 10)
  const productLabel = productLabels[product] || product

  if (dateSet && !dateSet.has(dateText)) return false
  if (storeText && store && !storeText.includes(store) && !store.includes(storeText)) return false
  if (productText && productLabel && !productText.includes(productLabel) && !productLabel.includes(productText)) return false
  return true
}

function mergeReports(
  pages: any[],
  map: ReturnType<typeof reportSchemaMap>,
  store: string,
  product: string,
  weekStart?: string
) {
  const base = fallbackReports(weekStart)
  const dateSet = new Set(base.map((report) => report.date))
  const byDate = new Map(base.map((report) => [report.date, report]))

  pages
    .filter((page) => pageMatches(page, map, store, product, dateSet))
    .forEach((page) => {
      const properties = page.properties || {}
      const date = propText(properties[map.date]).slice(0, 10)
      const fallback = byDate.get(date)
      if (!fallback) return

      byDate.set(date, {
        ...fallback,
        id: page.id,
        status: normalizeReportStatus(propText(properties[map.status]), fallback.status),
        title: displayReportTitle(properties, map, fallback.title),
        memo: propText(properties[map.summary]) || fallback.memo,
        reporter: propText(properties[map.reporter]),
        completedAt: propText(properties[map.completedAt]),
      })
    })

  return Array.from(byDate.values())
}

async function loadReports(notion: Client, databaseId: string, store: string, product: string, weekStart?: string) {
  const database = await notion.databases.retrieve({ database_id: databaseId })
  const schema = (database as any).properties || {}
  const map = reportSchemaMap(schema)
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })

  return mergeReports(response.results, map, store, product, weekStart)
}

async function loadReportHistory(notion: Client, databaseId: string, store: string, product: string) {
  const database = await notion.databases.retrieve({ database_id: databaseId })
  const schema = (database as any).properties || {}
  const map = reportSchemaMap(schema)
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })

  return response.results
    .filter((page) => pageMatches(page, map, store, product))
    .map((page: any) => {
      const properties = page.properties || {}
      const date = propText(properties[map.date]).slice(0, 10)
      return {
        id: page.id,
        dayOffset: parseDate(date).getDay(),
        date,
        status: normalizeReportStatus(propText(properties[map.status]), '보고완료'),
        title: displayReportTitle(properties, map, '작업보고'),
        memo: propText(properties[map.summary]) || '',
        reporter: propText(properties[map.reporter]),
        completedAt: propText(properties[map.completedAt]),
      }
    })
    .filter((report) => report.date)
    .sort((a, b) => b.date.localeCompare(a.date))
}

function numberText(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) ? `${value.toLocaleString('ko-KR')}회` : '데이터 연결 전'
}

function listText(values?: string[]) {
  return values?.length ? values.map((value) => `- ${value}`).join('\n') : '- 데이터 연결 후 자동 반영'
}

async function loadGbpWinsorMetrics(store: string, weekStart?: string): Promise<GbpWinsorMetrics | null> {
  const inlineJson = process.env.GBP_WINSOR_DATA_JSON || ''
  if (inlineJson) {
    try {
      const parsed = JSON.parse(inlineJson)
      return parsed?.[store] || parsed || null
    } catch {
      return null
    }
  }

  const apiUrl = process.env.GBP_WINSOR_API_URL || process.env.WINSOR_GBP_API_URL || ''
  if (!apiUrl) return null

  try {
    const url = new URL(apiUrl)
    url.searchParams.set('store', store)
    if (weekStart) url.searchParams.set('weekStart', weekStart)

    const response = await fetch(url.toString(), {
      headers: process.env.GBP_WINSOR_API_KEY
        ? { Authorization: `Bearer ${process.env.GBP_WINSOR_API_KEY}` }
        : undefined,
      cache: 'no-store',
    })
    if (!response.ok) return null
    return (await response.json()) as GbpWinsorMetrics
  } catch {
    return null
  }
}

function automatedReportMemo(report: ReportItem, store: string, metrics: GbpWinsorMetrics | null) {
  const dataNotice = metrics
    ? '아래 내용은 GBP-빅쿼리-Winsor 데이터를 기준으로 정리했습니다.'
    : '현재 GBP-빅쿼리-Winsor 데이터 연결값이 없어 수치 입력 전 보고 초안으로 생성했습니다.'

  if (report.title.includes('키워드')) {
    return `[${store}] 대표님, 안녕하세요.

오늘은 Google 지도 기준 주요 키워드 노출 흐름을 점검했습니다.
${dataNotice}

핵심 확인 내용
- 프로필 조회: ${numberText(metrics?.views)}
- 검색 노출: ${numberText(metrics?.searches)}
- 고객 행동: ${numberText(metrics?.actions)}

주요 키워드/변동
${listText(metrics?.keywordChanges || metrics?.topKeywords)}

이번 주 키워드 흐름을 기준으로 다음 피드 업데이트와 프로필 문구에 반영하겠습니다.`
  }

  if (report.title.includes('종합') || report.title.includes('데이터')) {
    return `[${store}] 대표님, 안녕하세요.

오늘은 Google 프로필 운영 데이터를 종합적으로 점검했습니다.
${dataNotice}

데이터 요약
- 프로필 조회: ${numberText(metrics?.views)}
- 검색 노출: ${numberText(metrics?.searches)}
- 전화 클릭: ${numberText(metrics?.calls)}
- 길찾기 클릭: ${numberText(metrics?.directions)}
- 웹사이트 이동: ${numberText(metrics?.websiteClicks)}

운영 메모
${listText(metrics?.notes)}

데이터는 단순 수치 확인보다 어떤 정보가 고객 행동으로 이어지는지를 보는 것이 중요합니다. 이번 주 데이터 기준으로 다음 작업 우선순위를 정리해 운영에 반영하겠습니다.`
  }

  if (report.title.includes('마감')) {
    return `[${store}] 대표님, 안녕하세요.

이번 주 Google 프로필 운영 내용을 정리드립니다.
${dataNotice}

이번 주 주요 수치
- 프로필 조회: ${numberText(metrics?.views)}
- 검색 노출: ${numberText(metrics?.searches)}
- 고객 행동: ${numberText(metrics?.actions)}
- 전화/길찾기/웹사이트 이동: ${numberText((metrics?.calls || 0) + (metrics?.directions || 0) + (metrics?.websiteClicks || 0))}

다음 주 작업 방향
- 고객이 검색 후 바로 이해할 수 있는 정보 보강
- 대표 메뉴/서비스 중심 콘텐츠 누적
- 리뷰와 사진을 통한 신뢰 신호 강화
- Google 프로필과 웹사이트/블로그 정보의 방향성 정리

목표는 단순 게시물 작성이 아니라, Google과 AI가 매장을 더 정확히 이해할 수 있도록 공식 정보를 꾸준히 쌓는 것입니다.`
  }

  return report.memo
}

async function upsertReportPage(
  notion: Client,
  databaseId: string,
  schema: Record<string, any>,
  map: ReturnType<typeof reportSchemaMap>,
  store: string,
  product: string,
  weekStart: string | undefined,
  report: ReportItem,
  status: ReportStatus,
  memo: string
) {
  const productLabel = productLabels[product] || product
  const dateSet = new Set([report.date])
  const existing = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })
  const page = existing.results.find((item: any) => pageMatches(item, map, store, product, dateSet)) as any
  const properties: Record<string, any> = {}
  const reportTitle = `${store} ${productLabel} ${report.title} ${report.date}`

  setProperty(properties, schema, map.title, reportTitle)
  setProperty(properties, schema, map.store, store)
  setProperty(properties, schema, map.product, productLabel)
  setProperty(properties, schema, map.reportType, reportTypeForTitle(report.title))
  setProperty(properties, schema, map.date, report.date)
  setProperty(properties, schema, map.periodStart, weekStart || report.date)
  setProperty(properties, schema, map.periodEnd, report.date)
  setProperty(properties, schema, map.weekday, weekday(parseDate(report.date)))
  setProperty(properties, schema, map.status, status)
  setProperty(properties, schema, map.reporter, '블링크애드')
  setProperty(properties, schema, map.completedAt, isReportSent(status) ? new Date().toISOString() : '')
  setProperty(properties, schema, map.summary, memo)
  setProperty(properties, schema, map.nextAction, '다음 작업 확인')

  if (page?.id) {
    await notion.pages.update({ page_id: page.id, properties })
  } else {
    await notion.pages.create({ parent: { database_id: databaseId }, properties })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const store = searchParams.get('store') || ''
  const product = searchParams.get('product') || 'googleProfile'
  const weekStart = searchParams.get('weekStart') || undefined
  const mode = searchParams.get('mode') || 'week'
  const token = resolveNotionToken()
  const databaseId = reportDatabaseId()

  if (!token) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: 'NOTION_TOKEN 또는 NOTION_API_KEY가 없어 샘플 보고 데이터로 표시 중입니다.',
      reports: mode === 'history' ? fallbackReportHistory(weekStart) : fallbackReports(weekStart),
    })
  }

  try {
    const notion = new Client({ auth: token })
    const reports =
      mode === 'history'
        ? await loadReportHistory(notion, databaseId, store, product)
        : await loadReports(notion, databaseId, store, product, weekStart)
    return NextResponse.json({
      source: 'notion',
      connected: true,
      message: 'Notion 보고 DB와 연결되었습니다.',
      reports,
    })
  } catch (error) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: reportConnectionErrorMessage(error),
      reports: mode === 'history' ? fallbackReportHistory(weekStart) : fallbackReports(weekStart),
    })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const store = String(body.store || '').trim()
  const product = String(body.product || 'googleProfile').trim()
  const weekStart = String(body.weekStart || '').slice(0, 10)
  const token = resolveNotionToken()
  const databaseId = reportDatabaseId()
  const baseReports = fallbackReports(weekStart)
  const targetReports = baseReports.filter(
    (report) => report.title.includes('키워드') || report.title.includes('종합') || report.title.includes('마감')
  )
  const metrics = await loadGbpWinsorMetrics(store, weekStart)
  const generatedReports = baseReports.map((report) =>
    targetReports.some((target) => target.date === report.date)
      ? {
          ...report,
          status: '생성완료' as ReportStatus,
          memo: automatedReportMemo(report, store, metrics),
          reporter: '블링크애드',
        }
      : report
  )

  if (!token || !store) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: 'Notion 토큰 또는 매장명이 없어 ERP 화면에만 자동 생성 초안을 표시합니다.',
      reports: generatedReports,
    })
  }

  try {
    const notion = new Client({ auth: token })
    const database = await notion.databases.retrieve({ database_id: databaseId })
    const schema = (database as any).properties || {}
    const map = reportSchemaMap(schema)

    for (const report of targetReports) {
      await upsertReportPage(
        notion,
        databaseId,
        schema,
        map,
        store,
        product,
        weekStart,
        report,
        '생성완료',
        automatedReportMemo(report, store, metrics)
      )
    }

    const reports = await loadReports(notion, databaseId, store, product, weekStart)
    return NextResponse.json({
      source: 'notion',
      connected: true,
      message: metrics
        ? 'GBP-빅쿼리-Winsor 데이터 기준으로 화·수·금 보고 초안을 Notion에 저장했습니다.'
        : 'GBP-빅쿼리-Winsor 데이터 연결값이 없어 화·수·금 보고 초안을 Notion에 저장했습니다.',
      reports,
    })
  } catch (error) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: reportConnectionErrorMessage(error),
      reports: generatedReports,
    })
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const store = String(body.store || '').trim()
  const product = String(body.product || 'googleProfile').trim()
  const date = String(body.date || '').slice(0, 10)
  const weekStart = String(body.weekStart || date || '').slice(0, 10)
  const title = String(body.title || '작업보고').trim()
  const memo = String(body.memo || '').trim()
  const status = normalizeReportStatus(String(body.status || '보고완료').trim(), '보고완료')
  const token = resolveNotionToken()
  const databaseId = reportDatabaseId()

  if (!token || !store || !date) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: 'Notion 토큰, 매장명, 보고일이 필요합니다.',
      reports: fallbackReportsWithStatus(weekStart, date, status),
    })
  }

  try {
    const notion = new Client({ auth: token })
    const database = await notion.databases.retrieve({ database_id: databaseId })
    const schema = (database as any).properties || {}
    const map = reportSchemaMap(schema)
    const productLabel = productLabels[product] || product
    const dateSet = new Set([date])
    const existing = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
    })
    const page = existing.results.find((item: any) => pageMatches(item, map, store, product, dateSet)) as any
    const properties: Record<string, any> = {}
    const reportTitle = `${store} ${productLabel} ${title} ${date}`

    setProperty(properties, schema, map.title, reportTitle)
    setProperty(properties, schema, map.store, store)
    setProperty(properties, schema, map.product, productLabel)
    setProperty(properties, schema, map.reportType, reportTypeForTitle(title))
    setProperty(properties, schema, map.date, date)
    setProperty(properties, schema, map.periodStart, weekStart || date)
    setProperty(properties, schema, map.periodEnd, date)
    setProperty(properties, schema, map.weekday, weekday(parseDate(date)))
    setProperty(properties, schema, map.status, status)
    setProperty(properties, schema, map.reporter, '블링크애드')
    setProperty(properties, schema, map.completedAt, isReportSent(status) ? new Date().toISOString() : '')
    setProperty(properties, schema, map.summary, memo || title)
    setProperty(properties, schema, map.nextAction, '다음 작업 확인')

    if (page?.id) {
      await notion.pages.update({
        page_id: page.id,
        properties,
      })
    } else {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties,
      })
    }

    const reports = await loadReports(notion, databaseId, store, product, weekStart)
    return NextResponse.json({
      source: 'notion',
      connected: true,
      message: `${date} 발송상태를 ${status}(으)로 변경했습니다.`,
      reports,
    })
  } catch (error) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: reportConnectionErrorMessage(error),
      reports: fallbackReportsWithStatus(weekStart, date, status),
    })
  }
}
