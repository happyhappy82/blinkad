import { Client } from '@notionhq/client'
import { execFileSync } from 'child_process'
import { randomUUID } from 'crypto'
import { readFileSync, unlinkSync, writeFileSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import { tmpdir } from 'os'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DISPLAY_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'])

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

async function downloadFile(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`명함 이미지를 다운로드하지 못했습니다. (${response.status})`)

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type')?.split(';')[0]?.toLowerCase() || '',
  }
}

function normalizeDisplayImage(buffer: Buffer, fileName: string, contentType: string) {
  const detectedContentType = contentTypeFromFile(fileName, contentType)
  if (DISPLAY_IMAGE_TYPES.has(detectedContentType)) {
    return { buffer, contentType: detectedContentType === 'image/jpg' ? 'image/jpeg' : detectedContentType }
  }

  if (detectedContentType === 'image/heic' || detectedContentType === 'image/heif') {
    return { buffer: convertHeicToJpeg(buffer), contentType: 'image/jpeg' }
  }

  throw new Error('표시할 수 없는 명함 이미지 형식입니다.')
}

export async function GET(request: NextRequest) {
  const token = resolveNotionToken()
  const pageId = request.nextUrl.searchParams.get('pageId')?.trim() || ''

  if (!token || !pageId) {
    return NextResponse.json({ message: 'Notion 토큰과 명함 페이지 ID가 필요합니다.' }, { status: 400 })
  }

  try {
    const notion = new Client({ auth: token })
    const page = await notion.pages.retrieve({ page_id: pageId })
    const properties = (page as any).properties || {}
    const file = firstFile(findProperty(properties, ['명함 사진', '명함', '사진', 'Business Card']))

    if (!file.url) {
      return NextResponse.json({ message: '표시할 명함 이미지가 없습니다.' }, { status: 404 })
    }

    const downloaded = await downloadFile(file.url)
    const image = normalizeDisplayImage(downloaded.buffer, file.name, file.contentType || downloaded.contentType)

    return new NextResponse(new Uint8Array(image.buffer), {
      headers: {
        'Content-Type': image.contentType,
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : '명함 이미지를 표시하지 못했습니다.' },
      { status: 500 }
    )
  }
}
