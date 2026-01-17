import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigate = (target: string) => {
    if (target === 'blog') {
      window.location.href = 'https://blog.blinkad.kr';
    } else if (target === 'services-page') {
      window.location.href = '/services';
    } else if (target === 'case-studies-page') {
      window.location.href = '/case-studies';
    } else if (target === 'home') {
      window.location.href = '/';
    } else {
      const element = document.getElementById(target);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div
            onClick={() => handleNavigate('home')}
            className="text-xl font-bold tracking-tight cursor-pointer text-white hover:text-gray-300 transition-colors"
        >
          Blink Ad.
        </div>

        <div className="hidden md:flex space-x-8">
          <button onClick={() => handleNavigate('services')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">서비스</button>
          <button onClick={() => handleNavigate('casestudies')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">성공사례</button>
          <button onClick={() => handleNavigate('blog')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">블로그</button>
          <button onClick={() => handleNavigate('contact')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">문의하기</button>
        </div>

        <button
          onClick={() => handleNavigate('contact')}
          className="bg-brand-blue text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
        >
          무료 진단하기
        </button>
      </div>
    </nav>
  );
};

export default Navbar;