import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const blinkadRoot = path.resolve(__dirname, '..')
const projectRoot = process.env.CLAUDE_CODE_ROOT || path.resolve(blinkadRoot, '../..')
const port = Number(process.env.ERP_ACTION_WORKER_PORT || process.env.QUOTE_WORKER_PORT || 8787)
const host = process.env.ERP_ACTION_WORKER_HOST || process.env.QUOTE_WORKER_HOST || '127.0.0.1'
const workerSecret = process.env.ERP_ACTION_WORKER_SECRET || process.env.QUOTE_WORKER_SECRET || ''

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk.toString()
      if (body.length > 1024 * 1024) {
        reject(new Error('요청 본문이 너무 큽니다.'))
        request.destroy()
      }
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

function runProcess(command, args, cwd) {
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

function parseJsonOutput(stdout) {
  const start = stdout.indexOf('{')
  const end = stdout.lastIndexOf('}')
  if (start < 0 || end < 0) return null
  return JSON.parse(stdout.slice(start, end + 1))
}

async function renderAndUploadQuote({ notionName, storeName }) {
  const renderScript = path.join(projectRoot, '.codex/skills/blinkad-quote-1month/scripts/render_1month_quote.py')
  const uploadScript = path.join(projectRoot, '.codex/skills/blinkad-quote/scripts/upload_quote_to_notion.py')

  if (!existsSync(renderScript) || !existsSync(uploadScript)) {
    throw new Error('로컬 Codex 견적서 스킬 스크립트를 찾지 못했습니다.')
  }

  const rendered = await runProcess('python3', [renderScript, '--store-name', storeName, '--project-root', projectRoot], projectRoot)
  const renderResult = parseJsonOutput(rendered.stdout)
  const pdfPath = renderResult?.pdf

  if (!pdfPath) {
    throw new Error('견적서 PDF 경로를 확인하지 못했습니다.')
  }

  const uploaded = await runProcess('python3', [uploadScript, '--notion-name', notionName || storeName, '--pdf', pdfPath], projectRoot)
  const uploadResult = parseJsonOutput(uploaded.stdout)

  return {
    ok: true,
    action: 'quote',
    message: `${storeName} 견적서를 생성하고 Notion 견적서 열에 저장했습니다.`,
    pdf: pdfPath,
    upload: uploadResult,
  }
}

async function renderAndUploadDiagnosis({ notionName, storeName, googleMapUrl }) {
  const diagnosisScript = path.join(projectRoot, '.codex/skills/blinkad-gbp-diagnosis/scripts/create_gbp_diagnosis.py')
  const uploadScript = path.join(projectRoot, '.codex/skills/blinkad-quote/scripts/upload_quote_to_notion.py')

  if (!existsSync(diagnosisScript) || !existsSync(uploadScript)) {
    throw new Error('로컬 Codex 진단자료 스킬 스크립트를 찾지 못했습니다.')
  }

  const rendered = await runProcess(
    'python3',
    [diagnosisScript, '--format', 'pdf', '--store-name', storeName, googleMapUrl],
    projectRoot
  )
  const renderResult = parseJsonOutput(rendered.stdout)
  const pdfPath = renderResult?.pdf

  if (!pdfPath) {
    throw new Error('진단자료 PDF 경로를 확인하지 못했습니다.')
  }

  const uploaded = await runProcess(
    'python3',
    [uploadScript, '--notion-name', notionName || storeName, '--pdf', pdfPath, '--file-property', '분석자료'],
    projectRoot
  )
  const uploadResult = parseJsonOutput(uploaded.stdout)

  return {
    ok: true,
    action: 'diagnosis',
    message: `${storeName} 진단자료를 생성하고 Notion 분석자료 열에 저장했습니다.`,
    pdf: pdfPath,
    upload: uploadResult,
  }
}

async function readJsonBody(request) {
  const rawBody = await readRequestBody(request)
  return rawBody ? JSON.parse(rawBody) : {}
}

async function handleQuote(request, response) {
  const body = await readJsonBody(request)
  const notionName = String(body.notionName || '').trim()
  const storeName = String(body.storeName || notionName || '').trim()

  if (!storeName) {
    sendJson(response, 400, { ok: false, message: '매장명이 필요합니다.' })
    return
  }

  const result = await renderAndUploadQuote({ notionName: notionName || storeName, storeName })
  sendJson(response, 200, result)
}

async function handleDiagnosis(request, response) {
  const body = await readJsonBody(request)
  const notionName = String(body.notionName || '').trim()
  const storeName = String(body.storeName || notionName || '').trim()
  const googleMapUrl = String(body.googleMapUrl || '').trim()

  if (!storeName || !googleMapUrl) {
    sendJson(response, 400, { ok: false, message: '매장명과 구글맵 링크가 필요합니다.' })
    return
  }

  const result = await renderAndUploadDiagnosis({ notionName: notionName || storeName, storeName, googleMapUrl })
  sendJson(response, 200, result)
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${host}:${port}`)

  if (request.method === 'GET' && requestUrl.pathname === '/health') {
    sendJson(response, 200, {
      ok: true,
      service: 'blinkad-erp-action-worker',
      actions: ['quote', 'diagnosis'],
    })
    return
  }

  if (request.method !== 'POST') {
    sendJson(response, 404, { ok: false, message: 'POST /quote 또는 POST /diagnosis endpoint만 지원합니다.' })
    return
  }

  if (workerSecret) {
    const auth = request.headers.authorization || ''
    if (auth !== `Bearer ${workerSecret}`) {
      sendJson(response, 401, { ok: false, message: '로컬 워커 인증에 실패했습니다.' })
      return
    }
  }

  try {
    if (requestUrl.pathname === '/quote') {
      await handleQuote(request, response)
      return
    }

    if (requestUrl.pathname === '/diagnosis') {
      await handleDiagnosis(request, response)
      return
    }

    sendJson(response, 404, { ok: false, message: 'POST /quote 또는 POST /diagnosis endpoint만 지원합니다.' })
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      message: error instanceof Error ? error.message : 'ERP 액션 워커 실행 중 오류가 발생했습니다.',
    })
  }
})

server.listen(port, host, () => {
  console.log(`BlinkAd ERP action worker listening on http://${host}:${port}`)
})
