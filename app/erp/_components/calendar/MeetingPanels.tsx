'use client'

import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'

import type {
  CalendarEvent,
  MeetingRecord,
  SaveMeetingRecordNoteHandler,
  SaveMeetingNoteHandler,
} from '../../_lib/erp-config'

function formatTimeOnly(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function startOfDay(date: Date) {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return target
}

function formatDateLabel(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(new Date(value))
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function isMeetingEvent(event: CalendarEvent) {
  const text = `${event.title} ${event.memo}`.toLowerCase()
  return event.type === 'meeting' || text.includes('미팅') || text.includes('회의') || text.includes('상담')
}

function eventTypeLabel(type: CalendarEvent['type']) {
  if (type === 'meeting') return '미팅'
  if (type === 'deadline') return '마감'
  if (type === 'task') return '할 일'
  return '운영'
}

function eventTypeClass(type: CalendarEvent['type']) {
  if (type === 'meeting') return 'border-brand-blue/30 bg-brand-blue/15 text-blue-100'
  if (type === 'deadline') return 'border-amber-300/30 bg-amber-300/10 text-amber-100'
  if (type === 'task') return 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
  return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
}

function calendarColor(event: CalendarEvent) {
  return event.calendarColor || (event.source === 'google' ? '#0b57d0' : '')
}

function calendarDotStyle(event: CalendarEvent) {
  const color = calendarColor(event)
  return color ? { backgroundColor: color } : undefined
}

export function MeetingPanel({
  meetings,
  loading,
  message,
  onRefresh,
  onSaveMeetingNote,
}: {
  meetings: MeetingRecord[]
  loading: boolean
  message: string
  onRefresh: () => void
  onSaveMeetingNote: SaveMeetingRecordNoteHandler
}) {
  return (
    <MeetingDatabasePanel
      kicker="Meeting DB"
      title="미팅관리"
      description="용올캘린더의 미팅 일정을 Notion 미팅관리 DB에 동기화하고, DB에 저장된 미팅 내용과 후속 액션을 관리합니다."
      meetings={meetings}
      loading={loading}
      message={message}
      onRefresh={onRefresh}
      onSaveMeetingNote={onSaveMeetingNote}
      emptyLabel="미팅관리 DB에 표시할 미팅이 없습니다."
    />
  )
}

function MeetingDatabasePanel({
  kicker,
  title,
  description,
  meetings,
  loading,
  message,
  onRefresh,
  onSaveMeetingNote,
  emptyLabel,
}: {
  kicker: string
  title: string
  description: string
  meetings: MeetingRecord[]
  loading: boolean
  message: string
  onRefresh: () => void
  onSaveMeetingNote: SaveMeetingRecordNoteHandler
  emptyLabel: string
}) {
  const [meetingNotes, setMeetingNotes] = useState<Record<string, string>>({})
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null)
  const [noteMessages, setNoteMessages] = useState<Record<string, string>>({})
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null)

  const filteredMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const start = new Date(meeting.date)
      const from = filterStart ? startOfDay(parseLocalDate(filterStart)) : null
      const to = filterEnd ? parseLocalDate(filterEnd) : null
      if (to) to.setHours(23, 59, 59, 999)

      return (!from || start >= from) && (!to || start <= to)
    })
  }, [filterEnd, filterStart, meetings])

  const activeMeeting = meetings.find((meeting) => meeting.id === activeMeetingId)
  const activeMeetingNote = activeMeeting ? meetingNotes[activeMeeting.id] ?? activeMeeting.memo ?? '' : ''

  const saveNote = async (meeting: MeetingRecord) => {
    const note = meetingNotes[meeting.id] ?? meeting.memo ?? ''
    setSavingNoteId(meeting.id)
    setNoteMessages((current) => ({ ...current, [meeting.id]: '' }))

    try {
      const message = await onSaveMeetingNote(meeting, note)
      setNoteMessages((current) => ({ ...current, [meeting.id]: message }))
    } catch (error) {
      setNoteMessages((current) => ({
        ...current,
        [meeting.id]: error instanceof Error ? error.message : '미팅 기록 저장 중 오류가 발생했습니다.',
      }))
    } finally {
      setSavingNoteId(null)
    }
  }

  const openNoteModal = (meeting: MeetingRecord) => {
    setMeetingNotes((current) => ({
      ...current,
      [meeting.id]: current[meeting.id] ?? meeting.memo ?? '',
    }))
    setActiveMeetingId(meeting.id)
  }

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold text-brand-blue">{kicker}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">{description}</p>
          {message ? <p className="mt-2 text-xs font-bold text-gray-500">{message}</p> : null}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          캘린더-DB 동기화
        </button>
      </div>

      <div className="grid gap-3 border-b border-white/10 p-5 md:grid-cols-[180px_1fr] md:p-6">
        <div className="rounded-lg border border-white/10 bg-black p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">Filtered / Total</p>
          <p className="mt-3 text-4xl font-black text-white">{filteredMeetings.length}/{meetings.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-black text-gray-500">시작일</span>
                <input
                  type="date"
                  value={filterStart}
                  onChange={(event) => setFilterStart(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#07080b] px-3 text-sm font-bold text-white outline-none focus:border-brand-blue/60"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-gray-500">종료일</span>
                <input
                  type="date"
                  value={filterEnd}
                  onChange={(event) => setFilterEnd(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#07080b] px-3 text-sm font-bold text-white outline-none focus:border-brand-blue/60"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                setFilterStart('')
                setFilterEnd('')
              }}
              className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-3 text-sm font-black text-gray-300 hover:border-white/30 hover:bg-white/5"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        {filteredMeetings.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-black p-5 text-sm font-bold text-gray-500">{emptyLabel}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-black">
            <table className="min-w-[1240px] w-full border-collapse text-left">
              <thead className="bg-white/[0.04]">
                <tr className="text-xs font-black uppercase tracking-[0.12em] text-gray-500">
                  <th className="w-[150px] px-4 py-3">날짜</th>
                  <th className="w-[220px] px-4 py-3">미팅</th>
                  <th className="w-[160px] px-4 py-3">고객사</th>
                  <th className="w-[180px] px-4 py-3">캘린더/장소</th>
                  <th className="w-[160px] px-4 py-3">참석자</th>
                  <th className="px-4 py-3">미팅 내용</th>
                  <th className="w-[120px] px-4 py-3">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredMeetings.map((meeting) => (
                  <tr key={meeting.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="text-sm font-black text-white">{formatDateLabel(meeting.date)}</p>
                      <p className="mt-1 text-xs font-bold text-gray-500">{formatTimeOnly(meeting.date)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-black leading-5 text-white keep-all">{meeting.title}</p>
                      <span className="mt-2 inline-flex rounded-full border border-brand-blue/30 bg-brand-blue/15 px-2 py-1 text-[11px] font-black text-blue-100">
                        {meeting.status || '미팅'}
                      </span>
                      {meeting.notionUrl ? (
                        <a
                          href={meeting.notionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs font-black text-brand-blue hover:text-blue-300"
                        >
                          Notion 열기
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {meeting.clientNotionUrl ? (
                        <a
                          href={meeting.clientNotionUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-black text-gray-200 underline-offset-4 hover:text-white hover:underline keep-all"
                        >
                          {meeting.client || '-'}
                        </a>
                      ) : (
                        <p className="text-sm font-black text-gray-200 keep-all">{meeting.client || '-'}</p>
                      )}
                      {meeting.clientStatus ? (
                        <span className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-black text-gray-400">
                          {meeting.clientStatus}
                        </span>
                      ) : null}
                      {meeting.clientContact ? (
                        <p className="mt-2 text-xs font-semibold text-gray-500">{meeting.clientContact}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {meeting.calendarName ? <p className="text-xs font-black text-gray-400">{meeting.calendarName}</p> : null}
                      {meeting.location ? <p className="mt-2 text-xs font-semibold text-gray-500 keep-all">{meeting.location}</p> : null}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold leading-5 text-gray-500 keep-all">
                        {meeting.attendees.length > 0 ? meeting.attendees.slice(0, 3).join(', ') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openNoteModal(meeting)}
                        className="block min-h-12 w-full rounded-md border border-white/10 bg-[#07080b] px-3 py-2 text-left text-sm font-semibold leading-5 text-gray-300 transition hover:border-brand-blue/50 hover:bg-white/[0.04]"
                      >
                        <span
                          className="keep-all"
                          style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                          }}
                        >
                          {(meetingNotes[meeting.id] ?? meeting.memo) || '미팅 내용을 입력하려면 클릭하세요.'}
                        </span>
                      </button>
                      {noteMessages[meeting.id] ? (
                        <p className="mt-2 text-xs font-bold leading-5 text-gray-500 keep-all">{noteMessages[meeting.id]}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openNoteModal(meeting)}
                        disabled={savingNoteId === meeting.id}
                        className="inline-flex h-9 w-full items-center justify-center rounded-md border border-white/15 px-3 text-xs font-black text-gray-200 transition hover:border-white/30 hover:bg-white/5 disabled:bg-gray-700"
                      >
                        {savingNoteId === meeting.id ? '저장 중' : '열기'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeMeeting ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveMeetingId(null)}
        >
          <div
            className="w-full max-w-3xl rounded-lg border border-white/10 bg-[#0b0d12] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-blue">Meeting Note</p>
                <h3 className="mt-2 text-xl font-black text-white keep-all">{activeMeeting.title}</h3>
                <p className="mt-2 text-sm font-bold text-gray-500">
                  {formatDateLabel(activeMeeting.date)} · {formatTimeOnly(activeMeeting.date)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMeetingId(null)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-white/15 px-3 text-xs font-black text-gray-300 hover:border-white/30 hover:bg-white/5"
              >
                닫기
              </button>
            </div>

            <div className="p-5">
              <textarea
                value={activeMeetingNote}
                onChange={(changeEvent) =>
                  setMeetingNotes((current) => ({ ...current, [activeMeeting.id]: changeEvent.target.value }))
                }
                className="min-h-80 w-full rounded-md border border-white/10 bg-[#07080b] px-4 py-3 text-sm font-semibold leading-6 text-white outline-none focus:border-brand-blue/60"
                placeholder="미팅에서 다룬 내용, 고객 니즈, 제안 포인트, 후속 액션"
              />
              {noteMessages[activeMeeting.id] ? (
                <p className="mt-3 text-xs font-bold leading-5 text-gray-500 keep-all">{noteMessages[activeMeeting.id]}</p>
              ) : null}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMeetingId(null)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-4 text-sm font-black text-gray-300 hover:border-white/30 hover:bg-white/5"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => saveNote(activeMeeting)}
                  disabled={savingNoteId === activeMeeting.id}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-brand-blue px-4 text-sm font-black text-white transition hover:bg-blue-600 disabled:bg-gray-700"
                >
                  {savingNoteId === activeMeeting.id ? '저장 중' : 'Notion DB 저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export function WeeklyMeetingPanel({
  events,
  loading,
  message,
  onRefresh,
  onSaveMeetingNote,
}: {
  events: CalendarEvent[]
  loading: boolean
  message: string
  onRefresh: () => void
  onSaveMeetingNote: SaveMeetingNoteHandler
}) {
  const now = new Date()
  const sevenDaysLater = new Date(now)
  sevenDaysLater.setDate(now.getDate() + 7)
  sevenDaysLater.setHours(23, 59, 59, 999)
  const weeklyMeetings = events
    .filter((event) => {
      const start = new Date(event.start)
      return isMeetingEvent(event) && start >= now && start <= sevenDaysLater
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return (
    <MeetingListPanel
      kicker="Weekly Meeting"
      title="주간미팅"
      description="오늘부터 앞으로 7일 이내 용올캘린더에 예정된 미팅 일정을 확인합니다."
      events={weeklyMeetings}
      loading={loading}
      message={message}
      onRefresh={onRefresh}
      onSaveMeetingNote={onSaveMeetingNote}
      emptyLabel="앞으로 7일 이내 예정된 미팅이 없습니다."
    />
  )
}

function MeetingListPanel({
  kicker,
  title,
  description,
  events,
  loading,
  message,
  onRefresh,
  onSaveMeetingNote,
  enableDateFilter = false,
  emptyLabel,
}: {
  kicker: string
  title: string
  description: string
  events: CalendarEvent[]
  loading: boolean
  message: string
  onRefresh: () => void
  onSaveMeetingNote: SaveMeetingNoteHandler
  enableDateFilter?: boolean
  emptyLabel: string
}) {
  const [meetingNotes, setMeetingNotes] = useState<Record<string, string>>({})
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null)
  const [noteMessages, setNoteMessages] = useState<Record<string, string>>({})
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')

  const filteredEvents = useMemo(() => {
    if (!enableDateFilter) return events

    return events.filter((event) => {
      const start = new Date(event.start)
      const from = filterStart ? startOfDay(parseLocalDate(filterStart)) : null
      const to = filterEnd ? parseLocalDate(filterEnd) : null
      if (to) to.setHours(23, 59, 59, 999)

      return (!from || start >= from) && (!to || start <= to)
    })
  }, [enableDateFilter, events, filterEnd, filterStart])

  const saveNote = async (event: CalendarEvent) => {
    const note = meetingNotes[event.id] ?? event.memo ?? ''
    setSavingNoteId(event.id)
    setNoteMessages((current) => ({ ...current, [event.id]: '' }))

    try {
      const message = await onSaveMeetingNote(event, note)
      setNoteMessages((current) => ({ ...current, [event.id]: message }))
    } catch (error) {
      setNoteMessages((current) => ({
        ...current,
        [event.id]: error instanceof Error ? error.message : '미팅 기록 저장 중 오류가 발생했습니다.',
      }))
    } finally {
      setSavingNoteId(null)
    }
  }

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold text-brand-blue">{kicker}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">{description}</p>
          {message ? <p className="mt-2 text-xs font-bold text-gray-500">{message}</p> : null}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          일정 새로고침
        </button>
      </div>

      <div className="grid gap-3 border-b border-white/10 p-5 md:grid-cols-[180px_1fr] md:p-6">
        <div className="rounded-lg border border-white/10 bg-black p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
            {enableDateFilter ? 'Filtered / Total' : 'Total Meetings'}
          </p>
          <p className="mt-3 text-4xl font-black text-white">
            {enableDateFilter ? `${filteredEvents.length}/${events.length}` : events.length}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black p-4">
          {enableDateFilter ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black text-gray-500">시작일</span>
                  <input
                    type="date"
                    value={filterStart}
                    onChange={(event) => setFilterStart(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#07080b] px-3 text-sm font-bold text-white outline-none focus:border-brand-blue/60"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-gray-500">종료일</span>
                  <input
                    type="date"
                    value={filterEnd}
                    onChange={(event) => setFilterEnd(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#07080b] px-3 text-sm font-bold text-white outline-none focus:border-brand-blue/60"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFilterStart('')
                  setFilterEnd('')
                }}
                className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-3 text-sm font-black text-gray-300 hover:border-white/30 hover:bg-white/5"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-black text-brand-blue">Drive 회의록 연동 준비</p>
              <p className="mt-2 text-sm font-bold leading-6 text-gray-400 keep-all">
                추후 녹음 파일을 Google Drive에 저장하면, 음성 분석 결과를 아래 미팅 내용 기록에 연결하는 구조로 확장합니다.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="p-5 md:p-6">
        {filteredEvents.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-black p-5 text-sm font-bold text-gray-500">{emptyLabel}</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-black">
            <table className="min-w-[1180px] w-full border-collapse text-left">
              <thead className="bg-white/[0.04]">
                <tr className="text-xs font-black uppercase tracking-[0.12em] text-gray-500">
                  <th className="w-[150px] px-4 py-3">날짜</th>
                  <th className="w-[240px] px-4 py-3">미팅</th>
                  <th className="w-[180px] px-4 py-3">캘린더/장소</th>
                  <th className="w-[160px] px-4 py-3">참석자</th>
                  <th className="px-4 py-3">미팅 내용</th>
                  <th className="w-[110px] px-4 py-3">저장</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="text-sm font-black text-white">{formatDateLabel(event.start)}</p>
                      <p className="mt-1 text-xs font-bold text-gray-500">{formatTimeOnly(event.start)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-black leading-5 text-white keep-all">{event.title}</p>
                      <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[11px] font-black ${eventTypeClass(event.type)}`}>
                        {eventTypeLabel(event.type)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {event.calendarName ? (
                        <p className="inline-flex items-center gap-2 text-xs font-black text-gray-400">
                          <span className="h-2.5 w-2.5 rounded-full" style={calendarDotStyle(event)} />
                          {event.calendarName}
                        </p>
                      ) : null}
                      {event.location ? <p className="mt-2 text-xs font-semibold text-gray-500 keep-all">{event.location}</p> : null}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs font-semibold leading-5 text-gray-500 keep-all">
                        {event.attendees.length > 0 ? event.attendees.slice(0, 3).join(', ') : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <textarea
                        value={meetingNotes[event.id] ?? event.memo ?? ''}
                        onChange={(changeEvent) =>
                          setMeetingNotes((current) => ({ ...current, [event.id]: changeEvent.target.value }))
                        }
                        className="min-h-28 w-full rounded-md border border-white/10 bg-[#07080b] px-3 py-2 text-sm font-semibold leading-6 text-white outline-none focus:border-brand-blue/60"
                        placeholder="미팅에서 다룬 내용, 고객 니즈, 제안 포인트, 후속 액션"
                      />
                      {noteMessages[event.id] ? (
                        <p className="mt-2 text-xs font-bold leading-5 text-gray-500 keep-all">{noteMessages[event.id]}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => saveNote(event)}
                        disabled={savingNoteId === event.id}
                        className="inline-flex h-9 w-full items-center justify-center rounded-md bg-brand-blue px-3 text-xs font-black text-white transition hover:bg-blue-600 disabled:bg-gray-700"
                      >
                        {savingNoteId === event.id ? '저장 중' : '저장'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
