import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { randomUUID } from 'crypto'
import { readFileSync, unlinkSync, writeFileSync } from 'fs'
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

async function analyzeBusinessCard(imageBuffer: Buffer, contentType: string) {
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
  }
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
    const name = extracted.name || currentName || extracted.company || ''
    const phone = extracted.phone || currentPhone || extracted.email || ''
    const completed = Boolean(name && phone)
    const rawSummary = [
      extracted.rawText,
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
