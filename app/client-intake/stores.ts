export const CLIENT_INTAKE_STORES = {
  'jaruyaki-yongsanro': '자루야키 용산로',
  'judorak-euljiro': '주도락 을지로점',
  'badadang-haeundae-cheongsapo': '바다당 해운대 청사포',
  'yeongjong-central-dermatology': '영종센트럴피부과',
  'snu-eye': 'SNU안과',
  'readyyoung-pharmacy-hongdae': '레디영약국 홍대점',
} as const

export type ClientIntakeStoreKey = keyof typeof CLIENT_INTAKE_STORES

export function getClientIntakeStoreName(storeKey: string) {
  return CLIENT_INTAKE_STORES[storeKey as ClientIntakeStoreKey]
}
