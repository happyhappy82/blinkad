'use client';

import React from 'react';
import {
  ArrowUpRight,
  Bookmark,
  ChevronDown,
  Clock3,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  SearchCheck,
  Share2,
  Star,
  X,
} from 'lucide-react';
import { FadeIn } from './ui/FadeIn';

const searchMoments = [
  {
    label: '검색',
    title: 'Google에서 먼저 찾습니다',
    detail: '외국인 고객은 방문 전 Google 검색과 Google Maps에서 브랜드를 확인합니다.',
    icon: SearchCheck,
  },
  {
    label: '비교',
    title: '사진과 리뷰로 판단합니다',
    detail: '프로필 사진, 리뷰, 영업정보가 오래되면 비교 단계에서 빠르게 제외됩니다.',
    icon: Star,
  },
  {
    label: '전환',
    title: '웹사이트에서 확신합니다',
    detail: '프로필에서 설명되지 않는 서비스, 예약, 문의 정보는 웹사이트와 블로그가 보완합니다.',
    icon: MessageCircle,
  },
];

const profileActions = [
  { label: '경로', icon: Navigation, primary: true },
  { label: '통화', icon: Phone },
  { label: '저장', icon: Bookmark },
  { label: '공유', icon: Share2 },
];

const clinicPhotos = [
  {
    label: 'BLINK CLINIC',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'PRIVATE LOUNGE',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=700&q=80',
  },
  {
    label: 'MYEONGDONG',
    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=700&q=80',
  },
];

