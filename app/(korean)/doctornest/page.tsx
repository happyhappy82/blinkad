import type { Metadata } from 'next';
import { ArrowDown, ArrowRight, Clock3, Globe2, Inbox, Languages, Mail, MessageCircle, Phone, UserRound } from 'lucide-react';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { NestInlineInquiry } from '@/components/NestInquiry';
import { NEST_ARTICLES } from '@/lib/nest-content';
import CaseVideo from './CaseVideo';
import ChatReplay from './ChatReplay';
import StickyApply from './StickyApply';

// 닥터네스트 사용 사례 페이지 (2026-11-02 초안 · 검색 노출 안 함 · 메뉴 · 사이트맵에 넣지 않음)
// 메타 잠재 고객 양식 완료 화면의 「사용 사례 바로 보기」 버튼이 여는 페이지. 나중에 광고 도착 페이지로도 쓸 수 있게 맨 아래에 신청 칸을 둔다.
// 규칙: 제품 설명은 상품소개서 v2(2026-10-29)와 데모 계정 화면에 있는 것만. 숫자는 통계근거_260908 에 있는 것만, 출처를 같은 화면에 적는다.
// 고객 후기 · 고객사 성과는 넣지 않는다(없는 것을 만들지 않는다). 가격은 소개서 v2에 없어서 넣지 않는다. 추적 픽셀은 새로 달지 않는다.

const TITLE = '닥터네스트 사용 사례 — 흩어진 메신저 문의를 한 화면에서';
const DESCRIPTION = '카카오톡 · 인스타그램 · 네이버 톡톡 · 라인 · 위챗 · 왓츠앱 문의를 한 목록에서 받고, 진료 시간 밖 문의에는 AI가 먼저 답하는 모습을 닥터네스트 데모 화면으로 보여 드립니다.';

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

const ASSET = '/nest/doctornest';
const CHANNELS = ['카카오톡', '인스타그램', '네이버 톡톡', '라인', '위챗', '왓츠앱'] as const;

