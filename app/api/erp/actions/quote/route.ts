import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function runProcess(command: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, shell: false })
    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        reject(new Error(stderr || `${command} exited with code ${code}`))
      }
    })
  })
}

function parseJsonOutput(stdout: string) {
  const start = stdout.indexOf('{')
  const end = stdout.lastIndexOf('}')
  if (start < 0 || end < 0) return null
  return JSON.parse(stdout.slice(start, end + 1))
}

async function forwardToLocalWorker(payload: { notionName: string; storeName: string }) {
  const workerUrl = process.env.QUOTE_WORKER_WEBHOOK_URL?.trim()
  if (!workerUrl) return null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const workerSecret = process.env.QUOTE_WORKER_SECRET?.trim()
  if (workerSecret) {
    headers.Authorization = `Bearer ${workerSecret}`
  }

  const response = await fetch(workerUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...payload,
      source: 'blinkad-erp',
      requestedAt: new Date().toISOString(),
    }),
    cache: 'no-store',
  })
  const text = await response.text()
  const data = text ? parseJsonOutput(text) : null

  if (!response.ok) {
    throw new Error(data?.message || text || '로컬 견적서 워커 호출에 실패했습니다.')
  }

  return data || { ok: true }
}

export async function POST(request: Request) {
  const body = await request.json()
  const notionName = String(body.notionName || '').trim()
  const storeName = String(body.storeName || notionName || '').trim()

  if (!storeName) {
    return NextResponse.json({ ok: false, message: '매장명이 필요합니다.' }, { status: 400 })
  }

  try {
    const workerResult = await forwardToLocalWorker({ notionName: notionName || storeName, storeName })
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
        '견적서 생성 버튼은 준비되었습니다. 배포 ERP에서 실행하려면 QUOTE_WORKER_WEBHOOK_URL로 로컬 워커를 연결하거나, 로컬 서버에서 ERP_ENABLE_LOCAL_SKILLS=true를 설정해야 합니다.',
    })
  }

  try {
    const projectRoot = path.resolve(process.cwd(), '../..')
    const renderScript = path.join(projectRoot, '.codex/skills/blinkad-quote-1month/scripts/render_1month_quote.py')
    const uploadScript = path.join(projectRoot, '.codex/skills/blinkad-quote/scripts/upload_quote_to_notion.py')

    if (!existsSync(renderScript) || !existsSync(uploadScript)) {
      return NextResponse.json({
        ok: false,
        message: '로컬 Codex 견적서 스킬 스크립트를 찾지 못했습니다.',
      })
    }

    const rendered = await runProcess('python3', [renderScript, '--store-name', storeName, '--project-root', projectRoot], projectRoot)
    const renderResult = parseJsonOutput(rendered.stdout)
    const pdfPath = renderResult?.pdf

    if (!pdfPath) {
      return NextResponse.json({ ok: false, message: '견적서 PDF 경로를 확인하지 못했습니다.' }, { status: 500 })
    }

    const uploaded = await runProcess(
      'python3',
      [uploadScript, '--notion-name', notionName || storeName, '--pdf', pdfPath],
      projectRoot
    )
    const uploadResult = parseJsonOutput(uploaded.stdout)

    return NextResponse.json({
      ok: true,
      message: `${storeName} 견적서를 생성하고 Notion 견적서 열에 저장했습니다.`,
      pdf: pdfPath,
      upload: uploadResult,
    })
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
