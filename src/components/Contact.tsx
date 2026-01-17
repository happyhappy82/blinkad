import React, { useState } from 'react';
import { FadeIn } from './ui/FadeIn';

const WEBHOOK_URL = 'https://hook.us2.make.com/698zywep5g6bdl42x8y7vsx7y2455jhh';

const Contact: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 이메일 형식 검증
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 연락처 형식 검증 (한국 전화번호)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(01[0-9]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '상호 또는 기업/기관명을 입력해 주세요.';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = '담당자명을 입력해 주세요.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해 주세요.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해 주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '연락처를 입력해 주세요.';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = '올바른 연락처 형식을 입력해 주세요. (예: 010-1234-5678)';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = '제목을 입력해 주세요.';
    } else if (formData.subject.trim().length < 2) {
      newErrors.subject = '제목은 2글자 이상 입력해 주세요.';
    }

    if (!formData.message.trim()) {
      newErrors.message = '내용을 입력해 주세요.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = '내용은 10글자 이상 입력해 주세요.';
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
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
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
      setFormData({...formData, [name]: value});
      // 입력 시 해당 필드의 에러 메시지 제거
      if (errors[name]) {
        setErrors({...errors, [name]: ''});
      }
  };

  return (
    <section id="contact" className="py-32 bg-black relative border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <FadeIn className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Let's Talk.</h2>
          <p className="text-xl text-gray-500 keep-all">
            첫 페이지로의 여정, 클릭 한 번으로 시작됩니다.
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {/* Row 1: 기업명 / 담당자명 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-500 mb-2 group-focus-within:text-brand-blue transition-colors">
                    상호 또는 기업/기관명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder-gray-600 ${errors.companyName ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="기업명"
                  />
                  {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div className="group">
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-500 mb-2 group-focus-within:text-brand-blue transition-colors">
                    담당자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder-gray-600 ${errors.contactName ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="홍길동"
                  />
                  {errors.contactName && <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>}
                </div>
              </div>

              {/* Row 2: 이메일 / 연락처 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-2 group-focus-within:text-brand-blue transition-colors">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder-gray-600 ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="example@company.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="group">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-500 mb-2 group-focus-within:text-brand-blue transition-colors">
                    연락처 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder-gray-600 ${errors.phone ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="010-1234-5678"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Row 3: 제목 */}
              <div className="group">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-500 mb-2 group-focus-within:text-brand-blue transition-colors">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder-gray-600 ${errors.subject ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="문의 제목을 입력해 주세요"
                />
                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
              </div>

              {/* Row 4: 내용 */}
              <div className="group">
                <label htmlFor="message" className="block text-sm font-medium text-gray-500 mb-2 group-focus-within:text-brand-blue transition-colors">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all placeholder-gray-600 resize-none ${errors.message ? 'border-red-500' : 'border-white/10'}`}
                  placeholder="문의 내용을 자세히 입력해 주세요"
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              {submitError && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {submitError}
                </div>
              )}

              <div className="pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-black hover:bg-gray-200 px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      전송 중...
                    </span>
                  ) : '무료 진단 신청하기'}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">문의가 접수되었습니다.</h3>
                <p className="text-gray-500">담당자가 검토 후 24시간 이내에 연락드리겠습니다.</p>
                <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-brand-blue hover:text-white text-sm mt-4 underline underline-offset-4"
                >
                    다른 문의 작성하기
                </button>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
};

export default Contact;