'use client';

import React from 'react';
import { FadeIn } from './ui/FadeIn';

const faqs = [
  {
    question: 'AEO와 GEO는 SEO와 완전히 다른 작업인가요?',
    answer: '아닙니다. 검색엔진이 이해할 수 있는 기본 SEO 구조가 먼저입니다. 그 위에 질문형 답변, FAQ, 스키마, 외부 신뢰 신호를 쌓아 AI 답변에서도 브랜드가 설명될 수 있게 만드는 방식입니다.',
  },
  {
    question: '병원이나 로컬 매장도 적용할 수 있나요?',
    answer: '적용할 수 있습니다. 병원은 의료진 정보, 질문형 콘텐츠, Google Business Profile 정보 일관성이 중요하고, 외식업과 로컬 매장은 지도 노출, 다국어 정보, 리뷰와 사진 운영이 중요합니다.',
  },
  {
    question: '기존 홈페이지를 모두 다시 만들어야 하나요?',
    answer: '항상 전면 리뉴얼이 필요한 것은 아닙니다. 현재 사이트의 구조, 속도, 콘텐츠, 프로필 연결 상태를 먼저 보고 부분 개선이 가능한지 판단합니다.',
  },
  {
    question: '성과는 무엇으로 확인하나요?',
    answer: '검색 노출, Google Maps 조회와 상호작용, 문의 전환, 블로그 유입, AI referral 유입을 같이 봅니다. AEO/GEO는 순위 하나보다 여러 채널에서 브랜드가 같은 맥락으로 발견되는지가 중요합니다.',
  },
];

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="bg-[#050505] py-28 md:py-36 border-y border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        <FadeIn className="mb-12 text-center">
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight keep-all">자주 묻는 질문</h2>
        </FadeIn>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqs.map((faq, index) => (
            <FadeIn key={faq.question} delay={index * 70}>
              <details className="group py-7">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                  <span className="text-lg md:text-xl font-semibold text-white keep-all">{faq.question}</span>
                  <span className="mt-1 text-brand-blue transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-5 text-gray-400 leading-relaxed keep-all">{faq.answer}</p>
              </details>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
