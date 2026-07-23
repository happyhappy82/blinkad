'use client';

import React, { useState } from 'react';
import DiagnosisModal from './DiagnosisModal';
import { recordCtaClick } from '@/lib/tracker';

export default function DiagnosisContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const openModal = () => {
    recordCtaClick({
      cta_id: 'bl_contact_direct_v1',
      cta_location: 'contact-direct',
      cta_label: '내 업장 진단받기',
    });
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,103,255,0.2),transparent_36%),radial-gradient(circle_at_70%_80%,rgba(82,0,120,0.22),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/70 to-transparent" />

      <section className="relative min-h-screen flex items-center justify-center px-5 py-20">
        <div className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950/90 via-gray-950/85 to-purple-950/40 px-6 py-14 md:px-14 md:py-20 text-center shadow-2xl shadow-brand-blue/10">
          <p className="text-brand-blue text-sm font-semibold tracking-[0.28em] uppercase mb-5">BlinkAds Diagnosis</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight keep-all">
            우리 업장도<br className="md:hidden" /> 상위노출 가능할까?
          </h1>
          <p className="mt-6 text-base md:text-xl text-gray-400 keep-all">
            블링크애드 전문가가 무료로 업장 현황을 진단하고<br className="hidden md:block" />
            맞춤 SEO 전략을 제안해드립니다.
          </p>
          <button
            onClick={openModal}
            className="mt-10 bg-brand-blue text-white px-9 py-4 rounded-full font-semibold text-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-brand-blue/25"
          >
            내 업장 진단받기
          </button>
        </div>
      </section>

      <DiagnosisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source="premium_content_contact"
      />
    </main>
  );
}
