'use client'

import {
  Badge,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  ExternalLink,
  FileSearch,
  FileSignature,
  Folder,
  LayoutDashboard,
  MapPinned,
  Mail,
  Mic,
  ReceiptText,
  RefreshCw,
  Search,
  UserPlus,
  Users,
} from 'lucide-react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'

type StoreRecord = {
  id: string
  name: string
  category: string
  status: string
  contact: string
  owner: string
  googleMapUrl: string
  quoteCount: number
  diagnosisCount: number
  contractCount: number
  contractStatus: string
  contractUrl: string
  reportStatus: string
  profileStatus: string
  lastEdited: string
  notionUrl: string
}

type ApiResponse = {
  source: 'notion' | 'fallback'
  connected: boolean
  stores: StoreRecord[]
  message?: string
}

type CalendarEvent = {
  id: string
  title: string
  start: string
  end: string
  type: 'meeting' | 'deadline' | 'operation' | 'task'
  location: string
  attendees: string[]
  status: string
  memo: string
  source: 'google' | 'sample'
}

type CalendarApiResponse = {
  source: 'google' | 'sample'
  connected: boolean
  message?: string
  events: CalendarEvent[]
}

type MailItem = {
  id: string
  from: string
  subject: string
  snippet: string
  receivedAt: string
  unread: boolean
  source: 'gmail' | 'sample'
}

type MailApiResponse = {
  source: 'gmail' | 'sample'
  connected: boolean
  message?: string
  mails: MailItem[]
}

const menuGroups = [
  {
    label: '워크스페이스',
    items: [{ id: 'dashboard', label: '대시보드', icon: LayoutDashboard }],
  },
  {
    label: '영업',
    items: [
      { id: 'lead', label: '리드관리', icon: UserPlus },
      { id: 'crm', label: '문의 CRM', icon: Building2 },
      { id: 'customer', label: '고객관리', icon: Users },
      { id: 'project', label: '프로젝트관리', icon: Folder },
    ],
  },
  {
    label: '자동화',
    items: [
      { id: 'diagnosis', label: '진단자료', icon: FileSearch },
      { id: 'quote', label: '견적서', icon: ReceiptText },
      { id: 'contract', label: '계약서', icon: FileSignature },
    ],
  },
  {
    label: '운영',
    items: [
      { id: 'profile', label: '프로필 운영', icon: MapPinned },
      { id: 'report', label: '리포트', icon: CheckCircle2 },
    ],
  },
  {
    label: '할 일',
    items: [
      { id: 'todo', label: '할일관리', icon: CheckSquare },
      { id: 'schedule', label: '일정관리', icon: Calendar },
      { id: 'meeting', label: '미팅관리', icon: Mic },
      { id: 'weekly', label: '위클리미팅', icon: CalendarDays },
      { id: 'mail', label: '메일관리', icon: Mail },
      { id: 'card', label: '명함관리', icon: Badge },
    ],
  },
] as const

type MenuId = (typeof menuGroups)[number]['items'][number]['id']

type OperationRow = {
  title: string
  meta: string
  status: string
  owner: string
  due: string
  memo: string
}

type OperationView = {
  kicker: string
  title: string
  description: string
  stats: { label: string; value: string }[]
  rows: OperationRow[]
}

const statusGroups = [
  { label: '문의접수', matcher: ['문의', '접수', '신규'] },
  { label: '견적서', matcher: ['견적', '제안'] },
  { label: '계약대기', matcher: ['계약', '대기'] },
  { label: '운영시작', matcher: ['운영', '진행', '시작'] },
]

const realtimeMenuIds: MenuId[] = ['schedule', 'meeting', 'weekly', 'mail']

