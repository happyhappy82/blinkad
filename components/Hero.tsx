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
          <p className="mb-5 text-xs md:text-sm font-semibold tracking-[0.28em] uppercase text-brand-blue">
            Google SEO · AEO · GEO
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/75 drop-shadow-lg keep-all">
            검색과 AI 답변에서<br/>선택되는 브랜드.
          </h1>
        </FadeIn>

        <FadeIn delay={400}>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl font-light leading-relaxed mb-8 keep-all drop-shadow-md">
            블링크애드는 구글 검색, Google Maps, ChatGPT와 Perplexity 답변까지 이어지는 발견 구조를 설계합니다.
          </p>
        </FadeIn>

        <FadeIn delay={600} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
             <button
               onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})}
               className="bg-white text-black hover:bg-gray-200 px-7 py-3.5 rounded-full text-sm md:text-base font-semibold transition-colors pointer-events-auto"
             >
               무료 진단 신청하기
             </button>
             <button
               onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})}
               className="text-brand-blue hover:text-blue-400 text-sm md:text-base font-semibold transition-colors flex items-center gap-2 group pointer-events-auto py-3"
             >
               운영 방식 보기
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </button>
        </FadeIn>

        <FadeIn delay={750} className="mt-10 grid grid-cols-3 max-w-2xl border-y border-white/10 divide-x divide-white/10">
          {[
            ['GBP', '지도 노출'],
            ['AEO', '답변 구조'],
            ['GEO', 'AI 인용'],
          ].map(([label, text]) => (
            <div key={label} className="py-4 pr-5 first:pl-0 pl-5">
              <p className="text-xl md:text-2xl font-bold text-white">{label}</p>
              <p className="mt-1 text-xs md:text-sm text-gray-500 keep-all">{text}</p>
            </div>
          ))}
        </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Hero;
