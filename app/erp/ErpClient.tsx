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
import type { Dispatch, DragEvent, FormEvent, MouseEvent, SetStateAction } from 'react'
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
  StoreBlogContentPost,
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

function readQueryStoreTitle() {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('store') || ''
}

function readQueryProduct(): StoreProductKey {
  if (typeof window === 'undefined') return 'googleProfile'
  const product = new URLSearchParams(window.location.search).get('product')

  return product === 'googleAds' || product === 'websiteBlog' ? product : 'googleProfile'
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
  campaignName?: string
  campaignStatus?: string
  adsCustomerId: string
  impressions: number
  clicks: number
  costMicros: number
  localActionDirectionRequests: number
  localActionCalls: number
  localActionWebsiteClicks: number
  sourceSyncedAt: string
}

type AdsCampaign = {
  id: string
  name: string
  status: string
  channel: string
  startDate: string
  endDate: string
}

type AdsCampaignSummary = AdsCampaign &
  AdsSummary & {
    previousSummary?: AdsSummary
  }

type AdsSearchTermSummary = {
  searchTerm: string
  campaignName: string
  adGroupName: string
  impressions: number
  clicks: number
  costMicros: number
}

type GoogleAdsApiResponse = {
  source: 'bigquery' | 'google_ads_api' | 'fallback'
  connected: boolean
  status: 'connected' | 'empty_table' | 'no_store_data' | 'missing_config' | 'campaign_not_found' | 'error'
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
  campaigns?: AdsCampaign[]
  campaignSummaries?: AdsCampaignSummary[]
  searchTerms?: AdsSearchTermSummary[]
  searchTermMessage?: string
  tableRowCount?: number
  sourceSyncedAt?: string
}

type AdsMonthlyReportPreview = {
  periodLabel: string
  summaryLines: string[]
  actionItems: string[]
  campaignLines: string[]
}

type StoreMetric = {
  label: string
  value: string
  detail?: string
}

type ContractRevenueRecord = {
  storeName: string
  contractMonths: number
  contractStartDate?: string
  productGroup: string
  productDetail: string
  monthlyAmounts: number[]
  memo: string
}

type SettlementProductBreakdown = {
  googleProfileAmount: number
  googleAdsAmount: number
  websiteBlogAmount: number
  adjustmentAmount: number
}

type SettlementRecord = {
  key: string
  storeName: string
  checkDate: string
  status: BillingStatus
  memo: string
  productGroup: string
  productDetail: string
  grossAmount: number
  vatAmount: number
  netSalesAmount: number
  reserveAmount: number
  profileManagementAmount: number
  productBreakdown: SettlementProductBreakdown
  expenseRevenueAmount: number
  workerCostAmount: number
  profitAmount: number
}

type SettlementSummary = {
  monthIndex: number
  monthLabel: string
  records: SettlementRecord[]
  excludedStoreNames: string[]
  grossAmount: number
  vatAmount: number
  netSalesAmount: number
  reserveRate: number
  reserveAmountPerStore: number
  reserveAmount: number
  profileManagementAmount: number
  expenseRevenueRate: number
  expenseRevenueAmount: number
  workerCostPerStore: number
  workerCostAmount: number
  profitAmount: number
}

type SettlementStoreReadiness = '정산대상' | '인증대기'
type SettlementProcessStatus = '정산대기' | '정산완료' | '이번 달 보류' | '정산 제외'
type SettlementFilter = '정산대상' | '인증대기' | '정산완료' | '전체'

type SettlementProcessEntry = {
  status: SettlementProcessStatus
  readiness?: SettlementStoreReadiness
  updatedAt?: string
}

type SettlementProcessMap = Record<string, SettlementProcessEntry>

type SettlementRowView = {
  record: SettlementRecord
  storageKey: string
  readiness: SettlementStoreReadiness
  processStatus: SettlementProcessStatus
  updatedAt?: string
}

type SettlementTotals = {
  grossAmount: number
  vatAmount: number
  netSalesAmount: number
  reserveAmount: number
  profileManagementAmount: number
  expenseRevenueAmount: number
  workerCostAmount: number
  profitAmount: number
}

type WeeklyReportItem = {
  report: StoreWeeklyReport
  date: Date
  dateKey: string
  draftMemo: string
}

type WebsiteBlogCycle = {
  index: number
  start: Date
  end: Date
}

const CONTRACT_REVENUE_START_YEAR = 2026
const CONTRACT_REVENUE_START_MONTH = 6
const SETTLEMENT_EXCLUDED_STORE_NAMES: string[] = []
const SETTLEMENT_PROCESS_STORAGE_KEY = 'blinkad-erp-settlement-process-v1'
const SETTLEMENT_AUTH_PENDING_STORE_NAMES = ['언리미티드', '주도락 강남점', '주도락 마곡발산점']
const SETTLEMENT_RESERVE_RATE = 0
const SETTLEMENT_RESERVE_AMOUNT_PER_STORE = 50_000
const SETTLEMENT_EXPENSE_REVENUE_RATE = 0.1
const SETTLEMENT_GOOGLE_ADS_NET_AMOUNT = 200_000
const SETTLEMENT_WEBSITE_BLOG_NET_AMOUNT = 500_000
const SETTLEMENT_WORKER_COST_PER_STORE = 150_000
const VAT_RATE = 0.1

const contractRevenueRecords: ContractRevenueRecord[] = [
  {
    storeName: '언리미티드',
    contractMonths: 1,
    contractStartDate: '2026-06-01',
    productGroup: '구글애즈 + 구글프로필관리',
    productDetail: '구글애즈 20만원 + 구글프로필관리 70만원',
    monthlyAmounts: [990_000],
    memo: '1개월 계약 · VAT 포함 99만원',
  },
  {
    storeName: '웰믹스 광화문점',
    contractMonths: 1,
    contractStartDate: '2026-06-10',
    productGroup: '구글애즈 + 구글프로필관리',
    productDetail: '구글애즈 20만원 + 구글프로필관리 70만원',
    monthlyAmounts: [990_000],
    memo: '1개월 계약 · VAT 포함 99만원',
  },
  {
    storeName: '도르도뉴',
    contractMonths: 1,
    contractStartDate: '2026-06-23',
    productGroup: '구글애즈 + 구글프로필관리',
    productDetail: '구글애즈 20만원 + 구글프로필관리 70만원',
    monthlyAmounts: [990_000],
    memo: '1개월 계약 · VAT 포함 99만원',
  },
  {
    storeName: '오닉스',
    contractMonths: 1,
    contractStartDate: '2026-07-08',
    productGroup: '구글애즈 + 구글프로필관리',
    productDetail: '구글프로필관리 70만원 + 구글애즈 20만원',
    monthlyAmounts: [990_000],
    memo: '1개월 계약 · VAT 포함 99만원 · 입금 예정일 2026년 7월 8일',
  },
  {
    storeName: '주도락 강남점',
    contractMonths: 1,
    contractStartDate: '2026-06-20',
    productGroup: '구글애즈 + 구글프로필 + 웹사이트/블로그',
    productDetail: '블링크애드 1개월 상품 · 통합 운영',
    monthlyAmounts: [1_540_000],
    memo: '1개월 계약 · VAT 포함 154만원',
  },
  {
    storeName: '주도락 마곡발산점',
    contractMonths: 1,
    contractStartDate: '2026-06-20',
    productGroup: '구글애즈 + 구글프로필 + 웹사이트/블로그',
    productDetail: '블링크애드 1개월 상품 · 통합 운영',
    monthlyAmounts: [1_540_000],
    memo: '1개월 계약 · VAT 포함 154만원',
  },
  {
    storeName: '바다당 해운대점',
    contractMonths: 12,
    contractStartDate: '2026-06-16',
    productGroup: '구글애즈 + 구글프로필 + 웹사이트/블로그',
    productDetail: '프로필·애즈·웹사이트/블로그 통합 운영',
    monthlyAmounts: [
      1_540_000,
      1_300_000,
      1_200_000,
      1_000_000,
      1_000_000,
      1_000_000,
      750_000,
      750_000,
      750_000,
      750_000,
      750_000,
      750_000,
    ],
    memo: '12개월 계약 · 1개월차 VAT 포함 154만원 · 총 1,154만원 기준',
  },
]

const billingScheduleByStore: Record<
  string,
  {
    dueDay: number
    firstPaidDate?: string
    firstStatus?: BillingStatus
    memo: string
  }
> = {
  언리미티드: {
    dueDay: 30,
    firstStatus: '청구예정',
    memo: '입금일 추후 확인',
  },
  '웰믹스 광화문점': {
    dueDay: 10,
    firstPaidDate: '2026-06-11',
    firstStatus: '입금완료',
    memo: '2026년 6월 11일 입금완료',
  },
  도르도뉴: {
    dueDay: 23,
    firstPaidDate: '2026-06-23',
    firstStatus: '입금완료',
    memo: '2026년 6월 23일 입금완료',
  },
  오닉스: {
    dueDay: 8,
    firstStatus: '청구예정',
    memo: '입금 예정일 2026년 7월 8일(확정 전)',
  },
  '바다당 해운대점': {
    dueDay: 16,
    firstPaidDate: '2026-06-16',
    firstStatus: '입금완료',
    memo: '2026년 6월 16일 입금완료',
  },
  '주도락 강남점': {
    dueDay: 20,
    firstPaidDate: '2026-06-20',
    firstStatus: '입금완료',
    memo: '2026년 6월 20일 입금완료',
  },
  '주도락 마곡발산점': {
    dueDay: 20,
    firstPaidDate: '2026-06-20',
    firstStatus: '입금완료',
    memo: '2026년 6월 20일 입금완료',
  },
}

function contractRevenueTotal(record: ContractRevenueRecord) {
  return record.monthlyAmounts.reduce((sum, amount) => sum + amount, 0)
}

function firstMonthRevenue(record: ContractRevenueRecord) {
  return record.monthlyAmounts[0] || 0
}

function contractStartRevenueMonthIndex(record: ContractRevenueRecord) {
  const [yearText, monthText] = (record.contractStartDate || '').split('-')
  const year = Number(yearText)
  const month = Number(monthText)

  if (!year || !month) return 0
  return (year - CONTRACT_REVENUE_START_YEAR) * 12 + (month - CONTRACT_REVENUE_START_MONTH)
}

function contractMonthIndexForRevenueMonth(record: ContractRevenueRecord, revenueMonthIndex: number) {
  return revenueMonthIndex - contractStartRevenueMonthIndex(record)
}

function contractRevenueAmountForMonth(record: ContractRevenueRecord, revenueMonthIndex: number) {
  const contractMonthIndex = contractMonthIndexForRevenueMonth(record, revenueMonthIndex)
  if (contractMonthIndex < 0) return 0
  return record.monthlyAmounts[contractMonthIndex] || 0
}

function contractRevenueLastMonthIndex(records: ContractRevenueRecord[]) {
  if (!records.length) return 0

  return Math.max(
    ...records.map((record) => contractStartRevenueMonthIndex(record) + record.monthlyAmounts.length - 1),
    0
  )
}

function settlementProductBreakdown(record: ContractRevenueRecord, netSalesAmount: number): SettlementProductBreakdown {
  const productText = `${record.productGroup} ${record.productDetail}`
  const googleAdsAmount = productText.includes('구글애즈') ? SETTLEMENT_GOOGLE_ADS_NET_AMOUNT : 0
  const websiteBlogAmount =
    productText.includes('웹사이트') || productText.includes('블로그') ? SETTLEMENT_WEBSITE_BLOG_NET_AMOUNT : 0
  const fixedProductAmount = googleAdsAmount + websiteBlogAmount
  const googleProfileAmount = Math.max(netSalesAmount - fixedProductAmount, 0)

  return {
    googleProfileAmount,
    googleAdsAmount,
    websiteBlogAmount,
    adjustmentAmount: Math.min(netSalesAmount - fixedProductAmount, 0),
  }
}

function buildMonthlySettlementSummaries(records: ContractRevenueRecord[]): SettlementSummary[] {
  const lastMonthIndex = contractRevenueLastMonthIndex(records)

  return Array.from({ length: lastMonthIndex + 1 }, (_, monthIndex) => buildSettlementSummary(records, monthIndex)).filter(
    (summary) => summary.records.length > 0
  )
}

function buildSettlementSummary(records: ContractRevenueRecord[], monthIndex: number): SettlementSummary {
  const settlementRecords = records
    .filter(
      (record) =>
        !SETTLEMENT_EXCLUDED_STORE_NAMES.includes(record.storeName) && contractRevenueAmountForMonth(record, monthIndex) > 0
    )
    .map((record) => {
      const grossAmount = contractRevenueAmountForMonth(record, monthIndex)
      const netSalesAmount = Math.round(grossAmount / (1 + VAT_RATE))
      const vatAmount = grossAmount - netSalesAmount
      const reserveAmount = SETTLEMENT_RESERVE_AMOUNT_PER_STORE
      const productBreakdown = settlementProductBreakdown(record, netSalesAmount)
      const profileManagementAmount = productBreakdown.googleProfileAmount
      const expenseRevenueAmount = Math.round(profileManagementAmount * SETTLEMENT_EXPENSE_REVENUE_RATE)
      const workerCostAmount = SETTLEMENT_WORKER_COST_PER_STORE
      const checkDate = settlementCheckDateForStore(record, monthIndex)

      return {
        key: `${monthIndex}:${record.storeName}:${checkDate}`,
        storeName: record.storeName,
        checkDate,
        status: settlementStatusForStore(record, monthIndex),
        memo: record.memo,
        productGroup: record.productGroup,
        productDetail: record.productDetail,
        grossAmount,
        vatAmount,
        netSalesAmount,
        reserveAmount,
        profileManagementAmount,
        productBreakdown,
        expenseRevenueAmount,
        workerCostAmount,
        profitAmount: netSalesAmount - reserveAmount - expenseRevenueAmount - workerCostAmount,
      }
    })
    .sort((a, b) => a.checkDate.localeCompare(b.checkDate) || a.storeName.localeCompare(b.storeName))

  const grossAmount = settlementRecords.reduce((sum, record) => sum + record.grossAmount, 0)
  const netSalesAmount = Math.round(grossAmount / (1 + VAT_RATE))
  const vatAmount = grossAmount - netSalesAmount
  const reserveAmount = settlementRecords.reduce((sum, record) => sum + record.reserveAmount, 0)
  const profileManagementAmount = settlementRecords.reduce((sum, record) => sum + record.profileManagementAmount, 0)
  const expenseRevenueAmount = settlementRecords.reduce((sum, record) => sum + record.expenseRevenueAmount, 0)
  const workerCostAmount = settlementRecords.length * SETTLEMENT_WORKER_COST_PER_STORE

  return {
    monthIndex,
    monthLabel: contractRevenueMonthLabel(monthIndex),
    records: settlementRecords,
    excludedStoreNames: SETTLEMENT_EXCLUDED_STORE_NAMES,
    grossAmount,
    vatAmount,
    netSalesAmount,
    reserveRate: SETTLEMENT_RESERVE_RATE,
    reserveAmountPerStore: SETTLEMENT_RESERVE_AMOUNT_PER_STORE,
    reserveAmount,
    profileManagementAmount,
    expenseRevenueRate: SETTLEMENT_EXPENSE_REVENUE_RATE,
    expenseRevenueAmount,
    workerCostPerStore: SETTLEMENT_WORKER_COST_PER_STORE,
    workerCostAmount,
    profitAmount: netSalesAmount - reserveAmount - expenseRevenueAmount - workerCostAmount,
  }
}

function settlementProcessStorageKey(monthIndex: number, storeName: string) {
  return `${monthIndex}:${storeName}`
}