const operationViews: Partial<Record<MenuId, OperationView>> = {
  lead: {
    kicker: 'Sales Pipeline',
    title: '리드관리',
    description: '문의가 들어온 매장을 유입 경로, 다음 액션, 우선순위 기준으로 정리합니다.',
    stats: [
      { label: '신규 리드', value: '12' },
      { label: '미팅 예정', value: '5' },
      { label: '견적 대기', value: '7' },
    ],
    rows: [
      {
        title: '미스터버거',
        meta: '요식업 · Google 프로필 관리 문의',
        status: '견적 제안 전',
        owner: '권순현',
        due: '오늘',
        memo: '프로필 최적화 세팅 견적서 발송 예정',
      },
      {
        title: '미플러스치과 신사',
        meta: '병원 · 외국인 환자 유입 상담',
        status: '진단자료 완료',
        owner: '블링크애드',
        due: '내일',
        memo: '분석자료 기반 미팅 아젠다 정리 필요',
      },
      {
        title: '대게특별시',
        meta: '요식업 · 구글 지도 노출 개선',
        status: '계약 검토',
        owner: '권순현',
        due: '이번 주',
        memo: '메뉴판·리뷰·사진 정비 범위 확인',
      },
    ],
  },
  customer: {
    kicker: 'Account',
    title: '고객관리',
    description: '계약 전후 고객 상태와 요청 자료, 담당자를 한 화면에서 확인합니다.',
    stats: [
      { label: '운영 고객', value: '4' },
      { label: '자료 대기', value: '8' },
      { label: '재계약 후보', value: '3' },
    ],
    rows: [
      {
        title: '주하(데이즈 후카 바)',
        meta: '로컬 매장 · Google 프로필 운영',
        status: '운영시작',
        owner: '블링크애드',
        due: '상시',
        memo: '다국어 소식지와 리뷰 응대 루틴 유지',
      },
      {
        title: '월하동',
        meta: '요식업 · 진단자료/견적서 완료',
        status: '계약대기',
        owner: '권순현',
        due: 'D+2',
        memo: '대표 사진과 메뉴판 자료 수집 필요',
      },
      {
        title: '미포굿모닝시락국밥',
        meta: '요식업 · 프로필 최적화 세팅',
        status: '입금 확인 전',
        owner: '블링크애드',
        due: '이번 주',
        memo: '세팅 견적서 재발송 완료',
      },
    ],
  },
  project: {
    kicker: 'Project Board',
    title: '프로젝트관리',
    description: '진단, 견적, 계약, 운영 시작까지 매장별 프로젝트 진행 단계를 관리합니다.',
    stats: [
      { label: '진행 프로젝트', value: '9' },
      { label: '이번 주 마감', value: '6' },
      { label: '보류', value: '2' },
    ],
    rows: [
      {
        title: '역대짬뽕 지점별 프로필 구조',
        meta: 'GBP · 웹사이트 · 블로그 연결',
        status: '견적 발송',
        owner: '권순현',
        due: 'D+1',
        memo: '1개월/3개월 상품 범위 비교 설명 필요',
      },
      {
        title: 'Naan Indian Restaurant 진단서',
        meta: '무료진단자료 · 레스토랑',
        status: '초안 완료',
        owner: '블링크애드',
        due: '완료',
        memo: '리뷰 비교 섹션 포함',
      },
      {
        title: 'ERP 견적서 자동화',
        meta: 'AX · 사무업무 자동화',
        status: '프로토타입',
        owner: 'Codex',
        due: '진행 중',
        memo: '버튼 실행과 Notion 파일 업로드 연동 예정',
      },
    ],
  },
  todo: {
    kicker: 'Task',
    title: '할일관리',
    description: '오늘 처리해야 할 견적서, 진단자료, 자료 요청 업무를 우선순위로 정리합니다.',
    stats: [
      { label: '오늘 할 일', value: '11' },
      { label: '지연', value: '2' },
      { label: '완료', value: '18' },
    ],
    rows: [
      {
        title: '미스터버거 프로필 최적화 견적서 확인',
        meta: '견적서 · 66만원 VAT 포함',
        status: '검토 필요',
        owner: '권순현',
        due: '오늘',
        memo: '세부작업내역 표 포함 버전 기준',
      },
      {
        title: '미플러스치과 신사 진단자료 업로드 확인',
        meta: '분석자료 · Notion',
        status: '업로드 확인',
        owner: '블링크애드',
        due: '오늘',
        memo: '분석자료 열 파일 누락 여부 체크',
      },
      {
        title: '요식업 자료 요청 템플릿 정리',
        meta: '운영 · 클라이언트 요청자료',
        status: '작성 중',
        owner: '권순현',
        due: '이번 주',
        memo: '사진, 메뉴판, 리뷰, 외국어 안내 자료 포함',
      },
    ],
  },
  schedule: {
    kicker: 'Calendar',
    title: '일정관리',
    description: '상담, 자료 마감, 운영 시작일을 캘린더형 업무 목록으로 관리합니다.',
    stats: [
      { label: '오늘 일정', value: '3' },
      { label: '이번 주 미팅', value: '7' },
      { label: '자료 마감', value: '5' },
    ],
    rows: [
      {
        title: '역대짬뽕 제안 미팅',
        meta: '오프라인 상담 · 요식업',
        status: '준비 중',
        owner: '권순현',
        due: '내일 11:00',
        memo: '쌓아가는 마케팅 투자 구조 설명',
      },
      {
        title: '월하동 사진 자료 수령',
        meta: '프로필 운영 준비',
        status: '자료 대기',
        owner: '블링크애드',
        due: '금요일',
        memo: '대표 사진, 메뉴판, 외부 사진 요청',
      },
      {
        title: 'ERP 프로토타입 리뷰',
        meta: '내부 AX',
        status: '진행 중',
        owner: 'Codex',
        due: '오늘',
        memo: '메뉴 구조와 샘플 데이터 확인',
      },
    ],
  },
  meeting: {
    kicker: 'Meeting',
    title: '미팅관리',
    description: '미팅 목적, 설득 포인트, 후속 액션을 매장별로 기록합니다.',
    stats: [
      { label: '예정 미팅', value: '5' },
      { label: '후속 필요', value: '4' },
      { label: '완료', value: '9' },
    ],
    rows: [
      {
        title: '짬뽕집 AEO 설득 미팅',
        meta: 'Google 프로필 · 웹사이트 · FAQ',
        status: '아젠다 작성',
        owner: '권순현',
        due: '내일',
        memo: '즉각 반응형 투자와 누적형 투자를 비교 설명',
      },
      {
        title: '병원 GBP 자료 요청 안내',
        meta: '병원 · 사진/시술/권위자료',
        status: '전달 예정',
        owner: '블링크애드',
        due: 'D+1',
        memo: '방송 출연, 세미나, 내부/외부 사진 포함',
      },
      {
        title: '대게특별시 후속 미팅',
        meta: '요식업 · 리뷰/메뉴판',
        status: '일정 조율',
        owner: '권순현',
        due: '이번 주',
        memo: '외국인 고객 기준 메뉴 설명 필요',
      },
    ],
  },
  weekly: {
    kicker: 'Weekly',
    title: '위클리미팅',
    description: '이번 주 영업, 제작, 운영 이슈를 주간 단위로 정리합니다.',
    stats: [
      { label: '이번 주 안건', value: '6' },
      { label: '결정 필요', value: '3' },
      { label: '다음 액션', value: '12' },
    ],
    rows: [
      {
        title: '견적서 스킬 운영 기준',
        meta: '1개월 · 3/6/12개월 · 세팅 견적서',
        status: '정리 완료',
        owner: 'Codex',
        due: '월요일',
        memo: '매장명 기준 Notion 견적서 열 업로드',
      },
      {
        title: '진단자료 템플릿 고정',
        meta: 'GBP 무료진단자료',
        status: '운영 중',
        owner: '블링크애드',
        due: '상시',
        memo: '1페이지 요약표, 개선점, 고객후기, 작업프로세스',
      },
      {
        title: 'ERP 자동화 범위',
        meta: 'Notion DB · Codex skill trigger',
        status: '기획 중',
        owner: '권순현',
        due: '이번 주',
        memo: '로컬 실행과 배포 환경 실행 권한 분리 필요',
      },
    ],
  },
  mail: {
    kicker: 'Inbox',
    title: '메일관리',
    description: '견적서 발송, 자료 요청, 미팅 리마인드 메일을 업무별로 관리합니다.',
    stats: [
      { label: '발송 대기', value: '8' },
      { label: '회신 대기', value: '14' },
      { label: '템플릿', value: '5' },
    ],
    rows: [
      {
        title: '구글 프로필 필요 자료 요청',
        meta: '클라이언트 온보딩',
        status: '템플릿 준비',
        owner: '블링크애드',
        due: '오늘',
        memo: '병원, 헤어샵, 요식업 버전 분리',
      },
      {
        title: '프로필 최적화 세팅 견적서 발송',
        meta: '미스터버거 · 미포굿모닝시락국밥',
        status: '발송 전',
        owner: '권순현',
        due: '오늘',
        memo: 'PDF 첨부와 유효기간 안내 확인',
      },
      {
        title: '미팅 후속 메일',
        meta: '영업 후속',
        status: '작성 필요',
        owner: '권순현',
        due: 'D+1',
        memo: '논의 내용, 견적서, 다음 일정 포함',
      },
    ],
  },
  card: {
    kicker: 'Contact',
    title: '명함관리',
    description: '명함관리는 현재 보류 중입니다. 우선 일정, 미팅, 메일 연동부터 정리합니다.',
    stats: [
      { label: '상태', value: '보류' },
      { label: '우선순위', value: '낮음' },
      { label: '다음 작업', value: '-' },
    ],
    rows: [
      {
        title: '명함관리 기능 정의 보류',
        meta: '연락처 DB · CRM 연결 범위 미정',
        status: '보류',
        owner: '권순현',
        due: '미정',
        memo: '문의 CRM과 고객관리 구조가 먼저 잡힌 뒤 명함 OCR/수기 입력/연락처 동기화 범위를 결정합니다.',
      },
    ],
  },
}

