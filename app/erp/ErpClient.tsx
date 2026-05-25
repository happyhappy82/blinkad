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
  Clock3,
  CreditCard,
  ExternalLink,
  FileSearch,
  FileSignature,
  Folder,
  Handshake,
  LayoutDashboard,
  Mail,
  Mic,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  UserCog,
  Users,
} from 'lucide-react'
import type { Dispatch, DragEvent, FormEvent, SetStateAction } from 'react'
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
  calendarId?: string
  calendarName?: string
  calendarColor?: string
  calendarForegroundColor?: string
}

type CalendarEventDraft = {
  title: string
  start: string
  end: string
  type: CalendarEvent['type']
  location: string
  memo: string
}

type CalendarApiResponse = {
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

type CalendarAccountView = {
  memberId: string
  name: string
  email: string
  role: string
  calendarId: string
  connected: boolean
  updatedAt?: string
  expiresAt?: number
}

type CalendarAccountsResponse = {
  connected: boolean
  accounts: CalendarAccountView[]
  message?: string
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
    label: '일반 ERP',
    items: [{ id: 'dashboard', label: '대시보드', icon: LayoutDashboard }],
  },
  {
    label: 'CRM/영업',
    items: [
      { id: 'crm', label: '문의관리', icon: Building2 },
      { id: 'followup', label: '팔로업 관리', icon: RefreshCw },
      { id: 'customer', label: '고객관리', icon: Users },
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

type MenuId = (typeof menuGroups)[number]['items'][number]['id']

type StoreProductKey = 'googleProfile' | 'googleAds' | 'websiteBlog'

type StoreProductTask = {
  title: string
  status: string
  owner: string
  due: string
  memo: string
}

type StoreProductMetric = {
  label: string
  value: string
  note: string
}

type StoreProductWorkspace = {
  key: StoreProductKey
  label: string
  heading: string
  description: string
  metrics: StoreProductMetric[]
  tasks: StoreProductTask[]
}

type OperationRow = {
  title: string
  meta: string
  status: string
  owner: string
  due: string
  memo: string
  products?: {
    googleProfile: string
    googleAds: string
    website: string
    material: string
    nextAction: string
  }
  productWorkspaces?: StoreProductWorkspace[]
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
  { label: '진단완료', matcher: ['진단'] },
  { label: '견적발송', matcher: ['견적', '제안'] },
  { label: '계약대기', matcher: ['계약', '대기'] },
  { label: '운영시작', matcher: ['운영', '진행', '시작'] },
]

const EFORMSIGN_URL = 'https://www.eformsign.com/kr/'
const TEAM_CALENDAR_LABEL = '용올캘린더'

const realtimeMenuIds: MenuId[] = ['schedule', 'meeting', 'weekly', 'mail']
const menuIds = menuGroups.flatMap((group) => group.items.map((item) => item.id)) as MenuId[]

function isMenuId(value: string): value is MenuId {
  return menuIds.includes(value as MenuId)
}

const operationViews: Partial<Record<MenuId, OperationView>> = {
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
        status: '작업중',
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
              { label: '보고 상태', value: '작성중', note: '운영 시작 전 기준 리포트 준비' },
              { label: '누락 체크', value: '0건', note: '현재 지연 작업 없음' },
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
    description: '클라이언트별 GBP 자료, 사진, 메뉴판, 포스팅 템플릿, 리뷰 응대 문구를 모아 관리합니다.',
    stats: [
      { label: '자료 보유 매장', value: '11' },
      { label: '사진 대기', value: '7' },
      { label: '템플릿', value: '12' },
    ],
    rows: [
      {
        title: '요식업 기본 자료 패키지',
        meta: '내부/외부 사진 · 메뉴판 · 대표 메뉴',
        status: '템플릿',
        owner: '블링크애드',
        due: '상시',
        memo: 'GBP 운영 시작 전 반드시 요청할 자료 체크리스트로 사용합니다.',
      },
      {
        title: '병원 권위·신뢰 자료',
        meta: '진료 항목 · 방송/세미나 · 시술 사진',
        status: '정리중',
        owner: '권순현',
        due: '이번 주',
        memo: '의료광고 리스크가 없도록 초상권과 표현 수위를 함께 확인합니다.',
      },
      {
        title: '다국어 리뷰 응대 문구',
        meta: '영어 · 일본어 · 중국어',
        status: '운영중',
        owner: '블링크애드',
        due: '상시',
        memo: '매장 톤에 맞게 공통 문구를 그대로 쓰지 않고 가볍게 변형합니다.',
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

  useEffect(() => {
    const menu = new URLSearchParams(window.location.search).get('menu')
    if (menu === 'calendarIntegration') {
      setActiveMenu('settings')
    } else if (menu === 'profile' || menu === 'request') {
      setActiveMenu('project')
    } else if (menu && isMenuId(menu)) {
      setActiveMenu(menu)
    }
  }, [])

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
                  영업·미팅·견적·계약·운영·정산 관리
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
                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
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
                title="문의관리"
                description="Notion 문의관리 DB의 신규 문의와 상담 전 매장을 ERP에서 확인합니다."
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
                description="매장별 계약서 파일, 전자계약 링크, 계약 상태를 확인합니다. 전자계약 발송은 이폼사인에서 진행하고, API 연동은 추후 세팅합니다."
                stores={stores}
                loading={loading}
                columns="contract"
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

            {activeMenu === 'settings' && <SettingsPanel />}

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

function formatDateLabel(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(new Date(value))
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

        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
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
                        className={`min-h-32 cursor-default border-b border-r border-white/10 p-2 transition ${cell ? 'bg-[#07080b] hover:bg-white/[0.04]' : 'bg-white/[0.02]'} ${dragOverSlot === slotKey ? 'bg-brand-blue/10 ring-2 ring-inset ring-brand-blue/60' : ''}`}
                      >
                        {cell ? (
                          <>
                            <p className={`text-xs font-black ${isSameDate(cell, new Date()) ? 'text-brand-blue' : 'text-gray-500'}`}>
                              {cell.getDate()}
                            </p>
                            <div className="mt-2 space-y-1">
                              {dayEvents.slice(0, 4).map((calendarEvent) => renderEventButton(calendarEvent, true))}
                              {dayEvents.length > 4 ? (
                                <p className="text-[11px] font-bold text-gray-500">+{dayEvents.length - 4}개</p>
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
                    <div key={hour} className="grid min-h-24 grid-cols-[64px_repeat(7,minmax(120px,1fr))] border-b border-white/10">
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
                    <div key={hour} className="grid min-h-24 grid-cols-[72px_1fr] border-b border-white/10">
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

          <div className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-sm font-black text-white">일정 목록</p>
            <p className="mt-2 text-xs leading-5 text-gray-500 keep-all">
              일정을 클릭하면 상세 수정 팝업이 열립니다. 일정 카드를 캘린더 칸으로 끌어 옮기면 Google Calendar 수정 요청으로 저장됩니다.
            </p>
            <div className="mt-4 space-y-3">
              {visibleRangeEvents.length === 0 ? (
                <p className="rounded-md border border-white/10 px-3 py-4 text-sm font-bold text-gray-500">표시할 일정이 없습니다.</p>
              ) : (
                visibleRangeEvents.slice(0, 12).map((calendarEvent) => (
                  <button
                    key={calendarEvent.id}
                    type="button"
                    onClick={() => openEditModal(calendarEvent)}
                    className="w-full rounded-md border border-l-4 border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
                    style={calendarEventStyle(calendarEvent)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white keep-all">{calendarEvent.title}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-500">{formatDateTimeRange(calendarEvent)}</p>
                        {calendarEvent.calendarName ? (
                          <p className="mt-2 inline-flex items-center gap-2 text-xs font-black text-gray-400">
                            <span className="h-2.5 w-2.5 rounded-full" style={calendarDotStyle(calendarEvent)} />
                            {calendarEvent.calendarName}
                          </p>
                        ) : null}
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-black ${eventTypeClass(calendarEvent.type)}`}>
                        {eventTypeLabel(calendarEvent.type)}
                      </span>
                    </div>
                    {calendarEvent.location ? <p className="mt-2 text-xs font-bold text-gray-400 keep-all">{calendarEvent.location}</p> : null}
                  </button>
                ))
              )}
            </div>
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

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="rounded-md border border-l-4 border-white/10 bg-white/[0.03] p-3" style={calendarEventStyle(event)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white keep-all">{event.title}</p>
          <p className="mt-1 text-xs font-semibold text-gray-500">{formatDateTime(event.start)}</p>
          {event.calendarName ? (
            <p className="mt-2 inline-flex items-center gap-2 text-xs font-black text-gray-400">
              <span className="h-2.5 w-2.5 rounded-full" style={calendarDotStyle(event)} />
              {event.calendarName}
            </p>
          ) : null}
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
            <div
              key={event.id}
              className="rounded-lg border border-l-4 border-white/10 bg-black p-5"
              style={calendarEventStyle(event)}
            >
              <p className="text-xs font-black text-brand-blue">{formatDateLabel(event.start)}</p>
              <h3 className="mt-3 text-lg font-black text-white keep-all">{event.title}</h3>
              <p className="mt-2 text-sm font-bold text-gray-400">{formatDateTime(event.start)}</p>
              {event.calendarName ? (
                <p className="mt-2 inline-flex items-center gap-2 text-xs font-black text-gray-400">
                  <span className="h-2.5 w-2.5 rounded-full" style={calendarDotStyle(event)} />
                  {event.calendarName}
                </p>
              ) : null}
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
  const isStoreOperations = view.rows.some((row) => row.products)

  if (isStoreOperations) {
    return <StoreOperationsPanel view={view} />
  }

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
        <table className={`${isStoreOperations ? 'min-w-[1240px]' : 'min-w-[980px]'} w-full border-collapse text-left text-sm`}>
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
                <th className="px-5 py-4">상태</th>
                <th className="px-5 py-4">담당</th>
                <th className="px-5 py-4">기한</th>
                <th className="px-5 py-4">메모</th>
              </tr>
            )}
          </thead>
          <tbody>
            {view.rows.map((row) => (
              <tr key={`${view.title}-${row.title}`} className="border-t border-white/10">
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
                      <span className="inline-flex rounded-full border border-brand-blue/25 bg-brand-blue/10 px-2.5 py-1 text-xs font-bold text-blue-100">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-300">{row.owner}</td>
                    <td className="px-5 py-4 font-black text-white">{row.due}</td>
                    <td className="max-w-md px-5 py-4 font-semibold leading-6 text-gray-400 keep-all">{row.memo}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function StoreOperationsPanel({ view }: { view: OperationView }) {
  const [selectedStoreTitle, setSelectedStoreTitle] = useState(view.rows[0]?.title || '')
  const [activeProduct, setActiveProduct] = useState<StoreProductKey>('googleProfile')
  const selectedStore = view.rows.find((row) => row.title === selectedStoreTitle) || view.rows[0]
  const workspaces = selectedStore?.productWorkspaces || []
  const activeWorkspace = workspaces.find((workspace) => workspace.key === activeProduct) || workspaces[0]

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

      <div className="grid min-h-[560px] lg:grid-cols-[300px_1fr]">
        <aside className="border-b border-white/10 bg-black p-4 lg:border-b-0 lg:border-r">
          <p className="px-2 text-xs font-black uppercase tracking-[0.16em] text-gray-600">운영 매장</p>
          <div className="mt-3 space-y-2">
            {view.rows.map((store) => {
              const active = selectedStore?.title === store.title

              return (
                <button
                  key={store.title}
                  type="button"
                  onClick={() => {
                    setSelectedStoreTitle(store.title)
                    setActiveProduct(store.productWorkspaces?.[0]?.key || 'googleProfile')
                  }}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    active
                      ? 'border-brand-blue/40 bg-brand-blue/15'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white keep-all">{store.title}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-gray-500 keep-all">{store.meta}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${statusBadge(store.status)}`}>
                      {store.status}
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-bold text-gray-500">담당 {store.owner} · {store.due}</p>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="p-5 md:p-6">
          {selectedStore ? (
            <>
              <div className="rounded-lg border border-white/10 bg-black p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-blue">Selected Store</p>
                    <h3 className="mt-2 text-2xl font-black text-white">{selectedStore.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">{selectedStore.memo}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm md:min-w-72">
                    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs font-bold text-gray-500">담당</p>
                      <p className="mt-2 font-black text-white">{selectedStore.owner}</p>
                    </div>
                    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                      <p className="text-xs font-bold text-gray-500">기한</p>
                      <p className="mt-2 font-black text-white">{selectedStore.due}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <div className="inline-flex min-w-full rounded-lg border border-white/10 bg-black p-1">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.key}
                      type="button"
                      onClick={() => setActiveProduct(workspace.key)}
                      className={`h-10 flex-1 whitespace-nowrap rounded-md px-4 text-sm font-black transition ${
                        activeWorkspace?.key === workspace.key
                          ? 'bg-white text-black'
                          : 'text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {workspace.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeWorkspace ? (
                <div className="mt-5 rounded-lg border border-white/10 bg-black">
                  <div className="border-b border-white/10 p-5">
                    <p className="text-sm font-bold text-brand-blue">{activeWorkspace.label}</p>
                    <h4 className="mt-2 text-xl font-black text-white">{activeWorkspace.heading}</h4>
                    <p className="mt-2 text-sm leading-6 text-gray-500 keep-all">{activeWorkspace.description}</p>
                  </div>
                  <div className="grid gap-2 border-b border-white/10 p-5 md:grid-cols-3">
                    {activeWorkspace.metrics.map((metric) => (
                      <div key={`${activeWorkspace.key}-${metric.label}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs font-black text-gray-500 keep-all">{metric.label}</p>
                        <p className="mt-2 text-2xl font-black tracking-tight text-white keep-all">{metric.value}</p>
                        <p className="mt-2 text-xs font-semibold leading-5 text-gray-500 keep-all">{metric.note}</p>
                      </div>
                    ))}
                  </div>
                  <div className="divide-y divide-white/10">
                    {activeWorkspace.tasks.map((task) => (
                      <article key={`${activeWorkspace.key}-${task.title}`} className="grid gap-4 p-5 md:grid-cols-[1fr_160px_160px]">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge(task.status)}`}>
                              {task.status}
                            </span>
                            <p className="font-black text-white keep-all">{task.title}</p>
                          </div>
                          <p className="mt-2 text-sm font-semibold leading-6 text-gray-500 keep-all">{task.memo}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600">담당</p>
                          <p className="mt-2 font-bold text-gray-300">{task.owner}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-600">기한</p>
                          <p className="mt-2 font-black text-white">{task.due}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-5 rounded-lg border border-white/10 bg-black p-5 text-sm font-bold text-gray-500">
                  등록된 상품별 업무가 없습니다.
                </p>
              )}
            </>
          ) : (
            <p className="rounded-lg border border-white/10 bg-black p-5 text-sm font-bold text-gray-500">
              등록된 운영 매장이 없습니다.
            </p>
          )}
        </div>
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
  columns: 'crm' | 'diagnosis' | 'quote' | 'contract' | 'report'
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
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          {columns === 'contract' ? (
            <a
              href={EFORMSIGN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-brand-blue/30 bg-brand-blue/10 px-3 text-sm font-black text-blue-100 transition hover:border-brand-blue/60 hover:bg-brand-blue/15"
            >
              이폼사인 바로가기
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
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
                        <a
                          href={EFORMSIGN_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
                        >
                          이폼사인 열기
                        </a>
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
