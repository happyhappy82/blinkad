'use client';

import { usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import { Globe2, ChevronDown } from 'lucide-react';
import { LANGUAGE_INFO, SITE_LANGUAGES, localizedPath, splitLanguagePath } from '@/lib/site-languages';

export default function LanguageSwitch() {
  const pathname = usePathname();
  const { language, path } = splitLanguagePath(pathname);
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function close(event: PointerEvent) {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    }
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  if (localizedPath(path, 'en') === path) return null;

  return (
    <details ref={menu} className="relative" onKeyDown={event => {
      if (event.key === 'Escape' && menu.current) {
        menu.current.open = false;
        menu.current.querySelector('summary')?.focus();
      }
    }}>
      <summary aria-label={{ ko: '언어 선택', en: 'Select language', ja: '言語を選択', zh: '选择语言' }[language]}
        className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-md border border-white/20 px-2.5 text-xs font-semibold text-gray-300 hover:border-white/50 hover:text-white [&::-webkit-details-marker]:hidden">
        <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />{LANGUAGE_INFO[language].short}<ChevronDown className="h-3 w-3" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-12 w-40 rounded-lg border border-white/15 bg-[#111] p-1.5 shadow-xl">
        {SITE_LANGUAGES.map(item => {
          const target = localizedPath(path, item);
          return <a key={item} href={target} hrefLang={LANGUAGE_INFO[item].html} lang={LANGUAGE_INFO[item].html}
            aria-current={item === language ? 'page' : undefined}
            onClick={event => {
              event.currentTarget.href = `${target}${window.location.search}${window.location.hash}`;
              if (menu.current) menu.current.open = false;
            }}
            className={`block rounded-md px-3 py-2.5 text-sm ${item === language ? 'bg-brand-blue/15 font-semibold text-blue-400' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            {LANGUAGE_INFO[item].label}
          </a>;
        })}
      </div>
    </details>
  );
}