const SCENES = [
  {
    id: 'scene-ai',
    no: '01',
    icon: Clock3,
    title: '진료 시간이 끝난 뒤 들어온 문의에 AI가 먼저 답합니다',
    body: [
      '병원설정에서 「운영시간 외 AI 자동응대」를 켜 두면, 운영시간이 끝난 뒤 들어온 질문에 AI가 답합니다. AI는 병원이 라이브러리에 올려 둔 시술 문서를 찾아 답하고, 고객이 쓴 언어로 번역해 보냅니다.',
      '같은 때 「운영시간 외 안내」도 나갑니다. 상담원과 이야기하고 싶은 고객에게 성함과 연락처를 남겨 달라고 안내하는 문구입니다. 안내는 문의가 온 뒤 즉시(최대 10초)부터 30분 후까지 병원이 정한 시간에 보냅니다.',
    ],
    video: { src: `${ASSET}/v1_ai_answer.mp4`, poster: `${ASSET}/v1_ai_answer.jpg`, seconds: 55.8, label: '닥터네스트 데모 화면 녹화 — 운영시간 외 AI 자동응대' },
    steps: [
      '① 운영시간 외 AI 자동응대 — 지금 켜져 있음 「채팅방의 AI 자동답변이 꺼져 있어도 AI가 고객 질문에 답변합니다」',
      '실제 데모 대화 — 인스타그램으로 들어온 외국인 문의',
      '고객은 영어로 물었고 → 직원 화면엔 한국어로 보입니다 (원문 · 영어: I’m curious about the lifting effect!)',
      '오후 10:00 — 운영시간 외 안내가 나가고 「현재 AI 챗봇과 상담중입니다」',
      '같은 시각 닥터AI가 답했습니다 → 고객에게는 영어로 번역돼 나갔습니다 (발송 · 영어)',
      '② 채팅창별 AI 자동답변 — 이 방만 켜면 운영시간 중에도 AI가 고객에게 바로 보냅니다 (지금 꺼짐)',
      '③ AI 상담 도우미 — 새 고객 메시지에 답변 예시를 제안 「고객에게 전송되지 않습니다」 · 지금 꺼짐',
    ],
  },
  {
    id: 'scene-inbox',
    no: '02',
    icon: Inbox,
    title: '여러 메신저로 온 문의를 한 목록에서 받고 답합니다',
    body: [
      '카카오톡 · 인스타그램 · 네이버 톡톡 · 라인 · 위챗 · 왓츠앱 문의가 한 목록에 쌓입니다. 줄마다 어느 메신저로 온 문의인지 아이콘으로 보이고, 답은 같은 화면에서 그 메신저로 보냅니다.',
      '새 문의를 직원 모두가 함께 볼지, 먼저 연 직원이 맡을지도 병원이 정합니다. 메신저 연결은 각 플랫폼의 심사와 사업자 인증을 마친 뒤 켜집니다.',
    ],
    video: { src: `${ASSET}/v3_channels.mp4`, poster: `${ASSET}/v3_channels.jpg`, seconds: 53.6, label: '닥터네스트 데모 화면 녹화 — 여러 메신저 문의를 한 목록에서' },
    steps: [
      '줄마다 어느 메신저로 온 문의인지 아이콘으로 표시합니다',
      '채널 필터로 메신저별로 골라 봅니다',
      'WhatsApp 문의만 골라 보면 3건입니다',
      'WhatsApp 문의에는 WhatsApp 입력창으로 답합니다',
      'WeChat 문의만 골라 보면 4건입니다',
      'WeChat 문의도 같은 화면에서 답합니다',
      'Facebook Messenger 문의는 2건입니다',
      '전체 채널로 돌아오면 문의 43건이 한 목록입니다',
    ],
  },
  {
    id: 'scene-translate',
    no: '03',
    icon: Languages,
    title: '외국어 문의는 한국어로 읽고, 한국어로 답합니다',
    body: [
      '외국어로 온 문의는 직원 화면에 한국어 번역과 원문이 함께 보입니다. 직원이 한국어로 답을 쓰면 고객의 언어로 번역돼 나갑니다.',
      '운영시간 외 안내 문구는 한국어 · 일본어 · 영어 · 중국어(간체 · 번체) · 광둥어 · 태국어 · 베트남어 · 러시아어로 따로 정해 둘 수 있습니다.',
    ],
    video: { src: `${ASSET}/v4_translate.mp4`, poster: `${ASSET}/v4_translate.jpg`, seconds: 54.6, label: '닥터네스트 데모 화면 녹화 — 자동 번역' },
    steps: [
      '인스타그램으로 들어온 영어 문의입니다 (9월 17일)',
      '받은 메시지 — 위는 한국어 번역, 아래는 「원문 · 영어」입니다',
      '보낸 답 — 한국어 원문 아래에 「발송 · 영어」 번역이 함께 보입니다',
      '입력창 옆에 고객 언어 「영어」와 자동 번역 켜짐이 보입니다',
      '카카오로 온 영어 문의도 한국어 번역과 원문이 함께 보입니다',
      '상담사(나)가 한국어로 쓴 답이 「발송 · 영어」로 나갔습니다',
    ],
  },
  {
    id: 'scene-notify',
    no: '04',
    icon: MessageCircle,
    title: '시술 다음 날 · 예약 전날 안내가 자동으로 나갑니다',
    body: [
      '시술태그마다 보낼 안내를 등록해 두면 정한 날짜에 카카오 알림톡 · 라인 · 왓츠앱으로 자동 발송됩니다. 예약 안내는 확정 · 전날 · 당일 · 변경 4가지를 따로 정합니다.',
      '알림톡 문구는 채널마다 검수를 거치며, 검수 상태(완료 · 검수중 · 반려 · 준비 필요)가 화면에 따로 보입니다.',
    ],
    video: { src: `${ASSET}/v7_revisit.mp4`, poster: `${ASSET}/v7_revisit.jpg`, seconds: 65.5, label: '닥터네스트 데모 화면 녹화 — 자동알림' },
    steps: [
      '시술태그마다 보낼 안내를 등록합니다 — 울쎄라 · 보톡스 · 써마지',
      '써마지 D+1 — 시술 다음 날 오전 10:00에 보낼 문구입니다 (오른쪽 미리보기)',
      '채널마다 검수 상태(완료 · 검수중 · 반려 · 준비 필요)가 따로 보입니다',
      '예약 안내 4가지 — 확정 · 전날 · 당일 · 변경',
      '예약은 직원이 예약관리에 넣습니다 — 9월 28일 예약 3건',
      '예약 전날 「예약 전날 안내 (D-1)」 카카오 알림톡이 전달됐습니다',
      '예약 당일에는 「예약 당일 안내」 알림톡이 전달됐습니다',
      '이 예약(9월 28일 11:30)에 「자동알림 2건 발송 완료 · 마지막 D-Day」가 표시됩니다',
    ],
    flow: [
      { day: 'D+1', label: '시술 직후 안내' },
      { day: 'D+3', label: '경과 주의사항' },
      { day: 'D+7', label: '상태 확인' },
      { day: 'D+10', label: '재방문 제안' },
    ],
  },
] as const;

