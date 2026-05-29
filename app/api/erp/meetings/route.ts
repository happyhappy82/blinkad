import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { NextResponse } from 'next/server'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type CalendarEventPayload = {
  id?: string
  title?: string
  start?: string
  end?: string
  type?: string
  location?: string
  attendees?: string[]
  status?: string
  memo?: string
  source?: string
  calendarName?: string
  calendarId?: string
}

const propertyCandidates = {
  title: ['미팅명', '미팅', '회의명', '일정명', '제목', '이름', 'Name'],
  eventId: ['캘린더 이벤트 ID', '캘린더ID', '이벤트ID', 'Calendar Event ID', 'Event ID'],
  date: ['미팅일시', '미팅일', '일시', '날짜', 'Date'],
  status: ['상태', 'Status'],
  client: ['고객사', '매장명', '고객명', '클라이언트', 'Client', 'Store'],
  calendarName: ['캘린더', 'Calendar'],
  location: ['장소', 'Location'],
  attendees: ['참석자', 'Attendees'],
  memo: ['미팅 요약', '미팅요약', '미팅내용', '미팅 내용', '회의록', '논의내용', '내용', '메모', 'Summary', 'Note'],
  source: ['소스', 'Source'],
}

const DEFAULT_CLIENT_DATABASE_ID = '18f451110c9945d997de4ce4fd86d074'
const CLIENT_DATABASE_SEARCH_QUERY = '통합 문의 관리 DB'

type ClientRecord = {
  name: string
  status: string
  contact: string
  notionUrl: string
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

function configuredMeetingDatabaseId() {
  return (
    process.env.BLINKAD_MEETING_DATABASE_ID ||
    process.env.BLINKAD_NOTION_MEETING_DATABASE_ID ||
    process.env.ERP_MEETING_DATABASE_ID ||
    process.env.NOTION_MEETING_DATABASE_ID ||
    ''
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
    const normalizedName = name.replace(/\s+/g, '').toLowerCase()
    const matched = candidates.some((candidate) => normalizedName.includes(candidate.replace(/\s+/g, '').toLowerCase()))
    return matched && (!type || prop.type === type)
  })

  return match?.[0] || ''
}

function titlePropertyName(properties: Record<string, any>) {
  return findPropertyName(properties, propertyCandidates.title, 'title') || Object.entries(properties).find(([, prop]) => prop.type === 'title')?.[0] || ''
}

function meetingSchemaMap(schema: Record<string, any>) {
  return {
    title: titlePropertyName(schema),
    eventId: findPropertyName(schema, propertyCandidates.eventId),
    date: findPropertyName(schema, propertyCandidates.date),
    status: findPropertyName(schema, propertyCandidates.status),
    client: findPropertyName(schema, propertyCandidates.client),
    calendarName: findPropertyName(schema, propertyCandidates.calendarName),
    location: findPropertyName(schema, propertyCandidates.location),
    attendees: findPropertyName(schema, propertyCandidates.attendees),
    memo: findPropertyName(schema, propertyCandidates.memo),
    source: findPropertyName(schema, propertyCandidates.source),
  }
}

function optionName(propSchema: any, value: string, fallbacks: string[] = []) {
  const options = propSchema?.[propSchema.type]?.options || []
  const names = options.map((option: any) => option.name).filter(Boolean)
  if (!names.length) return value
  if (names.includes(value)) return value
  return fallbacks.find((fallback) => names.includes(fallback)) || undefined
}

function propertyValue(propSchema: any, value: string, fallbacks: string[] = []) {
  if (!propSchema) return undefined
  if (propSchema.type === 'title') return { title: value ? [{ text: { content: value } }] : [] }
  if (propSchema.type === 'rich_text') return { rich_text: value ? [{ text: { content: value } }] : [] }
  if (propSchema.type === 'select') {
    const name = value ? optionName(propSchema, value, fallbacks) : undefined
    return name ? { select: { name } } : { select: null }
  }
  if (propSchema.type === 'status') {
    const name = value ? optionName(propSchema, value, fallbacks) : undefined
    return name ? { status: { name } } : undefined
  }
  if (propSchema.type === 'date') return value ? { date: { start: value } } : { date: null }
  if (propSchema.type === 'url') return { url: value || null }
  if (propSchema.type === 'email') return { email: value || null }
  if (propSchema.type === 'phone_number') return { phone_number: value || null }
  if (propSchema.type === 'number') return { number: Number(value) || null }
  if (propSchema.type === 'checkbox') return { checkbox: value === '완료' || value === 'true' }
  if (propSchema.type === 'multi_select') {
    return value
      ? { multi_select: value.split(',').map((item) => ({ name: item.trim() })).filter((item) => item.name) }
      : { multi_select: [] }
  }
  return undefined
}

