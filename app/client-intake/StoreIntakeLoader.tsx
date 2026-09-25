'use client'

import { AlertCircle, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

import ClientIntakeForm from './ClientIntakeForm'

type ResolvedStore = { id: string; name: string }

export default function StoreIntakeLoader({ storeKey, legacyStoreName = '' }: { storeKey: string; legacyStoreName?: string }) {
  const [store, setStore] = useState<ResolvedStore | null>(
    legacyStoreName ? { id: storeKey, name: legacyStoreName } : null
  )
  const [accessToken, setAccessToken] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (legacyStoreName) return

    const token = new URLSearchParams(window.location.hash.slice(1)).get('access') || ''
    if (!token) {
      setError('유효한 매장 전용 링크로 다시 접속해 주세요.')
      return
    }

    const controller = new AbortController()
    fetch('/api/client-intake/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeKey, accessToken: token }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as { ok?: boolean; store?: ResolvedStore; message?: string }
        if (!response.ok || !result.ok || !result.store) {
          throw new Error(result.message || '매장 링크를 확인하지 못했습니다.')
        }
        setAccessToken(token)
        setStore(result.store)
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return
        setError(reason instanceof Error ? reason.message : '매장 링크를 확인하지 못했습니다.')
      })

    return () => controller.abort()
  }, [legacyStoreName, storeKey])

  if (store) {
    return (
      <ClientIntakeForm
        lockedBusinessName={store.name}
        storeKey={store.id}
        intakeAccess={accessToken}
      />
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-5 text-slate-950">
      <section className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white px-7 py-12 text-center shadow-xl shadow-slate-200/60 md:px-12">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${error ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          {error ? <AlertCircle className="h-7 w-7" /> : <LoaderCircle className="h-7 w-7 animate-spin" />}
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">BlinkAd Client Intake</p>
        <h1 className="mt-3 text-2xl font-bold">{error ? '링크를 확인해 주세요' : '매장 전용 링크 확인 중'}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {error || '매장 정보를 안전하게 불러오고 있습니다.'}
        </p>
        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4" /> 매장명이 확인된 링크만 자료를 제출할 수 있습니다.
        </div>
      </section>
    </main>
  )
}
