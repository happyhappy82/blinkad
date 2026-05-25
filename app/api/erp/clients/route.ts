import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DEFAULT_DATABASE_ID = '18f451110c9945d997de4ce4fd86d074'
const TITLE_PROPERTY = '고객명'
const CLIENT_DATABASE_SEARCH_QUERY = '통합 문의 관리 DB'
const STATUS_PROPERTY_CANDIDATES = ['처리상태', '상태', '계약완료', 'Status']
const FALLBACK_STATUS_OPTIONS = [
  '신규 문의',
  '접촉중',
  '미팅일정 확정',
  '견적서 송부/팔로업 지속',
  '공동 대응',
  '계약대기',
  '계약 완료',
  '답변 완료',
  '취소/팔로업 중지',
]

const fallbackStores = [
  {
    id: 'sample-1',
    name: '미플러스치과 신사',
    category: '병원',
    status: '신규 문의',
    contact: '연락처 확인 필요',
    owner: '블링크애드',
    googleMapUrl: '',
    quoteCount: 0,
    diagnosisCount: 1,
    contractCount: 0,
    contractStatus: '계약 전',
    contractUrl: '',
    reportStatus: '리포트 대기',
    profileStatus: '프로필 확인 필요',
    lastEdited: '',
    notionUrl: '',
  },
  {
    id: 'sample-2',
    name: '월하동',
    category: '요식업',
    status: '견적서 송부/팔로업 지속',
    contact: '연락처 확인 필요',
    owner: '블링크애드',
    googleMapUrl: '',
    quoteCount: 1,
    diagnosisCount: 1,
    contractCount: 0,
    contractStatus: '계약대기',
    contractUrl: '',
    reportStatus: '월간 리포트 미작성',
    profileStatus: '사진·메뉴판 정비 필요',
    lastEdited: '',
    notionUrl: '',
  },
  {
    id: 'sample-3',
    name: '대게특별시',
    category: '요식업',
    status: '공동대응',
    contact: '연락처 확인 필요',
    owner: '권순현',
    googleMapUrl: '',
    quoteCount: 1,
    diagnosisCount: 1,
    contractCount: 1,
    contractStatus: '전자계약 발송 전',
    contractUrl: '',
    reportStatus: '보고 대상 아님',
    profileStatus: 'Google 프로필 운영 전',
    lastEdited: '',
    notionUrl: '',
  },
  {
    id: 'sample-4',
    name: '주하(데이즈 후카 바)',
    category: '로컬 매장',
    status: '운영시작',
    contact: '연락처 확인 필요',
    owner: '블링크애드',
    googleMapUrl: '',
    quoteCount: 1,
    diagnosisCount: 0,
    contractCount: 1,
    contractStatus: '계약완료',
    contractUrl: '',
    reportStatus: '첫 리포트 준비 중',
    profileStatus: '게시물 운영 대기',
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
  if (prop.type === 'multi_select') return prop.multi_select?.map((item: any) => item.name).join(', ') || ''
  if (prop.type === 'phone_number') return prop.phone_number || ''
  if (prop.type === 'email') return prop.email || ''
  if (prop.type === 'url') return prop.url || ''
  if (prop.type === 'date') return prop.date?.start || ''
  if (prop.type === 'number') return String(prop.number ?? '')
  if (prop.type === 'last_edited_time') return prop.last_edited_time || ''
  if (prop.type === 'created_time') return prop.created_time || ''
  return ''
}

function fileCount(prop: any): number {
  if (!prop || prop.type !== 'files') return 0
  return prop.files?.length || 0
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

function findPropertyName(properties: Record<string, any>, candidates: string[]) {
  for (const name of candidates) {
    if (properties[name]) return name
  }

  const entries = Object.entries(properties)
  const match = entries.find(([name]) =>
    candidates.some((candidate) => name.toLowerCase().includes(candidate.toLowerCase()))
  )
  return match?.[0] || ''
}

function statusOptionsFromSchema(properties: Record<string, any>) {
  const statusPropertyName = findPropertyName(properties, STATUS_PROPERTY_CANDIDATES)
  const statusProperty = statusPropertyName ? properties[statusPropertyName] : undefined
  const options =
    statusProperty?.type === 'status'
      ? statusProperty.status?.options
      : statusProperty?.type === 'select'
        ? statusProperty.select?.options
        : []

  return Array.isArray(options) && options.length
    ? options.map((option: any) => option.name).filter(Boolean)
    : FALLBACK_STATUS_OPTIONS
}

function statusPropertyValue(propertySchema: any, status: string) {
  if (!propertySchema) return undefined
  if (propertySchema.type === 'status') return { status: { name: status } }
  if (propertySchema.type === 'select') return { select: { name: status } }
  if (propertySchema.type === 'rich_text') return { rich_text: [{ text: { content: status } }] }
  if (propertySchema.type === 'title') return { title: [{ text: { content: status } }] }
  return undefined
}

function pickGoogleMapUrl(properties: Record<string, any>) {
  const direct = findProperty(properties, [
    '구글맵링크',
    '구글맵 링크',
    '구글 지도 링크',
    'Google Map',
    'Google Maps',
    '지도링크',
  ])
  const directText = propText(direct)
  if (directText) return directText

  for (const [name, prop] of Object.entries(properties)) {
    const lowerName = name.toLowerCase()
    if ((name.includes('구글') || lowerName.includes('google')) && (name.includes('맵') || name.includes('지도') || lowerName.includes('map'))) {
      const value = propText(prop)
      if (value) return value
    }
  }
  return ''
}

function pickContractUrl(properties: Record<string, any>) {
  const direct = findProperty(properties, [
    '전자계약 링크',
    '전자계약',
    '계약서 링크',
    '계약 링크',
    'Contract URL',
    'Contract Link',
  ])
  const directText = propText(direct)
  if (directText) return directText

  for (const [name, prop] of Object.entries(properties)) {
    const lowerName = name.toLowerCase()
    if ((name.includes('계약') || lowerName.includes('contract')) && (name.includes('링크') || lowerName.includes('url') || lowerName.includes('link'))) {
      const value = propText(prop)
      if (value) return value
    }
  }
  return ''
}

function normalizePage(page: any) {
  const properties = page.properties || {}
  const status =
    propText(findProperty(properties, ['처리상태', '상태', '계약완료', 'Status'])) ||
    (fileCount(properties['견적서']) > 0 ? '견적서' : '문의접수')

  return {
    id: page.id,
    name: propText(properties[TITLE_PROPERTY]) || '이름 없음',
    category: propText(findProperty(properties, ['업종', '카테고리', '분류', 'Category'])),
    status,
    contact: propText(findProperty(properties, ['연락처', '전화번호', 'Phone', 'Contact'])),
    owner: propText(findProperty(properties, ['담당자', '담당', '작성', 'Owner'])) || '블링크애드',
    googleMapUrl: pickGoogleMapUrl(properties),
    quoteCount: fileCount(properties['견적서']),
    diagnosisCount: fileCount(properties['분석자료']),
    contractCount: fileCount(findProperty(properties, ['계약서', '계약 파일', 'Contract'])),
    contractStatus: propText(findProperty(properties, ['계약상태', '계약 상태', '전자계약 상태', 'Contract Status'])) || '계약 전',
    contractUrl: pickContractUrl(properties),
    reportStatus: propText(findProperty(properties, ['리포트', '보고현황', '보고 상태'])) || '리포트 대기',
    profileStatus: propText(findProperty(properties, ['프로필 현황', '프로필상태', '운영상태'])) || '프로필 확인 필요',
    lastEdited: propText(properties['last_edited_time']) || page.last_edited_time || '',
    notionUrl: page.url || '',
  }
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
        // The shared dashboard can contain linked DB blocks that are visible as
        // blocks but whose data source is not shared with the integration.
      }
    }

    return findClientDatabaseBySearch(notion, error)
  }
}

