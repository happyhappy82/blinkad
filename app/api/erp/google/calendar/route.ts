import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type GoogleCalendarEvent = {
  id?: string
  summary?: string
  description?: string
  location?: string
  status?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  attendees?: { email?: string; displayName?: string }[]
}

function isoAt(offsetDays: number, hour: number, minute = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

const sampleEvents = [
  {
    id: 'sample-meeting-1',
    title: '역대짬뽕 제안 미팅',
    start: isoAt(-2, 11),
    end: isoAt(-2, 12),
    type: 'meeting',
    location: '오프라인 미팅',
    attendees: ['권순현', '역대짬뽕 대표'],
    status: 'confirmed',
    memo: 'Google 프로필과 지점별 웹페이지 연결 전략 설명',
    source: 'sample',
  },
  {
    id: 'sample-meeting-2',
    title: '미플러스치과 신사 GBP 상담',
    start: isoAt(1, 14, 30),
    end: isoAt(1, 15, 30),
    type: 'meeting',
    location: 'Google Meet',
    attendees: ['블링크애드', '미플러스치과'],
    status: 'confirmed',
    memo: '병원 사진 자료와 진료 항목 정리 범위 확인',
    source: 'sample',
  },
  {
    id: 'sample-deadline-1',
    title: '월하동 사진·메뉴판 자료 마감',
    start: isoAt(3, 18),
    end: isoAt(3, 18, 30),
    type: 'deadline',
    location: '',
    attendees: ['블링크애드'],
    status: 'confirmed',
    memo: '대표 사진, 외부 사진, 메뉴판 원본 수집',
    source: 'sample',
  },
  {
    id: 'sample-operation-1',
    title: '미스터버거 프로필 최적화 세팅',
    start: isoAt(5, 10),
    end: isoAt(5, 12),
    type: 'operation',
    location: 'BlinkAd',
    attendees: ['권순현'],
    status: 'confirmed',
    memo: '키워드 리서치, 카테고리 분석, 다국어 메뉴판 세팅',
    source: 'sample',
  },
] as const

function classifyEvent(event: GoogleCalendarEvent) {
  const text = `${event.summary || ''} ${event.description || ''}`.toLowerCase()
  if (text.includes('미팅') || text.includes('회의') || text.includes('상담') || text.includes('meet')) return 'meeting'
  if (text.includes('마감') || text.includes('제출') || text.includes('입금') || text.includes('deadline')) return 'deadline'
  if (text.includes('할일') || text.includes('작업') || text.includes('task')) return 'task'
  return 'operation'
}

function normalizeEvent(event: GoogleCalendarEvent) {
  const start = event.start?.dateTime || event.start?.date || ''
  const end = event.end?.dateTime || event.end?.date || start

  return {
    id: event.id || `${event.summary}-${start}`,
    title: event.summary || '제목 없는 일정',
    start,
    end,
    type: classifyEvent(event),
    location: event.location || '',
    attendees:
      event.attendees?.map((attendee) => attendee.displayName || attendee.email || '').filter(Boolean) || [],
    status: event.status || 'confirmed',
    memo: event.description || '',
    source: 'google',
  }
}

function normalizeCreatedEvent(event: GoogleCalendarEvent) {
  return normalizeEvent(event)
}

function token() {
  return process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || process.env.GOOGLE_OAUTH_ACCESS_TOKEN || process.env.GOOGLE_ACCESS_TOKEN || ''
}

export async function GET() {
  const accessToken = token()
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

  if (!accessToken) {
    return NextResponse.json({
      source: 'sample',
      connected: false,
      message: 'GOOGLE_CALENDAR_ACCESS_TOKEN 또는 GOOGLE_OAUTH_ACCESS_TOKEN이 없어 샘플 일정으로 표시 중입니다.',
      events: sampleEvents,
    })
  }

  const timeMin = new Date()
  timeMin.setMonth(timeMin.getMonth() - 1)
  const timeMax = new Date()
  timeMax.setMonth(timeMax.getMonth() + 2)

  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '80',
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  })

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`Google Calendar API ${response.status}`)
    }

    const data = (await response.json()) as { items?: GoogleCalendarEvent[] }

    return NextResponse.json({
      source: 'google',
      connected: true,
      events: (data.items || []).map(normalizeEvent),
    })
  } catch (error) {
    return NextResponse.json({
      source: 'sample',
      connected: false,
      message: error instanceof Error ? `${error.message} 오류로 샘플 일정으로 표시 중입니다.` : 'Google Calendar 연결 실패로 샘플 일정으로 표시 중입니다.',
      events: sampleEvents,
    })
  }
}

export async function POST(request: Request) {
  const accessToken = token()
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'
  const body = (await request.json().catch(() => ({}))) as {
    title?: string
    start?: string
    end?: string
    type?: string
    location?: string
    memo?: string
  }

  if (!body.title || !body.start) {
    return NextResponse.json(
      {
        connected: false,
        message: '일정명과 시작일시는 필수입니다.',
      },
      { status: 400 }
    )
  }

  if (!accessToken) {
    return NextResponse.json({
      connected: false,
      message: 'Google Calendar 쓰기 토큰이 없어 ERP 화면에서만 생성 요청을 확인했습니다. 실제 캘린더 저장은 OAuth 연결 후 가능합니다.',
      event: {
        id: `local-${Date.now()}`,
        title: body.title,
        start: body.start,
        end: body.end || body.start,
        type: body.type || 'operation',
        location: body.location || '',
        attendees: [],
        status: 'local-only',
        memo: body.memo || '',
        source: 'sample',
      },
    })
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: body.title,
          description: [body.memo, body.type ? `ERP_TYPE:${body.type}` : ''].filter(Boolean).join('\n'),
          location: body.location || undefined,
          start: {
            dateTime: body.start,
            timeZone: 'Asia/Seoul',
          },
          end: {
            dateTime: body.end || body.start,
            timeZone: 'Asia/Seoul',
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Google Calendar create API ${response.status}`)
    }

    const event = (await response.json()) as GoogleCalendarEvent

    return NextResponse.json({
      connected: true,
      message: 'Google Calendar에 일정이 추가되었습니다.',
      event: normalizeCreatedEvent(event),
    })
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        message: error instanceof Error ? error.message : 'Google Calendar 일정 추가에 실패했습니다.',
      },
      { status: 500 }
    )
  }
}
