import type { Metadata } from 'next'

import StoreIntakeLoader from '../StoreIntakeLoader'
import { getClientIntakeStoreName } from '../stores'

type StorePageProps = {
  params: Promise<{ storeKey: string }>
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { storeKey } = await params
  const storeName = getClientIntakeStoreName(storeKey)

  return {
    title: `${storeName || '매장 전용'} AEO·GEO 콘텐츠 자료 입력 | BlinkAd`,
    description: `${storeName || '클라이언트'} 전용 AEO·GEO 콘텐츠 자료 입력 페이지입니다.`,
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

  return <StoreIntakeLoader storeKey={storeKey} legacyStoreName={storeName} />
}
