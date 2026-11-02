import { NextRequest, NextResponse } from 'next/server'

// 홈페이지 문의 폼(문의하기 · 무료 진단 · 네스트 제품 문의) → 노션 「통합 문의 관리 DB」에 바로 적는다.
// 2026-11-02 메이크(Make.com) 웹훅을 걷어내고 이 창구로 바꿨다.
// 폼이 보내는 JSON 은 메이크 시절과 같다 — 폼 쪽은 주소만 바뀌었다.
// 노션 저장이 실패하면 칸을 줄여 한 번 더 시도하고, 그래도 안 되면 텔레그램으로 원문을 보낸다(문의를 잃지 않기 위해).

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const NOTION_VERSION = '2022-06-28'
const DEFAULT_DATABASE_ID = '18f45111-0c99-45d9-97de-4ce4fd86d074' // 통합 문의 관리 DB
const MAX_REQUEST_LENGTH = 60_000
const TEXT_CHUNK = 2_000 // 노션 글 조각 하나의 최대 길이
const MAX_TEXT = 20_000

type Payload = Record<string, unknown>

const FORM_NAMES: Record<string, string> = {
  contact_form: '문의하기',
  diagnosis_modal: '무료 진단',
  blog_cta: '블로그 무료 진단',
  nest_product_inquiry: '네스트 제품 문의',
}

// 폼이 「사업 구분」을 직접 정해 보낼 때만 쓰는 목록(지금은 /doctornest 사용 사례 페이지만 business_type 을 보낸다).
// 목록에 없는 값이거나 칸이 없으면 예전처럼 구글SEO — 기존 폼은 이 칸을 보내지 않으므로 그대로다.
// 닥터네스트로 들어간 줄은 /제안서 문의 자동 실행(inquiry_autoproposal.py)이 건너뛴다.
const BUSINESS_TYPES = new Map<string, string>([
  ['doctornest', '닥터네스트'],
])

function str(value: unknown, max = MAX_TEXT): string {
  if (typeof value === 'string') return value.trim().slice(0, max)
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function richText(value: string) {
  const text = value.slice(0, MAX_TEXT)
  const chunks: Array<{ type: 'text'; text: { content: string } }> = []
  for (let i = 0; i < text.length; i += TEXT_CHUNK) {
    chunks.push({ type: 'text', text: { content: text.slice(i, i + TEXT_CHUNK) } })
  }
  return chunks
}

function url(value: unknown): string | null {
  const v = str(value, 2_000)
  return /^https?:\/\/\S+$/i.test(v) ? v : null
}

function email(value: unknown): string | null {
  const v = str(value, 200)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null
}

function kstNow(): string {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return kst.toISOString().replace('Z', '+09:00')
}

function customerName(p: Payload): string {
  const company = str(p.company, 200)
  if (company) return company
  const person = str(p.name, 100)
  const business = str(p.business_name, 200)
  if (business) return person ? `${person}(${business})` : business
  return person || '(이름 없음)'
}

function formName(p: Payload): string {
  const source = str(p.source, 60) || (p.company !== undefined || p.email !== undefined ? 'contact_form' : '')
  return FORM_NAMES[source] || source || '홈페이지 폼'
}

function businessType(p: Payload): string {
  return BUSINESS_TYPES.get(str(p.business_type, 40)) ?? '구글SEO'
}

function buildProperties(p: Payload, receivedAt: string) {
  const props: Record<string, unknown> = {
    고객명: { title: richText(customerName(p).slice(0, 200)) },
    '사업 구분': { select: { name: businessType(p) } },
    처리상태: { status: { name: '신규 문의' } },
    접수일시: { date: { start: receivedAt } },
  }
  const text = (key: string, value: string) => {
    if (value) props[key] = { rich_text: richText(value) }
  }
  const link = (key: string, value: string | null) => {
    if (value) props[key] = { url: value }
  }

  text('담당자명', str(p.name, 100))
  text('내용', str(p.message))
  text('세션 경로', str(p.session_path, 2_000))
  text('UTM', str(p.utm, 500))
  text('CTA ID', str(p.cta_id, 200))
  text('메모', `홈페이지 ${formName(p)} 폼에서 바로 접수(메이크 없이)`)

  const phone = str(p.phone, 50)
  if (phone) props['연락처'] = { phone_number: phone }
  const mail = email(p.email)
  if (mail) props['이메일'] = { email: mail }

  link('첫 방문 페이지', url(p.landing_page))
  link('이전 페이지', url(p.referrer))
  link('유입 글/페이지', url(p.origin_page) || url(p.source_page))
  link('Clarity 영상', url(p.clarity_session_url))
  return props
}

// 칸 형식 오류로 막혔을 때 쓰는 최소판 — 받은 값을 전부 내용 칸에 글로 넣는다.
function minimalProperties(p: Payload, receivedAt: string, reason: string) {
  const dump = Object.entries(p)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join('\n')
  return {
    고객명: { title: richText(customerName(p).slice(0, 200)) },
    '사업 구분': { select: { name: businessType(p) } },
    처리상태: { status: { name: '신규 문의' } },
    접수일시: { date: { start: receivedAt } },
    내용: { rich_text: richText(dump) },
    메모: { rich_text: richText(`노션 칸 형식 오류로 최소판 저장 — ${reason}`.slice(0, 1_900)) },
  }
}

async function createPage(token: string, databaseId: string, properties: Record<string, unknown>) {
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
    signal: AbortSignal.timeout(15_000),
  })
  const body = await response.json().catch(() => ({}))
  return { ok: response.ok, status: response.status, body: body as { id?: unknown; url?: unknown; message?: string } }
}