async function findClientDatabaseBySearch(notion: Client, cause?: unknown) {
  const response = await notion.search({
    query: CLIENT_DATABASE_SEARCH_QUERY,
    filter: { property: 'object', value: 'database' },
    page_size: 10,
  })
  const database = response.results.find((result: any) =>
    (result.title || []).some((text: any) => text.plain_text?.includes('통합 문의 관리 DB'))
  ) || response.results[0]

  if (database?.id) return database.id

  const detail = cause instanceof Error ? ` 원인: ${cause.message}` : ''
  throw new Error(`문의관리 DB를 찾지 못했습니다.${detail}`)
}

export async function GET() {
  const token = resolveNotionToken()
  const databaseId = process.env.BLINKAD_NOTION_DATABASE_ID || DEFAULT_DATABASE_ID

  if (!token) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: 'NOTION_TOKEN 또는 NOTION_API_KEY가 없어 샘플 데이터로 표시 중입니다.',
      statusOptions: FALLBACK_STATUS_OPTIONS,
      stores: fallbackStores,
    })
  }

  try {
    const notion = new Client({ auth: token })
    const resolvedDatabaseId = await resolveClientDatabaseId(notion, databaseId)
    const database = await notion.databases.retrieve({ database_id: resolvedDatabaseId })
    const schema = (database as any).properties || {}
    const response = await notion.databases.query({
      database_id: resolvedDatabaseId,
      page_size: 100,
    })

    return NextResponse.json({
      source: 'notion',
      connected: true,
      statusOptions: statusOptionsFromSchema(schema),
      stores: response.results.map(normalizePage),
    })
  } catch (error) {
    return NextResponse.json(
      {
        source: 'fallback',
        connected: false,
        message: error instanceof Error ? error.message : 'Notion DB 연결에 실패했습니다.',
        statusOptions: FALLBACK_STATUS_OPTIONS,
        stores: fallbackStores,
      },
      { status: 200 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const token = resolveNotionToken()
  const databaseId = process.env.BLINKAD_NOTION_DATABASE_ID || DEFAULT_DATABASE_ID
  const body = await request.json()
  const pageId = String(body.pageId || '').trim()
  const status = String(body.status || '').trim()

  if (!token || !pageId || !status) {
    return NextResponse.json(
      {
        connected: false,
        message: 'Notion 토큰, 페이지 ID, 상태값이 필요합니다.',
      },
      { status: 400 }
    )
  }

  try {
    const notion = new Client({ auth: token })
    const resolvedDatabaseId = await resolveClientDatabaseId(notion, databaseId)
    const database = await notion.databases.retrieve({ database_id: resolvedDatabaseId })
    const schema = (database as any).properties || {}
    const statusPropertyName = findPropertyName(schema, STATUS_PROPERTY_CANDIDATES)
    const value = statusPropertyValue(statusPropertyName ? schema[statusPropertyName] : undefined, status)

    if (!statusPropertyName || !value) {
      return NextResponse.json(
        {
          connected: false,
          message: '수정 가능한 상태 속성을 찾지 못했습니다.',
        },
        { status: 400 }
      )
    }

    await notion.pages.update({
      page_id: pageId,
      properties: {
        [statusPropertyName]: value,
      },
    })

    return NextResponse.json({
      connected: true,
      message: `상태를 ${status}(으)로 변경했습니다.`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        message: error instanceof Error ? error.message : 'Notion 상태 변경에 실패했습니다.',
      },
      { status: 500 }
    )
  }
}
