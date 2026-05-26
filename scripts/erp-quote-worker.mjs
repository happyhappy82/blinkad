import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const blinkadRoot = path.resolve(__dirname, '..')
const projectRoot = process.env.CLAUDE_CODE_ROOT || path.resolve(blinkadRoot, '../..')
const port = Number(process.env.QUOTE_WORKER_PORT || 8787)
const host = process.env.QUOTE_WORKER_HOST || '127.0.0.1'
const workerSecret = process.env.QUOTE_WORKER_SECRET || ''

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
    message: `${storeName} 견적서를 생성하고 Notion 견적서 열에 저장했습니다.`,
    pdf: pdfPath,
    upload: uploadResult,
  }
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    sendJson(response, 200, { ok: true, service: 'blinkad-erp-quote-worker' })
    return
  }

  if (request.method !== 'POST' || request.url !== '/quote') {
    sendJson(response, 404, { ok: false, message: 'POST /quote endpoint만 지원합니다.' })
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
    const rawBody = await readRequestBody(request)
    const body = rawBody ? JSON.parse(rawBody) : {}
    const notionName = String(body.notionName || '').trim()
    const storeName = String(body.storeName || notionName || '').trim()

    if (!storeName) {
      sendJson(response, 400, { ok: false, message: '매장명이 필요합니다.' })
      return
    }

    const result = await renderAndUploadQuote({ notionName: notionName || storeName, storeName })
    sendJson(response, 200, result)
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      message: error instanceof Error ? error.message : '견적서 워커 실행 중 오류가 발생했습니다.',
    })
  }
})

server.listen(port, host, () => {
  console.log(`BlinkAd ERP quote worker listening on http://${host}:${port}`)
})