const SCREENS = [
  { src: `${ASSET}/s_list.webp`, w: 528, h: 885, title: '고객채팅 목록', text: '문의마다 어느 메신저로 왔는지 아이콘이 붙습니다. 문의 첫 줄과 받은 때가 함께 보입니다.' },
  { src: `${ASSET}/s_chat_en.webp`, w: 1068, h: 1665, title: '왓츠앱 영어 문의와 닥터AI 답', text: '입력창 아래 「AI 자동답변」 「자동 번역」 스위치를 방마다 켜고 끕니다.' },
  { src: `${ASSET}/s_chat_ja.webp`, w: 1068, h: 1665, title: '라인 일본어 문의와 닥터AI 답', text: '고객 언어가 「일본어」로 잡혀 있으면 답도 일본어로 나갑니다.' },
  { src: `${ASSET}/s_auto_reply.webp`, w: 1100, h: 880, title: 'AI자동응대 설정', text: '「운영시간 외에는 채팅방의 AI 자동답변이 꺼져 있어도 AI가 고객 질문에 답변합니다.」 언어별 안내 문구 9가지를 따로 씁니다.' },
  { src: `${ASSET}/s_automations.webp`, w: 1100, h: 514, title: '자동알림 — 시술태그별', text: '울쎄라 · 보톡스 D+1 · 써마지 D+1 · D+5처럼 시술태그마다 안내를 등록하고, 채널별 검수 상태를 봅니다.' },
] as const;

const JOBS = [
  { group: '유입 · 상담', name: '해외환자 DB 마케팅 · 국내 인플루언서 마케팅', text: '해외 환자 DB 광고와 국내 인플루언서 체험단을 닥터네스트 마케팅 메뉴에서 신청합니다.' },
  { group: '유입 · 상담', name: '상담채널 통합', text: '카카오톡 · 인스타그램 · 네이버 톡톡 · 라인 · 위챗 · 왓츠앱 문의를 한 목록에서 받고 답합니다.' },
  { group: '유입 · 상담', name: 'AI 코디네이터 · 시술 매뉴얼', text: '병원이 올린 시술 문서를 근거로 AI가 답변 예시를 보여 주고, 운영시간 밖에는 고객에게 직접 답합니다.' },
  { group: '자동화 · 재방문', name: 'AI 자동 번역', text: '외국어 문의는 한국어로 보이고, 한국어로 쓴 답은 고객 언어로 번역돼 나갑니다.' },
  { group: '자동화 · 재방문', name: '알림톡 예약 발송', text: '시술태그별 D+N 안내와 예약 확정 · 전날 · 당일 · 변경 안내를 자동으로 보냅니다.' },
  { group: '자동화 · 재방문', name: '병원 대시보드', text: '고객 현황 · 유입 경로 · 자동알림 발송 건수 · 시술별 판매 · 예약 현황을 한 화면에서 봅니다.' },
] as const;

