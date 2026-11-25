'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const ARTICLE = '/blog/google-jidoeneun-naoneunde-mun-euiga-eobsdamyeon-eodibuteo-bolkka'

export default function LocalPreviewNavigation() {
  const goBack = () => {
    if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
      window.history.back()
    } else {
      window.location.assign('/blog')
    }
  }

  return (
    <nav aria-label="검토 화면 이동" className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/15 bg-black/95 px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 text-sm text-gray-200">
        <button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 hover:bg-white/10">
          <ArrowLeft size={16} aria-hidden="true" />뒤로가기
        </button>
        <Link href="/blog" className="inline-flex min-h-11 items-center rounded-md px-2 hover:bg-white/10">전체 글 / 목록</Link>
        <Link href={`${ARTICLE}#inquiry-gap-demo`} className="inline-flex min-h-11 items-center rounded-md px-2 text-blue-300 hover:bg-white/10">GIF 위치</Link>
      </div>
    </nav>
  )
}
