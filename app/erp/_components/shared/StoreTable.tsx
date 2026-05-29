'use client'

import { ChevronDown, Clock3, ExternalLink, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { DEFAULT_CLIENT_STATUS_OPTIONS, EFORMSIGN_URL } from '../../_lib/erp-config'
import type { StoreRecord } from '../../_lib/erp-config'

type StoreMetric = {
  label: string
  value: string
  detail?: string
}

function statusIncludesAny(status: string, keywords: string[]) {
  const compactStatus = (status || '').replace(/\s+/g, '')
  return keywords.some((keyword) => compactStatus.includes(keyword.replace(/\s+/g, '')))
}

function statusBadge(status: string) {
  if (statusIncludesAny(status, ['공동 대응', '공동대응'])) return 'border-red-300/30 bg-red-400/10 text-red-100'
  if (statusIncludesAny(status, ['견적서 송부/팔로업 지속', '견적서송부/팔로업지속'])) return 'border-yellow-300/35 bg-yellow-300/10 text-yellow-100'
  if (status.includes('운영')) return 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200'
  if (status.includes('계약')) return 'border-amber-300/30 bg-amber-300/10 text-amber-100'
  if (status.includes('견적')) return 'border-blue-300/30 bg-brand-blue/15 text-blue-100'
  if (status.includes('진단')) return 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
  return 'border-white/15 bg-white/10 text-gray-200'
}

function FileState({ count, emptyLabel }: { count: number; emptyLabel: string }) {
  const className =
    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ' +
    (count > 0
      ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200'
      : 'border-white/15 bg-white/5 text-gray-400')

  return <span className={className}>{count > 0 ? String(count) + '개 저장' : emptyLabel}</span>
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode
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

function formatCrmDate(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit' }).format(date)
}

export function StoreTable({
  title,
  description,
  stores,
  loading,
  columns,
  metrics,
  enableStatusFilter,
  runningAction,
  statusOptions,
  updatingStatusId,
  onStatusChange,
  onRunDiagnosis,
  onRunQuote,
}: {
  title: string
  description: string
  stores: StoreRecord[]
  loading: boolean
  columns: 'crm' | 'customer' | 'diagnosis' | 'quote' | 'contract' | 'report'
  metrics?: StoreMetric[]
  enableStatusFilter?: boolean
  runningAction?: string | null
  statusOptions?: string[]
  updatingStatusId?: string | null
  onStatusChange?: (store: StoreRecord, status: string) => void
  onRunDiagnosis?: (store: StoreRecord) => void
  onRunQuote?: (store: StoreRecord) => void
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const statusFilterOptions = useMemo(
    () => Array.from(new Set(stores.map((store) => store.status).filter(Boolean))),
    [stores]
  )
  const filteredStores = stores.filter((store) => {
    const searchableText = [
      store.name,
      store.status,
      store.owner,
      store.contact,
      store.category,
      store.inquirySource,
      store.nextAction,
    ]
      .join(' ')
      .toLowerCase()
    const matchesQuery = !query.trim() || searchableText.includes(query.trim().toLowerCase())
    const matchesStatus = statusFilter === 'all' || store.status === statusFilter

    return matchesQuery && matchesStatus
  })
  const showsGoogleMap = columns === 'crm' || columns === 'customer'
  const showsAction = columns !== 'customer'
  const tableColumnCount = columns === 'customer' ? 4 : columns === 'crm' || columns === 'contract' ? 7 : 5
  const tableMinWidth = columns === 'customer' ? 'min-w-[760px]' : 'min-w-[1080px]'

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
          {enableStatusFilter ? (
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm font-bold text-white outline-none md:w-44"
            >
              <option value="all">전체 상태</option>
              {statusFilterOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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

      {metrics?.length ? (
        <div className="grid border-b border-white/10 md:grid-cols-3 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="border-white/10 px-5 py-4 md:border-r last:border-r-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-white">{metric.value}</p>
              {metric.detail ? <p className="mt-1 text-xs font-bold text-gray-500">{metric.detail}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className={`${tableMinWidth} w-full border-collapse text-left text-sm`}>
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-gray-500">
            <tr>
              <th className="px-5 py-4">매장명</th>
              <th className="px-5 py-4">상태</th>
              {columns === 'crm' && <th className="px-5 py-4">문의 정보</th>}
              {columns === 'crm' && <th className="px-5 py-4">팔로업</th>}
              {showsGoogleMap && <th className="px-5 py-4">구글맵</th>}
              {columns === 'diagnosis' && <th className="px-5 py-4">분석자료</th>}
              {columns === 'quote' && <th className="px-5 py-4">견적서</th>}
              {columns === 'contract' && <th className="px-5 py-4">계약서</th>}
              {columns === 'contract' && <th className="px-5 py-4">전자계약</th>}
              {columns === 'contract' && <th className="px-5 py-4">계약 상태</th>}
              {columns === 'report' && <th className="px-5 py-4">보고 현황</th>}
              <th className="px-5 py-4">담당</th>
              {showsAction && <th className="px-5 py-4">액션</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-5 py-10 text-center font-bold text-gray-500" colSpan={tableColumnCount}>
                  문의관리 DB를 불러오는 중입니다.
                </td>
              </tr>
            ) : filteredStores.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-center font-bold text-gray-500" colSpan={tableColumnCount}>
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
                  <td className="px-5 py-4">
                    {onStatusChange ? (
                      <div className="relative inline-flex">
                        <select
                          value={store.status || ''}
                          disabled={updatingStatusId === store.id}
                          onChange={(event) => onStatusChange(store, event.target.value)}
                          className={`h-9 min-w-[180px] appearance-none rounded-full border py-0 pl-3 pr-12 text-xs font-black outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${statusBadge(store.status)}`}
                        >
                          {store.status && !statusOptions?.includes(store.status) ? (
                            <option value={store.status}>{store.status}</option>
                          ) : null}
                          {(statusOptions?.length ? statusOptions : DEFAULT_CLIENT_STATUS_OPTIONS).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-current" />
                      </div>
                    ) : (
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge(store.status)}`}>
                        {store.status || '상태 없음'}
                      </span>
                    )}
                  </td>

                  {columns === 'crm' && (
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-200">{store.category || '분류 미등록'}</p>
                      <p className="mt-1 text-xs font-semibold text-gray-500">{store.inquirySource || '문의경로 미등록'}</p>
                    </td>
                  )}

                  {columns === 'crm' && (
                    <td className="px-5 py-4">
                      <p className="max-w-[260px] font-bold leading-5 text-gray-200 keep-all">
                        {store.nextAction || '후속 액션 미등록'}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-gray-500">
                        {store.followupDue
                          ? `예정 ${formatCrmDate(store.followupDue)}`
                          : store.lastContacted
                            ? `최근 연락 ${formatCrmDate(store.lastContacted)}`
                            : '일정 미등록'}
                      </p>
                    </td>
                  )}

                  {showsGoogleMap && (
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
                  {showsAction && (
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
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
