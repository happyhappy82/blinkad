'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, FileText, Globe2, MapPin, RefreshCcw } from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

const services = [
  {
    title: 'SEO 기반 홈페이지·랜딩 구조 설계',
    description: '검색엔진이 읽을 수 있는 정보 위계와 문의 동선을 기본으로 잡습니다.',
    href: '/services',
    icon: Globe2,
    features: ['시맨틱 HTML과 H 태그 구조', '메타·OG·sitemap 기본 세팅', '문의 전환 CTA 동선 정리', 'Core Web Vitals 고려'],
  },
  {
    title: 'Google Maps & GBP 운영',
    description: '지도에서 발견되고 선택되기 위한 프로필, 사진, 리뷰, 게시물 운영을 설계합니다.',
    href: '/services',
    icon: MapPin,
    features: ['업종·지역 키워드 기반 프로필 정비', '사진·게시물 업데이트 운영', '리뷰 응대 기준 수립', '월간 인사이트 확인'],
  },
  {
    title: 'AEO·GEO 고도화',
    description: 'ChatGPT, Perplexity, Google AI 답변이 브랜드를 이해할 수 있는 답변 구조를 만듭니다.',
    href: '/services',
    icon: Bot,
    features: ['FAQ·HowTo·Article 스키마 설계', '질문형 콘텐츠와 직접 답변 블록', '엔티티 기반 브랜드 설명 정리', 'AI 답변 노출 모니터링'],
  },
  {
    title: '기존 사이트 리뉴얼·검색 개선',
    description: '이미 있는 콘텐츠는 살리고, 검색과 AI가 읽기 어려운 구조를 다시 정리합니다.',
    href: '/services',
    icon: RefreshCcw,
    features: ['현재 사이트 SEO 진단', '정보 구조와 URL 정리', '콘텐츠 보강 우선순위 도출', '리디렉션·마이그레이션 점검'],
  },
  {
    title: '검색형 콘텐츠 운영',
    description: '고객 질문과 업종별 비교 의도를 블로그, 랜딩, FAQ로 축적합니다.',
    href: '/blog',
    icon: FileText,
    features: ['검색 의도 기반 주제 기획', '답변형 원고 구조', '내부 링크와 카테고리 운영', '업데이트 주기 관리'],
  },
];

const Services: React.FC = () => {
  return (
    <section id="services" className="py-20 md:py-32 bg-black relative">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-7 lg:gap-20 items-end mb-10 md:mb-16">
          <FadeIn>
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Services</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight keep-all">제공 서비스</h2>
          </FadeIn>
          <FadeIn delay={120}>
            <p className="text-base md:text-lg text-gray-400 leading-relaxed keep-all">
              단순 제작사가 아니라 검색과 AI 답변에 잡히는 구조까지 설계하는 에이전시입니다.
              홈페이지, Google 프로필, 콘텐츠 운영을 같은 기준으로 맞춥니다.
            </p>
          </FadeIn>
        </div>

        <div className="space-y-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
            <FadeIn key={service.title} delay={index * 80}>
              <Link href={service.href} className="group block">
                <div className="grid grid-cols-1 lg:grid-cols-[96px_0.9fr_1.1fr_140px] gap-5 md:gap-8 items-start rounded-[10px] bg-brand-dark border border-white/10 hover:border-brand-blue/35 p-5 md:p-8 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 tabular-nums">0{index + 1}</span>
                    <div className="w-11 h-11 rounded-[10px] bg-black border border-white/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-blue" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-3 keep-all">{service.title}</h3>
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed keep-all">
                      {service.description}
                    </p>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-400 keep-all">
                        <span className="mt-2 h-1 w-1 rounded-full bg-brand-blue flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="lg:text-right">
                    <span className="inline-flex items-center gap-2 text-brand-blue text-sm font-semibold">
                      자세히 보기
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          )})}
        </div>

        <FadeIn delay={420}>
          <p className="mt-8 text-sm text-gray-600 keep-all">
            업종별 적용 범위: 병원·의료관광, 외국인 방문 매장, 로컬 브랜드, B2B 서비스, 프랜차이즈.
          </p>
        </FadeIn>
      </div>
    </section>
  );
};

export default Services;
