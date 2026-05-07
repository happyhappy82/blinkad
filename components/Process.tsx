'use client';

import React from 'react';
import { FadeIn } from './ui/FadeIn';

const process = [
  {
    step: '01',
    title: '노출 상태 진단',
    duration: '1-2 DAYS',
    items: ['검색 결과와 Google Maps 노출 확인', 'AI 답변 내 브랜드 언급 여부 확인', '홈페이지와 외부 채널 정보 불일치 점검'],
  },
  {
    step: '02',
    title: '구조 설계',
    duration: '2-3 DAYS',
    items: ['검색 의도별 페이지 구조 설계', 'GBP와 홈페이지 연결 구조 정리', 'AEO/GEO 우선 질문 리스트 구성'],
  },
  {
    step: '03',
    title: '콘텐츠와 엔티티 구축',
    duration: '2-4 WEEKS',
    items: ['답변형 콘텐츠와 FAQ 제작', '서비스/진료/업종별 핵심 페이지 정비', '외부 채널 소개 문구와 링크 체계 정리'],
  },
  {
    step: '04',
    title: '운영과 개선',
    duration: 'MONTHLY',
    items: ['GBP 게시물, 사진, 리뷰 응대 운영', 'AI referral과 검색 유입 추적', '노출 변화에 맞춘 콘텐츠 업데이트'],
  },
];

const Process: React.FC = () => {
  return (
    <section id="process" className="bg-black py-28 md:py-36 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="mb-16">
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Process</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight keep-all">진단에서 운영까지 한 흐름으로 갑니다.</h2>
          <p className="mt-5 text-lg text-gray-400 max-w-2xl leading-relaxed keep-all">
            디자인, 콘텐츠, 프로필 운영, AI 검색 대응을 따로 떼지 않고 하나의 발견 구조로 다룹니다.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-4 border border-white/10 rounded-[10px] overflow-hidden">
          {process.map((phase, index) => (
            <FadeIn key={phase.step} delay={index * 90}>
              <div className="h-full p-7 md:p-8 bg-brand-dark border-b lg:border-b-0 lg:border-r border-white/10 last:border-r-0">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-3xl font-bold text-white/20">{phase.step}</span>
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