const ClinicProfileMock = () => {
  return (
    <div className="relative mx-auto max-w-[560px]">
      <div className="absolute -inset-6 rounded-[52px] bg-brand-blue/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-[#eef3f4] text-black shadow-2xl shadow-brand-blue/10">
        <div className="relative h-[760px] sm:h-[840px] lg:h-[900px] overflow-hidden">
          <div className="relative h-[190px] bg-[#dce5e8]">
            <div className="absolute inset-0 opacity-80">
              <div className="absolute left-[-10%] top-16 h-3 w-[120%] rotate-[-9deg] bg-white/70" />
              <div className="absolute left-[-5%] top-28 h-3 w-[120%] rotate-[4deg] bg-white/80" />
              <div className="absolute left-20 top-0 h-[210px] w-3 rotate-[2deg] bg-white/70" />
              <div className="absolute right-20 top-0 h-[210px] w-3 rotate-[-5deg] bg-white/70" />
              <div className="absolute left-1/2 top-0 h-[210px] w-2 rotate-[38deg] bg-white/60" />
              <div className="absolute left-0 top-20 h-10 w-full bg-[#bfdcca]/70" />
            </div>
            <div className="absolute left-5 top-4 flex items-center gap-3 text-xl font-bold">
              <span>5:14</span>
              <span className="text-base">⌁</span>
            </div>
            <div className="absolute right-5 top-4 flex items-center gap-2 text-sm font-bold">
              <span className="h-5 rounded-md bg-[#6fd56f] px-2 text-white">64</span>
            </div>
            <p className="absolute left-12 top-[74px] hidden text-sm font-semibold text-gray-500 sm:block">명동길</p>
            <p className="absolute left-40 top-20 text-sm font-semibold text-gray-500">을지로</p>
            <p className="absolute right-16 top-28 text-sm font-semibold text-gray-500">삼각동</p>
          </div>

          <div className="absolute inset-x-0 top-[118px] rounded-t-[34px] bg-white px-6 pb-7 pt-5 shadow-2xl">
            <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-gray-300" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-[1.7rem] font-bold leading-tight sm:text-4xl">
                  블링크의원 명동점 | 명동피부과 BLINK Clinic 明洞皮肤科
                </h3>
                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-lg text-gray-600">
                  <span>4.9</span>
                  <span className="text-[#f6b93b]">★★★★★</span>
                  <span>(47)</span>
                </div>
                <p className="mt-1 text-lg text-gray-600">피부과의사</p>
                <p className="mt-3 text-lg text-gray-600">
                  <span className="font-bold text-[#25944a]">영업 중</span>
                  <span> · 오후 9:00에 영업 종료</span>
                </p>
              </div>

              <div className="hidden gap-3 sm:flex">
                {[Bookmark, Share2, X].map((Icon, index) => (
                  <button
                    key={index}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-700"
                    aria-label="profile action"
                  >
                    <Icon className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3 overflow-hidden">
              {profileActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className={`flex min-w-[92px] items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-bold ${
                      action.primary ? 'bg-[#337f8c] text-white' : 'bg-[#d9f4fa] text-[#225764]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {action.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 grid h-[230px] grid-cols-[1.55fr_1fr] gap-3 sm:h-[300px]">
              <div
                className="relative overflow-hidden rounded-[24px] bg-cover bg-center"
                style={{ backgroundImage: `url(${clinicPhotos[0].image})` }}
              >
                <div className="absolute inset-0 bg-black/25" />
                <p className="absolute bottom-5 left-5 text-lg font-bold tracking-[0.18em] text-white">
                  {clinicPhotos[0].label}
                </p>
              </div>
              <div className="grid grid-rows-2 gap-3">
                {clinicPhotos.slice(1).map((photo) => (
                  <div
                    key={photo.label}
                    className="relative overflow-hidden rounded-[22px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${photo.image})` }}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <p className="absolute bottom-4 left-4 text-xs font-bold tracking-[0.16em] text-white">
                      {photo.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 flex justify-between border-b border-gray-200 text-lg font-bold text-gray-500">
              {['개요', '리뷰', '사진', '업데이트', '정보'].map((tab, index) => (
                <div key={tab} className={`pb-4 ${index === 0 ? 'border-b-4 border-[#337f8c] text-[#337f8c]' : ''}`}>
                  {tab}
                </div>
              ))}
            </div>

            <div className="pt-6">
              <h4 className="text-2xl font-bold tracking-tight">검색어와 관련된 장소</h4>
              <div className="mt-5 flex items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-blue to-purple-500" />
                  <p className="text-lg text-gray-600 keep-all">블링크의원 명동점에서 3일전 리쥬란 시술 받은 후기 남깁니다.</p>
                </div>
                <span className="text-3xl text-gray-700">›</span>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between rounded-2xl bg-[#f1f5f6] px-5 py-4 text-lg text-gray-700">
                  <div className="flex items-center gap-4">
                    <Clock3 className="h-6 w-6" />
                    <span>
                      <b className="text-[#25944a]">영업 중</b> · 오후 9:00에 영업 종료
                    </span>
                  </div>
                  <ChevronDown className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#f1f5f6] px-5 py-4 text-lg text-gray-700">
                  <div className="flex items-center gap-4">
                    <MapPin className="h-6 w-6" />
                    <span className="keep-all">서울특별시 중구 명동8길 22 5층</span>
                  </div>
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BrandSystem: React.FC = () => {
  return (
    <section className="bg-black py-24 md:py-40 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <FadeIn className="max-w-5xl">
          <p className="text-brand-blue text-sm font-semibold tracking-wider uppercase mb-5">
            Google First Strategy
          </p>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] keep-all">
            외국인 마케팅은<br />
            네이버가 아닌 구글에서 시작합니다.
          </h2>
          <p className="mt-6 md:mt-8 max-w-3xl text-base md:text-xl text-gray-400 leading-relaxed keep-all">
            블링크애드는 Google 비즈니스 프로필을 먼저 정비하고, 웹사이트와 블로그로 브랜드 정보를 연결해 외국인 고객이 검색하고 비교하고 문의하는 흐름을 설계합니다.
          </p>
        </FadeIn>

        <div className="mt-16 md:mt-24 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-20 items-center">
          <FadeIn delay={120}>
            <ClinicProfileMock />
          </FadeIn>

          <div className="space-y-5">
            {searchMoments.map((moment, index) => {
              const Icon = moment.icon;
              return (
                <FadeIn key={moment.title} delay={180 + index * 90}>
                  <div className="group flex gap-5 border-t border-white/10 py-6 first:border-t-0 first:pt-0">
                    <div className="mt-1 h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center flex-shrink-0 group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-blue">{moment.label}</p>
                      <h3 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight keep-all">{moment.title}</h3>
                      <p className="mt-3 text-base text-gray-400 leading-relaxed keep-all">{moment.detail}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}

            <FadeIn delay={500}>
              <a
                href="/foreign-marketing"
                className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 text-base font-semibold transition-colors group"
              >
                외국인마케팅 대행 구조 보기
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </FadeIn>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BrandSystem;
