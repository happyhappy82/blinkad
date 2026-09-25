import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import ClientIntakeForm from '../ClientIntakeForm'
import { CLIENT_INTAKE_STORES, getClientIntakeStoreName } from '../stores'

type StorePageProps = {
  params: Promise<{ storeKey: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(CLIENT_INTAKE_STORES).map((storeKey) => ({ storeKey }))
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { storeKey } = await params
  const storeName = getClientIntakeStoreName(storeKey)

  if (!storeName) return {}

  return {
    title: `${storeName} AEO·GEO 콘텐츠 자료 입력 | BlinkAd`,
    description: `${storeName} 전용 AEO·GEO 콘텐츠 자료 입력 페이지입니다.`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  }
}

export default async function ClientStoreIntakePage({ params }: StorePageProps) {
  const { storeKey } = await params
  const storeName = getClientIntakeStoreName(storeKey)

  if (!storeName) notFound()

  return <ClientIntakeForm lockedBusinessName={storeName} storeKey={storeKey} />
}
