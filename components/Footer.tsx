'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        {/* 상단 영역 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div className="mb-6 md:mb-0">
            <img src="/logo-white-nav.png" alt="Blink Ad" className="h-8 w-auto mb-4" />
            <p className="text-gray-400 text-sm">맛집 마케팅의 모든 것</p>
          </div>
          <div className="flex items-center space-x-6">
            <a href="https://warm-hip-fe9.notion.site/2e9753ebc01380e8aa5dca28b76683eb" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors">개인정보처리방침</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">이용약관</a>
            <a href="https://www.youtube.com/@bizik_insight" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition-colors" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-white/5 pt-8">
          {/* 사업자 정보 */}
          <div className="text-xs text-gray-500 space-y-1 mb-6">
            <p>블링크애드 | 대표: 권순현 | 사업자등록번호: 871-01-02770</p>
            <p>주소: 경기 의왕시 포일로 39</p>
          </div>

          {/* 저작권 */}
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Blink Ad. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;