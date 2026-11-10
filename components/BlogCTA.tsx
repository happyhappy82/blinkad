'use client';

import React, { useState } from 'react';
import DiagnosisModal from './DiagnosisModal';
import { recordBlogConsultationClick } from '@/lib/tracker';
import EnglishModal from '@/localized/en/components/DiagnosisModal';
import JapaneseModal from '@/localized/ja/components/DiagnosisModal';
import ChineseModal from '@/localized/zh/components/DiagnosisModal';
import type { ConsultationLanguage, getBlogConsultation } from '@/lib/blog-consultation';

const BlogCTA = ({ copy, language = 'ko' }: { copy: ReturnType<typeof getBlogConsultation>; language?: ConsultationLanguage }) => {
  const Modal = { ko: DiagnosisModal, en: EnglishModal, ja: JapaneseModal, zh: ChineseModal }[language];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    // 모달 여는 시점에 CTA 클릭 추적 (현재 페이지=글이 origin으로 기록됨)
    recordBlogConsultationClick({
      cta_id: `bl_blog_${copy.topic}_v2`,
      cta_location: 'blog-inline',
      cta_label: copy.button,
    });
    setIsModalOpen(true);
  };

  return (
    <>
      {/* CTA Section */}
      <div className="mt-16 pt-12 border-t border-white/10">
        <div className="bg-gradient-to-br from-brand-blue/20 to-purple-600/20 rounded-3xl p-8 md:p-12 text-center border border-white/10 backdrop-blur-sm">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 keep-all">
            {copy.heading}
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto keep-all">
            {copy.description}
          </p>
          <button
            onClick={openModal}
            className="bg-brand-blue text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-brand-blue/25"
          >
            {copy.button}
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} source="blog_cta" heading={copy.heading} description={copy.description} submitLabel={copy.button} />
    </>
  );
};

export default BlogCTA;
