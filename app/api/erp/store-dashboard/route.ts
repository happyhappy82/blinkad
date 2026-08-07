import { Client } from '@notionhq/client'
import { NextResponse } from 'next/server'

const DEFAULT_PAGE_ID = '3b4753ebc0138021afecfbdc3115d1b3'
const DEFAULT_PAGE_URL =
  'https://www.notion.so/Blink-Ad-3b4753ebc0138021afecfbdc3115d1b3?source=copy_link'

type NotionProperty = {
  type?: string
  title?: { plain_text?: string }[]
  rich_text?: { plain_text?: string }[]
  select?: { name?: string } | null
  status?: { name?: string } | null
  multi_select?: { name?: string }[]
  date?: { start?: string; end?: string | null } | null
  number?: number | null
  checkbox?: boolean
  url?: string | null
  email?: string | null
  phone_number?: string | null
  formula?: { type?: string; string?: string | null; number?: number | null; boolean?: boolean | null; date?: { start?: string } | null }
  rollup?: { type?: string; number?: number | null }
}

function textFromProperty(property: NotionProperty | undefined) {
  if (!property) return ''
  if (property.type === 'title') return (property.title || []).map((item) => item.plain_text || '').join('')
  if (property.type === 'rich_text') return (property.rich_text || []).map((item) => item.plain_text || '').join('')
  if (property.type === 'select') return property.select?.name || ''
  if (property.type === 'status') return property.status?.name || ''
  if (property.type === 'multi_select') return (property.multi_select || []).map((item) => item.name || '').filter(Boolean).join(', ')
  if (property.type === 'date') return property.date?.end ? `${property.date.start || ''} ~ ${property.date.end}` : property.date?.start || ''
  if (property.type === 'number') return property.number == null ? '' : String(property.number)
  if (property.type === 'checkbox') return property.checkbox ? '완료' : '미완료'
  if (property.type === 'url') return property.url || ''
  if (property.type === 'email') return property.email || ''
  if (property.type === 'phone_number') return property.phone_number || ''
  if (property.type === 'formula') {
    const formula = property.formula
    if (!formula) return ''
    if (formula.type === 'date') return formula.date?.start || ''
    return String(formula[formula.type as 'string' | 'number' | 'boolean'] ?? '')
  }
  if (property.type === 'rollup') return property.rollup?.number == null ? '' : String(property.rollup.number)
  return ''
}

function pickValue(properties: Record<string, NotionProperty>, candidates: string[]) {
  const compactCandidates = candidates.map((candidate) => candidate.replace(/\s+/g, '').toLowerCase())
  const entry = Object.entries(properties).find(([name]) =>
    compactCandidates.some((candidate) => name.replace(/\s+/g, '').toLowerCase().includes(candidate))
  )
  return entry ? textFromProperty(entry[1]) : ''
}

function pageTitle(properties: Record<string, NotionProperty>) {
  const titleProperty = Object.values(properties).find((property) => property.type === 'title')
  return textFromProperty(titleProperty) || '제목 없음'
}

async function listAllChildren(notion: Client, blockId: string) {
  const blocks: any[] = []
  let cursor: string | undefined

  do {
    const response = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 })
    blocks.push(...response.results)
    cursor = response.has_more ? response.next_cursor || undefined : undefined
  } while (cursor)

  return blocks
}

async function queryAllPages(notion: Client, databaseId: string) {
  const pages: any[] = []
  let cursor: string | undefined

  do {
    const response = await notion.databases.query({ database_id: databaseId, start_cursor: cursor, page_size: 100 })
    pages.push(...response.results)
    cursor = response.has_more ? response.next_cursor || undefined : undefined
  } while (cursor)

  return pages
}

export async function GET() {
  const pageId = process.env.BLINKAD_NOTION_STORE_DASHBOARD_PAGE_ID || DEFAULT_PAGE_ID
  const pageUrl = process.env.BLINKAD_NOTION_STORE_DASHBOARD_URL || DEFAULT_PAGE_URL
  const token = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY

  if (!token) {
    return NextResponse.json({
      connected: false,
      pageUrl,
      databases: [],
      message: 'Notion API 토큰이 없어 원본 페이지 링크만 표시합니다.',
    })
  }

  const notion = new Client({ auth: token })

  try {
    let blocks: any[] = []
    let directDatabaseId = ''
    try {
      await notion.pages.retrieve({ page_id: pageId })
      blocks = await listAllChildren(notion, pageId)
    } catch (pageError) {
      try {
        await notion.databases.retrieve({ database_id: pageId })
        directDatabaseId = pageId
      } catch {
        throw pageError
      }
    }
    const databaseReferences = [
      ...(directDatabaseId ? [{ id: directDatabaseId, title: '' }] : []),
      ...blocks
        .filter((block) => block.type === 'child_database')
        .map((block) => ({ id: block.id, title: block.child_database?.title || '' })),
      ...blocks
        .filter((block) => block.type === 'link_to_page' && block.link_to_page?.type === 'database_id')
        .map((block) => ({ id: block.link_to_page.database_id, title: '' })),
    ].filter((reference, index, references) => references.findIndex((item) => item.id === reference.id) === index)
    const databases = await Promise.all(
      databaseReferences.map(async (reference) => {
        const database = (await notion.databases.retrieve({ database_id: reference.id })) as any
        const pages = await queryAllPages(notion, reference.id)
        const rows = pages.map((page) => {
          const properties = (page.properties || {}) as Record<string, NotionProperty>
          return {
            id: page.id,
            title: pageTitle(properties),
            status: pickValue(properties, ['상태', '진행', 'status']),
            date: pickValue(properties, ['날짜', '기준일', '작성일', 'date']),
            period: pickValue(properties, ['기간', '주차', '월', 'period']),
            owner: pickValue(properties, ['담당', '작성자', 'owner']),
            url: page.url || '',
            properties: Object.fromEntries(
              Object.entries(properties)
                .map(([name, property]) => [name, textFromProperty(property)])
                .filter(([, value]) => Boolean(value))
            ),
          }
        })

        return {
          id: reference.id,
          title: (database.title || []).map((item: { plain_text?: string }) => item.plain_text || '').join('') || reference.title || '매장 현황',
          rows,
        }
      })
    )

    return NextResponse.json({
      connected: true,
      pageUrl,
      databases,
      message: databases.length
        ? `Notion 데이터베이스 ${databases.length}개를 불러왔습니다.`
        : '페이지는 연결됐지만 내부 데이터베이스를 찾지 못했습니다.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Notion 페이지를 불러오지 못했습니다.'
    return NextResponse.json({
      connected: false,
      pageUrl,
      databases: [],
      message: message.includes('Could not find')
        ? 'Notion 페이지를 ERP 연동에 공유하면 매장별 현황이 자동으로 표시됩니다.'
        : message,
    })
  }
}
