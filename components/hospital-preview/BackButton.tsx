'use client'

import { useRouter } from 'next/navigation'
import { PREVIEW_ROOT } from './content'

export default function BackButton() {
  const router = useRouter()
  return <button type="button" className="hp-back" onClick={() => {
    if (!document.referrer.startsWith(window.location.origin + PREVIEW_ROOT) || window.history.length <= 1) {
      router.push(PREVIEW_ROOT)
      return
    }
    if (window.location.hash) window.location.assign(document.referrer)
    else router.back()
  }}><span aria-hidden="true">←</span> 뒤로가기</button>
}
