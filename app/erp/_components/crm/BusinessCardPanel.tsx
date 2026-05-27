'use client'

import { ExternalLink, FileSearch, RefreshCw, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type { BusinessCardRecord } from '../../_lib/erp-config'

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

function formatDateTime(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function BusinessCardPanel({
  cards,
  loading,
  message,
  metrics,
  runningOcrId,
  onRefresh,
  onAnalyze,
}: {
  cards: BusinessCardRecord[]
  loading: boolean
  message: string
  metrics: StoreMetric[]
  runningOcrId: string | null
  onRefresh: () => void
  onAnalyze: (card: BusinessCardRecord) => void
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [previewCard, setPreviewCard] = useState<BusinessCardRecord | null>(null)
  const statusOptions = useMemo(
    () => Array.from(new Set(cards.map((card) => card.status).filter(Boolean))),
    [cards]
  )
  const filteredCards = cards.filter((card) => {
    const searchableText = [card.name, card.phone, card.status, card.meetingTitles.join(' ')]
      .join(' ')
      .toLowerCase()
    const matchesQuery = !query.trim() || searchableText.includes(query.trim().toLowerCase())
    const matchesStatus = statusFilter === 'all' || card.status === statusFilter

    return matchesQuery && matchesStatus
  })

  const imageSource = (card: BusinessCardRecord) => card.imagePreviewUrl || card.imageUrl

  useEffect(() => {
    if (!previewCard) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewCard(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [previewCard])

  return (
    <section className="rounded-lg border border-white/10 bg-[#0b0d12]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm font-bold text-brand-blue">Contact</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">명함관리</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400 keep-all">
            Notion 명함 DB에 업로드된 명함 사진과 연락처를 ERP에서 확인합니다.
          </p>
          {message ? <p className="mt-2 text-xs font-bold text-gray-500">{message}</p> : null}
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-3 text-sm font-black text-gray-200 hover:border-white/30 hover:bg-white/5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm font-bold text-white outline-none md:w-40"
          >
            <option value="all">전체 상태</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-md border border-white/10 bg-black pl-9 pr-3 text-sm font-semibold text-white outline-none placeholder:text-gray-600"
              placeholder="이름, 연락처, 미팅 검색"
            />
          </div>
        </div>
      </div>

      <div className="grid border-b border-white/10 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="border-white/10 px-5 py-4 md:border-r last:border-r-0">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-white">{metric.value}</p>
            {metric.detail ? <p className="mt-1 text-xs font-bold text-gray-500">{metric.detail}</p> : null}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="p-10 text-center text-sm font-bold text-gray-500">명함 DB를 불러오는 중입니다.</p>
      ) : filteredCards.length === 0 ? (
        <p className="p-10 text-center text-sm font-bold text-gray-500">표시할 명함이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[1240px] w-full table-fixed border-collapse">
            <thead className="bg-black/35">
              <tr className="border-b border-white/10 text-left">
                <th className="w-32 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">명함</th>
                <th className="w-44 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">이름</th>
                <th className="w-40 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">연락처</th>
                <th className="w-32 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">상태</th>
                <th className="w-32 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">OCR</th>
                <th className="w-56 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">관련 미팅</th>
                <th className="w-36 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">수정일</th>
                <th className="w-36 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">다시분석</th>
                <th className="w-36 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-gray-500">Notion</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id} className="border-b border-white/10 bg-[#07090d] align-middle last:border-b-0 hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={!imageSource(card)}
                      onClick={() => setPreviewCard(card)}
                      className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.04] transition hover:border-brand-blue/60 disabled:cursor-default disabled:hover:border-white/10"
                      title={imageSource(card) ? '명함 크게 보기' : '사진 없음'}
                    >
                      {imageSource(card) ? (
                        <img src={imageSource(card)} alt={card.imageName || card.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-600">사진 없음</span>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <p className="truncate text-sm font-black text-white" title={card.name}>
                      {card.name}
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-gray-600" title={card.imageName || '파일명 없음'}>
                      {card.imageName || '파일명 없음'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="whitespace-nowrap text-sm font-bold text-gray-200">{card.phone || '연락처 미입력'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge(card.status)}`}>
                      {card.status || '상태 없음'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge(card.ocrStatus)}`}>
                      {card.ocrStatus || '대기'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p
                      className="line-clamp-2 text-xs font-semibold leading-5 text-gray-500 keep-all"
                      title={card.meetingTitles.length ? card.meetingTitles.join(', ') : '관련 미팅 미연결'}
                    >
                      {card.meetingTitles.length ? card.meetingTitles.join(', ') : '관련 미팅 미연결'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="whitespace-nowrap text-xs font-semibold text-gray-500">
                      {card.lastEdited ? formatDateTime(card.lastEdited) : '수정일 없음'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={!card.imageUrl || runningOcrId === card.id}
                      onClick={() => onAnalyze(card)}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-brand-blue px-3 text-xs font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                    >
                      <FileSearch className={`h-3.5 w-3.5 ${runningOcrId === card.id ? 'animate-pulse' : ''}`} />
                      {runningOcrId === card.id ? '분석 중' : '다시 분석'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    {card.notionUrl ? (
                      <a
                        href={card.notionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-brand-blue/30 bg-brand-blue/10 px-3 text-xs font-black text-blue-100 hover:border-brand-blue/60 hover:bg-brand-blue/15"
                      >
                        Notion
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-gray-600">링크 없음</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewCard ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setPreviewCard(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/15 bg-[#080a0f] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{previewCard.name}</p>
                <p className="mt-1 truncate text-xs font-semibold text-gray-500">
                  {previewCard.imageName || '명함 이미지'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCard(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-gray-200 hover:border-white/30 hover:bg-white/5"
                title="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-black p-3">
              <img
                src={imageSource(previewCard)}
                alt={previewCard.imageName || previewCard.name}
                className="max-h-[78vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