function isSettlementProcessStatus(value: unknown): value is SettlementProcessStatus {
  return value === '정산대기' || value === '정산완료' || value === '이번 달 보류' || value === '정산 제외'
}

function isSettlementStoreReadiness(value: unknown): value is SettlementStoreReadiness {
  return value === '정산대상' || value === '인증대기'
}

function settlementStoreReadiness(storeName: string): SettlementStoreReadiness {
  return SETTLEMENT_AUTH_PENDING_STORE_NAMES.includes(storeName) ? '인증대기' : '정산대상'
}

function defaultSettlementProcessStatus(readiness: SettlementStoreReadiness): SettlementProcessStatus {
  return readiness === '인증대기' ? '이번 달 보류' : '정산대기'
}

function readSettlementProcessMap(): SettlementProcessMap {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(SETTLEMENT_PROCESS_STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as Record<string, unknown>
    return Object.entries(parsed).reduce<SettlementProcessMap>((map, [key, value]) => {
      if (isSettlementProcessStatus(value)) {
        map[key] = { status: value }
        return map
      }

      if (value && typeof value === 'object') {
        const entry = value as { status?: unknown; readiness?: unknown; updatedAt?: unknown }
        if (isSettlementProcessStatus(entry.status)) {
          map[key] = {
            status: entry.status,
            readiness: isSettlementStoreReadiness(entry.readiness) ? entry.readiness : undefined,
            updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : undefined,
          }
        }
      }

      return map
    }, {})
  } catch {
    return {}
  }
}

function settlementTotalsFromRows(rows: SettlementRowView[]): SettlementTotals {
  return rows.reduce<SettlementTotals>(
    (totals, row) => ({
      grossAmount: totals.grossAmount + row.record.grossAmount,
      vatAmount: totals.vatAmount + row.record.vatAmount,
      netSalesAmount: totals.netSalesAmount + row.record.netSalesAmount,
      reserveAmount: totals.reserveAmount + row.record.reserveAmount,
      profileManagementAmount: totals.profileManagementAmount + row.record.profileManagementAmount,
      expenseRevenueAmount: totals.expenseRevenueAmount + row.record.expenseRevenueAmount,
      workerCostAmount: totals.workerCostAmount + row.record.workerCostAmount,
      profitAmount: totals.profitAmount + row.record.profitAmount,
    }),
    {
      grossAmount: 0,
      vatAmount: 0,
      netSalesAmount: 0,
      reserveAmount: 0,
      profileManagementAmount: 0,
      expenseRevenueAmount: 0,
      workerCostAmount: 0,
      profitAmount: 0,
    }
  )
}

function settlementCheckDateForStore(record: ContractRevenueRecord, revenueMonthIndex: number) {
  const schedule = billingScheduleByStore[record.storeName]
  const contractMonthIndex = contractMonthIndexForRevenueMonth(record, revenueMonthIndex)
  if (contractMonthIndex === 0 && schedule?.firstPaidDate) return schedule.firstPaidDate

  const date = contractRevenueMonthDate(revenueMonthIndex)
  const dueDay = schedule?.dueDay || 25
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  return toISODate(new Date(date.getFullYear(), date.getMonth(), Math.min(dueDay, lastDay)))
}

function settlementStatusForStore(record: ContractRevenueRecord, revenueMonthIndex: number): BillingStatus {
  const schedule = billingScheduleByStore[record.storeName]
  const contractMonthIndex = contractMonthIndexForRevenueMonth(record, revenueMonthIndex)
  if (contractMonthIndex === 0 && schedule?.firstStatus) return schedule.firstStatus
  return '청구예정'
}

function contractRevenueMonthDate(monthIndex: number) {
  return new Date(CONTRACT_REVENUE_START_YEAR, CONTRACT_REVENUE_START_MONTH - 1 + monthIndex, 1)
}

function contractRevenueMonthLabel(monthIndex: number) {
  const date = contractRevenueMonthDate(monthIndex)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
}

function monthlyRevenueSchedule(records: ContractRevenueRecord[]) {
  const lastMonthIndex = contractRevenueLastMonthIndex(records)

  return Array.from({ length: lastMonthIndex + 1 }, (_, index) => {
    const stores = records
      .map((record) => ({
        storeName: record.storeName,
        amount: contractRevenueAmountForMonth(record, index),
      }))
      .filter((item) => item.amount > 0)

    return {
      month: index + 1,
      monthLabel: contractRevenueMonthLabel(index),
      amount: stores.reduce((sum, item) => sum + item.amount, 0),
      stores,
    }
  })
}

type CalendarContextMenu =
  | { kind: 'event'; x: number; y: number; event: CalendarEvent }
  | { kind: 'slot'; x: number; y: number; date: Date; hour?: number }
  | { kind: 'calendar'; x: number; y: number; calendar: CalendarEvent }

type CalendarContextMenuInput =
  | { kind: 'event'; event: CalendarEvent }
  | { kind: 'slot'; date: Date; hour?: number }
  | { kind: 'calendar'; calendar: CalendarEvent }

type BillingStatus = '청구예정' | '청구완료' | '입금완료' | '연체' | '보류'

type BillingRecord = {
  id: string
  storeName: string
  product: string
  amount: number
  dueDate: string
  dueDay: number
  status: BillingStatus
  owner: string
  taxInvoice: string
  memo: string
}

