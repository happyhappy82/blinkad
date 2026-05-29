'use client';

import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

const flow = [
  ['01', 'Google 프로필', '지도와 검색에서 가장 먼저 보이는 기본 정보'],
  ['02', '웹사이트·랜딩', '브랜드 설명과 문의 동선을 공식화하는 공간'],
  ['03', '블로그·FAQ', '고객 질문과 지역·서비스 키워드를 쌓는 콘텐츠'],
  ['04', 'AEO 구조', 'AI가 브랜드를 설명할 때 참고할 수 있는 답변형 정보'],
];

const assetPreviews = [
  {
    label: '프로필',
    preview: (
      <div className="h-24 overflow-hidden rounded-2xl bg-[#eef3f5] text-left">
        <div className="relative h-9 overflow-hidden bg-[#dbe7ec]">
          <div className="absolute left-2 top-4 h-1 w-24 -rotate-6 rounded-full bg-[#bdcbd3]" />
          <div className="absolute left-14 top-0 h-11 w-1.5 rotate-12 rounded-full bg-[#d95f25]" />
          <div className="absolute right-4 top-2 h-4 w-4 rounded-full bg-[#b8d6c5]" />
          <div className="absolute left-4 top-3 h-2.5 w-2.5 rounded-full bg-brand-blue ring-2 ring-white" />
        </div>
        <div className="px-2 pb-2 pt-1.5">
          <div className="h-2.5 w-24 rounded-full bg-gray-900" />
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-2 w-6 rounded-full bg-[#f5a400]" />
            <span className="h-1.5 w-16 rounded-full bg-gray-300" />
          </div>
          <div className="mt-2 flex gap-1.5">
            <span className="h-4 w-10 rounded-full bg-[#d8f7ff]" />
            <span className="h-4 w-9 rounded-full bg-[#d8f7ff]" />
          </div>
        </div>
      </div>
    ),
  },
  {
    label: '웹사이트',
    preview: (
      <div className="h-24 overflow-hidden rounded-2xl bg-[#0f1724] text-left">
        <div className="flex h-5 items-center gap-1 border-b border-white/10 px-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
          <span className="ml-auto h-1.5 w-8 rounded-full bg-white/20" />
        </div>
        <div className="grid grid-cols-[1fr_34px] gap-2 p-2">
          <div>
            <div className="h-3 w-20 rounded-full bg-white" />
            <div className="mt-2 h-1.5 w-24 rounded-full bg-white/30" />
            <div className="mt-1 h-1.5 w-16 rounded-full bg-white/20" />
            <div className="mt-3 h-4 w-12 rounded-full bg-brand-blue" />
          </div>
          <div className="h-[58px] overflow-hidden rounded-xl bg-white/10">
            <div className="h-7 bg-gradient-to-br from-[#dfe8ef] to-[#9fb2c0]" />
            <div className="m-1 h-2 rounded-full bg-white/35" />
            <div className="mx-1 h-2 rounded-full bg-brand-blue" />
          </div>
        </div>
      </div>
    ),
  },
  {
    label: '블로그',
    preview: (
      <div className="h-24 overflow-hidden rounded-2xl bg-white p-2 text-left">
        <div className="h-2 w-12 rounded-full bg-gray-300" />
        <div className="mt-1.5 h-3 w-24 rounded-full bg-gray-900" />
        <div className="mt-1 h-3 w-16 rounded-full bg-gray-900" />
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[#111827] to-[#c5b39a]" />
          <div className="h-1.5 w-14 rounded-full bg-gray-300" />
          <div className="h-1.5 w-6 rounded-full bg-gray-200" />
        </div>
        <div className="mt-2.5 space-y-1">
          <div className="h-1.5 rounded-full bg-gray-200" />
          <div className="h-1.5 w-11/12 rounded-full bg-gray-200" />
          <div className="h-1.5 w-2/3 rounded-full bg-gray-200" />
        </div>
      </div>
    ),
  },
  {
    label: 'Answer',
    preview: (
      <div className="h-24 overflow-hidden rounded-2xl bg-[#101827] p-2 text-left">
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-3.5 rounded-full bg-white" />
          <div className="h-2 w-14 rounded-full bg-white/60" />
        </div>
        <div className="mt-2 rounded-xl bg-white p-2">
          <div className="h-2.5 w-20 rounded-full bg-gray-900" />
          <div className="mt-1.5 space-y-1">
            <div className="h-1.5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-10/12 rounded-full bg-gray-200" />
          </div>
          <div className="mt-2 flex gap-1">
            <span className="h-3 w-8 rounded-full bg-[#e8f1ff]" />
            <span className="h-3 w-7 rounded-full bg-[#e8f1ff]" />
          </div>
        </div>
        <div className="mt-1.5 h-3 rounded-full bg-brand-blue/80" />
        <div className="mt-1 h-2 w-16 rounded-full bg-white/20" />
      </div>
    ),
  },
];

const AIDiagnostic: React.FC = () => {
  return (
    <section id="ai-diagnostic" className="bg-black py-24 md:py-40">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-24 items-start">
          <FadeIn className="lg:sticky lg:top-28">
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">
              Expansion Strategy
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] keep-all">
              하나의 브랜드 자산으로 연결합니다.
            </h2>
            <p className="mt-6 md:mt-8 text-base md:text-xl text-gray-400 leading-relaxed keep-all">
              블링크애드는 고객이 실제로 확인하는 접점을 순서대로 설계하고 연결합니다.
            </p>
            <a
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 text-base font-semibold transition-colors group"
            >
              확장 전략 상담하기
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </FadeIn>

          <div className="space-y-5 md:space-y-6">
            {flow.map(([step, title, detail], index) => (
              <FadeIn key={title} delay={index * 90}>
                <div className="group grid grid-cols-[52px_1fr] md:grid-cols-[72px_1fr] gap-5 md:gap-7 border-t border-white/10 py-7 md:py-9 first:border-t-0 first:pt-0">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white text-black flex items-center justify-center text-sm md:text-base font-bold group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    {step}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl md:text-4xl font-bold tracking-tight keep-all">{title}</h3>
                      <CheckCircle2 className="hidden md:block w-5 h-5 text-brand-blue" />
                    </div>
                    <p className="mt-3 text-base md:text-lg text-gray-400 leading-relaxed keep-all">{detail}</p>
                  </div>
                </div>
              </FadeIn>
            ))}

            <FadeIn delay={420}>
              <div className="mt-8 rounded-[32px] bg-[#f3f6fb] p-6 md:p-8 text-black shadow-2xl shadow-black/30">
                <p className="text-sm text-gray-500">Connected Assets</p>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {['GBP', 'Web', 'Blog', 'AEO'].map((item) => (
                    <div key={item} className="rounded-2xl bg-black px-3 py-3 text-center text-lg font-black tracking-tight text-white md:text-2xl">
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {assetPreviews.map((asset) => (
                    <div key={asset.label} className="rounded-2xl bg-white p-3 text-center shadow-sm">
                      {asset.preview}
                      <p className="mt-3 text-sm font-bold text-gray-700">{asset.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDiagnostic;
