import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DEFAULT_REPORT_DATABASE_ID = '357753ebc01381d29c36c774c4f2402f'

type ReportStatus = '완료' | '작성중' | '예정' | '휴무'

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
  date: ['보고일', '날짜', '일자', 'Date'],
  weekday: ['요일', 'Weekday'],
  status: ['보고상태', '상태', 'Status'],
  reporter: ['보고자', '담당자', '작성자', 'Owner'],
  completedAt: ['완료시간', '보고완료시간', '완료일시', 'Completed At'],
  summary: ['작업요약', '보고내용', '작업내용', '요약', 'Summary'],
  nextAction: ['다음작업', '다음 액션', 'Next Action'],
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

function fallbackReports(weekStart?: string): ReportItem[] {
  const dates = weekDates(weekStart)
  const titles = ['주간 기준 세팅', '사진 점검', '리뷰 확인', '소식지 운영', '주간 보고', '긴급 대응', '정기 운영 없음']
  const memos = [
    '기본정보와 우선 작업 정리',
    '대표사진, 메뉴판, 내부사진 확인',
    '신규 리뷰와 대댓글 상태 점검',
    'Google 게시물 작성/게시 확인',
    '이번 주 작업 요약 및 다음 액션',
    '필요 시 리뷰/정보 오류만 확인',
    '주간 운영 마감 후 대기',
  ]

  return dates.map((date, index) => ({
    dayOffset: index,
    date: isoDate(date),
    status: index >= 5 ? '휴무' : index === 0 ? '작성중' : '예정',
    title: titles[index],
    memo: memos[index],
  }))
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
  if (propSchema.type === 'checkbox') return { checkbox: value === '완료' || value === 'true' }
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
    date: findPropertyName(schema, propertyCandidates.date),
    weekday: findPropertyName(schema, propertyCandidates.weekday),
    status: findPropertyName(schema, propertyCandidates.status),
    reporter: findPropertyName(schema, propertyCandidates.reporter),
    completedAt: findPropertyName(schema, propertyCandidates.completedAt),
    summary: findPropertyName(schema, propertyCandidates.summary),
    nextAction: findPropertyName(schema, propertyCandidates.nextAction),
  }
}

function pageMatches(page: any, map: ReturnType<typeof reportSchemaMap>, store: string, product: string, dateSet: Set<string>) {
  const properties = page.properties || {}
  const storeText = propText(properties[map.store])
  const productText = propText(properties[map.product])
  const dateText = propText(properties[map.date]).slice(0, 10)
  const productLabel = productLabels[product] || product

  if (!dateSet.has(dateText)) return false
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
        status: (propText(properties[map.status]) || fallback.status) as ReportStatus,
        title: propText(properties[map.title]) || fallback.title,
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const store = searchParams.get('store') || ''
  const product = searchParams.get('product') || 'googleProfile'
  const weekStart = searchParams.get('weekStart') || undefined
  const token = resolveNotionToken()
  const databaseId = reportDatabaseId()

  if (!token) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: 'NOTION_TOKEN 또는 NOTION_API_KEY가 없어 샘플 보고 데이터로 표시 중입니다.',
      reports: fallbackReports(weekStart),
    })
  }

  try {
    const notion = new Client({ auth: token })
    const reports = await loadReports(notion, databaseId, store, product, weekStart)
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
      message: error instanceof Error ? error.message : 'Notion 보고 DB 연결에 실패했습니다.',
      reports: fallbackReports(weekStart),
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
  const token = resolveNotionToken()
  const databaseId = reportDatabaseId()

  if (!token || !store || !date) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: 'Notion 토큰, 매장명, 보고일이 필요합니다.',
      reports: fallbackReports(weekStart),
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
    const reportTitle = `${store} ${productLabel} ${date} 보고`

    setProperty(properties, schema, map.title, reportTitle)
    setProperty(properties, schema, map.store, store)
    setProperty(properties, schema, map.product, productLabel)
    setProperty(properties, schema, map.date, date)
    setProperty(properties, schema, map.weekday, weekday(parseDate(date)))
    setProperty(properties, schema, map.status, '완료')
    setProperty(properties, schema, map.reporter, '블링크애드')
    setProperty(properties, schema, map.completedAt, new Date().toISOString())
    setProperty(properties, schema, map.summary, memo ? `${title} - ${memo}` : title)
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
      message: `${date} 보고완료 처리했습니다.`,
      reports,
    })
  } catch (error) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: error instanceof Error ? error.message : '보고완료 처리에 실패했습니다.',
      reports: fallbackReports(weekStart),
    })
  }
}
