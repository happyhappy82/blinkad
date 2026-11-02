'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize2, Pause, Play } from 'lucide-react';

// 데모 화면 녹화 영상. 화면에 보일 때만 내려받아 소리 없이 반복 재생하고, 벗어나면 멈춘다.
// 휴대폰에서는 글씨가 작으므로 「크게 보기」로 전체 화면(가로)을 연다.
export default function CaseVideo({ src, poster, label, seconds, steps }: { src: string; poster: string; label: string; seconds: number; steps: readonly string[] }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(true);
  const inView = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting && !reduce;
      if (entry.isIntersecting) {
        setActive(true);
        if (inView.current && video.currentSrc) video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }, { threshold: 0.4 });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  // 처음 화면에 들어와 주소가 붙은 직후 재생을 시작한다.
  useEffect(() => {
    if (active && inView.current) ref.current?.play().catch(() => undefined);
  }, [active]);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    setActive(true);
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  }

  async function enlarge() {
    const video = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!video) return;
    setActive(true);
    try {
      if (video.requestFullscreen) {
        await video.requestFullscreen();
        const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
        await orientation?.lock?.('landscape').catch(() => undefined);
      } else {
        video.webkitEnterFullscreen?.();
      }
    } catch {
      video.webkitEnterFullscreen?.();
    }
    video.play().catch(() => undefined);
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gray-900">
        <video
          ref={ref}
          src={active ? src : undefined}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onClick={toggle}
          className="block aspect-video w-full cursor-pointer object-cover"
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button type="button" onClick={toggle} className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-gray-200 hover:bg-white/10" aria-label={paused ? '영상 재생' : '영상 멈춤'}>
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          {paused ? '재생' : '멈춤'} · {Math.round(seconds)}초 · 소리 없음
        </button>
        <button type="button" onClick={enlarge} className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-3 py-2 text-xs font-semibold text-white hover:brightness-110">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />크게 보기
        </button>
      </div>
      <details className="group mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-gray-200 [&::-webkit-details-marker]:hidden">
          영상 속 장면 순서 {steps.length}개 <span className="text-gray-500 group-open:hidden">· 펼치기</span>
        </summary>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-gray-300 keep-all">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] text-gray-300">{i + 1}</span><span>{s}</span></li>
          ))}
        </ol>
      </details>
    </div>
  );
}