// /doctornest(business_type=doctornest) 문의가 노션에 저장된 뒤 형님 텔레로 보내는 내부 알림.
// 닥터네스트 줄은 /제안서 자동 실행 장치가 알림 없이 건너뛰므로 여기서 따로 알린다. 다른 폼은 이 알림을 보내지 않는다.
// 알림이 실패해도(환경 변수 없음 · 텔레 오류 · 시간 초과) 문의 저장 결과는 그대로 둔다 — 이 함수는 예외를 밖으로 던지지 않는다.
async function notifyDoctorNestInquiry(p: Payload, receivedAt: string, page: { id?: unknown; url?: unknown }): Promise<void> {
  try {
    if (businessType(p) !== '닥터네스트') return
    const token = process.env.INQUIRY_TELEGRAM_BOT_TOKEN
    const chatId = process.env.INQUIRY_TELEGRAM_CHAT_ID
    if (!token || !chatId) {
      console.error('[inquiry] doctornest notice skipped: telegram env missing')
      return
    }
    const pageId = str(page.id, 100)
    const notionUrl = url(page.url) || (pageId ? `https://www.notion.so/${pageId.replace(/-/g, '')}` : '')
    const line = (label: string, value: string) => `${label}: ${value || '(없음)'}`
    const text = [
      '📥 닥터네스트 사용 사례 페이지 문의',
      line('상호', str(p.business_name, 200)),
      line('이름', str(p.name, 100)),
      line('전화', str(p.phone, 50)),
      line('이메일', str(p.email, 200)),
      line('운영 업종', str(p.industry, 100)),
      line('접수 시각', `${receivedAt.slice(0, 16).replace('T', ' ')} (KST)`),
      ...(notionUrl ? [line('노션', notionUrl)] : []),
    ].join('\n').slice(0, 4_000)
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      // 3초만 기다린다 — 폼 쪽 전체 대기(20초) 안에 노션 저장(최대 15초)과 함께 끝나게.
      signal: AbortSignal.timeout(3_000),
    })
    if (!response.ok) console.error('[inquiry] doctornest notice failed', response.status)
  } catch (error) {
    console.error('[inquiry] doctornest notice error', error instanceof Error ? error.message : String(error))
  }
}

async function telegramFallback(p: Payload, reason: string): Promise<boolean> {
  const token = process.env.INQUIRY_TELEGRAM_BOT_TOKEN
  const chatId = process.env.INQUIRY_TELEGRAM_CHAT_ID
  if (!token || !chatId) return false
  const lines = Object.entries(p)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
  const text = [`🚨 홈페이지 문의 — 노션 저장 실패(${reason.slice(0, 200)})`, '아래 원문을 노션에 옮겨 주세요.', '', ...lines]
    .join('\n')
    .slice(0, 4_000)
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const raw = await request.text()
  if (raw.length > MAX_REQUEST_LENGTH) {
    return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 })
  }
  let payload: Payload
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    payload = parsed as Payload
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 })
  }
  if (!str(payload.name) && !str(payload.company) && !str(payload.business_name)) {
    return NextResponse.json({ ok: false, error: 'missing_name' }, { status: 400 })
  }
  if (!str(payload.phone) && !str(payload.email)) {
    return NextResponse.json({ ok: false, error: 'missing_contact' }, { status: 400 })
  }

  const receivedAt = kstNow()
  const token = process.env.INQUIRY_NOTION_TOKEN || process.env.NOTION_TOKEN || process.env.NOTION_API_KEY
  const databaseId = process.env.INQUIRY_NOTION_DATABASE_ID || DEFAULT_DATABASE_ID

  let reason = 'notion_token_missing'
  if (token) {
    try {
      const first = await createPage(token, databaseId, buildProperties(payload, receivedAt))
      if (first.ok) {
        await notifyDoctorNestInquiry(payload, receivedAt, first.body)
        return NextResponse.json({ ok: true })
      }
      reason = `${first.status} ${first.body.message || ''}`.trim()
      console.error('[inquiry] notion create failed', reason)
      if (first.status === 400) {
        const second = await createPage(token, databaseId, minimalProperties(payload, receivedAt, reason))
        if (second.ok) {
          await notifyDoctorNestInquiry(payload, receivedAt, second.body)
          return NextResponse.json({ ok: true, minimal: true })
        }
        reason = `${second.status} ${second.body.message || ''}`.trim()
        console.error('[inquiry] notion minimal create failed', reason)
      }
    } catch (error) {
      reason = error instanceof Error ? error.message : String(error)
      console.error('[inquiry] notion request error', reason)
    }
  }

  // 노션에 못 넣었다 — 문의 원문을 텔레그램으로 보내 잃지 않게 한다.
  console.error('[inquiry] payload kept in log', JSON.stringify(payload).slice(0, 4_000))
  if (await telegramFallback(payload, reason)) {
    return NextResponse.json({ ok: true, fallback: 'telegram' })
  }
  return NextResponse.json({ ok: false, error: 'store_failed' }, { status: 502 })
}
