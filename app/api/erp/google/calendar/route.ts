import { NextResponse } from 'next/server'
import { getCalendarAuth } from '@/lib/erp-google-calendar-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type GoogleCalendarEvent = {
  id?: string
  summary?: string
  description?: string
  location?: string
  status?: string
  colorId?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  attendees?: { email?: string; displayName?: string }[]
}

type GoogleCalendarListEntry = {
  id?: string
  summary?: string
  backgroundColor?: string
  foregroundColor?: string
  primary?: boolean
  accessRole?: string
}

type CalendarRequestBody = {
  id?: string
  memberId?: string
  title?: string
  start?: string
  end?: string
  type?: string
  location?: string
  memo?: string
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
    calendarId: 'team-sample',
    calendarName: '용올캘린더',
    calendarColor: '#0b57d0',
    calendarForegroundColor: '#ffffff',
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
    calendarId: 'team-sample',
    calendarName: '용올캘린더',
    calendarColor: '#0b57d0',
    calendarForegroundColor: '#ffffff',
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
    calendarId: 'team-sample',
    calendarName: '용올캘린더',
    calendarColor: '#0b57d0',
    calendarForegroundColor: '#ffffff',
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
    calendarId: 'team-sample',
    calendarName: '용올캘린더',
    calendarColor: '#0b57d0',
    calendarForegroundColor: '#ffffff',
  },
] as const

function classifyEvent(event: GoogleCalendarEvent) {
  const text = `${event.summary || ''} ${event.description || ''}`.toLowerCase()
  if (text.includes('미팅') || text.includes('회의') || text.includes('상담') || text.includes('meet')) return 'meeting'
  if (text.includes('마감') || text.includes('제출') || text.includes('입금') || text.includes('deadline')) return 'deadline'
  if (text.includes('할일') || text.includes('작업') || text.includes('task')) return 'task'
  return 'operation'
}

function normalizeCalendarName(value: string) {
  return value.replace(/\s+/g, '').toLowerCase()
}

function targetTeamCalendarName() {
  return process.env.GOOGLE_CALENDAR_TEAM_NAME || process.env.GOOGLE_TEAM_CALENDAR_NAME || '용올캘린더'
}

function targetTeamCalendarNameCandidates() {
  const targetName = targetTeamCalendarName()
  const names = new Set([targetName, targetName.replace(/캘린더$/i, ''), targetName.replace(/calendar$/i, '')])
  return Array.from(names).map(normalizeCalendarName).filter(Boolean)
}

async function fetchCalendarList(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?showDeleted=false&maxResults=250', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Google Calendar list API ${response.status}`)
  }

  const data = (await response.json()) as { items?: GoogleCalendarListEntry[] }
  return data.items || []
}

async function resolveTeamCalendar(accessToken: string, storedCalendarId: string) {
  const calendars = await fetchCalendarList(accessToken)
  const configuredCalendarId = process.env.GOOGLE_CALENDAR_ID || ''
  const storedTeamCalendarId = storedCalendarId && storedCalendarId !== 'primary' ? storedCalendarId : ''
  const targetId = configuredCalendarId || storedTeamCalendarId
  const normalizedTargetNames = targetTeamCalendarNameCandidates()

  if (targetId) {
    const byId = calendars.find((calendar) => calendar.id === targetId)
    if (byId) return byId
  }

  const exactNameMatch = calendars.find((calendar) => normalizedTargetNames.includes(normalizeCalendarName(calendar.summary || '')))
  if (exactNameMatch) return exactNameMatch

  const partialNameMatch = calendars.find((calendar) => {
    const calendarName = normalizeCalendarName(calendar.summary || '')
    return normalizedTargetNames.some((targetName) => calendarName.includes(targetName) || targetName.includes(calendarName))
  })
  if (partialNameMatch) return partialNameMatch

  return null
}

function calendarMeta(calendar: GoogleCalendarListEntry) {
  return {
    calendarId: calendar.id || '',
    calendarName: calendar.summary || targetTeamCalendarName(),
    calendarColor: calendar.backgroundColor || '#0b57d0',
    calendarForegroundColor: calendar.foregroundColor || '#ffffff',
  }
}

function normalizeEvent(event: GoogleCalendarEvent, calendar?: GoogleCalendarListEntry) {
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
    ...(calendar ? calendarMeta(calendar) : {}),
  }
}

function normalizeCreatedEvent(event: GoogleCalendarEvent, calendar?: GoogleCalendarListEntry) {
  return normalizeEvent(event, calendar)
}

function googleEventBody(body: CalendarRequestBody) {
  return {
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
  }
}

