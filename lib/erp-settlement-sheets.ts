import { GoogleAuth } from 'google-auth-library'

type SheetCell = string | number | boolean | null

type SheetValueRange = {
  range?: string
  values?: SheetCell[][]
}

type SheetBatchGetResponse = {
  spreadsheetId?: string
  valueRanges?: SheetValueRange[]
}

type ContractSheetRow = {
  productGroup: string
  productDetail: string
  settlementRule: string
}

export type SheetSettlementProductBreakdown = {
  googleProfileAmount: number
  googleAdsAmount: number
  websiteBlogAmount: number
  adjustmentAmount: number
}

export type SheetSettlementRecord = {
  key: string
  storeName: string
  checkDate: string
  status: '청구예정' | '청구완료' | '입금완료' | '연체' | '보류'
  sheetPaymentStatus: string
  actualReceiptAmount: number
  actualReceiptDate: string
  memo: string
  productGroup: string
  productDetail: string
  grossAmount: number
  vatAmount: number
  netSalesAmount: number
  reserveAmount: number
  profileManagementAmount: number
  productBreakdown: SheetSettlementProductBreakdown
  expenseRevenueAmount: number
  workerCostAmount: number
  serviceRevenueAmount: number
  serviceRevenueVatAmount: number
  serviceRevenuePaymentAmount: number
  adExecutionBudgetAmount: number
  adExecutionBudgetVatAmount: number
  adExecutionBudgetPaymentAmount: number
  adsManagementRevenueAmount: number
  bizHighSupplyAmount: number
  bizHighVatAmount: number
  bizHighSettlementAmount: number
  headOfficeSupplyAmount: number
  headOfficeVatAmount: number
  headOfficeSettlementAmount: number
  workerWithholdingAmount: number
  workerNetPaymentAmount: number
  adsServiceCostAmount: number
  adsServiceVatAmount: number
  adsServicePaymentAmount: number
  netVatPayableAmount: number
  usesEcoJardinSettlementRule: boolean
  usesSeparateAdExecutionBudget: boolean
  profitAmount: number
}

export type SheetSettlementSummary = {
  monthIndex: number
  monthLabel: string
  records: SheetSettlementRecord[]
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

export type SettlementSheetResult = {
  connected: boolean
  source: 'google_sheets' | 'fallback'
  message: string
  spreadsheetUrl: string
  syncedAt: string
  settlementMonths: SheetSettlementSummary[]
}

const DEFAULT_SPREADSHEET_ID = '1L79CGmTUAevaOSEsQwcYT--l2ik942nImn0XCEMwy3M'
const SHEETS_READONLY_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly'
const SETTLEMENT_RANGE = "'매장별 정산'!A4:X100"
const CONTRACT_RANGE = "'계약·정산 기준'!A19:AB100"
const VALIDATION_RANGE = "'검증'!B2:B2"
const VAT_RATE = 0.1
const WITHHOLDING_RATE = 0.033

function spreadsheetId() {
  return process.env.ERP_SETTLEMENT_SHEET_ID || DEFAULT_SPREADSHEET_ID
}

export function settlementSpreadsheetUrl() {
  return (
    process.env.ERP_SETTLEMENT_SHEET_URL ||
    `https://docs.google.com/spreadsheets/d/${spreadsheetId()}/edit`
  )
}

function serviceAccountCredentials() {
  const encoded = process.env.ERP_GOOGLE_SHEETS_CREDENTIALS_BASE64 || ''
  if (!encoded) return null

  const parsed = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) as {
    client_email?: string
    private_key?: string
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Google Sheets 서비스 계정 정보가 올바르지 않습니다.')
  }

  return parsed
}

async function sheetsAccessToken() {
  const directToken = process.env.ERP_GOOGLE_SHEETS_ACCESS_TOKEN || ''
  if (directToken) return directToken

  const credentials = serviceAccountCredentials()
  if (!credentials) {
    throw new Error('Google Sheets 읽기 인증이 설정되지 않았습니다.')
  }

  const auth = new GoogleAuth({
    credentials,
    scopes: [SHEETS_READONLY_SCOPE],
  })
  const client = await auth.getClient()
  const accessToken = await client.getAccessToken()
  const token = typeof accessToken === 'string' ? accessToken : accessToken?.token

  if (!token) throw new Error('Google Sheets 액세스 토큰을 발급받지 못했습니다.')
  return token
}