function setProperty(target: Record<string, any>, schema: Record<string, any>, name: string, value: string, fallbacks: string[] = []) {
  if (!name) return
  const converted = propertyValue(schema[name], value, fallbacks)
  if (converted) target[name] = converted
}

function normalizeMeetingStatus(status?: string) {
  const value = String(status || '').toLowerCase()
  if (value.includes('cancel') || value.includes('취소')) return '취소'
  if (value.includes('done') || value.includes('complete') || value.includes('완료')) return '완료'
  return '예정'
}

function normalizeMatchText(value?: string) {
  return String(value || '')
    .replace(/\s+/g, '')
    .replace(/[()[\]{}·ㆍ|/\\_-]/g, '')
    .toLowerCase()
}

function isMeetingEvent(event: CalendarEventPayload) {
  const text = `${event.title || ''} ${event.memo || ''}`.toLowerCase()
  return event.type === 'meeting' || text.includes('미팅') || text.includes('회의') || text.includes('상담') || text.includes('meet')
}

function normalizeKeyPart(value?: string) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

function meetingEventKey(event: CalendarEventPayload) {
  const eventId = normalizeKeyPart(event.id)
  if (eventId) return `event:${eventId}`
  return `fallback:${normalizeKeyPart(event.title)}:${normalizeKeyPart(event.start)}`
}

function meetingPageKey(page: any, map: ReturnType<typeof meetingSchemaMap>) {
  const properties = page.properties || {}
  const eventId = normalizeKeyPart(propText(properties[map.eventId]))
  if (eventId) return `event:${eventId}`
  return `fallback:${normalizeKeyPart(propText(properties[map.title]))}:${normalizeKeyPart(propText(properties[map.date]))}`
}

function meetingRecordKey(record: ReturnType<typeof meetingRecordFromPage>) {
  const eventId = normalizeKeyPart(record.calendarEventId)
  if (eventId) return `event:${eventId}`
  return `fallback:${normalizeKeyPart(record.title)}:${normalizeKeyPart(record.date)}`
}

function clientNameFromTitle(title: string) {
  return title
    .replace(/제안\s*미팅|상담|회의|미팅|打合せ|meeting/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function clientNameVariants(name: string) {
  const variants = new Set<string>()
  const trimmed = name.trim()
  if (trimmed) variants.add(trimmed)

  const withoutParentheses = trimmed.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim()
  if (withoutParentheses) variants.add(withoutParentheses)

  const parentheticalMatches = trimmed.matchAll(/\(([^)]*)\)|\[([^\]]*)\]/g)
  for (const match of parentheticalMatches) {
    const value = (match[1] || match[2] || '').trim()
    if (value) variants.add(value)
  }

  const firstSegment = trimmed.split(/[(/|]/)[0]?.trim()
  if (firstSegment) variants.add(firstSegment)

  return Array.from(variants)
}

function matchClientFromText(text: string, clients: ClientRecord[]) {
  const normalizedText = normalizeMatchText(text)
  if (!normalizedText) return null

  const matches = clients
    .map((client) => {
      const score = clientNameVariants(client.name).reduce((best, variant) => {
        const normalizedVariant = normalizeMatchText(variant)
        if (normalizedVariant.length < 2) return best
        return normalizedText.includes(normalizedVariant) ? Math.max(best, normalizedVariant.length) : best
      }, 0)

      return { client, score }
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)

  return matches[0]?.client || null
}

function matchClientForEvent(event: CalendarEventPayload, clients: ClientRecord[]) {
  return matchClientFromText(
    `${event.title || ''} ${event.memo || ''} ${event.location || ''} ${(event.attendees || []).join(' ')}`,
    clients
  )
}

function matchClientForRecord(record: ReturnType<typeof meetingRecordFromPage>, clients: ClientRecord[]) {
  return matchClientFromText(
    `${record.client || ''} ${record.title || ''} ${record.memo || ''} ${record.location || ''} ${record.attendees.join(' ')}`,
    clients
  )
}

function meetingRecordFromPage(page: any, map: ReturnType<typeof meetingSchemaMap>) {
  const properties = page.properties || {}
  const attendees = propText(properties[map.attendees])
  const title = propText(properties[map.title]) || '제목 없는 미팅'
  const client = propText(properties[map.client])
  const memo = propText(properties[map.memo])

  return {
    id: page.id,
    storeName: client || title,
    managerName: attendees,
    meetingSummary: memo,
    title,
    date: propText(properties[map.date]) || page.created_time || '',
    status: propText(properties[map.status]) || '예정',
    client,
    calendarName: propText(properties[map.calendarName]),
    location: propText(properties[map.location]),
    attendees: attendees ? attendees.split(',').map((item) => item.trim()).filter(Boolean) : [],
    memo,
    calendarEventId: propText(properties[map.eventId]),
    notionUrl: page.url || '',
    clientStatus: '',
    clientContact: '',
    clientNotionUrl: '',
  }
}

function sortMeetings(a: ReturnType<typeof meetingRecordFromPage>, b: ReturnType<typeof meetingRecordFromPage>) {
  return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
}

async function findMeetingDatabaseBySearch(notion: Client) {
  const response = await notion.search({
    query: '미팅관리',
    filter: { property: 'object', value: 'database' },
    page_size: 10,
  })
  const database = response.results.find((result: any) => {
    const title = result.title?.map((item: any) => item.plain_text).join('') || ''
    return title.replace(/\s+/g, '').includes('미팅관리')
  })
  return database?.id || ''
}

async function resolveMeetingDatabaseId(notion: Client) {
  const configured = configuredMeetingDatabaseId()
  if (configured) return configured
  return findMeetingDatabaseBySearch(notion)
}

async function loadMeetingPages(notion: Client, databaseId: string, map: ReturnType<typeof meetingSchemaMap>) {
  const sorts = map.date ? [{ property: map.date, direction: 'descending' as const }] : undefined
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
    ...(sorts ? { sorts } : {}),
  })
  return response.results as any[]
}