const SOURCES = [
  { id: 1, text: '과학기술정보통신부, 「2024 인터넷이용실태조사」 결과 보도자료(2025-03). 전국 25,509가구 · 만 3세 이상 가구원 조사.' },
  { id: 2, text: 'Meta × BCG, 「The Quiet Channel Revolution Across Tech」(2022-08). 호주 · 인도네시아 · 한국 · 필리핀 · 대만 · 태국 · 베트남 소비자 4,000명 이상 · 기업 2,500곳.', href: 'https://www.facebook.com/business/news/business-messaging-report-APAC-BCG-Meta' },
  { id: 3, text: 'Oldroyd · McElheran · Elkington, 「The Short Life of Online Sales Leads」, Harvard Business Review(2011-03). 미국 회사 2,241곳 응답 조사 · 미국 42개 회사(B2C 29 · B2B 13)의 문의 125만 건 분석. 병원만 따로 본 결과가 아닙니다.', href: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads' },
  { id: 4, text: 'Robotham 외, BMJ Open 2016;6:e012116. 진료 예약 문자 · 전자 알림 연구 메타분석(주 분석 21편 · 환자 16,076명 · 유럽 · 아시아 · 아프리카 · 호주 · 미국).', href: 'https://bmjopen.bmj.com/content/6/10/e012116' },
  { id: 5, text: '닥터네스트 데모 계정 화면(doctornest.ai). 화면 캡처 2026-09-14 · 예약 안내 화면 2026-10-07 · 영상 녹화 2026-09-29~30. 고객 이름 · 연락처는 가렸습니다.' },
  { id: 6, text: '닥터네스트 상품소개서(블링크애드 배포본, 2026-10-29) — 기능 6가지 · 시술 후 사후관리 순서 · 도입 상담 연락처.' },
] as const;

function Sup({ n }: { n: number }) {
  return <a href={`#src-${n}`} className="ml-0.5 align-super text-[0.7em] text-blue-400 hover:underline">[{n}]</a>;
}

// 막대 길이는 값에 비례(0에서 시작). 값은 막대 옆에 글자로 적어 색만으로 읽지 않게 한다.
function Bar({ label, value, max, strong = false }: { label: string; value: number; max: number; strong?: boolean }) {
  return (
    <div className="grid grid-cols-[6.25rem_1fr_2.75rem] items-center gap-2" title={`${label} ${value}%`}>
      <span className="text-sm text-gray-300 keep-all">{label}</span>
      <span className="block h-3.5 w-full" aria-hidden="true">
        <span className={`block h-3.5 rounded-r-[4px] ${strong ? 'bg-[#3B82F6]' : 'bg-[#93C5FD]'}`} style={{ width: `${(value / max) * 100}%` }} />
      </span>
      <span className="text-right text-sm font-semibold tabular-nums text-white">{value}%</span>
    </div>
  );
}

export default function DoctorNestCasePage() {
  const inboxArticle = NEST_ARTICLES.find(article => article.id === 'h1')!;
  return (
    <div className="min-h-screen bg-black text-white selection:bg-brand-blue selection:text-white">
      <Navbar />
      <main className="pb-24 pt-16 lg:pb-0">
        {/* ① 첫 화면 — 원장님이 겪는 문제 + 자동 답이 도는 대화 */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand-blue/25 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="lg:pt-16">
              <p className="inline-flex items-center gap-2 rounded-full border border-brand-blue/40 bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-blue-300">닥터네스트 사용 사례 · 병원 · 의원용</p>
              <h1 className="mt-5 text-[1.85rem] font-bold leading-[1.3] tracking-tight keep-all sm:text-4xl md:text-5xl">
                메신저마다 흩어진 환자 문의,<br />
                <span className="text-blue-400">한 화면에서 받고 답합니다</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-gray-300 keep-all md:text-lg">
                카카오톡 · 인스타그램 · 네이버 톡톡 · 라인 · 위챗 · 왓츠앱으로 들어오는 문의를 한 목록에 모읍니다. 진료 시간이 끝난 뒤 들어온 문의에는 AI가 먼저 답하고, 외국어 문의는 한국어로 번역해 보여 줍니다.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-400 keep-all">
                이 페이지의 영상과 화면은 모두 닥터네스트 데모 계정에서 녹화 · 캡처한 실제 화면입니다.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#demo" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-semibold text-black hover:bg-gray-200">
                  실제 화면 먼저 보기 <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="#apply" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3.5 font-semibold text-white hover:bg-white/10">
                  도입 상담 신청 <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <p className="mt-6 text-sm text-gray-400 keep-all">닥터네스트 도입 상담은 공식 대행사 블링크애드가 도와드립니다.<Sup n={6} /></p>
            </div>
            <ChatReplay />
          </div>
        </section>

        {/* ①-2 병원 문의에서 자주 생기는 일 */}
        <section className="border-b border-white/10 bg-[#050505]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
            <p className="text-sm font-semibold text-blue-400">지금 병원 상담 창구</p>
            <h2 className="mt-3 text-2xl font-bold leading-snug keep-all md:text-3xl">환자는 각자 쓰는 메신저로 묻습니다</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-gray-400">한국 인터넷 이용자 중 메신저를 쓰는 사람</p>
                <p className="mt-1 text-4xl font-bold tabular-nums">97.7%</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-300 keep-all">그중 가장 많이 쓰는 메신저는 카카오톡(98.0%)입니다.<Sup n={1} /></p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-gray-400">전화 · 이메일보다 채팅으로 기업에 연락하고 싶은 소비자</p>
                <p className="mt-1 text-4xl font-bold tabular-nums">65%</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-300 keep-all">한국을 포함한 아시아 · 태평양 7개국 조사입니다.<Sup n={2} /></p>
              </div>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { t: '메신저 앱을 하나씩 열어 봅니다', d: '카카오톡 채널 · 인스타그램 DM · 네이버 톡톡을 따로 확인하면, 어느 문의에 답했는지 다시 찾아야 합니다.' },
                { t: '진료가 끝나면 답도 멈춥니다', d: '저녁 · 휴진일에 들어온 문의는 다음 진료일 아침까지 답을 기다립니다.' },
                { t: '외국어 문의는 번역기를 오갑니다', d: '문의를 번역기에 붙여 넣어 읽고, 답을 다시 번역해 보냅니다.' },
                { t: '담당 직원이 바뀌면 처음부터 다시 묻습니다', d: '지난 상담 내용과 메모가 직원 개인 메신저에 남아 있으면, 다음 직원이 이어서 상담하기 어렵습니다.' },
              ].map(item => (
                <li key={item.t} className="rounded-2xl border border-white/10 p-5">
                  <p className="font-semibold text-white keep-all">{item.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400 keep-all">{item.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ② 실제 화면으로 보는 사용 장면 4가지 */}
        <section id="demo" className="scroll-mt-20 border-b border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
            <p className="text-sm font-semibold text-blue-400">사용 장면 4가지 · 실제 데모 화면</p>
            <h2 className="mt-3 text-2xl font-bold leading-snug keep-all md:text-3xl">닥터네스트를 쓰면 상담 창구가 이렇게 돌아갑니다</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-400 keep-all">영상은 소리 없이 반복됩니다. 휴대폰에서는 「크게 보기」를 누르면 가로 전체 화면으로 볼 수 있습니다. 영상 속 글씨는 아래 「장면 순서」에 그대로 적어 두었습니다.</p>
            <div className="mt-10 space-y-16 md:space-y-24">
              {SCENES.map(scene => {
                const Icon = scene.icon;
                return (
                  <article key={scene.id} id={scene.id} className="grid scroll-mt-20 gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-blue-400"><Icon className="h-4 w-4" aria-hidden="true" />장면 {scene.no}</p>
                      <h3 className="mt-2 text-xl font-bold leading-snug keep-all md:text-2xl">{scene.title}</h3>
                      {scene.body.map(p => <p key={p} className="mt-4 leading-relaxed text-gray-300 keep-all">{p}<Sup n={5} /></p>)}
                      {scene.id === 'scene-inbox' && (
                        <ul className="mt-5 flex flex-wrap gap-2" aria-label="연결 채널">
                          {CHANNELS.map(c => <li key={c} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-sm text-gray-200">{c}</li>)}
                        </ul>
                      )}
                      {'flow' in scene && (
                        <div className="mt-6 rounded-2xl border border-brand-blue/30 bg-brand-blue/10 p-4">
                          <p className="text-sm font-semibold text-blue-200">시술 후 사후관리 순서 — 소개서 예시</p>
                          <ol className="mt-3 grid grid-cols-4 gap-2 text-center">
                            {scene.flow.map(f => (
                              <li key={f.day} className="rounded-xl bg-black/40 px-1 py-3">
                                <p className="text-base font-bold tabular-nums text-white">{f.day}</p>
                                <p className="mt-1 text-[11px] leading-tight text-gray-300 keep-all">{f.label}</p>
                              </li>
                            ))}
                          </ol>
                          <p className="mt-3 text-xs text-gray-400 keep-all">날짜와 문구는 병원이 시술마다 정합니다.<Sup n={6} /></p>
                        </div>
                      )}
                    </div>
                    <CaseVideo src={scene.video.src} poster={scene.video.poster} label={scene.video.label} seconds={scene.video.seconds} steps={scene.steps} />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ③ 기대 효과 — 공개 조사 숫자만, 출처와 함께 */}
        <section id="effect" className="scroll-mt-20 border-b border-white/10 bg-[#050505]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
            <p className="text-sm font-semibold text-blue-400">기대 효과</p>
            <h2 className="mt-3 text-2xl font-bold leading-snug keep-all md:text-3xl">빨리 답하고, 미리 알리면 달라지는 것</h2>
            <p className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm leading-relaxed text-yellow-100 keep-all">
              아래 숫자는 닥터네스트를 쓴 병원의 결과가 아닙니다. 문의 응답 속도와 예약 알림에 관해 공개된 조사 · 연구 결과이며, 출처를 함께 적었습니다.
            </p>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <figure className="rounded-2xl border border-white/10 bg-black p-5">
                <figcaption>
                  <p className="font-semibold leading-snug keep-all">온라인 문의를 받은 회사가 처음 답한 시점</p>
                  <p className="mt-1 text-xs text-gray-400">미국 회사 2,241곳에 문의를 넣어 잰 결과<Sup n={3} /></p>
                </figcaption>
                <div className="mt-5 space-y-3">
                  <Bar label="1시간 안" value={37} max={40} strong />
                  <Bar label="1~24시간" value={16} max={40} />
                  <Bar label="24시간 넘게" value={24} max={40} />
                  <Bar label="끝내 답 없음" value={23} max={40} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-300 keep-all">30일 안에 답한 회사만 따져도 평균 응답 시간은 <strong className="text-white">42시간</strong>이었습니다.</p>
              </figure>

              <figure className="rounded-2xl border border-white/10 bg-black p-5">
                <figcaption>
                  <p className="font-semibold leading-snug keep-all">1시간 안에 연락한 회사가 상담으로 이어 간 정도</p>
                  <p className="mt-1 text-xs text-gray-400">미국 42개 회사 · 문의 125만 건 분석<Sup n={3} /></p>
                </figcaption>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <p className="whitespace-nowrap text-2xl font-bold tabular-nums sm:text-3xl">약 7배</p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-300 keep-all">한 시간 늦게 연락한 회사와 비교</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <p className="whitespace-nowrap text-2xl font-bold tabular-nums sm:text-3xl">60배 이상</p>
                    <p className="mt-2 text-xs leading-relaxed text-gray-300 keep-all">24시간 이상 기다린 회사와 비교</p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-gray-400 keep-all">「상담으로 이어 감」은 원문의 qualify the lead — 결정권자와 의미 있는 대화를 나눈 경우입니다. 매출을 잰 숫자가 아닙니다.</p>
              </figure>

              <figure className="rounded-2xl border border-white/10 bg-black p-5">
                <figcaption>
                  <p className="font-semibold leading-snug keep-all">예약 알림을 받은 환자와 받지 않은 환자의 노쇼율</p>
                  <p className="mt-1 text-xs text-gray-400">진료 예약 문자 · 전자 알림 연구 메타분석<Sup n={4} /></p>
                </figcaption>
                <div className="mt-5 space-y-3">
                  <Bar label="알림 받지 않음" value={21} max={25} />
                  <Bar label="알림 받음" value={15} max={25} strong />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-300 keep-all">여러 번 보낸 알림이 한 번 보낸 알림보다 내원율을 더 높였습니다.</p>
              </figure>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <p className="rounded-2xl border border-white/10 p-5 text-sm leading-relaxed text-gray-300 keep-all"><span className="font-semibold text-white">닥터네스트에서는</span> 진료 시간 밖 문의에도 AI가 먼저 답하고, 운영시간 외 안내를 병원이 정한 시간(즉시 ~ 30분 후)에 보냅니다.<Sup n={5} /></p>
              <p className="rounded-2xl border border-white/10 p-5 text-sm leading-relaxed text-gray-300 keep-all"><span className="font-semibold text-white">닥터네스트에서는</span> 예약 확정 · 전날 · 당일 · 변경 안내와 시술 뒤 D+N 안내를 자동으로 보냅니다.<Sup n={5} /></p>
            </div>
          </div>
        </section>

        {/* ④ 실제 화면 */}
        <section id="screens" className="scroll-mt-20 border-b border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
            <p className="text-sm font-semibold text-blue-400">실제 화면</p>
            <h2 className="mt-3 text-2xl font-bold leading-snug keep-all md:text-3xl">데모 계정 화면을 그대로 보여 드립니다</h2>
            <p className="mt-3 text-sm text-gray-400 keep-all">그림을 누르면 원본 크기로 열립니다. 휴대폰에서는 옆으로 밀어 다음 화면을 봅니다.<Sup n={5} /></p>
            <ul className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
              {SCREENS.map(s => (
                <li key={s.src} className="w-[82%] shrink-0 snap-center md:w-auto">
                  <a href={s.src} target="_blank" rel="noopener" className="block overflow-hidden rounded-xl border border-white/10 bg-white">
                    <img src={s.src} alt={`닥터네스트 데모 화면 — ${s.title}`} width={s.w} height={s.h} loading="lazy" className="block max-h-[460px] w-full object-cover object-top" />
                  </a>
                  <p className="mt-3 font-semibold keep-all">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400 keep-all">{s.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ⑤ 닥터네스트가 맡는 일 (상품소개서 기능 6가지) */}
        <section className="border-b border-white/10 bg-[#050505]">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
            <p className="text-sm font-semibold text-blue-400">한눈에</p>
            <h2 className="mt-3 text-2xl font-bold leading-snug keep-all md:text-3xl">닥터네스트가 맡는 일 6가지<Sup n={6} /></h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {JOBS.map(job => (
                <li key={job.name} className="rounded-2xl border border-white/10 bg-black p-5">
                  <p className="text-xs font-semibold text-blue-300">{job.group}</p>
                  <p className="mt-2 font-semibold keep-all">{job.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400 keep-all">{job.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ⑥ 도입 상담 신청 */}
        <section id="apply" className="scroll-mt-20">
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
              <NestInlineInquiry article={inboxArticle} origin={{ id: 'doctornest_cases', label: '닥터네스트 사용 사례 페이지(/doctornest)' }} />
            </div>
          </div>
        </section>

        {/* 출처 */}
        <section className="border-t border-white/10 bg-[#050505]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <h2 className="text-sm font-semibold text-gray-300">출처</h2>
            <ol className="mt-4 space-y-2 text-xs leading-relaxed text-gray-500 keep-all">
              {SOURCES.map(src => (
                <li key={src.id} id={`src-${src.id}`} className="scroll-mt-24">
                  [{src.id}] {src.text}{' '}
                  {'href' in src && <a href={src.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 underline underline-offset-2 hover:text-white">원문</a>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
      <StickyApply />
    </div>
  );
}
