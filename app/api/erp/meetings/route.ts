import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { NextResponse } from 'next/server'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const meetingSourcePageId = '2ea753ebc01380e18b25c0bc664238b8'
const preferredMeetingDatabaseTitle = '팔로업 대상 리스트'

const propertyCandidates = {
  storeName: ['매장명', '상호명', '고객사', '고객명', '클라이언트', 'Client', 'Store', 'Name'],
  managerName: ['담당자명', '담당자', '연락담당자', '대표자', 'Manager', 'Owner'],
  status: ['처리상태', '진행상태', '상태', 'Status'],
  meetingSummary: ['미팅요약', '미팅 요약', '미팅내용', '미팅 내용', '회의록', '논의내용', '메모', 'Summary', 'Note'],
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
    process.env.BLINKAD_MEETING_SOURCE_DATABASE_ID ||
    process.env.ERP_MEETING_SOURCE_DATABASE_ID ||
    process.env.NOTION_MEETING_SOURCE_DATABASE_ID ||
    ''
  )
}

function configuredMeetingSourcePageId() {
  return process.env.BLINKAD_MEETING_SOURCE_PAGE_ID || process.env.ERP_MEETING_SOURCE_PAGE_ID || meetingSourcePageId
}

function plainText(property: any): string {
  if (!property) return ''
  if (property.type === 'title') return property.title?.map((item: any) => item.plain_text).join('') || ''
  if (property.type === 'rich_text') return property.rich_text?.map((item: any) => item.plain_text).join('') || ''
  if (property.type === 'select') return property.select?.name || ''
  if (property.type === 'status') return property.status?.name || ''
  if (property.type === 'multi_select') return property.multi_select?.map((item: any) => item.name).join(', ') || ''
  if (property.type === 'date') return property.date?.start || ''
  if (property.type === 'url') return property.url || ''
  if (property.type === 'email') return property.email || ''
  if (property.type === 'phone_number') return property.phone_number || ''
  if (property.type === 'number') return String(property.number ?? '')
  if (property.type === 'checkbox') return property.checkbox ? 'true' : 'false'
  if (property.type === 'people') {
    return property.people?.map((person: any) => person.name || person.person?.email || '').filter(Boolean).join(', ') || ''
  }
  if (property.type === 'formula') {
    const formula = property.formula
    if (!formula) return ''
    if (formula.type === 'string') return formula.string || ''
    if (formula.type === 'number') return String(formula.number ?? '')
    if (formula.type === 'boolean') return formula.boolean ? 'true' : 'false'
    if (formula.type === 'date') return formula.date?.start || ''
  }
  if (property.type === 'rollup') {
    const rollup = property.rollup
    if (!rollup) return ''
    if (rollup.type === 'array') return rollup.array?.map(plainText).filter(Boolean).join(', ') || ''
    if (rollup.type === 'number') return String(rollup.number ?? '')
    if (rollup.type === 'date') return rollup.date?.start || ''
  }
  if (property.type === 'relation') return property.relation?.length ? `${property.relation.length}개 연결` : ''
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
  return Object.entries(properties).find(([, prop]) => prop.type === 'title')?.[0] || ''
}

function meetingSchemaMap(schema: Record<string, any>) {
  const title = titlePropertyName(schema)

  return {
    storeName: findPropertyName(schema, propertyCandidates.storeName) || title,
    managerName: findPropertyName(schema, propertyCandidates.managerName),
    status: findPropertyName(schema, propertyCandidates.status),
    meetingSummary: findPropertyName(schema, propertyCandidates.meetingSummary),
    title,
  }
}

function databaseTitle(database: any) {
  return database.title?.map((item: any) => item.plain_text).join('') || ''
}

async function findChildMeetingDatabaseId(notion: Client) {
  const sourcePageId = configuredMeetingSourcePageId()
  let cursor: string | undefined

  do {
    const response = await notion.blocks.children.list({
      block_id: sourcePageId,
      page_size: 100,
      start_cursor: cursor,
    })

    const childDatabase = response.results.find((block: any) => {
      const title = block.child_database?.title || ''
      return block.type === 'child_database' && title.replace(/\s+/g, '').includes(preferredMeetingDatabaseTitle.replace(/\s+/g, ''))
    }) as any

    if (childDatabase?.id) return childDatabase.id
    cursor = response.next_cursor || undefined
  } while (cursor)

  return ''
}

async function resolveMeetingDatabaseId(notion: Client) {
  const configured = configuredMeetingDatabaseId()
  if (configured) return configured
  return findChildMeetingDatabaseId(notion)
}

async function loadMeetingPages(notion: Client, databaseId: string) {
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })
  return response.results as any[]
}

function meetingRecordFromPage(page: any, map: ReturnType<typeof meetingSchemaMap>) {
  const properties = page.properties || {}
  const storeName = plainText(properties[map.storeName])
  const managerName = plainText(properties[map.managerName])
  const status = plainText(properties[map.status])
  const meetingSummary = plainText(properties[map.meetingSummary])

  return {
    id: page.id,
    storeName,
    managerName,
    meetingSummary,
    title: storeName || plainText(properties[map.title]) || '매장명 없음',
    date: page.created_time || '',
    status,
    client: storeName,
    calendarName: '',
    location: '',
    attendees: managerName ? [managerName] : [],
    memo: meetingSummary,
    calendarEventId: '',
    notionUrl: page.url || '',
  }
}

function fallbackMeetings() {
  return []
}

function meetingConnectionErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code || '') : ''
  const message = error instanceof Error ? error.message : ''
  const isMissingOrUnsharedDatabase =
    code === 'object_not_found' ||
    message.includes('Could not find database') ||
    message.includes('does not contain any data sources accessible') ||
    message.includes('Make sure the relevant pages and databases are shared')

  if (isMissingOrUnsharedDatabase) {
    return `${preferredMeetingDatabaseTitle} DB가 Notion Integration에 공유되지 않았습니다. 링크 페이지가 아니라 DB 자체의 공유/연결 메뉴에서 Integration 권한을 추가해주세요.`
  }

  return message || 'Notion 미팅관리 DB 연결에 실패했습니다.'
}

async function getNotionAndDatabase() {
  const token = resolveNotionToken()

  if (!token) {
    return {
      notion: null,
      databaseId: '',
      message: 'NOTION_TOKEN 또는 NOTION_API_KEY가 없어 미팅관리 DB를 불러오지 못했습니다.',
    }
  }

  const notion = new Client({ auth: token })
  const databaseId = await resolveMeetingDatabaseId(notion)

  if (!databaseId) {
    return {
      notion: null,
      databaseId: '',
      message: `${preferredMeetingDatabaseTitle} DB를 찾지 못했습니다. BLINKAD_MEETING_SOURCE_DATABASE_ID를 설정해주세요.`,
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
    const pages = await loadMeetingPages(notion, databaseId)

    return NextResponse.json({
      source: 'notion',
      connected: true,
      message: `${databaseTitle(database) || preferredMeetingDatabaseTitle}에서 매장명, 담당자명, 처리상태, 미팅요약을 불러왔습니다.`,
      meetings: pages.map((page) => meetingRecordFromPage(page, map)),
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
