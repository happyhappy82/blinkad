import { spawn } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

export type AutomationAction = 'quote' | 'diagnosis'

type WorkerPayload = {
  notionName: string
  storeName: string
  googleMapUrl?: string
}

const actionWebhookEnv: Record<AutomationAction, string> = {
  quote: 'QUOTE_WORKER_WEBHOOK_URL',
  diagnosis: 'DIAGNOSIS_WORKER_WEBHOOK_URL',
}

const actionSecretEnv: Record<AutomationAction, string> = {
  quote: 'QUOTE_WORKER_SECRET',
  diagnosis: 'DIAGNOSIS_WORKER_SECRET',
}

export function runProcess(command: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
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

export function parseJsonOutput(stdout: string) {
  const start = stdout.indexOf('{')
  const end = stdout.lastIndexOf('}')
  if (start < 0 || end < 0) return null
  return JSON.parse(stdout.slice(start, end + 1))
}

export function resolveProjectRoot() {
  return path.resolve(process.cwd(), '../..')
}

function appendActionPath(baseUrl: string, action: AutomationAction) {
  const url = new URL(baseUrl)
  url.pathname = `${url.pathname.replace(/\/$/, '')}/${action}`
  return url.toString()
}

function resolveWorkerUrl(action: AutomationAction) {
  const actionUrl = process.env[actionWebhookEnv[action]]?.trim()
  if (actionUrl) return actionUrl

  const baseUrl = process.env.ERP_ACTION_WORKER_WEBHOOK_URL?.trim()
  return baseUrl ? appendActionPath(baseUrl, action) : ''
}

function resolveWorkerSecret(action: AutomationAction) {
  return (
    process.env.ERP_ACTION_WORKER_SECRET?.trim() ||
    process.env[actionSecretEnv[action]]?.trim() ||
    process.env.QUOTE_WORKER_SECRET?.trim() ||
    ''
  )
}

export async function forwardToLocalWorker(action: AutomationAction, payload: WorkerPayload) {
  const workerUrl = resolveWorkerUrl(action)
  if (!workerUrl) return null

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const workerSecret = resolveWorkerSecret(action)
  if (workerSecret) {
    headers.Authorization = `Bearer ${workerSecret}`
  }

  const response = await fetch(workerUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...payload,
      action,
      source: 'blinkad-erp',
      requestedAt: new Date().toISOString(),
    }),
    cache: 'no-store',
  })
  const text = await response.text()
  const data = text ? parseJsonOutput(text) : null

  if (!response.ok) {
    throw new Error(data?.message || text || '로컬 ERP 액션 워커 호출에 실패했습니다.')
  }

  return data || { ok: true }
}

export async function renderAndUploadQuote(payload: Pick<WorkerPayload, 'notionName' | 'storeName'>) {
  const projectRoot = resolveProjectRoot()
  const renderScript = path.join(projectRoot, '.codex/skills/blinkad-quote-1month/scripts/render_1month_quote.py')
  const uploadScript = path.join(projectRoot, '.codex/skills/blinkad-quote/scripts/upload_quote_to_notion.py')

  if (!existsSync(renderScript) || !existsSync(uploadScript)) {
    throw new Error('로컬 Codex 견적서 스킬 스크립트를 찾지 못했습니다.')
  }

  const rendered = await runProcess('python3', [renderScript, '--store-name', payload.storeName, '--project-root', projectRoot], projectRoot)
  const renderResult = parseJsonOutput(rendered.stdout)
  const pdfPath = renderResult?.pdf

  if (!pdfPath) {
    throw new Error('견적서 PDF 경로를 확인하지 못했습니다.')
  }

  const uploaded = await runProcess(
    'python3',
    [uploadScript, '--notion-name', payload.notionName || payload.storeName, '--pdf', pdfPath],
    projectRoot
  )
  const uploadResult = parseJsonOutput(uploaded.stdout)

  return {
    ok: true,
    message: `${payload.storeName} 견적서를 생성하고 Notion 견적서 열에 저장했습니다.`,
    pdf: pdfPath,
    upload: uploadResult,
  }
}

export async function renderAndUploadDiagnosis(payload: Required<Pick<WorkerPayload, 'notionName' | 'storeName' | 'googleMapUrl'>>) {
  const projectRoot = resolveProjectRoot()
  const diagnosisScript = path.join(projectRoot, '.codex/skills/blinkad-gbp-diagnosis/scripts/create_gbp_diagnosis.py')
  const uploadScript = path.join(projectRoot, '.codex/skills/blinkad-quote/scripts/upload_quote_to_notion.py')

  if (!existsSync(diagnosisScript) || !existsSync(uploadScript)) {
    throw new Error('로컬 Codex 진단자료 스킬 스크립트를 찾지 못했습니다.')
  }

  const rendered = await runProcess(
    'python3',
    [diagnosisScript, '--format', 'pdf', '--store-name', payload.storeName, payload.googleMapUrl],
    projectRoot
  )
  const renderResult = parseJsonOutput(rendered.stdout)
  const pdfPath = renderResult?.pdf

  if (!pdfPath) {
    throw new Error('진단자료 PDF 경로를 확인하지 못했습니다.')
  }

  const uploaded = await runProcess(
    'python3',
    [uploadScript, '--notion-name', payload.notionName || payload.storeName, '--pdf', pdfPath, '--file-property', '분석자료'],
    projectRoot
  )
  const uploadResult = parseJsonOutput(uploaded.stdout)

  return {
    ok: true,
    message: `${payload.storeName} 진단자료를 생성하고 Notion 분석자료 열에 저장했습니다.`,
    pdf: pdfPath,
    upload: uploadResult,
  }
}