async function fetchSettlementWorkbook() {
  const params = new URLSearchParams({
    majorDimension: 'ROWS',
    valueRenderOption: 'FORMATTED_VALUE',
  })
  params.append('ranges', SETTLEMENT_RANGE)
  params.append('ranges', CONTRACT_RANGE)
  params.append('ranges', VALIDATION_RANGE)

  const token = await sheetsAccessToken()
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId())}/values:batchGet?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    }
  )
  const data = (await response.json()) as SheetBatchGetResponse & {
    error?: { message?: string }
  }

  if (!response.ok) {
    throw new Error(data.error?.message || `Google Sheets API ${response.status}`)
  }

  return data
}

function text(value: SheetCell | undefined) {
  return value == null ? '' : String(value).trim()
}

function amount(value: SheetCell | undefined) {
  if (typeof value === 'number') return value
  const normalized = text(value).replace(/,/g, '').replace(/원/g, '')
  if (!normalized) return 0
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) throw new Error(`금액 형식이 올바르지 않습니다: ${text(value)}`)
  return parsed
}

function headerMap(row: SheetCell[] | undefined) {
  return new Map((row || []).map((value, index) => [text(value), index]))
}

function requireHeaders(headers: Map<string, number>, required: string[], rangeName: string) {
  const missing = required.filter((name) => !headers.has(name))
  if (missing.length) {
    throw new Error(`${rangeName} 필수 열이 없습니다: ${missing.join(', ')}`)
  }
}

function cell(row: SheetCell[], headers: Map<string, number>, name: string) {
  const index = headers.get(name)
  return index == null ? undefined : row[index]
}

function monthKey(value: SheetCell | undefined) {
  const match = text(value).match(/^(\d{4})[-./년\s]+(\d{1,2})/)
  if (!match) throw new Error(`정산월 형식이 올바르지 않습니다: ${text(value)}`)
  return `${match[1]}-${String(Number(match[2])).padStart(2, '0')}`
}

function normalizedDate(value: SheetCell | undefined, fallbackMonth: string) {
  const raw = text(value)
  const match = raw.match(/^(\d{4})[-./년\s]+(\d{1,2})(?:[-./월\s]+(\d{1,2}))?/)
  if (!match) return `${fallbackMonth}-01`
  return `${match[1]}-${String(Number(match[2])).padStart(2, '0')}-${String(Number(match[3] || 1)).padStart(2, '0')}`
}

function monthIndex(key: string) {
  const [year, month] = key.split('-').map(Number)
  return (year - 2026) * 12 + (month - 6)
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  return `${year}년 ${month}월`
}

function billingStatus(value: string): SheetSettlementRecord['status'] {
  if (value === '입금완료' || value === '선입금배분') return '입금완료'
  if (value === '청구완료' || value === '연체' || value === '보류') return value
  return '청구예정'
}

function contractRows(valueRange: SheetValueRange | undefined) {
  const rows = valueRange?.values || []
  const headers = headerMap(rows[0])
  requireHeaders(headers, ['매장명', '상품군', '상품상세', '정산규칙'], '계약·정산 기준')

  return new Map(
    rows
      .slice(1)
      .filter((row) => text(cell(row, headers, '매장명')))
      .map((row) => [
        text(cell(row, headers, '매장명')),
        {
          productGroup: text(cell(row, headers, '상품군')),
          productDetail: text(cell(row, headers, '상품상세')),
          settlementRule: text(cell(row, headers, '정산규칙')),
        } satisfies ContractSheetRow,
      ])
  )
}

