'use client';

import React from 'react';
import { FadeIn } from './ui/FadeIn';

const process = [
  {
    step: '01',
    title: '시장 의도 분석',
    duration: '1-2 DAYS',
    items: ['비즈니스 목표와 KPI 설정', '타겟 고객 검색 의도 분석', '경쟁사 키워드와 AI 답변 비교'],
  },
  {
    step: '02',
    title: '전략적 구조 설계',
    duration: '2-3 DAYS',
    items: ['검색 친화적 사이트맵 설계', '정보 위계 구조 정의', '고객 문의 경로 최적화'],
  },
  {
    step: '03',
    title: '프리미엄 UI/UX',
    duration: '5-7 DAYS',
    items: ['브랜드 맞춤 디자인', '반응형 레이아웃 설계', '로딩 속도와 가독성 고려'],
  },
  {
    step: '04',
    title: 'SEO 기반 코드 개발',
    duration: '7-10 DAYS',
    items: ['시맨틱 HTML 퍼블리싱', 'Core Web Vitals 점검', '스키마 마크업 적용'],
  },
  {
    step: '05',
    title: 'AEO·GEO 적용',
    duration: '3-5 DAYS',
    items: ['FAQ와 답변형 콘텐츠 구조화', 'Google 프로필과 홈페이지 연결', 'AI 답변 노출 가능성 점검'],
  },
  {
    step: '06',
    title: '검수 및 운영',
    duration: 'MONTHLY',
    items: ['검색·스키마 유효성 검증', 'GA4·서치콘솔 연동', 'GBP와 콘텐츠 업데이트 운영'],
  },
];

const Process: React.FC = () => {
  return (
    <section id="process" className="bg-black py-20 md:py-36 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <FadeIn className="mb-10 md:mb-16">
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Process</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight keep-all">프로젝트 진행 과정</h2>
          <p className="mt-5 text-base md:text-lg text-gray-400 max-w-2xl leading-relaxed keep-all">
            검색과 AI 노출을 위한 6단계 프로세스입니다. 모든 프로젝트는 사전 정의된 구조 설계 기준을 기반으로 진행됩니다.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-white/10 rounded-[10px] overflow-hidden">
          {process.map((phase, index) => (
            <FadeIn key={phase.step} delay={index * 90}>
              <div className="h-full p-6 md:p-8 bg-brand-dark border-b md:border-r border-white/10">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <span className="text-2xl md:text-3xl font-bold text-white/20">{phase.step}</span>
                  <span className="text-[11px] tracking-[0.18em] text-brand-blue font-semibold">{phase.duration}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-5 keep-all">{phase.title}</h3>
                <ul className="space-y-3">
                  {phase.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed keep-all">
                      <span className="mt-2 h-1 w-1 rounded-full bg-gray-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
