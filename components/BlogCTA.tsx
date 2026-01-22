'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

const WEBHOOK_URL = 'https://hook.us2.make.com/nrf1jnqab3jl3u73hxaio2afexwqzlv7';

interface FormData {
  name: string;
  phone: string;
  message: string;
}

const BlogCTA: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 연락처 형식 검증 (한국 전화번호)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(01[0-9]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해 주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해 주세요.';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해 주세요. (예: 010-1234-5678)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactName: formData.name,
          phone: formData.phone,
          message: formData.message || '(궁금한 점 미입력)',
          subject: '[블로그] 업장 진단 요청',
          source: 'blog_cta',
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', phone: '', message: '' });
      } else {
        setSubmitError('전송에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      setSubmitError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsSubmitted(false);
    setSubmitError('');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'unset';
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal Content */}
          <div className="relative bg-gray-900/95 backdrop-blur-md rounded-3xl w-full max-w-md border border-white/10 shadow-2xl transform transition-all animate-in fade-in zoom-in duration-300">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              {!isSubmitted ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">무료 업장 진단</h4>
                    <p className="text-gray-400 text-sm">
                      간단한 정보만 입력해주세요.<br />24시간 내 연락드립니다.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* 이름 */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                        이름 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all placeholder-gray-500 ${errors.name ? 'border-red-500' : 'border-white/10'}`}
                        placeholder="홍길동"
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* 전화번호 */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">
                        전화번호 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all placeholder-gray-500 ${errors.phone ? 'border-red-500' : 'border-white/10'}`}
                        placeholder="010-1234-5678"
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* 궁금한 점 */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                        궁금한 점 <span className="text-gray-600">(선택)</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-all placeholder-gray-500 resize-none"
                        placeholder="업종, 현재 고민 등을 자유롭게 적어주세요"
                      />
                    </div>

                    {submitError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-brand-blue text-white py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          전송 중...
                        </span>
                      ) : '진단 신청하기'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">신청 완료!</h4>
                  <p className="text-gray-400 mb-6">
                    24시간 내에 연락드리겠습니다.
                  </p>
                  <button
                    onClick={closeModal}
                    className="text-brand-blue hover:text-white text-sm underline underline-offset-4 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogCTA;
