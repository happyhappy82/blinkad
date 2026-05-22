'use client'

import {
  BarChart3,
  Building2,
  CheckCircle2,
  CircleDot,
  Clock3,
  ExternalLink,
  FileSearch,
  MapPinned,
  ReceiptText,
  RefreshCw,
  Search,
} from 'lucide-react'
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

const menus = [
  { id: 'dashboard', label: '대시보드', icon: BarChart3 },
  { id: 'crm', label: '문의 CRM', icon: Building2 },
  { id: 'diagnosis', label: '진단자료', icon: FileSearch },
  { id: 'quote', label: '견적서', icon: ReceiptText },
  { id: 'profile', label: '프로필 운영', icon: MapPinned },
  { id: 'report', label: '리포트', icon: CheckCircle2 },
] as const

type MenuId = (typeof menus)[number]['id']

const statusGroups = [
  { label: '문의접수', matcher: ['문의', '접수', '신규'] },
  { label: '견적서', matcher: ['견적', '제안'] },
  { label: '계약대기', matcher: ['계약', '대기'] },
  { label: '운영시작', matcher: ['운영', '진행', '시작'] },
]

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

  const dashboard = useMemo(() => {
    const managed = stores.filter((store) => matchesStatus(store.status, ['운영', '진행', '시작'])).length
    const counts = statusGroups.map((group) => ({
      label: group.label,
      count: stores.filter((store) => matchesStatus(store.status, group.matcher)).length,
    }))

    return { managed, counts }
  }, [stores])

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

          <nav className="px-3 py-5">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              ERP Menu
            </p>
            <div className="space-y-1">
              {menus.map((menu) => {
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
                  영업·진단·견적·운영 관리
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
              {menus.map((menu) => (
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

            {activeMenu === 'profile' && (
              <StoreTable
                title="프로필 운영"
                description="각 매장별 Google 프로필 운영 상태를 확인합니다."
                stores={stores}
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
          </div>
        </section>
      </div>
    </main>
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
  columns: 'crm' | 'diagnosis' | 'quote' | 'profile' | 'report'
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
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-gray-500">
            <tr>
              <th className="px-5 py-4">매장명</th>
              <th className="px-5 py-4">업종</th>
              <th className="px-5 py-4">상태</th>
              {columns === 'crm' && <th className="px-5 py-4">구글맵</th>}
              {columns === 'diagnosis' && <th className="px-5 py-4">분석자료</th>}
              {columns === 'quote' && <th className="px-5 py-4">견적서</th>}
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
