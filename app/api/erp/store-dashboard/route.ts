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
  relation?: { id?: string }[]
  people?: { name?: string; person?: { email?: string } }[]
  created_time?: string
  last_edited_time?: string
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
  if (property.type === 'people') return (property.people || []).map((person) => person.name || person.person?.email || '').filter(Boolean).join(', ')
  if (property.type === 'created_time') return property.created_time || ''
  if (property.type === 'last_edited_time') return property.last_edited_time || ''
  if (property.type === 'formula') {
    const formula = property.formula
    if (!formula) return ''
    if (formula.type === 'date') return formula.date?.start || ''
    return String(formula[formula.type as 'string' | 'number' | 'boolean'] ?? '')
  }
  if (property.type === 'rollup') return property.rollup?.number == null ? '' : String(property.rollup.number)
  return ''
}

async function resolvedPropertyText(
  notion: Client,
  property: NotionProperty,
  relationTitleCache: Map<string, string>
) {
  if (property.type !== 'relation') return textFromProperty(property)
  const titles = await Promise.all(
    (property.relation || []).map(async (relation) => {
      const id = relation.id || ''
      if (!id) return ''
      if (relationTitleCache.has(id)) return relationTitleCache.get(id) || ''
      try {
        const page = (await notion.pages.retrieve({ page_id: id })) as any
        const title = pageTitle((page.properties || {}) as Record<string, NotionProperty>)
        relationTitleCache.set(id, title)
        return title
      } catch {
        return ''
      }
    })
  )
  return titles.filter(Boolean).join(', ')
}

function pickResolvedValue(properties: Record<string, string>, candidates: string[]) {
  const compactCandidates = candidates.map((candidate) => candidate.replace(/\s+/g, '').toLowerCase())
  const entry = Object.entries(properties).find(([name]) =>
    compactCandidates.some((candidate) => name.replace(/\s+/g, '').toLowerCase().includes(candidate))
  )
  return entry?.[1] || ''
}

function databaseKind(title: string) {
  const compactTitle = title.replace(/[\s·/_-]+/g, '').toLowerCase()
  if (compactTitle.includes('매장마스터')) return 'storeMaster' as const
  if (compactTitle.includes('발행') && compactTitle.includes('보고') && compactTitle.includes('로그')) return 'reportLog' as const
  return 'other' as const
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
    const relationTitleCache = new Map<string, string>()
    const discoveredDatabases = await Promise.all(
      databaseReferences.map(async (reference) => {
        const database = (await notion.databases.retrieve({ database_id: reference.id })) as any
        const databaseTitle =
          (database.title || []).map((item: { plain_text?: string }) => item.plain_text || '').join('') ||
          reference.title ||
          '매장 현황'
        const pages = await queryAllPages(notion, reference.id)
        const rows = await Promise.all(pages.map(async (page) => {
          const properties = (page.properties || {}) as Record<string, NotionProperty>
          const resolvedProperties = Object.fromEntries(
            (await Promise.all(
              Object.entries(properties).map(async ([name, property]) => [
                name,
                await resolvedPropertyText(notion, property, relationTitleCache),
              ] as const)
            )).filter(([, value]) => Boolean(value))
          )
          return {
            id: page.id,
            title: pageTitle(properties),
            storeName: pickResolvedValue(resolvedProperties, ['매장명', '매장', '지점']),
            status: pickResolvedValue(resolvedProperties, ['보고상태', '발행상태', '운영상태', '상태', '진행', 'status']),
            date: pickResolvedValue(resolvedProperties, ['온보딩시작', '보고일', '발행일', '작업일', '날짜', '기준일', '작성일', 'date']),
            period: pickResolvedValue(resolvedProperties, ['계약기간', '작업기간', '기간', '주차', '월', 'period']),
            owner: pickResolvedValue(resolvedProperties, ['담당자', '담당', '작성자', 'owner']),
            category: pickResolvedValue(resolvedProperties, ['업종', '업무구분', '보고구분', '구분', '유형', '종류']),
            channel: pickResolvedValue(resolvedProperties, ['발행채널', '채널', '매체', '플랫폼']),
            memo: pickResolvedValue(resolvedProperties, ['보고내용', '작업내용', '내용', '메모', '비고']),
            region: pickResolvedValue(resolvedProperties, ['지역', '상권']),
            languages: pickResolvedValue(resolvedProperties, ['운영언어', '언어']),
            keyword: pickResolvedValue(resolvedProperties, ['메인공략키워드', '공략키워드', '키워드']),
            cadence: pickResolvedValue(resolvedProperties, ['소식글주기', '발행주기', '주기']),
            publishedUrl: pickResolvedValue(resolvedProperties, ['발행URL', '게시URL']),
            url: page.url || '',
            properties: resolvedProperties,
          }
        }))

        return {
          id: reference.id,
          title: databaseTitle,
          kind: databaseKind(databaseTitle),
          rows,
        }
      })
    )
    const databases = discoveredDatabases.filter((database) => database.kind !== 'other')

    return NextResponse.json({
      connected: true,
      pageUrl,
      databases,
      message:
        databases.length === 2
          ? '매장 마스터와 발행·보고 로그를 불러왔습니다.'
          : `대상 데이터베이스 ${databases.length}/2개를 찾았습니다. 표 이름을 확인해주세요.`,
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
