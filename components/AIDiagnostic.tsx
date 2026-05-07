'use client';

import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

const signals = [
  '브랜드명 직접 질의에서 AI가 무엇을 답하는지',
  '업종·지역·서비스 질문에서 후보로 등장하는지',
  '홈페이지와 Google 프로필이 citation source가 될 수 있는지',
  '경쟁사가 어떤 문장과 출처로 먼저 언급되는지',
];

const AIDiagnostic: React.FC = () => {
  return (
    <section id="ai-diagnostic" className="bg-[#050505] py-20 md:py-36 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-20 items-start">
          <FadeIn>
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">AI Visibility Diagnostic</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight keep-all">
              AI가 우리 브랜드를<br className="hidden md:block" />
              어떻게 설명하는지 먼저 봅니다.
            </h2>
            <p className="mt-5 md:mt-6 text-base md:text-lg text-gray-400 leading-relaxed keep-all">
              LogAgency 레퍼런스의 핵심처럼, 이제는 검색 순위만이 아니라 AI 답변 안에서 브랜드가 어떻게 언급되는지가 중요합니다.
              블링크애드는 실제 질의 결과를 기준으로 누락된 정보 구조를 찾습니다.
            </p>
            <a
              href="#contact"
              className="mt-7 md:mt-9 inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 font-semibold transition-colors"
            >
              무료 진단 신청
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </FadeIn>

          <FadeIn delay={120}>
            <div className="rounded-[10px] border border-white/10 bg-black overflow-hidden">
              <div className="border-b border-white/10 px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">AI 답변 진단 예시</span>
                <span className="text-[11px] text-gray-500 tracking-[0.18em]">CHATGPT · PERPLEXITY · GOOGLE</span>
              </div>
              <div className="p-4 md:p-7 space-y-4 md:space-y-5">
                <div className="rounded-[10px] bg-white/[0.04] border border-white/10 p-4 md:p-5">
                  <p className="text-xs text-gray-500 mb-3">User Prompt</p>
                  <p className="text-base md:text-lg text-white leading-relaxed keep-all">
                    “서울에서 외국인 관광객에게 잘 보이는 한식당 마케팅 업체를 알려줘.”
                  </p>
                </div>
                <div className="rounded-[10px] bg-brand-blue/10 border border-brand-blue/25 p-4 md:p-5">
                  <p className="text-xs text-brand-blue mb-3">Diagnostic Focus</p>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed keep-all">
                    답변에 브랜드가 등장하는지, 어떤 출처가 붙는지, 경쟁사가 먼저 나오는 이유가 무엇인지,
                    홈페이지와 Google 프로필 중 어디가 근거로 쓰일 수 있는지 확인합니다.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {signals.map((signal) => (
                    <div key={signal} className="flex items-start gap-3 rounded-[10px] bg-white/[0.03] border border-white/10 p-4">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-400 leading-relaxed keep-all">{signal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default AIDiagnostic;
