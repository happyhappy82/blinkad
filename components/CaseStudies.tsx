'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CASE_STUDIES } from '@/constants';
import { FadeIn } from './ui/FadeIn';
import { Eye, Search, MousePointerClick, TrendingUp, Globe, Smartphone, MapPin, BarChart3, X, Bot, ShieldCheck, ArrowRight } from 'lucide-react';
import Image from 'next/image';

// 숫자 카운팅 애니메이션 훅
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(start + (end - start) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return { count, ref };
}

const STAT_ICONS = [Eye, Search, MousePointerClick];
const INSIGHT_ICONS = [Globe, Smartphone, MapPin, BarChart3];
const KEYWORD_WIDTHS = ['100%', '38%', '32%', '31%', '28%'];

type ProjectCategory = 'all' | 'maps' | 'ai-search';

const PROJECT_FILTERS: { id: ProjectCategory; label: string }[] = [
  { id: 'all', label: '전체 프로젝트' },
  { id: 'maps', label: 'Google 검색·지도' },
  { id: 'ai-search', label: 'AI 검색(AEO,GEO)' },
];

const PROJECT_SUMMARIES = [
  {
    id: 'maps-bukchon',
    category: 'maps' as const,
    categoryLabel: 'Google 검색·지도',
    status: '검증된 성과',
    client: '북촌 한식당',
    title: '외국인 관광 상권의 Google Maps 노출 확대',
    metric: '56,719회',
    metricLabel: '프로필 조회수',
    description: '검색 노출 41,930회와 비즈니스 상호작용 3,562회를 Google 비즈니스 프로필 인사이트로 확인했습니다.',
    href: '#google-maps-project',
  },
  {
    id: 'maps-gwanghwamun',
    category: 'maps' as const,
    categoryLabel: 'Google 검색·지도',
    status: '검증된 성과',
    client: '광화문 음식점',
    title: '외국인 near me 검색에서 지도 점유율 확보',
    metric: '0% → 48%',
    metricLabel: 'poke near me 지도 점유율',
    description: 'healthy food near me도 28%에서 48%로, 외국인 near me 키워드에서 운영 기간 중 구글 지도 로컬 점유율을 끌어올렸습니다. (구글 지도 스캔 실측, 2026.6~7)',
    href: '#google-maps-project',
  },
  {
    id: 'ai-busan-cafe',
    category: 'ai-search' as const,
    categoryLabel: 'AI 검색(AEO,GEO)',
    status: '성과 표시 예시',
    client: '부산 관광상권 카페(예시)',
    title: '외국인 고객을 위한 AI 검색 대응 구조 점검',
    metric: '+10%p',
    metricLabel: 'AI 언급률 예시 변화',
    description: '실제 고객 성과가 아닌 표시 예시입니다. 동일 질문군 재측정 시 언급률이 20%에서 30%로 오른 경우를 가정했습니다.',
    href: '#ai-search-projects',
  },
];

