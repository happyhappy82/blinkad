'use client';

import React from 'react';
import { ArrowUpRight, Bot, Braces, Globe2 } from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

const stack = [
  {
    name: '기본 탑재 SEO',
    title: '검색엔진최적화',
    detail: '메타태그, 시맨틱 마크업, 크롤링과 인덱싱 구조를 기본으로 잡아 Google과 Naver 검색 기반을 만듭니다.',
    icon: Globe2,
    bullets: ['메타태그 & 시맨틱 마크업', 'Core Web Vitals 고려', '크롤링 & 인덱싱 설계'],
    result: '검색 결과에서 발견되는 기반',
  },
  {
    name: '기본 탑재 AEO',
    title: 'AI 답변 최적화',
    detail: '질문형 콘텐츠, FAQ, 구조화 데이터를 통해 AI가 답변에 채택하기 쉬운 정보 블록을 만듭니다.',
    icon: Braces,
    bullets: ['FAQ·Article 스키마', '2-5문장 직접 답변', 'Entity 기반 콘텐츠 설계'],
    result: 'AI 답변에 정보 채택 가능성 강화',
  },
  {
    name: '고도화 옵션 GEO',
    title: '생성형 AI 최적화',
    detail: '브랜드 설명, 외부 신뢰 신호, Google 프로필, 콘텐츠 허브를 연결해 ChatGPT와 Perplexity 추천까지 확장합니다.',
    icon: Bot,
    bullets: ['Knowledge Graph 관점 설계', 'LLM 인용 최적화 구조', '브랜드 신뢰도 신호 강화'],
    result: 'ChatGPT·Perplexity 추천 후보화',
  },
];

const stats = [
  ['56,719', 'GBP 프로필 조회', '실제 운영 사례 기준'],
  ['41,930', '검색 노출', 'Google 비즈니스 프로필 인사이트'],
  ['3,562', '상호작용', '전화·경로·웹사이트 액션'],
  ['2h', '초기 진단 응답', '업무시간 내 기준'],
];

const MethodStack: React.FC = () => {
  return (
    <section id="method" className="bg-[#050505] py-28 md:py-36 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16 lg:gap-24">
          <FadeIn>
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Method</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight keep-all">
              SEO → AEO → GEO<br className="hidden md:block" />
              3단계 통합 최적화 기술
            </h2>
            <p className="mt-6 text-lg text-gray-400 leading-relaxed keep-all">
              SEO와 AEO는 기본 구조로 탑재하고, GEO 고도화로 AI 추천과 인용 가능성까지 확장합니다.
              홈페이지와 프로필 운영을 따로 보지 않는 방식입니다.
            </p>
            <a
              href="#contact"
              className="mt-9 inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 font-semibold transition-colors"
            >
              우리 브랜드 진단하기
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </FadeIn>

          <div className="grid grid-cols-1 gap-4">
            {stack.map((item, index) => {
              const Icon = item.icon;
              return (
                <FadeIn key={item.name} delay={index * 90}>
                  <div className="group border border-white/10 bg-black hover:border-brand-blue/35 rounded-[10px] p-6 md:p-7 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
                      <div className="w-11 h-11 rounded-[10px] bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand-blue" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-brand-blue font-semibold mb-1">{item.name}</p>
                        <h3 className="text-xl font-bold text-white mb-2 keep-all">{item.title}</h3>
                        <p className="text-sm md:text-base text-gray-400 leading-relaxed keep-all">{item.detail}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-5">
                      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {item.bullets.map((bullet) => (
                          <li key={bullet} className="rounded-[8px] bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-gray-400 keep-all">
                            ✓ {bullet}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm font-semibold text-white md:text-right keep-all">→ {item.result}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 border border-white/10 rounded-[10px] overflow-hidden">
          {stats.map(([value, label, note]) => (
            <div key={label} className="p-6 md:p-7 bg-brand-dark border-r border-b lg:border-b-0 border-white/10 last:border-r-0">
              <p className="text-3xl md:text-4xl font-bold text-white">{value}</p>
              <p className="mt-2 text-sm font-semibold text-gray-300 keep-all">{label}</p>
              <p className="mt-1 text-xs text-gray-600 keep-all">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MethodStack;