function matchesStatus(status: string, matcher: string[]) {
  const target = status || ''
  return matcher.some((keyword) => target.includes(keyword))
}

function statusBadge(status: string) {
  if (status.includes('운영')) return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200'
  if (status.includes('계약')) return 'border-amber-300/30 bg-amber-300/10 text-amber-100'
  if (status.includes('견적')) return 'border-blue-300/30 bg-brand-blue/15 text-blue-100'
  if (status.includes('진단')) return 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
  return 'border-white/15 bg-white/10 text-gray-200'
}

function FileState({ count, emptyLabel }: { count: number; emptyLabel: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${
        count > 0
          ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200'
          : 'border-white/15 bg-white/5 text-gray-400'
      }`}
    >
      {count > 0 ? `${count}개 저장` : emptyLabel}
    </span>
  )
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center rounded-md bg-brand-blue px-3 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
    >
      {children}
    </button>
  )
}

export default function ErpClient() {
  const [activeMenu, setActiveMenu] = useState<MenuId>('dashboard')
  const [stores, setStores] = useState<StoreRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionMessage, setConnectionMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [runningAction, setRunningAction] = useState<string | null>(null)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendarMessage, setCalendarMessage] = useState('')
  const [mailItems, setMailItems] = useState<MailItem[]>([])
  const [mailLoading, setMailLoading] = useState(false)
  const [mailMessage, setMailMessage] = useState('')

  const loadStores = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/erp/clients', { cache: 'no-store' })
      const data = (await response.json()) as ApiResponse
      setStores(data.stores)
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

  const loadCalendarEvents = async () => {
    setCalendarLoading(true)
    try {
      const response = await fetch('/api/erp/google/calendar', { cache: 'no-store' })
      const data = (await response.json()) as CalendarApiResponse
      setCalendarEvents(data.events)
      setCalendarMessage(
        data.connected
          ? 'Google Calendar와 연결되었습니다.'
          : data.message || 'Google Calendar 토큰이 없어 샘플 일정으로 표시 중입니다.'
      )
    } catch {
      setCalendarMessage('Google Calendar 일정을 불러오지 못했습니다.')
    } finally {
      setCalendarLoading(false)
    }
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

  useEffect(() => {
    if (['schedule', 'meeting', 'weekly'].includes(activeMenu) && calendarEvents.length === 0 && !calendarLoading) {
      loadCalendarEvents()
    }

    if (activeMenu === 'mail' && mailItems.length === 0 && !mailLoading) {
      loadMailItems()
    }
  }, [activeMenu])

  const dashboard = useMemo(() => {
    const managed = stores.filter((store) => matchesStatus(store.status, ['운영', '진행', '시작'])).length
    const counts = statusGroups.map((group) => ({
      label: group.label,
      count: stores.filter((store) => matchesStatus(store.status, group.matcher)).length,
    }))

    return { managed, counts }
  }, [stores])

  const operationView = realtimeMenuIds.includes(activeMenu) ? undefined : operationViews[activeMenu]

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
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-black lg:block">
          <div className="flex h-20 items-center border-b border-white/10 px-6">
            <a href="/" aria-label="BlinkAd home">
              <img src="/logo-white-nav.png" alt="BlinkAd" className="h-8 w-auto" />
            </a>
          </div>

          <nav className="space-y-6 px-3 py-5">
            {menuGroups.map((group) => (
              <div key={group.label}>
                <p className="px-3 pb-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-600">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((menu) => {
                    const Icon = menu.icon
                    const active = activeMenu === menu.id

                    return (
                      <button
                        key={menu.id}
                        type="button"
                        onClick={() => setActiveMenu(menu.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition ${
                          active ? 'bg-brand-blue text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {menu.label}
                      </button>
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
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-blue">
                  BlinkAd ERP
                </p>
                <h1 className="mt-1 text-xl font-black tracking-tight text-white md:text-2xl">
                  영업·진단·견적·계약·운영 관리
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden rounded-full border border-white/10 px-3 py-2 text-xs font-bold text-gray-400 md:inline-flex">
                  {connectionMessage || 'DB 연결 확인 중'}
                </span>
                <button
                  type="button"
                  onClick={loadStores}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-3 text-sm font-bold text-gray-200 hover:border-white/30 hover:bg-white/5"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
                      onClick={() => setActiveMenu(menu.id)}
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
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:col-span-1">
                    <p className="text-sm font-bold text-gray-400">관리업장 현황</p>
                    <p className="mt-4 text-5xl font-black tracking-tight text-white">{dashboard.managed}</p>
                    <p className="mt-3 text-sm leading-6 text-gray-500">현재 운영이 시작된 매장 수</p>
                  </div>

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
                title="문의 CRM"
                description="Notion 문의관리 DB의 매장 목록을 ERP에서 확인합니다."
                stores={stores}
                loading={loading}
                columns="crm"
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
                onRunDiagnosis={(store) => runAutomation('diagnosis', store)}
              />
            )}

            {activeMenu === 'quote' && (
              <StoreTable
                title="견적서 생성"
                description="각 매장별 견적서 생성 버튼을 통해 PDF를 만들고 Notion 견적서 열에 저장합니다."
                stores={stores}
                loading={loading}
                columns="quote"
                runningAction={runningAction}
                onRunQuote={(store) => runAutomation('quote', store)}
              />
            )}

            {activeMenu === 'contract' && (
              <StoreTable
                title="계약서 조회"
                description="매장별 계약서 파일, 전자계약 링크, 계약 상태를 확인합니다. 전자계약 플랫폼 연결 후에는 발송·서명완료 상태까지 동기화합니다."
                stores={stores}
                loading={loading}
                columns="contract"
              />
            )}

            {activeMenu === 'profile' && (
              <StoreTable
                title="프로필 운영"
                description="Notion DB에서 Google 맵 링크가 등록된 매장만 모아 프로필 운영 상태와 지도 링크를 확인합니다."
                stores={stores.filter((store) => store.googleMapUrl)}
                loading={loading}
                columns="profile"
              />
            )}

            {activeMenu === 'report' && (
              <StoreTable
                title="리포트"
                description="각 매장별 보고 현황과 리포트 준비 상태를 확인합니다."
                stores={stores}
                loading={loading}
                columns="report"
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

            {activeMenu === 'meeting' && (
              <MeetingPanel
                events={calendarEvents}
                loading={calendarLoading}
                message={calendarMessage}
                onRefresh={loadCalendarEvents}
              />
            )}

            {activeMenu === 'weekly' && (
              <WeeklyMeetingPanel
                events={calendarEvents}
                loading={calendarLoading}
                message={calendarMessage}
                onRefresh={loadCalendarEvents}
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

            {operationView ? <OperationsPanel view={operationView} /> : null}
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

function toDateTimeLocalValue(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000)
  return offsetDate.toISOString().slice(0, 16)
}

function formatDateLabel(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(new Date(value))
}

function CalendarEventForm({
  newEvent,
  setNewEvent,
  creating,
  createMessage,
  onSubmit,
}: {
  newEvent: {
    title: string
    start: string
    end: string
    type: CalendarEvent['type']
    location: string
    memo: string
  }
  setNewEvent: Dispatch<
    SetStateAction<{
      title: string
      start: string
      end: string
      type: CalendarEvent['type']
      location: string
      memo: string
    }>
  >
  creating: boolean
  createMessage: string
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
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
        {creating ? '추가 중' : 'Google Calendar에 일정 추가'}
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
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([])
  const [creating, setCreating] = useState(false)
  const [createMessage, setCreateMessage] = useState('')
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [newEvent, setNewEvent] = useState(() => {
    const start = new Date()
    start.setHours(start.getHours() + 1, 0, 0, 0)
    const end = new Date(start)
    end.setHours(end.getHours() + 1)

    return {
      title: '',
      start: start.toISOString().slice(0, 16),
      end: end.toISOString().slice(0, 16),
      type: 'meeting' as CalendarEvent['type'],
      location: '',
      memo: '',
    }
  })
  const allEvents = [...events, ...localEvents]
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dateNumber = index - firstDay + 1
    return dateNumber > 0 && dateNumber <= lastDate ? new Date(year, month, dateNumber) : null
  })

  const visibleMonthEvents = allEvents
    .filter((event) => {
      const start = new Date(event.start)
      return start.getFullYear() === year && start.getMonth() === month
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  const moveMonth = (offset: number) => {
    setCurrentMonth(new Date(year, month + offset, 1))
  }

  const openCreateModal = (date?: Date) => {
    if (date) {
      const start = new Date(date)
      start.setHours(10, 0, 0, 0)
      const end = new Date(start)
      end.setHours(end.getHours() + 1)

      setNewEvent((current) => ({
        ...current,
        start: toDateTimeLocalValue(start),
        end: toDateTimeLocalValue(end),
      }))
    }

    setCreateMessage('')
    setQuickCreateOpen(true)
  }

  const closeCreateModal = () => {
    setQuickCreateOpen(false)
  }

  const createCalendarEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCreating(true)
    setCreateMessage('')

    try {
      const response = await fetch('/api/erp/google/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          start: new Date(newEvent.start).toISOString(),
          end: new Date(newEvent.end || newEvent.start).toISOString(),
        }),
      })
      const data = (await response.json()) as { message?: string; event?: CalendarEvent }

      if (!response.ok) {
        throw new Error(data.message || '일정 추가에 실패했습니다.')
      }

      if (data.event) {
        setLocalEvents((current) => [...current, data.event as CalendarEvent])
      }
      setCreateMessage(data.message || '일정이 추가되었습니다.')

      if (data.event?.source === 'google') {
        await onRefresh()
      }

      setNewEvent((current) => ({
        ...current,
        title: '',
        location: '',
        memo: '',
      }))

      setQuickCreateOpen(false)
    } catch (error) {
      setCreateMessage(error instanceof Error ? error.message : '일정 추가에 실패했습니다.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold text-brand-blue">Google Calendar</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">일정관리</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">
            Google Calendar 일정을 월간 캘린더로 확인합니다. 미팅 일정은 미팅관리와 위클리미팅에도 자동으로 분류됩니다.
          </p>
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

      <div className="grid gap-5 p-5 md:grid-cols-[1fr_340px] md:p-6">
        <div className="rounded-lg border border-white/10 bg-black">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-300 hover:bg-white/5"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-lg font-black text-white">
              {year}.{String(month + 1).padStart(2, '0')}
            </p>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-300 hover:bg-white/5"
              aria-label="다음 달"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-white/10 text-center text-xs font-black uppercase tracking-[0.12em] text-gray-600">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-3">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cell, index) => {
              const dayEvents = cell
                ? allEvents
                    .filter((event) => isSameDate(new Date(event.start), cell))
                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                : []

              return (
                <div
                  key={`${year}-${month}-${index}`}
                  onDoubleClick={() => {
                    if (cell) openCreateModal(cell)
                  }}
                  className={`min-h-28 border-b border-r border-white/10 p-2 ${cell ? 'bg-[#07080b]' : 'bg-white/[0.02]'}`}
                >
                  {cell ? (
                    <>
                      <p className={`text-xs font-black ${isSameDate(cell, new Date()) ? 'text-brand-blue' : 'text-gray-500'}`}>
                        {cell.getDate()}
                      </p>
                      <div className="mt-2 space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`truncate rounded border px-2 py-1 text-[11px] font-bold ${eventTypeClass(event.type)}`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 ? (
                          <p className="text-[11px] font-bold text-gray-500">+{dayEvents.length - 3}개</p>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-sm font-black text-white">빠른 일정 추가</p>
            <p className="mt-2 text-xs leading-5 text-gray-500 keep-all">
              달력 날짜를 더블클릭하거나 아래 버튼을 눌러 Google Calendar 일정 추가 팝업을 엽니다.
            </p>
            <button
              type="button"
              onClick={() => openCreateModal()}
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-blue px-3 text-sm font-black text-white transition hover:bg-blue-600"
            >
              일정 추가
            </button>
            {createMessage ? <p className="mt-3 text-xs font-bold leading-5 text-gray-400 keep-all">{createMessage}</p> : null}
          </div>

          <div className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-sm font-black text-white">이번 달 일정</p>
          <div className="mt-4 space-y-3">
            {visibleMonthEvents.length === 0 ? (
              <p className="rounded-md border border-white/10 px-3 py-4 text-sm font-bold text-gray-500">표시할 일정이 없습니다.</p>
            ) : (
              visibleMonthEvents.slice(0, 8).map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
          </div>
        </div>
      </div>

      {quickCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-white/10 bg-[#0b0d12] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-brand-blue">Google Calendar</p>
                <h3 className="mt-2 text-xl font-black text-white">일정 추가</h3>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
                aria-label="일정 추가 닫기"
              >
                ×
              </button>
            </div>

            <CalendarEventForm
              newEvent={newEvent}
              setNewEvent={setNewEvent}
              creating={creating}
              createMessage={createMessage}
              onSubmit={createCalendarEvent}
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white keep-all">{event.title}</p>
          <p className="mt-1 text-xs font-semibold text-gray-500">{formatDateTime(event.start)}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-black ${eventTypeClass(event.type)}`}>
          {eventTypeLabel(event.type)}
        </span>
      </div>
      {event.location ? <p className="mt-2 text-xs font-bold text-gray-400 keep-all">{event.location}</p> : null}
      {event.memo ? <p className="mt-2 text-xs leading-5 text-gray-500 keep-all">{event.memo}</p> : null}
    </div>
  )
}

