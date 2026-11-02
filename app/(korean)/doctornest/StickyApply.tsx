'use client';

import { useEffect, useState } from 'react';

// 휴대폰 아래쪽에 붙는 「도입 상담 신청」 띠. 첫 화면을 지나면 나타나고, 신청 칸이 보이면 숨는다.
export default function StickyApply() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const apply = document.getElementById('apply');
    let applyVisible = false;
    const update = () => setShow(window.scrollY > 520 && !applyVisible);
    const io = apply ? new IntersectionObserver(([entry]) => { applyVisible = entry.isIntersecting; update(); }, { threshold: 0.05 }) : null;
    if (apply && io) io.observe(apply);
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', update); io?.disconnect(); };
  }, []);
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-md transition-transform duration-300 lg:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`} aria-hidden={!show}>
      <a href="#apply" tabIndex={show ? 0 : -1} className="flex w-full items-center justify-center rounded-xl bg-brand-blue py-3 text-base font-semibold text-white">닥터네스트 도입 상담 신청</a>
    </div>
  );
}