export default function ErpClient() {
  const [activeMenu, setActiveMenu] = useState<MenuId>('dashboard')
  const [menuSynced, setMenuSynced] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarPreview, setSidebarPreview] = useState(false)
  const [activeStoreTitle, setActiveStoreTitle] = useState('')
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
    setActiveStoreTitle(readQueryStoreTitle())
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
  const contractRevenue = useMemo(() => {
    const monthlyRows = monthlyRevenueSchedule(contractRevenueRecords)

    return {
      records: contractRevenueRecords,
      firstMonthAmount: monthlyRows[0]?.amount || 0,
      contractTotalAmount: contractRevenueRecords.reduce((sum, record) => sum + contractRevenueTotal(record), 0),
      monthlyRows,
      settlementMonths: buildMonthlySettlementSummaries(contractRevenueRecords),
    }
  }, [])

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
  const billingRecords = useMemo(() => buildBillingRecords(stores), [stores])
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
    realtimeMenuIds.includes(activeMenu) ||
    activeMenu === 'followup' ||
    activeMenu === 'customer' ||
    activeMenu === 'card' ||
    activeMenu === 'billing' ||
    activeMenu === 'settlement' ||
    activeMenu === 'kpi'
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
    if (menuId === 'project') {
      setActiveStoreTitle('')
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
                                className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs font-black transition ${
                                  storeActive
                                    ? 'bg-white text-black'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                <span>{store.title}</span>
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
              <DashboardPanel counts={dashboard.counts} contractRevenue={contractRevenue} />
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
                title="분석자료 생성"
                description="각 매장별 Google 맵 링크를 기준으로 분석자료 PDF를 생성하고 Notion 분석자료 열에 저장합니다."
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
                title="견적서 조회/생성"
                description="Notion 문의관리 DB의 견적서 열에 저장된 PDF를 바로 조회하고, 필요한 매장은 견적서를 생성합니다."
                stores={stores}
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

            {activeMenu === 'blinkadMarketing' && <BlinkAdMarketingPanel />}

            {activeMenu === 'billing' && (
              <BillingPanel
                records={billingRecords}
                loading={loading}
                message={connectionMessage}
              />
            )}

            {activeMenu === 'settlement' && (
              <SettlementManagementPanel settlementMonths={contractRevenue.settlementMonths} />
            )}

            {activeMenu === 'kpi' && (
              <KpiPanel
                currentContracts={contractRevenue.records.length}
                goalContracts={50}
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

function KpiPanel({
  currentContracts,
  goalContracts,
}: {
  currentContracts: number
  goalContracts: number
}) {
  const remainingContracts = Math.max(goalContracts - currentContracts, 0)
  const progressRate = goalContracts > 0 ? Math.min(100, Math.round((currentContracts / goalContracts) * 100)) : 0
  const chartBackground = `conic-gradient(#2563eb 0 ${progressRate}%, rgba(255,255,255,0.08) ${progressRate}% 100%)`

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-[#0b0d12]">
        <div className="grid gap-6 p-5 md:grid-cols-[320px_1fr] md:p-6">
          <div className="flex items-center justify-center">
            <div
              className="relative flex aspect-square w-full max-w-[260px] items-center justify-center rounded-full"
              style={{ background: chartBackground }}
              aria-label={`매장 계약체결 목표 달성률 ${progressRate}%`}
            >
              <div className="absolute inset-5 rounded-full border border-white/10 bg-black" />
              <div className="relative text-center">
                <p className="text-sm font-black text-brand-blue">달성률</p>
                <p className="mt-2 text-6xl font-black text-white">{progressRate}%</p>
                <p className="mt-2 text-sm font-bold text-gray-500">
                  {currentContracts}/{goalContracts}개
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-sm font-bold text-brand-blue">KPI</p>
            <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">매장 50개 계약체결</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-gray-500 keep-all">
              대시보드 계약 매장 리스트 기준으로 현재 계약체결 수와 목표까지 남은 매장 수만 추적합니다.
            </p>

            <div className="mt-6 grid overflow-hidden rounded-lg border border-white/10 bg-black md:grid-cols-3">
              <div className="border-white/10 p-5 md:border-r">
                <p className="text-xs font-black text-gray-500">현재 계약</p>
                <p className="mt-2 text-4xl font-black text-white">{currentContracts}개</p>
              </div>
              <div className="border-white/10 p-5 md:border-r">
                <p className="text-xs font-black text-gray-500">목표</p>
                <p className="mt-2 text-4xl font-black text-white">{goalContracts}개</p>
              </div>
              <div className="p-5">
                <p className="text-xs font-black text-gray-500">남은 계약</p>
                <p className="mt-2 text-4xl font-black text-blue-100">{remainingContracts}개</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-black text-white">목표 진행 바</p>
            <p className="text-sm font-black text-gray-400">{progressRate}%</p>
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-brand-blue transition-all"
              style={{ width: `${progressRate}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardPanel({
  counts,
  contractRevenue,
}: {
  counts: { label: string; count: number }[]
  contractRevenue: {
    records: ContractRevenueRecord[]
    firstMonthAmount: number
    contractTotalAmount: number
    settlementMonths: SettlementSummary[]
    monthlyRows: {
      month: number
      monthLabel: string
      amount: number
      stores: { storeName: string; amount: number }[]
    }[]
  }
}) {
  const revenueCards = [
    {
      label: '계약매장 개수',
      value: `${contractRevenue.records.length}개`,
      detail: '운영 계약 기준',
    },
    {
      label: '이번달 매출',
      value: formatRevenueManwon(contractRevenue.firstMonthAmount),
      detail: `${contractRevenue.monthlyRows[0]?.monthLabel || '2026년 6월'} 기준`,
    },
    {
      label: '총 계약매출',
      value: formatRevenueManwon(contractRevenue.contractTotalAmount),
      detail: '월별 스케줄 합산',
    },
  ]

  return (
    <section className="space-y-5">
      <KpiPanel currentContracts={contractRevenue.records.length} goalContracts={50} />
      <InquiryStatusPanel counts={counts} />
      <ContractSummaryPanel cards={revenueCards} />
      <ContractRevenueList records={contractRevenue.records} />
    </section>
  )
}

function InquiryStatusPanel({ counts }: { counts: { label: string; count: number }[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
      <div className="mb-4">
        <p className="text-sm font-bold text-brand-blue">Inquiry Status</p>
        <h3 className="mt-2 text-xl font-black text-white">문의현황 데이터</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
        {counts.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-black p-5">
            <p className="text-sm font-bold text-gray-400">{item.label}</p>
            <p className="mt-4 text-5xl font-black tracking-tight text-white">{item.count}</p>
            <p className="mt-3 text-sm leading-6 text-gray-500">문의관리 DB 기준</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ContractSummaryPanel({
  cards,
}: {
  cards: { label: string; value: string; detail: string }[]
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Contract Summary</p>
          <h3 className="mt-2 text-xl font-black text-white">계약 매장 요약</h3>
        </div>
        <p className="text-xs font-bold text-gray-600">청구·입금 상태는 청구관리 메뉴에서 확인</p>
      </div>
      <div className="grid overflow-hidden rounded-lg border border-white/10 bg-black md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="border-white/10 px-5 py-4 md:border-r last:border-r-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-white">{card.value}</p>
            <p className="mt-1 text-xs font-bold text-gray-500">{card.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ContractRevenueList({ records }: { records: ContractRevenueRecord[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
      <div className="mb-4">
        <p className="text-sm font-bold text-brand-blue">Contract List</p>
        <h3 className="mt-2 text-xl font-black text-white">계약 매장 리스트</h3>
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-collapse text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-gray-500">
              <tr>
                <th className="px-4 py-3">매장명</th>
                <th className="px-4 py-3">상품구성</th>
                <th className="px-4 py-3">계약개월</th>
                <th className="px-4 py-3">1개월차 매출</th>
                <th className="px-4 py-3">계약기간 합계</th>
                <th className="px-4 py-3">메모</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.storeName} className="border-t border-white/10">
                  <td className="px-4 py-4">
                    <p className="font-black text-white keep-all">{record.storeName}</p>
                  </td>
                  <td className="max-w-[260px] px-4 py-4">
                    <p className="font-black text-gray-200 keep-all">{record.productGroup}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-gray-500 keep-all">{record.productDetail}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full border border-brand-blue/25 bg-brand-blue/10 px-2.5 py-1 text-xs font-black text-blue-100">
                      {record.contractMonths}개월
                    </span>
                  </td>
                  <td className="px-4 py-4 font-black text-white">{formatCurrency(firstMonthRevenue(record))}원</td>
                  <td className="px-4 py-4 font-black text-emerald-100">{formatCurrency(contractRevenueTotal(record))}원</td>
                  <td className="max-w-[220px] px-4 py-4 text-xs font-semibold leading-5 text-gray-500 keep-all">
                    {record.memo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

function SettlementManagementPanel({ settlementMonths }: { settlementMonths: SettlementSummary[] }) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="border-b border-white/10 p-5 md:p-6">
        <p className="text-sm font-bold text-brand-blue">Settlement</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">정산관리</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-gray-500 keep-all">
          월별 정산 예상표와 매장별 정산 상세를 확인합니다.
        </p>
      </div>
      <RevenueSettlementPanel settlementMonths={settlementMonths} />
    </section>
  )
}

function RevenueSettlementPanel({ settlementMonths }: { settlementMonths: SettlementSummary[] }) {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(() => settlementMonths[0]?.monthIndex || 0)
  const [settlementFilter, setSettlementFilter] = useState<SettlementFilter>('정산대상')
  const [settlementProcessMap, setSettlementProcessMap] = useState<SettlementProcessMap>(() => readSettlementProcessMap())
  const settlement =
    settlementMonths.find((summary) => summary.monthIndex === selectedMonthIndex) || settlementMonths[0]

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SETTLEMENT_PROCESS_STORAGE_KEY, JSON.stringify(settlementProcessMap))
  }, [settlementProcessMap])

  useEffect(() => {
    if (!settlementMonths.length) return
    if (!settlementMonths.some((summary) => summary.monthIndex === selectedMonthIndex)) {
      setSelectedMonthIndex(settlementMonths[0].monthIndex)
    }
  }, [selectedMonthIndex, settlementMonths])

  if (!settlement) return null

  const settlementRows: SettlementRowView[] = settlement.records.map((record) => {
    const storageKey = settlementProcessStorageKey(settlement.monthIndex, record.storeName)
    const entry = settlementProcessMap[storageKey]
    const readiness = entry?.readiness || settlementStoreReadiness(record.storeName)
    const processStatus = entry?.status || defaultSettlementProcessStatus(readiness)

    return {
      record,
      storageKey,
      readiness,
      processStatus,
      updatedAt: entry?.updatedAt,
    }
  })
  const settlementTargetRows = settlementRows.filter(
    (row) => row.readiness === '정산대상' && row.processStatus !== '이번 달 보류' && row.processStatus !== '정산 제외'
  )
  const authPendingRows = settlementRows.filter((row) => row.readiness === '인증대기')
  const completedRows = settlementRows.filter((row) => row.processStatus === '정산완료')
  const heldRows = settlementRows.filter((row) => row.processStatus === '이번 달 보류' || row.processStatus === '정산 제외')
  const settlementTargetTotals = settlementTotalsFromRows(settlementTargetRows)
  const filteredSettlementRows = settlementRows.filter((row) => {
    if (settlementFilter === '전체') return true
    if (settlementFilter === '정산완료') return row.processStatus === '정산완료'
    return row.readiness === settlementFilter
  })

  const updateSettlementProcessStatus = (row: SettlementRowView, status: SettlementProcessStatus) => {
    setSettlementProcessMap((current) => ({
      ...current,
      [row.storageKey]: {
        readiness: row.readiness,
        status,
        updatedAt: new Date().toISOString(),
      },
    }))
  }

  const bulkUpdateSettlementProcessStatus = (rows: SettlementRowView[], status: SettlementProcessStatus) => {
    const updatedAt = new Date().toISOString()
    setSettlementProcessMap((current) => {
      const next = { ...current }
      rows.forEach((row) => {
        next[row.storageKey] = { readiness: row.readiness, status, updatedAt }
      })
      return next
    })
  }

  const updateSettlementReadiness = (row: SettlementRowView, readiness: SettlementStoreReadiness) => {
    setSettlementProcessMap((current) => ({
      ...current,
      [row.storageKey]: {
        readiness,
        status: defaultSettlementProcessStatus(readiness),
        updatedAt: new Date().toISOString(),
      },
    }))
  }

  const summaryCards = [
    {
      label: '정산대상 입금액',
      value: formatRevenueManwon(settlementTargetTotals.grossAmount),
      detail: `${settlementTargetRows.length}개 매장 합산`,
      highlight: false,
    },
    {
      label: '매출부가세',
      value: formatRevenueManwon(settlementTargetTotals.vatAmount),
      detail: 'VAT 포함 입금액에서 분리',
      highlight: false,
    },
    {
      label: 'VAT 제외 매출',
      value: formatRevenueManwon(settlementTargetTotals.netSalesAmount),
      detail: '순수익 계산 기준 매출',
      highlight: false,
    },
    {
      label: '비용매출',
      value: formatRevenueManwon(settlementTargetTotals.expenseRevenueAmount),
      detail: `프로필관리 ${formatRevenueManwon(settlementTargetTotals.profileManagementAmount)}의 ${Math.round(settlement.expenseRevenueRate * 100)}%`,
      highlight: false,
    },
    {
      label: '예상 순수익',
      value: formatRevenueManwon(settlementTargetTotals.profitAmount),
      detail: `매장당 ${formatRevenueManwon(settlement.reserveAmountPerStore)} 충당금`,
      highlight: true,
    },
  ]

  const processSummaryCards = [
    { label: '정산대상', value: `${settlementTargetRows.length}개`, detail: '인증 완료·정상 운영' },
    { label: '인증대기', value: `${authPendingRows.length}개`, detail: '이번 정산 합계 제외' },
    { label: '정산완료', value: `${completedRows.length}개`, detail: '월별 체크 완료' },
    { label: '보류/제외', value: `${heldRows.length}개`, detail: '수동 보류 또는 제외' },
  ]

  return (
    <div className="border-b border-white/10 p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="mt-2 text-xl font-black text-white">월별 정산 예상표</h3>
          <p className="mt-2 text-sm font-semibold text-gray-500 keep-all">
            정산 가능한 매장만 먼저 합산하고, 인증대기 매장은 보류 상태로 분리합니다.
          </p>
        </div>
        <p className="text-xs font-bold leading-5 text-gray-600 md:text-right keep-all">
          인증대기·보류·제외 매장은 상단 정산대상 합계에서 제외
        </p>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {settlementMonths.map((summary) => (
          <button
            key={`settlement-month-${summary.monthIndex}`}
            type="button"
            onClick={() => setSelectedMonthIndex(summary.monthIndex)}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-black transition ${
              summary.monthIndex === settlement.monthIndex
                ? 'border-brand-blue bg-brand-blue text-white'
                : 'border-white/10 bg-black text-gray-400 hover:border-white/25 hover:text-white'
            }`}
          >
            {summary.monthLabel}
          </button>
        ))}
      </div>

      <div className="mt-4 grid overflow-hidden rounded-lg border border-white/10 bg-black md:grid-cols-5">
        {summaryCards.map((card) => (
          <div
            key={`settlement-summary-${card.label}`}
            className={`border-white/10 px-4 py-4 md:border-r last:border-r-0 ${card.highlight ? 'bg-emerald-300/10' : ''}`}
          >
            <p className={card.highlight ? 'text-xs font-black text-emerald-100/70' : 'text-xs font-black text-gray-500'}>{card.label}</p>
            <p className={card.highlight ? 'mt-2 text-2xl font-black text-emerald-50' : 'mt-2 text-2xl font-black text-white'}>
              {card.value}
            </p>
            <p className={card.highlight ? 'mt-1 text-xs font-semibold text-emerald-100/70' : 'mt-1 text-xs font-semibold text-gray-500'}>
              {card.detail}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {processSummaryCards.map((card) => (
          <div key={`settlement-process-summary-${card.label}`} className="rounded-lg border border-white/10 bg-[#0b0d12] p-4">
            <p className="text-xs font-black text-gray-500">{card.label}</p>
            <p className="mt-2 text-2xl font-black text-white">{card.value}</p>
            <p className="mt-1 text-xs font-semibold text-gray-600">{card.detail}</p>
          </div>
        ))}
      </div>

      <SettlementDetailTable
        settlement={settlement}
        rows={filteredSettlementRows}
        allRows={settlementRows}
        filter={settlementFilter}
        onFilterChange={setSettlementFilter}
        onStatusChange={updateSettlementProcessStatus}
        onReadinessChange={updateSettlementReadiness}
        onBulkStatusChange={bulkUpdateSettlementProcessStatus}
      />
    </div>
  )
}

function SettlementDetailTable({
  settlement,
  rows,
  allRows,
  filter,
  onFilterChange,
  onStatusChange,
  onReadinessChange,
  onBulkStatusChange,
}: {
  settlement: SettlementSummary
  rows: SettlementRowView[]
  allRows: SettlementRowView[]
  filter: SettlementFilter
  onFilterChange: (filter: SettlementFilter) => void
  onStatusChange: (row: SettlementRowView, status: SettlementProcessStatus) => void
  onReadinessChange: (row: SettlementRowView, readiness: SettlementStoreReadiness) => void
  onBulkStatusChange: (rows: SettlementRowView[], status: SettlementProcessStatus) => void
}) {
  const settlementTargetRows = allRows.filter((row) => row.readiness === '정산대상')
  const authPendingRows = allRows.filter((row) => row.readiness === '인증대기')
  const filterOptions: SettlementFilter[] = ['정산대상', '인증대기', '정산완료', '전체']

  return (
    <div className="mt-4 rounded-lg border border-white/10 bg-black p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h4 className="text-lg font-black text-white">정산 상세</h4>
          <p className="mt-1 text-xs font-semibold text-gray-500 keep-all">
            매장별 매출부가세와 VAT 제외 매출을 분리하고, 비용매출·작업비·충당금 반영 후 순수익을 확인합니다.
          </p>
        </div>
        <p className="text-xs font-black text-gray-600">
          순수익 기준: 매장당 충당금 {formatRevenueManwon(settlement.reserveAmountPerStore)}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0b0d12] p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={`settlement-filter-${option}`}
              type="button"
              onClick={() => onFilterChange(option)}
              className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                filter === option
                  ? 'border-white bg-white text-black'
                  : 'border-white/10 bg-black text-gray-400 hover:border-white/30 hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onBulkStatusChange(settlementTargetRows, '정산완료')}
            className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/15"
          >
            정산대상 전체 완료
          </button>
          <button
            type="button"
            onClick={() => onBulkStatusChange(settlementTargetRows, '정산대기')}
            className="rounded-md border border-white/10 bg-black px-3 py-2 text-xs font-black text-gray-300 transition hover:border-white/30 hover:text-white"
          >
            정산대상 대기로
          </button>
          <button
            type="button"
            onClick={() => onBulkStatusChange(authPendingRows, '이번 달 보류')}
            className="rounded-md border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-300/15"
          >
            인증대기 보류
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-[1780px] w-full border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-gray-500">
            <tr>
              <th className="px-4 py-3">매장</th>
              <th className="px-4 py-3">운영상태</th>
              <th className="px-4 py-3">정산상태</th>
              <th className="px-4 py-3">상품구성</th>
              <th className="px-4 py-3 text-right">매출부가세</th>
              <th className="px-4 py-3 text-right">VAT 제외</th>
              <th className="px-4 py-3 text-right">웹사이트/블로그</th>
              <th className="px-4 py-3 text-right">구글애즈</th>
              <th className="px-4 py-3 text-right">프로필관리</th>
              <th className="px-4 py-3 text-right">비용매출</th>
              <th className="px-4 py-3 text-right">작업비</th>
              <th className="px-4 py-3 text-right">충당금</th>
              <th className="px-4 py-3 text-right">순수익</th>
              <th className="px-4 py-3">액션</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const record = row.record

              return (
              <tr key={`settlement-detail-${record.key}`} className="border-t border-white/10">
                <td className="px-4 py-4">
                  <p className="font-black text-white keep-all">{record.storeName}</p>
                  <p className="mt-1 text-xs font-bold text-gray-600">{formatDateShort(parseLocalDate(record.checkDate))}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${settlementReadinessBadge(row.readiness)}`}>
                    {row.readiness}
                  </span>
                  <p className="mt-2 max-w-[150px] text-xs font-semibold leading-5 text-gray-600 keep-all">
                    {row.readiness === '인증대기' ? '인증 완료 후 정산 포함' : '이번 정산 우선 처리'}
                  </p>
                  <button
                    type="button"
                    onClick={() => onReadinessChange(row, row.readiness === '인증대기' ? '정산대상' : '인증대기')}
                    className="mt-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-black text-gray-300 transition hover:border-white/30 hover:text-white"
                  >
                    {row.readiness === '인증대기' ? '정산대상 전환' : '인증대기 전환'}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${settlementProcessBadge(row.processStatus)}`}>
                    {row.processStatus}
                  </span>
                  <p className="mt-2 text-xs font-semibold text-gray-600">
                    {row.updatedAt ? formatDateShort(new Date(row.updatedAt)) : '미처리'}
                  </p>
                </td>
                <td className="max-w-[260px] px-4 py-4">
                  <p className="font-black text-gray-200 keep-all">{record.productGroup}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-gray-500 keep-all">{record.productDetail}</p>
                  {record.productBreakdown.adjustmentAmount < 0 ? (
                    <p className="mt-1 text-xs font-bold text-amber-200">
                      할인/조정 {formatCurrency(record.productBreakdown.adjustmentAmount)}원
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-4 text-right font-semibold text-gray-300">{formatCurrency(record.vatAmount)}원</td>
                <td className="px-4 py-4 text-right font-black text-white">{formatCurrency(record.netSalesAmount)}원</td>
                <td className="px-4 py-4 text-right font-semibold text-gray-300">
                  {formatCurrency(record.productBreakdown.websiteBlogAmount)}원
                </td>
                <td className="px-4 py-4 text-right font-semibold text-gray-300">
                  {formatCurrency(record.productBreakdown.googleAdsAmount)}원
                </td>
                <td className="px-4 py-4 text-right font-black text-blue-100">
                  {formatCurrency(record.productBreakdown.googleProfileAmount)}원
                </td>
                <td className="px-4 py-4 text-right font-semibold text-gray-300">{formatCurrency(record.expenseRevenueAmount)}원</td>
                <td className="px-4 py-4 text-right font-semibold text-gray-300">{formatCurrency(record.workerCostAmount)}원</td>
                <td className="px-4 py-4 text-right font-semibold text-gray-300">{formatCurrency(record.reserveAmount)}원</td>
                <td className="px-4 py-4 text-right font-black text-emerald-100">{formatCurrency(record.profitAmount)}원</td>
                <td className="px-4 py-4">
                  <div className="grid min-w-[170px] grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onStatusChange(row, '정산완료')}
                      className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/15"
                    >
                      완료
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(row, '정산대기')}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-2 text-xs font-black text-gray-300 transition hover:border-white/30 hover:text-white"
                    >
                      대기
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(row, '이번 달 보류')}
                      className="rounded-md border border-amber-300/25 bg-amber-300/10 px-2 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-300/15"
                    >
                      보류
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(row, '정산 제외')}
                      className="rounded-md border border-rose-300/25 bg-rose-300/10 px-2 py-2 text-xs font-black text-rose-100 transition hover:bg-rose-300/15"
                    >
                      제외
                    </button>
                  </div>
                </td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MonthlyRevenueScheduleTable({
  rows,
}: {
  rows: {
    month: number
    monthLabel: string
    amount: number
    stores: { storeName: string; amount: number }[]
  }[]
}) {
  return (
    <div className="border-b border-white/10 p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Monthly Revenue</p>
          <h3 className="mt-2 text-xl font-black text-white">월별 매출 스케줄</h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-500 keep-all">
            2026년 6월을 시작월로 두고, 1개월 계약은 6월에만 반영하며 12개월 계약은 월차별 계약금액으로 나눠 집계합니다.
          </p>
        </div>
        <p className="text-xs font-black text-gray-600">{rows.length}개월 기준</p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[132px_160px_1fr] border-b border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-gray-500">
            <span>정산월</span>
            <span>매출</span>
            <span>포함 매장</span>
          </div>

          {rows.map((row) => (
            <div
              key={`monthly-revenue-${row.month}`}
              className="grid grid-cols-[132px_160px_1fr] items-center border-b border-white/10 px-4 py-3 last:border-b-0"
            >
              <span>
                <span className="block font-black text-white">{row.monthLabel}</span>
                <span className="mt-1 block text-xs font-bold text-gray-600">{row.month}개월차</span>
              </span>
              <span className="font-black text-emerald-100">{formatCurrency(row.amount)}원</span>
              <span className="text-xs font-semibold leading-5 text-gray-500 keep-all">
                {row.stores.map((store) => store.storeName).join(' · ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
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

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatBillingDate(value: string) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(date)
}

function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value)
}

function formatRevenueManwon(value: number) {
  return `${formatCurrency(Math.round(value / 10000))}만원`
}

function buildBillingRecords(_stores: StoreRecord[]) {
  return contractRevenueRecords.flatMap((contract) => {
    const schedule = billingScheduleByStore[contract.storeName] || {
      dueDay: 25,
      firstStatus: '청구예정' as BillingStatus,
      memo: '정산 일정 확인 필요',
    }

    return contract.monthlyAmounts.map((amount, monthIndex) => {
      const billingMonth = contractRevenueMonthDate(contractStartRevenueMonthIndex(contract) + monthIndex)
      const monthLastDate = new Date(billingMonth.getFullYear(), billingMonth.getMonth() + 1, 0).getDate()
      const dueDay = Math.min(schedule.dueDay, monthLastDate)
      const scheduledDate = formatDateKey(new Date(billingMonth.getFullYear(), billingMonth.getMonth(), dueDay))
      const dueDate = monthIndex === 0 && schedule.firstPaidDate ? schedule.firstPaidDate : scheduledDate
      const status: BillingStatus =
        monthIndex === 0 && schedule.firstStatus ? schedule.firstStatus : '청구예정'
      const memo =
        monthIndex === 0
          ? schedule.memo
          : `${contract.storeName} ${monthIndex + 1}개월차 정산 예정`

      return {
        id: `billing-${contract.storeName}-${monthIndex + 1}`,
        storeName: contract.storeName,
        product: contract.productGroup,
        amount,
        dueDate,
        dueDay,
        status,
        owner: '권순현',
        taxInvoice: status === '입금완료' ? '발행완료' : '발행대기',
        memo,
      } satisfies BillingRecord
    })
  })
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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
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

function calendarKey(event: CalendarEvent) {
  return event.calendarId || event.calendarName || event.source || 'local'
}

function googleCalendarDayUrl(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return `https://calendar.google.com/calendar/u/0/r/day/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function googleCalendarUrl(calendarId?: string) {
  return calendarId
    ? `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`
    : 'https://calendar.google.com/calendar/u/0/r'
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
  const [contextMenu, setContextMenu] = useState<CalendarContextMenu | null>(null)
  const [hiddenCalendarKeys, setHiddenCalendarKeys] = useState<Set<string>>(() => new Set())
  const [soloCalendarKey, setSoloCalendarKey] = useState<string | null>(null)

  const mergedEvents = useMemo(() => {
    const eventMap = new Map<string, CalendarEvent>()
    events.forEach((event) => {
      if (!deletedEventIds.has(event.id)) eventMap.set(event.id, event)
    })
    localEvents.forEach((event) => {
      if (!deletedEventIds.has(event.id)) eventMap.set(event.id, event)
    })
    return Array.from(eventMap.values()).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }, [events, localEvents, deletedEventIds])

  const visibleCalendars = useMemo(() => {
    const calendarMap = new Map<string, CalendarEvent>()
    mergedEvents.forEach((calendarEvent) => {
      const key = calendarKey(calendarEvent)
      if (key && !calendarMap.has(key)) calendarMap.set(key, calendarEvent)
    })
    return Array.from(calendarMap.values())
  }, [mergedEvents])

  const allEvents = useMemo(() => {
    return mergedEvents.filter((calendarEvent) => {
      const key = calendarKey(calendarEvent)

      if (soloCalendarKey) return key === soloCalendarKey
      return !hiddenCalendarKeys.has(key)
    })
  }, [hiddenCalendarKeys, mergedEvents, soloCalendarKey])

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

  useEffect(() => {
    if (!contextMenu) return

    const closeMenu = () => setContextMenu(null)
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    window.addEventListener('click', closeMenu)
    window.addEventListener('scroll', closeMenu, true)
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      window.removeEventListener('click', closeMenu)
      window.removeEventListener('scroll', closeMenu, true)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [contextMenu])

  const openContextMenu = (mouseEvent: MouseEvent<HTMLElement>, menu: CalendarContextMenuInput) => {
    mouseEvent.preventDefault()
    mouseEvent.stopPropagation()
    setContextMenu({ ...menu, x: mouseEvent.clientX, y: mouseEvent.clientY } as CalendarContextMenu)
  }

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

  const openCreateModal = (date?: Date, hour = 10, draftPatch: Partial<CalendarEventDraft> = {}) => {
    setSelectedEvent(null)
    setEventDraft({ ...defaultDraft(date || anchorDate, hour), ...draftPatch })
    setActionStatus('')
    setModalMode('create')
  }

  const openCopyModal = (calendarEvent: CalendarEvent) => {
    setSelectedEvent(null)
    setEventDraft({
      ...draftFromEvent(calendarEvent),
      title: `${calendarEvent.title} 복사`,
    })
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

  const deleteCalendarEvent = async (eventToDelete = selectedEvent) => {
    if (!eventToDelete) return
    setSaving(true)
    setActionStatus('')

    try {
      const response = await fetch('/api/erp/google/calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventToDelete.id }),
      })
      const data = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(data.message || '일정을 삭제하지 못했습니다.')
      }

      setDeletedEventIds((current) => {
        const next = new Set(current)
        next.add(eventToDelete.id)
        return next
      })
      setLocalEvents((current) => current.filter((item) => item.id !== eventToDelete.id))
      setActionStatus(data.message || '일정을 삭제했습니다.')

      if (eventToDelete.source === 'google') {
        await onRefresh()
      }

      if (selectedEvent?.id === eventToDelete.id) {
        closeModal()
      }
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
      onContextMenu={(mouseEvent) => openContextMenu(mouseEvent, { kind: 'event', event: calendarEvent })}
      className={`w-full cursor-grab truncate rounded border border-l-4 text-left font-bold text-gray-100 transition hover:brightness-125 active:cursor-grabbing ${draggingEventId === calendarEvent.id ? 'opacity-45' : ''} ${compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-2 text-xs'} ${calendarColor(calendarEvent) ? '' : eventTypeClass(calendarEvent.type)}`}
      style={calendarEventStyle(calendarEvent)}
      title={calendarEvent.title}
    >
      {compact ? calendarEvent.title : `${formatDateTime(calendarEvent.start)} · ${calendarEvent.title}`}
    </button>
  )

  const contextButtonClass =
    'block w-full rounded-md px-3 py-2 text-left text-sm font-black text-gray-200 transition hover:bg-white/10 hover:text-white'
  const dangerContextButtonClass =
    'block w-full rounded-md px-3 py-2 text-left text-sm font-black text-red-100 transition hover:bg-red-400/15'

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
              {visibleCalendars.map((calendarEvent) => {
                const key = calendarKey(calendarEvent)
                const hidden = hiddenCalendarKeys.has(key)
                const solo = soloCalendarKey === key

                return (
                  <button
                    key={key}
                    type="button"
                    onContextMenu={(mouseEvent) => openContextMenu(mouseEvent, { kind: 'calendar', calendar: calendarEvent })}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black transition ${
                      hidden
                        ? 'border-white/10 bg-white/[0.02] text-gray-600'
                        : solo
                          ? 'border-brand-blue/50 bg-brand-blue/15 text-blue-100'
                          : 'border-white/10 bg-white/[0.04] text-gray-200 hover:border-white/25 hover:bg-white/[0.07]'
                    }`}
                    title="우클릭으로 캘린더 보기 옵션 열기"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={calendarDotStyle(calendarEvent)} />
                    {calendarEvent.calendarName || '팀 공유 캘린더'}
                  </button>
                )
              })}
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
                        onContextMenu={(mouseEvent) => {
                          if (cell) openContextMenu(mouseEvent, { kind: 'slot', date: cell })
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
                            onContextMenu={(mouseEvent) => openContextMenu(mouseEvent, { kind: 'slot', date: day, hour })}
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
                        onContextMenu={(mouseEvent) => openContextMenu(mouseEvent, { kind: 'slot', date: anchorDate, hour })}
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

      {contextMenu ? (
        <div
          className="fixed z-[70] w-56 rounded-lg border border-white/10 bg-[#11141b] p-2 shadow-2xl shadow-black/40"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          {contextMenu.kind === 'event' ? (
            <>
              <button
                type="button"
                className={contextButtonClass}
                onClick={() => {
                  openEditModal(contextMenu.event)
                  setContextMenu(null)
                }}
              >
                일정 수정
              </button>
              <button
                type="button"
                className={dangerContextButtonClass}
                onClick={() => {
                  void deleteCalendarEvent(contextMenu.event)
                  setContextMenu(null)
                }}
              >
                일정 삭제
              </button>
              <button
                type="button"
                className={contextButtonClass}
                onClick={() => {
                  window.open(googleCalendarDayUrl(contextMenu.event.start), '_blank', 'noopener,noreferrer')
                  setContextMenu(null)
                }}
              >
                Google Calendar에서 열기
              </button>
              <button
                type="button"
                className={contextButtonClass}
                onClick={() => {
                  openCopyModal(contextMenu.event)
                  setContextMenu(null)
                }}
              >
                일정 복사
              </button>
            </>
          ) : null}

          {contextMenu.kind === 'slot' ? (
            <>
              <button
                type="button"
                className={contextButtonClass}
                onClick={() => {
                  openCreateModal(contextMenu.date, contextMenu.hour)
                  setContextMenu(null)
                }}
              >
                일정 추가
              </button>
              <button
                type="button"
                className={contextButtonClass}
                onClick={() => {
                  openCreateModal(contextMenu.date, contextMenu.hour, { title: '미팅', type: 'meeting' })
                  setContextMenu(null)
                }}
              >
                미팅 일정 추가
              </button>
            </>
          ) : null}

          {contextMenu.kind === 'calendar' ? (
            <>
              <button
                type="button"
                className={contextButtonClass}
                onClick={() => {
                  setSoloCalendarKey(calendarKey(contextMenu.calendar))
                  setHiddenCalendarKeys(new Set())
                  setContextMenu(null)
                }}
              >
                이 캘린더만 보기
              </button>
              <button
                type="button"
                className={contextButtonClass}
                onClick={() => {
                  const key = calendarKey(contextMenu.calendar)
                  setHiddenCalendarKeys((current) => {
                    const next = new Set(current)
                    next.add(key)
                    return next
                  })
                  setSoloCalendarKey((current) => (current === key ? null : current))
                  setContextMenu(null)
                }}
              >
                이 캘린더 숨기기
              </button>
              <button
                type="button"
                className={contextButtonClass}
                onClick={() => {
                  window.open(googleCalendarUrl(contextMenu.calendar.calendarId), '_blank', 'noopener,noreferrer')
                  setContextMenu(null)
                }}
              >
                Google Calendar에서 열기
              </button>
              <button
                type="button"
                className={contextButtonClass}
                onClick={() => {
                  onRefresh()
                  setContextMenu(null)
                }}
              >
                새로고침
              </button>
              {(soloCalendarKey || hiddenCalendarKeys.size > 0) ? (
                <button
                  type="button"
                  className={contextButtonClass}
                  onClick={() => {
                    setSoloCalendarKey(null)
                    setHiddenCalendarKeys(new Set())
                    setContextMenu(null)
                  }}
                >
                  전체 캘린더 보기
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

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
                onClick={() => void deleteCalendarEvent()}
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

const billingStatusOptions: BillingStatus[] = ['청구예정', '청구완료', '입금완료', '연체', '보류']

function billingStatusClass(status: BillingStatus) {
  if (status === '입금완료') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (status === '연체') return 'border-red-400/35 bg-red-400/10 text-red-100'
  if (status === '청구완료') return 'border-brand-blue/35 bg-brand-blue/10 text-blue-100'
  if (status === '보류') return 'border-gray-400/25 bg-gray-400/10 text-gray-200'
  return 'border-amber-300/30 bg-amber-300/10 text-amber-100'
}

function BillingPanel({
  records,
  loading,
  message,
}: {
  records: BillingRecord[]
  loading: boolean
  message: string
}) {
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [statusOverrides, setStatusOverrides] = useState<Record<string, BillingStatus>>({})

  const currentRecords = useMemo(
    () => records.map((record) => ({ ...record, status: statusOverrides[record.id] || record.status })),
    [records, statusOverrides]
  )
  const year = anchorDate.getFullYear()
  const month = anchorDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dateNumber = index - firstDay + 1
    return dateNumber > 0 && dateNumber <= lastDate ? new Date(year, month, dateNumber) : null
  })
  const monthRecords = currentRecords
    .filter((record) => {
      const date = new Date(`${record.dueDate}T00:00:00`)
      return date.getFullYear() === year && date.getMonth() === month
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const completedRecords = monthRecords.filter((record) => record.status === '입금완료')
  const overdueRecords = monthRecords.filter((record) => record.status === '연체')
  const pendingRecords = monthRecords.filter((record) => record.status !== '입금완료')
  const totalPendingAmount = pendingRecords.reduce((sum, record) => sum + record.amount, 0)
  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const updateBillingStatus = (recordId: string, status: BillingStatus) => {
    setStatusOverrides((current) => ({ ...current, [recordId]: status }))
  }

  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-[#0b0d12]">
        <div className="grid gap-5 border-b border-white/10 p-5 md:grid-cols-[1fr_520px] md:p-6">
          <div>
            <p className="text-sm font-bold text-brand-blue">Billing</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">청구관리</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">
              매장별 정산일을 캘린더로 먼저 확인하고, 아래 리스트에서 청구·입금·연체 상태를 처리합니다.
            </p>
            {message ? <p className="mt-2 text-xs font-bold text-gray-500">{message}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-black p-4">
              <p className="text-xs font-bold text-gray-500">이번 달 청구</p>
              <p className="mt-3 text-3xl font-black text-white">{monthRecords.length}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black p-4">
              <p className="text-xs font-bold text-gray-500">입금 완료</p>
              <p className="mt-3 text-3xl font-black text-white">{completedRecords.length}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black p-4">
              <p className="text-xs font-bold text-gray-500">미수/연체</p>
              <p className="mt-3 text-3xl font-black text-white">{overdueRecords.length}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black p-4">
              <p className="text-xs font-bold text-gray-500">미입금액</p>
              <p className="mt-3 text-2xl font-black text-white">{formatCurrency(totalPendingAmount)}</p>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-black p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAnchorDate(new Date(year, month - 1, 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-300 hover:bg-white/5"
                aria-label="이전 달"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="min-w-44 text-center text-lg font-black text-white">{formatCalendarRange('month', anchorDate)}</p>
              <button
                type="button"
                onClick={() => setAnchorDate(new Date(year, month + 1, 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-300 hover:bg-white/5"
                aria-label="다음 달"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-black">
              {billingStatusOptions.map((status) => (
                <span key={status} className={`rounded-full border px-2.5 py-1 ${billingStatusClass(status)}`}>
                  {status}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
            <div className="grid grid-cols-7 border-b border-white/10 text-center text-xs font-black uppercase tracking-[0.12em] text-gray-600">
              {weekDayLabels.map((day) => (
                <div key={day} className="py-3">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((cell, index) => {
                const dateKey = cell ? formatDateKey(cell) : ''
                const dayRecords = cell ? monthRecords.filter((record) => record.dueDate === dateKey) : []

                return (
                  <div
                    key={`billing-${year}-${month}-${index}`}
                    className={`min-h-[138px] border-b border-r border-white/10 p-2.5 ${cell ? 'bg-[#07080b]' : 'bg-white/[0.02]'}`}
                  >
                    {cell ? (
                      <>
                        <p className={`text-xs font-black ${isSameDate(cell, new Date()) ? 'text-brand-blue' : 'text-gray-500'}`}>
                          {cell.getDate()}
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {dayRecords.slice(0, 4).map((record) => (
                            <button
                              key={record.id}
                              type="button"
                              onClick={() => updateBillingStatus(record.id, record.status === '입금완료' ? '청구완료' : '입금완료')}
                              className={`w-full rounded border px-2 py-1.5 text-left text-[11px] font-black transition hover:brightness-125 ${billingStatusClass(record.status)}`}
                              title="클릭하면 입금완료 상태를 토글합니다."
                            >
                              <span className="block truncate">{record.storeName}</span>
                              <span className="mt-0.5 block text-[10px] opacity-80">{formatCurrency(record.amount)}원</span>
                            </button>
                          ))}
                          {dayRecords.length > 4 ? (
                            <p className="text-[11px] font-bold text-gray-500">+{dayRecords.length - 4}건</p>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-sm font-bold text-brand-blue">Settlement List</p>
            <h3 className="mt-2 text-xl font-black text-white">정산 처리 리스트</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500 keep-all">
              캘린더에서 날짜를 보고, 리스트에서 상태와 세금계산서 발행 여부를 확인합니다.
            </p>
          </div>
          {loading ? <p className="text-xs font-bold text-gray-500">불러오는 중</p> : null}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full border-collapse text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-gray-500">
              <tr>
                <th className="px-5 py-4">매장명</th>
                <th className="px-5 py-4">상품</th>
                <th className="px-5 py-4">정산일</th>
                <th className="px-5 py-4">금액</th>
                <th className="px-5 py-4">상태</th>
                <th className="px-5 py-4">세금계산서</th>
                <th className="px-5 py-4">담당</th>
                <th className="px-5 py-4">메모</th>
              </tr>
            </thead>
            <tbody>
              {monthRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center font-bold text-gray-500">
                    이 달에 표시할 정산 일정이 없습니다.
                  </td>
                </tr>
              ) : (
                monthRecords.map((record) => (
                  <tr key={record.id} className="border-t border-white/10">
                    <td className="px-5 py-4">
                      <p className="font-black text-white keep-all">{record.storeName}</p>
                      <p className="mt-1 text-xs font-semibold text-gray-500">매월 {record.dueDay}일 기준</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-300">{record.product}</td>
                    <td className="px-5 py-4 font-black text-white">{formatBillingDate(record.dueDate)}</td>
                    <td className="px-5 py-4 font-black text-white">{formatCurrency(record.amount)}원</td>
                    <td className="px-5 py-4">
                      <select
                        value={record.status}
                        onChange={(event) => updateBillingStatus(record.id, event.target.value as BillingStatus)}
                        className={`h-10 rounded-full border px-3 text-xs font-black outline-none ${billingStatusClass(record.status)}`}
                      >
                        {billingStatusOptions.map((status) => (
                          <option key={status} value={status} className="bg-[#11141b] text-white">
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-300">{record.taxInvoice}</td>
                    <td className="px-5 py-4 font-semibold text-gray-300">{record.owner}</td>
                    <td className="max-w-sm px-5 py-4 font-semibold leading-6 text-gray-500 keep-all">{record.memo}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
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
                        {row.products.website || '계약 제외'}
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

function StoreReportOverviewPanel({
  stores,
  selectedStoreTitle,
  weekDates,
  weekStart,
  onSelectStore,
}: {
  stores: OperationRow[]
  selectedStoreTitle?: string
  weekDates: Date[]
  weekStart: string
  onSelectStore?: (storeTitle: string) => void
}) {
  const [reportsByStore, setReportsByStore] = useState<Record<string, StoreWeeklyReport[]>>({})
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [overviewMessage, setOverviewMessage] = useState('')
  const [quickUpdatingReportKey, setQuickUpdatingReportKey] = useState('')

  const storeRows = stores.map((store) => {
    const reports = reportsForStoreWeek(store, reportsByStore[store.title], weekDates)
    return {
      store,
      reports,
      summary: summarizeReports(reports),
    }
  })
  const allReports = storeRows.flatMap((row) => row.reports)
  const allSummary = summarizeReports(allReports)

  const loadOverviewReports = useCallback(async () => {
    if (!stores.length) {
      setReportsByStore({})
      setOverviewMessage('')
      return
    }

    setOverviewLoading(true)
    try {
      const entries = await Promise.all(
        stores.map(async (store) => {
          const params = new URLSearchParams({
            store: store.title,
            product: 'googleProfile',
            weekStart,
          })
          const response = await fetch(`/api/erp/reports?${params.toString()}`, { cache: 'no-store' })
          const data = (await response.json()) as WeeklyReportApiResponse
          return [store.title, data.reports || []] as const
        })
      )
      setReportsByStore(Object.fromEntries(entries))
      setOverviewMessage('매장별 이번 주 보고 현황을 불러왔습니다.')
    } catch {
      setReportsByStore({})
      setOverviewMessage('보고 DB를 불러오지 못해 기본 보고표로 표시 중입니다.')
    } finally {
      setOverviewLoading(false)
    }
  }, [stores, weekStart])

  useEffect(() => {
    loadOverviewReports()
  }, [loadOverviewReports])

  const completeOverviewReport = async (
    store: OperationRow,
    report: StoreWeeklyReport,
    reportIndex: number,
    sourceReports: StoreWeeklyReport[]
  ) => {
    const doneStatus: StoreWeeklyReportStatus = '보고완료'
    const reportDate = report.date || toISODate(weekDates[report.dayOffset] || weekDates[reportIndex] || weekDates[0])
    const quickKey = `${store.title}-${reportDate}`
    const reportMemo = report.memo || ''

    setQuickUpdatingReportKey(quickKey)
    setReportsByStore((current) => {
      const source = current[store.title]?.length
        ? reportsForStoreWeek(store, current[store.title], weekDates)
        : sourceReports
      const nextReports = source.map((item, index) => {
        const itemDate = item.date || toISODate(weekDates[item.dayOffset] || weekDates[index] || weekDates[0])

        return itemDate === reportDate
          ? {
              ...item,
              date: itemDate,
              status: doneStatus,
              memo: reportMemo,
              reporter: item.reporter || '블링크애드',
              completedAt: item.completedAt || new Date().toISOString(),
            }
          : {
              ...item,
              date: itemDate,
            }
      })

      return {
        ...current,
        [store.title]: nextReports,
      }
    })

    try {
      const response = await fetch('/api/erp/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store: store.title,
          product: 'googleProfile',
          date: reportDate,
          weekStart,
          title: report.title,
          memo: reportMemo,
          status: doneStatus,
        }),
      })
      const data = (await response.json()) as WeeklyReportApiResponse
      if (data.reports?.length) {
        setReportsByStore((current) => ({
          ...current,
          [store.title]: data.reports,
        }))
      }
      setOverviewMessage(data.message || `${store.title} ${reportDate} 보고를 완료 처리했습니다.`)
    } catch {
      setOverviewMessage(`${store.title} ${reportDate} 보고완료 처리 중 오류가 발생했습니다.`)
    } finally {
      setQuickUpdatingReportKey('')
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Store Report Board</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">
            전체 매장 보고 현황
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-400 keep-all">
            매장운영관리에 등록된 전체 매장의 월-금 보고 상태를 구글프로필 기준으로 먼저 확인합니다.
            아래 매장 리스트를 누르면 해당 매장의 상세 보고 화면으로 이동합니다.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[430px]">
          <div className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-xs font-black text-gray-500">총 매장</p>
            <p className="mt-2 text-2xl font-black text-white">{stores.length}개</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-xs font-black text-gray-500">이번 주 완료</p>
            <p className="mt-2 text-2xl font-black text-emerald-100">
              {allSummary.done}/{allSummary.total}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-xs font-black text-gray-500">대기/작성</p>
            <p className="mt-2 text-2xl font-black text-amber-100">
              {allSummary.pending + allSummary.inProgress}건
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-black">
        <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-blue">Store List</p>
            <h3 className="mt-2 text-lg font-black text-white">매장별 월-금 보고 체크</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-gray-500">
              {overviewLoading ? '보고 현황 동기화 중입니다.' : overviewMessage}
            </p>
            <button
              type="button"
              onClick={loadOverviewReports}
              disabled={overviewLoading}
              className="h-9 rounded-md border border-white/10 px-3 text-xs font-black text-gray-300 transition hover:border-brand-blue/40 hover:bg-brand-blue/10 hover:text-white disabled:cursor-not-allowed disabled:text-gray-600"
            >
              {overviewLoading ? '확인 중' : '새로고침'}
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {storeRows.map(({ store, reports, summary }) => {
            const selected = store.title === selectedStoreTitle

            return (
              <article
                key={store.title}
                onClick={() => onSelectStore?.(store.title)}
                onKeyDown={(event) => {
                  if ((event.target as HTMLElement).closest('button')) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelectStore?.(store.title)
                  }
                }}
                role="button"
                tabIndex={0}
                className={`grid w-full cursor-pointer gap-4 px-4 py-4 text-left outline-none transition lg:grid-cols-[minmax(180px,0.8fr)_minmax(360px,1.4fr)_120px_150px] ${
                  selected ? 'bg-brand-blue/10' : 'hover:bg-white/[0.04]'
                }`}
              >
                <div className="min-w-0">
                  <h4 className="font-black text-white keep-all">{store.title}</h4>
                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-gray-500 keep-all">
                    {store.meta}
                  </p>
                  {store.googleMapUrl ? (
                    <a
                      href={store.googleMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs font-black text-gray-300 transition hover:border-brand-blue/50 hover:bg-brand-blue/10 hover:text-white"
                    >
                      지도
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {reports.map((report, index) => {
                    const reportDate = report.date || toISODate(weekDates[report.dayOffset] || weekDates[index] || weekDates[0])
                    const quickKey = `${store.title}-${reportDate}`
                    const quickUpdating = quickUpdatingReportKey === quickKey
                    const reportDone = report.status === '보고완료'

                    return (
                      <div
                        key={`${store.title}-${reportDate}`}
                        className={`min-h-[116px] rounded-md border px-2.5 py-2 ${weeklyReportClass(report.status)}`}
                      >
                        <p className="text-[11px] font-black text-gray-500">{formatWeekday(weekDates[index])}</p>
                        <p className="mt-2 text-xs font-black text-white">{reportStatusShort(report.status)}</p>
                        <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-gray-500">{report.title}</p>
                        <button
                          type="button"
                          disabled={quickUpdating || reportDone}
                          onClick={(event) => {
                            event.stopPropagation()
                            completeOverviewReport(store, report, index, reports)
                          }}
                          className={`mt-2 h-7 w-full rounded-md border px-2 text-[11px] font-black transition ${
                            reportDone
                              ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                              : 'border-white/15 bg-black/30 text-gray-200 hover:border-brand-blue/50 hover:bg-brand-blue/15 hover:text-white'
                          } disabled:cursor-not-allowed disabled:opacity-80`}
                        >
                          {quickUpdating ? '처리중' : reportDone ? '완료됨' : '완료'}
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div>
                  <p className="text-[11px] font-black text-gray-600">완료율</p>
                  <p className="mt-2 text-lg font-black text-white">
                    {summary.total ? Math.round((summary.done / summary.total) * 100) : 0}%
                  </p>
                  <p className="mt-1 text-xs font-bold text-gray-500">
                    완료 {summary.done} · 대기 {summary.pending}
                  </p>
                </div>

                <div className="lg:text-right">
                  <p className="text-[11px] font-black text-gray-600">다음 액션</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-gray-300 keep-all">
                    {store.products?.nextAction || store.due}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
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
  const [activeProduct, setActiveProduct] = useState<StoreProductKey>(() => readQueryProduct())
  const selectedStore = selectedStoreTitle ? view.rows.find((row) => row.title === selectedStoreTitle) : undefined
  const workspaces = selectedStore?.productWorkspaces || []
  const activeWorkspace = workspaces.find((workspace) => workspace.key === activeProduct) || workspaces[0]
  const [weeklyReportDates, setWeeklyReportDates] = useState(() => getCurrentWeekDates())
  const [websiteBlogCycleIndex, setWebsiteBlogCycleIndex] = useState(0)
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
  const websiteBlogContractStart = useMemo(
    () => websiteBlogContractStartForStore(selectedStore?.title),
    [selectedStore?.title]
  )
  const websiteBlogCycle = useMemo(
    () => websiteBlogCycleRange(websiteBlogContractStart, websiteBlogCycleIndex),
    [websiteBlogContractStart, websiteBlogCycleIndex]
  )
  const websiteBlogDefaultReports = useMemo(
    () => (activeWorkspace?.key === 'websiteBlog' ? websiteBlogReportsForCycle(websiteBlogCycle) : []),
    [activeWorkspace?.key, websiteBlogCycle]
  )
  const workspaceDefaultReports = activeWorkspace?.weeklyReports?.length
    ? activeWorkspace.weeklyReports
    : websiteBlogDefaultReports
  const displayWeeklyReports = weeklyReports.length ? weeklyReports : workspaceDefaultReports
  const isWebsiteBlogWorkspace = activeWorkspace?.key === 'websiteBlog'
  const historyWeekGroups = useMemo(() => groupReportHistoryByWeek(reportHistory), [reportHistory])
  const selectedHistoryWeek =
    historyWeekGroups.find((group) => group.key === selectedHistoryWeekKey) || historyWeekGroups[0]
  const weeklyReportItems = useMemo(
    () =>
      displayWeeklyReports.map((report) => {
        const date = report.date
          ? parseLocalDate(report.date)
          : isWebsiteBlogWorkspace
            ? websiteBlogDefaultReports[report.dayOffset]?.date
              ? parseLocalDate(websiteBlogDefaultReports[report.dayOffset].date || '')
              : weeklyReportDates[0]
            : weeklyReportDates[report.dayOffset] || weeklyReportDates[0]
        const dateKey = report.date || toISODate(date)

        return {
          report,
          date,
          dateKey,
          draftMemo: reportDrafts[dateKey] ?? report.memo ?? '',
        }
      }),
    [displayWeeklyReports, isWebsiteBlogWorkspace, reportDrafts, websiteBlogDefaultReports, weeklyReportDates]
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
  const showProcessRoadmap = activeWorkspace?.key === 'googleProfile'
  const showWeeklyReportPanel = activeWorkspace?.key === 'googleProfile'
  const showReportHistoryPanel = activeWorkspace?.key !== 'googleAds'

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
    if (activeWorkspace?.key !== 'websiteBlog') return

    setWebsiteBlogCycleIndex(websiteBlogCurrentCycleIndex(websiteBlogContractStart, getKstCalendarDate()))
  }, [activeWorkspace?.key, selectedStore?.title, websiteBlogContractStart])

  useEffect(() => {
    if (activeWorkspace?.key !== 'websiteBlog') return

    setWeeklyReports(websiteBlogDefaultReports)
    setReportDrafts(Object.fromEntries(websiteBlogDefaultReports.map((report) => [report.date, report.memo || ''])))
    setSelectedWeeklyReportDate(websiteBlogDefaultReports[0]?.date || '')
  }, [activeWorkspace?.key, selectedStore?.title, websiteBlogCycleIndex, websiteBlogDefaultReports])

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
    const supportsReportRecords =
      activeWorkspace?.key === 'websiteBlog' || Boolean(activeWorkspace?.weeklyReports?.length)

    if (!selectedStore || !activeWorkspace || !supportsReportRecords) {
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
      const nextReports = activeWorkspace.key === 'websiteBlog'
        ? mergeWebsiteBlogMonthReports(websiteBlogDefaultReports, [...(historyData.reports || []), ...(data.reports || [])])
        : data.reports || []
      setWeeklyReports(nextReports)
      setReportHistory(historyData.reports || [])
      const nextReportDrafts = Object.fromEntries(nextReports.map((report) => [report.date, report.memo || '']))
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
      const fallbackReports = activeWorkspace.key === 'websiteBlog'
        ? websiteBlogDefaultReports
        : activeWorkspace.weeklyReports || []
      setWeeklyReports(fallbackReports)
      const nextReportDrafts = Object.fromEntries(
        fallbackReports.map((report) => {
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
  }, [activeWorkspace?.key, activeWorkspace?.weeklyReports, selectedStore, weekStart, websiteBlogDefaultReports, weeklyReportDates])

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
      const reportWeekStart =
        activeWorkspace.key === 'websiteBlog' ? toISODate(getMondayStart(parseLocalDate(reportDateKey))) : weekStart
      const response = await fetch('/api/erp/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store: selectedStore.title,
          product: activeWorkspace.key,
          date: reportDateKey,
          weekStart: reportWeekStart,
          title: report.title,
          memo: reportMemo,
          status,
        }),
      })
      const data = (await response.json()) as WeeklyReportApiResponse
      if (data.connected) {
        const savedReport = {
          ...report,
          date: reportDateKey,
          memo: reportMemo,
          status,
          reporter: status === '보고완료' ? report.reporter || '블링크애드' : report.reporter,
          completedAt: status === '보고완료' ? report.completedAt || new Date().toISOString() : report.completedAt,
        }
        const nextReports =
          activeWorkspace.key === 'websiteBlog'
            ? mergeWebsiteBlogMonthReports(websiteBlogDefaultReports, [
                ...reportHistory,
                ...(data.reports || []),
                savedReport,
              ])
            : data.reports || []
        setWeeklyReports(nextReports)
        if (activeWorkspace.key === 'websiteBlog') {
          setReportHistory((current) => upsertReportHistory(current, savedReport))
        }
        const nextReportDrafts = Object.fromEntries(nextReports.map((item) => [item.date, item.memo || '']))
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
  }, [activeWorkspace, displayWeeklyReports, reportHistory, selectedStore, websiteBlogDefaultReports, weekStart, weeklyReportDates])

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
      {!selectedStore && view.rows.length ? (
        <StoreReportOverviewPanel
          stores={view.rows}
          selectedStoreTitle={selectedStoreTitle}
          weekDates={weeklyReportDates}
          weekStart={weekStart}
          onSelectStore={(storeTitle) => {
            onSelectStore?.(storeTitle)
            setActiveProduct('googleProfile')
          }}
        />
      ) : null}
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

          {showProcessRoadmap && selectedStore.processSteps?.length ? (
            <StoreProcessRoadmap store={selectedStore} />
          ) : null}

          {activeWorkspace ? (
            <div className="rounded-lg border border-white/10 bg-black">
              {showWeeklyReportPanel && weeklyReportItems.length && selectedWeeklyReport ? (
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
                      const reportUpdating = updatingReportDate === item.dateKey
                      const reportDone = item.report.status === '보고완료'

                      return (
                        <article
                          key={`${activeWorkspace.key}-report-tab-${item.dateKey}`}
                          onClick={() => setSelectedWeeklyReportDate(item.dateKey)}
                          onKeyDown={(event) => {
                            if ((event.target as HTMLElement).closest('button')) return
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setSelectedWeeklyReportDate(item.dateKey)
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          className={`min-h-[188px] cursor-pointer rounded-lg border p-4 text-left outline-none transition ${
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
                          <button
                            type="button"
                            disabled={reportUpdating || reportDone}
                            onClick={(event) => {
                              event.stopPropagation()
                              updateWeeklyReportStatus(item.report, item.dateKey, '보고완료', item.draftMemo)
                            }}
                            className={`mt-3 h-9 w-full rounded-md border px-3 text-xs font-black transition ${
                              reportDone
                                ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
                                : 'border-white/15 bg-black/30 text-gray-200 hover:border-brand-blue/50 hover:bg-brand-blue/15 hover:text-white'
                            } disabled:cursor-not-allowed disabled:opacity-80`}
                          >
                            {reportUpdating ? '처리 중' : reportDone ? '완료됨' : '완료처리'}
                          </button>
                        </article>
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
                        disabled={selectedWeeklyReportUpdating || selectedWeeklyReportGenerating || selectedWeeklyReport.report.status === '보고완료'}
                        onClick={() =>
                          updateWeeklyReportStatus(
                            selectedWeeklyReport.report,
                            selectedWeeklyReport.dateKey,
                            '보고완료',
                            selectedWeeklyReport.draftMemo
                          )
                        }
                        className="mt-3 h-10 w-full rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 text-sm font-black text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-500"
                      >
                        {selectedWeeklyReportUpdating
                          ? '처리 중'
                          : selectedWeeklyReport.report.status === '보고완료'
                            ? '보고완료됨'
                            : '보고완료 처리'}
                      </button>
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
                <GoogleAdsPerformancePanel storeTitle={selectedStore.title} />
              ) : null}
              {activeWorkspace.key === 'websiteBlog' ? (
                <WebsiteBlogContentQueuePanel
                  storeTitle={selectedStore.title}
                  workspace={activeWorkspace}
                  cycle={websiteBlogCycle}
                  items={weeklyReportItems}
                />
              ) : null}
              {activeWorkspace.key === 'websiteBlog' && weeklyReportItems.length && selectedWeeklyReport ? (
                <WebsiteBlogWorkLogPanel
                  items={weeklyReportItems}
                  selectedItem={selectedWeeklyReport}
                  summary={weeklyReportSummary}
                  loading={weeklyReportLoading}
                  message={weeklyReportMessage}
                  updatingDate={updatingReportDate}
                  selectedUpdating={selectedWeeklyReportUpdating}
                  autoSaveStatus={selectedWeeklyReportAutoSaveStatus}
                  cycle={websiteBlogCycle}
                  onRefresh={() => loadWeeklyReports()}
                  onPreviousCycle={() => setWebsiteBlogCycleIndex((current) => Math.max(0, current - 1))}
                  onNextCycle={() => setWebsiteBlogCycleIndex((current) => current + 1)}
                  onSelectDate={setSelectedWeeklyReportDate}
                  onChangeMemo={(dateKey, value) =>
                    setReportDrafts((current) => ({
                      ...current,
                      [dateKey]: value,
                    }))
                  }
                  onSave={(item, status, memo) =>
                    updateWeeklyReportStatus(item.report, item.dateKey, status, memo)
                  }
                />
              ) : null}
              {showReportHistoryPanel ? (
              <div className="border-b border-white/10 p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand-blue">Report History</p>
                    <h4 className="mt-2 text-xl font-black text-white">
                      {isWebsiteBlogWorkspace ? '날짜별 작업내역 보관' : '기존 보고 현황'}
                    </h4>
                    <p className="mt-2 text-sm font-semibold leading-6 text-gray-500 keep-all">
                      {isWebsiteBlogWorkspace
                        ? '웹사이트·블로그 실제 작업 기록을 날짜별로 모아 확인합니다.'
                        : '완료된 보고와 이전 보고 내용을 주차별로 모아 확인합니다.'}
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
              ) : null}
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
        !view.rows.length ? (
          <p className="rounded-lg border border-white/10 bg-black p-5 text-sm font-bold text-gray-500">
            등록된 운영 매장이 없습니다.
          </p>
        ) : null
      )}
    </section>
  )
}

function StoreProcessRoadmap({ store }: { store: OperationRow }) {
  const steps = store.processSteps || []
  const doneCount = steps.filter((step) => step.status === '완료').length
  const inProgressCount = steps.filter((step) => step.status === '진행중').length
  const packageLabel = store.meta.replace('계약상품 · ', '')

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Process Roadmap</p>
          <h3 className="mt-2 text-xl font-black text-white">작업 진행 프로세스</h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-500 keep-all">
            계약 상품 구성에 맞춰 온보딩부터 유지/관리 단계까지 현재 위치를 표시합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-black">
          <span className="rounded-full border border-white/10 bg-black px-3 py-1.5 text-gray-300">{packageLabel}</span>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-emerald-100">
            완료 {doneCount}
          </span>
          <span className="rounded-full border border-brand-blue/25 bg-brand-blue/10 px-3 py-1.5 text-blue-100">
            진행 {inProgressCount}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-6">
        {steps.map((step, index) => {
          const last = index === steps.length - 1

          return (
            <article
              key={`${store.title}-process-${step.title}`}
              className="rounded-lg border border-white/10 bg-black p-4"
            >
              <div className="flex items-center gap-2">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${processNodeClass(step.status)}`}>
                  {step.status === '완료' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : step.status === '진행중' ? (
                    <RefreshCw className="h-4 w-4" />
                  ) : (
                    <CircleDot className="h-4 w-4" />
                  )}
                </span>
                {!last ? <span className="hidden h-px min-w-8 flex-1 bg-white/10 xl:block" /> : null}
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <p className="text-[11px] font-black text-gray-600">STEP {index + 1}</p>
                <span className={`rounded-full border px-2 py-1 text-[11px] font-black ${processStatusBadge(step.status)}`}>
                  {step.status}
                </span>
              </div>
              <p className="mt-3 min-h-10 text-sm font-black leading-5 text-white keep-all">{step.title}</p>
              <p className="mt-2 text-[11px] font-black text-brand-blue">{step.product}</p>
              <p className="mt-2 line-clamp-3 text-xs font-semibold leading-5 text-gray-500 keep-all">{step.memo}</p>
            </article>
          )
        })}
      </div>
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
  const gridClass = workspaces.length >= 3 ? 'grid-cols-3' : workspaces.length === 2 ? 'grid-cols-2' : 'grid-cols-1'

  return (
    <div className={`mt-4 grid w-full max-w-xl ${gridClass} gap-1 rounded-lg border border-white/10 bg-black p-1`}>
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

function BlinkAdMarketingPanel() {
  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-5 md:p-6">
        <p className="text-sm font-bold text-brand-blue">Owned Marketing</p>
        <h2 className="mt-2 text-2xl font-black text-white">블링크애드 마케팅</h2>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-gray-500 keep-all">
          고객 매장 보고 화면이 아니라, 블링크애드 자체 문의 유입을 만드는 광고 채널만 확인합니다.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0b0d12]">
        <GoogleAdsPerformancePanel
          storeTitle="블링크애드"
          heading="블링크애드 Google Ads 성과"
          description="Google Ads API에서 블링크애드 클라이언트유치 캠페인의 노출, 클릭, 광고비를 직접 불러옵니다."
        />
      </div>
    </section>
  )
}

function GoogleAdsPerformancePanel({
  storeTitle,
  heading,
  description,
}: {
  storeTitle: string
  heading?: string
  description?: string
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
  const campaignSummaries = adsData?.campaignSummaries || []
  const searchTerms = adsData?.searchTerms || []
  const monthlyReportPreview = adsData
    ? buildAdsMonthlyReportPreview(storeTitle, adsData, campaignSummaries)
    : null

  return (
    <div className="border-b border-white/10 p-5 md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Google Ads</p>
          <h4 className="mt-2 text-xl font-black text-white">{heading || `${storeTitle} 광고 성과`}</h4>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-500 keep-all">
            {description || 'BigQuery의 Google Ads 로컬 액션 테이블에서 매장별 노출, 클릭, 광고비, 길찾기·전화·웹사이트 행동을 불러옵니다.'}
          </p>
          <p className="mt-2 text-xs font-bold text-gray-500 keep-all">
            {adsLoading ? 'Google Ads 데이터를 확인 중입니다.' : adsMessage}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[430px]">
          <div className="rounded-lg border border-white/10 bg-[#0b0d12] p-4">
            <p className="text-xs font-black text-gray-500">연결 상태</p>
            <p className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${adsConnectionBadge(adsData, adsLoading)}`}>
              {adsLoading ? '확인중' : adsSourceLabel(adsData)}
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
            <p className="text-xs font-black text-gray-500">{adsData?.source === 'google_ads_api' ? '조회 캠페인' : '데이터 행'}</p>
            <p className="mt-2 text-sm font-black text-white">
              {adsData?.source === 'google_ads_api'
                ? `${adsData.campaigns?.length || 0}개`
                : summary
                  ? `${summary.rowCount}행`
                  : '-'}
            </p>
            <p className="mt-1 text-[11px] font-bold text-gray-600">
              {adsData?.source === 'google_ads_api'
                ? adsData.campaigns?.[0]?.name || '캠페인 없음'
                : adsData?.sourceSyncedAt
                  ? formatDateTime(adsData.sourceSyncedAt)
                  : '동기화 기록 없음'}
            </p>
          </div>
        </div>
      </div>

      {adsData && adsData.status !== 'connected' ? (
        <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-bold leading-6 text-amber-100 keep-all">
          {adsData.message}
        </div>
      ) : null}

      {campaignSummaries.length ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-white/[0.025]">
          <div className="flex flex-col gap-1 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-sm font-black text-white">캠페인별 광고 성과</p>
            <p className="text-xs font-bold text-gray-500">
              {adsData?.period.days ? `최근 ${adsData.period.days}일 기준` : '최근 기간 기준'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[minmax(280px,1.7fr)_88px_repeat(6,minmax(96px,0.8fr))] gap-3 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-gray-500">
                <span>캠페인명</span>
                <span>상태</span>
                <span className="text-right">노출</span>
                <span className="text-right">클릭</span>
                <span className="text-right">CTR</span>
                <span className="text-right">광고비</span>
                <span className="text-right">CPC</span>
                <span className="text-right">액션</span>
              </div>
              {campaignSummaries.map((campaign) => {
                const campaignCtr = percent(campaign.clicks, campaign.impressions) || '-'
                const campaignCpc =
                  campaign.clicks > 0
                    ? `${Math.round(campaign.costMicros / 1000000 / campaign.clicks).toLocaleString('ko-KR')}원`
                    : '-'

                return (
                  <div
                    key={campaign.id || campaign.name}
                    className="grid grid-cols-[minmax(280px,1.7fr)_88px_repeat(6,minmax(96px,0.8fr))] gap-3 border-t border-white/10 px-4 py-4 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="break-all font-black text-white">{campaign.name || '-'}</p>
                      <p className="mt-1 text-[11px] font-bold text-gray-600">
                        {campaign.channel || '-'} · {campaign.startDate || '시작일 없음'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex h-fit w-fit rounded-full border px-2 py-1 text-[11px] font-black ${adsCampaignStatusBadge(campaign.status)}`}
                    >
                      {campaign.status || '-'}
                    </span>
                    <span className="text-right font-black text-blue-100">{formatCount(campaign.impressions)}</span>
                    <span className="text-right font-black text-blue-100">{formatCount(campaign.clicks)}</span>
                    <span className="text-right font-bold text-gray-300">{campaignCtr}</span>
                    <span className="text-right font-bold text-gray-300">{formatCostMicros(campaign.costMicros)}</span>
                    <span className="text-right font-bold text-gray-300">{campaignCpc}</span>
                    <span className="text-right font-bold text-gray-300">{formatCount(campaign.localActions)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      {adsData?.source === 'google_ads_api' ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-white/[0.025]">
          <div className="flex flex-col gap-1 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-white">클릭 발생 검색어</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-gray-500 keep-all">
                실제 사용자가 검색한 검색어 기준입니다. Google Ads 정책상 낮은 볼륨 검색어는 일부 표시되지 않을 수 있습니다.
              </p>
            </div>
            <p className="text-xs font-bold text-gray-500">
              {searchTerms.length ? `상위 ${searchTerms.length}개` : '검색어 없음'}
            </p>
          </div>
          {searchTerms.length ? (
            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[minmax(240px,1.4fr)_minmax(240px,1.2fr)_minmax(160px,0.8fr)_repeat(4,minmax(92px,0.55fr))] gap-3 bg-white/[0.04] px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-gray-500">
                  <span>검색어</span>
                  <span>캠페인</span>
                  <span>광고그룹</span>
                  <span className="text-right">노출</span>
                  <span className="text-right">클릭</span>
                  <span className="text-right">CTR</span>
                  <span className="text-right">광고비</span>
                </div>
                {searchTerms.map((term) => (
                  <div
                    key={`${term.searchTerm}-${term.campaignName}-${term.adGroupName}`}
                    className="grid grid-cols-[minmax(240px,1.4fr)_minmax(240px,1.2fr)_minmax(160px,0.8fr)_repeat(4,minmax(92px,0.55fr))] gap-3 border-t border-white/10 px-4 py-4 text-sm"
                  >
                    <span className="break-all font-black text-white">{term.searchTerm}</span>
                    <span className="break-all font-bold text-gray-300">{term.campaignName || '-'}</span>
                    <span className="break-all font-bold text-gray-500">{term.adGroupName || '-'}</span>
                    <span className="text-right font-black text-blue-100">{formatCount(term.impressions)}</span>
                    <span className="text-right font-black text-blue-100">{formatCount(term.clicks)}</span>
                    <span className="text-right font-bold text-gray-300">{percent(term.clicks, term.impressions) || '-'}</span>
                    <span className="text-right font-bold text-gray-300">{formatCostMicros(term.costMicros)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-5 text-sm font-semibold leading-6 text-gray-500 keep-all">
              {adsData.searchTermMessage ||
                (summary?.clicks
                  ? '클릭은 발생했지만 Google Ads에서 공개 가능한 검색어가 아직 내려오지 않았습니다.'
                  : '클릭이 발생한 검색어가 아직 없습니다.')}
            </div>
          )}
          {adsData.searchTermMessage && searchTerms.length ? (
            <div className="border-t border-white/10 px-4 py-3 text-xs font-semibold leading-5 text-amber-100 keep-all">
              {adsData.searchTermMessage}
            </div>
          ) : null}
        </div>
      ) : null}

      {monthlyReportPreview ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-[#0b0d12]">
          <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-blue">Monthly Report</p>
              <h5 className="mt-2 text-lg font-black text-white">월간 광고 성과 보고서 미리보기</h5>
            </div>
            <p className="text-xs font-black text-gray-600">{monthlyReportPreview.periodLabel} · 월 1회 보고</p>
          </div>
          <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-black text-gray-500">보고 요약</p>
              <div className="mt-3 space-y-3">
                {monthlyReportPreview.summaryLines.map((line) => (
                  <p key={line} className="text-sm font-semibold leading-6 text-gray-300 keep-all">
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-black text-gray-500">다음 운영 액션</p>
              <div className="mt-3 space-y-2">
                {monthlyReportPreview.actionItems.map((item, index) => (
                  <div key={item} className="flex gap-3 rounded-md bg-white/[0.03] px-3 py-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white text-[11px] font-black text-black">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold leading-6 text-gray-300 keep-all">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4 lg:col-span-2">
              <p className="text-xs font-black text-gray-500">캠페인별 보고 문구</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {monthlyReportPreview.campaignLines.map((line) => (
                  <p key={line} className="rounded-md bg-white/[0.03] px-3 py-2 text-sm font-semibold leading-6 text-gray-400 keep-all">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
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
                <article key={`${row.date}-${row.adsCustomerId || row.storeName}-${row.campaignName || ''}`} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[110px_repeat(5,minmax(0,1fr))]">
                  <p className="font-black text-white">{formatMonthDay(parseLocalDate(row.date))}</p>
                  <p className="font-semibold text-gray-400">노출 {formatCount(row.impressions)}</p>
                  <p className="font-semibold text-gray-400">클릭 {formatCount(row.clicks)}</p>
                  <p className="font-semibold text-gray-400">비용 {formatCostMicros(row.costMicros)}</p>
                  <p className="font-semibold text-gray-400">액션 {formatCount(actions)}</p>
                  <p className="font-semibold text-gray-500">{row.campaignName || row.adsCustomerId || '-'}</p>
                </article>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function WebsiteBlogContentQueuePanel({
  storeTitle,
  workspace,
  cycle,
  items,
}: {
  storeTitle: string
  workspace: StoreProductWorkspace
  cycle: WebsiteBlogCycle
  items: WeeklyReportItem[]
}) {
  const posts = workspace.blogPosts || []
  const contentDb = workspace.contentDb

  if (!posts.length && !contentDb) return null

  const reviewCount = posts.filter((post) => (post.notionStatus || post.status) === 'Review').length
  const publishedCount = posts.filter((post) => (post.notionStatus || post.status) === 'Published').length
  const doneSlotCount = items.filter((item) => item.report.status === '보고완료').length

  return (
    <div className="border-b border-white/10 p-5 md:p-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Content Publishing Queue</p>
          <h4 className="mt-2 text-xl font-black text-white">Notion Posts DB 발행 큐</h4>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-500 keep-all">
            {contentDb?.workflow ||
              `${storeTitle} 웹사이트·블로그 글을 검수 상태와 발행일 기준으로 관리합니다.`}
          </p>
        </div>
        {contentDb?.url ? (
          <a
            href={contentDb.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/15 px-4 text-sm font-black text-gray-200 transition hover:border-brand-blue/50 hover:bg-brand-blue/10 hover:text-white"
          >
            Posts DB 열기
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs font-black text-gray-500">연결 DB</p>
          <p className="mt-2 text-lg font-black text-white keep-all">{contentDb?.name || 'Posts DB 미지정'}</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-gray-500 keep-all">
            {contentDb?.publishRule || 'Notion DB 연결 후 자동 발행 규칙을 표시합니다.'}
          </p>
        </div>
        <div className="rounded-lg border border-brand-blue/20 bg-brand-blue/10 p-4">
          <p className="text-xs font-black text-blue-100/70">Review</p>
          <p className="mt-2 text-3xl font-black text-blue-50">{reviewCount}</p>
          <p className="mt-2 text-xs font-semibold text-blue-100/70">검수 대기 글</p>
        </div>
        <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
          <p className="text-xs font-black text-emerald-100/70">Published</p>
          <p className="mt-2 text-3xl font-black text-emerald-50">{publishedCount}</p>
          <p className="mt-2 text-xs font-semibold text-emerald-100/70">발행 예약/완료 글</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs font-black text-gray-500">ERP 작업 슬롯</p>
          <p className="mt-2 text-3xl font-black text-white">{doneSlotCount}/{items.length || posts.length}</p>
          <p className="mt-2 text-xs font-semibold text-gray-500">
            {cycle.index + 1}개월차 · {formatDateShort(cycle.start)}~{formatDateShort(cycle.end)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {[
          {
            label: '1. 글 작성/검수',
            value: 'Review',
            memo: '작성된 글은 먼저 Review 상태로 두고 제목, 본문, 사진, 내부 링크를 확인합니다.',
          },
          {
            label: '2. 발행 예약',
            value: 'Published + 날짜',
            memo: '검수 후 발행일을 넣고 Published로 바꾸면 해당 날짜 자동 발행 대상으로 봅니다.',
          },
          {
            label: '3. ERP 기록',
            value: '작업현황 저장',
            memo: '발행 또는 수정한 내용은 아래 8회 작업현황과 날짜별 작업내역 보관에 남깁니다.',
          },
        ].map((step) => (
          <article key={step.label} className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-xs font-black text-brand-blue">{step.label}</p>
            <p className="mt-2 text-lg font-black text-white">{step.value}</p>
            <p className="mt-2 text-xs font-semibold leading-5 text-gray-500 keep-all">{step.memo}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="grid gap-3 border-b border-white/10 px-4 py-3 text-xs font-black text-gray-600 lg:grid-cols-[76px_minmax(220px,1.3fr)_120px_128px_minmax(180px,0.9fr)_128px]">
          <p>회차</p>
          <p>콘텐츠</p>
          <p>DB 상태</p>
          <p>발행일</p>
          <p>다음 액션</p>
          <p className="lg:text-right">ERP 상태</p>
        </div>
        {posts.map((post, index) => {
          const slot = post.cycleSlot || index + 1
          const slotItem = items.find((item) => item.report.dayOffset + 1 === slot)
          const erpStatus = slotItem?.report.status || '보고대기'

          return (
            <article
              key={`${storeTitle}-content-queue-${post.title}`}
              className="grid gap-3 border-b border-white/10 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[76px_minmax(220px,1.3fr)_120px_128px_minmax(180px,0.9fr)_128px]"
            >
              <div>
                <p className="font-black text-white">{slot}회차</p>
                <p className="mt-1 text-xs font-bold text-gray-600">{post.channel}</p>
              </div>
              <div className="min-w-0">
                <p className="font-black leading-6 text-white keep-all">{post.title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-gray-500 keep-all">
                  {post.keyword} · {post.memo}
                </p>
              </div>
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${blogPostWorkflowBadge(post)}`}>
                  {post.notionStatus || post.status}
                </span>
              </div>
              <p className="font-bold text-gray-400">{post.publishDate || post.publishedAt}</p>
              <p className="text-xs font-semibold leading-5 text-gray-500 keep-all">
                {post.nextAction || '검수 후 발행 상태를 업데이트합니다.'}
              </p>
              <div className="lg:text-right">
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${weeklyReportBadge(erpStatus as StoreWeeklyReportStatus)}`}>
                  {erpStatus}
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function WebsiteBlogWorkLogPanel({
  items,
  selectedItem,
  summary,
  loading,
  message,
  updatingDate,
  selectedUpdating,
  autoSaveStatus,
  cycle,
  onRefresh,
  onPreviousCycle,
  onNextCycle,
  onSelectDate,
  onChangeMemo,
  onSave,
}: {
  items: WeeklyReportItem[]
  selectedItem: WeeklyReportItem
  summary: ReturnType<typeof summarizeReports>
  loading: boolean
  message: string
  updatingDate: string | null
  selectedUpdating: boolean
  autoSaveStatus: string
  cycle: WebsiteBlogCycle
  onRefresh: () => void
  onPreviousCycle: () => void
  onNextCycle: () => void
  onSelectDate: (dateKey: string) => void
  onChangeMemo: (dateKey: string, value: string) => void
  onSave: (item: WeeklyReportItem, status: StoreWeeklyReportStatus, memo: string) => void
}) {
  const cycleGroups = websiteBlogCycleGroups(items, cycle)

  return (
    <div className="border-b border-white/10 p-5 md:p-6">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-blue">Operation Cycle Work Log</p>
          <h4 className="mt-2 text-xl font-black text-white">웹사이트·블로그 운영회차별 8회 작업현황</h4>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-gray-500 keep-all">
            계약 시작일 기준 1개월 운영기간마다 8회 작업 슬롯을 주차별로 관리합니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-gray-200">
              총 {items.length}회
            </span>
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1.5 text-emerald-100">
              완료 {summary.done}
            </span>
            <span className="rounded-full border border-brand-blue/25 bg-brand-blue/10 px-3 py-1.5 text-blue-100">
              작성중 {summary.inProgress}
            </span>
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-amber-100">
              대기 {summary.pending}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3 xl:items-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPreviousCycle}
              disabled={cycle.index === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:text-gray-700 disabled:hover:bg-transparent"
              aria-label="이전 운영회차"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="min-w-64 text-center text-sm font-black text-white">
              {cycle.index + 1}개월차 · {formatDateShort(cycle.start)}~{formatDateShort(cycle.end)}
            </p>
            <button
              type="button"
              onClick={onNextCycle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/5"
              aria-label="다음 운영회차"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm font-semibold leading-6 text-gray-500 xl:text-right keep-all">
            {loading ? '보고 DB 확인 중입니다.' : message || '운영회차별 웹사이트·블로그 작업내역을 확인합니다.'}
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={onRefresh}
            className="h-10 rounded-md border border-white/10 px-4 text-sm font-black text-gray-200 transition hover:border-brand-blue/40 hover:bg-brand-blue/10 hover:text-white disabled:cursor-not-allowed disabled:text-gray-600"
          >
            {loading ? '동기화 중' : 'Notion 동기화'}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-4">
        {cycleGroups.map((group) => (
          <section key={`website-blog-cycle-group-${group.label}`} className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">{group.label}</p>
                <p className="mt-1 text-xs font-bold text-gray-600">{group.rangeLabel}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-black px-2.5 py-1 text-[11px] font-black text-gray-300">
                {group.items.filter((item) => item.report.status === '보고완료').length}/2
              </span>
            </div>
            <div className="space-y-2">
              {group.items.map((item) => {
                const active = item.dateKey === selectedItem.dateKey
                const reportUpdating = updatingDate === item.dateKey
                const reportDone = item.report.status === '보고완료'

                return (
                  <article
                    key={`website-blog-log-${item.dateKey}`}
                    onClick={() => onSelectDate(item.dateKey)}
                    onKeyDown={(event) => {
                      if ((event.target as HTMLElement).closest('button')) return
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelectDate(item.dateKey)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`min-h-[156px] cursor-pointer rounded-lg border p-3 text-left outline-none transition ${
                      active
                        ? 'border-brand-blue/60 bg-brand-blue/15'
                        : 'border-white/10 bg-black hover:border-white/25 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-500">{formatWeekday(item.date)}</p>
                        <p className="mt-1 whitespace-nowrap text-2xl font-black leading-none tracking-tight text-white">
                          {formatMonthDay(item.date)}
                        </p>
                      </div>
                      <span className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-1 text-[11px] font-black leading-none ${weeklyReportBadge(item.report.status)}`}>
                        {item.report.status}
                      </span>
                    </div>
                    <p className="mt-3 font-black leading-6 text-white keep-all">
                      {item.report.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-gray-500 keep-all">
                      {item.draftMemo || '작업내역 입력 전입니다.'}
                    </p>
                    <button
                      type="button"
                      disabled={reportUpdating || reportDone}
                      onClick={(event) => {
                        event.stopPropagation()
                        onSave(item, '보고완료', item.draftMemo)
                      }}
                      className={`mt-3 h-8 w-full rounded-md border px-3 text-xs font-black transition ${
                        reportDone
                          ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
                          : 'border-white/15 bg-white/[0.03] text-gray-200 hover:border-brand-blue/50 hover:bg-brand-blue/15 hover:text-white'
                      } disabled:cursor-not-allowed disabled:opacity-80`}
                    >
                      {reportUpdating ? '처리 중' : reportDone ? '완료됨' : '완료처리'}
                    </button>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-5 grid gap-4 rounded-lg border border-white/10 bg-white/[0.025] p-4 xl:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-brand-blue">Selected Date</p>
              <h5 className="mt-2 text-2xl font-black text-white keep-all">{selectedItem.report.title}</h5>
              <p className="mt-2 text-sm font-bold text-gray-500">
                {formatMonthDay(selectedItem.date)} · {formatWeekday(selectedItem.date)}
              </p>
            </div>
            <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-black ${weeklyReportBadge(selectedItem.report.status)}`}>
              {selectedItem.report.status}
            </span>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 flex items-center justify-between gap-3 text-xs font-black text-gray-500">
              <span>작업내역</span>
              <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] leading-none ${autoSaveStatusBadge(autoSaveStatus)}`}>
                {autoSaveStatus}
              </span>
            </span>
            <textarea
              value={selectedItem.draftMemo}
              disabled={selectedUpdating}
              onChange={(event) => onChangeMemo(selectedItem.dateKey, event.target.value)}
              className="min-h-[320px] w-full resize-y rounded-md border border-white/10 bg-black px-4 py-3 text-sm font-semibold leading-6 text-gray-100 outline-none transition placeholder:text-gray-600 hover:border-white/25 focus:border-brand-blue/50 disabled:cursor-not-allowed disabled:text-gray-500"
              placeholder={`예시)
- 지점 페이지 대표 메뉴 섹션 문구 수정
- FAQ 3개 추가
- 블로그 초안 제목/키워드 정리
- Google 프로필 연결 URL 후보 확인`}
            />
          </label>
        </div>

        <aside className="rounded-lg border border-white/10 bg-black p-4">
          <p className="text-sm font-black text-white">기록 액션</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-gray-500 keep-all">
            선택한 날짜의 작업 상태와 내용을 저장합니다.
          </p>
          <label className="mt-4 block">
            <span className="mb-2 block text-[11px] font-black text-gray-600">작업상태</span>
            <select
              value={selectedItem.report.status}
              disabled={selectedUpdating}
              onChange={(event) =>
                onSave(selectedItem, event.target.value as StoreWeeklyReportStatus, selectedItem.draftMemo)
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
            disabled={selectedUpdating || selectedItem.report.status === '보고완료'}
            onClick={() => onSave(selectedItem, '보고완료', selectedItem.draftMemo)}
            className="mt-3 h-10 w-full rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 text-sm font-black text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-gray-500"
          >
            {selectedUpdating
              ? '처리 중'
              : selectedItem.report.status === '보고완료'
                ? '완료됨'
                : '완료처리'}
          </button>
          <button
            type="button"
            disabled={selectedUpdating}
            onClick={() => onSave(selectedItem, selectedItem.report.status, selectedItem.draftMemo)}
            className="mt-3 h-10 w-full rounded-md bg-brand-blue px-3 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
          >
            {selectedUpdating ? '저장 중' : '작업내역 저장'}
          </button>
          {selectedItem.report.status === '보고완료' ? (
            <p className="mt-4 text-xs font-bold leading-5 text-emerald-100/80 keep-all">
              {selectedItem.report.reporter ? `${selectedItem.report.reporter} · ` : ''}
              {selectedItem.report.completedAt
                ? formatDateTime(selectedItem.report.completedAt)
                : '보고완료'}
            </p>
          ) : null}
        </aside>
      </div>
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

function reportsForStoreWeek(store: OperationRow, apiReports: StoreWeeklyReport[] | undefined, weekDates: Date[]) {
  const googleProfileReports =
    store.productWorkspaces?.find((workspace) => workspace.key === 'googleProfile')?.weeklyReports || []
  const sourceReports = apiReports?.length ? apiReports : googleProfileReports

  return weekDates.map((date, index) => {
    const dateKey = toISODate(date)
    const report =
      sourceReports.find((item) => item.date === dateKey) ||
      sourceReports.find((item) => !item.date && item.dayOffset === index)

    if (report) {
      return {
        ...report,
        date: report.date || dateKey,
        dayOffset: index,
      }
    }

    return {
      dayOffset: index,
      date: dateKey,
      status: '보고대기' as StoreWeeklyReportStatus,
      title: '보고 예정',
      memo: '',
    }
  })
}

function websiteBlogContractStartForStore(storeTitle?: string) {
  const contract = contractRevenueRecords.find((record) => record.storeName === storeTitle)
  if (contract?.contractStartDate) return parseLocalDate(contract.contractStartDate)
  return startOfMonth(getKstCalendarDate())
}

function websiteBlogCurrentCycleIndex(contractStart: Date, today: Date) {
  if (today < contractStart) return 0

  for (let index = 0; index < 60; index += 1) {
    const cycle = websiteBlogCycleRange(contractStart, index)
    if (today >= cycle.start && today <= cycle.end) return index
  }

  return 0
}

function websiteBlogCycleRange(contractStart: Date, cycleIndex: number): WebsiteBlogCycle {
  const start = addCalendarMonths(contractStart, cycleIndex)
  const nextStart = addCalendarMonths(contractStart, cycleIndex + 1)

  return {
    index: cycleIndex,
    start,
    end: addDays(nextStart, -1),
  }
}

function websiteBlogReportsForCycle(cycle: WebsiteBlogCycle): StoreWeeklyReport[] {
  const slotDays = Array.from({ length: 4 }, (_, weekIndex) => {
    const segmentStart = addDays(cycle.start, weekIndex * 7)
    const segmentEnd = weekIndex === 3 ? cycle.end : minDate(addDays(segmentStart, 6), cycle.end)
    const firstSlot = minDate(addDays(segmentStart, 1), segmentEnd)
    const secondSlot = minDate(addDays(segmentStart, 4), segmentEnd)

    return [firstSlot, secondSlot]
  })

  return slotDays.flat().map((date, index) => ({
    dayOffset: index,
    date: toISODate(date),
    status: index === 0 ? '작성중' : '보고대기',
    title: `${index + 1}회차 블로그 작업내역`,
    memo: '',
  }))
}

function mergeWebsiteBlogMonthReports(baseReports: StoreWeeklyReport[], savedReports: StoreWeeklyReport[]) {
  const savedByDate = new Map<string, StoreWeeklyReport>()

  savedReports.forEach((report) => {
    if (report.date) savedByDate.set(report.date, report)
  })

  return baseReports.map((base) => {
    const saved = base.date ? savedByDate.get(base.date) : undefined
    if (!saved) return base

    return {
      ...base,
      ...saved,
      dayOffset: base.dayOffset,
      date: base.date,
      title: base.title,
    }
  })
}

function upsertReportHistory(current: StoreWeeklyReport[], report: StoreWeeklyReport) {
  if (!report.date) return current

  return [report, ...current.filter((item) => item.date !== report.date)].sort((a, b) =>
    (b.date || '').localeCompare(a.date || '')
  )
}

function websiteBlogCycleGroups(items: WeeklyReportItem[], cycle: WebsiteBlogCycle) {
  return Array.from({ length: 4 }, (_, weekIndex) => ({
    label: `${weekIndex + 1}주차`,
    rangeLabel: websiteBlogCycleWeekRangeLabel(cycle, weekIndex),
    items: items.filter((item) => Math.floor(item.report.dayOffset / 2) === weekIndex),
  }))
}

function websiteBlogCycleWeekRangeLabel(cycle: WebsiteBlogCycle, weekIndex: number) {
  const start = addDays(cycle.start, weekIndex * 7)
  const end = weekIndex === 3 ? cycle.end : minDate(addDays(start, 6), cycle.end)

  return `${formatMonthDay(start)}~${formatMonthDay(end)}`
}

function addCalendarMonths(date: Date, months: number) {
  const monthStart = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
  return new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(date.getDate(), lastDate))
}

function minDate(a: Date, b: Date) {
  return a <= b ? a : b
}

function taskStatusBadge(status: string) {
  if (statusIncludesAny(status, ['진행', '작성', '검수'])) return 'border-brand-blue/35 bg-brand-blue/15 text-blue-100'
  if (statusIncludesAny(status, ['완료', '운영중'])) return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (statusIncludesAny(status, ['대기', '예정'])) return 'border-amber-300/25 bg-amber-300/10 text-amber-100'
  return 'border-white/15 bg-white/5 text-gray-300'
}

function processNodeClass(status: string) {
  if (status === '완료') return 'border-emerald-300/35 bg-emerald-300/10 text-emerald-100'
  if (status === '진행중') return 'border-brand-blue/40 bg-brand-blue/15 text-blue-100'
  return 'border-white/15 bg-white/5 text-gray-400'
}

function processStatusBadge(status: string) {
  if (status === '완료') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (status === '진행중') return 'border-brand-blue/35 bg-brand-blue/15 text-blue-100'
  return 'border-white/15 bg-white/5 text-gray-400'
}

function autoSaveStatusBadge(status: string) {
  if (status.includes('실패')) return 'border-rose-300/35 bg-rose-300/10 text-rose-100'
  if (status.includes('저장 중')) return 'border-brand-blue/35 bg-brand-blue/15 text-blue-100'
  if (status.includes('자동저장됨')) return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  return 'border-white/15 bg-white/5 text-gray-400'
}

function billingStatusBadge(status: BillingStatus) {
  if (status === '입금완료') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (status === '청구완료') return 'border-brand-blue/35 bg-brand-blue/15 text-blue-100'
  if (status === '연체') return 'border-rose-300/35 bg-rose-300/10 text-rose-100'
  if (status === '보류') return 'border-white/15 bg-white/5 text-gray-400'
  return 'border-amber-300/25 bg-amber-300/10 text-amber-100'
}

function settlementReadinessBadge(status: SettlementStoreReadiness) {
  if (status === '정산대상') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  return 'border-amber-300/25 bg-amber-300/10 text-amber-100'
}

function settlementProcessBadge(status: SettlementProcessStatus) {
  if (status === '정산완료') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (status === '정산대기') return 'border-brand-blue/35 bg-brand-blue/15 text-blue-100'
  if (status === '정산 제외') return 'border-rose-300/30 bg-rose-300/10 text-rose-100'
  return 'border-amber-300/25 bg-amber-300/10 text-amber-100'
}

function blogPostWorkflowBadge(post: StoreBlogContentPost) {
  const status = post.notionStatus || post.status

  if (status === 'Published') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (status === 'Review') return 'border-brand-blue/35 bg-brand-blue/15 text-blue-100'
  if (statusIncludesAny(status, ['대기', '예정', '기획'])) return 'border-amber-300/25 bg-amber-300/10 text-amber-100'
  return 'border-white/15 bg-white/5 text-gray-300'
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

function buildAdsMonthlyReportPreview(
  storeTitle: string,
  data: GoogleAdsApiResponse,
  campaigns: AdsCampaignSummary[]
): AdsMonthlyReportPreview {
  const summary = data.summary
  const periodLabel =
    data.period.firstDate && data.period.lastDate
      ? `${data.period.firstDate} ~ ${data.period.lastDate}`
      : `최근 ${data.period.days || 30}일`
  const ctr = percent(summary.clicks, summary.impressions) || '-'
  const cpc = summary.clicks > 0 ? `${Math.round(summary.costMicros / 1000000 / summary.clicks).toLocaleString('ko-KR')}원` : '-'
  const hasTraffic = summary.impressions > 0 || summary.clicks > 0 || summary.costMicros > 0 || summary.localActions > 0
  const allPaused = campaigns.length > 0 && campaigns.every((campaign) => campaign.status.toUpperCase() === 'PAUSED')
  const enabledCount = campaigns.filter((campaign) => campaign.status.toUpperCase() === 'ENABLED').length
  const pausedCount = campaigns.filter((campaign) => campaign.status.toUpperCase() === 'PAUSED').length
  const searchTerms = data.searchTerms || []
  const topCampaign = [...campaigns].sort(
    (a, b) => b.clicks - a.clicks || b.impressions - a.impressions || b.costMicros - a.costMicros
  )[0]
  const topSearchTerm = [...searchTerms].sort(
    (a, b) => b.clicks - a.clicks || b.impressions - a.impressions || b.costMicros - a.costMicros
  )[0]

  const statusLine = allPaused
    ? `${storeTitle}의 Google Ads 캠페인 ${campaigns.length}개는 현재 모두 일시중지 상태입니다.`
    : `${storeTitle}의 Google Ads 캠페인 ${campaigns.length}개 중 운영중 ${enabledCount}개, 일시중지 ${pausedCount}개로 확인됩니다.`

  const performanceLine = hasTraffic
    ? `조회 기간 동안 전체 노출 ${formatCount(summary.impressions)}회, 클릭 ${formatCount(summary.clicks)}건, CTR ${ctr}, 광고비 ${formatCostMicros(summary.costMicros)}, 평균 CPC ${cpc}, 광고 액션 ${formatCount(summary.localActions)}건입니다.`
    : '조회 기간 내 노출, 클릭, 광고비, 광고 액션은 아직 발생하지 않았습니다.'

  const topCampaignLine =
    topCampaign && hasTraffic
      ? `가장 반응이 높은 캠페인은 ${topCampaign.name}이며, 클릭 ${formatCount(topCampaign.clicks)}건과 광고비 ${formatCostMicros(topCampaign.costMicros)} 기준으로 우선 확인합니다.`
      : '캠페인별 성과 비교는 실제 집행 데이터가 쌓인 뒤 언어별, 키워드별 반응 차이를 중심으로 정리합니다.'

  const topSearchTermLine =
    topSearchTerm && summary.clicks > 0
      ? `클릭이 발생한 주요 검색어는 "${topSearchTerm.searchTerm}"이며, 노출 ${formatCount(topSearchTerm.impressions)}회, 클릭 ${formatCount(topSearchTerm.clicks)}건, 광고비 ${formatCostMicros(topSearchTerm.costMicros)}로 확인됩니다.`
      : summary.clicks > 0
        ? '클릭은 발생했으나 Google Ads에서 공개 가능한 검색어가 아직 제한적이어서, 다음 보고 시 검색어 공개 여부를 함께 확인합니다.'
        : ''

  const actionItems = allPaused
    ? [
        '집행 시작 전 캠페인 상태, 일 예산, 최종 URL, 위치 확장 연결을 먼저 확인합니다.',
        '한국어와 영어 캠페인을 우선 점검하고, 일본어·중국어 캠페인은 예산과 검색량을 보며 순차적으로 운영합니다.',
        '집행 첫 주에는 검색어, CPC, 클릭 후 행동을 확인해 제외 키워드와 광고 문구를 조정합니다.',
      ]
    : summary.impressions > 0 && summary.clicks === 0
      ? [
          '노출은 발생했지만 클릭이 없으므로 검색어와 광고 문구의 매장 방문 의도를 다시 확인합니다.',
          '지역명, 메뉴명, 외국어 키워드별로 CTR 차이를 보고 예산 배분을 조정합니다.',
          '클릭을 유도할 대표 메뉴, 위치, 예약 가능 여부를 광고 문구에 반영합니다.',
        ]
      : summary.clicks > 0 && summary.localActions === 0
        ? [
            '클릭 이후 길찾기, 전화, 웹사이트 행동이 이어지는지 전환 추적 기준을 재점검합니다.',
            '랜딩 페이지와 Google 프로필의 영업시간, 위치, 대표 메뉴 정보가 광고와 일치하는지 확인합니다.',
            '클릭 단가가 높은 캠페인은 검색어 리포트 기준으로 제외 키워드를 추가합니다.',
          ]
        : [
            '성과가 발생한 캠페인의 검색어와 광고 문구를 우선 유지하고 예산 소진 속도를 확인합니다.',
            'CTR과 CPC가 불리한 캠페인은 키워드 묶음과 광고 문구를 분리해 테스트합니다.',
            '길찾기와 전화 행동이 발생한 시간대, 언어권, 키워드를 다음 달 운영 기준으로 정리합니다.',
          ]

  const campaignLines = campaigns.length
    ? campaigns.slice(0, 6).map((campaign) => {
        const campaignCtr = percent(campaign.clicks, campaign.impressions) || '-'
        return `${campaign.name}: ${campaign.status}, 노출 ${formatCount(campaign.impressions)}회, 클릭 ${formatCount(campaign.clicks)}건, CTR ${campaignCtr}, 광고비 ${formatCostMicros(campaign.costMicros)}, 액션 ${formatCount(campaign.localActions)}건`
      })
    : ['연결된 캠페인이 아직 없어 월간 보고서에는 계정 연결 상태와 데이터 적재 필요 항목을 먼저 기록합니다.']

  return {
    periodLabel,
    summaryLines: [statusLine, performanceLine, topCampaignLine, topSearchTermLine].filter(Boolean),
    actionItems,
    campaignLines,
  }
}

function adsConnectionBadge(data: GoogleAdsApiResponse | null, loading: boolean) {
  if (loading) return 'border-brand-blue/30 bg-brand-blue/15 text-blue-100'
  if (data?.status === 'connected') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (data?.connected) return 'border-amber-300/30 bg-amber-300/10 text-amber-100'
  return 'border-rose-300/35 bg-rose-300/10 text-rose-100'
}

function adsCampaignStatusBadge(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'ENABLED') return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
  if (normalized === 'PAUSED') return 'border-amber-300/30 bg-amber-300/10 text-amber-100'
  return 'border-white/10 bg-white/[0.04] text-gray-300'
}

function adsSourceLabel(data: GoogleAdsApiResponse | null) {
  if (!data?.connected) return '연결 필요'
  if (data.source === 'google_ads_api') return 'Google Ads API'
  if (data.source === 'bigquery') return 'BigQuery 연결'
  return '연결됨'
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

function reportStatusShort(status: StoreWeeklyReportStatus) {
  if (status === '보고완료') return '완료'
  if (status === '작성중') return '작성중'
  if (status === '생성완료') return '생성'
  if (status === '실패') return '실패'
  if (status === '초안') return '초안'
  return '대기'
}