function MeetingPanel({
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
  const meetings = events
    .filter(isMeetingEvent)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

  return (
    <MeetingListPanel
      kicker="Meeting"
      title="미팅관리"
      description="일정관리에서 미팅 일정으로 기록된 항목만 추려서 보여줍니다."
      events={meetings}
      loading={loading}
      message={message}
      onRefresh={onRefresh}
      emptyLabel="등록된 미팅 일정이 없습니다."
    />
  )
}

function WeeklyMeetingPanel({
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
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(now.getDate() - 7)
  const weeklyMeetings = events
    .filter((event) => isMeetingEvent(event) && new Date(event.start) >= sevenDaysAgo && new Date(event.start) <= now)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())

  return (
    <MeetingListPanel
      kicker="Weekly Meeting"
      title="위클리미팅"
      description="최근 1주일간 진행했던 미팅 내역을 Google Calendar 기준으로 모아봅니다."
      events={weeklyMeetings}
      loading={loading}
      message={message}
      onRefresh={onRefresh}
      emptyLabel="최근 1주일 내 진행된 미팅이 없습니다."
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
  emptyLabel,
}: {
  kicker: string
  title: string
  description: string
  events: CalendarEvent[]
  loading: boolean
  message: string
  onRefresh: () => void
  emptyLabel: string
}) {
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

      <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
        {events.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-black p-5 text-sm font-bold text-gray-500">{emptyLabel}</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="rounded-lg border border-white/10 bg-black p-5">
              <p className="text-xs font-black text-brand-blue">{formatDateLabel(event.start)}</p>
              <h3 className="mt-3 text-lg font-black text-white keep-all">{event.title}</h3>
              <p className="mt-2 text-sm font-bold text-gray-400">{formatDateTime(event.start)}</p>
              {event.location ? <p className="mt-2 text-sm font-semibold text-gray-500 keep-all">{event.location}</p> : null}
              {event.attendees.length > 0 ? (
                <p className="mt-3 text-xs font-semibold text-gray-500 keep-all">
                  참석자: {event.attendees.slice(0, 3).join(', ')}
                </p>
              ) : null}
              {event.memo ? <p className="mt-3 text-sm leading-6 text-gray-400 keep-all">{event.memo}</p> : null}
            </div>
          ))
        )}
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

