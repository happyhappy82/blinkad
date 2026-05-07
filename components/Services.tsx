'use client';

import React from 'react';
import Link from 'next/link';
import { SERVICES } from '@/constants';
import { FadeIn } from './ui/FadeIn';

const Services: React.FC = () => {
  return (
    <section id="services" className="py-32 bg-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-12 lg:gap-20 items-end mb-16">
          <FadeIn>
            <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Services</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight keep-all">브랜드가 발견되는 경로를 다시 설계합니다.</h2>
          </FadeIn>
          <FadeIn delay={120}>
            <p className="text-lg text-gray-400 leading-relaxed keep-all">
              블링크애드는 단일 광고 캠페인보다 검색과 AI 답변에 남는 구조를 우선합니다.
              로컬 프로필, 콘텐츠, AI 검색 대응을 같은 방향으로 운영합니다.
            </p>
          </FadeIn>
        </div>

        <div className="space-y-4">
          {SERVICES.map((service, index) => (
            <FadeIn key={service.id} delay={index * 120}>
              <Link href="/services" className="group block">
                <div className="grid grid-cols-1 md:grid-cols-[96px_1fr_220px] gap-6 md:gap-8 items-start md:items-center rounded-[10px] bg-brand-dark border border-white/10 hover:border-brand-blue/35 p-6 md:p-8 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 tabular-nums">0{index + 1}</span>
                    <div className="w-11 h-11 rounded-[10px] bg-black border border-white/10 flex items-center justify-center">
                      <service.icon className="w-5 h-5 text-brand-blue" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-100 mb-3 keep-all">{service.title}</h3>
                    <p className="text-gray-400 leading-relaxed keep-all">
                      {service.description}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <span className="inline-flex items-center gap-2 text-brand-blue text-sm font-semibold">
                      자세히 보기
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
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
