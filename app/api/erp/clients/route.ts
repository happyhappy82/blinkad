import { Client } from '@notionhq/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DEFAULT_DATABASE_ID = '18f45111-0c99-45d9-97de-4ce4fd86d074'
const TITLE_PROPERTY = '고객명'

const fallbackStores = [
  {
    id: 'sample-1',
    name: '미플러스치과 신사',
    category: '병원',
    status: '진단완료',
    contact: '연락처 확인 필요',
    owner: '블링크애드',
    googleMapUrl: '',
    quoteCount: 0,
    diagnosisCount: 1,
    reportStatus: '리포트 대기',
    profileStatus: '프로필 확인 필요',
    lastEdited: '',
    notionUrl: '',
  },
  {
    id: 'sample-2',
    name: '월하동',
    category: '요식업',
    status: '견적서',
    contact: '연락처 확인 필요',
    owner: '블링크애드',
    googleMapUrl: '',
    quoteCount: 1,
    diagnosisCount: 1,
    reportStatus: '월간 리포트 미작성',
    profileStatus: '사진·메뉴판 정비 필요',
    lastEdited: '',
    notionUrl: '',
  },
  {
    id: 'sample-3',
    name: '대게특별시',
    category: '요식업',
    status: '계약대기',
    contact: '연락처 확인 필요',
    owner: '권순현',
    googleMapUrl: '',
    quoteCount: 1,
    diagnosisCount: 1,
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

function normalizePage(page: any) {
  const properties = page.properties || {}
  const status =
    propText(findProperty(properties, ['처리상태', '상태', 'Status'])) ||
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
    reportStatus: propText(findProperty(properties, ['리포트', '보고현황', '보고 상태'])) || '리포트 대기',
    profileStatus: propText(findProperty(properties, ['프로필 현황', '프로필상태', '운영상태'])) || '프로필 확인 필요',
    lastEdited: propText(properties['last_edited_time']) || page.last_edited_time || '',
    notionUrl: page.url || '',
  }
}

export async function GET() {
  const token = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
  const databaseId = process.env.BLINKAD_NOTION_DATABASE_ID || DEFAULT_DATABASE_ID

  if (!token) {
    return NextResponse.json({
      source: 'fallback',
      connected: false,
      message: 'NOTION_TOKEN 또는 NOTION_API_KEY가 없어 샘플 데이터로 표시 중입니다.',
      stores: fallbackStores,
    })
  }

  try {
    const notion = new Client({ auth: token })
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
    })

    return NextResponse.json({
      source: 'notion',
      connected: true,
      stores: response.results.map(normalizePage),
    })
  } catch (error) {
    return NextResponse.json(
      {
        source: 'fallback',
        connected: false,
        message: error instanceof Error ? error.message : 'Notion DB 연결에 실패했습니다.',
        stores: fallbackStores,
      },
      { status: 200 }
    )
  }
}
