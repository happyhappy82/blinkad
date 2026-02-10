'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CASE_STUDIES } from '@/constants';
import { FadeIn } from './ui/FadeIn';
import { Eye, Search, MousePointerClick, TrendingUp } from 'lucide-react';
import Image from 'next/image';

// 숫자 카운팅 애니메이션 훅
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(start + (end - start) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return { count, ref };
}

const STAT_ICONS = [Eye, Search, MousePointerClick];

const CaseStudies: React.FC = () => {
  const mainCase = CASE_STUDIES[0];
  const screenshots = mainCase.screenshots || [];
  const { count: viewCount, ref: viewRef } = useCountUp(56719, 2500);
  const { count: searchCount, ref: searchRef } = useCountUp(41930, 2500);
  const { count: interactionCount, ref: interactionRef } = useCountUp(3562, 2500);
  const countRefs = [viewRef, searchRef, interactionRef];
  const counts = [viewCount, searchCount, interactionCount];

  // 스크린샷 확대 모달
  const [modalImg, setModalImg] = useState<string | null>(null);

  return (
    <section id="casestudies" className="py-32 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* 섹션 헤더 */}
        <FadeIn className="mb-16">
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-4">Success Stories</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">실제 성과로 증명합니다.</h2>
          <p className="text-xl text-gray-400 max-w-2xl keep-all">
            스톡 이미지도, 꾸며낸 숫자도 아닙니다.<br className="hidden md:block" />
            Google 비즈니스 프로필에서 가져온 실제 데이터입니다.
          </p>
        </FadeIn>

        {/* 고객사 배지 */}
        <FadeIn delay={100} className="mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-semibold border border-brand-blue/20">
              <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />
              {mainCase.client}
            </span>
            <span className="text-gray-500 text-sm">{mainCase.industry}</span>
            <span className="text-gray-600 text-sm">·</span>
            <span className="text-gray-500 text-sm">GBP 최적화 {mainCase.duration}</span>
          </div>
        </FadeIn>

        {/* 핵심 수치 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {screenshots.map((shot, index) => {
            const Icon = STAT_ICONS[index];
            return (
              <FadeIn key={shot.label} delay={150 + index * 100}>
                <div
                  ref={countRefs[index]}
                  className="group relative rounded-2xl bg-brand-dark border border-white/5 hover:border-brand-blue/30 transition-all duration-500 overflow-hidden cursor-pointer"
                  onClick={() => setModalImg(shot.src)}
                >
                  {/* 카드 헤더 - 수치 */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand-blue" />
                      </div>
                      <span className="text-sm text-gray-400">{shot.label}</span>
                    </div>
                    <p className="text-4xl md:text-5xl font-bold text-white">
                      {counts[index].toLocaleString()}
                    </p>
                  </div>

                  {/* 스크린샷 이미지 */}
                  <div className="relative mx-4 mb-4 rounded-xl overflow-hidden bg-white/95 border border-gray-200/50 group-hover:shadow-[0_0_30px_rgba(0,113,227,0.15)] transition-shadow duration-500">
                    <Image
                      src={shot.src}
                      alt={shot.label}
                      width={600}
                      height={400}
                      className="w-full h-auto"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>

                  {/* 호버 힌트 */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs text-gray-500 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                      클릭하여 확대
                    </span>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* 주요 성과 요약 바 */}
        <FadeIn delay={500}>
          <div className="rounded-2xl bg-gradient-to-r from-brand-blue/5 via-brand-dark to-brand-blue/5 border border-white/5 p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {mainCase.keyResults.map((result, i) => (
                <div key={i} className="flex items-start gap-3">
                  <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300 keep-all">{result}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* 스크린샷 확대 모달 */}
      {modalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
          onClick={() => setModalImg(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] overflow-auto rounded-2xl bg-white p-2">
            <Image
              src={modalImg}
              alt="확대 보기"
              width={1200}
              height={800}
              className="w-full h-auto rounded-xl"
              style={{ objectFit: 'contain' }}
            />
            <button
              onClick={() => setModalImg(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CaseStudies;
