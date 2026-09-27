export const LOCALIZED_PAGES = [
  '/', '/services', '/foreign-marketing', '/google-map-marketing', '/blog-marketing',
  '/aeo', '/reddit-marketing', '/case-studies', '/contact', '/blog', '/news',
  '/hospital-sample', '/restaurant-sample',
] as const;

export const ENGLISH_PAGES = LOCALIZED_PAGES;
export const SITE_LANGUAGES = ['ko', 'en', 'ja', 'zh'] as const;
export type SiteLanguage = (typeof SITE_LANGUAGES)[number];
export type ForeignLanguage = Exclude<SiteLanguage, 'ko'>;
export const LANGUAGE_INFO = {
  ko: { label: '한국어', short: 'KO', html: 'ko', og: 'ko_KR' },
  en: { label: 'English', short: 'EN', html: 'en', og: 'en_US' },
  ja: { label: '日本語', short: 'JA', html: 'ja', og: 'ja_JP' },
  zh: { label: '简体中文', short: 'ZH', html: 'zh-Hans', og: 'zh_CN' },
} as const;

export function splitLanguagePath(path: string): { language: SiteLanguage; path: string } {
  const match = path.match(/^\/(en|ja|zh)(?=\/|[?#]|$)/);
  if (!match) return { language: 'ko', path };
  const rest = path.slice(match[0].length);
  return { language: match[1] as ForeignLanguage, path: !rest || /^[?#]/.test(rest) ? '/' + rest : rest };
}

export function localizedPath(path: string, language: SiteLanguage): string {
  const [pathname] = path.split(/[?#]/);
  if (!(LOCALIZED_PAGES as readonly string[]).includes(pathname) && !/^\/news\/[^/.]+$/.test(pathname)) return path;
  if (language === 'ko') return path;
  const suffix = path.slice(pathname.length);
  return `/${language}${pathname === '/' ? '' : pathname}${suffix}`;
}

export function englishPath(path: string): string {
  return localizedPath(path, 'en');
}

export function languageAlternates(path: string) {
  const korean = `https://www.blinkad.kr${path === '/' ? '' : path}`;
  return {
    ko: korean,
    en: `https://www.blinkad.kr${localizedPath(path, 'en')}`,
    ja: `https://www.blinkad.kr${localizedPath(path, 'ja')}`,
    'zh-Hans': `https://www.blinkad.kr${localizedPath(path, 'zh')}`,
    'x-default': korean,
  };
}

export function validInternationalPhone(phone: string): boolean {
  const value = phone.trim();
  return /^\+?[0-9\s().-]+$/.test(value) && /^[0-9]{7,15}$/.test(value.replace(/\D/g, ''));
}