function settlementRecords(
  valueRange: SheetValueRange | undefined,
  contracts: Map<string, ContractSheetRow>
) {
  const rows = valueRange?.values || []
  const headers = headerMap(rows[0])
  const requiredHeaders = [
    '정산월',
    '매장명',
    '입금상태',
    '서비스 공급가',
    '서비스 VAT',
    '서비스 실결제',
    '광고비 공급가',
    '광고비 VAT',
    '광고비 실결제',
    '월 배분 총결제액',
    '프로필 매출',
    'Ads 운영 매출',
    '웹/블로그 매출',
    '비즈하이 비용',
    '본사 수수료',
    '작업자 정산',
    'Ads 용역비',
    '유보금',
    '예상 순수익',
    '실제 입금액',
    '실제 입금일',
    '정산기준일',
    '메모',
  ]
  requireHeaders(headers, requiredHeaders, '매장별 정산')

  return rows
    .slice(1)
    .filter((row) => text(cell(row, headers, '정산월')) && text(cell(row, headers, '매장명')))
    .map((row) => {
      const storeName = text(cell(row, headers, '매장명'))
      const contract = contracts.get(storeName)
      if (!contract) throw new Error(`${storeName} 계약 기준을 찾지 못했습니다.`)

      const period = monthKey(cell(row, headers, '정산월'))
      const index = monthIndex(period)
      if (index < 0) throw new Error(`${storeName} 정산월이 ERP 기준월보다 빠릅니다: ${period}`)

      const sheetPaymentStatus = text(cell(row, headers, '입금상태'))
      const serviceRevenueAmount = amount(cell(row, headers, '서비스 공급가'))
      const serviceRevenueVatAmount = amount(cell(row, headers, '서비스 VAT'))
      const serviceRevenuePaymentAmount = amount(cell(row, headers, '서비스 실결제'))
      const adExecutionBudgetAmount = amount(cell(row, headers, '광고비 공급가'))
      const adExecutionBudgetVatAmount = amount(cell(row, headers, '광고비 VAT'))
      const adExecutionBudgetPaymentAmount = amount(cell(row, headers, '광고비 실결제'))
      const totalPaymentAmount = amount(cell(row, headers, '월 배분 총결제액'))
      const profileManagementAmount = amount(cell(row, headers, '프로필 매출'))
      const adsManagementRevenueAmount = amount(cell(row, headers, 'Ads 운영 매출'))
      const websiteBlogAmount = amount(cell(row, headers, '웹/블로그 매출'))
      const bizHighSupplyAmount = amount(cell(row, headers, '비즈하이 비용'))
      const headOfficeSupplyAmount = amount(cell(row, headers, '본사 수수료'))
      const workerCostAmount = amount(cell(row, headers, '작업자 정산'))
      const adsServiceCostAmount = amount(cell(row, headers, 'Ads 용역비'))
      const reserveAmount = amount(cell(row, headers, '유보금'))
      const profitAmount = amount(cell(row, headers, '예상 순수익'))
      const actualReceiptAmount = amount(cell(row, headers, '실제 입금액'))
      const actualReceiptDateText = text(cell(row, headers, '실제 입금일'))
      const checkDate = normalizedDate(cell(row, headers, '정산기준일'), period)
      const usesEcoJardinSettlementRule =
        contract.settlementRule === '에코쟈댕' || storeName.startsWith('에코쟈댕')
      const usesSeparateAdExecutionBudget =
        contract.settlementRule.includes('별도광고비') || storeName === '바다당 해운대점'
      const bizHighVatAmount = Math.round(bizHighSupplyAmount * VAT_RATE)
      const headOfficeVatAmount = Math.round(headOfficeSupplyAmount * VAT_RATE)
      const workerWithholdingAmount = Math.round(workerCostAmount * WITHHOLDING_RATE)
      const adsServiceVatAmount = Math.round(adsServiceCostAmount * VAT_RATE)
      const grossAmount = usesSeparateAdExecutionBudget ? serviceRevenuePaymentAmount : totalPaymentAmount
      const vatAmount = usesSeparateAdExecutionBudget
        ? serviceRevenueVatAmount
        : serviceRevenueVatAmount + adExecutionBudgetVatAmount
      const netSalesAmount = usesSeparateAdExecutionBudget
        ? serviceRevenueAmount
        : serviceRevenueAmount + adExecutionBudgetAmount
      const netVatPayableAmount = usesEcoJardinSettlementRule
        ? vatAmount -
          adExecutionBudgetVatAmount -
          adsServiceVatAmount -
          bizHighVatAmount -
          headOfficeVatAmount
        : serviceRevenueVatAmount - bizHighVatAmount

      return {
        key: `${index}:${storeName}:${checkDate}`,
        storeName,
        checkDate,
        status: billingStatus(sheetPaymentStatus),
        sheetPaymentStatus,
        actualReceiptAmount,
        actualReceiptDate: actualReceiptDateText
          ? normalizedDate(actualReceiptDateText, period)
          : '',
        memo: text(cell(row, headers, '메모')),
        productGroup: contract.productGroup,
        productDetail: contract.productDetail,
        grossAmount,
        vatAmount,
        netSalesAmount,
        reserveAmount,
        profileManagementAmount,
        productBreakdown: {
          googleProfileAmount: profileManagementAmount,
          googleAdsAmount: adsManagementRevenueAmount,
          websiteBlogAmount,
          adjustmentAmount:
            serviceRevenueAmount -
            profileManagementAmount -
            adsManagementRevenueAmount -
            websiteBlogAmount,
        },
        expenseRevenueAmount: bizHighSupplyAmount,
        workerCostAmount,
        serviceRevenueAmount,
        serviceRevenueVatAmount,
        serviceRevenuePaymentAmount,
        adExecutionBudgetAmount,
        adExecutionBudgetVatAmount,
        adExecutionBudgetPaymentAmount,
        adsManagementRevenueAmount,
        bizHighSupplyAmount,
        bizHighVatAmount,
        bizHighSettlementAmount: bizHighSupplyAmount + bizHighVatAmount,
        headOfficeSupplyAmount,
        headOfficeVatAmount,
        headOfficeSettlementAmount: headOfficeSupplyAmount + headOfficeVatAmount,
        workerWithholdingAmount,
        workerNetPaymentAmount: workerCostAmount - workerWithholdingAmount,
        adsServiceCostAmount,
        adsServiceVatAmount,
        adsServicePaymentAmount: adsServiceCostAmount + adsServiceVatAmount,
        netVatPayableAmount,
        usesEcoJardinSettlementRule,
        usesSeparateAdExecutionBudget,
        profitAmount,
      } satisfies SheetSettlementRecord
    })
}

