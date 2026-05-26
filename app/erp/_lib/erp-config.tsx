import {
  Badge,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Clock3,
  CreditCard,
  FileSearch,
  FileSignature,
  Folder,
  Handshake,
  LayoutDashboard,
  Mail,
  Mic,
  ReceiptText,
  RefreshCw,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'

export type StoreRecord = {
  id: string
  name: string
  status: string
  contact: string
  category: string
  inquirySource: string
  owner: string
  googleMapUrl: string
  followupDue: string
  lastContacted: string
  nextAction: string
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

export type ApiResponse = {
  source: 'notion' | 'fallback'
  connected: boolean
  stores: StoreRecord[]
  statusOptions?: string[]
  message?: string
}

export type BusinessCardRecord = {
  id: string
  name: string
  phone: string
  status: string
  imageUrl: string
  imageName: string
  meetingIds: string[]
  meetingTitles: string[]
  lastEdited: string
  notionUrl: string
}

export type BusinessCardsResponse = {
  source: 'notion' | 'fallback'
  connected: boolean
  cards: BusinessCardRecord[]
  message?: string
}

export type CalendarEvent = {
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
  calendarId?: string
  calendarName?: string
  calendarColor?: string
  calendarForegroundColor?: string
}

export type CalendarEventDraft = {
  title: string
  start: string
  end: string
  type: CalendarEvent['type']
  location: string
  memo: string
}

export type CalendarApiResponse = {
  source: 'google' | 'sample'
  connected: boolean
  message?: string
  selectedCalendar?: {
    calendarId: string
    calendarName: string
    calendarColor: string
    calendarForegroundColor: string
  } | null
  events: CalendarEvent[]
}

export type SaveMeetingNoteHandler = (event: CalendarEvent, memo: string) => Promise<string>

export type CalendarAccountView = {
  memberId: string
  name: string
  email: string
  role: string
  calendarId: string
  connected: boolean
  updatedAt?: string
  expiresAt?: number
}

export type CalendarAccountsResponse = {
  connected: boolean
  accounts: CalendarAccountView[]
  message?: string
}

export type MailItem = {
  id: string
  from: string
  subject: string
  snippet: string
  receivedAt: string
  unread: boolean
  source: 'gmail' | 'sample'
}

export type MailApiResponse = {
  source: 'gmail' | 'sample'
  connected: boolean
  message?: string
  mails: MailItem[]
}

export const menuGroups = [
  {
    label: '일반 ERP',
    items: [{ id: 'dashboard', label: '대시보드', icon: LayoutDashboard }],
  },
  {
    label: 'CRM/영업',
    items: [
      { id: 'crm', label: '문의관리', icon: Building2 },
      { id: 'followup', label: '팔로업 관리', icon: RefreshCw },
      { id: 'customer', label: '고객관리', icon: Users },
      { id: 'contractPending', label: '계약대기', icon: ClipboardList },
      { id: 'card', label: '명함관리', icon: Badge },
    ],
  },
  {
    label: '견적/수주',
    items: [
      { id: 'diagnosis', label: '진단자료', icon: FileSearch },
      { id: 'quote', label: '견적서', icon: ReceiptText },
      { id: 'contract', label: '계약서', icon: FileSignature },
    ],
  },
  {
    label: '프로젝트/작업관리',
    items: [
      { id: 'project', label: '매장 운영관리', icon: Folder },
    ],
  },
  {
    label: '자산/콘텐츠',
    items: [
      { id: 'assets', label: '콘텐츠 자산', icon: ClipboardList },
    ],
  },
  {
    label: '일정/미팅',
    items: [
      { id: 'schedule', label: '일정관리', icon: Calendar },
      { id: 'meeting', label: '미팅관리', icon: Mic },
      { id: 'weekly', label: '위클리미팅', icon: CalendarDays },
      { id: 'mail', label: '메일관리', icon: Mail },
    ],
  },
  {
    label: '성과분석/리포팅',
    items: [
      { id: 'report', label: '리포트', icon: CheckCircle2 },
      { id: 'kpi', label: 'KPI 분석', icon: CircleDot },
    ],
  },
  {
    label: '인보이스/청구',
    items: [
      { id: 'billing', label: '청구관리', icon: CreditCard },
      { id: 'receivable', label: '미수금', icon: Clock3 },
    ],
  },
  {
    label: '인사/근태',
    items: [
      { id: 'staff', label: '담당자 관리', icon: UserCog },
      { id: 'outsourcing', label: '외주 PM 관리', icon: Handshake },
    ],
  },
  {
    label: '설정',
    items: [{ id: 'settings', label: '설정', icon: Settings }],
  },
] as const

export type MenuId = (typeof menuGroups)[number]['items'][number]['id']

export type StoreProductKey = 'googleProfile' | 'googleAds' | 'websiteBlog'

export type StoreProductTask = {
  title: string
  status: string
  owner: string
  due: string
  memo: string
}

export type StoreProductMetric = {
  label: string
  value: string
  note: string
}

export type StoreWeeklyReportStatus = '초안' | '생성완료' | '보고대기' | '보고완료' | '실패' | '작성중'

export type StoreWeeklyReport = {
  id?: string
  dayOffset: number
  date?: string
  status: StoreWeeklyReportStatus
  title: string
  memo: string
  reporter?: string
  completedAt?: string
}

export type WeeklyReportApiResponse = {
  source: 'notion' | 'fallback'
  connected: boolean
  message?: string
  reports: StoreWeeklyReport[]
}

export type StoreProductWorkspace = {
  key: StoreProductKey
  label: string
  heading: string
  description: string
  metrics: StoreProductMetric[]
  weeklyReports?: StoreWeeklyReport[]
  tasks: StoreProductTask[]
}

export type OperationRow = {
  title: string
  meta: string
  status: string
  owner: string
  due: string
  memo: string
  copyText?: string
  products?: {
    googleProfile: string
    googleAds: string
    website: string
    material: string
    nextAction: string
  }
  productWorkspaces?: StoreProductWorkspace[]
}

export type OperationView = {
  kicker: string
  title: string
  description: string
  stats: { label: string; value: string }[]
  rows: OperationRow[]
}

export const statusGroups = [
  { label: '신규 문의', matcher: ['신규 문의', '신규문의'] },
  { label: '접촉중', matcher: ['접촉중'] },
  { label: '미팅일정 확정', matcher: ['미팅일정 확정', '미팅일정확정'] },
  { label: '견적/팔로업', matcher: ['견적서 송부/팔로업 지속', '견적서송부/팔로업지속'] },
  { label: '공동 대응', matcher: ['공동 대응', '공동대응'] },
  { label: '계약대기', matcher: ['계약대기', '계약 대기'] },
  { label: '완료/종료', matcher: ['계약 완료', '계약완료', '답변 완료', '답변완료', '취소/팔로업 중지', '취소/팔로업중지'] },
]

export const EFORMSIGN_URL = 'https://www.eformsign.com/kr/'
export const TEAM_CALENDAR_LABEL = '용올캘린더'
export const REPORT_STATUS_OPTIONS: StoreWeeklyReportStatus[] = ['초안', '생성완료', '보고대기', '보고완료', '실패', '작성중']
export const DEFAULT_CLIENT_STATUS_OPTIONS = [
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

export const realtimeMenuIds: MenuId[] = ['schedule', 'meeting', 'weekly', 'mail']
export const menuIds = menuGroups.flatMap((group) => group.items.map((item) => item.id)) as MenuId[]

export const WELCOME_GOOGLE_PROFILE_ACCESS_MESSAGE = `안녕하세요.

앞으로 Google 비즈니스 프로필 관리와 외국인 고객 유입을 위한 기본 세팅을 함께 진행드리겠습니다.

먼저 Google 비즈니스 프로필 작업을 위해 아래 계정으로 권한 추가를 부탁드립니다.

권한 추가 계정
- 이메일1: seunggyeomlee@gmail.com
- 이메일2: travelingtoseoul@gmail.com
- 이메일3: ban951112@gmail.com

권한은 '관리자' 권한으로 초대해주시면 됩니다.

자세한 진행 방법은 아래 링크에 정리된 지침에 따라 진행해주시면 됩니다.
https://www.notion.so/366753ebc0138087aff3fbdd8ac6aa3f?source=copy_link

권한 초대 완료 후 단톡방에 "권한 추가 완료"라고 남겨주시면 확인 후 다음 작업을 진행하겠습니다.

감사합니다.`

export const MONDAY_FEED_UPDATE_REPORT_MESSAGE = `[매장명] 대표님, 안녕하세요.

오늘은 Google 프로필 피드 업데이트 작업을 진행했습니다.

진행 내용
- 이번 주 고객에게 보여줄 소식지/게시물 작성
- 대표 서비스 또는 메뉴 중심으로 문구 정리
- 외국인 고객이 이해하기 쉬운 표현으로 안내 문구 보강
- Google 프로필 내 최신 운영 신호 유지

이번 업데이트는 단기 노출만을 위한 작업이 아니라, Google 프로필에 꾸준히 운영 중인 매장이라는 신호를 쌓기 위한 작업입니다.

확인 후 수정이 필요한 표현이나 강조하고 싶은 메뉴가 있으면 말씀 부탁드립니다.`

export const TUESDAY_KEYWORD_REPORT_MESSAGE = `[매장명] 대표님, 안녕하세요.

오늘은 Google 지도 기준 주요 키워드 노출 흐름을 점검했습니다.

점검 내용
- 브랜드명 검색 노출 상태
- 주요 서비스/메뉴 키워드 검색 흐름
- 지역 키워드와 매장 카테고리 적합성
- 경쟁 매장 대비 프로필 정보 보강 필요 지점

현재는 단순히 키워드를 많이 넣기보다, 실제 고객이 검색할 만한 표현과 Google 프로필 정보가 일관되게 맞는지가 중요합니다.

확인한 내용을 기준으로 다음 피드 업데이트와 프로필 문구에 반영하겠습니다.`

export const WEDNESDAY_DATA_ANALYSIS_REPORT_MESSAGE = `[매장명] 대표님, 안녕하세요.

오늘은 Google 프로필 운영 데이터를 종합적으로 점검했습니다.

점검 내용
- 프로필 조회 흐름
- 검색을 통한 유입 흐름
- 길찾기, 전화, 웹사이트 이동 등 고객 행동 신호
- 사진, 리뷰, 게시물에서 보강이 필요한 지점

데이터는 단순 수치 확인보다 어떤 정보가 고객 행동으로 이어지는지를 보는 것이 중요합니다.

이번 주 데이터 기준으로 다음 작업 우선순위를 정리해 운영에 반영하겠습니다.`

export const THURSDAY_FEED_UPDATE_REPORT_MESSAGE = `[매장명] 대표님, 안녕하세요.

오늘은 주중 운영 내용을 반영해 Google 프로필 피드 업데이트를 추가로 진행했습니다.

진행 내용
- 이번 주 강조할 메뉴/서비스 문구 보강
- 고객이 방문 전 확인할 만한 안내 정보 정리
- 외국인 고객 기준으로 이해하기 쉬운 표현 점검
- Google 프로필 내 최신성 유지

월요일 업데이트가 기본 운영 신호를 쌓는 작업이라면, 목요일 업데이트는 한 주 중간에 매장의 최신 정보를 한 번 더 보강하는 작업입니다.

추가로 알리고 싶은 이벤트나 메뉴가 있으면 전달 부탁드립니다.`

export const FRIDAY_WEEKLY_CLOSE_REPORT_MESSAGE = `[매장명] 대표님, 안녕하세요.

이번 주 Google 프로필 운영 내용을 정리드립니다.

이번 주 진행 내용
- Google 프로필 피드 업데이트
- 주요 키워드 노출 흐름 점검
- 프로필 데이터 확인
- 사진, 리뷰, 게시물 기준 보강 포인트 정리

다음 주 작업 방향
- 고객이 검색 후 바로 이해할 수 있는 정보 보강
- 대표 메뉴/서비스 중심 콘텐츠 누적
- 리뷰와 사진을 통한 신뢰 신호 강화
- Google 프로필과 웹사이트/블로그 정보의 방향성 정리

목표는 단순 게시물 작성이 아니라, Google과 AI가 매장을 더 정확히 이해할 수 있도록 공식 정보를 꾸준히 쌓는 것입니다.`

export function isMenuId(value: string): value is MenuId {
  return menuIds.includes(value as MenuId)
}

export const operationViews: Partial<Record<MenuId, OperationView>> = {
  customer: {
    kicker: 'Account',
    title: '고객관리',
    description: '계약이 확정됐거나 운영이 시작된 매장의 상태, 요청 자료, 담당자를 확인합니다.',
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
  followup: {
    kicker: 'Follow-up',
    title: '팔로업 관리',
    description: '미팅을 잡기 전 연락 대기, 보류, 재제안 대상 클라이언트를 계속 추적합니다.',
    stats: [
      { label: '재연락 대상', value: '9' },
      { label: '보류 리드', value: '5' },
      { label: '이번 주 액션', value: '14' },
    ],
    rows: [
      {
        title: '광주미의원',
        meta: '병원 · GBP 진단자료 제안',
        status: '재연락',
        owner: '권순현',
        due: 'D+2',
        memo: '병원 자료 요청 예시와 무료진단 샘플을 함께 전달합니다.',
      },
      {
        title: '오스테리아윤',
        meta: '요식업 · 견적 검토',
        status: '보류',
        owner: '블링크애드',
        due: '이번 주',
        memo: '1개월 세팅형과 3개월 운영형 차이를 간단히 다시 설명합니다.',
      },
      {
        title: '스타일헤어',
        meta: '헤어샵 · 자료 요청 전',
        status: '미팅 제안',
        owner: '권순현',
        due: '오늘',
        memo: '외국인 고객 기준 Google 프로필 사진/리뷰 관리 필요성을 안내합니다.',
      },
    ],
  },
  project: {
    kicker: 'Store Operations',
    title: '매장 운영관리',
    description: '매장별로 구글프로필, 구글애즈, 웹사이트·블로그, 자료요청 상태를 한 화면에서 확인합니다.',
    stats: [
      { label: '운영 매장', value: '1' },
      { label: '진행 상품', value: '3' },
      { label: '지연 작업', value: '0' },
    ],
    rows: [
      {
        title: '언리미티드',
        meta: '계약상품 · 구글프로필 + 구글애즈 + 웹사이트·블로그',
        status: '계약완료 · 운영중',
        owner: '권순현',
        due: '이번 주',
        memo: '매장별 운영 현황은 상품 메뉴를 나누기보다 한 매장 안에서 상품별 진행 상태를 같이 봅니다.',
        products: {
          googleProfile: '기본 세팅 · 리뷰 응대 · 소식지 운영',
          googleAds: '계정/캠페인 구조 확인',
          website: '브랜드 페이지 구조 기획',
          material: '대표 사진·서비스 설명 요청',
          nextAction: 'Google 프로필 기본정보와 대표사진 정리',
        },
        productWorkspaces: [
          {
            key: 'googleProfile',
            label: '구글프로필',
            heading: '작업·보고 현황',
            description: 'Google 프로필 작업현황과 보고 현황을 한눈에 보고, 누락 없이 운영하기 위한 공간입니다.',
            metrics: [
              { label: '이번 주 작업', value: '3건', note: '기본정보, 사진, 리뷰 기준 정리' },
              { label: '발송상태', value: '작성중', note: '운영 시작 전 기준 리포트 준비' },
              { label: '누락 체크', value: '0건', note: '현재 지연 작업 없음' },
            ],
            weeklyReports: [
              {
                dayOffset: 0,
                status: '작성중',
                title: '피드업데이트',
                memo: 'Google 게시물과 소식지 업데이트를 진행합니다.',
              },
              {
                dayOffset: 1,
                status: '보고대기',
                title: '키워드순위보고',
                memo: '주요 키워드 노출 순위와 변동을 확인합니다.',
              },
              {
                dayOffset: 2,
                status: '보고대기',
                title: '종합 데이터 분석',
                memo: '조회, 검색, 상호작용 데이터를 종합 점검합니다.',
              },
              {
                dayOffset: 3,
                status: '보고대기',
                title: '피드업데이트',
                memo: '주중 운영 내용을 반영해 피드를 추가 업데이트합니다.',
              },
              {
                dayOffset: 4,
                status: '보고대기',
                title: '주간 마감 보고',
                memo: '이번 주 작업 결과와 다음 주 액션을 정리합니다.',
              },
            ],
            tasks: [
              {
                title: '프로필 기본정보 정리',
                status: '진행중',
                owner: '권순현',
                due: '이번 주',
                memo: '카테고리, 영업시간, 전화번호, 매장 설명, 대표 서비스 정보를 먼저 맞춥니다.',
              },
              {
                title: '대표 사진 재정렬',
                status: '대기',
                owner: '블링크애드',
                due: '자료 수신 후',
                memo: '외국인 고객이 방문 전 신뢰할 수 있는 내부/외부/서비스 사진 순서로 정리합니다.',
              },
              {
                title: '리뷰 응대 기준 정리',
                status: '대기',
                owner: '권순현',
                due: '이번 주',
                memo: '한국어 리뷰와 외국어 리뷰에 답변할 톤, 금지 표현, 반복 응대 문구를 정합니다.',
              },
            ],
          },
          {
            key: 'googleAds',
            label: '구글애즈',
            heading: '성과 요약',
            description: '매장별 Google Ads 노출, 클릭, 전환, 광고비 흐름을 나중에 한눈에 보기 위한 공간입니다.',
            metrics: [
              { label: '노출', value: '연동 전', note: 'Google Ads API 연결 후 자동 집계' },
              { label: '클릭/전환', value: '연동 전', note: '전화, 길찾기, 웹사이트 이동 기준' },
              { label: '광고비', value: '연동 전', note: '월 예산과 소진액 비교 예정' },
            ],
            tasks: [
              {
                title: '캠페인 구조 확인',
                status: '대기',
                owner: '권순현',
                due: '운영 시작 전',
                memo: '브랜드 키워드, 지역 키워드, 서비스 키워드를 분리해 예산 낭비를 줄입니다.',
              },
              {
                title: '검색/지도 키워드 그룹 초안',
                status: '대기',
                owner: '블링크애드',
                due: '이번 주',
                memo: '외국인 고객이 실제로 검색할 수 있는 영어/한국어 키워드 그룹을 정리합니다.',
              },
              {
                title: '전화·길찾기 전환 점검',
                status: '대기',
                owner: '권순현',
                due: '세팅 후',
                memo: '광고 클릭 이후 전화, 길찾기, 웹사이트 이동을 추적할 수 있게 기준을 잡습니다.',
              },
            ],
          },
          {
            key: 'websiteBlog',
            label: '웹사이트·블로그',
            heading: '제작·콘텐츠 현황',
            description: '매장별로 어떤 웹사이트, 블로그, FAQ 작업이 들어가고 있는지 체크하기 위한 공간입니다.',
            metrics: [
              { label: '제작 상태', value: '기획중', note: '브랜드/지점 페이지 구조 정리' },
              { label: '콘텐츠', value: '2건 대기', note: 'FAQ, 블로그 주제 정리 필요' },
              { label: 'GBP 연결', value: '예정', note: '페이지 초안 후 프로필 URL 연결' },
            ],
            tasks: [
              {
                title: '브랜드/지점 페이지 구조 기획',
                status: '진행중',
                owner: '권순현',
                due: '이번 주',
                memo: 'GBP에서 연결할 공식 페이지의 메뉴, 서비스 설명, 위치 정보를 먼저 설계합니다.',
              },
              {
                title: 'FAQ 콘텐츠 주제 정리',
                status: '대기',
                owner: '블링크애드',
                due: '다음 주',
                memo: '외국인 고객이 방문 전 궁금해할 질문을 FAQ와 블로그 주제로 전환합니다.',
              },
              {
                title: 'Google 프로필 연결 URL 확정',
                status: '대기',
                owner: '권순현',
                due: '페이지 초안 후',
                memo: '예약 링크만 연결하지 않고, 브랜드 설명이 쌓이는 공식 페이지로 연결합니다.',
              },
            ],
          },
        ],
      },
    ],
  },
  assets: {
    kicker: 'Content Assets',
    title: '콘텐츠 자산',
    description: '웰컴문구와 Google 프로필 요일별 보고 멘트를 한곳에서 열람하고 복사합니다.',
    stats: [
      { label: '콘텐츠', value: '6' },
      { label: '보고 멘트', value: '5' },
      { label: '웰컴문구', value: '1' },
    ],
    rows: [
      {
        title: '계약 시작 웰컴·권한 요청 문구',
        meta: '단톡방 고정 문구 · GBP 권한 추가 · Notion 지침 링크',
        status: '템플릿',
        owner: '블링크애드',
        due: '상시',
        memo: '신규 계약 후 단톡방에 고정해 Google 비즈니스 프로필 관리자 권한 추가를 요청할 때 사용합니다.',
        copyText: WELCOME_GOOGLE_PROFILE_ACCESS_MESSAGE,
      },
      {
        title: '월요일 피드 업데이트 보고 멘트',
        meta: 'Google 게시물 · 소식지 업데이트 · 최신 운영 신호',
        status: '보고멘트',
        owner: '블링크애드',
        due: '월요일',
        memo: 'Google 프로필 게시물과 소식지 업데이트를 보고할 때 사용합니다.',
        copyText: MONDAY_FEED_UPDATE_REPORT_MESSAGE,
      },
      {
        title: '화요일 키워드 순위 보고 멘트',
        meta: '키워드 노출 · 지역 검색 · 경쟁 흐름',
        status: '보고멘트',
        owner: '블링크애드',
        due: '화요일',
        memo: '주요 키워드 노출 흐름과 프로필 보강 방향을 보고할 때 사용합니다.',
        copyText: TUESDAY_KEYWORD_REPORT_MESSAGE,
      },
      {
        title: '수요일 종합 데이터 분석 보고 멘트',
        meta: '조회 · 검색 · 상호작용 · 운영 우선순위',
        status: '보고멘트',
        owner: '블링크애드',
        due: '수요일',
        memo: 'Google 프로필 데이터를 종합 점검하고 작업 우선순위를 설명할 때 사용합니다.',
        copyText: WEDNESDAY_DATA_ANALYSIS_REPORT_MESSAGE,
      },
      {
        title: '목요일 피드 업데이트 보고 멘트',
        meta: '주중 피드 보강 · 메뉴/서비스 안내 · 최신성 유지',
        status: '보고멘트',
        owner: '블링크애드',
        due: '목요일',
        memo: '주중 운영 내용을 반영해 두 번째 피드 업데이트를 보고할 때 사용합니다.',
        copyText: THURSDAY_FEED_UPDATE_REPORT_MESSAGE,
      },
      {
        title: '금요일 주간 마감 보고 멘트',
        meta: '주간 진행 요약 · 다음 주 방향 · 브랜드 정보 누적',
        status: '보고멘트',
        owner: '블링크애드',
        due: '금요일',
        memo: '한 주간 Google 프로필 운영 내용을 요약하고 다음 주 작업 방향을 안내할 때 사용합니다.',
        copyText: FRIDAY_WEEKLY_CLOSE_REPORT_MESSAGE,
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
    description: '오프라인 미팅, 소개, 네트워킹에서 받은 명함을 리드와 고객 후보로 전환하기 위해 관리합니다.',
    stats: [
      { label: '신규 명함', value: '6' },
      { label: '리드 전환', value: '3' },
      { label: '연락 대기', value: '4' },
    ],
    rows: [
      {
        title: '병원 관계자 명함',
        meta: '의료관광 · Google 프로필 상담 후보',
        status: '연락 대기',
        owner: '권순현',
        due: 'D+1',
        memo: '진료 항목과 외국인 환자 유입 니즈를 확인한 뒤 무료진단 제안으로 연결합니다.',
      },
      {
        title: '요식업 대표 소개 리드',
        meta: '로컬 매장 · 프랜차이즈 후보',
        status: 'CRM 등록',
        owner: '블링크애드',
        due: '오늘',
        memo: '명함 정보를 문의 CRM에 옮기고 구글맵 링크를 확인합니다.',
      },
      {
        title: '상권 운영자 연락처',
        meta: 'B2B 제휴 · 상권 단위 제안',
        status: '보류',
        owner: '권순현',
        due: '다음 주',
        memo: '개별 매장 제안보다 상권 단위 GBP 정비 제안으로 접근합니다.',
      },
    ],
  },
  kpi: {
    kicker: 'KPI',
    title: 'KPI 분석',
    description: '매장별 Google 프로필 조회, 검색 노출, 문의, 방문, 리뷰 지표를 운영 기준으로 추적합니다.',
    stats: [
      { label: '측정 매장', value: '9' },
      { label: '개선 필요', value: '5' },
      { label: '리포트 대기', value: '4' },
    ],
    rows: [
      {
        title: 'GBP 조회수 / 검색 노출',
        meta: '인지 지표 · 월간 비교',
        status: '추적중',
        owner: '블링크애드',
        due: '월말',
        memo: '노출 증가만 보지 않고 전화, 길찾기, 웹사이트 클릭과 함께 봅니다.',
      },
      {
        title: '리뷰 수 / 평점 / 대댓글',
        meta: '신뢰 지표 · 운영 품질',
        status: '개선 필요',
        owner: '권순현',
        due: '매주',
        memo: '저평점 리뷰와 미응답 리뷰를 작업 우선순위로 전환합니다.',
      },
      {
        title: '웹사이트 클릭 / 예약 전환',
        meta: '전환 지표 · 지점 페이지',
        status: '세팅 필요',
        owner: '외주 PM',
        due: 'D+7',
        memo: 'GBP 링크가 예약 링크만 있으면 브랜드 설명이 부족하므로 지점 페이지 연결을 점검합니다.',
      },
    ],
  },
  billing: {
    kicker: 'Billing',
    title: '청구관리',
    description: 'GBP 계약 클라이언트의 매월 청구일, 청구 금액, 입금 상태, 다음 결제 예정일을 관리합니다.',
    stats: [
      { label: 'GBP 계약 고객', value: '1' },
      { label: '이번 달 청구', value: '1' },
      { label: '미수 건', value: '0' },
    ],
    rows: [
      {
        title: '언리미티드 월간 GBP 운영료',
        meta: '정기 운영 · 매월 계약일 기준 청구',
        status: '발행 대기',
        owner: '권순현',
        due: '매월 계약일',
        memo: '계약 시작일, 월 청구 금액, 세금계산서 발행 여부, 입금 확인 상태를 한 줄에서 확인합니다.',
      },
    ],
  },
  receivable: {
    kicker: 'Receivables',
    title: '미수금',
    description: '입금 지연, 정기결제 실패, 계약 전 입금 대기 건을 따로 모아 관리합니다.',
    stats: [
      { label: '미수 건', value: '3' },
      { label: '금주 확인', value: '2' },
      { label: '해결 완료', value: '5' },
    ],
    rows: [
      {
        title: '견적 승인 후 입금 대기',
        meta: '계약대기 · 운영 시작 전',
        status: '확인 필요',
        owner: '권순현',
        due: '오늘',
        memo: '입금 확인 전에는 GBP 소유자 인증과 자료 정리를 시작하지 않습니다.',
      },
      {
        title: '정기결제 카드 확인',
        meta: '운영 고객 · 결제 실패 가능성',
        status: '재안내',
        owner: '블링크애드',
        due: 'D+2',
        memo: '결제 수단 변경 요청과 세금계산서 발행 여부를 함께 확인합니다.',
      },
      {
        title: '광고비 선입금 확인',
        meta: 'Google Ads · 광고비 별도',
        status: '대기',
        owner: '외주 PM',
        due: '이번 주',
        memo: '광고비와 운영 수수료가 섞이지 않도록 항목을 분리합니다.',
      },
    ],
  },
  staff: {
    kicker: 'Team',
    title: '담당자 관리',
    description: '직원과 내부 담당자의 매장 배정, 작업량, 후속 액션을 확인합니다.',
    stats: [
      { label: '담당자', value: '4' },
      { label: '배정 매장', value: '18' },
      { label: '지연 업무', value: '4' },
    ],
    rows: [
      {
        title: '권순현',
        meta: '영업 · 제안 · 계약',
        status: '핵심 담당',
        owner: '블링크애드',
        due: '상시',
        memo: '미팅, 견적, 계약 전환까지 파이프라인 전반을 담당합니다.',
      },
      {
        title: '운영 담당',
        meta: 'GBP 포스팅 · 리뷰 응대',
        status: '운영중',
        owner: '권순현',
        due: '매주',
        memo: '주 2회 소식지와 대댓글 기준을 매장별로 맞춥니다.',
      },
      {
        title: '자료 정리 담당',
        meta: '사진 · 메뉴판 · 템플릿',
        status: '배정 필요',
        owner: '블링크애드',
        due: '이번 주',
        memo: '운영 시작 전 자료 누락을 줄이는 역할입니다.',
      },
    ],
  },
  outsourcing: {
    kicker: 'Outsourcing PM',
    title: '외주 PM 관리',
    description: '외주 작업자의 작업 시간, 담당 매장, 산출물 검수 상태를 관리합니다.',
    stats: [
      { label: '외주 PM', value: '3' },
      { label: '진행 작업', value: '11' },
      { label: '검수 대기', value: '4' },
    ],
    rows: [
      {
        title: '포스팅 작성 PM',
        meta: 'Google 게시물 · 블로그 초안',
        status: '진행중',
        owner: '블링크애드',
        due: '매주',
        memo: '매장별 톤과 금지 표현을 확인한 뒤 게시물 초안을 작성합니다.',
      },
      {
        title: '사진 정리 PM',
        meta: '대표 사진 · 메뉴판 · 공간 사진',
        status: '검수 대기',
        owner: '권순현',
        due: 'D+2',
        memo: '방문 전 신뢰를 주는 순서로 사진을 재정렬합니다.',
      },
      {
        title: '웹페이지 제작 PM',
        meta: '지점 페이지 · FAQ · 구조화 데이터',
        status: '대기',
        owner: '외주 PM',
        due: '다음 주',
        memo: 'GBP와 공식 지점 페이지가 같은 정보를 말하도록 연결합니다.',
      },
    ],
  },
}
