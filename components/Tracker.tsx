'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initTracker, addToSessionPath, autoTagCtaLinks, tagClarity } from '@/lib/tracker';

/**
 * Layout에 1회 마운트되는 트래커 Provider.
 *
 * - 첫 마운트: initTracker (UTM·landing·referrer·Clarity tag·CTA 클릭 listener)
 * - 페이지 변경 시: session_path 누적 + autoTagCtaLinks (메뉴 링크 자동 표식) + Clarity tag 재시도
 */
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    initTracker();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    addToSessionPath(pathname);
    autoTagCtaLinks();
    // Clarity는 GTM이 lazy load해서 다음 페이지 진입 시점에 또 활성화될 수 있음
    tagClarity();
  }, [pathname]);

  return null;
}
