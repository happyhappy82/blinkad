'use client';

import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

// 닥터네스트 데모 계정(doctornest.ai · 2026-09-29 녹화)의 인스타그램 방 대화 문구를 그대로 옮겨,
// 휴대폰 화면에서도 읽히는 크기로 다시 그린 것. 문구를 고치지 않는다.
const STEP_COUNT = 4;

export default function ChatReplay() {
  const box = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(STEP_COUNT);
      return;
    }
    let timers: number[] = [];
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      setShown(0);
      timers = [400, 1500, 2900, 4300].map((ms, i) => window.setTimeout(() => setShown(i + 1), ms));
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); timers.forEach(t => window.clearTimeout(t)); };
  }, [run]);

  const step = (n: number) => `transition-all duration-500 ${shown >= n ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`;

  return (
    <figure className="mx-auto w-full max-w-[420px]">
      <div ref={box} className="overflow-hidden rounded-[28px] border border-white/15 bg-[#f5f6f8] text-gray-900 shadow-2xl shadow-blue-900/30">
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
          <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-[11px] font-bold text-white">IG</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">인스타그램 문의 · 외국인 고객</p>
            <p className="text-xs text-gray-500">닥터네스트 고객채팅 화면</p>
          </div>
          <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] text-gray-600">운영시간 외</span>
        </div>

        <div className="space-y-3 px-3 py-4 text-[14px] leading-relaxed sm:px-4" aria-live="polite">
          <div className={step(1)}>
            <div className="max-w-[86%] rounded-2xl rounded-tl-md bg-white p-3 shadow-sm">
              <p>리프팅 효과가 궁금해요!</p>
              <div className="mt-2 rounded-lg bg-gray-50 px-2.5 py-2">
                <p className="text-[11px] text-gray-500">원문 · 영어</p>
                <p className="text-[13px] text-gray-700">I’m curious about the lifting effect!</p>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">고객이 영어로 물었고, 직원 화면에는 한국어로 보입니다</p>
          </div>

          <div className={step(2)}>
            <p className="mb-1 text-center text-[11px] font-semibold text-blue-700">운영시간 외 안내 · 자동</p>
            <div className="rounded-2xl bg-blue-50 p-3 text-[13px] text-blue-900">
              <p>현재는 병원 운영시간이 아닙니다.<br />현재 AI 챗봇과 상담중입니다.<br />상담원과의 채팅을 원하실 경우 성함과 연락처를 남겨주세요. 운영시간에 답변드리겠습니다.</p>
              <p className="mt-2 text-[12px] text-blue-800/80">Our clinic is currently closed. You are currently chatting with our AI chatbot. To chat with a staff member, please leave your name and contact information. We will respond during business hours.</p>
            </div>
          </div>

          <div className={step(3)}>
            <p className="mb-1 flex items-center justify-end gap-1 text-[12px] font-semibold text-blue-700"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" />닥터AI</p>
            <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md bg-[#5b7cf7] p-3 text-white">
              <p>리프팅 시술은 시술 직후 당겨지는 느낌을 받을 수 있으며, 콜라겐 재생에 따른 변화는 보통 1~3개월에 걸쳐 점진적으로 나타납니다.</p>
              <p className="mt-2">구체적인 효과와 유지 기간은 시술 종류와 개인의 피부 상태에 따라 다를 수 있으므로 자세한 사항은 의료진과 상담해 보세요.</p>
              <div className="mt-2 rounded-lg bg-white/15 px-2.5 py-2">
                <p className="text-[11px] text-white/80">발송 · 영어</p>
                <p className="text-[13px]">You may feel a tightening sensation right after the lifting procedure, and changes due to collagen regeneration typically appear gradually over 1 to 3 months.</p>
              </div>
            </div>
            <p className="mt-1 text-right text-[11px] text-gray-500">병원 라이브러리 문서의 문장으로 답하고, 영어로 번역해 보냈습니다</p>
          </div>

          <div className={step(4)}>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[12px] text-gray-600">
              <span className="rounded-md border border-gray-200 px-2 py-0.5">영어</span>
              <span className="flex items-center gap-1">AI 자동답변 <span className="relative inline-block h-4 w-7 rounded-full bg-gray-300" role="img" aria-label="꺼짐"><span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white" /></span></span>
              <span className="ml-auto flex items-center gap-1">자동 번역 <span className="relative inline-block h-4 w-7 rounded-full bg-blue-600" role="img" aria-label="켜짐"><span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white" /></span></span>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">이 방의 AI 자동답변은 꺼져 있어도, 운영시간 외 AI 자동응대가 켜져 있어 AI가 답했습니다</p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex items-start justify-between gap-3 text-xs leading-relaxed text-gray-400 keep-all">
        <span>닥터네스트 데모 계정(2026-09-29 녹화)에 있던 대화 문구를 그대로 옮겨 그렸습니다. 고객 이름 · 연락처는 뺐고, 시술 문구는 데모 병원의 예시입니다.</span>
        <button type="button" onClick={() => setRun(r => r + 1)} className="flex shrink-0 items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-gray-300 hover:bg-white/10" aria-label="대화 다시 보기">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />다시
        </button>
      </figcaption>
    </figure>
  );
}
