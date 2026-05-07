'use client';

import React, { useRef, useEffect } from 'react';
import { FadeIn } from './ui/FadeIn';

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
    <section className="relative min-h-[100svh] md:min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Spline 3D Background - Full Screen */}
      <div className="absolute inset-0 w-full h-full">
        <iframe
          src='https://my.spline.design/lightningbulb-Dnchy2rLULrVE0Tm7LPWp2eh/'
          frameBorder='0'
          width='100%'
          height='100%'
          title="BlinkAd 3D Lightbulb"
          className="w-full h-full scale-[1.08] sm:scale-100"
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
      <div className="absolute top-[30svh] bottom-auto sm:top-auto sm:bottom-10 md:bottom-14 left-0 right-0 z-30 px-5 md:px-6">
        <div className="max-w-7xl mx-auto">
        <FadeIn delay={200}>
          <h1 className="text-[2.45rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-5 md:mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/75 drop-shadow-lg keep-all">
            Google 검색과<br className="sm:hidden" /> AI 답변에서<br/>먼저 발견되는<br className="sm:hidden" /> 브랜드.
          </h1>
        </FadeIn>

        <FadeIn delay={400}>
          <p className="text-sm sm:text-base md:text-xl text-gray-300 max-w-[21rem] md:max-w-3xl font-light leading-relaxed mb-6 md:mb-8 break-words drop-shadow-md">
            블링크애드는 홈페이지, Google Business Profile, 답변형 콘텐츠, 스키마를 통합해
            고객이 검색하고 AI에게 물어볼 때 브랜드가 설명되도록 설계합니다.
          </p>
        </FadeIn>

        <FadeIn delay={600} className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
             <button
               onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})}
               className="w-full sm:w-auto bg-white text-black hover:bg-gray-200 px-6 md:px-7 py-3.5 rounded-full text-sm md:text-base font-semibold transition-colors pointer-events-auto"
             >
               문의하기
             </button>
             <button
               onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})}
               className="w-full sm:w-auto justify-center sm:justify-start text-brand-blue hover:text-blue-400 text-sm md:text-base font-semibold transition-colors flex items-center gap-2 group pointer-events-auto py-3"
             >
               서비스 구조 보기
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </button>
        </FadeIn>

        </div>
      </div>
    </section>
  );
};

export default Hero;
