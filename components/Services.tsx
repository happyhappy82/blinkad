'use client';

import React from 'react';
import Link from 'next/link';
import { SERVICES } from '@/constants';
import { FadeIn } from './ui/FadeIn';

const Services: React.FC = () => {
  return (
    <section id="services" className="py-32 bg-black relative">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn className="mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Expertise.</h2>
          <p className="text-xl text-gray-400 max-w-xl keep-all">
            맛집의 성장을 위한 세 가지 핵심 서비스. 온라인에서 발견되고 선택받는 비즈니스를 만듭니다.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <FadeIn key={service.id} delay={index * 150} className="h-full">
              <Link href="/services" className="block h-full">
                <div className="group h-full p-8 rounded-3xl bg-brand-dark border border-white/5 hover:border-brand-blue/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,113,227,0.1)] flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10">
                      <service.icon className="w-6 h-6 text-brand-blue" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-100">{service.title}</h3>
                    <p className="text-gray-400 leading-relaxed keep-all">
                      {service.description}
                    </p>
                  </div>
                  <div className="mt-8 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                     <span className="text-brand-blue text-sm font-semibold">더 알아보기 →</span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;