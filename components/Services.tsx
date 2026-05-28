'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bookmark, Bot, CalendarDays, FileText, MapPin, Navigation, Phone, Share2 } from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

const services = [
  {
    label: '홈 · Google 프로필',
    title: <>발견의 시작은<br />Google 프로필입니다.</>,
    description: '사진, 리뷰, 영업정보, 게시물을 정비해 외국인 고객이 검색 단계에서 브랜드를 신뢰하도록 만듭니다.',
    href: '/foreign-marketing',
    cta: '외국인마케팅 보기',
    icon: MapPin,
    mockTitle: 'Google Profile Care',
    mockValue: 'ACTIVE',
    rows: ['카테고리·소개문 정비', '사진·게시물 업데이트', '리뷰 응대 기준 수립'],
  },
  {
    label: '확장 · 웹사이트와 블로그',
    title: <>신뢰는<br />콘텐츠에서 완성됩니다.</>,
    description: '서비스 설명, FAQ, 지역 키워드를 콘텐츠로 쌓아 프로필에서 문의까지 이어지는 흐름을 만듭니다.',
    href: '/blog',
    cta: '콘텐츠 보기',
    icon: FileText,
    mockTitle: 'Content System',
    mockValue: 'GROWTH',
    rows: ['서비스 랜딩 정리', '검색형 블로그 운영', 'FAQ 콘텐츠 제작'],
  },
  {
    label: '장기 · AEO 구조',
    title: <>브랜드는<br />AI가 이해할 수 있어야 합니다.</>,
    description: '프로필과 콘텐츠의 문장을 통일해 장기적으로 AI 답변에 참고될 수 있는 브랜드 정보를 쌓습니다.',
    href: '#method',
    cta: '방법 보기',
    icon: Bot,
    mockTitle: 'AI Search Ready',
    mockValue: 'READY',
    rows: ['엔티티 설명 통일', '질문형 답변 블록', '스키마 적용 방향'],
  },
];

const ChatGptMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.911 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.182a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .511 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.989 5.989 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073ZM13.26 22.429a4.476 4.476 0 0 1-2.877-1.041l.142-.081 4.778-2.758a.795.795 0 0 0 .393-.681v-6.737l2.02 1.169a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494Zm-9.661-4.125a4.471 4.471 0 0 1-.535-3.014l.142.085 4.783 2.758a.771.771 0 0 0 .781 0l5.843-3.368v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.499 4.499 0 0 1-6.141-1.646ZM2.341 7.896a4.485 4.485 0 0 1 2.365-1.973V11.6a.766.766 0 0 0 .388.677l5.814 3.354-2.02 1.169a.076.076 0 0 1-.071 0l-4.83-2.787a4.504 4.504 0 0 1-1.646-6.117Zm16.596 3.856L13.104 8.364 15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.104v-5.677a.791.791 0 0 0-.407-.666Zm2.011-3.024-.142-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.831-2.787a4.499 4.499 0 0 1 6.68 4.679ZM8.307 12.863l-2.02-1.164a.08.08 0 0 1-.038-.057V6.074a4.499 4.499 0 0 1 7.376-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681Zm1.098-2.365 2.602-1.5 2.607 1.5v2.999l-2.598 1.5-2.607-1.5Z"
    />
  </svg>
);

