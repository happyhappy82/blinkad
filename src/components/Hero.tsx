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
          title="Blink Ad 3D Lightbulb"
          className="w-full h-full"
        />
        {/* Overlay: captures wheel events for page scroll, allows click-through for 3D interaction */}
        <div
          ref={overlayRef}
          className="absolute inset-0 z-10"
        />
        {/* Bottom cover to hide Spline watermark */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/95 to-transparent z-20 pointer-events-none" />
      </div>

      {/* Content Overlay - Bottom */}
      <div className="absolute bottom-20 left-0 right-0 z-30 text-center px-6">
        <FadeIn delay={200}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-lg">
            즉각적인<br/>가시성.
          </h1>
        </FadeIn>

        <FadeIn delay={400}>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed mb-10 keep-all drop-shadow-md">
            구글의 첫 페이지는 목적지가 아닙니다.<br className="hidden md:block"/> 그것은 기준입니다. 블링크애드가 증명합니다.
          </p>
        </FadeIn>

        <FadeIn delay={600} className="flex flex-col md:flex-row gap-4 justify-center items-center">
             <button
               onClick={() => document.getElementById('services')?.scrollIntoView({behavior: 'smooth'})}
               className="text-brand-blue hover:text-blue-400 text-lg font-medium transition-colors flex items-center gap-2 group pointer-events-auto"
             >
               서비스 둘러보기
               <span className="group-hover:translate-x-1 transition-transform">→</span>
             </button>
        </FadeIn>
      </div>
    </section>
  );
};

export default Hero;
