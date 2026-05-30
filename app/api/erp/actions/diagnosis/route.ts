import { NextResponse } from 'next/server'

import { forwardToLocalWorker, renderAndUploadDiagnosis } from '../_lib/automation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.json()
  const notionName = String(body.notionName || '').trim()
  const storeName = String(body.storeName || notionName || '').trim()
  const googleMapUrl = String(body.googleMapUrl || '').trim()

  if (!storeName || !googleMapUrl) {
    return NextResponse.json({ ok: false, message: '매장명과 구글맵 링크가 필요합니다.' }, { status: 400 })
  }

  try {
    const workerResult = await forwardToLocalWorker('diagnosis', {
      notionName: notionName || storeName,
      storeName,
      googleMapUrl,
    })
    if (workerResult) {
      return NextResponse.json({
        ok: true,
        mode: 'local-worker',
        message: workerResult.message || `${storeName} 진단자료 생성을 로컬 워커에 요청했습니다.`,
        worker: workerResult,
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        mode: 'local-worker',
        message: error instanceof Error ? error.message : '로컬 진단자료 워커 호출 중 오류가 발생했습니다.',
      },
      { status: 502 }
    )
  }

  if (process.env.ERP_ENABLE_LOCAL_SKILLS !== 'true') {
    return NextResponse.json({
      ok: false,
      message:
        '진단자료 생성 버튼은 준비되었습니다. 배포 ERP에서 실행하려면 ERP_ACTION_WORKER_WEBHOOK_URL 또는 DIAGNOSIS_WORKER_WEBHOOK_URL로 로컬 워커를 연결해야 합니다.',
    })
  }

  try {
    const result = await renderAndUploadDiagnosis({ notionName: notionName || storeName, storeName, googleMapUrl })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : '진단자료 자동화 실행 중 오류가 발생했습니다.',
      },
      { status: 500 }
    )
  }
}
