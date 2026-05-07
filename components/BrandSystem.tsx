'use client';

import React from 'react';
import { BarChart3, Database, MessageSquareQuote, SearchCheck } from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

const problems = [
  '검색해도 우리 브랜드가 잘 나오지 않음',
  'AI에게 물어봐도 브랜드를 모르거나 경쟁사를 먼저 말함',
  '지도 조회수는 있는데 예약·문의로 이어지지 않음',
  '홈페이지, 블로그, Google 프로필 설명이 서로 다름',
];

const pillars = [
  {
    label: '01',
    title: '검색 기반 진단',
    description: '검색 의도, 지역 키워드, 지도 노출, AI 답변 결과를 같이 확인해 지금 빠진 지점을 찾습니다.',
    icon: SearchCheck,
  },
  {
    label: '02',
    title: '엔티티 구조 정리',
    description: '홈페이지, Google Business Profile, 블로그, 외부 채널의 브랜드 설명을 한 방향으로 맞춥니다.',
    icon: Database,
  },
  {
    label: '03',
    title: '답변형 콘텐츠 설계',
    description: '고객이 실제로 묻는 질문에 바로 답하는 페이지와 FAQ 구조를 만들어 AI가 읽기 쉽게 정리합니다.',
    icon: MessageSquareQuote,
  },
  {
    label: '04',
    title: '성과 측정과 개선',
    description: '검색 노출, 지도 상호작용, 문의 전환, AI referral을 추적해 다음 운영 우선순위를 정합니다.',
    icon: BarChart3,
  },
];

const BrandSystem: React.FC = () => {
  return (
    <section className="bg-black py-28 md:py-36 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-14 lg:gap-20 items-start">
          <FadeIn>
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">
              Brand Visibility System
            </p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight keep-all">
              문제는 디자인이 아니라,<br className="hidden md:block" />
              만들어진 구조일 수 있습니다.
            </h2>
            <p className="mt-7 text-lg text-gray-400 leading-relaxed keep-all">
              예쁜 화면만으로는 검색엔진과 AI가 브랜드를 정확히 이해하지 못합니다.
              블링크애드는 검색 의도, 정보 위계, 스키마, 외부 프로필을 같이 정리해 발견과 문의가 이어지는 구조를 만듭니다.
            </p>
          </FadeIn>

          <FadeIn delay={120}>
            <div className="border border-white/10 bg-white/[0.03] rounded-[10px] p-6 md:p-8">
              <p className="text-sm font-semibold text-white mb-5">홈페이지가 제 역할을 못 할 때 보이는 신호</p>
              <div className="space-y-3">
                {problems.map((problem) => (
                  <div key={problem} className="flex items-start gap-3 border-b border-white/5 last:border-b-0 pb-3 last:pb-0">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand-blue flex-shrink-0" />
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed keep-all">{problem}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-white/10 rounded-[10px] overflow-hidden">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <FadeIn key={pillar.title} delay={index * 90}>
                <div className="h-full min-h-[280px] p-7 md:p-8 bg-brand-dark border-b md:border-b-0 md:border-r border-white/10 last:border-r-0">
                  <div className="flex items-center justify-between mb-10">
                    <span className="text-sm text-gray-500">{pillar.label}</span>
                    <Icon className="w-5 h-5 text-brand-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 keep-all">{pillar.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed keep-all">{pillar.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrandSystem;
