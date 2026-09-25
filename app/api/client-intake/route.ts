import { Client } from '@notionhq/client'
import { NextRequest, NextResponse } from 'next/server'

import { getClientIntakeStoreName } from '@/app/client-intake/stores'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DEFAULT_DATABASE_ID = '3e6753eb-c013-8150-b9f3-c05ad6cf00a0'
const PRIVACY_NOTICE_VERSION = '2026-09-25-v1'
const MAX_REQUEST_LENGTH = 220_000
const MAX_VALUE_LENGTH = 6_000

type IntakePayload = Record<string, unknown>

const sections: Array<{ title: string; fields: Array<[string, string]> }> = [
  {
    title: '1. 매장명',
    fields: [['businessName', '매장명']],
  },
  {
    title: '2. 브랜딩 목표',
    fields: [
      ['desiredIdentity', '원하는 브랜드 이미지'], ['associationKeywords', '브랜드 연상 키워드'],
      ['priorityServices', '가장 자신 있는 상품·서비스'], ['differentiators', '선택 이유·차별점'],
      ['competitorNames', '비교 경쟁업체·대안'], ['excludedExpressions', '금지·제외 표현'],
    ],
  },
  {
    title: '3. 핵심 상품과 고객',
    fields: [
      ['revenueProducts', '현재 매출 비중이 높은 상품·서비스'], ['growProducts', '판매를 늘리고 싶은 상품·서비스'],
      ['priceRange', '대표 가격·가격대'], ['averageTicket', '평균 객단가'], ['targetCustomers', '목표 고객'],
      ['visitSituations', '주요 방문 상황'], ['targetRegions', '중점 지역·상권'],
      ['targetCountriesLanguages', '목표 국가·언어'], ['difficultCustomers', '수용이 어려운 고객·상황'],
    ],
  },
  {
    title: '4. 고객이 실제로 묻는 질문',
    fields: [
      ['frequentQuestions', '자주 받는 질문'], ['purchaseConcerns', '구매·예약 전 걱정'],
      ['comparisonQuestions', '비교 질문'], ['priceQuestions', '가격 질문'], ['accessQuestions', '방문·예약 질문'],
      ['cancellationReasons', '망설임·취소 이유'], ['misinformation', '잘못 알려진 정보·오해'],
    ],
  },
  {
    title: '5. 업체 고유 경험',
    fields: [
      ['originStory', '창업·개원 계기'], ['operatingHistory', '운영 이력'], ['uniqueProcess', '고유 운영·서비스 방식'],
      ['qualityStandards', '품질 기준'], ['experts', '전문가·전문 분야'], ['firstPartyData', '자체 데이터'],
      ['cases', '공개 가능한 사례'], ['nonPublicInformation', '외부 공개 금지 정보'],
    ],
  },
  {
    title: '6. 경력·수상·활동과 증빙',
    fields: [
      ['awards', '수상·선정·인증'], ['credentials', '면허·자격·경력'], ['associations', '협회·학회 활동'],
      ['mediaActivities', '언론·방송·기고·강연'], ['partnerships', '파트너십·협업·입점'], ['evidenceUrls', '공식 확인 URL'],
    ],
  },
  {
    title: '7. 방문·예약과 외국인 응대',
    fields: [
      ['openingHours', '영업시간·휴무'], ['reservationPolicy', '예약·단체 이용 조건'], ['accessParking', '교통·주차·접근성'],
      ['paymentMethods', '결제 수단'], ['supportedLanguages', '응대 가능 언어'], ['foreignCustomerSupport', '외국인 별도 안내'],
      ['messengerChannels', '외국어 예약·문의 채널'], ['cancellationPolicy', '취소·환불·변경 규정'], ['recentChanges', '최근·예정 변경사항'],
    ],
  },
  {
    title: '8. 자료와 확인',
    fields: [
      ['assetTypes', '전달 가능 자료'], ['assetFolderUrl', '자료 공유 폴더'], ['additionalNotes', '추가 전달사항'],
      ['factsConfirmed', '사실 확인'], ['rightsConfirmed', '자료 권리 확인'], ['privacyConfirmed', '개인정보 제외 확인'],
      ['publicUseConfirmed', '콘텐츠 활용 동의'], ['privacyPolicyAgreed', '개인정보 수집·이용 동의'],
    ],
  },
]

const requiredFields = [
  'businessName', 'desiredIdentity', 'associationKeywords', 'priorityServices', 'growProducts',
  'targetCustomers', 'frequentQuestions', 'uniqueProcess',
]

const requiredConfirmations = [
  'factsConfirmed', 'rightsConfirmed', 'privacyConfirmed', 'publicUseConfirmed', 'privacyPolicyAgreed',
]

