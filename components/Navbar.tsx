'use client';

import React, { useState, useEffect } from 'react';
import { recordCtaClick } from '@/lib/tracker';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // contact로 가는 클릭은 CTA 클릭으로 추적
  const trackContactCta = (location: string, label: string) => {
    recordCtaClick({
      cta_id: `bl_global_${location}_v1`,
      cta_location: location,
      cta_label: label,
    });
  };

  const handleNavigate = (target: string) => {
    if (target === 'blog') {
      window.location.href = '/blog';
    } else if (target === 'services-page') {
      window.location.href = '/services';
    } else if (target === 'case-studies-page') {
      window.location.href = '/case-studies';
    } else if (target === 'foreign-marketing-page') {
      window.location.href = '/foreign-marketing';
    } else if (target === 'home') {
      window.location.href = '/';
    } else if (target === 'contact') {
      window.location.href = '/contact';
    } else {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = `/#${target}`;
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-3 md:py-4'
          : 'bg-black/45 md:bg-transparent backdrop-blur-sm md:backdrop-blur-0 py-4 md:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-6 flex justify-between items-center">
        <a
            href="/"
            className="hover:opacity-80 transition-opacity"
        >
          <img src="/logo-white-nav.png" alt="BlinkAd" className="h-8 w-auto" />
        </a>

        <div className="hidden md:flex space-x-6">
          <a href="/foreign-marketing" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">외국인마케팅</a>
          <a href="/#services" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">상품</a>
          <a href="/#ai-diagnostic" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">확장전략</a>
          <a href="/#method" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">AEO 구조</a>
          <a href="/case-studies" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">성공사례</a>
          <a href="/#process" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">진행과정</a>
        </div>

        <button
          onClick={() => { trackContactCta('header-cta-pill', '무료 진단하기'); handleNavigate('contact'); }}
          className="hidden sm:block bg-brand-blue text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
        >
          무료 진단하기
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
