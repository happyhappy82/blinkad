'use client';

import { usePathname } from 'next/navigation';
import { englishPath } from '@/lib/site-languages';

export default function LanguageSwitch() {
  const pathname = usePathname();
  const isEnglish = pathname === '/en' || pathname.startsWith('/en/');
  const koreanPath = isEnglish ? pathname.slice(3) || '/' : pathname;
  const target = isEnglish ? koreanPath : englishPath(koreanPath);
  if (target === pathname) return null;

  return (
    <a href={target} hrefLang={isEnglish ? 'ko' : 'en'}
      aria-label={isEnglish ? '한국어로 보기' : 'View in English'}
      onClick={event => {
        // A full document navigation also updates the root document language.
        event.currentTarget.href = `${target}${window.location.search}${window.location.hash}`;
      }}
      className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-white/20 px-2.5 text-xs font-semibold text-gray-300 transition-colors hover:border-white/50 hover:text-white">
      {isEnglish ? 'KO' : 'EN'}
    </a>
  );
}