export function parseSettlementWorkbook(data: SheetBatchGetResponse) {
  const ranges = data.valueRanges || []
  const validationStatus = text(ranges[2]?.values?.[0]?.[0])
  if (validationStatus !== 'PASS') {
    throw new Error(`정산 시트 검증 상태가 PASS가 아닙니다: ${validationStatus || '확인 불가'}`)
  }

  const contracts = contractRows(ranges[1])
  const records = settlementRecords(ranges[0], contracts)
  if (!records.length) throw new Error('정산 시트에 유효한 데이터가 없습니다.')

  const grouped = new Map<number, SheetSettlementRecord[]>()
  records.forEach((record) => {
    const index = Number(record.key.split(':', 1)[0])
    grouped.set(index, [...(grouped.get(index) || []), record])
  })

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left - right)
    .map(([index, monthRecords]) => {
      const periodDate = new Date(2026, 5 + index, 1)
      const period = `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`
      const sum = (pick: (record: SheetSettlementRecord) => number) =>
        monthRecords.reduce((total, record) => total + pick(record), 0)

      return {
        monthIndex: index,
        monthLabel: monthLabel(period),
        records: monthRecords.sort(
          (left, right) =>
            left.checkDate.localeCompare(right.checkDate) ||
            left.storeName.localeCompare(right.storeName)
        ),
        excludedStoreNames: [],
        grossAmount: sum((record) => record.grossAmount),
        vatAmount: sum((record) => record.vatAmount),
        netSalesAmount: sum((record) => record.netSalesAmount),
        reserveRate: 0,
        reserveAmountPerStore: 50_000,
        reserveAmount: sum((record) => record.reserveAmount),
        profileManagementAmount: sum((record) => record.profileManagementAmount),
        expenseRevenueRate: 0.1,
        expenseRevenueAmount: sum((record) => record.expenseRevenueAmount),
        workerCostPerStore: 150_000,
        workerCostAmount: sum((record) => record.workerCostAmount),
        profitAmount: sum((record) => record.profitAmount),
      } satisfies SheetSettlementSummary
    })
}

export async function readSettlementSheet(): Promise<SettlementSheetResult> {
  const spreadsheetUrl = settlementSpreadsheetUrl()

  try {
    const data = await fetchSettlementWorkbook()
    const settlementMonths = parseSettlementWorkbook(data)
    return {
      connected: true,
      source: 'google_sheets',
      message: `Google Sheets 정산 원본과 연결되었습니다. (${settlementMonths.length}개월)`,
      spreadsheetUrl,
      syncedAt: new Date().toISOString(),
      settlementMonths,
    }
  } catch (error) {
    console.error('ERP settlement Google Sheets sync failed', error)
    return {
      connected: false,
      source: 'fallback',
      message:
        error instanceof Error
          ? `Google Sheets를 읽지 못해 ERP 내장 데이터를 표시합니다: ${error.message}`
          : 'Google Sheets를 읽지 못해 ERP 내장 데이터를 표시합니다.',
      spreadsheetUrl,
      syncedAt: new Date().toISOString(),
      settlementMonths: [],
    }
  }
}
