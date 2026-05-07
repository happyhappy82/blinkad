'use client';

import React from 'react';
import { ArrowUpRight, Bot, Braces, Globe2, MapPinned } from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

const stack = [
  {
    name: 'Google SEO',
    title: '검색엔진이 읽는 기본 구조',
    detail: '시맨틱 구조, 메타, 내부 링크, 속도, 사이트맵을 정비해 검색과 AI 답변의 기반을 만듭니다.',
    icon: Globe2,
  },
  {
    name: 'Local Entity',
    title: '지도와 비즈니스 프로필 신뢰 신호',
    detail: 'Google Business Profile, NAP 정보, 리뷰 응대, 사진, 게시물을 운영해 지역 발견 가능성을 높입니다.',
    icon: MapPinned,
  },
  {
    name: 'AEO',
    title: '질문에 바로 답하는 콘텐츠 블록',
    detail: '고객 질문을 2~5문장 답변, 비교표, FAQ로 정리해 검색 결과와 AI 답변이 추출하기 쉬운 형태로 만듭니다.',
    icon: Braces,
  },
  {
    name: 'GEO',
    title: 'AI가 브랜드를 설명할 수 있는 외부 맥락',
    detail: '홈페이지, 블로그, 외부 채널, 언론/플랫폼 언급을 연결해 브랜드가 같은 의미로 반복되도록 설계합니다.',
    icon: Bot,
  },
];

const MethodStack: React.FC = () => {
  return (
    <section className="bg-[#050505] py-28 md:py-36 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16 lg:gap-24">
          <FadeIn>
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Method</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight keep-all">
              SEO 위에 AEO와 GEO를 얹는 방식입니다.
            </h2>
            <p className="mt-6 text-lg text-gray-400 leading-relaxed keep-all">
              AI 검색은 완전히 다른 마케팅이 아닙니다. 검색엔진이 이해할 수 있는 정보 구조,
              실제 비즈니스 프로필, 질문형 콘텐츠, 외부 신뢰 신호가 같이 움직일 때 작동합니다.
            </p>
            <a
              href="#contact"
              className="mt-9 inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 font-semibold transition-colors"
            >
              우리 브랜드 진단하기
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </FadeIn>

          <div className="space-y-4">
            {stack.map((item, index) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.name} delay={index * 90}>
                  <div className="group grid grid-cols-1 md:grid-cols-[160px_1fr] gap-5 md:gap-8 border border-white/10 bg-black hover:border-brand-blue/35 rounded-[10px] p-6 md:p-7 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[10px] bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand-blue" />
                      </div>
                      <p className="text-sm text-gray-500 font-semibold">{item.name}</p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 keep-all">{item.title}</h3>
                      <p className="text-sm md:text-base text-gray-400 leading-relaxed keep-all">{item.detail}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MethodStack;
