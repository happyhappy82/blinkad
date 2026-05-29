'use client'

import {
  Badge,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardList,
  Copy,
  CreditCard,
  ExternalLink,
  FileSignature,
  Folder,
  Handshake,
  LayoutDashboard,
  Mail,
  Menu,
  Mic,
  ReceiptText,
  RefreshCw,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'
import type { Dispatch, DragEvent, FormEvent, SetStateAction } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { MeetingPanel, WeeklyMeetingPanel } from './_components/calendar/MeetingPanels'
import { BusinessCardPanel } from './_components/crm/BusinessCardPanel'
import { StoreTable } from './_components/shared/StoreTable'
import {
  DEFAULT_CLIENT_STATUS_OPTIONS,
  REPORT_STATUS_OPTIONS,
  TEAM_CALENDAR_LABEL,
  isMenuId,
  menuGroups,
  operationViews,
  realtimeMenuIds,
  statusGroups,
} from './_lib/erp-config'
import type {
  ApiResponse,
  BusinessCardRecord,
  BusinessCardsResponse,
  CalendarAccountView,
  CalendarAccountsResponse,
  CalendarApiResponse,
  CalendarEvent,
  CalendarEventDraft,
  MailApiResponse,
  MailItem,
  MeetingRecord,
  MeetingsApiResponse,
  MenuId,
  OperationRow,
  OperationView,
  SaveMeetingRecordNoteHandler,
  SaveMeetingNoteHandler,
  StoreRecord,
  StoreProductKey,
  StoreProductWorkspace,
  StoreWeeklyReport,
  StoreWeeklyReportStatus,
  WeeklyReportApiResponse,
} from './_lib/erp-config'

function statusIncludesAny(status: string, keywords: string[]) {
  const compactStatus = (status || '').replace(/\s+/g, '')
  return keywords.some((keyword) => compactStatus.includes(keyword.replace(/\s+/g, '')))
}

function menuFromQuery(menu: string | null): MenuId {
  if (menu === 'calendarIntegration') return 'settings'
  if (menu === 'profile' || menu === 'request') return 'project'
  if (menu && isMenuId(menu)) return menu
  return 'dashboard'
}

function readPersistedMenu(): MenuId {
  if (typeof window === 'undefined') return 'dashboard'

  const queryMenu = new URLSearchParams(window.location.search).get('menu')
  if (queryMenu) return menuFromQuery(queryMenu)

  const sessionMenu = window.sessionStorage.getItem('blinkad-erp-active-menu')
  return menuFromQuery(sessionMenu)
}

function persistMenu(menu: MenuId) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem('blinkad-erp-active-menu', menu)

  const currentUrl = new URL(window.location.href)
  if (menu === 'dashboard') {
    currentUrl.searchParams.delete('menu')
  } else {
    currentUrl.searchParams.set('menu', menu)
  }

  window.history.replaceState(null, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`)
}

type AdsSummary = {
  rowCount: number
  impressions: number
  clicks: number
  costMicros: number
  localActionDirectionRequests: number
  localActionCalls: number
  localActionWebsiteClicks: number
  localActions: number
}

type AdsDailyRow = {
  date: string
  storeName: string
  adsCustomerId: string
  impressions: number
  clicks: number
  costMicros: number
  localActionDirectionRequests: number
  localActionCalls: number
  localActionWebsiteClicks: number
  sourceSyncedAt: string
}

type GoogleAdsApiResponse = {
  source: 'bigquery' | 'fallback'
  connected: boolean
  status: 'connected' | 'empty_table' | 'no_store_data' | 'missing_config' | 'error'
  store: string
  message: string
  period: {
    days: number
    firstDate?: string
    lastDate?: string
  }
  summary: AdsSummary
  previousSummary: AdsSummary
  daily: AdsDailyRow[]
  adsCustomerIds: string[]
  tableRowCount?: number
  sourceSyncedAt?: string
}

type StoreMetric = {
  label: string
  value: string
  detail?: string
}

export default function ErpClient() {
  const [activeMenu, setActiveMenu] = useState<MenuId>('dashboard')
  const [menuSynced, setMenuSynced] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarPreview, setSidebarPreview] = useState(false)
  const [activeStoreTitle, setActiveStoreTitle] = useState(operationViews.project?.rows[0]?.title || '')
  const [stores, setStores] = useState<StoreRecord[]>([])
  const [statusOptions, setStatusOptions] = useState<string[]>(DEFAULT_CLIENT_STATUS_OPTIONS)
  const [loading, setLoading] = useState(true)
  const [connectionMessage, setConnectionMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [runningAction, setRunningAction] = useState<string | null>(null)
  const [updatingStoreStatus, setUpdatingStoreStatus] = useState<string | null>(null)
  const [businessCards, setBusinessCards] = useState<BusinessCardRecord[]>([])
  const [businessCardsLoading, setBusinessCardsLoading] = useState(false)
  const [runningCardOcr, setRunningCardOcr] = useState<string | null>(null)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendarMessage, setCalendarMessage] = useState('')
  const [meetingRecords, setMeetingRecords] = useState<MeetingRecord[]>([])
  const [meetingDbLoading, setMeetingDbLoading] = useState(false)
  const [meetingDbMessage, setMeetingDbMessage] = useState('')
  const lastMeetingSyncSignatureRef = useRef('')
  const [mailItems, setMailItems] = useState<MailItem[]>([])
  const [mailLoading, setMailLoading] = useState(false)
  const [mailMessage, setMailMessage] = useState('')

  const loadStores = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/erp/clients', { cache: 'no-store' })
      const data = (await response.json()) as ApiResponse
      setStores(data.stores)
      setStatusOptions(data.statusOptions?.length ? data.statusOptions : DEFAULT_CLIENT_STATUS_OPTIONS)
      setConnectionMessage(
        data.connected
          ? 'Notion 문의관리 DB와 연결되었습니다.'
          : data.message || 'Notion 환경변수가 없어 샘플 데이터로 표시 중입니다.'
      )
    } catch {
      setConnectionMessage('문의관리 DB를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStores()
  }, [])

  const updateStoreStatus = async (store: StoreRecord, status: string) => {
    if (!status || status === store.status) return

    const previousStores = stores
    setUpdatingStoreStatus(store.id)
    setStores((current) => current.map((item) => (item.id === store.id ? { ...item, status } : item)))

    try {
      const response = await fetch('/api/erp/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: store.id, status }),
      })
      const data = (await response.json()) as { connected: boolean; message?: string; store?: StoreRecord }
      if (!response.ok || !data.connected) {
        setStores(previousStores)
        setActionMessage(data.message || 'Notion 상태 변경에 실패했습니다.')
        return
      }
      if (data.store) {
        setStores((current) => current.map((item) => (item.id === store.id ? data.store! : item)))
      }
      setActionMessage(`${store.name} 상태를 ${status}(으)로 변경했습니다.`)
    } catch {
      setStores(previousStores)
      setActionMessage('Notion 상태 변경 중 오류가 발생했습니다.')
    } finally {
      setUpdatingStoreStatus(null)
    }
  }

  useEffect(() => {
    setActiveMenu(readPersistedMenu())
    setMenuSynced(true)
  }, [])

  useEffect(() => {
    if (!menuSynced) return
    persistMenu(activeMenu)
  }, [activeMenu, menuSynced])

  const loadCalendarEvents = async () => {
    setCalendarLoading(true)
    try {
      const response = await fetch('/api/erp/google/calendar', { cache: 'no-store' })
      const data = (await response.json()) as CalendarApiResponse
      setCalendarEvents(data.events)
      setCalendarMessage(
        data.message ||
          (data.connected
            ? 'Google Calendar와 연결되었습니다.'
            : 'Google Calendar 토큰이 없어 샘플 일정으로 표시 중입니다.')
      )
    } catch {
      setCalendarMessage('Google Calendar 일정을 불러오지 못했습니다.')
    } finally {
      setCalendarLoading(false)
    }
  }

  const saveMeetingNote: SaveMeetingNoteHandler = async (calendarEvent, memo) => {
    const payload = {
      id: calendarEvent.id,
      title: calendarEvent.title,
      start: calendarEvent.start,
      end: calendarEvent.end || calendarEvent.start,
      type: 'meeting',
      location: calendarEvent.location,
      memo,
    }

    const response = await fetch('/api/erp/google/calendar', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = (await response.json()) as { message?: string; event?: CalendarEvent }

    if (!response.ok) {
      throw new Error(data.message || '미팅 기록을 저장하지 못했습니다.')
    }

    if (data.event) {
      setCalendarEvents((current) => current.map((item) => (item.id === data.event!.id ? data.event! : item)))
    }

    if (data.event?.source === 'google') {
      await loadCalendarEvents()
    }

    return data.message || '미팅 기록을 저장했습니다.'
  }

  const syncMeetingRecords = useCallback(async (events: CalendarEvent[]) => {
    setMeetingDbLoading(true)
    try {
      const meetingEvents = uniqueCalendarMeetingEvents(events)
      const response = await fetch('/api/erp/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: meetingEvents }),
      })
      const data = (await response.json()) as MeetingsApiResponse
      setMeetingRecords(data.meetings || [])
      setMeetingDbMessage(data.message || '문의관리 DB의 미팅 요약을 동기화했습니다.')
    } catch {
      setMeetingDbMessage('문의관리 DB의 미팅 요약을 불러오지 못했습니다.')
    } finally {
      setMeetingDbLoading(false)
    }
  }, [])

  const loadMeetingRecords = useCallback(async () => {
    setMeetingDbLoading(true)
    try {
      const response = await fetch('/api/erp/meetings', { cache: 'no-store' })
      const data = (await response.json()) as MeetingsApiResponse
      setMeetingRecords(data.meetings || [])
      setMeetingDbMessage(data.message || '문의관리 DB의 미팅 요약과 연결되었습니다.')
    } catch {
      setMeetingDbMessage('문의관리 DB의 미팅 요약을 불러오지 못했습니다.')
    } finally {
      setMeetingDbLoading(false)
    }
  }, [])

  const saveMeetingRecordNote: SaveMeetingRecordNoteHandler = async (meeting, memo) => {
    const response = await fetch('/api/erp/meetings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: meeting.id, memo }),
    })
    const data = (await response.json()) as MeetingsApiResponse

    if (!response.ok || !data.connected) {
      throw new Error(data.message || '문의관리 DB에 미팅 요약을 저장하지 못했습니다.')
    }

    setMeetingRecords(data.meetings || [])
    setMeetingDbMessage(data.message || '문의관리 DB에 미팅 요약을 저장했습니다.')
    return data.message || '문의관리 DB에 미팅 요약을 저장했습니다.'
  }

  const loadMailItems = async () => {
    setMailLoading(true)
    try {
      const response = await fetch('/api/erp/google/gmail', { cache: 'no-store' })
      const data = (await response.json()) as MailApiResponse
      setMailItems(data.mails)
      setMailMessage(
        data.connected
          ? 'Gmail 받은편지함과 연결되었습니다.'
          : data.message || 'Gmail 토큰이 없어 샘플 메일로 표시 중입니다.'
      )
    } catch {
      setMailMessage('Gmail 받은편지함을 불러오지 못했습니다.')
    } finally {
      setMailLoading(false)
    }
  }

  const loadBusinessCards = async () => {
    setBusinessCardsLoading(true)
    try {
      const response = await fetch('/api/erp/clients/cards', { cache: 'no-store' })
      const data = (await response.json()) as BusinessCardsResponse
      setBusinessCards(data.cards)
    } catch {
      setBusinessCards([])
    } finally {
      setBusinessCardsLoading(false)
    }
  }

  const analyzeBusinessCard = async (card: BusinessCardRecord) => {
    setRunningCardOcr(card.id)
    setActionMessage('')

    try {
      const response = await fetch('/api/erp/clients/cards/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: card.id }),
      })
      const data = (await response.json()) as { connected: boolean; message?: string }

      if (!response.ok || !data.connected) {
        setActionMessage(data.message || '명함 분석에 실패했습니다.')
        await loadBusinessCards()
        return
      }

      setActionMessage(data.message || '명함 분석을 완료했습니다.')
      await loadBusinessCards()
    } catch {
      setActionMessage('명함 분석 중 오류가 발생했습니다.')
    } finally {
      setRunningCardOcr(null)
    }
  }

  useEffect(() => {
    if (activeMenu === 'card' && businessCards.length === 0 && !businessCardsLoading) {
      loadBusinessCards()
    }

    if (['schedule', 'meeting', 'weekly'].includes(activeMenu) && calendarEvents.length === 0 && !calendarLoading) {
      loadCalendarEvents()
    }

    if (activeMenu === 'mail' && mailItems.length === 0 && !mailLoading) {
      loadMailItems()
    }
  }, [activeMenu])

  useEffect(() => {
    if (activeMenu !== 'meeting' || calendarLoading) return
    const syncSignature = meetingSyncSignature(calendarEvents)
    if (syncSignature && lastMeetingSyncSignatureRef.current !== syncSignature) {
      lastMeetingSyncSignatureRef.current = syncSignature
      syncMeetingRecords(calendarEvents)
    } else {
      loadMeetingRecords()
    }
  }, [activeMenu, calendarEvents, calendarLoading, loadMeetingRecords, syncMeetingRecords])

  const dashboard = useMemo(() => {
    const counts = statusGroups.map((group) => ({
      label: group.label,
      count: stores.filter((store) => statusIncludesAny(store.status, group.matcher)).length,
    }))

    return { counts }
  }, [stores])

  const inquiryStores = stores.filter((store) => statusIncludesAny(store.status, ['신규 문의', '신규문의']))
  const followupStores = stores.filter((store) =>
    statusIncludesAny(store.status, ['견적서 송부', '팔로업 지속', '공동대응'])
  )
  const quoteCandidateStores = stores.filter(
    (store) =>
      !statusIncludesAny(store.status, ['계약대기', '계약 대기', '답변완료', '답변 완료', '계약완료', '계약 완료', '취소/팔로업 중지'])
  )
  const contractPendingStores = stores.filter((store) => statusIncludesAny(store.status, ['계약대기', '계약 대기']))
  const crmMetrics = useMemo(() => {
    const countByStatus = (keywords: string[]) =>
      stores.filter((store) => statusIncludesAny(store.status, keywords)).length
    const contractPendingCount = countByStatus(['계약대기', '계약 대기'])
    const activeCustomerCount = countByStatus(['운영시작', '계약 완료', '계약완료'])

    return {
      inquiry: [
        { label: '신규 문의', value: String(inquiryStores.length), detail: '처리상태 기준' },
        { label: '미팅 확정', value: String(countByStatus(['미팅일정 확정', '미팅일정확정'])), detail: '상담 예정' },
        { label: '팔로업', value: String(followupStores.length), detail: '견적/공동대응' },
        { label: '계약대기', value: String(contractPendingCount), detail: '전자계약 확인' },
      ],
      followup: [
        { label: '팔로업 대상', value: String(followupStores.length), detail: '후속 연락 필요' },
        { label: '공동 대응', value: String(countByStatus(['공동 대응', '공동대응'])), detail: '내부 협업' },
        { label: '계약 전환 후보', value: String(contractPendingCount), detail: '상태 변경 완료' },
      ],
      customer: [
        { label: '전체 고객', value: String(stores.length), detail: '문의 DB 전체' },
        { label: '운영/계약 고객', value: String(activeCustomerCount), detail: '계약 이후' },
        { label: '계약대기', value: String(contractPendingCount), detail: '수주 직전' },
      ],
      contractPending: [
        { label: '계약대기', value: String(contractPendingStores.length), detail: '처리상태 기준' },
        {
          label: '전자계약 링크',
          value: String(contractPendingStores.filter((store) => store.contractUrl).length),
          detail: 'Notion URL 매핑',
        },
        {
          label: '계약서 등록',
          value: String(contractPendingStores.filter((store) => store.contractCount > 0).length),
          detail: '파일 속성 기준',
        },
      ],
    } satisfies Record<string, StoreMetric[]>
  }, [contractPendingStores, followupStores, inquiryStores, stores])
  const businessCardMetrics = useMemo(
    () => [
      { label: '전체 명함', value: String(businessCards.length), detail: 'Notion 명함 DB' },
      {
        label: '사진 등록',
        value: String(businessCards.filter((card) => card.imageUrl).length),
        detail: '명함 사진 파일',
      },
      {
        label: '입력필요',
        value: String(businessCards.filter((card) => statusIncludesAny(card.status, ['입력필요'])).length),
        detail: '검수 대기',
      },
      {
        label: 'OCR 완료',
        value: String(businessCards.filter((card) => statusIncludesAny(card.ocrStatus, ['완료'])).length),
        detail: '자동 분석',
      },
    ],
    [businessCards]
  )
  const operationView =
    realtimeMenuIds.includes(activeMenu) || activeMenu === 'followup' || activeMenu === 'customer' || activeMenu === 'card'
      ? undefined
      : operationViews[activeMenu]
  const projectStores = operationViews.project?.rows || []
  const sidebarExpanded = !sidebarCollapsed || sidebarPreview
  const headerConnectionMessage = activeMenu === 'card' ? '' : connectionMessage
  const headerLoading =
    activeMenu === 'card'
      ? businessCardsLoading
      : ['schedule', 'weekly'].includes(activeMenu)
        ? calendarLoading
        : activeMenu === 'meeting'
          ? meetingDbLoading || calendarLoading
          : activeMenu === 'mail'
            ? mailLoading
            : loading
  const refreshActiveMenu = () => {
    persistMenu(activeMenu)
    if (activeMenu === 'card') return loadBusinessCards()
    if (activeMenu === 'schedule' || activeMenu === 'weekly') return loadCalendarEvents()
    if (activeMenu === 'meeting') return calendarEvents.length ? syncMeetingRecords(calendarEvents) : loadMeetingRecords()
    if (activeMenu === 'mail') return loadMailItems()
    return loadStores()
  }

  const selectMenu = (menuId: MenuId) => {
    persistMenu(menuId)
    setActiveMenu(menuId)
    if (menuId === 'project' && !activeStoreTitle) {
      setActiveStoreTitle(projectStores[0]?.title || '')
    }
  }

  const toggleSidebar = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false)
      setSidebarPreview(false)
      return
    }

    setSidebarCollapsed(true)
    setSidebarPreview(false)
  }

  const runAutomation = async (type: 'quote' | 'diagnosis', store: StoreRecord) => {
    setRunningAction(`${type}:${store.id}`)
    setActionMessage('')

    try {
      const response = await fetch(`/api/erp/actions/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notionName: store.name,
          storeName: store.name,
          googleMapUrl: store.googleMapUrl,
        }),
      })
      const data = await response.json()
      setActionMessage(data.message || '요청이 처리되었습니다.')
      await loadStores()
    } catch {
      setActionMessage('자동화 요청 중 오류가 발생했습니다.')
    } finally {
      setRunningAction(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#050608] text-white">
      <div className="flex min-h-screen">
        <aside
          onMouseEnter={() => {
            if (sidebarCollapsed) setSidebarPreview(true)
          }}
          onMouseLeave={() => {
            if (sidebarCollapsed) setSidebarPreview(false)
          }}
          className={`hidden shrink-0 overflow-hidden border-r border-white/10 bg-black transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex lg:flex-col ${
            sidebarExpanded ? 'w-64 shadow-[18px_0_60px_rgba(37,99,235,0.08)]' : 'w-[72px]'
          }`}
        >
          <div className={`flex h-20 shrink-0 items-center border-b border-white/10 px-4 ${sidebarExpanded ? 'justify-between' : 'justify-center'}`}>
            <a
              href="/"
              aria-label="BlinkAd home"
              className={`min-w-0 transition-all duration-200 ${
                sidebarExpanded ? 'w-auto opacity-100' : 'w-0 -translate-x-3 opacity-0'
              }`}
            >
              <img src="/logo-white-nav.png" alt="BlinkAd" className="h-8 w-auto" />
            </a>
            <button
              type="button"
              onClick={toggleSidebar}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-gray-400 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
              aria-label={sidebarCollapsed ? '왼쪽 메뉴 고정하기' : '왼쪽 메뉴 숨기기'}
              title={sidebarCollapsed ? '왼쪽 메뉴 고정하기' : '왼쪽 메뉴 숨기기'}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <nav className="space-y-6 px-3 py-5">
            {menuGroups.map((group) => (
              <div key={group.label}>
                <p className={`px-3 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-600 transition-opacity ${sidebarExpanded ? 'opacity-100' : 'h-0 overflow-hidden pb-0 opacity-0'}`}>
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((menu) => {
                    const Icon = menu.icon
                    const active = activeMenu === menu.id

                    return (
                      <div key={menu.id}>
                      <button
                        type="button"
                        onClick={() => selectMenu(menu.id)}
                        className={`flex w-full items-center rounded-lg py-3 text-left text-sm font-bold transition ${
                          active ? 'bg-brand-blue text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        } ${sidebarExpanded ? 'gap-3 px-3' : 'justify-center px-0'}`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className={`whitespace-nowrap transition-opacity ${sidebarExpanded ? 'opacity-100' : 'sr-only opacity-0'}`}>
                          {menu.label}
                        </span>
                      </button>
                      {sidebarExpanded && menu.id === 'project' && activeMenu === 'project' ? (
                        <div className="ml-7 mt-1 space-y-1 border-l border-white/10 pl-3">
                          {projectStores.map((store) => {
                            const storeActive = activeStoreTitle === store.title

                            return (
                              <button
                                key={store.title}
                                type="button"
                                onClick={() => {
                                  setActiveMenu('project')
                                  setActiveStoreTitle(store.title)
                                }}
                                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs font-black transition ${
                                  storeActive
                                    ? 'bg-white text-black'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <span>{store.title}</span>
                                <span className={storeActive ? 'text-black/55' : 'text-gray-600'}>{store.status}</span>
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050608]/95 backdrop-blur">
            <div className="flex min-h-20 flex-col justify-center gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-8">
              <div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
                    BlinkAd ERP
                  </p>
                  <h1 className="mt-1 text-xl font-black tracking-tight text-white md:text-2xl">
                    영업·미팅·견적·계약·운영·정산 관리
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {headerConnectionMessage ? (
                  <span className="hidden rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-gray-400 md:inline-flex">
                    {headerConnectionMessage}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={refreshActiveMenu}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-sm font-bold text-gray-200 hover:border-white/30 hover:bg-white/5"
                >
                  <RefreshCw className={`h-4 w-4 ${headerLoading ? 'animate-spin' : ''}`} />
                  새로고침
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto px-5 pb-4 md:hidden">
              {menuGroups.map((group) => (
                <div key={group.label} className="flex shrink-0 gap-2">
                  {group.items.map((menu) => (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => selectMenu(menu.id)}
                      className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold ${
                        activeMenu === menu.id ? 'bg-brand-blue text-white' : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {menu.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </header>

          <div className="px-5 py-6 md:px-8">
            {actionMessage ? (
              <div className="mb-4 rounded-lg border border-brand-blue/30 bg-brand-blue/10 px-4 py-3 text-sm font-bold text-blue-100">
                {actionMessage}
              </div>
            ) : null}

            {activeMenu === 'dashboard' && (
              <section>
                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
                  {dashboard.counts.map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-[#0b0d12] p-5">
                      <p className="text-sm font-bold text-gray-400">{item.label}</p>
                      <p className="mt-4 text-5xl font-black tracking-tight text-white">{item.count}</p>
                      <p className="mt-3 text-sm leading-6 text-gray-500">문의관리 DB 기준</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeMenu === 'crm' && (
              <StoreTable
                title="문의관리"
                description="Notion 문의관리 DB에서 처리상태가 신규 문의인 클라이언트만 확인합니다."
                stores={inquiryStores}
                loading={loading}
                columns="crm"
                metrics={crmMetrics.inquiry}
                enableStatusFilter
                statusOptions={statusOptions}
                updatingStatusId={updatingStoreStatus}
                onStatusChange={updateStoreStatus}
              />
            )}

            {activeMenu === 'followup' && (
              <StoreTable
                title="팔로업 관리"
                description="견적서 송부/팔로업 지속, 공동대응 상태의 클라이언트를 모아 후속 액션을 관리합니다."
                stores={followupStores}
                loading={loading}
                columns="crm"
                metrics={crmMetrics.followup}
                enableStatusFilter
                statusOptions={statusOptions}
                updatingStatusId={updatingStoreStatus}
                onStatusChange={updateStoreStatus}
              />
            )}

            {activeMenu === 'customer' && (
              <StoreTable
                title="고객관리"
                description="Notion 문의관리 DB의 전체 고객 리스트를 확인합니다."
                stores={stores}
                loading={loading}
                columns="customer"
                metrics={crmMetrics.customer}
                enableStatusFilter
                statusOptions={statusOptions}
                updatingStatusId={updatingStoreStatus}
                onStatusChange={updateStoreStatus}
              />
            )}

            {activeMenu === 'contractPending' && (
              <StoreTable
                title="계약대기 리스트"
                description="Notion 문의관리 DB에서 계약대기 상태인 매장을 모아 전자계약 링크와 계약서 등록 여부를 확인합니다."
                stores={contractPendingStores}
                loading={loading}
                columns="contract"
                metrics={crmMetrics.contractPending}
                enableStatusFilter
                statusOptions={statusOptions}
                updatingStatusId={updatingStoreStatus}
                onStatusChange={updateStoreStatus}
              />
            )}

            {activeMenu === 'card' && (
              <BusinessCardPanel
                cards={businessCards}
                loading={businessCardsLoading}
                metrics={businessCardMetrics}
                runningOcrId={runningCardOcr}
                onRefresh={loadBusinessCards}
                onAnalyze={analyzeBusinessCard}
              />
            )}

            {activeMenu === 'diagnosis' && (
              <StoreTable
                title="진단자료 생성"
                description="각 매장별 Google 맵 링크를 기준으로 진단자료 PDF를 생성하고 분석자료 열에 저장합니다."
                stores={stores}
                loading={loading}
                columns="diagnosis"
                runningAction={runningAction}
                statusOptions={statusOptions}
                updatingStatusId={updatingStoreStatus}
                onStatusChange={updateStoreStatus}
                onRunDiagnosis={(store) => runAutomation('diagnosis', store)}
              />
            )}

            {activeMenu === 'quote' && (
              <StoreTable
                title="견적서 생성"
                description="계약대기, 답변완료, 계약완료, 취소/팔로업 중지 상태를 제외한 매장을 견적서 생성 대상으로 표시합니다."
                stores={quoteCandidateStores}
                loading={loading}
                columns="quote"
                runningAction={runningAction}
                statusOptions={statusOptions}
                updatingStatusId={updatingStoreStatus}
                onStatusChange={updateStoreStatus}
                onRunQuote={(store) => runAutomation('quote', store)}
              />
            )}

            {activeMenu === 'contract' && (
              <StoreTable
                title="계약서 관리"
                description="Notion 문의관리 DB에서 계약대기 상태인 매장을 모아 전자계약 발송과 계약서 상태를 확인합니다."
                stores={contractPendingStores}
                loading={loading}
                columns="contract"
                statusOptions={statusOptions}
                updatingStatusId={updatingStoreStatus}
                onStatusChange={updateStoreStatus}
              />
            )}

            {activeMenu === 'report' && (
              <ReportOperationsPanel
                view={operationViews.project!}
                stores={stores}
                selectedStoreTitle={activeStoreTitle}
                onSelectStore={setActiveStoreTitle}
              />
            )}

            {activeMenu === 'schedule' && (
              <CalendarPanel
                events={calendarEvents}
                loading={calendarLoading}
                message={calendarMessage}
                onRefresh={loadCalendarEvents}
              />
            )}

            {activeMenu === 'settings' && <SettingsPanel />}

            {activeMenu === 'meeting' && (
              <MeetingPanel
                meetings={meetingRecords}
                loading={meetingDbLoading || calendarLoading}
                message={meetingDbMessage || calendarMessage}
                onRefresh={() => syncMeetingRecords(calendarEvents)}
                onSaveMeetingNote={saveMeetingRecordNote}
              />
            )}

            {activeMenu === 'weekly' && (
              <WeeklyMeetingPanel
                events={calendarEvents}
                loading={calendarLoading}
                message={calendarMessage}
                onRefresh={loadCalendarEvents}
                onSaveMeetingNote={saveMeetingNote}
              />
            )}

            {activeMenu === 'mail' && (
              <MailPanel
                mails={mailItems}
                loading={mailLoading}
                message={mailMessage}
                onRefresh={loadMailItems}
              />
            )}

            {operationView ? (
              <OperationsPanel
                view={operationView}
                selectedStoreTitle={activeStoreTitle}
                onSelectStore={setActiveStoreTitle}
              />
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}

function formatDateTime(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDateTimeRange(event: CalendarEvent) {
  if (!event.start) return '-'
  const start = new Date(event.start)
  const end = new Date(event.end || event.start)
  const date = new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(start)
  const startTime = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(start)
  const endTime = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(end)

  return `${date} ${startTime} - ${endTime}`
}

function toDateTimeLocalValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
  return offsetDate.toISOString().slice(0, 16)
}

function startOfDay(date: Date) {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return target
}

function startOfWeek(date: Date) {
  const target = startOfDay(date)
  target.setDate(target.getDate() - target.getDay())
  return target
}

function addDays(date: Date, days: number) {
  const target = new Date(date)
  target.setDate(target.getDate() + days)
  return target
}

function formatCalendarRange(view: 'month' | 'week' | 'day', anchorDate: Date) {
  if (view === 'month') {
    return `${anchorDate.getFullYear()}.${String(anchorDate.getMonth() + 1).padStart(2, '0')}`
  }

  if (view === 'week') {
    const start = startOfWeek(anchorDate)
    const end = addDays(start, 6)
    return `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(2, '0')}.${String(start.getDate()).padStart(2, '0')} - ${end.getFullYear()}.${String(end.getMonth() + 1).padStart(2, '0')}.${String(end.getDate()).padStart(2, '0')}`
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
  }).format(anchorDate)
}

function draftFromEvent(event: CalendarEvent): CalendarEventDraft {
  return {
    title: event.title,
    start: toDateTimeLocalValue(new Date(event.start)),
    end: toDateTimeLocalValue(new Date(event.end || event.start)),
    type: event.type,
    location: event.location || '',
    memo: event.memo || '',
  }
}

function defaultDraft(date = new Date(), hour?: number): CalendarEventDraft {
  const start = new Date(date)
  start.setHours(hour ?? start.getHours() + 1, 0, 0, 0)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  return {
    title: '',
    start: toDateTimeLocalValue(start),
    end: toDateTimeLocalValue(end),
    type: 'meeting',
    location: '',
    memo: '',
  }
}

function slotKeyFor(date: Date, hour?: number) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${hour ?? 'day'}`
}

function CalendarEventForm({
  newEvent,
  setNewEvent,
  creating,
  createMessage,
  onSubmit,
  submitLabel = 'Google Calendar에 일정 추가',
}: {
  newEvent: CalendarEventDraft
  setNewEvent: Dispatch<SetStateAction<CalendarEventDraft>>
  creating: boolean
  createMessage: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  submitLabel?: string
}) {
  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-3">
      <label className="block">
        <span className="text-xs font-bold text-gray-500">일정명</span>
        <input
          required
          value={newEvent.title}
          onChange={(event) => setNewEvent((current) => ({ ...current, title: event.target.value }))}
          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#07080b] px-3 text-sm font-semibold text-white outline-none"
          placeholder="예: 미스터버거 제안 미팅"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs font-bold text-gray-500">시작</span>
          <input
            required
            type="datetime-local"
            value={newEvent.start}
            onChange={(event) => setNewEvent((current) => ({ ...current, start: event.target.value }))}
            className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#07080b] px-3 text-xs font-semibold text-white outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-gray-500">종료</span>
          <input
            required
            type="datetime-local"
            value={newEvent.end}
            onChange={(event) => setNewEvent((current) => ({ ...current, end: event.target.value }))}
            className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#07080b] px-3 text-xs font-semibold text-white outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-bold text-gray-500">분류</span>
        <select
          value={newEvent.type}
          onChange={(event) =>
            setNewEvent((current) => ({ ...current, type: event.target.value as CalendarEvent['type'] }))
          }
          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#07080b] px-3 text-sm font-semibold text-white outline-none"
        >
          <option value="meeting">미팅</option>
          <option value="deadline">마감</option>
          <option value="operation">운영</option>
          <option value="task">할 일</option>
        </select>
      </label>

      <label className="block">
        <span className="text-xs font-bold text-gray-500">장소</span>
        <input
          value={newEvent.location}
          onChange={(event) => setNewEvent((current) => ({ ...current, location: event.target.value }))}
          className="mt-1 h-10 w-full rounded-md border border-white/10 bg-[#07080b] px-3 text-sm font-semibold text-white outline-none"
          placeholder="Google Meet / 매장명"
        />
      </label>

      <label className="block">
        <span className="text-xs font-bold text-gray-500">메모</span>
        <textarea
          value={newEvent.memo}
          onChange={(event) => setNewEvent((current) => ({ ...current, memo: event.target.value }))}
          className="mt-1 min-h-20 w-full rounded-md border border-white/10 bg-[#07080b] px-3 py-2 text-sm font-semibold text-white outline-none"
          placeholder="미팅 목적, 준비사항, 후속 액션"
        />
      </label>

      <button
        type="submit"
        disabled={creating}
        className="inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-blue px-3 text-sm font-black text-white transition hover:bg-blue-600 disabled:bg-gray-700"
      >
        {creating ? '처리 중' : submitLabel}
      </button>

      {createMessage ? <p className="text-xs font-bold leading-5 text-gray-400 keep-all">{createMessage}</p> : null}
    </form>
  )
}

function isSameDate(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
}

function isMeetingEvent(event: CalendarEvent) {
  const text = `${event.title} ${event.memo}`.toLowerCase()
  return event.type === 'meeting' || text.includes('미팅') || text.includes('회의') || text.includes('상담')
}

function calendarMeetingKey(event: CalendarEvent) {
  const id = String(event.id || '').replace(/\s+/g, ' ').trim().toLowerCase()
  if (id) return `event:${id}`
  const title = String(event.title || '').replace(/\s+/g, ' ').trim().toLowerCase()
  const start = String(event.start || '').replace(/\s+/g, ' ').trim().toLowerCase()
  return `fallback:${title}:${start}`
}

function uniqueCalendarMeetingEvents(events: CalendarEvent[]) {
  const seen = new Set<string>()
  return events.filter((event) => {
    if (!isMeetingEvent(event)) return false
    const key = calendarMeetingKey(event)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function meetingSyncSignature(events: CalendarEvent[]) {
  return uniqueCalendarMeetingEvents(events)
    .map((event) => calendarMeetingKey(event))
    .sort()
    .join('|')
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

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return `rgba(11, 87, 208, ${alpha})`

  const red = parseInt(normalized.slice(0, 2), 16)
  const green = parseInt(normalized.slice(2, 4), 16)
  const blue = parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function calendarEventStyle(event: CalendarEvent) {
  const color = calendarColor(event)
  if (!color) return undefined

  return {
    borderColor: hexToRgba(color, 0.55),
    borderLeftColor: color,
    background: `linear-gradient(90deg, ${hexToRgba(color, 0.24)}, rgba(255,255,255,0.035))`,
  }
}

function calendarDotStyle(event: CalendarEvent) {
  const color = calendarColor(event)
  return color ? { backgroundColor: color } : undefined
}

function CalendarPanel({
  events,
  loading,
  message,
  onRefresh,
}: {
  events: CalendarEvent[]
  loading: boolean
  message: string
  onRefresh: () => void
}) {
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([])
  const [deletedEventIds, setDeletedEventIds] = useState<Set<string>>(() => new Set())
  const [saving, setSaving] = useState(false)
  const [actionStatus, setActionStatus] = useState('')
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [eventDraft, setEventDraft] = useState<CalendarEventDraft>(() => defaultDraft())
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null)
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null)

  const allEvents = useMemo(() => {
    const eventMap = new Map<string, CalendarEvent>()
    events.forEach((event) => {
      if (!deletedEventIds.has(event.id)) eventMap.set(event.id, event)
    })
    localEvents.forEach((event) => {
      if (!deletedEventIds.has(event.id)) eventMap.set(event.id, event)
    })
    return Array.from(eventMap.values()).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [events, localEvents, deletedEventIds])

  const year = anchorDate.getFullYear()
  const month = anchorDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dateNumber = index - firstDay + 1
    return dateNumber > 0 && dateNumber <= lastDate ? new Date(year, month, dateNumber) : null
  })
  const weekStart = startOfWeek(anchorDate)
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const calendarHours = Array.from({ length: 14 }, (_, index) => index + 8)
  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const visibleRangeEvents = allEvents
    .filter((calendarEvent) => {
      const start = new Date(calendarEvent.start)

      if (calendarView === 'week') {
        const end = addDays(weekStart, 7)
        return start >= weekStart && start < end
      }

      if (calendarView === 'day') {
        return isSameDate(start, anchorDate)
      }

      return start.getFullYear() === year && start.getMonth() === month
    })

  const visibleCalendars = useMemo(() => {
    const calendarMap = new Map<string, CalendarEvent>()
    allEvents.forEach((calendarEvent) => {
      const key = calendarEvent.calendarId || calendarEvent.calendarName
      if (key && !calendarMap.has(key)) calendarMap.set(key, calendarEvent)
    })
    return Array.from(calendarMap.values())
  }, [allEvents])

  const moveCalendar = (offset: number) => {
    if (calendarView === 'month') {
      setAnchorDate(new Date(year, month + offset, 1))
      return
    }

    if (calendarView === 'week') {
      setAnchorDate((current) => addDays(current, offset * 7))
      return
    }

    setAnchorDate((current) => addDays(current, offset))
  }

  const openCreateModal = (date?: Date, hour = 10) => {
    setSelectedEvent(null)
    setEventDraft(defaultDraft(date || anchorDate, hour))
    setActionStatus('')
    setModalMode('create')
  }

  const openEditModal = (calendarEvent: CalendarEvent) => {
    setSelectedEvent(calendarEvent)
    setEventDraft(draftFromEvent(calendarEvent))
    setActionStatus('')
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedEvent(null)
  }

  const saveCalendarEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setActionStatus('')

    try {
      const payload = {
        ...eventDraft,
        start: new Date(eventDraft.start).toISOString(),
        end: new Date(eventDraft.end || eventDraft.start).toISOString(),
      }
      const response = await fetch('/api/erp/google/calendar', {
        method: modalMode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalMode === 'edit' ? { ...payload, id: selectedEvent?.id } : payload),
      })
      const data = (await response.json()) as { message?: string; event?: CalendarEvent }

      if (!response.ok) {
        throw new Error(data.message || '일정을 저장하지 못했습니다.')
      }

      if (data.event) {
        setDeletedEventIds((current) => {
          const next = new Set(current)
          next.delete(data.event!.id)
          return next
        })
        setLocalEvents((current) => [...current.filter((item) => item.id !== data.event!.id), data.event as CalendarEvent])
      }
      setActionStatus(data.message || '일정을 저장했습니다.')

      if (data.event?.source === 'google') {
        await onRefresh()
      }

      closeModal()
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : '일정을 저장하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const deleteCalendarEvent = async () => {
    if (!selectedEvent) return
    setSaving(true)
    setActionStatus('')

    try {
      const response = await fetch('/api/erp/google/calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedEvent.id }),
      })
      const data = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(data.message || '일정을 삭제하지 못했습니다.')
      }

      setDeletedEventIds((current) => {
        const next = new Set(current)
        next.add(selectedEvent.id)
        return next
      })
      setLocalEvents((current) => current.filter((item) => item.id !== selectedEvent.id))
      setActionStatus(data.message || '일정을 삭제했습니다.')

      if (selectedEvent.source === 'google') {
        await onRefresh()
      }

      closeModal()
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : '일정을 삭제하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const moveEventToSlot = async (eventId: string, targetDate: Date, hour?: number) => {
    const calendarEvent = allEvents.find((event) => event.id === eventId)
    if (!calendarEvent || saving) return

    setSaving(true)
    setActionStatus('')

    const currentStart = new Date(calendarEvent.start)
    const currentEnd = new Date(calendarEvent.end || calendarEvent.start)
    const duration = Math.max(30 * 60 * 1000, currentEnd.getTime() - currentStart.getTime())
    const nextStart = new Date(targetDate)

    if (hour === undefined) {
      nextStart.setHours(currentStart.getHours(), currentStart.getMinutes(), 0, 0)
    } else {
      nextStart.setHours(hour, currentStart.getMinutes(), 0, 0)
    }

    const nextEnd = new Date(nextStart.getTime() + duration)
    const payload = {
      id: calendarEvent.id,
      title: calendarEvent.title,
      start: nextStart.toISOString(),
      end: nextEnd.toISOString(),
      type: calendarEvent.type,
      location: calendarEvent.location,
      memo: calendarEvent.memo,
    }

    try {
      const response = await fetch('/api/erp/google/calendar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await response.json()) as { message?: string; event?: CalendarEvent }

      if (!response.ok) {
        throw new Error(data.message || '일정을 이동하지 못했습니다.')
      }

      const movedEvent = data.event || {
        ...calendarEvent,
        start: payload.start,
        end: payload.end,
      }

      setDeletedEventIds((current) => {
        const next = new Set(current)
        next.delete(movedEvent.id)
        return next
      })
      setLocalEvents((current) => [...current.filter((item) => item.id !== movedEvent.id), movedEvent])
      setActionStatus(data.message || '일정이 이동되었습니다.')

      if (movedEvent.source === 'google') {
        await onRefresh()
      }
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : '일정을 이동하지 못했습니다.')
    } finally {
      setSaving(false)
      setDraggingEventId(null)
      setDragOverSlot(null)
    }
  }

  const dropSlotProps = (targetDate: Date, hour?: number) => {
    const slotKey = slotKeyFor(targetDate, hour)

    return {
      onDragOver: (event: DragEvent<HTMLElement>) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setDragOverSlot((current) => (current === slotKey ? current : slotKey))
      },
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()
        const eventId = event.dataTransfer.getData('text/plain') || draggingEventId
        setDragOverSlot(null)

        if (eventId) {
          void moveEventToSlot(eventId, targetDate, hour)
        }
      },
    }
  }

  const renderEventButton = (calendarEvent: CalendarEvent, compact = false) => (
    <button
      key={calendarEvent.id}
      type="button"
      draggable
      onDragStart={(dragEvent) => {
        dragEvent.dataTransfer.effectAllowed = 'move'
        dragEvent.dataTransfer.setData('text/plain', calendarEvent.id)
        setDraggingEventId(calendarEvent.id)
      }}
      onDragEnd={() => {
        setDraggingEventId(null)
        setDragOverSlot(null)
      }}
      onClick={(clickEvent) => {
        clickEvent.stopPropagation()
        openEditModal(calendarEvent)
      }}
      className={`w-full cursor-grab truncate rounded border border-l-4 text-left font-bold text-gray-100 transition hover:brightness-125 active:cursor-grabbing ${draggingEventId === calendarEvent.id ? 'opacity-45' : ''} ${compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-2 text-xs'} ${calendarColor(calendarEvent) ? '' : eventTypeClass(calendarEvent.type)}`}
      style={calendarEventStyle(calendarEvent)}
      title={calendarEvent.title}
    >
      {compact ? calendarEvent.title : `${formatDateTime(calendarEvent.start)} · ${calendarEvent.title}`}
    </button>
  )

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold text-brand-blue">Google Calendar</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">일정관리</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">
            월·주·일 보기에서 Google Calendar 일정을 확인하고, 더블클릭으로 추가하며, 드래그로 날짜와 시간을 이동합니다.
          </p>
          {message ? <p className="mt-2 text-xs font-bold text-gray-500">{message}</p> : null}
          {visibleCalendars.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {visibleCalendars.map((calendarEvent) => (
                <span
                  key={calendarEvent.calendarId || calendarEvent.calendarName || calendarEvent.id}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black text-gray-200"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={calendarDotStyle(calendarEvent)} />
                  {calendarEvent.calendarName || '팀 공유 캘린더'}
                </span>
              ))}
            </div>
          ) : null}
          {actionStatus ? <p className="mt-2 text-xs font-bold text-blue-100">{actionStatus}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAnchorDate(new Date())}
            className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-blue px-3 text-sm font-black text-white transition hover:bg-blue-600"
          >
            일정 추가
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-black p-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveCalendar(-1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-300 hover:bg-white/5"
                aria-label="이전"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="min-w-56 text-center text-lg font-black text-white">{formatCalendarRange(calendarView, anchorDate)}</p>
              <button
                type="button"
                onClick={() => moveCalendar(1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-300 hover:bg-white/5"
                aria-label="다음"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <span className="inline-flex h-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] px-3 text-xs font-black text-gray-400">
              표시 일정 {visibleRangeEvents.length}건
            </span>
          </div>
          <div className="grid grid-cols-3 rounded-md border border-white/10 bg-white/[0.03] p-1">
            {[
              { id: 'month', label: '월' },
              { id: 'week', label: '주' },
              { id: 'day', label: '일' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCalendarView(item.id as 'month' | 'week' | 'day')}
                className={`h-8 rounded px-3 text-sm font-black transition ${
                  calendarView === item.id ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="min-h-[760px] overflow-hidden rounded-lg border border-white/10 bg-black">
            {calendarView === 'month' ? (
              <>
                <div className="grid grid-cols-7 border-b border-white/10 text-center text-xs font-black uppercase tracking-[0.12em] text-gray-600">
                  {weekDayLabels.map((day) => (
                    <div key={day} className="py-3">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {cells.map((cell, index) => {
                    const dayEvents = cell ? allEvents.filter((calendarEvent) => isSameDate(new Date(calendarEvent.start), cell)) : []
                    const slotKey = cell ? slotKeyFor(cell) : ''

                    return (
                      <div
                        key={`${year}-${month}-${index}`}
                        {...(cell ? dropSlotProps(cell) : {})}
                        onClick={() => {
                          if (cell) setAnchorDate(cell)
                        }}
                        onDoubleClick={() => {
                          if (cell) openCreateModal(cell)
                        }}
                        className={`min-h-[150px] cursor-default border-b border-r border-white/10 p-2.5 transition ${cell ? 'bg-[#07080b] hover:bg-white/[0.04]' : 'bg-white/[0.02]'} ${dragOverSlot === slotKey ? 'bg-brand-blue/10 ring-2 ring-inset ring-brand-blue/60' : ''}`}
                      >
                        {cell ? (
                          <>
                            <p className={`text-xs font-black ${isSameDate(cell, new Date()) ? 'text-brand-blue' : 'text-gray-500'}`}>
                              {cell.getDate()}
                            </p>
                            <div className="mt-2 space-y-1">
                              {dayEvents.slice(0, 6).map((calendarEvent) => renderEventButton(calendarEvent, true))}
                              {dayEvents.length > 6 ? (
                                <p className="text-[11px] font-bold text-gray-500">+{dayEvents.length - 6}개</p>
                              ) : null}
                            </div>
                          </>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </>
            ) : null}

            {calendarView === 'week' ? (
              <div className="overflow-x-auto">
                <div className="min-w-[980px]">
                  <div className="grid grid-cols-[64px_repeat(7,minmax(120px,1fr))] border-b border-white/10">
                    <div className="border-r border-white/10 px-2 py-3 text-xs font-black text-gray-600">시간</div>
                    {weekDays.map((day) => (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => setAnchorDate(day)}
                        onDoubleClick={() => openCreateModal(day)}
                        className={`border-r border-white/10 px-3 py-3 text-left transition hover:bg-white/[0.04] ${
                          isSameDate(day, new Date()) ? 'text-brand-blue' : 'text-gray-300'
                        }`}
                      >
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-gray-600">{weekDayLabels[day.getDay()]}</p>
                        <p className="mt-1 text-xl font-black">{day.getDate()}</p>
                      </button>
                    ))}
                  </div>
                  {calendarHours.map((hour) => (
                    <div key={hour} className="grid min-h-32 grid-cols-[64px_repeat(7,minmax(120px,1fr))] border-b border-white/10">
                      <div className="border-r border-white/10 px-2 py-2 text-xs font-bold text-gray-600">{String(hour).padStart(2, '0')}:00</div>
                      {weekDays.map((day) => {
                        const dayHourEvents = allEvents.filter((calendarEvent) => {
                          const start = new Date(calendarEvent.start)
                          return isSameDate(start, day) && start.getHours() === hour
                        })
                        const slotKey = slotKeyFor(day, hour)

                        return (
                          <div
                            key={`${day.toISOString()}-${hour}`}
                            {...dropSlotProps(day, hour)}
                            onDoubleClick={() => openCreateModal(day, hour)}
                            className={`space-y-1 border-r border-white/10 p-1.5 transition hover:bg-white/[0.04] ${dragOverSlot === slotKey ? 'bg-brand-blue/10 ring-2 ring-inset ring-brand-blue/60' : ''}`}
                          >
                            {dayHourEvents.map((calendarEvent) => renderEventButton(calendarEvent, true))}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {calendarView === 'day' ? (
              <div>
                <div className="border-b border-white/10 px-4 py-4">
                  <p className="text-sm font-bold text-gray-500">선택한 날짜</p>
                  <p className="mt-1 text-2xl font-black text-white">{formatCalendarRange('day', anchorDate)}</p>
                </div>
                {calendarHours.map((hour) => {
                  const hourEvents = allEvents.filter((calendarEvent) => {
                    const start = new Date(calendarEvent.start)
                    return isSameDate(start, anchorDate) && start.getHours() === hour
                  })
                  const slotKey = slotKeyFor(anchorDate, hour)

                  return (
                    <div key={hour} className="grid min-h-32 grid-cols-[72px_1fr] border-b border-white/10">
                      <div className="border-r border-white/10 px-3 py-3 text-xs font-bold text-gray-600">{String(hour).padStart(2, '0')}:00</div>
                      <div
                        {...dropSlotProps(anchorDate, hour)}
                        onDoubleClick={() => openCreateModal(anchorDate, hour)}
                        className={`space-y-2 p-2 transition hover:bg-white/[0.04] ${dragOverSlot === slotKey ? 'bg-brand-blue/10 ring-2 ring-inset ring-brand-blue/60' : ''}`}
                      >
                        {hourEvents.map((calendarEvent) => renderEventButton(calendarEvent))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>

        </div>
      </div>

      {modalMode ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-white/10 bg-[#0b0d12] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-brand-blue">Google Calendar</p>
                <h3 className="mt-2 text-xl font-black text-white">{modalMode === 'edit' ? '일정 수정' : '일정 추가'}</h3>
                {selectedEvent ? (
                  <p className="mt-1 inline-flex items-center gap-2 text-xs font-bold text-gray-500">
                    <span className="h-2.5 w-2.5 rounded-full" style={calendarDotStyle(selectedEvent)} />
                    {selectedEvent.calendarName || (selectedEvent.source === 'google' ? 'Google Calendar 일정' : 'ERP 로컬 일정')}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                aria-label="일정 팝업 닫기"
              >
                ×
              </button>
            </div>

            <CalendarEventForm
              newEvent={eventDraft}
              setNewEvent={setEventDraft}
              creating={saving}
              createMessage={actionStatus}
              onSubmit={saveCalendarEvent}
              submitLabel={modalMode === 'edit' ? '일정 수정 저장' : 'Google Calendar에 일정 추가'}
            />
            {modalMode === 'edit' ? (
              <button
                type="button"
                onClick={deleteCalendarEvent}
                disabled={saving}
                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-red-400/25 bg-red-400/10 px-3 text-sm font-black text-red-100 transition hover:border-red-400/50 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                일정 삭제
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function SettingsPanel() {
  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
        <p className="text-sm font-bold text-brand-blue">Settings</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">설정</h2>
        <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">
          매일 쓰는 업무 메뉴에서는 빼고, 외부 서비스 연동처럼 가끔 관리하는 항목만 모았습니다.
        </p>
      </div>

      <CalendarIntegrationPanel />
    </section>
  )
}

function CalendarIntegrationPanel() {
  const [accounts, setAccounts] = useState<CalendarAccountView[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/erp/google/calendar/oauth/accounts', { cache: 'no-store' })
      const data = (await response.json()) as CalendarAccountsResponse
      setAccounts(data.accounts || [])
      setMessage(data.message || '')
    } catch {
      setMessage('캘린더 연동 상태를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()

    const status = new URLSearchParams(window.location.search).get('calendarOAuth')
    if (status === 'connected') {
      setMessage('Google Calendar 연결이 완료되었습니다.')
    } else if (status) {
      setMessage(`Google Calendar 연결 상태: ${status}`)
    }
  }, [])

  const disconnectAccount = async (memberId: string) => {
    setMessage('')
    try {
      const response = await fetch('/api/erp/google/calendar/oauth/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })
      const data = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(data.message || '연동 해제에 실패했습니다.')
      }

      setMessage(data.message || 'Google Calendar 연동을 해제했습니다.')
      await loadAccounts()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '연동 해제에 실패했습니다.')
    }
  }

  const ownerAccount = accounts.find((account) => account.memberId === 'owner') || accounts[0]

  const setupSteps = [
    {
      title: '1. Google OAuth 연결',
      description: '팀원이 직접 Google 계정으로 로그인해 캘린더 읽기/쓰기 권한을 승인합니다.',
    },
    {
      title: '2. 팀 공유 캘린더만 사용',
      description: `${TEAM_CALENDAR_LABEL} 일정만 ERP에 표시하고, 개인 primary 캘린더 일정은 가져오지 않습니다.`,
    },
    {
      title: '3. 동기화 기준 설정',
      description: 'ERP에서 만든 일정만 보낼지, Google Calendar의 기존 일정까지 가져올지 선택합니다.',
    },
    {
      title: '4. 권한 만료 감지',
      description: 'refresh token 만료나 권한 회수 시 연동 상태를 경고하고 재연결 버튼을 노출합니다.',
    },
  ]

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold text-brand-blue">Calendar Integration</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">캘린더 연동</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400 keep-all">
            팀원별 Google Calendar 계정을 연결합니다. ERP 일정은 개인 캘린더가 아니라 {TEAM_CALENDAR_LABEL} 팀 공유 캘린더만 확인합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/erp/google/calendar/oauth/start?memberId=${ownerAccount?.memberId || 'owner'}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-blue px-3 text-sm font-black text-white transition hover:bg-blue-600"
          >
            Google 계정 연결
          </a>
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
          >
            OAuth 설정 열기
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {message ? (
        <div className="mx-5 mt-5 rounded-lg border border-brand-blue/25 bg-brand-blue/10 px-4 py-3 text-sm font-bold text-blue-100 md:mx-6">
          {message}
        </div>
      ) : null}

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_360px] md:p-6">
        <div className="overflow-x-auto rounded-lg border border-white/10 bg-black">
          <div className="grid min-w-[1040px] grid-cols-[1fr_1.3fr_0.7fr_1fr_1fr_1.1fr] border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-gray-500">
            <p>팀원</p>
            <p>Google 계정</p>
            <p>역할</p>
            <p>연동 상태</p>
            <p>ERP 표시 캘린더</p>
            <p>작업</p>
          </div>
          {loading ? (
            <p className="px-4 py-6 text-sm font-bold text-gray-500">연동 상태를 불러오는 중입니다.</p>
          ) : (
            accounts.map((row) => (
              <div
                key={row.memberId}
                className="grid min-w-[1040px] grid-cols-[1fr_1.3fr_0.7fr_1fr_1fr_1.1fr] items-center gap-3 border-b border-white/10 px-4 py-4 last:border-b-0"
              >
                <p className="font-black text-white">{row.name}</p>
                <p className="text-sm font-semibold text-gray-400">{row.email}</p>
                <p className="text-sm font-bold text-gray-300">{row.role}</p>
                <p className={`text-sm font-black ${row.connected ? 'text-emerald-100' : 'text-amber-100'}`}>
                  {row.connected ? '연결됨' : '권한 미연결'}
                </p>
                <p className="text-sm font-semibold text-gray-400">{TEAM_CALENDAR_LABEL} 자동 선택</p>
                <div className="flex gap-2">
                  <a
                    href={`/api/erp/google/calendar/oauth/start?memberId=${row.memberId}`}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-brand-blue px-3 text-xs font-black text-white transition hover:bg-blue-600"
                  >
                    {row.connected ? '재연결' : '연결'}
                  </a>
                  <button
                    type="button"
                    onClick={() => disconnectAccount(row.memberId)}
                    disabled={!row.connected}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-white/15 px-3 text-xs font-black text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    해제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-sm font-black text-white">현재 구현 상태</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-gray-400 keep-all">
            <p>
              이제 팀원별 Google OAuth 승인과 refresh token 저장 구조가 추가되었습니다. ERP는 연결 계정의 캘린더 목록에서
              {TEAM_CALENDAR_LABEL}만 찾아서 읽고 씁니다.
            </p>
            <p>
              Notion 저장소가 아직 연결되지 않은 환경에서는 기존 로컬 `.erp-private/` 저장소로 자동 전환됩니다. 운영 배포에서는
              Vercel 환경변수에 Notion DB ID와 암호화 키를 함께 등록해야 합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-white/10 p-5 md:grid-cols-4 md:p-6">
        {setupSteps.map((step) => (
          <div key={step.title} className="rounded-lg border border-white/10 bg-black p-4">
            <p className="font-black text-white">{step.title}</p>
            <p className="mt-3 text-sm leading-6 text-gray-500 keep-all">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function MailPanel({
  mails,
  loading,
  message,
  onRefresh,
}: {
  mails: MailItem[]
  loading: boolean
  message: string
  onRefresh: () => void
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold text-brand-blue">Gmail Inbox</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">메일관리</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">
            사용하는 Gmail 받은편지함의 최근 메일을 확인합니다. 견적, 자료 요청, 미팅 후속 메일을 ERP에서 같이 볼 수 있게 연결합니다.
          </p>
          {message ? <p className="mt-2 text-xs font-bold text-gray-500">{message}</p> : null}
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          메일 새로고침
        </button>
      </div>

      <div className="divide-y divide-white/10">
        {mails.length === 0 ? (
          <p className="p-6 text-sm font-bold text-gray-500">표시할 메일이 없습니다.</p>
        ) : (
          mails.map((mail) => (
            <article key={mail.id} className="grid gap-3 p-5 hover:bg-white/[0.03] md:grid-cols-[180px_1fr_140px] md:p-6">
              <div>
                <p className={`text-sm keep-all ${mail.unread ? 'font-black text-white' : 'font-semibold text-gray-400'}`}>
                  {mail.from}
                </p>
                {mail.unread ? (
                  <span className="mt-2 inline-flex rounded-full border border-brand-blue/25 bg-brand-blue/10 px-2 py-1 text-[11px] font-black text-blue-100">
                    새 메일
                  </span>
                ) : null}
              </div>
              <div>
                <h3 className={`text-base keep-all ${mail.unread ? 'font-black text-white' : 'font-bold text-gray-300'}`}>
                  {mail.subject}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500 keep-all">{mail.snippet}</p>
              </div>
              <p className="text-sm font-bold text-gray-500 md:text-right">{formatDateTime(mail.receivedAt)}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

function OperationsPanel({
  view,
  selectedStoreTitle,
  onSelectStore,
}: {
  view: OperationView
  selectedStoreTitle?: string
  onSelectStore?: (storeTitle: string) => void
}) {
  const isStoreOperations = view.rows.some((row) => row.products)
  const [copiedRowTitle, setCopiedRowTitle] = useState('')
  const [selectedCopyRowTitle, setSelectedCopyRowTitle] = useState('')

  if (isStoreOperations) {
    return <StoreOperationsPanel view={view} selectedStoreTitle={selectedStoreTitle} onSelectStore={onSelectStore} />
  }

  const copyAssetText = async (row: OperationRow) => {
    if (!row.copyText) return

    try {
      await navigator.clipboard.writeText(row.copyText)
      setCopiedRowTitle(row.title)
      window.setTimeout(() => setCopiedRowTitle(''), 1800)
    } catch {
      setCopiedRowTitle('')
    }
  }

  const copyRows = view.rows.filter((row) => row.copyText)
  const hasCopyRows = copyRows.length > 0
  const selectedCopyRow = copyRows.find((row) => row.title === selectedCopyRowTitle)

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="grid gap-5 border-b border-white/10 p-5 md:grid-cols-[1fr_360px] md:p-6">
        <div>
          <p className="text-sm font-bold text-brand-blue">{view.kicker}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{view.title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">{view.description}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {view.stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/10 bg-black p-4">
              <p className="text-xs font-bold text-gray-500 keep-all">{stat.label}</p>
              <p className="mt-3 text-3xl font-black tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedCopyRow ? (
        <div className="space-y-3 border-b border-white/10 p-5 md:p-6">
          <article className="rounded-lg border border-white/10 bg-black p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-blue">콘텐츠 상세</p>
                <h3 className="mt-2 text-lg font-black text-white keep-all">{selectedCopyRow.title}</h3>
                <p className="mt-1 text-sm font-semibold text-gray-500 keep-all">{selectedCopyRow.meta}</p>
              </div>
              <button
                type="button"
                onClick={() => copyAssetText(selectedCopyRow)}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-black text-gray-200 transition hover:border-brand-blue/50 hover:bg-brand-blue/10 hover:text-white"
              >
                <Copy className="h-4 w-4" />
                {copiedRowTitle === selectedCopyRow.title ? '복사됨' : '문구 복사'}
              </button>
            </div>
            <pre className="mt-4 max-h-[360px] overflow-auto rounded-lg border border-white/10 bg-white/[0.03] p-4 whitespace-pre-wrap break-keep font-sans text-sm font-semibold leading-7 text-gray-300">{selectedCopyRow.copyText}</pre>
          </article>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className={`${isStoreOperations ? 'min-w-[1240px]' : 'min-w-[1080px] table-fixed'} w-full border-collapse text-left text-sm`}>
          {!isStoreOperations ? (
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[128px]" />
              <col className="w-[144px]" />
              <col className="w-[104px]" />
              <col />
              {hasCopyRows ? <col className="w-[112px]" /> : null}
            </colgroup>
          ) : null}
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-gray-500">
            {isStoreOperations ? (
              <tr>
                <th className="px-5 py-4">매장명</th>
                <th className="px-5 py-4">상태</th>
                <th className="px-5 py-4">구글프로필</th>
                <th className="px-5 py-4">구글애즈</th>
                <th className="px-5 py-4">웹사이트·블로그</th>
                <th className="px-5 py-4">자료요청</th>
                <th className="px-5 py-4">다음 작업</th>
                <th className="px-5 py-4">담당</th>
              </tr>
            ) : (
              <tr>
                <th className="px-5 py-4">업무</th>
                <th className="px-5 py-4 whitespace-nowrap">상태</th>
                <th className="px-5 py-4 whitespace-nowrap">담당</th>
                <th className="px-5 py-4 whitespace-nowrap">기한</th>
                <th className="px-5 py-4">메모</th>
                {hasCopyRows ? <th className="px-5 py-4 whitespace-nowrap">보기</th> : null}
              </tr>
            )}
          </thead>
          <tbody>
            {view.rows.map((row) => {
              const canOpenCopy = !isStoreOperations && Boolean(row.copyText)
              return (
                <tr
                  key={`${view.title}-${row.title}`}
                  onClick={canOpenCopy ? () => setSelectedCopyRowTitle(row.title) : undefined}
                  className={`border-t border-white/10 ${canOpenCopy ? 'cursor-pointer transition hover:bg-white/[0.03]' : ''}`}
                >
                  {isStoreOperations && row.products ? (
                    <>
                      <td className="px-5 py-4">
                        <p className="font-black text-white keep-all">{row.title}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-500 keep-all">{row.meta}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full border border-brand-blue/25 bg-brand-blue/10 px-2.5 py-1 text-xs font-bold text-blue-100">
                          {row.status}
                        </span>
                      </td>
                      <td className="max-w-[180px] px-5 py-4 font-semibold leading-6 text-gray-300 keep-all">
                        {row.products.googleProfile}
                      </td>
                      <td className="max-w-[170px] px-5 py-4 font-semibold leading-6 text-gray-300 keep-all">
                        {row.products.googleAds}
                      </td>
                      <td className="max-w-[190px] px-5 py-4 font-semibold leading-6 text-gray-300 keep-all">
                        {row.products.website}
                      </td>
                      <td className="max-w-[170px] px-5 py-4 font-semibold leading-6 text-gray-300 keep-all">
                        {row.products.material}
                      </td>
                      <td className="max-w-[220px] px-5 py-4 font-black leading-6 text-white keep-all">
                        {row.products.nextAction}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-300">{row.owner}</p>
                        <p className="mt-1 text-xs font-bold text-gray-500">{row.due}</p>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-4">
                        <p className="font-black text-white keep-all">{row.title}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-500 keep-all">{row.meta}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex whitespace-nowrap rounded-full border border-brand-blue/25 bg-brand-blue/10 px-3 py-1.5 text-xs font-bold text-blue-100">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold whitespace-nowrap text-gray-300">{row.owner}</td>
                      <td className="px-5 py-4 font-black whitespace-nowrap text-white">{row.due}</td>
                      <td className="max-w-md px-5 py-4 font-semibold leading-6 text-gray-400 keep-all">{row.memo}</td>
                      {hasCopyRows ? (
                        <td className="px-5 py-4">
                          {row.copyText ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedCopyRowTitle(row.title)
                              }}
                              className={`inline-flex h-9 items-center justify-center rounded-md border px-3 text-xs font-black transition ${
                                selectedCopyRowTitle === row.title
                                  ? 'border-brand-blue/60 bg-brand-blue text-white'
                                  : 'border-white/15 text-gray-200 hover:border-brand-blue/50 hover:bg-brand-blue/10 hover:text-white'
                              }`}
                            >
                              {selectedCopyRowTitle === row.title ? '선택됨' : '보기'}
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-gray-700">-</span>
                          )}
                        </td>
                      ) : null}
                    </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ReportOperationsPanel({
  view,
  stores,
  selectedStoreTitle,
  onSelectStore,
}: {
  view: OperationView
  stores: StoreRecord[]
  selectedStoreTitle?: string
  onSelectStore?: (storeTitle: string) => void
}) {
  const contractedStoreNames = new Set(
    stores
      .filter((store) => statusIncludesAny(store.status, ['계약 완료', '계약완료', '운영시작', '운영 시작']))
      .map((store) => store.name.replace(/\s+/g, ''))
  )
  const reportRows = view.rows.filter((row) => {
    const compactTitle = row.title.replace(/\s+/g, '')
    return (
      statusIncludesAny(row.status, ['계약 완료', '계약완료', '운영중', '운영시작']) ||
      contractedStoreNames.has(compactTitle)
    )
  })
  const rows = reportRows.length ? reportRows : view.rows
  const reportView: OperationView = {
    ...view,
    kicker: 'Report Operations',
    title: '리포트',
    description: '매장 운영관리에 등록된 계약완료·운영중 매장만 보고 대상으로 관리합니다.',
    stats: [
      { label: '보고 대상', value: String(rows.length) },
      { label: '이번 주 보고', value: '5회' },
      { label: '누락 기준', value: '0건' },
    ],
    rows,
  }
  const fallbackStoreTitle = rows[0]?.title || ''
  const activeStoreTitle = rows.some((row) => row.title === selectedStoreTitle) ? selectedStoreTitle : fallbackStoreTitle

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
        <p className="text-sm font-bold text-brand-blue">Report Sample</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">계약완료 매장 중심 리포트 보드</h2>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-400 keep-all">
          리포트는 전체 문의 DB가 아니라, 매장 운영관리에 등록된 실제 운영 매장 기준으로만 봅니다. 매장 선택 후 구글프로필,
          구글애즈, 웹사이트·블로그별 발송상태를 날짜 단위로 관리하는 구조입니다.
        </p>
      </div>
      <StoreOperationsPanel view={reportView} selectedStoreTitle={activeStoreTitle} onSelectStore={onSelectStore} />
    </section>
  )
}

function StoreOperationsPanel({
  view,
  selectedStoreTitle,
  onSelectStore,
}: {
  view: OperationView
  selectedStoreTitle?: string
  onSelectStore?: (storeTitle: string) => void
}) {
  const [activeProduct, setActiveProduct] = useState<StoreProductKey>('googleProfile')
  const selectedStore = view.rows.find((row) => row.title === selectedStoreTitle) || view.rows[0]
  const workspaces = selectedStore?.productWorkspaces || []
  const activeWorkspace = workspaces.find((workspace) => workspace.key === activeProduct) || workspaces[0]
  const [weeklyReportDates, setWeeklyReportDates] = useState(() => getCurrentWeekDates())
  const weekStart = useMemo(() => toISODate(weeklyReportDates[0]), [weeklyReportDates])
  const [weeklyReports, setWeeklyReports] = useState<StoreWeeklyReport[]>([])
  const [reportHistory, setReportHistory] = useState<StoreWeeklyReport[]>([])
  const [weeklyReportLoading, setWeeklyReportLoading] = useState(false)
  const [reportHistoryLoading, setReportHistoryLoading] = useState(false)
  const [weeklyReportMessage, setWeeklyReportMessage] = useState('')
  const [reportHistoryMessage, setReportHistoryMessage] = useState('')
  const [selectedHistoryWeekKey, setSelectedHistoryWeekKey] = useState('')
  const [updatingReportDate, setUpdatingReportDate] = useState<string | null>(null)
  const [autoSavingReportDate, setAutoSavingReportDate] = useState<string | null>(null)
  const [autoSavedReportDate, setAutoSavedReportDate] = useState<string | null>(null)
  const [autoSaveErrorDate, setAutoSaveErrorDate] = useState<string | null>(null)
  const [generatingReportDate, setGeneratingReportDate] = useState<string | null>(null)
  const [reportDrafts, setReportDrafts] = useState<Record<string, string>>({})
  const [selectedWeeklyReportDate, setSelectedWeeklyReportDate] = useState('')
  const reportDraftsRef = useRef(reportDrafts)
  const lastSavedReportMemoRef = useRef<Record<string, string>>({})
  const savingReportMemoRef = useRef<Record<string, string>>({})
  const autoSaveTimerRef = useRef<number | null>(null)
  const autoSaveVersionRef = useRef(0)
  const [historyDetail, setHistoryDetail] = useState<{
    report: StoreWeeklyReport
    date: Date
  } | null>(null)
  const displayWeeklyReports = weeklyReports.length ? weeklyReports : activeWorkspace?.weeklyReports || []
  const historyWeekGroups = useMemo(() => groupReportHistoryByWeek(reportHistory), [reportHistory])
  const selectedHistoryWeek =
    historyWeekGroups.find((group) => group.key === selectedHistoryWeekKey) || historyWeekGroups[0]
  const weeklyReportItems = useMemo(
    () =>
      displayWeeklyReports.map((report) => {
        const date = report.date
          ? parseLocalDate(report.date)
          : weeklyReportDates[report.dayOffset] || weeklyReportDates[0]
        const dateKey = report.date || toISODate(date)

        return {
          report,
          date,
          dateKey,
          draftMemo: reportDrafts[dateKey] ?? report.memo ?? '',
        }
      }),
    [displayWeeklyReports, reportDrafts, weeklyReportDates]
  )
  const selectedWeeklyReport =
    weeklyReportItems.find((item) => item.dateKey === selectedWeeklyReportDate) || weeklyReportItems[0]
  const weeklyReportSummary = summarizeReports(weeklyReportItems.map((item) => item.report))
  const selectedWeeklyReportUpdating = selectedWeeklyReport
    ? updatingReportDate === selectedWeeklyReport.dateKey
    : false
  const selectedWeeklyReportGenerating = selectedWeeklyReport
    ? generatingReportDate === selectedWeeklyReport.dateKey
    : false
  const selectedWeeklyReportAutoSaveStatus = selectedWeeklyReport
    ? autoSavingReportDate === selectedWeeklyReport.dateKey
      ? '저장 중'
      : autoSaveErrorDate === selectedWeeklyReport.dateKey
        ? '자동저장 실패'
        : autoSavedReportDate === selectedWeeklyReport.dateKey
          ? '자동저장됨'
          : '자동저장 대기'
    : ''

  useEffect(() => {
    reportDraftsRef.current = reportDrafts
  }, [reportDrafts])

  useEffect(() => {
    const syncReportWeek = () => {
      setWeeklyReportDates((current) => {
        const next = getCurrentWeekDates()
        return toISODate(current[0]) === toISODate(next[0]) ? current : next
      })
    }
    const interval = window.setInterval(syncReportWeek, 60 * 1000)

    syncReportWeek()

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (workspaces.length && !workspaces.some((workspace) => workspace.key === activeProduct)) {
      setActiveProduct(workspaces[0].key)
    }
  }, [activeProduct, workspaces])

  useEffect(() => {
    if (!weeklyReportItems.length) {
      if (selectedWeeklyReportDate) setSelectedWeeklyReportDate('')
      return
    }

    if (!weeklyReportItems.some((item) => item.dateKey === selectedWeeklyReportDate)) {
      setSelectedWeeklyReportDate(weeklyReportItems[0].dateKey)
    }
  }, [selectedWeeklyReportDate, weeklyReportItems])

  useEffect(() => {
    if (!historyWeekGroups.length) {
      if (selectedHistoryWeekKey) setSelectedHistoryWeekKey('')
      return
    }

    if (!historyWeekGroups.some((group) => group.key === selectedHistoryWeekKey)) {
      setSelectedHistoryWeekKey(historyWeekGroups[0].key)
    }
  }, [historyWeekGroups, selectedHistoryWeekKey])

  const loadWeeklyReports = useCallback(async (silent = false) => {
    if (!selectedStore || !activeWorkspace?.weeklyReports?.length) {
      setWeeklyReports([])
      setReportHistory([])
      setWeeklyReportMessage('')
      setReportHistoryMessage('')
      return
    }

    if (!silent) {
      setWeeklyReportLoading(true)
      setReportHistoryLoading(true)
    }

    try {
      const params = new URLSearchParams({
        store: selectedStore.title,
        product: activeWorkspace.key,
        weekStart,
      })
      const historyParams = new URLSearchParams({
        store: selectedStore.title,
        product: activeWorkspace.key,
        weekStart,
        mode: 'history',
      })
      const [weekResponse, historyResponse] = await Promise.all([
        fetch(`/api/erp/reports?${params.toString()}`, { cache: 'no-store' }),
        fetch(`/api/erp/reports?${historyParams.toString()}`, { cache: 'no-store' }),
      ])
      const data = (await weekResponse.json()) as WeeklyReportApiResponse
      const historyData = (await historyResponse.json()) as WeeklyReportApiResponse
      setWeeklyReports(data.reports || [])
      setReportHistory(historyData.reports || [])
      const nextReportDrafts = Object.fromEntries((data.reports || []).map((report) => [report.date, report.memo || '']))
      lastSavedReportMemoRef.current = nextReportDrafts
      setReportDrafts(nextReportDrafts)
      setWeeklyReportMessage(
        data.message ||
          (data.connected ? 'Notion 보고 DB와 연결되었습니다.' : '보고 DB 연결 전 샘플 데이터로 표시 중입니다.')
      )
      setReportHistoryMessage(
        historyData.message ||
          (historyData.connected ? '기존 보고 현황을 불러왔습니다.' : '보고 DB 연결 전 샘플 기존 보고로 표시 중입니다.')
      )
    } catch {
      setWeeklyReports(activeWorkspace.weeklyReports || [])
      const nextReportDrafts = Object.fromEntries(
        (activeWorkspace.weeklyReports || []).map((report) => {
          const date = report.date || toISODate(weeklyReportDates[report.dayOffset] || weeklyReportDates[0])
          return [date, report.memo || '']
        })
      )
      lastSavedReportMemoRef.current = nextReportDrafts
      setReportDrafts(nextReportDrafts)
      setReportHistory([])
      setWeeklyReportMessage('보고 DB를 불러오지 못해 기본 주간 보고표로 표시 중입니다.')
      setReportHistoryMessage('기존 보고 현황을 불러오지 못했습니다.')
    } finally {
      if (!silent) {
        setWeeklyReportLoading(false)
        setReportHistoryLoading(false)
      }
    }
  }, [activeWorkspace?.key, activeWorkspace?.weeklyReports, selectedStore, weekStart, weeklyReportDates])

  useEffect(() => {
    let cancelled = false
    const syncReports = async (silent = false) => {
      if (cancelled) return
      await loadWeeklyReports(silent)
    }

    syncReports()

    const syncOnFocus = () => syncReports(true)
    const interval = window.setInterval(() => {
      const activeTag = document.activeElement?.tagName
      if (activeTag === 'TEXTAREA' || activeTag === 'INPUT' || activeTag === 'SELECT') return
      syncReports(true)
    }, 30000)

    window.addEventListener('focus', syncOnFocus)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener('focus', syncOnFocus)
    }
  }, [loadWeeklyReports])

  const saveWeeklyReport = useCallback(async ({
    report,
    reportDateKey,
    status,
    memo,
    mode = 'manual',
  }: {
    report: StoreWeeklyReport
    reportDateKey: string
    status: StoreWeeklyReportStatus
    memo: string
    mode?: 'manual' | 'auto'
  }) => {
    if (!selectedStore || !activeWorkspace) return false

    const reportMemo = memo
    if (mode === 'manual') {
      setUpdatingReportDate(reportDateKey)
    } else {
      setAutoSavingReportDate(reportDateKey)
      setAutoSavedReportDate(null)
      setAutoSaveErrorDate(null)
      savingReportMemoRef.current = {
        ...savingReportMemoRef.current,
        [reportDateKey]: reportMemo,
      }
    }
    setWeeklyReports((current) => {
      const source = current.length ? current : displayWeeklyReports
      return source.map((item) => {
        const itemDate = item.date || toISODate(weeklyReportDates[item.dayOffset] || weeklyReportDates[0])
        return itemDate === reportDateKey
          ? {
              ...item,
              status,
              memo: reportMemo,
              reporter: status === '보고완료' ? item.reporter || '블링크애드' : item.reporter,
              completedAt: status === '보고완료' ? item.completedAt || new Date().toISOString() : undefined,
            }
          : item
      })
    })

    try {
      const response = await fetch('/api/erp/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store: selectedStore.title,
          product: activeWorkspace.key,
          date: reportDateKey,
          weekStart,
          title: report.title,
          memo: reportMemo,
          status,
        }),
      })
      const data = (await response.json()) as WeeklyReportApiResponse
      if (data.connected) {
        setWeeklyReports(data.reports || [])
        const nextReportDrafts = Object.fromEntries((data.reports || []).map((item) => [item.date, item.memo || '']))
        lastSavedReportMemoRef.current = {
          ...lastSavedReportMemoRef.current,
          ...nextReportDrafts,
          [reportDateKey]: reportMemo,
        }
        setReportDrafts((current) => ({
          ...nextReportDrafts,
          ...current,
          [reportDateKey]: current[reportDateKey] === reportMemo ? nextReportDrafts[reportDateKey] || reportMemo : current[reportDateKey],
        }))
      } else {
        lastSavedReportMemoRef.current = {
          ...lastSavedReportMemoRef.current,
          [reportDateKey]: reportMemo,
        }
      }
      if (mode === 'manual') {
        setWeeklyReportMessage(data.message || '보고 내용을 저장했습니다.')
      } else {
        setWeeklyReportMessage(data.message || '보고 내용이 자동 저장되었습니다.')
        setAutoSavedReportDate(reportDateKey)
      }
      return true
    } catch {
      if (mode === 'manual') {
        setWeeklyReportMessage('보고 내용 저장 중 오류가 발생했습니다.')
      } else {
        setWeeklyReportMessage('보고 내용 자동저장 중 오류가 발생했습니다.')
        setAutoSaveErrorDate(reportDateKey)
      }
      return false
    } finally {
      if (mode === 'manual') {
        setUpdatingReportDate(null)
      } else {
        window.setTimeout(() => {
          if (savingReportMemoRef.current[reportDateKey] === reportMemo) {
            const nextSavingMemos = { ...savingReportMemoRef.current }
            delete nextSavingMemos[reportDateKey]
            savingReportMemoRef.current = nextSavingMemos
          }
        }, 0)
        setAutoSavingReportDate(null)
      }
    }
  }, [activeWorkspace, displayWeeklyReports, selectedStore, weekStart, weeklyReportDates])

  const updateWeeklyReportStatus = async (
    report: StoreWeeklyReport,
    reportDateKey: string,
    status: StoreWeeklyReportStatus,
    memoOverride?: string
  ) => {
    const reportMemo = memoOverride ?? reportDrafts[reportDateKey] ?? report.memo
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }
    autoSaveVersionRef.current += 1
    await saveWeeklyReport({
      report,
      reportDateKey,
      status,
      memo: reportMemo,
      mode: 'manual',
    })
  }

  useEffect(() => {
    if (!selectedWeeklyReport || !selectedStore || !activeWorkspace) return

    const reportDateKey = selectedWeeklyReport.dateKey
    const reportMemo = selectedWeeklyReport.draftMemo
    const lastSavedMemo =
      savingReportMemoRef.current[reportDateKey] ??
      lastSavedReportMemoRef.current[reportDateKey] ??
      selectedWeeklyReport.report.memo ??
      ''

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current)
      autoSaveTimerRef.current = null
    }

    if (reportMemo === lastSavedMemo) return

    const autoSaveVersion = autoSaveVersionRef.current + 1
    autoSaveVersionRef.current = autoSaveVersion
    setAutoSavedReportDate(null)
    setAutoSaveErrorDate(null)

    autoSaveTimerRef.current = window.setTimeout(async () => {
      const saved = await saveWeeklyReport({
        report: selectedWeeklyReport.report,
        reportDateKey,
        status: selectedWeeklyReport.report.status,
        memo: reportMemo,
        mode: 'auto',
      })

      if (
        saved &&
        autoSaveVersionRef.current === autoSaveVersion &&
        reportDraftsRef.current[reportDateKey] === reportMemo
      ) {
        lastSavedReportMemoRef.current = {
          ...lastSavedReportMemoRef.current,
          [reportDateKey]: reportMemo,
        }
      }
    }, 900)

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
    }
  }, [activeWorkspace, saveWeeklyReport, selectedStore, selectedWeeklyReport])

  const canAutoGenerateReport = (title: string) =>
    title.includes('키워드') || title.includes('종합') || title.includes('데이터') || title.includes('마감')

  const generateReportMemo = async (report: StoreWeeklyReport, reportDateKey: string) => {
    if (!selectedStore || !activeWorkspace) return

    setGeneratingReportDate(reportDateKey)
    try {
      const response = await fetch('/api/erp/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store: selectedStore.title,
          product: activeWorkspace.key,
          weekStart,
          date: reportDateKey,
          title: report.title,
        }),
      })
      const data = (await response.json()) as WeeklyReportApiResponse
      setWeeklyReports(data.reports || [])
      const nextReportDrafts = Object.fromEntries((data.reports || []).map((item) => [item.date, item.memo || '']))
      lastSavedReportMemoRef.current = nextReportDrafts
      setReportDrafts(nextReportDrafts)
      setWeeklyReportMessage(data.message || `${report.title} 보고 내용을 자동 생성했습니다.`)
    } catch {
      setWeeklyReportMessage(`${report.title} 보고 자동 생성 중 오류가 발생했습니다.`)
    } finally {
      setGeneratingReportDate(null)
    }
  }

  return (
    <section className="space-y-5">
      {selectedStore ? (
        <>
          <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
            <div>
              <p className="text-sm font-bold text-brand-blue">{view.kicker}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                {selectedStore.title}
              </h2>
              {workspaces.length ? (
                <StoreWorkspaceTabs
                  workspaces={workspaces}
                  activeProduct={activeWorkspace?.key || activeProduct}
                  onSelectProduct={setActiveProduct}
                />
              ) : null}
              <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-400 keep-all">{selectedStore.memo}</p>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto lg:hidden">
              {view.rows.map((store) => (
                <button
                  key={store.title}
                  type="button"
                  onClick={() => {
                    onSelectStore?.(store.title)
                    setActiveProduct(store.productWorkspaces?.[0]?.key || 'googleProfile')
                  }}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${
                    selectedStore.title === store.title ? 'bg-white text-black' : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {store.title}
                </button>
              ))}
            </div>
          </div>

          {activeWorkspace ? (
            <div className="rounded-lg border border-white/10 bg-black">
              {weeklyReportItems.length && selectedWeeklyReport ? (
                <div className="border-b border-white/10 p-5 md:p-6">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                      <p className="text-sm font-bold text-brand-blue">Weekly Report</p>
                      <h4 className="mt-2 text-xl font-black text-white">이번 주 작업보고 현황</h4>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                        <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-emerald-100">
                          완료 {weeklyReportSummary.done}
                        </span>
                        <span className="rounded-full border border-brand-blue/25 bg-brand-blue/10 px-3 py-1.5 text-blue-100">
                          작성중 {weeklyReportSummary.inProgress}
                        </span>
                        <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-amber-100">
                          대기 {weeklyReportSummary.pending}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 xl:items-end">
                      <div className="text-sm font-semibold text-gray-500 xl:text-right">
                        <p className="keep-all">요일을 선택하면 아래에서 보고 내용을 넓게 확인하고 수정합니다.</p>
                        <p className="mt-1 keep-all">
                          {weeklyReportLoading ? '보고 DB 확인 중입니다.' : weeklyReportMessage}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={weeklyReportLoading}
                        onClick={() => loadWeeklyReports()}
                        className="h-10 rounded-md border border-white/10 px-4 text-sm font-black text-gray-200 transition hover:border-brand-blue/40 hover:bg-brand-blue/10 hover:text-white disabled:cursor-not-allowed disabled:text-gray-600"
                      >
                        {weeklyReportLoading ? '동기화 중' : 'Notion 동기화'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 lg:grid-cols-5">
                    {weeklyReportItems.map((item) => {
                      const active = item.dateKey === selectedWeeklyReport.dateKey

                      return (
                        <button
                          key={`${activeWorkspace.key}-report-tab-${item.dateKey}`}
                          type="button"
                          onClick={() => setSelectedWeeklyReportDate(item.dateKey)}
                          className={`min-h-[156px] rounded-lg border p-4 text-left transition ${
                            active
                              ? 'border-brand-blue/60 bg-brand-blue/15'
                              : 'border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex min-h-16 items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-black text-gray-500">{formatWeekday(item.date)}</p>
                              <p className="mt-2 whitespace-nowrap text-3xl font-black leading-none tracking-tight text-white">
                                {formatMonthDay(item.date)}
                              </p>
                            </div>
                            <span className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-black leading-none ${weeklyReportBadge(item.report.status)}`}>
                              {item.report.status}
                            </span>
                          </div>
                          <p className="mt-4 min-h-7 font-black leading-7 text-white keep-all">{item.report.title}</p>
                          <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-gray-500 keep-all">
                            {item.draftMemo || '보고 내용 입력 전입니다.'}
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-5 grid gap-4 rounded-lg border border-white/10 bg-white/[0.025] p-4 xl:grid-cols-[1fr_280px]">
                    <div>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-blue">Selected Report</p>
                          <h5 className="mt-2 text-2xl font-black text-white keep-all">{selectedWeeklyReport.report.title}</h5>
                          <p className="mt-2 text-sm font-bold text-gray-500">
                            {formatMonthDay(selectedWeeklyReport.date)} · {formatWeekday(selectedWeeklyReport.date)}
                          </p>
                        </div>
                        <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-black ${weeklyReportBadge(selectedWeeklyReport.report.status)}`}>
                          {selectedWeeklyReport.report.status}
                        </span>
                      </div>
                      <label className="mt-4 block">
                        <span className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-gray-500">
                          <span>보고 내용</span>
                          <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] leading-none ${autoSaveStatusBadge(selectedWeeklyReportAutoSaveStatus)}`}>
                            {selectedWeeklyReportAutoSaveStatus}
                          </span>
                        </span>
                        <textarea
                          value={selectedWeeklyReport.draftMemo}
                          disabled={selectedWeeklyReportUpdating}
                          onChange={(event) =>
                            setReportDrafts((current) => ({
                              ...current,
                              [selectedWeeklyReport.dateKey]: event.target.value,
                            }))
                          }
                          className="min-h-[320px] w-full resize-y rounded-md border border-white/10 bg-black px-4 py-3 text-sm font-semibold leading-6 text-gray-100 outline-none transition placeholder:text-gray-600 hover:border-white/25 focus:border-brand-blue/50 disabled:cursor-not-allowed disabled:text-gray-500"
                          placeholder="오늘 보고한 내용을 입력하세요."
                        />
                      </label>
                    </div>

                    <aside className="rounded-lg border border-white/10 bg-black p-4">
                      <p className="text-sm font-black text-white">보고 액션</p>
                      <p className="mt-2 text-xs font-semibold leading-5 text-gray-500 keep-all">
                        선택한 보고의 상태와 내용을 저장합니다.
                      </p>
                      <label className="mt-4 block">
                        <span className="mb-2 block text-[11px] font-black text-gray-600">발송상태</span>
                        <select
                          value={selectedWeeklyReport.report.status}
                          disabled={selectedWeeklyReportUpdating}
                          onChange={(event) =>
                            updateWeeklyReportStatus(
                              selectedWeeklyReport.report,
                              selectedWeeklyReport.dateKey,
                              event.target.value as StoreWeeklyReportStatus,
                              selectedWeeklyReport.draftMemo
                            )
                          }
                          className="h-10 w-full rounded-md border border-white/10 bg-[#0b0d12] px-3 text-sm font-black text-white outline-none transition hover:border-white/25 disabled:cursor-not-allowed disabled:text-gray-500"
                        >
                          {REPORT_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        disabled={selectedWeeklyReportUpdating || selectedWeeklyReportGenerating}
                        onClick={() =>
                          updateWeeklyReportStatus(
                            selectedWeeklyReport.report,
                            selectedWeeklyReport.dateKey,
                            selectedWeeklyReport.report.status,
                            selectedWeeklyReport.draftMemo
                          )
                        }
                        className="mt-3 h-10 w-full rounded-md bg-brand-blue px-3 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
                      >
                        {selectedWeeklyReportUpdating ? '저장 중' : '보고 저장'}
                      </button>
                      {activeWorkspace.key === 'googleProfile' && canAutoGenerateReport(selectedWeeklyReport.report.title) ? (
                        <button
                          type="button"
                          disabled={selectedWeeklyReportUpdating || selectedWeeklyReportGenerating}
                          onClick={() => generateReportMemo(selectedWeeklyReport.report, selectedWeeklyReport.dateKey)}
                          className="mt-2 h-10 w-full rounded-md border border-brand-blue/35 bg-brand-blue/10 px-3 text-sm font-black text-blue-100 transition hover:border-brand-blue/60 hover:bg-brand-blue/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-500"
                        >
                          {selectedWeeklyReportGenerating ? '생성 중' : '멘트 자동생성'}
                        </button>
                      ) : null}
                      {selectedWeeklyReport.report.status === '보고완료' ? (
                        <p className="mt-4 text-xs font-bold leading-5 text-emerald-100/80 keep-all">
                          {selectedWeeklyReport.report.reporter ? `${selectedWeeklyReport.report.reporter} · ` : ''}
                          {selectedWeeklyReport.report.completedAt
                            ? formatDateTime(selectedWeeklyReport.report.completedAt)
                            : '보고완료'}
                        </p>
                      ) : null}
                    </aside>
                  </div>
                </div>
              ) : null}
              {activeWorkspace.key === 'googleAds' ? (
                <GoogleAdsPerformancePanel workspace={activeWorkspace} storeTitle={selectedStore.title} />
              ) : null}
              {activeWorkspace.key === 'websiteBlog' ? <WebsiteBlogProductionPanel workspace={activeWorkspace} /> : null}
              <div className="border-b border-white/10 p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-blue">Report History</p>
                    <h4 className="mt-2 text-xl font-black text-white">기존 보고 현황</h4>
                    <p className="mt-2 text-sm font-semibold leading-6 text-gray-500 keep-all">
                      완료된 보고와 이전 보고 내용을 주차별로 모아 확인합니다.
                    </p>
                  </div>
                  <p className="text-xs font-black text-gray-600">
                    {historyWeekGroups.length ? `${historyWeekGroups.length}개 주차` : '보고 없음'}
                  </p>
                </div>
                <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025]">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                    <p className="text-xs font-bold text-gray-500 keep-all">
                      {reportHistoryLoading ? '기존 보고 확인 중입니다.' : reportHistoryMessage}
                    </p>
                    {selectedHistoryWeek ? (
                      <span className="shrink-0 text-xs font-black text-gray-500">
                        {selectedHistoryWeek.rangeLabel}
                      </span>
                    ) : null}
                  </div>
                  {historyWeekGroups.length && selectedHistoryWeek ? (
                    <div className="grid lg:grid-cols-[300px_1fr]">
                      <div className="max-h-[520px] overflow-auto border-b border-white/10 lg:border-b-0 lg:border-r">
                        {historyWeekGroups.map((group) => {
                          const active = group.key === selectedHistoryWeek.key

                          return (
                            <button
                              key={`${activeWorkspace.key}-history-week-${group.key}`}
                              type="button"
                              onClick={() => setSelectedHistoryWeekKey(group.key)}
                              className={`w-full px-4 py-4 text-left transition ${
                                active ? 'bg-brand-blue/15' : 'hover:bg-white/[0.04]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-black text-white">{group.label}</p>
                                  <p className="mt-1 text-xs font-bold text-gray-500">{group.rangeLabel}</p>
                                </div>
                                <span className="shrink-0 rounded-full border border-white/10 bg-black px-2.5 py-1 text-[11px] font-black text-gray-300">
                                  {group.summary.done}/{group.summary.total}
                                </span>
                              </div>
                              <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-gray-500 keep-all">
                                {group.latestReport?.memo || group.latestReport?.title || '보고 내용이 비어 있습니다.'}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                      <div className="p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-xs font-black text-brand-blue">Selected Week</p>
                            <h5 className="mt-2 text-xl font-black text-white">{selectedHistoryWeek.label}</h5>
                            <p className="mt-1 text-sm font-bold text-gray-500">{selectedHistoryWeek.rangeLabel}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-black">
                            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-emerald-100">
                              완료 {selectedHistoryWeek.summary.done}
                            </span>
                            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-amber-100">
                              대기 {selectedHistoryWeek.summary.pending}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 divide-y divide-white/10 rounded-lg border border-white/10 bg-black">
                          {selectedHistoryWeek.reports.map(({ report, date }) => (
                            <button
                              type="button"
                              key={`${activeWorkspace.key}-history-${report.id || report.date}-${report.title}`}
                              onClick={() => setHistoryDetail({ report, date })}
                              className="grid w-full gap-3 px-4 py-4 text-left transition hover:bg-white/[0.04] md:grid-cols-[96px_120px_1fr_150px]"
                            >
                              <div>
                                <p className="text-sm font-black text-white">{formatMonthDay(date)}</p>
                                <p className="mt-1 text-xs font-bold text-gray-500">{formatWeekday(date)}</p>
                              </div>
                              <div>
                                <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-black ${weeklyReportBadge(report.status)}`}>
                                  {report.status}
                                </span>
                              </div>
                              <div>
                                <p className="font-black text-white keep-all">{report.title}</p>
                                <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-gray-500 keep-all">
                                  {report.memo || '보고 내용이 비어 있습니다.'}
                                </p>
                              </div>
                              <div className="text-xs font-bold leading-5 text-gray-500 md:text-right">
                                <p>{report.reporter || '블링크애드'}</p>
                                <p>{report.completedAt ? formatDateTime(report.completedAt) : '-'}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="px-4 py-6 text-sm font-bold text-gray-500">기존 보고 내역이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-white/10 bg-black p-5 text-sm font-bold text-gray-500">
              등록된 상품별 업무가 없습니다.
            </p>
          )}
          {historyDetail ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
              <div className="w-full max-w-3xl rounded-lg border border-white/10 bg-[#0b0d12] shadow-2xl">
                <div className="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-blue">Report History</p>
                    <h4 className="mt-2 text-2xl font-black text-white keep-all">{historyDetail.report.title}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                      <span>{formatMonthDay(historyDetail.date)} · {formatWeekday(historyDetail.date)}</span>
                      <span className={`inline-flex rounded-full border px-2 py-1 font-black ${weeklyReportBadge(historyDetail.report.status)}`}>
                        {historyDetail.report.status}
                      </span>
                      <span>{historyDetail.report.reporter || '블링크애드'}</span>
                      <span>{historyDetail.report.completedAt ? formatDateTime(historyDetail.report.completedAt) : '-'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHistoryDetail(null)}
                    className="h-10 rounded-md border border-white/10 px-3 text-sm font-black text-gray-300 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
                  >
                    닫기
                  </button>
                </div>
                <div className="p-5">
                  <div className="max-h-[60vh] overflow-auto rounded-lg border border-white/10 bg-black p-4">
                    <pre className="whitespace-pre-wrap break-keep font-sans text-sm font-semibold leading-7 text-gray-200">
                      {historyDetail.report.memo || '보고 내용이 비어 있습니다.'}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p className="rounded-lg border border-white/10 bg-black p-5 text-sm font-bold text-gray-500">
          등록된 운영 매장이 없습니다.
        </p>
      )}
    </section>
  )
}

function StoreWorkspaceTabs({
  workspaces,
  activeProduct,
  onSelectProduct,
}: {
  workspaces: StoreProductWorkspace[]
  activeProduct: StoreProductKey
  onSelectProduct: (product: StoreProductKey) => void
}) {
  return (
    <div className="mt-4 grid w-full max-w-xl grid-cols-3 gap-1 rounded-lg border border-white/10 bg-black p-1">
      {workspaces.map((workspace) => {
        const active = workspace.key === activeProduct

        return (
          <button
            key={workspace.key}
            type="button"
            onClick={() => onSelectProduct(workspace.key)}
            className={`min-h-12 rounded-md px-2 text-xs font-black transition sm:text-sm ${
              active ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {workspaceTabLabel(workspace)}
          </button>
        )
      })}
    </div>
  )
}

function workspaceTabLabel(workspace: StoreProductWorkspace) {
  if (workspace.key === 'googleProfile') return '구글프로필'
  if (workspace.key === 'googleAds') return '구글 애즈'
  if (workspace.key === 'websiteBlog') return '웹사이트,블로그'
  return workspace.label
}

function GoogleAdsPerformancePanel({
  workspace,
  storeTitle,
}: {
  workspace: StoreProductWorkspace
  storeTitle: string
}) {
  const [adsData, setAdsData] = useState<GoogleAdsApiResponse | null>(null)
  const [adsLoading, setAdsLoading] = useState(false)
  const [adsMessage, setAdsMessage] = useState('')

  const loadAdsData = useCallback(async () => {
    setAdsLoading(true)
    try {
      const params = new URLSearchParams({ store: storeTitle, days: '30' })
      const response = await fetch(`/api/erp/google/ads?${params.toString()}`, { cache: 'no-store' })
      const data = (await response.json()) as GoogleAdsApiResponse
      setAdsData(data)
      setAdsMessage(data.message || 'Google Ads 데이터를 확인했습니다.')
    } catch {
      setAdsData(null)
      setAdsMessage('Google Ads 데이터를 불러오지 못했습니다.')
    } finally {
      setAdsLoading(false)
    }
  }, [storeTitle])

  useEffect(() => {
    loadAdsData()
  }, [loadAdsData])

  const summary = adsData?.summary
  const previousSummary = adsData?.previousSummary
  const ctr = summary ? percent(summary.clicks, summary.impressions) : ''
  const previousCtr = previousSummary ? percent(previousSummary.clicks, previousSummary.impressions) : ''
  const cpc = summary && summary.clicks > 0 ? summary.costMicros / 1000000 / summary.clicks : 0
  const previousCpc = previousSummary && previousSummary.clicks > 0 ? previousSummary.costMicros / 1000000 / previousSummary.clicks : 0
  const rows = [
    {
      label: '노출',
      value: summary ? formatCount(summary.impressions) : metricValue(workspace, '노출'),
      delta: summary && previousSummary ? deltaText(summary.impressions, previousSummary.impressions, '회') : '-',
      basis: '캠페인/광고그룹별 impressions',
      action: '지역·브랜드·서비스 키워드 분리 후 낭비 노출을 확인합니다.',
    },
    {
      label: '클릭',
      value: summary ? formatCount(summary.clicks) : metricValue(workspace, '클릭') || '연동 전',
      delta: summary && previousSummary ? deltaText(summary.clicks, previousSummary.clicks, '건') : '-',
      basis: '광고 클릭수',
      action: '실제 매장 행동으로 이어지는 클릭인지 로컬 액션과 함께 봅니다.',
    },
    {
      label: 'CTR',
      value: ctr || '-',
      delta: ctr && previousCtr ? `${previousCtr} → ${ctr}` : '-',
      basis: '클릭 / 노출',
      action: '노출 대비 클릭 효율이 낮으면 키워드와 광고문안을 조정합니다.',
    },
    {
      label: '광고비',
      value: summary ? formatCostMicros(summary.costMicros) : metricValue(workspace, '광고비'),
      delta: summary && previousSummary ? deltaText(summary.costMicros / 1000000, previousSummary.costMicros / 1000000, '원') : '-',
      basis: '월 예산 대비 소진액',
      action: '운영 수수료와 광고비를 분리해 추적합니다.',
    },
    {
      label: 'CPC',
      value: cpc ? `${Math.round(cpc).toLocaleString('ko-KR')}원` : '-',
      delta: cpc && previousCpc ? `${Math.round(previousCpc).toLocaleString('ko-KR')}원 → ${Math.round(cpc).toLocaleString('ko-KR')}원` : '-',
      basis: '광고비 / 클릭',
      action: '클릭 단가가 오르면 지역·서비스 키워드 예산을 다시 나눕니다.',
    },
    {
      label: '로컬 액션',
      value: summary ? formatCount(summary.localActions) : '연동 전',
      delta: summary && previousSummary ? deltaText(summary.localActions, previousSummary.localActions, '건') : '-',
      basis: '길찾기, 전화, 웹사이트 클릭',
      action: 'GBP 행동과 중복 집계하지 않고 광고 기여 행동으로 따로 봅니다.',
    },
  ]
  const localActionCards = summary
    ? [
        { label: '길찾기', value: summary.localActionDirectionRequests },
        { label: '전화', value: summary.localActionCalls },
        { label: '웹사이트', value: summary.localActionWebsiteClicks },
      ]
    : []

  return (
    <div className="border-b border-white/10 p-5 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Google Ads</p>
          <h4 className="mt-2 text-xl font-black text-white">언리미티드 광고 성과</h4>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-500 keep-all">
            BigQuery의 Google Ads 로컬 액션 테이블에서 매장별 노출, 클릭, 광고비, 길찾기·전화·웹사이트 행동을 불러옵니다.
          </p>
          <p className="mt-2 text-xs font-bold text-gray-500 keep-all">
            {adsLoading ? 'Google Ads 데이터를 확인 중입니다.' : adsMessage}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[430px]">
          <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-4">
            <p className="text-xs font-black text-gray-500">연결 상태</p>
            <p className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${adsConnectionBadge(adsData, adsLoading)}`}>
              {adsLoading ? '확인중' : adsData?.connected ? 'BigQuery 연결' : '연결 필요'}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-4">
            <p className="text-xs font-black text-gray-500">기준 기간</p>
            <p className="mt-2 text-sm font-black text-white">
              {adsData?.period.lastDate ? `최근 ${adsData.period.days}일` : '-'}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">{adsData?.period.lastDate || '데이터 없음'}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-4">
            <p className="text-xs font-black text-gray-500">적재 행</p>
            <p className="mt-2 text-sm font-black text-white">{summary ? `${summary.rowCount}행` : '-'}</p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              {adsData?.sourceSyncedAt ? formatDateTime(adsData.sourceSyncedAt) : '동기화 기록 없음'}
            </p>
          </div>
        </div>
      </div>

      {adsData && adsData.status !== 'connected' ? (
        <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-bold leading-6 text-amber-100 keep-all">
          {adsData.message}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[120px_140px_150px_1fr_1.2fr] bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-gray-500">
            <span>지표</span>
            <span>현재값</span>
            <span>전기 비교</span>
            <span>확인 기준</span>
            <span>운영 액션</span>
          </div>
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[120px_140px_150px_1fr_1.2fr] gap-3 border-t border-white/10 px-4 py-4 text-sm">
              <span className="font-black text-white">{row.label}</span>
              <span className="font-black text-blue-100">{adsLoading ? '확인 중' : row.value || '-'}</span>
              <span className="font-bold text-gray-400">{adsLoading ? '-' : row.delta}</span>
              <span className="font-semibold leading-6 text-gray-400 keep-all">{row.basis}</span>
              <span className="font-semibold leading-6 text-gray-500 keep-all">{row.action}</span>
            </div>
          ))}
        </div>
      </div>

      {localActionCards.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {localActionCards.map((item) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs font-black text-gray-500">{item.label}</p>
              <p className="mt-3 text-3xl font-black text-white">{item.value.toLocaleString('ko-KR')}</p>
              <p className="mt-2 text-xs font-semibold text-gray-500">광고 로컬 액션 기준</p>
            </div>
          ))}
        </div>
      ) : null}

      {adsData?.daily.length ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-black text-white">일별 광고 데이터</p>
          </div>
          <div className="divide-y divide-white/10">
            {adsData.daily.slice(0, 10).map((row) => {
              const actions =
                row.localActionDirectionRequests + row.localActionCalls + row.localActionWebsiteClicks

              return (
                <article key={`${row.date}-${row.adsCustomerId || row.storeName}`} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[110px_repeat(5,minmax(0,1fr))]">
                  <p className="font-black text-white">{formatMonthDay(parseLocalDate(row.date))}</p>
                  <p className="font-semibold text-gray-400">노출 {formatCount(row.impressions)}</p>
                  <p className="font-semibold text-gray-400">클릭 {formatCount(row.clicks)}</p>
                  <p className="font-semibold text-gray-400">비용 {formatCostMicros(row.costMicros)}</p>
                  <p className="font-semibold text-gray-400">액션 {formatCount(actions)}</p>
                  <p className="font-semibold text-gray-500">{row.adsCustomerId || '-'}</p>
                </article>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function WebsiteBlogProductionPanel({ workspace }: { workspace: StoreProductWorkspace }) {
  const blogPosts = workspace.blogPosts || []

  return (
    <div className="border-b border-white/10 p-5 md:p-6">
      <div>
        <p className="text-sm font-bold text-brand-blue">Website · Blog</p>
        <h4 className="mt-2 text-xl font-black text-white">웹사이트·블로그 작업 현황</h4>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-500 keep-all">
          GBP에서 연결할 공식 페이지, FAQ, 블로그 주제를 같은 흐름으로 관리합니다.
        </p>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {workspace.tasks.map((task, index) => (
          <article key={`${workspace.key}-stage-${task.title}`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-black text-black">
                {index + 1}
              </span>
              <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${taskStatusBadge(task.status)}`}>
                {task.status}
              </span>
            </div>
            <h5 className="mt-4 font-black text-white keep-all">{task.title}</h5>
            <p className="mt-3 text-sm font-semibold leading-6 text-gray-500 keep-all">{task.memo}</p>
          </article>
        ))}
      </div>
      {blogPosts.length ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.025]">
          <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-blue">Blog Content</p>
              <h5 className="mt-2 text-lg font-black text-white">작성 콘텐츠 목록</h5>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-500 keep-all">
                실제로 작성한 블로그 글을 제목, 타깃 키워드, 발행 상태 기준으로 확인합니다.
              </p>
            </div>
            <p className="text-xs font-black text-gray-600">{blogPosts.length}개 글</p>
          </div>
          <div className="divide-y divide-white/10">
            {blogPosts.map((post, index) => (
              <article
                key={`${workspace.key}-blog-post-${post.title}`}
                className="grid gap-4 px-4 py-4 text-sm lg:grid-cols-[44px_minmax(0,1.5fr)_minmax(140px,0.65fr)_minmax(120px,0.55fr)_minmax(112px,0.45fr)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-black text-xs font-black text-gray-400">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h6 className="font-black leading-6 text-white keep-all">{post.title}</h6>
                  <p className="mt-2 text-xs font-semibold leading-5 text-gray-500 keep-all">{post.memo}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-600">타깃 키워드</p>
                  <p className="mt-2 font-bold leading-6 text-gray-300 keep-all">{post.keyword}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-600">채널</p>
                  <p className="mt-2 font-bold leading-6 text-gray-300">{post.channel}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-600">{post.publishedAt}</p>
                </div>
                <div className="flex items-start lg:justify-end">
                  <span className={`inline-flex rounded-full border px-2.5 py-1.5 text-xs font-black ${taskStatusBadge(post.status)}`}>
                    {post.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

type ReportHistoryWeekGroup = {
  key: string
  label: string
  rangeLabel: string
  reports: { report: StoreWeeklyReport; date: Date }[]
  summary: {
    total: number
    done: number
    inProgress: number
    failed: number
    pending: number
  }
  latestReport?: StoreWeeklyReport
}

function groupReportHistoryByWeek(reports: StoreWeeklyReport[]): ReportHistoryWeekGroup[] {
  const groups = new Map<string, { start: Date; end: Date; reports: { report: StoreWeeklyReport; date: Date }[] }>()

  reports.forEach((report) => {
    if (!report.date) return

    const date = parseLocalDate(report.date)
    const start = getMondayStart(date)
    const key = toISODate(start)
    const current = groups.get(key) || {
      start,
      end: addDays(start, 4),
      reports: [],
    }

    current.reports.push({ report, date })
    groups.set(key, current)
  })

  return Array.from(groups.entries())
    .map(([key, group]) => {
      const sortedReports = group.reports.sort((a, b) => (a.report.date || '').localeCompare(b.report.date || ''))
      const summary = summarizeReports(sortedReports.map((item) => item.report))

      return {
        key,
        label: formatReportWeekLabel(group.start),
        rangeLabel: `${formatMonthDay(group.start)}~${formatMonthDay(group.end)}`,
        reports: sortedReports,
        summary,
        latestReport: sortedReports[sortedReports.length - 1]?.report,
      }
    })
    .sort((a, b) => b.key.localeCompare(a.key))
}

function getMondayStart(date: Date) {
  const target = startOfDay(date)
  const day = target.getDay()
  const offset = day === 0 ? -6 : 1 - day
  target.setDate(target.getDate() + offset)
  return target
}

function formatReportWeekLabel(start: Date) {
  const month = start.getMonth() + 1
  return `${start.getFullYear()}년 ${month}월 ${getMonthWeek(start)}주차`
}

function getMonthWeek(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1
  return Math.floor((date.getDate() + mondayOffset - 1) / 7) + 1
}

function summarizeReports(reports: StoreWeeklyReport[]) {
  const done = reports.filter((report) => report.status === '보고완료').length
  const inProgress = reports.filter((report) => report.status === '작성중' || report.status === '생성완료').length
  const failed = reports.filter((report) => report.status === '실패').length
  const pending = Math.max(0, reports.length - done - inProgress - failed)

  return {
    total: reports.length,
    done,
    inProgress,
    failed,
    pending: pending + failed,
  }
}

function taskStatusBadge(status: string) {
  if (statusIncludesAny(status, ['진행', '작성', '검수'])) return 'border-brand-blue/35 bg-brand-blue/15 text-blue-100'
  if (statusIncludesAny(status, ['완료', '운영중'])) return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (statusIncludesAny(status, ['대기', '예정'])) return 'border-amber-300/25 bg-amber-300/10 text-amber-100'
  return 'border-white/15 bg-white/5 text-gray-300'
}

function autoSaveStatusBadge(status: string) {
  if (status.includes('실패')) return 'border-rose-300/35 bg-rose-300/10 text-rose-100'
  if (status.includes('저장 중')) return 'border-brand-blue/35 bg-brand-blue/15 text-blue-100'
  if (status.includes('자동저장됨')) return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  return 'border-white/15 bg-white/5 text-gray-400'
}

function metricValue(workspace: StoreProductWorkspace, keyword: string) {
  return workspace.metrics.find((metric) => metric.label.includes(keyword))?.value || ''
}

function formatCount(value: number) {
  return `${Math.round(value || 0).toLocaleString('ko-KR')}`
}

function formatCostMicros(value: number) {
  return `${Math.round((value || 0) / 1000000).toLocaleString('ko-KR')}원`
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return ''
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

function deltaText(current: number, previous: number, unit: string) {
  if (!previous && !current) return '-'
  if (!previous) return `신규 ${Math.round(current).toLocaleString('ko-KR')}${unit}`

  const diff = current - previous
  const rate = (diff / previous) * 100
  const sign = diff > 0 ? '+' : ''
  return `${sign}${Math.round(diff).toLocaleString('ko-KR')}${unit} (${sign}${rate.toFixed(1)}%)`
}

function adsConnectionBadge(data: GoogleAdsApiResponse | null, loading: boolean) {
  if (loading) return 'border-brand-blue/30 bg-brand-blue/15 text-blue-100'
  if (data?.status === 'connected') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (data?.connected) return 'border-amber-300/30 bg-amber-300/10 text-amber-100'
  return 'border-rose-300/35 bg-rose-300/10 text-rose-100'
}

function getCurrentWeekDates() {
  const today = getKstCalendarDate()
  const monday = startOfDay(today)
  const day = monday.getDay()
  const offset = day === 6 ? 2 : day === 0 ? 1 : 1 - day
  monday.setDate(monday.getDate() + offset)

  return Array.from({ length: 5 }, (_, index) => addDays(monday, index))
}

function getKstCalendarDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(value)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  return new Date(year, month - 1, day)
}

function toISODate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return new Date(value)
  return new Date(year, month - 1, day)
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date)
}

function formatMonthDay(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit' }).format(date)
}

function weeklyReportClass(status: StoreWeeklyReportStatus) {
  if (status === '보고완료') return 'border-emerald-300/20 bg-emerald-300/10'
  if (status === '작성중') return 'border-brand-blue/30 bg-brand-blue/10'
  if (status === '실패') return 'border-rose-300/25 bg-rose-300/10'
  if (status === '생성완료') return 'border-cyan-300/25 bg-cyan-300/10'
  return 'border-white/10 bg-white/[0.04]'
}

function weeklyReportBadge(status: StoreWeeklyReportStatus) {
  if (status === '보고완료') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (status === '작성중') return 'border-brand-blue/30 bg-brand-blue/15 text-blue-100'
  if (status === '실패') return 'border-rose-300/35 bg-rose-300/10 text-rose-100'
  if (status === '생성완료') return 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
  return 'border-amber-300/25 bg-amber-300/10 text-amber-100'
}
