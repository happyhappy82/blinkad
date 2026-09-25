import 'server-only'

const REVIEW_PORTAL_ORIGIN = (
  process.env.BLINKAD_REVIEW_PORTAL_ORIGIN || 'https://review.blinkad.kr'
).replace(/\/$/, '')

type IntakeStoreResponse = {
  store?: {
    id?: string
    name?: string
  }
}

export async function resolvePortalIntakeStore(storeKey: string, accessToken: string) {
  if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(storeKey) || !/^[a-f0-9]{64}$/.test(accessToken)) {
    return null
  }

  const response = await fetch(`${REVIEW_PORTAL_ORIGIN}/api/client-intake-link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storeId: storeKey, token: accessToken }),
    cache: 'no-store',
  })

  if (response.status === 401 || response.status === 404) return null
  if (!response.ok) throw new Error('Client intake store resolver is unavailable.')

  const result = (await response.json()) as IntakeStoreResponse
  if (result.store?.id !== storeKey || !result.store.name?.trim()) return null

  return { id: storeKey, name: result.store.name.trim() }
}
