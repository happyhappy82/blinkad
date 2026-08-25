import { NextResponse } from 'next/server'

import { readSettlementSheet } from '@/lib/erp-settlement-sheets'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const result = await readSettlementSheet()
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
