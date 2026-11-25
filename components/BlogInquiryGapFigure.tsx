'use client'

import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'

const MEDIA_BASE = '/media/insights/inquiry-gap'

export default function BlogInquiryGapFigure() {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPlaying(!preference.matches)
    const onChange = () => setPlaying(!preference.matches)
    preference.addEventListener('change', onChange)
    return () => preference.removeEventListener('change', onChange)
  }, [])

  return (
    <figure id="inquiry-gap-demo" className="not-prose my-10 scroll-mt-28">
      <div className="overflow-hidden rounded-xl border border-white/15 bg-white">
        {/* Keep the native GIF; image optimization would remove its animation. */}
        <img
          src={`${MEDIA_BASE}.${playing ? 'gif' : 'png'}`}
          alt="검색, 프로필 확인, 문의 버튼을 지나 실제 문의 직전에서 멈추는 흐름도"
          width={768}
          height={432}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-1 text-sm leading-relaxed text-gray-400">
        <span>문의 버튼 클릭과 실제 접수는 별도로 확인합니다.</span>
        <button
          type="button"
          onClick={() => setPlaying(current => !current)}
          aria-label={playing ? '흐름도 움직임 멈추기' : '흐름도 움직임 재생'}
          className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-gray-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
          {playing ? '움직임 멈추기' : '움직임 재생'}
        </button>
      </figcaption>
    </figure>
  )
}
