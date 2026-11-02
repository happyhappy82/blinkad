import type { Metadata } from 'next';
import { ArrowDown, Globe2, Mail, Phone, UserRound } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { NestInlineInquiry } from '@/components/NestInquiry';
import { NEST_ARTICLES } from '@/lib/nest-content';
import FaqAccordion from './FaqAccordion';
import StickyApply from './StickyApply';
import { FAQS, RECORDED } from './faqData';

// 닥터네스트 대표 글 = 「자주 묻는 질문 먼저」 판 (2026-11-03 · 검색 노출 안 함 · 메뉴 · 사이트맵에 넣지 않음)
// 형님 원문: 「맨 처음에 나와야 될 게 자주 묻는 질문들. 자주 묻는 질문에 토글 스위치를 누르면 이제 영상이 재생되는 거지. 시연 영상」
// 메타 잠재 고객 양식 감사 화면 버튼 「닥터네스트 이용사례 보러가기」가 여는 페이지. 첫 판(사용 장면 · 차트 · 화면)은 /doctornest/v1 에 그대로 있다.
// 질문 = 원장님들이 통화 · 미팅 · 카톡에서 실제로 물은 것(많이 · 일찍 나온 순 · 병원 이름과 원문은 싣지 않음).
// 답 = 상품소개서 · 데모 화면 문구 · 본사 확인만. 가격 = 지금 광고 문구 그대로. 영상 = 공용 데모 계정을 블링크애드 녹화기로 새로 찍음.
// 고객 후기 · 성과 숫자 없음. 추적 픽셀 새로 달지 않음.

const TITLE = '닥터네스트 — 원장님들이 실제로 물어본 질문';
const DESCRIPTION = '메신저 통합 · 예약 안내 · AI 응대 · 번역 · 직원 계정 · 요금. 원장님들이 상담에서 실제로 물은 질문에 닥터네스트 데모 화면 영상으로 답합니다.';

export const metadata: Metadata = {
  title: `${TITLE} | BlinkAd`,
  description: DESCRIPTION,
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.blinkad.kr/doctornest',
    siteName: 'BlinkAd',
    images: [{ url: 'https://www.blinkad.kr/nest/doctornest/og.jpg', width: 1200, height: 630 }],
    locale: 'ko_KR',
    type: 'website',
  },
};

// Vercel 미리보기 배포에만 오른쪽 가장자리에 둥근 도구 버튼(vercel.live 피드백 도구)이 붙는다 → 미리보기에서만 오른쪽 여백을 넓힌다(운영 화면은 그대로).
const PREVIEW_SAFE = process.env.VERCEL_ENV === 'preview' ? 'max-lg:[&_main>section>div]:pr-12' : '';

export default function DoctorNestFaqPage() {
  const inboxArticle = NEST_ARTICLES.find(article => article.id === 'h1')!;
  return (
    <div className={`min-h-screen bg-black text-white selection:bg-brand-blue selection:text-white ${PREVIEW_SAFE}`}>
      <Navbar />
      <main className="pb-24 pt-16 lg:pb-0">
        {/* 짧은 첫 줄 */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[24rem] w-[24rem] rounded-full bg-brand-blue/25 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-4xl px-4 pb-6 pt-10 sm:px-6 md:pt-16">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-blue/40 bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-blue-300">닥터네스트 · 병원 · 의원 메신저 상담</p>
            <h1 className="mt-4 text-[1.7rem] font-bold leading-[1.3] tracking-tight keep-all sm:text-4xl">
              원장님들이 실제로 물어본 질문 {FAQS.length}가지
            </h1>
            <p className="mt-3 text-base leading-relaxed text-gray-300 keep-all">
              질문을 누르면 답과 함께 닥터네스트 데모 화면 영상이 바로 재생됩니다.
            </p>
          </div>
        </section>

        {/* 자주 묻는 질문 */}
        <section aria-label="자주 묻는 질문">
          <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6">
            <FaqAccordion faqs={FAQS} />
            <p className="mt-4 text-xs leading-relaxed text-gray-500 keep-all">
              영상 = 닥터네스트 데모 계정 화면을 블링크애드가 녹화({RECORDED}) · 고객 이름 · 연락처는 흐리게 처리 · 영상 속 대화 · 건수는 데모 값입니다.
            </p>
            <a href="#apply" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 hover:text-white">
              더 궁금한 점은 도입 상담으로 <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* 도입 상담 신청 */}
        <section id="apply" className="scroll-mt-20 border-t border-white/10">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold text-blue-400">도입 상담</p>
              <h2 className="mt-3 text-2xl font-bold leading-snug keep-all md:text-3xl">우리 병원에 맞게 쓰는 방법을 안내해 드립니다</h2>
              <p className="mt-4 leading-relaxed text-gray-300 keep-all">지금 쓰는 메신저와 상담 방식을 남겨 주시면, 블링크애드가 연락드려 연결할 채널과 설정 순서를 설명해 드립니다.</p>
              <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm">
                <p className="flex items-center gap-2 text-gray-200"><UserRound className="h-4 w-4 text-blue-300" aria-hidden="true" />블링크애드 권순현 대표 · 닥터네스트 공식 대행사</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-blue-300" aria-hidden="true" /><a href="tel:010-3454-9124" className="text-white underline-offset-4 hover:underline">010-3454-9124</a></p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-blue-300" aria-hidden="true" /><a href="mailto:blinkad@blinkad.kr" className="text-white underline-offset-4 hover:underline">blinkad@blinkad.kr</a></p>
              </div>
              <p className="mt-5 flex gap-2 text-sm leading-relaxed text-gray-400 keep-all"><Globe2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />피부관리 · 반영구 · 네일 · 왁싱 같은 뷰티샵이시면 신청서의 관심 제품에서 「뷰티네스트」를 골라 주세요.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-gray-950 p-5 sm:p-8">
              <NestInlineInquiry article={inboxArticle} origin={{ id: 'doctornest_cases', label: '닥터네스트 자주 묻는 질문 페이지(/doctornest)' }} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <StickyApply />
    </div>
  );
}
