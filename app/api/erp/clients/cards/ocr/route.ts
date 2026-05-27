import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { randomUUID } from 'crypto'
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { tmpdir } from 'os'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SUPPORTED_IMAGE_TYPES = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpeg'],
  ['image/jpg', 'jpeg'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

const FREE_OCR_PROVIDER = 'free'
const OPENAI_OCR_PROVIDER = 'openai'

type BusinessCardExtraction = {
  name: string
  phone: string
  email: string
  company: string
  title: string
  rawText: string
  confidence: number
  source: string
}

function propText(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title?.map((item: any) => item.plain_text).join('') || ''
  if (prop.type === 'rich_text') return prop.rich_text?.map((item: any) => item.plain_text).join('') || ''
  if (prop.type === 'select') return prop.select?.name || ''
  return ''
}

function findProperty(properties: Record<string, any>, candidates: string[]) {
  for (const name of candidates) {
    if (properties[name]) return properties[name]
  }

  const entries = Object.entries(properties)
  const match = entries.find(([name]) =>
    candidates.some((candidate) => name.toLowerCase().includes(candidate.toLowerCase()))
  )
  return match?.[1]
}

function firstFile(prop: any) {
  if (!prop || prop.type !== 'files') return { url: '', name: '', contentType: '' }
  const file = prop.files?.[0]
  if (!file) return { url: '', name: '', contentType: '' }

  return {
    url: file.type === 'external' ? file.external?.url || '' : file.file?.url || '',
    name: file.name || '',
    contentType: file.type === 'external' ? '' : file.file?.content_type || '',
  }
}

function resolveNotionToken() {
  const envToken = process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
  if (envToken) return envToken

  try {
    const projectRoot = path.resolve(process.cwd(), '../..')
    return execFileSync('python3', ['-c', 'from ops.notion_api import NOTION_TOKEN; print(NOTION_TOKEN)'], {
      cwd: projectRoot,
      encoding: 'utf-8',
      timeout: 5000,
    }).trim()
  } catch {
    return ''
  }
}

function richTextChunks(value: string) {
  const safeValue = value.trim()
  if (!safeValue) return []

  const chunks = safeValue.match(/[\s\S]{1,1900}/g) || []
  return chunks.map((content) => ({ text: { content } }))
}

function titleValue(value: string) {
  return [{ text: { content: value || '이름 확인 필요' } }]
}

function usefulExistingValue(value: string, placeholders: string[]) {
  const normalized = value.trim()
  if (!normalized) return ''
  if (placeholders.includes(normalized)) return ''
  return normalized
}

async function updateOcrState(notion: Client, pageId: string, ocrStatus: string, ocrText?: string) {
  await notion.pages.update({
    page_id: pageId,
    properties: {
      'OCR 상태': { select: { name: ocrStatus } },
      ...(ocrText !== undefined ? { 'OCR 원문': { rich_text: richTextChunks(ocrText) } } : {}),
    },
  })
}

async function downloadFile(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`명함 파일을 다운로드하지 못했습니다. (${response.status})`)

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type')?.split(';')[0]?.toLowerCase() || '',
  }
}

function contentTypeFromFile(name: string, contentType: string) {
  const lowerName = name.toLowerCase()
  if (contentType) return contentType
  if (lowerName.endsWith('.png')) return 'image/png'
  if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) return 'image/jpeg'
  if (lowerName.endsWith('.webp')) return 'image/webp'
  if (lowerName.endsWith('.gif')) return 'image/gif'
  if (lowerName.endsWith('.heic')) return 'image/heic'
  if (lowerName.endsWith('.heif')) return 'image/heif'
  return ''
}

function convertHeicToJpeg(buffer: Buffer) {
  const id = randomUUID()
  const inputPath = path.join(tmpdir(), `${id}.heic`)
  const outputPath = path.join(tmpdir(), `${id}.jpg`)

  try {
    writeFileSync(inputPath, buffer)
    execFileSync('sips', ['-s', 'format', 'jpeg', inputPath, '--out', outputPath], {
      encoding: 'utf-8',
      timeout: 15000,
    })

    return readFileSync(outputPath)
  } finally {
    try {
      unlinkSync(inputPath)
    } catch {}
    try {
      unlinkSync(outputPath)
    } catch {}
  }
}

function normalizeImage(buffer: Buffer, fileName: string, contentType: string) {
  const detectedContentType = contentTypeFromFile(fileName, contentType)
  if (SUPPORTED_IMAGE_TYPES.has(detectedContentType)) {
    return { buffer, contentType: detectedContentType }
  }

  if (detectedContentType === 'image/heic' || detectedContentType === 'image/heif') {
    return { buffer: convertHeicToJpeg(buffer), contentType: 'image/jpeg' }
  }

  throw new Error('PNG, JPG, WEBP, GIF, HEIC 형식의 명함 사진만 분석할 수 있습니다.')
}

