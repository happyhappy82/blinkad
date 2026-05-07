'use client';

import React from 'react';
import { FadeIn } from './ui/FadeIn';

const faqs = [
  {
    question: 'Google 비즈니스 프로필 관리만으로 시작할 수 있나요?',
    answer: '가능합니다. 외국인 고객 유입을 먼저 확인하려면 Google 프로필의 카테고리, 사진, 영업정보, 리뷰, 게시물 운영부터 정비하는 것이 가장 현실적입니다.',
  },
  {
    question: '홈페이지가 없어도 진행할 수 있나요?',
    answer: '초기에는 Google 프로필 관리만으로 시작할 수 있습니다. 다만 장기적으로는 프로필에서 설명하기 어려운 서비스, 가격대, 예약 동선, FAQ를 담을 웹사이트나 랜딩페이지가 있으면 전환과 신뢰에 유리합니다.',
  },
  {
    question: '블로그 콘텐츠는 왜 같이 운영하나요?',
    answer: '고객이 검색하는 질문은 Google 프로필 하나로 모두 담기 어렵습니다. 블로그와 FAQ 콘텐츠는 지역, 서비스, 비교, 방문 전 질문을 쌓는 역할을 하고, 장기적으로 AI가 참고할 수 있는 브랜드 정보가 됩니다.',
  },
  {
    question: 'AEO·GEO는 당장 효과가 나는 상품인가요?',
    answer: '단기 상품이라기보다 운영 방향에 가깝습니다. 당장은 Google 프로필과 콘텐츠를 관리하고, 그 과정에서 브랜드 설명과 질문형 답변을 일관되게 쌓아 AI가 이해할 수 있는 구조로 만드는 방식입니다.',
  },
];

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="bg-[#050505] py-20 md:py-36 border-y border-white/5">
      <div className="max-w-4xl mx-auto px-5 md:px-6">
        <FadeIn className="mb-9 md:mb-12 text-center">
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">FAQ</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight keep-all">자주 묻는 질문</h2>
        </FadeIn>

        <div className="divide-y divide-white/10 border-y border-white/10">
          {faqs.map((faq, index) => (
            <FadeIn key={faq.question} delay={index * 70}>
              <details className="group py-6 md:py-7">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-left">
                  <span className="text-base md:text-xl font-semibold text-white keep-all">{faq.question}</span>
                  <span className="mt-1 text-brand-blue transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 md:mt-5 text-sm md:text-base text-gray-400 leading-relaxed keep-all">{faq.answer}</p>
              </details>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
