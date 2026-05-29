'use client';

import React, { useState } from 'react';
import DiagnosisModal from './DiagnosisModal';
import { recordCtaClick } from '@/lib/tracker';

const BlogCTA: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    // 모달 여는 시점에 CTA 클릭 추적 (현재 페이지=글이 origin으로 기록됨)
    recordCtaClick({
      cta_id: 'bl_blog_post-inline_v1',
      cta_location: 'blog-inline',
      cta_label: '내 업장 진단받기',
    });
    setIsModalOpen(true);
  };

  return (
    <>
      {/* CTA Section */}
      <div className="mt-16 pt-12 border-t border-white/10">
        <div className="bg-gradient-to-br from-brand-blue/20 to-purple-600/20 rounded-3xl p-8 md:p-12 text-center border border-white/10 backdrop-blur-sm">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 keep-all">
            우리 업장도 상위노출 가능할까?
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto keep-all">
            블링크애드 전문가가 무료로 업장 현황을 진단하고<br className="hidden md:block" />
            맞춤 SEO 전략을 제안해드립니다.
          </p>
          <button
            onClick={openModal}
            className="bg-brand-blue text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-brand-blue/25"
          >
            내 업장 진단받기
          </button>
        </div>
      </div>

      <DiagnosisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} source="blog_cta" />
    </>
  );
};

export default BlogCTA;
