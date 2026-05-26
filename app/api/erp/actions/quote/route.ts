import { NextResponse } from 'next/server'

import { forwardToLocalWorker, renderAndUploadQuote } from '../_lib/automation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json()
  const notionName = String(body.notionName || '').trim()
  const storeName = String(body.storeName || notionName || '').trim()

  if (!storeName) {
    return NextResponse.json({ ok: false, message: '매장명이 필요합니다.' }, { status: 400 })
  }

  try {
    const workerResult = await forwardToLocalWorker('quote', { notionName: notionName || storeName, storeName })
    if (workerResult) {
      return NextResponse.json({
        ok: true,
        mode: 'local-worker',
        message: workerResult.message || `${storeName} 견적서 생성을 로컬 워커에 요청했습니다.`,
        worker: workerResult,
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        mode: 'local-worker',
        message: error instanceof Error ? error.message : '로컬 견적서 워커 호출 중 오류가 발생했습니다.',
      },
      { status: 502 }
    )
  }

  if (process.env.ERP_ENABLE_LOCAL_SKILLS !== 'true') {
    return NextResponse.json({
      ok: false,
      message:
        '견적서 생성 버튼은 준비되었습니다. 배포 ERP에서 실행하려면 ERP_ACTION_WORKER_WEBHOOK_URL 또는 QUOTE_WORKER_WEBHOOK_URL로 로컬 워커를 연결해야 합니다.',
    })
  }

  try {
    const result = await renderAndUploadQuote({ notionName: notionName || storeName, storeName })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : '견적서 자동화 실행 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