const GoogleProfileListMock = () => {
  const places = [
    {
      name: '블링크의원 명동 BLINK CLINIC MYEONGDONG',
      rating: '4.9',
      reviews: '318',
      category: '피부과의원',
      address: '명동길 21 프라임타워 7층',
      status: '곧 영업 종료',
      close: '오후 8:00',
      quote: '상담이 자세하고 외국인 안내도 편해서 추천해요.',
      actions: [
        { label: '경로', icon: Navigation },
        { label: '통화', icon: Phone },
        { label: '공유', icon: Share2 },
        { label: '저장', icon: Bookmark },
      ],
    },
    {
      name: 'Myeongdong Glow Clinic | 리프팅·스킨부스터',
      rating: '4.7',
      reviews: '246',
      category: '피부과의원',
      address: '퇴계로 84 하이드파크 8층',
      status: '곧 영업 종료',
      close: '오후 7:30',
      quote: '피부 상태에 맞춰 설명해줘서 결정하기 쉬웠어요.',
      actions: [
        { label: '경로', icon: Navigation },
        { label: '예약', icon: CalendarDays },
        { label: '서비스', icon: FileText },
        { label: '통화', icon: Phone },
      ],
    },
    {
      name: '온데이클리닉 을지로 ONDAY CLINIC',
      rating: '4.8',
      reviews: '142',
      category: '피부관리',
      address: '을지로 54 메디컬스퀘어 5층',
      status: '곧 영업 종료',
      close: '오후 9:00',
      quote: '사진으로 미리 분위기를 확인할 수 있어 좋았습니다.',
      actions: [
        { label: '경로', icon: Navigation },
        { label: '통화', icon: Phone },
        { label: '공유', icon: Share2 },
        { label: '저장', icon: Bookmark },
      ],
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="absolute inset-x-10 -top-8 h-32 rounded-full bg-brand-blue/15 blur-3xl" />
      <div className="relative h-[430px] overflow-hidden rounded-[36px] bg-[#eef3f5] text-[#202124] shadow-2xl shadow-black/30 md:h-[455px]">
        <div className="relative h-24 overflow-hidden bg-[#d7e1e7] md:h-28">
          <div className="absolute inset-0 opacity-80">
            <div className="absolute left-[-12%] top-7 h-1.5 w-[130%] rotate-[-7deg] rounded-full bg-[#b8c5ce]" />
            <div className="absolute left-[8%] top-16 h-1.5 w-[115%] rotate-[3deg] rounded-full bg-[#b8c5ce]" />
            <div className="absolute left-[70%] top-[-35%] h-[185%] w-1.5 rotate-[8deg] rounded-full bg-[#d45f21]" />
            <div className="absolute left-[38%] top-[-10%] h-[140%] w-1.5 rotate-[74deg] rounded-full bg-[#5f3b8b]" />
            <div className="absolute left-[52%] top-[-24%] h-[150%] w-1.5 rotate-[-18deg] rounded-full bg-[#7aa6c7]" />
            <div className="absolute right-8 top-3 h-20 w-24 rounded-full bg-[#afd6bd]" />
            <div className="absolute left-10 bottom-2 h-16 w-24 rounded-full bg-[#b9d6c0]" />
          </div>
          <div className="absolute left-5 top-4 text-2xl font-black text-black">7:04</div>
          <div className="absolute right-5 top-4 rounded-full bg-black px-2 py-0.5 text-sm font-black text-white">80</div>
        </div>

        <div className="-mt-4 rounded-t-[34px] bg-white pb-6 shadow-[0_-6px_20px_rgba(15,23,42,0.08)]">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-gray-300" />
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3.5">
            <h4 className="text-2xl font-bold tracking-tight md:text-[1.7rem]">명동 피부과</h4>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-800" aria-label="close">
              ×
            </button>
          </div>

          <div className="divide-y-[8px] divide-[#f1f3f4]">
            {places.map((place) => (
              <div key={place.name} className="bg-white px-6 py-3.5 md:py-4">
                <h5 className="text-[1.08rem] font-extrabold leading-[1.18] tracking-tight keep-all md:text-[1.18rem]">
                  {place.name}
                </h5>
                <p className="mt-1.5 text-[0.82rem] font-medium leading-tight text-gray-500 keep-all md:text-[0.88rem]">
                  <span className="font-bold text-[#f5a400]">{place.rating} ★</span>
                  <span> ({place.reviews}) · {place.category} · {place.address}</span>
                </p>
                <p className="mt-1 text-[0.82rem] font-medium text-gray-500 md:text-[0.88rem]">
                  <span className="font-bold text-[#b16d00]">{place.status}</span> · {place.close}
                </p>
                <div className="mt-2 flex items-start gap-2 text-[0.82rem] leading-snug text-gray-500 keep-all md:text-[0.88rem]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c9f5fb] text-[#09717b]">●</span>
                  <span>&quot;{place.quote}&quot;</span>
                </div>

                <div className="mt-3 flex gap-2 overflow-hidden">
                  {place.actions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <div key={`${place.name}-${action.label}`} className="flex min-w-[72px] items-center justify-center gap-1.5 rounded-full bg-[#d8f7ff] px-3 py-2 text-xs font-extrabold text-[#075765] md:min-w-[78px] md:text-sm">
                        <ActionIcon className="h-3.5 w-3.5" />
                        <span>{action.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditorialBlogMock = () => {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="absolute inset-x-10 -top-8 h-24 rounded-full bg-brand-blue/15 blur-3xl" />
      <div className="relative max-h-[430px] overflow-hidden rounded-[36px] bg-[#f7f7f5] p-4 md:p-6 text-black shadow-2xl shadow-black/30">
        <div className="rounded-[28px] bg-white px-5 py-6 md:px-8 md:py-8 shadow-sm">
          <h4 className="text-[1.85rem] md:text-[2.55rem] font-bold leading-[1.08] tracking-tight keep-all">
            리쥬란 효능 그리고<br />
            주기가 어떻게 될까?
          </h4>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-500">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#19202a] via-[#46515f] to-[#c5b39a]" />
            <div>
              <p className="font-semibold text-gray-800">블링크의원 명동점</p>
              <p className="text-xs text-gray-500">피부 재생·스킨부스터 칼럼</p>
            </div>
            <span className="rounded-full border border-black px-3 py-1.5 font-semibold text-black">Follow</span>
            <span>5 min read</span>
            <span>·</span>
            <span>May 2026</span>
          </div>

          <div className="mt-6 border-y border-gray-200 py-3">
            <div className="flex items-center justify-between text-gray-500">
              <div className="flex items-center gap-5">
                <span className="text-lg">👏</span>
                <span className="text-sm font-semibold">12</span>
                <span className="text-lg">♡</span>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-lg">＋</span>
                <span className="text-lg">↗</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4 font-serif text-[1.08rem] md:text-[1.25rem] leading-[1.72] text-[#242424] keep-all">
            <p>
              리쥬란은 피부 컨디션과 재생 회복을 돕기 위해 상담되는 스킨부스터 시술 중 하나입니다.
              건조함, 잔주름, 탄력 저하가 고민인 분들이 많이 찾지만, 피부 상태에 따라 체감은 달라질 수 있습니다.
            </p>
          </div>

          <div className="mt-6 rounded-[22px] bg-[#f7f7f5] p-4">
            <p className="text-xs font-bold tracking-[0.18em] text-gray-400">ARTICLE STRUCTURE</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {['효능', '권장 주기', '주의사항'].map((tag) => (
                <div key={tag} className="rounded-2xl bg-white px-3 py-2.5 text-center text-xs font-bold text-gray-700">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AiAnswerMapMock = () => {
  const mapPins = [
    { name: 'PS clinic', score: '4.8', left: '25%', top: '46%' },
    { name: '블링크의원', score: '4.9', left: '52%', top: '42%', active: true },
    { name: 'RW clinic', score: '4.5', left: '70%', top: '53%' },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      <div className="absolute inset-x-8 -top-8 h-28 rounded-full bg-brand-blue/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#171717] p-4 text-white shadow-2xl shadow-black/40 md:p-5">
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-white/90 shadow-inner shadow-white/5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
              <ChatGptMark className="h-5 w-5" />
            </span>
            <span>ChatGPT</span>
          </div>
        </div>

        <div className="pt-8 md:pt-10">
          <div className="ml-auto w-fit max-w-[88%] rounded-[18px] bg-white/10 px-4 py-3 text-sm font-semibold text-white/90 md:text-base keep-all">
            명동에서 보톡스 잘하는 곳은 어딘지 알려줘.
          </div>

          <div className="mt-10 overflow-hidden rounded-[22px] border border-white/10 bg-[#243142] shadow-xl">
            <div className="relative h-[230px] bg-[#303f52] md:h-[280px]">
              <div className="absolute inset-0 opacity-45">
                <div className="absolute left-[-10%] top-[28%] h-2 w-[125%] rotate-[-5deg] rounded-full bg-white/20" />
                <div className="absolute left-[3%] top-[48%] h-2 w-[110%] rotate-[2deg] rounded-full bg-white/18" />
                <div className="absolute left-[66%] top-[-18%] h-[145%] w-2 rotate-[-7deg] rounded-full bg-white/18" />
                <div className="absolute left-[20%] top-[10%] h-[120%] w-2 rotate-[-5deg] rounded-full bg-white/12" />
                <div className="absolute left-[10%] top-[63%] h-1.5 w-[50%] rotate-[-22deg] rounded-full bg-white/12" />
                <div className="absolute left-[46%] top-[72%] h-1.5 w-[60%] rotate-[-12deg] rounded-full bg-white/12" />
              </div>

              <div className="absolute left-5 top-6 rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-bold text-[#f5c75d]">
                올림픽로
              </div>
              <div className="absolute right-6 top-10 rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-bold text-white/65">
                명동역
              </div>

              {mapPins.map((pin) => (
                <div
                  key={pin.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{ left: pin.left, top: pin.top }}
                >
                  <div className={`mx-auto flex h-9 w-fit items-center gap-1.5 rounded-full px-3 text-xs font-black shadow-lg ${pin.active ? 'border-2 border-white bg-black text-white' : 'bg-white text-black'}`}>
                    <span>★</span>
                    <span>{pin.score}</span>
                  </div>
                  <p className={`mt-2 max-w-[110px] text-[10px] font-extrabold leading-tight drop-shadow ${pin.active ? 'text-white' : 'text-white/75'}`}>
                    {pin.name}
                  </p>
                </div>
              ))}

              <div className="absolute bottom-4 left-4 right-4 rounded-[20px] bg-[#151515]/95 p-3 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#f5f1ea] via-[#9a8d7f] to-[#2d2826]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">블링크의원</p>
                    <p className="mt-1 text-xs font-bold text-white/75">★ 4.9 · 피부과의원</p>
                    <p className="mt-1 text-xs font-semibold text-[#6ee7a8]">영업 중 · 오후 8:00까지</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-7 text-[1.05rem] font-bold leading-relaxed text-white/92 md:text-xl keep-all">
            AI는 단순히 가까운 병원을 나열하지 않습니다. 프로필, 리뷰, 사진, 콘텐츠가 일관된 브랜드를 먼저 이해하고 추천합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  return (
    <section id="services" className="bg-[#050505] py-24 md:py-40 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <FadeIn className="max-w-4xl mb-10 md:mb-20">
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">Services</p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] keep-all">
            외국인마케팅은 구글에서 시작해,<br />
            AI 검색까지 설계합니다.
          </h2>
        </FadeIn>

        <div className="space-y-20 md:space-y-32">
          {services.map((service, index) => {
            const Icon = service.icon;
            const reverse = index % 2 === 1;
            return (
              <article key={service.mockTitle} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                <FadeIn className={reverse ? 'lg:order-2' : undefined} delay={index * 80}>
                  <div className="max-w-2xl">
                    <p className="text-brand-blue text-base md:text-lg font-bold keep-all">{service.label}</p>
                    <h3 className="mt-4 text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] keep-all">
                      {service.title}
                    </h3>
                    <p className="mt-6 text-base md:text-xl text-gray-400 leading-relaxed keep-all">
                      {service.description}
                    </p>
                    <Link
                      href={service.href}
                      className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
                    >
                      {service.cta}
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </FadeIn>

                <FadeIn className={reverse ? 'lg:order-1' : undefined} delay={120 + index * 80}>
                  {index === 0 ? (
                    <GoogleProfileListMock />
                  ) : index === 1 ? (
                    <EditorialBlogMock />
                  ) : index === 2 ? (
                    <AiAnswerMapMock />
                  ) : (
                    <div className="relative mx-auto w-full max-w-[540px]">
                      <div className="absolute inset-x-10 -top-8 h-32 rounded-full bg-brand-blue/15 blur-3xl" />
                      <div className="relative rounded-[36px] bg-[#f3f6fb] p-5 md:p-8 text-black shadow-2xl shadow-black/30">
                        <div className="flex items-start justify-between gap-5">
                          <div>
                            <p className="text-sm text-gray-500">{service.mockTitle}</p>
                            <p className="mt-2 text-4xl md:text-6xl font-bold tracking-tight">{service.mockValue}</p>
                          </div>
                          <div className="h-14 w-14 rounded-2xl bg-black text-white flex items-center justify-center">
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="mt-8 space-y-3">
                          {service.rows.map((row, rowIndex) => (
                            <div key={row} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-semibold text-gray-700 keep-all">{row}</span>
                                <span className="text-xs font-bold text-brand-blue">0{rowIndex + 1}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-7 rounded-full bg-black/10 h-2 overflow-hidden">
                          <div className="h-full w-[78%] rounded-full bg-brand-blue" />
                        </div>
                      </div>
                    </div>
                  )}
                </FadeIn>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