function responseOutputText(response: any) {
  if (typeof response.output_text === 'string') return response.output_text

  return (response.output || [])
    .flatMap((item: any) => item.content || [])
    .map((content: any) => content.text || '')
    .filter(Boolean)
    .join('\n')
}

function parseJsonOutput(value: string) {
  const trimmed = value.trim()
  const match = trimmed.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('OCR 응답에서 JSON을 찾지 못했습니다.')
  return JSON.parse(match[0])
}

function formatPhoneNumber(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('82')) digits = `0${digits.slice(2)}`

  const mobileMatch = digits.match(/01[016789]\d{7,8}/)
  if (mobileMatch) digits = mobileMatch[0]

  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return value.trim()
}

function extractPhone(rawText: string) {
  const directMatch = rawText.match(/(?:\+?82[-.\s]?)?0?1[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/)
  if (directMatch) return formatPhoneNumber(directMatch[0])

  const compactMatch = rawText.replace(/\D/g, '').match(/01[016789]\d{7,8}/)
  return compactMatch ? formatPhoneNumber(compactMatch[0]) : ''
}

function extractEmail(rawText: string) {
  return rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || ''
}

function cleanOcrLine(line: string) {
  return line
    .replace(/[|[\]{}"'`~^*_+=<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isLikelyKoreanName(value: string) {
  const normalized = value.trim()
  const blocked = new Set([
    '대표',
    '서울',
    '주소',
    '전화',
    '연락처',
    '오늘',
    '시세',
    '정보',
    '명함',
    '미팅',
    '인스타',
  ])

  return /^[가-힣]{2,5}$/.test(normalized) && !blocked.has(normalized)
}

function extractName(rawText: string) {
  const lines = rawText
    .split(/\n+/)
    .map(cleanOcrLine)
    .filter(Boolean)

  const titleIndex = lines.findIndex((line) => /(대표|CEO|owner|manager)/i.test(line))
  if (titleIndex >= 0) {
    const sameLine = lines[titleIndex].replace(/대표|CEO|owner|manager/gi, '').trim()
    const sameLineCandidate = sameLine.match(/[가-힣]{2,5}/)?.[0]
    if (sameLineCandidate && isLikelyKoreanName(sameLineCandidate)) return sameLineCandidate

    for (const line of lines.slice(titleIndex + 1, titleIndex + 9)) {
      const candidates = line.match(/[가-힣]{2,5}/g) || []
      const name = candidates.find(isLikelyKoreanName)
      if (name) return name
    }
  }

  const fallbackCandidates = lines.flatMap((line) => line.match(/[가-힣]{2,5}/g) || [])
  return fallbackCandidates.find(isLikelyKoreanName) || ''
}

function extractCompany(rawText: string, name: string) {
  const lines = rawText
    .split(/\n+/)
    .map(cleanOcrLine)
    .filter(Boolean)

  const companyLine = lines.find((line) => {
    if (line === name) return false
    return /(주식회사|회사|법인|마케팅|광고|카페|식당|특별시|대게|스튜디오)/.test(line)
  })

  return companyLine || ''
}

function compactOcrText(rawText: string) {
  const seen = new Set<string>()
  const meaningfulLines = rawText
    .split(/\n+/)
    .map(cleanOcrLine)
    .filter((line) => {
      if (!line || seen.has(line)) return false
      seen.add(line)
      return /01[016789]|@|대표|서울|instagram|인스타|[가-힣]{2,}/i.test(line)
    })

  return meaningfulLines.slice(0, 40).join('\n')
}

async function analyzeWithFreeOcr(imageBuffer: Buffer): Promise<BusinessCardExtraction> {
  const { createWorker, PSM } = await import('tesseract.js')
  const cachePath = path.join(tmpdir(), 'blinkad-tesseract-cache')
  const workerPath = path.join(process.cwd(), 'node_modules/tesseract.js/src/worker-script/node/index.js')
  mkdirSync(cachePath, { recursive: true })

  const worker = await createWorker('kor+eng', undefined, { cachePath, workerPath })

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: '1',
    })

    const result = await worker.recognize(imageBuffer)
    const rawText = String(result.data.text || '').trim()
    const name = extractName(rawText)

    return {
      name,
      phone: extractPhone(rawText),
      email: extractEmail(rawText),
      company: extractCompany(rawText, name),
      title: rawText.includes('대표') ? '대표' : '',
      rawText,
      confidence: Number(((result.data.confidence || 0) / 100).toFixed(2)),
      source: FREE_OCR_PROVIDER,
    }
  } finally {
    await worker.terminate()
  }
}

