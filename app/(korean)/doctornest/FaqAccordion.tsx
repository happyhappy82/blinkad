'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Pause, Play } from 'lucide-react';
import type { Faq } from './faqData';

// 자주 묻는 질문 — 하나를 열면 그 질문의 데모 화면 영상이 소리 없이 재생되고(닫으면 멈춤), 영상 아래에 장면 설명 · 답 · 근거가 나온다.
// 한 번에 하나만 열린다. 휴대폰 폭(640px 이하)에서는 화면을 잘라 키운 세로 영상(4:5)을 쓴다.
// 영상 주소는 열 때만 붙여서, 페이지를 처음 열 때 영상을 내려받지 않는다.

const PHONE = '(max-width: 640px)';

function FaqVideo({ faq, open }: { faq: Faq; open: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [phone, setPhone] = useState(false);
  const [cap, setCap] = useState('');
  const [paused, setPaused] = useState(false);
  const v = faq.video!;

  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      const src = phone ? v.phone : v.desk;
      if (el.getAttribute('src') !== src) { el.setAttribute('src', src); el.load(); }
      el.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      el.pause();
    }
  }, [open, phone, v.phone, v.desk]);

  const onTime = () => {
    const el = ref.current;
    if (!el) return;
    let text = '';
    for (const [t, s] of v.captions) { if (t <= el.currentTime + 0.05) text = s; else break; } // 빈 자막 = 화면 옮기는 중(앞 설명을 남겨 두면 다른 화면에 붙어 보인다)
    setCap(text);
  };
  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().then(() => setPaused(false)).catch(() => setPaused(true));
    else { el.pause(); setPaused(true); }
  };

  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10 bg-gray-950">
      <div className="relative">
        <video
          ref={ref}
          muted
          playsInline
          loop
          preload="none"
          poster={phone ? v.phonePoster : v.deskPoster}
          onTimeUpdate={onTime}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onClick={toggle}
          className={`block w-full cursor-pointer bg-black ${phone ? 'aspect-[4/5]' : 'aspect-video'}`}
          aria-label={`${faq.q} — 닥터네스트 데모 화면 영상(소리 없음)`}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/85"
        >
          {paused ? <Play className="h-3.5 w-3.5" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5" aria-hidden="true" />}
          {paused ? '재생' : '일시정지'}
        </button>
      </div>
      <figcaption className="min-h-[3.25rem] border-t border-white/10 px-4 py-3 text-[0.95rem] font-medium leading-snug text-white keep-all sm:text-base">
        {cap || <span className="text-gray-500">…</span>}
      </figcaption>
    </figure>
  );
}

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const toggle = (id: string) => {
    setOpenId(cur => {
      const next = cur === id ? null : id;
      if (next) {
        // 열린 질문이 화면 위로 오게(닫힌 위 질문 때문에 밀리는 것 보정)
        requestAnimationFrame(() => {
          const el = document.getElementById(`faq-${next}`);
          if (el && el.getBoundingClientRect().top < 64) el.scrollIntoView({ block: 'start', behavior: 'smooth' });
        });
      }
      return next;
    });
  };

  return (
    <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.02]">
      {faqs.map((f, i) => {
        const open = openId === f.id;
        return (
          <div key={f.id} id={`faq-${f.id}`} className="scroll-mt-20">
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`faq-panel-${f.id}`}
                onClick={() => toggle(f.id)}
                className={`flex w-full items-start gap-3 px-4 py-5 text-left transition-colors sm:px-6 ${open ? 'bg-brand-blue/10' : 'hover:bg-white/[0.04]'}`}
              >
                <span className="mt-0.5 shrink-0 text-sm font-bold text-blue-400">Q{i + 1}</span>
                <span className="flex-1 text-[1.05rem] font-semibold leading-snug text-white keep-all sm:text-lg">{f.q}</span>
                <span className="mt-0.5 flex shrink-0 items-center gap-2">
                  {f.video && <span className="hidden rounded-full border border-white/15 px-2 py-0.5 text-[0.7rem] text-gray-400 sm:inline">영상</span>}
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                </span>
              </button>
            </h3>
            <div id={`faq-panel-${f.id}`} role="region" aria-label={f.q} hidden={!open} className="px-4 pb-6 sm:px-6">
              {f.video && <FaqVideo faq={f} open={open} />}
              <div className={f.video ? 'mt-5' : 'mt-1'}>
                {f.big && <p className="text-2xl font-bold text-white keep-all sm:text-3xl">{f.big}</p>}
                {f.answer.map((a, k) => (
                  <p key={k} className="mt-3 leading-relaxed text-gray-200 keep-all first:mt-0">{a}</p>
                ))}
                {f.fine && (
                  <p className="mt-3 text-sm leading-relaxed text-gray-400 keep-all">
                    {f.fine.map((line, k) => <span key={k} className="block">{line}</span>)}
                  </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-gray-500 keep-all">근거: {f.source}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
