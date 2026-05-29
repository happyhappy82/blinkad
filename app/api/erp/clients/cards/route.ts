import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { NextResponse } from 'next/server'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DEFAULT_CARD_DATABASE_ID = '36c753ebc01381b48377dfaf1c16359e'
const CARD_DATABASE_SEARCH_QUERY = '명함 DB'

const fallbackCards = [
  {
    id: 'sample-card-1',
    name: '명함 샘플',
    phone: '연락처 입력 필요',
    status: '입력필요',
    imageUrl: '',
    imageName: '',
    meetingIds: [],
    meetingTitles: ['샘플 미팅'],
    ocrStatus: '대기',
    ocrText: '',
    lastEdited: '',
    notionUrl: '',
  },
]

function propText(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title?.map((item: any) => item.plain_text).join('') || ''
  if (prop.type === 'rich_text') return prop.rich_text?.map((item: any) => item.plain_text).join('') || ''
  if (prop.type === 'select') return prop.select?.name || ''
  if (prop.type === 'status') return prop.status?.name || ''
  if (prop.type === 'phone_number') return prop.phone_number || ''
  if (prop.type === 'email') return prop.email || ''
  if (prop.type === 'last_edited_time') return prop.last_edited_time || ''
  return ''
}

function findProperty(properties: Record<string, any>, candidates: string[]) {
  for (const name of candidates) {
    if (properties[name]) return properties[name]
  }

  const entries = Object.entries(properties)
  const match = entries.find(([name]) =>
    candidates.some((candidate) => name.toLowerCase().includes(candidate.toLowerCase()))
  )
  return match?.[1]
}

function firstFile(prop: any) {
  if (!prop || prop.type !== 'files') return { imageUrl: '', imageName: '' }
  const file = prop.files?.[0]
  if (!file) return { imageUrl: '', imageName: '' }

  return {
    imageUrl: file.type === 'external' ? file.external?.url || '' : file.file?.url || '',
    imageName: file.name || '',
  }
}

function relationIds(prop: any): string[] {
  if (!prop || prop.type !== 'relation') return []
  return (prop.relation || []).map((item: any) => item.id).filter(Boolean)
}

function titleFromPage(page: any) {
  const titleProperty = Object.values(page.properties || {}).find((prop: any) => prop.type === 'title') as any
  return propText(titleProperty)
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

async function findCardDatabaseBySearch(notion: Client, cause?: unknown) {
  const response = await notion.search({
    query: CARD_DATABASE_SEARCH_QUERY,
    filter: { property: 'object', value: 'database' },
    page_size: 10,
  })
  const database = response.results.find((result: any) =>
    (result.title || []).some((text: any) => text.plain_text === CARD_DATABASE_SEARCH_QUERY)
  ) || response.results[0]

  if (database?.id) return database.id

  const detail = cause instanceof Error ? ` 원인: ${cause.message}` : ''
  throw new Error(`명함 DB를 찾지 못했습니다.${detail}`)
}

async function resolveCardDatabaseId(notion: Client, databaseId: string) {
  try {
    await notion.databases.retrieve({ database_id: databaseId })
    return databaseId
  } catch (error) {
    return findCardDatabaseBySearch(notion, error)
  }
}

async function resolveMeetingTitles(notion: Client, meetingIds: string[]) {
  const uniqueIds = Array.from(new Set(meetingIds))
  const entries = await Promise.all(
    uniqueIds.map(async (meetingId) => {
      try {
        const page = await notion.pages.retrieve({ page_id: meetingId })
        return [meetingId, titleFromPage(page) || '미팅명 없음'] as const
      } catch {
        return [meetingId, '미팅명 확인 불가'] as const
      }
    })
  )

  return new Map(entries)
}

function normalizeCard(page: any, meetingTitleMap: Map<string, string>) {
  const properties = page.properties || {}
  const meetingIds = relationIds(findProperty(properties, ['관련 미팅', '미팅', 'Meeting']))
  const file = firstFile(findProperty(properties, ['명함 사진', '명함', '사진', 'Business Card']))

  return {
    id: page.id,
    name: propText(findProperty(properties, ['이름', '성명', 'Name'])) || '이름 없음',
    phone: propText(findProperty(properties, ['연락처', '전화번호', 'Phone', 'Contact'])) || '연락처 미입력',
    status: propText(findProperty(properties, ['상태', 'Status'])) || '입력필요',
    imageUrl: file.imageUrl,
    imageName: file.imageName,
    meetingIds,
    meetingTitles: meetingIds.map((meetingId) => meetingTitleMap.get(meetingId) || '미팅명 확인 불가'),
    ocrStatus: propText(findProperty(properties, ['OCR 상태', 'OCR Status'])) || '대기',
    ocrText: propText(findProperty(properties, ['OCR 원문', 'OCR Text'])) || '',
    lastEdited: page.last_edited_time || '',
    notionUrl: page.url || '',
  }
}

export async function GET() {
  const token = resolveNotionToken()
  const databaseId = process.env.BLINKAD_NOTION_CARD_DATABASE_ID || DEFAULT_CARD_DATABASE_ID

  if (!token) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: 'NOTION_TOKEN 또는 NOTION_API_KEY가 없어 샘플 데이터로 표시 중입니다.',
      cards: fallbackCards,
    })
  }

  try {
    const notion = new Client({ auth: token })
    const resolvedDatabaseId = await resolveCardDatabaseId(notion, databaseId)
    const response = await notion.databases.query({
      database_id: resolvedDatabaseId,
      page_size: 100,
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
    })
    const meetingIds = response.results.flatMap((page: any) =>
      relationIds(findProperty(page.properties || {}, ['관련 미팅', '미팅', 'Meeting']))
    )
    const meetingTitleMap = await resolveMeetingTitles(notion, meetingIds)

    return NextResponse.json({
      source: 'notion',
      connected: true,
      cards: response.results.map((page) => normalizeCard(page, meetingTitleMap)),
    })
  } catch (error) {
    return NextResponse.json(
      {
        source: 'fallback',
        connected: false,
        message: error instanceof Error ? error.message : '명함 DB 연결에 실패했습니다.',
        cards: fallbackCards,
      },
      { status: 200 }
    )
  }
}
