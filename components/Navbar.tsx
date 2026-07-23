'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { recordCtaClick } from '@/lib/tracker';

const serviceLinks = [
  { href: '/services', label: '전체 서비스' },
  { href: '/foreign-marketing', label: '외국인마케팅' },
  { href: '/google-map-marketing', label: '구글 비즈니스 프로필 관리' },
  { href: '/blog-marketing', label: '브랜드 블로그 운영' },
  { href: '/aeo', label: 'AI 검색 최적화' },
];

const primaryLinks = [
  { href: '/case-studies', label: '성공사례' },
  { href: '/blog', label: '인사이트' },
  { href: '/news', label: '회사소식' },
];

const servicePaths = serviceLinks.map((link) => link.href);

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const isServiceActive = servicePaths.some((path) => isCurrentPath(pathname, path));

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setIsMobileServicesOpen(false);
  };

  const trackContactCta = () => {
    recordCtaClick({
      cta_id: 'bl_global_header-cta-pill_v1',
      cta_location: 'header-cta-pill',
      cta_label: '무료 진단하기',
    });
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-6">
        <Link href="/" className="transition-opacity hover:opacity-80" aria-label="BlinkAds 홈" onClick={closeMobileMenu}>
          <img src="/logo-white-nav.png" alt="BlinkAds" className="h-7 w-auto md:h-8" />
        </Link>

        <div className="hidden h-full items-center gap-7 lg:flex">
          <div className="group relative flex h-full items-center">
            <button
              type="button"
              className={`flex h-full items-center gap-1 text-sm font-medium transition-colors ${
                isServiceActive ? 'text-brand-blue' : 'text-gray-400 hover:text-white'
              }`}
              aria-haspopup="true"
            >
              서비스
              <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true" />
            </button>

            <div className="pointer-events-none invisible absolute left-1/2 top-[calc(100%-1px)] w-64 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111] p-2 shadow-2xl shadow-black/50">
                {serviceLinks.map((link) => {
                  const active = isCurrentPath(pathname, link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block rounded-md px-3 py-2.5 text-sm transition-colors ${
                        active ? 'bg-brand-blue/15 font-semibold text-brand-blue' : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {primaryLinks.map((link) => {
            const active = isCurrentPath(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex h-full items-center border-b-2 pt-0.5 text-sm font-medium transition-colors ${
                  active ? 'border-brand-blue text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            onClick={trackContactCta}
            className="hidden rounded-full bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 sm:inline-flex"
          >
            무료 진단하기
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center text-white lg:hidden"
            aria-label={isMobileOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-black lg:hidden">
          <div className="mx-auto max-w-7xl px-5 py-4 md:px-6">
            <button
              type="button"
              onClick={() => setIsMobileServicesOpen((open) => !open)}
              className={`flex w-full items-center justify-between py-3 text-left text-base font-semibold ${
                isServiceActive ? 'text-brand-blue' : 'text-white'
              }`}
              aria-expanded={isMobileServicesOpen}
            >
              서비스
              <ChevronDown className={`h-5 w-5 transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isMobileServicesOpen && (
              <div className="mb-2 border-l border-white/10 pl-4">
                {serviceLinks.map((link) => {
                  const active = isCurrentPath(pathname, link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={`block py-2.5 text-sm ${active ? 'font-semibold text-brand-blue' : 'text-gray-400'}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}

            {primaryLinks.map((link) => {
              const active = isCurrentPath(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`block border-t border-white/[0.06] py-3 text-base font-semibold ${
                    active ? 'text-brand-blue' : 'text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="/contact"
              onClick={() => {
                trackContactCta();
                closeMobileMenu();
              }}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-brand-blue px-5 py-3 text-sm font-semibold text-white sm:hidden"
            >
              무료 진단하기
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