function OperationsPanel({ view }: { view: OperationView }) {
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

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-gray-500">
            <tr>
              <th className="px-5 py-4">업무</th>
              <th className="px-5 py-4">상태</th>
              <th className="px-5 py-4">담당</th>
              <th className="px-5 py-4">기한</th>
              <th className="px-5 py-4">메모</th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((row) => (
              <tr key={`${view.title}-${row.title}`} className="border-t border-white/10">
                <td className="px-5 py-4">
                  <p className="font-black text-white keep-all">{row.title}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500 keep-all">{row.meta}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full border border-brand-blue/25 bg-brand-blue/10 px-2.5 py-1 text-xs font-bold text-blue-100">
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-300">{row.owner}</td>
                <td className="px-5 py-4 font-black text-white">{row.due}</td>
                <td className="max-w-md px-5 py-4 font-semibold leading-6 text-gray-400 keep-all">{row.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function StoreTable({
  title,
  description,
  stores,
  loading,
  columns,
  runningAction,
  onRunDiagnosis,
  onRunQuote,
}: {
  title: string
  description: string
  stores: StoreRecord[]
  loading: boolean
  columns: 'crm' | 'diagnosis' | 'quote' | 'contract' | 'profile' | 'report'
  runningAction?: string | null
  onRunDiagnosis?: (store: StoreRecord) => void
  onRunQuote?: (store: StoreRecord) => void
}) {
  const [query, setQuery] = useState('')
  const filteredStores = stores.filter((store) =>
    [store.name, store.category, store.status, store.owner].join(' ').toLowerCase().includes(query.toLowerCase())
  )

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold text-brand-blue">BlinkAd Operations</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">{description}</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-md border border-white/10 bg-black pl-9 pr-3 text-sm font-semibold text-white outline-none placeholder:text-gray-600"
            placeholder="매장명 검색"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1080px] w-full border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-gray-500">
            <tr>
              <th className="px-5 py-4">매장명</th>
              <th className="px-5 py-4">업종</th>
              <th className="px-5 py-4">상태</th>
              {columns === 'crm' && <th className="px-5 py-4">구글맵</th>}
              {columns === 'diagnosis' && <th className="px-5 py-4">분석자료</th>}
              {columns === 'quote' && <th className="px-5 py-4">견적서</th>}
              {columns === 'contract' && <th className="px-5 py-4">계약서</th>}
              {columns === 'contract' && <th className="px-5 py-4">전자계약</th>}
              {columns === 'contract' && <th className="px-5 py-4">계약 상태</th>}
              {columns === 'profile' && <th className="px-5 py-4">구글맵</th>}
              {columns === 'profile' && <th className="px-5 py-4">프로필 현황</th>}
              {columns === 'report' && <th className="px-5 py-4">보고 현황</th>}
              <th className="px-5 py-4">담당</th>
              <th className="px-5 py-4">액션</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-5 py-10 text-center font-bold text-gray-500" colSpan={7}>
                  문의관리 DB를 불러오는 중입니다.
                </td>
              </tr>
            ) : filteredStores.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center font-bold text-gray-500" colSpan={7}>
                  표시할 매장이 없습니다.
                </td>
              </tr>
            ) : (
              filteredStores.map((store) => (
                <tr key={store.id} className="border-t border-white/10">
                  <td className="px-5 py-4">
                    <p className="font-black text-white keep-all">{store.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{store.contact || '연락처 확인 필요'}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-gray-300">{store.category || '확인 필요'}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge(store.status)}`}>
                      {store.status || '상태 없음'}
                    </span>
                  </td>

                  {columns === 'crm' && (
                    <td className="px-5 py-4">
                      {store.googleMapUrl ? (
                        <a
                          href={store.googleMapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-brand-blue hover:text-blue-300"
                        >
                          열기
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="font-semibold text-gray-500">미등록</span>
                      )}
                    </td>
                  )}

                  {columns === 'diagnosis' && (
                    <td className="px-5 py-4">
                      <FileState count={store.diagnosisCount} emptyLabel="미생성" />
                    </td>
                  )}

                  {columns === 'quote' && (
                    <td className="px-5 py-4">
                      <FileState count={store.quoteCount} emptyLabel="미생성" />
                    </td>
                  )}

                  {columns === 'contract' && (
                    <td className="px-5 py-4">
                      <FileState count={store.contractCount} emptyLabel="미등록" />
                    </td>
                  )}

                  {columns === 'contract' && (
                    <td className="px-5 py-4">
                      {store.contractUrl ? (
                        <a
                          href={store.contractUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-brand-blue hover:text-blue-300"
                        >
                          전자계약 열기
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="font-semibold text-gray-500">링크 미등록</span>
                      )}
                    </td>
                  )}

                  {columns === 'contract' && (
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge(store.contractStatus)}`}>
                        {store.contractStatus || '계약 전'}
                      </span>
                    </td>
                  )}

                  {columns === 'profile' && (
                    <td className="px-5 py-4">
                      <a
                        href={store.googleMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-brand-blue hover:text-blue-300"
                      >
                        구글맵 보기
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  )}

                  {columns === 'profile' && (
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 font-bold text-gray-300">
                        <CircleDot className="h-4 w-4 text-brand-blue" />
                        {store.profileStatus}
                      </span>
                    </td>
                  )}

                  {columns === 'report' && (
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 font-bold text-gray-300">
                        <Clock3 className="h-4 w-4 text-gray-500" />
                        {store.reportStatus}
                      </span>
                    </td>
                  )}

                  <td className="px-5 py-4 font-semibold text-gray-400">{store.owner || '미지정'}</td>
                  <td className="px-5 py-4">
                    {columns === 'diagnosis' ? (
                      <PrimaryButton
                        disabled={!store.googleMapUrl || runningAction === `diagnosis:${store.id}`}
                        onClick={() => onRunDiagnosis?.(store)}
                      >
                        {runningAction === `diagnosis:${store.id}` ? '생성 중' : '진단자료 생성'}
                      </PrimaryButton>
                    ) : columns === 'quote' ? (
                      <PrimaryButton
                        disabled={runningAction === `quote:${store.id}`}
                        onClick={() => onRunQuote?.(store)}
                      >
                        {runningAction === `quote:${store.id}` ? '생성 중' : '견적서 생성'}
                      </PrimaryButton>
                    ) : columns === 'contract' ? (
                      store.contractUrl ? (
                        <a
                          href={store.contractUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
                        >
                          전자계약 보기
                        </a>
                      ) : (
                        <span className="font-semibold text-gray-600">플랫폼 연동 예정</span>
                      )
                    ) : store.notionUrl ? (
                      <a
                        href={store.notionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
                      >
                        Notion 보기
                      </a>
                    ) : (
                      <span className="font-semibold text-gray-600">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
