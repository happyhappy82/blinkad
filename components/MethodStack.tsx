'use client';

import React from 'react';
import { ArrowUpRight, Bot, Braces, Globe2 } from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

const stack = [
  {
    name: '당장 운영',
    title: 'Google 비즈니스 프로필',
    detail: '외국인 고객이 가장 먼저 보는 정보, 사진, 리뷰, 게시물을 지속적으로 관리합니다.',
    icon: Globe2,
  },
  {
    name: '콘텐츠 확장',
    title: '웹사이트·블로그',
    detail: '프로필만으로 설명되지 않는 브랜드 강점, 서비스, 고객 질문을 공식 콘텐츠로 쌓습니다.',
    icon: Braces,
  },
  {
    name: '장기 방향',
    title: 'AEO·GEO 기반',
    detail: '브랜드 설명과 질문형 답변을 구조화해 AI가 이해할 수 있는 기반을 만듭니다.',
    icon: Bot,
  },
];

const MethodStack: React.FC = () => {
  return (
    <section id="method" className="bg-[#050505] py-24 md:py-40 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-20 items-center">
          <FadeIn>
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Method</p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] keep-all">
              AEO는 따로 붙이는 기술이 아니라<br />
              지금 쌓는 운영의 결과입니다.
            </h2>
            <p className="mt-6 md:mt-8 text-base md:text-xl text-gray-400 leading-relaxed keep-all">
              Google 프로필, 웹사이트, 블로그가 서로 다른 말을 하면 검색과 AI는 브랜드를 일관되게 이해하기 어렵습니다. 블링크애드는 같은 브랜드 설명이 모든 접점에 남도록 운영합니다.
            </p>
            <a
              href="#contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
            >
              우리 브랜드 진단하기
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </FadeIn>

          <FadeIn delay={140}>
            <div className="relative mx-auto max-w-[500px]">
              <div className="absolute -inset-8 rounded-[56px] bg-brand-blue/10 blur-3xl" />
              <div className="relative rounded-[38px] bg-[#f3f6fb] p-6 md:p-8 text-black shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <p className="text-sm text-gray-500">AI Readiness Score</p>
                    <p className="mt-2 text-3xl md:text-5xl font-bold tracking-tight">Brand Entity</p>
                  </div>
                  <div className="relative h-24 w-24 rounded-full bg-[conic-gradient(#0066FF_0_78%,#e8ebf2_78%_100%)] flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-[#f3f6fb] flex items-center justify-center">
                      <span className="text-2xl font-bold text-brand-blue">78</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {['브랜드 설명 일관성', '질문형 답변 구조', 'Google 프로필 연결성'].map((item, index) => (
                    <div key={item} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-bold text-gray-700 keep-all">{item}</span>
                        <span className="text-sm font-bold text-brand-blue">{[92, 76, 84][index]}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 border-y border-white/10">
          {stack.map((item, index) => {
            const Icon = item.icon;
            return (
              <FadeIn key={item.title} delay={index * 90}>
                <div className="h-full py-8 md:py-10 md:px-8 border-b md:border-b-0 md:border-r border-white/10 last:border-r-0">
                  <div className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="mt-7 text-sm font-semibold text-brand-blue">{item.name}</p>
                  <h3 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight keep-all">{item.title}</h3>
                  <p className="mt-4 text-base text-gray-400 leading-relaxed keep-all">{item.detail}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default MethodStack;