function localEventFromBody(body: CalendarRequestBody, id = `local-${Date.now()}`) {
  return {
    id,
    title: body.title || '제목 없는 일정',
    start: body.start || new Date().toISOString(),
    end: body.end || body.start || new Date().toISOString(),
    type: body.type || 'operation',
    location: body.location || '',
    attendees: [],
    status: 'local-only',
    memo: body.memo || '',
    source: 'sample',
    calendarId: 'team-local',
    calendarName: targetTeamCalendarName(),
    calendarColor: '#0b57d0',
    calendarForegroundColor: '#ffffff',
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const auth = await getCalendarAuth(url.searchParams.get('memberId') || 'owner')
  const { accessToken, calendarId } = auth

  if (!accessToken) {
    return NextResponse.json({
      source: 'sample',
      connected: false,
      message: 'Google Calendar OAuth 연결 또는 서버 토큰이 없어 샘플 일정으로 표시 중입니다.',
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
    const teamCalendar = await resolveTeamCalendar(accessToken, calendarId)

    if (!teamCalendar?.id) {
      return NextResponse.json({
        source: 'google',
        connected: true,
        authSource: auth.source,
        memberId: auth.memberId,
        message: `팀 공유 캘린더 "${targetTeamCalendarName()}"를 찾지 못해 개인 일정을 표시하지 않습니다.`,
        selectedCalendar: null,
        events: [],
      })
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(teamCalendar.id)}/events?${params.toString()}`,
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
      authSource: auth.source,
      memberId: auth.memberId,
      message: `팀 공유 캘린더 "${teamCalendar.summary || teamCalendar.id}" 일정만 표시합니다.`,
      selectedCalendar: calendarMeta(teamCalendar),
      events: (data.items || []).map((event) => normalizeEvent(event, teamCalendar)),
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
  const body = (await request.json().catch(() => ({}))) as CalendarRequestBody
  const auth = await getCalendarAuth(body.memberId || 'owner')
  const { accessToken, calendarId } = auth

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
      message: 'Google Calendar OAuth 연결 또는 쓰기 토큰이 없어 ERP 화면에서만 생성 요청을 확인했습니다. 실제 캘린더 저장은 OAuth 연결 후 가능합니다.',
      event: localEventFromBody(body),
    })
  }

  try {
    const teamCalendar = await resolveTeamCalendar(accessToken, calendarId)

    if (!teamCalendar?.id) {
      return NextResponse.json(
        {
          connected: false,
          message: `팀 공유 캘린더 "${targetTeamCalendarName()}"를 찾지 못해 일정을 추가하지 않았습니다.`,
        },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(teamCalendar.id)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEventBody(body)),
      }
    )

    if (!response.ok) {
      throw new Error(`Google Calendar create API ${response.status}`)
    }

    const event = (await response.json()) as GoogleCalendarEvent

    return NextResponse.json({
      connected: true,
      authSource: auth.source,
      memberId: auth.memberId,
      message: `팀 공유 캘린더 "${teamCalendar.summary || teamCalendar.id}"에 일정이 추가되었습니다.`,
      event: normalizeCreatedEvent(event, teamCalendar),
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

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CalendarRequestBody
  const auth = await getCalendarAuth(body.memberId || 'owner')
  const { accessToken, calendarId } = auth

  if (!body.id || !body.title || !body.start) {
    return NextResponse.json(
      {
        connected: false,
        message: '일정 ID, 일정명, 시작일시는 필수입니다.',
      },
      { status: 400 }
    )
  }

  if (!accessToken) {
    return NextResponse.json({
      connected: false,
      message: 'Google Calendar OAuth 연결 또는 수정 토큰이 없어 ERP 화면에서만 수정 요청을 확인했습니다. 실제 캘린더 수정은 OAuth 연결 후 가능합니다.',
      event: localEventFromBody(body, body.id),
    })
  }

  try {
    const teamCalendar = await resolveTeamCalendar(accessToken, calendarId)

    if (!teamCalendar?.id) {
      return NextResponse.json(
        {
          connected: false,
          message: `팀 공유 캘린더 "${targetTeamCalendarName()}"를 찾지 못해 일정을 수정하지 않았습니다.`,
        },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(teamCalendar.id)}/events/${encodeURIComponent(body.id)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEventBody(body)),
      }
    )

    if (!response.ok) {
      throw new Error(`Google Calendar update API ${response.status}`)
    }

    const event = (await response.json()) as GoogleCalendarEvent

    return NextResponse.json({
      connected: true,
      authSource: auth.source,
      memberId: auth.memberId,
      message: `팀 공유 캘린더 "${teamCalendar.summary || teamCalendar.id}" 일정이 수정되었습니다.`,
      event: normalizeCreatedEvent(event, teamCalendar),
    })
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        message: error instanceof Error ? error.message : 'Google Calendar 일정 수정에 실패했습니다.',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: string; memberId?: string }
  const auth = await getCalendarAuth(body.memberId || 'owner')
  const { accessToken, calendarId } = auth

  if (!body.id) {
    return NextResponse.json(
      {
        connected: false,
        message: '삭제할 일정 ID가 필요합니다.',
      },
      { status: 400 }
    )
  }

  if (!accessToken) {
    return NextResponse.json({
      connected: false,
      message: 'Google Calendar OAuth 연결 또는 삭제 토큰이 없어 ERP 화면에서만 삭제 처리했습니다. 실제 캘린더 삭제는 OAuth 연결 후 가능합니다.',
    })
  }

  try {
    const teamCalendar = await resolveTeamCalendar(accessToken, calendarId)

    if (!teamCalendar?.id) {
      return NextResponse.json(
        {
          connected: false,
          message: `팀 공유 캘린더 "${targetTeamCalendarName()}"를 찾지 못해 일정을 삭제하지 않았습니다.`,
        },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(teamCalendar.id)}/events/${encodeURIComponent(body.id)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Google Calendar delete API ${response.status}`)
    }

    return NextResponse.json({
      connected: true,
      authSource: auth.source,
      memberId: auth.memberId,
      message: `팀 공유 캘린더 "${teamCalendar.summary || teamCalendar.id}" 일정이 삭제되었습니다.`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        message: error instanceof Error ? error.message : 'Google Calendar 일정 삭제에 실패했습니다.',
      },
      { status: 500 }
    )
  }
}
