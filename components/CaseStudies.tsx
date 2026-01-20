'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { CASE_STUDIES } from '@/constants';
import { FadeIn } from './ui/FadeIn';
import { ArrowRight, Quote, TrendingUp, Star } from 'lucide-react';

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

const CaseStudies: React.FC = () => {
  const mainCase = CASE_STUDIES[0];
  const { count: statCount, ref: statRef } = useCountUp(180, 2500);

  return (
    <section id="casestudies" className="py-32 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-4">Success Stories</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">실제 성과로 증명합니다.</h2>
              <p className="text-xl text-gray-500 max-w-xl keep-all">
                말이 아닌 숫자로 보여드립니다. 우리 고객사들의 실제 성장 스토리입니다.
              </p>
            </div>
            <Link
              href="/case-studies"
              className="group inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 transition-colors"
            >
              <span className="font-medium">모든 사례 보기</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeIn>

        {/* 메인 히어로 카드 */}
        <FadeIn delay={100}>
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-brand-dark to-black border border-white/10 mb-8">
            <div className="grid md:grid-cols-2">
              {/* 이미지 섹션 */}
              <div className="relative h-64 md:h-auto md:min-h-[500px] overflow-hidden">
                <img
                  src={mainCase.imageUrl}
                  alt={mainCase.client}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/80 md:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent md:hidden" />

                {/* Before/After 배지 */}
                <div className="absolute top-6 left-6 flex gap-3">
                  <div className="bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <p className="text-xs text-white/80">BEFORE</p>
                    <p className="text-sm font-bold text-white">{mainCase.beforeValue}</p>
                  </div>
                  <div className="bg-green-500/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <p className="text-xs text-white/80">AFTER</p>
                    <p className="text-sm font-bold text-white">{mainCase.afterValue}</p>
                  </div>
                </div>
              </div>

              {/* 컨텐츠 섹션 */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 text-brand-blue text-sm font-medium mb-4">
                  <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />
                  {mainCase.industry}
                </div>

                <h3 className="text-3xl md:text-4xl font-bold mb-4">{mainCase.client}</h3>

                <div ref={statRef} className="flex items-baseline gap-2 mb-6">
                  <span className="text-6xl md:text-7xl font-bold text-brand-blue">{mainCase.value}</span>
                  <span className="text-gray-400">{mainCase.metric}</span>
                </div>

                {/* 주요 성과 */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {mainCase.keyResults.slice(0, 4).map((result, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{result}</span>
                    </div>
                  ))}
                </div>

                {/* 고객 후기 */}
                <div className="relative bg-white/5 rounded-2xl p-6 border border-white/10">
                  <Quote className="absolute -top-3 -left-2 w-8 h-8 text-brand-blue/30" />
                  <p className="text-gray-300 italic mb-4 keep-all leading-relaxed">
                    "{mainCase.testimonial}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-blue/20 rounded-full flex items-center justify-center">
                      <span className="text-brand-blue font-bold">{mainCase.customerName[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">{mainCase.customerName}</p>
                      <p className="text-sm text-gray-500">{mainCase.customerRole}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 하단 카드들 */}
        <div className="grid md:grid-cols-2 gap-6">
          {CASE_STUDIES.slice(1).map((study, index) => (
            <FadeIn key={study.id} delay={200 + index * 100}>
              <div className="group relative rounded-2xl overflow-hidden bg-brand-dark border border-white/5 hover:border-brand-blue/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-8 flex gap-6">
                  {/* 작은 이미지 */}
                  <div className="hidden sm:block w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={study.imageUrl}
                      alt={study.client}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-brand-blue font-medium">{study.industry}</span>
                      <span className="text-xs text-gray-500">{study.duration}</span>
                    </div>

                    <h3 className="text-xl font-bold mb-2 truncate">{study.client}</h3>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-brand-blue">{study.value}</span>
                        <span className="text-sm text-gray-500">{study.metric}</span>
                      </div>
                    </div>

                    {/* Before → After 한줄 */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-red-400">{study.beforeValue}</span>
                      <ArrowRight className="w-4 h-4 text-gray-600" />
                      <span className="text-green-400">{study.afterValue}</span>
                    </div>
                  </div>
                </div>

                {/* 하단 후기 */}
                <div className="px-8 pb-6">
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-sm text-gray-400 italic line-clamp-2 keep-all">
                      "{study.testimonial}"
                    </p>
                    <p className="text-xs text-gray-500 mt-2">— {study.customerName}, {study.customerRole}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* 통계 배너 */}
        <FadeIn delay={400}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '50+', label: '성공 프로젝트' },
              { value: '98%', label: '고객 만족도' },
              { value: '3개월', label: '평균 성과 달성' },
              { value: '4.9', label: '평균 평점' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default CaseStudies;
