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

export async function POST(request: Request) {
  const body = await request.json()
  const notionName = String(body.notionName || '').trim()
  const storeName = String(body.storeName || notionName || '').trim()
  const googleMapUrl = String(body.googleMapUrl || '').trim()

  if (!storeName || !googleMapUrl) {
    return NextResponse.json({ ok: false, message: '매장명과 구글맵 링크가 필요합니다.' }, { status: 400 })
  }

  if (process.env.ERP_ENABLE_LOCAL_SKILLS !== 'true') {
    return NextResponse.json({
      ok: false,
      message:
        '진단자료 생성 버튼은 준비되었습니다. 실제 Codex 스킬 실행은 서버 환경변수 ERP_ENABLE_LOCAL_SKILLS=true 설정 후 활성화됩니다.',
    })
  }

  try {
    const projectRoot = path.resolve(process.cwd(), '../..')
    const diagnosisScript = path.join(projectRoot, '.codex/skills/blinkad-gbp-diagnosis/scripts/create_gbp_diagnosis.py')
    const uploadScript = path.join(projectRoot, '.codex/skills/blinkad-quote/scripts/upload_quote_to_notion.py')

    if (!existsSync(diagnosisScript) || !existsSync(uploadScript)) {
      return NextResponse.json({
        ok: false,
        message: '로컬 Codex 진단자료 스킬 스크립트를 찾지 못했습니다.',
      })
    }

    const rendered = await runProcess(
      'python3',
      [diagnosisScript, '--format', 'pdf', '--store-name', storeName, googleMapUrl],
      projectRoot
    )
    const renderResult = parseJsonOutput(rendered.stdout)
    const pdfPath = renderResult?.pdf

    if (!pdfPath) {
      return NextResponse.json({ ok: false, message: '진단자료 PDF 경로를 확인하지 못했습니다.' }, { status: 500 })
    }

    const uploaded = await runProcess(
      'python3',
      [uploadScript, '--notion-name', notionName || storeName, '--pdf', pdfPath, '--file-property', '분석자료'],
      projectRoot
    )
    const uploadResult = parseJsonOutput(uploaded.stdout)

    return NextResponse.json({
      ok: true,
      message: `${storeName} 진단자료를 생성하고 Notion 분석자료 열에 저장했습니다.`,
      pdf: pdfPath,
      upload: uploadResult,
    })
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
