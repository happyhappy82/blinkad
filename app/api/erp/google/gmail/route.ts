import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type GmailMessageListItem = {
  id: string
  threadId: string
}

type GmailMessage = {
  id: string
  snippet?: string
  internalDate?: string
  labelIds?: string[]
  payload?: {
    headers?: { name: string; value: string }[]
  }
}

function isoAt(offsetDays: number, hour: number, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

const sampleMails = [
  {
    id: 'sample-mail-1',
    from: '미스터버거 대표 <owner@example.com>',
    subject: '구글 프로필 최적화 세팅 견적서 문의',
    snippet: '보내주신 견적서 확인했습니다. 세부 작업내역 중 다국어 메뉴판 세팅 범위를 추가로 확인하고 싶습니다.',
    receivedAt: isoAt(0, 9, 18),
    unread: true,
    source: 'sample',
  },
  {
    id: 'sample-mail-2',
    from: '미플러스치과 신사 <clinic@example.com>',
    subject: 'Google 프로필 관리 필요 자료 전달드립니다',
    snippet: '병원 내부 사진과 진료 항목 자료를 먼저 전달드립니다. 방송 출연 자료는 추가로 정리해서 보내겠습니다.',
    receivedAt: isoAt(-1, 16, 42),
    unread: false,
    source: 'sample',
  },
  {
    id: 'sample-mail-3',
    from: '월하동 <contact@example.com>',
    subject: '메뉴판 사진과 대표 사진 관련 문의',
    snippet: '외국인 고객용 메뉴 설명을 어떤 방식으로 정리하면 좋을지 확인 부탁드립니다.',
    receivedAt: isoAt(-3, 11, 5),
    unread: true,
    source: 'sample',
  },
] as const

function token() {
  return process.env.GMAIL_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.GOOGLE_ACCESS_TOKEN || ''
}

function header(message: GmailMessage, name: string) {
  return message.payload?.headers?.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value || ''
}

function normalizeMail(message: GmailMessage) {
  const internalDate = message.internalDate ? Number(message.internalDate) : 0
  const headerDate = header(message, 'Date')
  const parsedHeaderDate = headerDate ? new Date(headerDate).getTime() : 0

  return {
    id: message.id,
    from: header(message, 'From') || '발신자 없음',
    subject: header(message, 'Subject') || '제목 없음',
    snippet: message.snippet || '',
    receivedAt: new Date(internalDate || parsedHeaderDate || Date.now()).toISOString(),
    unread: message.labelIds?.includes('UNREAD') || false,
    source: 'gmail',
  }
}

async function fetchMessage(accessToken: string, id: string) {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error(`Gmail message API ${response.status}`)
  }

  return (await response.json()) as GmailMessage
}

export async function GET() {
  const accessToken = token()

  if (!accessToken) {
    return NextResponse.json({
      source: 'sample',
      connected: false,
      message: 'GMAIL_ACCESS_TOKEN 또는 GOOGLE_OAUTH_ACCESS_TOKEN이 없어 샘플 메일로 표시 중입니다.',
      mails: sampleMails,
    })
  }

  try {
    const listResponse = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=12&q=in%3Ainbox%20newer_than%3A30d',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      }
    )

    if (!listResponse.ok) {
      throw new Error(`Gmail list API ${listResponse.status}`)
    }

    const listData = (await listResponse.json()) as { messages?: GmailMessageListItem[] }
    const messages = await Promise.all((listData.messages || []).map((item) => fetchMessage(accessToken, item.id)))

    return NextResponse.json({
      source: 'gmail',
      connected: true,
      mails: messages.map(normalizeMail),
    })
  } catch (error) {
    return NextResponse.json({
      source: 'sample',
      connected: false,
      message: error instanceof Error ? `${error.message} 오류로 샘플 메일로 표시 중입니다.` : 'Gmail 연결 실패로 샘플 메일로 표시 중입니다.',
      mails: sampleMails,
    })
  }
}