function textValue(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item)).join(', ').slice(0, MAX_VALUE_LENGTH)
  if (typeof value === 'boolean') return value ? '확인·동의함' : '확인하지 않음'
  if (value == null) return ''
  return String(value).trim().slice(0, MAX_VALUE_LENGTH)
}

function richText(content: string, bold = false) {
  return {
    type: 'text' as const,
    text: { content },
    annotations: { bold },
  }
}

function headingBlock(content: string) {
  return {
    object: 'block' as const,
    type: 'heading_2' as const,
    heading_2: { rich_text: [richText(content)] },
  }
}

function paragraphBlocks(label: string, value: string) {
  const chunks = value.match(/[\s\S]{1,1800}/g) || ['']
  return chunks.map((chunk, index) => ({
    object: 'block' as const,
    type: 'paragraph' as const,
    paragraph: {
      rich_text: index === 0 ? [richText(`${label}: `, true), richText(chunk)] : [richText(chunk)],
    },
  }))
}

function validUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? value : null
  } catch {
    return null
  }
}

function makeSubmissionId() {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date()).replaceAll('-', '')
  return `BA-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_REQUEST_LENGTH) {
    return NextResponse.json({ ok: false, message: '입력 내용이 너무 큽니다. 자료 파일은 공유 폴더 링크로 전달해 주세요.' }, { status: 413 })
  }

  let payload: IntakePayload
  try {
    payload = (await request.json()) as IntakePayload
  } catch {
    return NextResponse.json({ ok: false, message: '입력 형식을 확인해 주세요.' }, { status: 400 })
  }

  if (textValue(payload.website)) {
    return NextResponse.json({ ok: true, submissionId: 'RECEIVED' })
  }

  const storeKey = textValue(payload.storeKey)
  const lockedStoreName = storeKey ? getClientIntakeStoreName(storeKey) : undefined
  if (storeKey && !lockedStoreName) {
    return NextResponse.json({ ok: false, message: '유효하지 않은 매장 전용 링크입니다.' }, { status: 400 })
  }
  const normalizedPayload: IntakePayload = {
    ...payload,
    businessName: lockedStoreName || textValue(payload.businessName),
  }

  const missing = requiredFields.filter((field) => !textValue(normalizedPayload[field]))
  const missingConfirmations = requiredConfirmations.filter((field) => normalizedPayload[field] !== true)
  if (missing.length || missingConfirmations.length) {
    return NextResponse.json({ ok: false, message: '필수 항목과 제출 전 확인란을 다시 확인해 주세요.' }, { status: 400 })
  }

  const token = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
  const databaseId = process.env.BLINKAD_INTAKE_DATABASE_ID || DEFAULT_DATABASE_ID
  if (!token) {
    return NextResponse.json({ ok: false, message: '접수 시스템 연결을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.' }, { status: 503 })
  }

  const notion = new Client({ auth: token })
  const submissionId = makeSubmissionId()
  const submittedAt = new Date().toISOString()
  const businessName = textValue(normalizedPayload.businessName)
  const title = `${businessName} — ${submissionId}`.slice(0, 200)
  const folderUrl = validUrl(textValue(payload.assetFolderUrl))

  try {
    const page = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        '매장명': { title: [{ text: { content: title } }] },
        '제출일': { date: { start: submittedAt } },
        '접수 상태': { select: { name: '신규 접수' } },
        '자료 폴더': { url: folderUrl },
        '외부 공개 승인': { checkbox: payload.publicUseConfirmed === true },
        '제출 ID': { rich_text: [{ text: { content: submissionId } }] },
        '동의문 버전': { rich_text: [{ text: { content: PRIVACY_NOTICE_VERSION } }] },
        '전용 링크 키': { rich_text: storeKey ? [{ text: { content: storeKey } }] : [] },
        '출처': { select: { name: '웹 입력 Form' } },
      },
    })

    const blocks: any[] = [
      {
        object: 'block',
        type: 'callout',
        callout: {
          icon: { type: 'emoji', emoji: '📥' },
          rich_text: [richText(`웹 입력 Form 접수 · ${submittedAt} · ${submissionId} · 개인정보 동의문 ${PRIVACY_NOTICE_VERSION}`)],
          color: 'blue_background',
        },
      },
    ]

    for (const section of sections) {
      const populated = section.fields
        .map(([key, label]) => ({ label, value: textValue(normalizedPayload[key]) }))
        .filter((item) => item.value)
      if (!populated.length) continue
      blocks.push(headingBlock(section.title))
      for (const item of populated) blocks.push(...paragraphBlocks(item.label, item.value))
    }

    for (let index = 0; index < blocks.length; index += 100) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: blocks.slice(index, index + 100),
      })
    }

    return NextResponse.json({ ok: true, submissionId })
  } catch (error) {
    console.error('client-intake submission failed', error)
    return NextResponse.json({ ok: false, message: '자료 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 500 })
  }
}
