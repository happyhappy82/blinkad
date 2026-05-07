'use client';

import React, { useRef, useEffect } from 'react';
import { FadeIn } from './ui/FadeIn';

const industries = [
  '병원 / 의료관광',
  '외식 / 로컬 매장',
  '뷰티 / 클리닉',
  '전문 서비스',
  '프랜차이즈',
  'B2B / 수출기업',
];

const Hero: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Capture wheel events and convert to page scroll
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.scrollBy({
        top: e.deltaY,
        behavior: 'auto'
      });
    };

    // Temporarily disable overlay on mouse/touch to allow iframe interaction
    const disableOverlay = () => {
      overlay.style.pointerEvents = 'none';
    };

    const enableOverlay = () => {
      overlay.style.pointerEvents = 'auto';
    };

    overlay.addEventListener('wheel', handleWheel, { passive: false });
    overlay.addEventListener('mousedown', disableOverlay);
    overlay.addEventListener('touchstart', disableOverlay);
    document.addEventListener('mouseup', enableOverlay);
    document.addEventListener('touchend', enableOverlay);

    return () => {
      overlay.removeEventListener('wheel', handleWheel);
      overlay.removeEventListener('mousedown', disableOverlay);
      overlay.removeEventListener('touchstart', disableOverlay);
      document.removeEventListener('mouseup', enableOverlay);
      document.removeEventListener('touchend', enableOverlay);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Spline 3D Background - Full Screen */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src='https://my.spline.design/lightningbulb-Dnchy2rLULrVE0Tm7LPWp2eh/'
          frameBorder='0'
          width='100%'
          height='100%'
          title="BlinkAd 3D Lightbulb"
          className="w-full h-full"
        />
        <div className="absolute inset-0 z-[5] bg-black/55 pointer-events-none" />
        {/* Overlay: captures wheel events for page scroll, allows click-through for 3D interaction */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10"
        />
        {/* Bottom cover to hide Spline watermark */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/95 to-transparent z-20 pointer-events-none" />
      </div>

      {/* Content Overlay - Bottom */}
      <div className="absolute bottom-10 md:bottom-14 left-0 right-0 z-30 px-6">
        <div className="max-w-7xl mx-auto">
        <FadeIn delay={200}>
          <p className="mb-5 max-w-[19rem] md:max-w-none text-[11px] md:text-sm font-semibold tracking-[0.16em] md:tracking-[0.28em] uppercase text-brand-blue leading-relaxed">
            혹시 ChatGPT · Perplexity · Google에서 브랜드를 찾고 계신가요?
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/75 drop-shadow-lg keep-all">
            Google 검색과<br className="sm:hidden" /> AI 답변에서<br/>먼저 발견되는<br className="sm:hidden" /> 브랜드.
          </h1>
        </FadeIn>

        <FadeIn delay={400}>
          <p className="text-base md:text-xl text-gray-300 max-w-[20rem] md:max-w-3xl font-light leading-relaxed mb-8 break-words drop-shadow-md">
            블링크애드는 홈페이지, Google Business Profile, 답변형 콘텐츠, 스키마를 통합해
            고객이 검색하고 AI에게 물어볼 때 브랜드가 설명되도록 설계합니다.
          </p>
        </FadeIn>

        <FadeIn delay={600} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
             <button
               onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})}
               className="bg-white text-black hover:bg-gray-200 px-7 py-3.5 rounded-full text-sm md:text-base font-semibold transition-colors pointer-events-auto"
             >
               2시간 내 노출 가능성 확인
             </button>
             <button
               onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})}
               className="text-brand-blue hover:text-blue-400 text-sm md:text-base font-semibold transition-colors flex items-center gap-2 group pointer-events-auto py-3"
             >
               서비스 구조 보기
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </button>
        </FadeIn>

        <FadeIn delay={750} className="mt-10 grid grid-cols-2 md:grid-cols-6 max-w-5xl border border-white/10 rounded-[10px] overflow-hidden bg-black/35 backdrop-blur-sm">
          {industries.map((industry) => (
            <div key={industry} className="px-4 py-3 border-r border-b md:border-b-0 border-white/10 last:border-r-0">
              <p className="text-xs md:text-sm text-gray-300 keep-all">{industry}</p>
            </div>
          ))}
        </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Hero;
