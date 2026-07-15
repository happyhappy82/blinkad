import Link from 'next/link';

export default function NewsNavigation() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-6">
        <Link href="/" className="transition-opacity hover:opacity-80" aria-label="BlinkAd 홈">
          <img src="/logo-white-nav.png" alt="BlinkAd" className="h-7 w-auto md:h-8" />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          <Link href="/foreign-marketing" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">외국인마케팅</Link>
          <Link href="/services" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">서비스</Link>
          <Link href="/case-studies" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">성공사례</Link>
          <Link href="/blog" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">블로그</Link>
          <Link href="/news" className="text-sm font-medium text-white">회사소식</Link>
          <Link href="/contact" className="text-sm font-medium text-gray-400 transition-colors hover:text-white">문의하기</Link>
        </div>

        <Link
          href="/contact"
          className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 sm:px-5"
        >
          무료 진단
          <span className="hidden sm:inline">하기</span>
        </Link>
      </div>
    </nav>
  );
}
