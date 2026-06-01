import { NextResponse } from 'next/server'
import {
  calendarTokenStoreStatus,
  clearCalendarAccountToken,
  getCalendarAuth,
  publicCalendarAccount,
  readCalendarAccounts,
} from '@/lib/erp-google-calendar-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const initialAccounts = await readCalendarAccounts()
  await Promise.all(
    initialAccounts.map(async (account) => {
      if (!account.refreshToken || (account.accessToken && account.expiresAt && account.expiresAt > Date.now() + 60_000)) {
        return
      }
      await getCalendarAuth(account.memberId).catch(() => null)
    })
  )

  const accounts = await readCalendarAccounts()
  const storage = calendarTokenStoreStatus()
  const publicAccounts = accounts.map(publicCalendarAccount)

  return NextResponse.json({
    connected: publicAccounts.some((account) => account.connected),
    storage,
    message: storage.message,
    accounts: publicAccounts,
  })
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { memberId?: string }

  if (!body.memberId) {
    return NextResponse.json(
      {
        connected: false,
        message: '연동을 해제할 팀원 ID가 필요합니다.',
      },
      { status: 400 }
    )
  }

  await clearCalendarAccountToken(body.memberId)

  return NextResponse.json({
    connected: true,
    message: 'Google Calendar 연동을 해제했습니다.',
  })
}
