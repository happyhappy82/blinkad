export const ENGLISH_PAGES = [
  '/', '/services', '/foreign-marketing', '/google-map-marketing', '/blog-marketing',
  '/aeo', '/reddit-marketing', '/case-studies', '/contact', '/blog', '/news',
  '/hospital-sample', '/restaurant-sample',
] as const;

export function englishPath(path: string): string {
  const [pathname] = path.split(/[?#]/);
  if (!(ENGLISH_PAGES as readonly string[]).includes(pathname) && !pathname.startsWith('/news/')) return path;
  return `/en${path === '/' ? '' : path}`;
}

export function languageAlternates(path: string) {
  const korean = `https://www.blinkad.kr${path === '/' ? '' : path}`;
  return { ko: korean, en: `https://www.blinkad.kr${englishPath(path)}`, 'x-default': korean };
}

export function validInternationalPhone(phone: string): boolean {
  const value = phone.trim();
  return /^\+?[0-9\s().-]+$/.test(value) && /^[0-9]{7,15}$/.test(value.replace(/\D/g, ''));
}
