'use client'

import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'

const MEDIA_BASE = '/media/insights/dermatology-language-switch'

export default function BlogLanguageSwitchFigure() {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPlaying(!preference.matches)
    const onChange = () => setPlaying(!preference.matches)
    preference.addEventListener('change', onChange)
    return () => preference.removeEventListener('change', onChange)
  }, [])

  return (
    <figure id="language-switch-demo" className="not-prose my-10 scroll-mt-28">
      <div className="overflow-hidden rounded-xl border border-white/15 bg-[#eae7e1]">
        {/* Preserve the reviewed GIF's animation instead of optimizing it as a still. */}
        <img
          src={`${MEDIA_BASE}.${playing ? 'gif' : 'png'}`}
          alt="가상 피부과 홈페이지에서 언어 메뉴를 확대하고 English를 선택해 같은 구성의 영어 화면으로 전환하는 예시"
          width={960}
          height={540}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-gray-400">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1">
          <span>같은 디자인에서 한국어 안내를 영어로 바꾼 예시입니다.</span>
          <button
            type="button"
            onClick={() => setPlaying(current => !current)}
            aria-label={playing ? '언어 전환 예시 움직임 멈추기' : '언어 전환 예시 움직임 재생'}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-gray-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            {playing ? '움직임 멈추기' : '움직임 재생'}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          가상 피부과 홈페이지 예시 · 사진{' '}
          <a
            href="https://unsplash.com/photos/woman-lying-on-blue-towel-with-white-cream-on-face-g-m8EDc4X6Q"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-gray-300"
          >
            engin akyurt / Unsplash
          </a>
        </p>
      </figcaption>
    </figure>
  )
}
