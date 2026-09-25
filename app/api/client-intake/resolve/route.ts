import { NextRequest, NextResponse } from 'next/server'

import { resolvePortalIntakeStore } from '@/lib/client-intake-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ ok: false, message: '허용되지 않은 요청입니다.' }, { status: 403 })
  }

  let input: { storeKey?: unknown; accessToken?: unknown }
  try {
    input = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: '입력 형식을 확인해 주세요.' }, { status: 400 })
  }

  const storeKey = typeof input.storeKey === 'string' ? input.storeKey.trim() : ''
  const accessToken = typeof input.accessToken === 'string' ? input.accessToken.trim() : ''

  try {
    const store = await resolvePortalIntakeStore(storeKey, accessToken)
    if (!store) {
      return NextResponse.json({ ok: false, message: '유효한 매장 전용 링크로 다시 접속해 주세요.' }, { status: 401 })
    }
    return NextResponse.json({ ok: true, store }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ ok: false, message: '매장 링크를 확인하고 있습니다. 잠시 후 다시 시도해 주세요.' }, { status: 503 })
  }
}
