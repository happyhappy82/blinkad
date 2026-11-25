'use client'

import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'

const MEDIA_BASE = '/media/insights/peche-clinic-navigation'

export default function BlogClinicNavigationFigure() {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPlaying(!preference.matches)
    const onChange = () => setPlaying(!preference.matches)
    preference.addEventListener('change', onChange)
    return () => preference.removeEventListener('change', onChange)
  }, [])

  return (
    <figure id="clinic-navigation-demo" className="not-prose my-10 scroll-mt-28">
      <div className="overflow-hidden rounded-xl border border-white/15 bg-[#eeece9]">
        {/* Keep the reviewed GIF animated rather than optimizing it as a still. */}
        <img
          src={`${MEDIA_BASE}.${playing ? 'gif' : 'png'}`}
          alt="페슈의원 실제 홈페이지에서 전체 시술 메뉴를 확대해 선택하고 진료 목록으로 이동하는 화면 예시"
          width={960}
          height={540}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-gray-400">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1">
          <span>메인 메뉴에서 실제 시술 안내로 이어지는 화면 예시입니다.</span>
          <button
            type="button"
            onClick={() => setPlaying(current => !current)}
            aria-label={playing ? '사이트 예시 움직임 멈추기' : '사이트 예시 움직임 재생'}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-gray-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            {playing ? '움직임 멈추기' : '움직임 재생'}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          사이트 구성 예시 ·{' '}
          <a
            href="https://pecheskin.clinic/ko"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-gray-300"
          >
            페슈의원 공식 홈페이지
          </a>
          {' '}· 촬영 2026.11.25
        </p>
      </figcaption>
    </figure>
  )
}