function matchExistingPage(
  pages: any[],
  map: ReturnType<typeof meetingSchemaMap>,
  event: CalendarEventPayload
) {
  const eventId = event.id || ''
  const title = event.title || ''
  const start = event.start || ''

  if (eventId && map.eventId) {
    const byEventId = pages.find((page) => propText(page.properties?.[map.eventId]) === eventId)
    if (byEventId) return byEventId
  }

  return pages.find((page) => {
    const properties = page.properties || {}
    return propText(properties[map.title]) === title && propText(properties[map.date]) === start
  })
}

function uniqueMeetingPages(pages: any[], map: ReturnType<typeof meetingSchemaMap>) {
  const seen = new Set<string>()
  return pages.filter((page) => {
    const key = meetingPageKey(page, map)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function uniqueMeetingEvents(events: CalendarEventPayload[]) {
  const seen = new Set<string>()
  return events.filter((event) => {
    const key = meetingEventKey(event)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function uniqueMeetingRecords(records: ReturnType<typeof meetingRecordFromPage>[]) {
  const seen = new Set<string>()
  return records.filter((record) => {
    const key = meetingRecordKey(record)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function mapMeetingPages(pages: any[], map: ReturnType<typeof meetingSchemaMap>) {
  return uniqueMeetingRecords(pages.map((page) => meetingRecordFromPage(page, map)).sort(sortMeetings))
}

function enrichMeetingRecords(records: ReturnType<typeof meetingRecordFromPage>[], clients: ClientRecord[]) {
  if (!clients.length) return records

  return records.map((record) => {
    const client = matchClientForRecord(record, clients)
    if (!client) return record

    return {
      ...record,
      storeName: client.name,
      client: client.name,
      clientStatus: client.status,
      clientContact: client.contact,
      clientNotionUrl: client.notionUrl,
    }
  })
}

function eventProperties(
  schema: Record<string, any>,
  map: ReturnType<typeof meetingSchemaMap>,
  event: CalendarEventPayload,
  existing?: any,
  matchedClient?: ClientRecord | null
) {
  const properties: Record<string, any> = {}
  const existingMemo = existing && map.memo ? propText(existing.properties?.[map.memo]) : ''
  const attendees = (event.attendees || []).join(', ')
  const title = event.title || '제목 없는 미팅'
  const clientName = matchedClient?.name || clientNameFromTitle(title)

  setProperty(properties, schema, map.title, title)
  setProperty(properties, schema, map.eventId, event.id || '')
  setProperty(properties, schema, map.date, event.start || '')
  setProperty(properties, schema, map.status, normalizeMeetingStatus(event.status), ['예정', '미팅 예정', '진행 예정', '대기'])
  setProperty(properties, schema, map.client, clientName)
  setProperty(properties, schema, map.calendarName, event.calendarName || '')
  setProperty(properties, schema, map.location, event.location || '')
  setProperty(properties, schema, map.attendees, attendees)
  setProperty(properties, schema, map.source, '용올캘린더')

  if (!existingMemo && event.memo) {
    setProperty(properties, schema, map.memo, event.memo)
  }

  return properties
}

async function findClientDatabaseBySearch(notion: Client, cause?: unknown) {
  const response = await notion.search({
    query: CLIENT_DATABASE_SEARCH_QUERY,
    filter: { property: 'object', value: 'database' },
    page_size: 10,
  })
  const database = response.results.find((result: any) =>
    (result.title || []).some((text: any) => text.plain_text?.includes(CLIENT_DATABASE_SEARCH_QUERY))
  ) || response.results[0]

  if (database?.id) return database.id

  const detail = cause instanceof Error ? ` 원인: ${cause.message}` : ''
  throw new Error(`문의관리 DB를 찾지 못했습니다.${detail}`)
}

async function resolveClientDatabaseId(notion: Client, databaseOrPageId: string) {
  try {
    await notion.databases.retrieve({ database_id: databaseOrPageId })
    return databaseOrPageId
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.includes('is a page')) {
      return findClientDatabaseBySearch(notion, error)
    }

    const children = await notion.blocks.children.list({
      block_id: databaseOrPageId,
      page_size: 100,
    })
    const databaseBlocks = children.results.filter((block: any) => block.type === 'child_database') as any[]
    const preferredBlocks = [
      ...databaseBlocks.filter((block) => (block.child_database?.title || '').includes('문의')),
      ...databaseBlocks,
    ]

    for (const block of preferredBlocks) {
      if (!block?.id) continue
      try {
        await notion.databases.retrieve({ database_id: block.id })
        return block.id
      } catch {
        // Linked DB blocks can be visible while the data source itself is not shared.
      }
    }

    return findClientDatabaseBySearch(notion, error)
  }
}

function clientRecordFromPage(page: any): ClientRecord {
  const properties = page.properties || {}
  const titleName =
    propText(properties['고객명']) ||
    propText(properties['매장명']) ||
    propText(properties[titlePropertyName(properties)])

  return {
    name: titleName || '이름 없음',
    status: propText(properties[findPropertyName(properties, ['처리상태', '상태', '계약완료', 'Status'])]),
    contact: propText(properties[findPropertyName(properties, ['연락처', '전화번호', 'Phone', 'Contact'])]),
    notionUrl: page.url || '',
  }
}

async function loadClientRecords(notion: Client) {
  try {
    const databaseId = process.env.BLINKAD_NOTION_DATABASE_ID || DEFAULT_CLIENT_DATABASE_ID
    const resolvedDatabaseId = await resolveClientDatabaseId(notion, databaseId)
    const response = await notion.databases.query({
      database_id: resolvedDatabaseId,
      page_size: 100,
    })

    return response.results
      .map(clientRecordFromPage)
      .filter((client) => client.name && client.name !== '이름 없음')
  } catch {
    return []
  }
}

async function syncCalendarMeetings(notion: Client, databaseId: string, events: CalendarEventPayload[]) {
  const database = await notion.databases.retrieve({ database_id: databaseId })
  const schema = (database as any).properties || {}
  const map = meetingSchemaMap(schema)

  if (!map.title) {
    throw new Error('미팅관리 DB에서 제목 속성을 찾지 못했습니다.')
  }

  const pages = await loadMeetingPages(notion, databaseId, map)
  const knownPages = uniqueMeetingPages(pages, map)
  const meetingEvents = uniqueMeetingEvents(events.filter(isMeetingEvent))
  const clients = await loadClientRecords(notion)

  for (const event of meetingEvents) {
    const existing = matchExistingPage(knownPages, map, event)
    const properties = eventProperties(schema, map, event, existing, matchClientForEvent(event, clients))

    if (existing) {
      const updatedPage = await notion.pages.update({ page_id: existing.id, properties })
      const index = knownPages.findIndex((page) => page.id === existing.id)
      if (index >= 0) knownPages[index] = updatedPage
    } else {
      const createdPage = await notion.pages.create({
        parent: { database_id: databaseId },
        properties,
      })
      knownPages.push(createdPage)
    }
  }

  const updatedPages = await loadMeetingPages(notion, databaseId, map)
  return enrichMeetingRecords(mapMeetingPages(updatedPages, map), clients)
}

function fallbackMeetings() {
  return [
    {
      id: 'fallback-meeting-1',
      title: '역대짬뽕 제안 미팅',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: '샘플',
      client: '역대짬뽕',
      calendarName: '용올캘린더',
      location: '오프라인 미팅',
      attendees: ['권순현', '역대짬뽕 대표'],
      memo: 'Google 프로필과 지점별 웹페이지 연결 전략 설명',
      calendarEventId: 'sample-meeting-1',
      notionUrl: '',
    },
  ]
}

function meetingConnectionErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code || '') : ''
  const message = error instanceof Error ? error.message : ''
  const isMissingOrUnsharedDatabase =
    code === 'object_not_found' ||
    message.includes('Could not find database') ||
    message.includes('Make sure the relevant pages and databases are shared')

  if (isMissingOrUnsharedDatabase) {
    return 'Notion 미팅관리 DB가 Integration에 공유되지 않았습니다. DB 우측 상단 공유/연결에서 Integration 권한을 추가해주세요.'
  }

  return message || 'Notion 미팅관리 DB 연결에 실패했습니다.'
}

async function getNotionAndDatabase() {
  const token = resolveNotionToken()

  if (!token) {
    return {
      notion: null,
      databaseId: '',
      message: 'NOTION_TOKEN 또는 NOTION_API_KEY가 없어 샘플 미팅 데이터로 표시 중입니다.',
    }
  }

  const notion = new Client({ auth: token })
  const databaseId = await resolveMeetingDatabaseId(notion)

  if (!databaseId) {
    return {
      notion: null,
      databaseId: '',
      message: '미팅관리 Notion DB를 찾지 못했습니다. BLINKAD_MEETING_DATABASE_ID 또는 ERP_MEETING_DATABASE_ID를 설정해주세요.',
    }
  }

  return { notion, databaseId, message: '' }
}

export async function GET() {
  try {
    const { notion, databaseId, message } = await getNotionAndDatabase()
    if (!notion || !databaseId) {
      return NextResponse.json({
        source: 'fallback',
        connected: false,
        message,
        meetings: fallbackMeetings(),
      })
    }

    const database = await notion.databases.retrieve({ database_id: databaseId })
    const schema = (database as any).properties || {}
    const map = meetingSchemaMap(schema)
    const pages = await loadMeetingPages(notion, databaseId, map)
    const clients = await loadClientRecords(notion)

    return NextResponse.json({
      source: 'notion',
      connected: true,
      message: 'Notion 미팅관리 DB와 연결되었습니다.',
      meetings: enrichMeetingRecords(mapMeetingPages(pages, map), clients),
    })
  } catch (error) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: meetingConnectionErrorMessage(error),
      meetings: fallbackMeetings(),
    })
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { events?: CalendarEventPayload[] }

  try {
    const { notion, databaseId, message } = await getNotionAndDatabase()
    if (!notion || !databaseId) {
      return NextResponse.json({
        source: 'fallback',
        connected: false,
        message,
        meetings: fallbackMeetings(),
      })
    }

    const meetings = await syncCalendarMeetings(notion, databaseId, body.events || [])
    return NextResponse.json({
      source: 'notion',
      connected: true,
      message: '용올캘린더 미팅 일정을 Notion 미팅관리 DB와 동기화했습니다.',
      meetings,
    })
  } catch (error) {
    return NextResponse.json(
      {
        source: 'fallback',
        connected: false,
        message: meetingConnectionErrorMessage(error),
        meetings: fallbackMeetings(),
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: string; memo?: string; status?: string }

  if (!body.id) {
    return NextResponse.json({ connected: false, message: '미팅관리 DB 페이지 ID가 필요합니다.' }, { status: 400 })
  }

  try {
    const { notion, databaseId, message } = await getNotionAndDatabase()
    if (!notion || !databaseId) {
      return NextResponse.json({
        source: 'fallback',
        connected: false,
        message,
        meetings: fallbackMeetings(),
      })
    }

    const database = await notion.databases.retrieve({ database_id: databaseId })
    const schema = (database as any).properties || {}
    const map = meetingSchemaMap(schema)
    const properties: Record<string, any> = {}

    setProperty(properties, schema, map.memo, String(body.memo || ''))
    if (body.status) {
      setProperty(properties, schema, map.status, body.status, ['예정', '미팅 예정', '진행 예정', '대기'])
    }

    await notion.pages.update({
      page_id: body.id,
      properties,
    })

    const pages = await loadMeetingPages(notion, databaseId, map)
    const clients = await loadClientRecords(notion)

    return NextResponse.json({
      source: 'notion',
      connected: true,
      message: '미팅관리 DB에 미팅 요약을 저장했습니다.',
      meetings: enrichMeetingRecords(mapMeetingPages(pages, map), clients),
    })
  } catch (error) {
    return NextResponse.json(
      {
        source: 'fallback',
        connected: false,
        message: meetingConnectionErrorMessage(error),
        meetings: fallbackMeetings(),
      },
      { status: 500 }
    )
  }
}