const CaseStudies: React.FC = () => {
  const mainCase = CASE_STUDIES[0];
  const screenshots = mainCase.screenshots || [];
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('all');
  const { count: viewCount, ref: viewRef } = useCountUp(56719, 2500);
  const { count: searchCount, ref: searchRef } = useCountUp(41930, 2500);
  const { count: interactionCount, ref: interactionRef } = useCountUp(3562, 2500);
  const countRefs = [viewRef, searchRef, interactionRef];
  const counts = [viewCount, searchCount, interactionCount];

  // 스크린샷 확대 모달
  const [modalImg, setModalImg] = useState<string | null>(null);
  const visibleProjects = activeCategory === 'all'
    ? PROJECT_SUMMARIES
    : PROJECT_SUMMARIES.filter((project) => project.category === activeCategory);

  return (
    <section id="casestudies" className="py-20 md:py-32 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        {/* 섹션 헤더 */}
        <FadeIn className="mb-10 md:mb-16">
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-4">Project Cases</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 keep-all">데이터로 확인한 프로젝트 사례입니다.</h1>
          <p className="text-base md:text-xl text-gray-400 max-w-2xl keep-all break-words leading-relaxed">
            Google 검색·지도 성과와 AI 검색 진단 프로젝트를 함께 공개합니다.
            고객사 보호가 필요한 AEO·GEO 사례는 상호를 익명화하고 측정 조건과 표본은 그대로 밝힙니다.
          </p>
        </FadeIn>

        {/* 프로젝트 분류 및 요약 카드 */}
        <FadeIn delay={80} className="mb-12 md:mb-16">
          <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="프로젝트 유형 선택">
            {PROJECT_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveCategory(filter.id)}
                aria-pressed={activeCategory === filter.id}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  activeCategory === filter.id
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleProjects.map((project) => (
              <a
                key={project.id}
                href={project.href}
                className="group rounded-[10px] border border-white/5 bg-brand-dark p-5 md:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/30"
              >
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
                    {project.categoryLabel}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{project.client}</p>
                <h2 className="min-h-0 md:min-h-[56px] text-lg font-bold leading-snug text-white keep-all">
                  {project.title}
                </h2>
                <div className="my-6 border-y border-white/5 py-5">
                  <p className="text-3xl font-bold text-white">{project.metric}</p>
                  <p className="mt-1 text-xs text-gray-500">{project.metricLabel}</p>
                </div>
                <p className="text-sm leading-relaxed text-gray-400 keep-all">{project.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
                  상세 보기
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-[10px] border border-white/5 bg-white/[0.02] p-4 text-sm text-gray-400">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue" />
            <p className="leading-relaxed keep-all">
              익명 사례는 상호·지점·계정 식별정보를 공개하지 않습니다. 정량 측정이 완료된 프로젝트는
              측정 조건과 표본을 함께 밝히고, 아직 측정 전인 프로젝트는 수치 없이 현재 단계를 명시합니다.
            </p>
          </div>
        </FadeIn>

        <div id="google-maps-project" className="scroll-mt-24 mb-8 md:mb-10">
          <p className="text-brand-blue text-xs font-semibold tracking-wider uppercase mb-2">Google Search & Maps</p>
          <h2 className="text-2xl md:text-3xl font-bold keep-all">Google 검색·지도 프로젝트 상세</h2>
        </div>

        {/* 고객사 배지 */}
        <FadeIn delay={100} className="mb-8 md:mb-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full text-sm font-semibold border border-brand-blue/20">
              <span className="w-2 h-2 bg-brand-blue rounded-full animate-pulse" />
              {mainCase.client}
            </span>
            <span className="text-gray-500 text-sm">{mainCase.industry}</span>
            <span className="hidden sm:inline text-gray-600 text-sm">·</span>
            <span className="text-gray-500 text-sm">GBP 최적화 {mainCase.duration}</span>
            {mainCase.period && (
              <>
                <span className="hidden sm:inline text-gray-600 text-sm">·</span>
                <span className="w-full sm:w-auto text-gray-500 text-sm">{mainCase.period}</span>
              </>
            )}
          </div>
        </FadeIn>

        {/* 핵심 수치 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-6 md:mb-8">
          {screenshots.map((shot, index) => {
            const Icon = STAT_ICONS[index];
            return (
              <FadeIn key={shot.label} delay={150 + index * 100}>
                <div
                  ref={countRefs[index]}
                  className="group relative rounded-[10px] bg-brand-dark border border-white/5 hover:border-brand-blue/30 transition-all duration-500 overflow-hidden cursor-pointer"
                  onClick={() => setModalImg(shot.src)}
                >
                  {/* 카드 헤더 - 수치 */}
                  <div className="p-5 md:p-6 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand-blue" />
                      </div>
                      <span className="text-sm text-gray-400">{shot.label}</span>
                    </div>
                    <p className="text-3xl md:text-5xl font-bold text-white">
                      {counts[index].toLocaleString()}
                    </p>
                  </div>

                  {/* 스크린샷 이미지 */}
                  <div className="relative mx-3 md:mx-4 mb-3 md:mb-4 rounded-[10px] overflow-hidden bg-white/95 border border-gray-200/50 group-hover:shadow-[0_0_30px_rgba(0,113,227,0.15)] transition-shadow duration-500">
                    <Image
                      src={shot.src}
                      alt={shot.label}
                      width={600}
                      height={400}
                      className="w-full h-auto"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>

                  {/* 호버 힌트 */}
                  <div className="hidden md:block absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs text-gray-500 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                      클릭하여 확대
                    </span>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* 주요 성과 요약 바 */}
        <FadeIn delay={500}>
          <div className="rounded-[10px] bg-gradient-to-r from-brand-blue/5 via-brand-dark to-brand-blue/5 border border-white/5 p-5 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {mainCase.keyResults.map((result, i) => (
                <div key={i} className="flex items-start gap-3">
                  <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300 keep-all">{result}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ===== 상세 분석 섹션 ===== */}

        {/* 배경 + 수행 작업 */}
        {(mainCase.background || mainCase.approach) && (
          <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8">
            {mainCase.background && (
              <FadeIn delay={100}>
                <div className="h-full rounded-[10px] bg-brand-dark border border-white/5 p-5 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-1">배경</h3>
                  <p className="text-xs text-gray-600 mb-5">프로젝트 시작 전 상황</p>
                  <p className="text-sm text-gray-400 leading-relaxed keep-all">
                    {mainCase.background}
                  </p>
                </div>
              </FadeIn>
            )}

            {mainCase.approach && (
              <FadeIn delay={200}>
                <div className="h-full rounded-[10px] bg-brand-dark border border-white/5 p-5 md:p-8">
                  <h3 className="text-lg font-bold text-white mb-1">수행한 작업</h3>
                  <p className="text-xs text-gray-600 mb-5">{mainCase.duration} 동안 진행한 최적화</p>
                  <ul className="space-y-3">
                    {mainCase.approach.map((step, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-400 keep-all">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-blue/10 text-brand-blue text-xs flex items-center justify-center font-semibold mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )}
          </div>
        )}

        {/* 검색 키워드 분석 */}
        {mainCase.searchKeywords && mainCase.searchKeywords.length > 0 && (
          <FadeIn delay={300} className="mt-8">
            <div className="rounded-[10px] bg-brand-dark border border-white/5 p-5 md:p-8">
              <h3 className="text-lg font-bold text-white mb-1">검색 키워드 분석</h3>
              <p className="text-xs text-gray-600 mb-6">
                실제 Google 검색에서 매장이 노출된 키워드와 횟수
              </p>
              <div className="space-y-5">
                {mainCase.searchKeywords.map((kw, i) => (
                  <div key={i}>
                    <div className="flex items-start sm:items-center justify-between gap-3 mb-1.5">
                      <code className="min-w-0 text-xs sm:text-sm text-white font-mono bg-white/5 px-2 py-0.5 rounded break-all">
                        {kw.keyword}
                      </code>
                      <span className="text-sm text-gray-400 tabular-nums flex-shrink-0">{kw.volume}회</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-blue to-brand-blue/50 rounded-full transition-all duration-1000"
                        style={{ width: KEYWORD_WIDTHS[i] }}
                      />
                    </div>
                    {kw.note && (
                      <p className="text-xs text-gray-600 mt-1">{kw.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* 데이터 인사이트 */}
        {mainCase.insights && mainCase.insights.length > 0 && (
          <div className="mt-8">
            <FadeIn>
              <h3 className="text-lg font-bold text-white mb-1">데이터가 말해주는 것</h3>
              <p className="text-xs text-gray-600 mb-6">숫자 너머의 의미를 읽습니다</p>
            </FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mainCase.insights.map((insight, i) => {
                const Icon = INSIGHT_ICONS[i % INSIGHT_ICONS.length];
                return (
                  <FadeIn key={i} delay={100 + i * 100}>
                    <div className="h-full rounded-[10px] bg-brand-dark border border-white/5 p-5 md:p-6 hover:border-brand-blue/20 transition-colors duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-2 keep-all">{insight.title}</h4>
                          <p className="text-sm text-gray-400 leading-relaxed keep-all">{insight.detail}</p>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        )}

        {/* 데이터 출처 */}
        {mainCase.dataSource && (
          <FadeIn delay={600}>
            <p className="mt-10 text-[11px] text-gray-600 text-center tracking-wide">
              {mainCase.dataSource}
            </p>
          </FadeIn>
        )}

        {/* AI 검색 익명 프로젝트 */}
        <div id="ai-search-projects" className="scroll-mt-24 mt-20 md:mt-28">
          <FadeIn>
            <p className="text-brand-blue text-xs font-semibold tracking-wider uppercase mb-2">AI Search · AEO · GEO</p>
            <h2 className="text-2xl md:text-4xl font-bold keep-all">AI 검색 프로젝트 상세</h2>
            <p className="mt-4 max-w-3xl text-sm md:text-base leading-relaxed text-gray-400 keep-all">
              고객사 보호를 위해 상호는 익명 처리합니다. 부산 관광상권 카페의 수치는 화면 구성용 예시이며,
              실제 고객 성과로 표현하지 않습니다.
            </p>
          </FadeIn>

          <div className="mt-8">
            <FadeIn delay={100}>
              <article className="rounded-[10px] border border-white/5 bg-brand-dark p-5 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10">
                    <Bot className="h-5 w-5 text-brand-blue" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-blue">성과 표시 예시</p>
                    <h3 className="mt-1 font-bold text-white">부산 관광상권 카페(예시)</h3>
                  </div>
                </div>
                <h4 className="text-xl md:text-2xl font-bold leading-snug keep-all">외국인 고객을 위한 AI 검색 대응 구조 점검</h4>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-black/30 p-4">
                    <p className="text-xl md:text-2xl font-bold text-white">20%</p>
                    <p className="mt-1 text-xs text-gray-500">작업 전 AI 언급률</p>
                  </div>
                  <div className="rounded-lg bg-black/30 p-4">
                    <p className="text-xl md:text-2xl font-bold text-white">30%</p>
                    <p className="mt-1 text-xs text-gray-500">작업 후 AI 언급률</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {[
                    ['01', 'AI 검색 진단'],
                    ['02', '공개 정보 정비'],
                    ['03', '동일 조건 재측정'],
                  ].map(([step, label]) => (
                    <div key={step} className="rounded-lg border border-white/5 bg-black/20 p-4">
                      <p className="text-xs font-semibold text-brand-blue">{step}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 border-t border-white/5 pt-5 text-[11px] leading-relaxed text-gray-600">
                  예시 수치 · 실제 고객 측정값 아님
                </p>
              </article>
            </FadeIn>
          </div>

          <FadeIn delay={300}>
            <div className="mt-6 rounded-[10px] border border-brand-blue/20 bg-brand-blue/[0.06] p-5 md:p-6">
              <p className="font-semibold text-white">익명 공개 원칙</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400 keep-all">
                상호, 지점명, 계정 화면, 고유 URL은 제거합니다. 업종과 지역도 필요한 범위까지만 넓게 표현하고,
                전후 성과가 확보되기 전에는 ‘성공’이 아닌 ‘진단 프로젝트’로 구분합니다.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* 스크린샷 확대 모달 */}
      {modalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-4 cursor-pointer"
          onClick={() => setModalImg(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] overflow-auto rounded-[10px] bg-white p-2">
            <Image
              src={modalImg}
              alt="확대 보기"
              width={1200}
              height={800}
              className="w-full h-auto rounded-xl"
              style={{ objectFit: 'contain' }}
            />
            <button
              onClick={() => setModalImg(null)}
              aria-label="닫기"
              className="absolute top-3 md:top-4 right-3 md:right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CaseStudies;