async function analyzeWithOpenAI(imageBuffer: Buffer, contentType: string): Promise<BusinessCardExtraction> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY가 필요합니다.')

  const imageUrl = `data:${contentType};base64,${imageBuffer.toString('base64')}`
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CARD_OCR_MODEL || 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text:
                '명함 이미지를 읽고 연락처 정보를 추출하세요. 반드시 JSON만 반환하세요. 스키마: {"name":"", "phone":"", "email":"", "company":"", "title":"", "rawText":"", "confidence":0}. 모르면 빈 문자열로 두세요. phone에는 명함에서 가장 대표적인 전화번호 또는 휴대폰 번호 하나만 넣으세요.',
            },
            { type: 'input_image', image_url: imageUrl, detail: 'high' },
          ],
        },
      ],
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenAI OCR 분석에 실패했습니다.')
  }

  const result = parseJsonOutput(responseOutputText(data))

  return {
    name: String(result.name || '').trim(),
    phone: String(result.phone || '').trim(),
    email: String(result.email || '').trim(),
    company: String(result.company || '').trim(),
    title: String(result.title || '').trim(),
    rawText: String(result.rawText || '').trim(),
    confidence: Number(result.confidence || 0),
    source: OPENAI_OCR_PROVIDER,
  }
}

async function analyzeBusinessCard(imageBuffer: Buffer, contentType: string) {
  const provider = (process.env.BLINKAD_CARD_OCR_PROVIDER || FREE_OCR_PROVIDER).toLowerCase()

  if (provider === OPENAI_OCR_PROVIDER) {
    try {
      return await analyzeWithOpenAI(imageBuffer, contentType)
    } catch (error) {
      if (process.env.BLINKAD_CARD_OCR_ALLOW_FREE_FALLBACK === 'false') throw error

      const fallback = await analyzeWithFreeOcr(imageBuffer)
      const message = error instanceof Error ? error.message : 'OpenAI OCR 분석에 실패했습니다.'
      return {
        ...fallback,
        rawText: [`OpenAI 실패 후 무료 OCR로 대체했습니다: ${message}`, '', fallback.rawText].join('\n').trim(),
      }
    }
  }

  return analyzeWithFreeOcr(imageBuffer)
}

export async function POST(request: NextRequest) {
  const token = resolveNotionToken()
  const body = await request.json()
  const pageId = String(body.pageId || '').trim()

  if (!token || !pageId) {
    return NextResponse.json(
      { connected: false, message: 'Notion 토큰과 명함 페이지 ID가 필요합니다.' },
      { status: 400 }
    )
  }

  const notion = new Client({ auth: token })

  try {
    await updateOcrState(notion, pageId, '처리중')

    const page = await notion.pages.retrieve({ page_id: pageId })
    const properties = (page as any).properties || {}
    const file = firstFile(findProperty(properties, ['명함 사진', '명함', '사진', 'Business Card']))

    if (!file.url) throw new Error('분석할 명함 사진이 없습니다.')

    const downloaded = await downloadFile(file.url)
    const image = normalizeImage(downloaded.buffer, file.name, file.contentType || downloaded.contentType)
    const extracted = await analyzeBusinessCard(image.buffer, image.contentType)
    const currentName = propText(findProperty(properties, ['이름', '성명', 'Name']))
    const currentPhone = propText(findProperty(properties, ['연락처', '전화번호', 'Phone', 'Contact']))
    const existingName = usefulExistingValue(currentName, ['이름 없음', '이름 확인 필요'])
    const existingPhone = usefulExistingValue(currentPhone, ['연락처 미입력', '연락처 입력 필요'])
    const name = existingName || extracted.name || extracted.company || ''
    const phone = existingPhone || extracted.phone || extracted.email || ''
    const completed = Boolean(name && phone)
    const rawSummary = [
      `source: ${extracted.source}`,
      `extracted_name: ${extracted.name}`,
      `extracted_phone: ${extracted.phone}`,
      compactOcrText(extracted.rawText),
      '',
      `company: ${extracted.company}`,
      `title: ${extracted.title}`,
      `email: ${extracted.email}`,
      `confidence: ${extracted.confidence}`,
    ]
      .join('\n')
      .trim()

    await notion.pages.update({
      page_id: pageId,
      properties: {
        이름: { title: titleValue(name) },
        연락처: { rich_text: richTextChunks(phone) },
        상태: { select: { name: completed ? '완료' : '입력필요' } },
        'OCR 상태': { select: { name: completed ? '완료' : '검수필요' } },
        'OCR 원문': { rich_text: richTextChunks(rawSummary || JSON.stringify(extracted)) },
      },
    })

    return NextResponse.json({
      connected: true,
      message: completed ? '명함 분석을 완료했습니다.' : '명함을 분석했지만 검수가 필요합니다.',
      extracted,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : '명함 OCR 분석에 실패했습니다.'
    try {
      await updateOcrState(notion, pageId, '실패', message)
    } catch {}

    return NextResponse.json(
      {
        connected: false,
        message,
      },
      { status: 500 }
    )
  }
}
