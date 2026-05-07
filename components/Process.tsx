'use client';

import React from 'react';
import { FadeIn } from './ui/FadeIn';

const process = [
  {
    step: '01',
    title: '현재 Google 노출 진단',
    duration: 'START',
    detail: '프로필 상태, 지도·검색 노출 키워드, 경쟁 프로필과의 정보 격차를 먼저 확인합니다.',
  },
  {
    step: '02',
    title: '프로필 기본 정보 정비',
    duration: 'SETUP',
    detail: '카테고리, 소개문, 영업정보, 사진, 메뉴, 서비스 정보를 외국인 고객 기준으로 정리합니다.',
  },
  {
    step: '03',
    title: '게시물·리뷰 운영',
    duration: 'WEEKLY',
    detail: 'Google 게시물과 리뷰 응대 기준을 운영하고, 조회·검색·상호작용 데이터를 확인합니다.',
  },
  {
    step: '04',
    title: '웹사이트·블로그 확장',
    duration: 'MONTHLY',
    detail: '서비스 랜딩, 검색형 블로그, FAQ 콘텐츠를 연결해 프로필 밖에서도 브랜드를 설명합니다.',
  },
  {
    step: '05',
    title: '월간 개선과 AEO 준비',
    duration: 'GROWTH',
    detail: '운영 데이터를 기반으로 문장을 통일하고, AI가 읽을 수 있는 답변 구조를 점검합니다.',
  },
];

const Process: React.FC = () => {
  return (
    <section id="process" className="bg-black py-24 md:py-40">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <FadeIn className="max-w-4xl mb-12 md:mb-20">
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Process</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] keep-all">
            복잡한 마케팅을<br />
            다섯 단계 운영으로 단순하게 만듭니다.
          </h2>
          <p className="mt-6 md:mt-8 text-base md:text-xl text-gray-400 leading-relaxed keep-all">
            처음부터 거대한 AEO 프로젝트를 팔지 않습니다. Google 프로필을 정비하고, 필요한 콘텐츠를 매달 쌓으면서 검색과 AI가 이해할 수 있는 구조로 확장합니다.
          </p>
        </FadeIn>

        <div className="border-y border-white/10 divide-y divide-white/10">
          {process.map((phase, index) => (
            <FadeIn key={phase.step} delay={index * 70}>
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_140px] gap-4 md:gap-10 py-7 md:py-9 items-start">
                <p className="text-4xl md:text-5xl font-bold text-white/15">{phase.step}</p>
                <div>
                  <h3 className="text-2xl md:text-4xl font-bold tracking-tight keep-all">{phase.title}</h3>
                  <p className="mt-3 text-base md:text-lg text-gray-400 leading-relaxed keep-all">{phase.detail}</p>
                </div>
                <p className="text-sm md:text-right font-semibold tracking-[0.18em] text-brand-blue">{phase.duration}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
