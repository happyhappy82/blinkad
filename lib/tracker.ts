/**
 * 블링크애드 통합 문의 추적 트래커
 *
 * - 페이지 메타·UTM·landing/referrer 보존 (sessionStorage)
 * - 사이트 내 경로(session_path) 누적 (최대 10개)
 * - CTA 클릭 추적 (.aj-cta 자동 감지 + recordCtaClick 명시 호출)
 * - Clarity custom tag 박기 (GTM 로드 후 4초 재시도)
 * - GA4 client_id 비동기 추출
 * - 폼 제출 시 getTrackingDataAsync()로 트래킹 데이터 일괄 반환
 *
 * 사용처:
 *   - components/Tracker.tsx에서 initTracker / addToSessionPath / autoTagCtaLinks
 *   - components/Contact.tsx · BlogCTA.tsx에서 getTrackingDataAsync
 *   - components/Navbar.tsx 등에서 recordCtaClick
 */

const SITE_ID = 'bl';
const CLARITY_PROJECT_ID = 'wj5kqq9kck';

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

// ── URL 검증: http(s) 시작하는 값만 통과, 아니면 빈 문자열
// (노션 URL 타입 컬럼은 'direct' 같은 비URL 값을 거부하기 때문)
export function safeUrl(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.indexOf('http://') === 0 || v.indexOf('https://') === 0 ? v : '';
}

// ── 현재 페이지 URL 추출 (도메인 + path)
function currentUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin + window.location.pathname;
}

// ── pathname 기반 페이지 카테고리 자동 분류
export function inferPageType(pathname: string): 'main' | 'blog' | 'case' | 'lp' | 'service' {
  // blog.blinkad.kr 호스트는 middleware로 /blog/*로 rewrite됨
  if (pathname === '/' || pathname === '') return 'main';
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname.startsWith('/case-studies')) return 'case';
  if (pathname.startsWith('/services')) return 'service';
  return 'lp';
}

// ── pathname에서 슬러그 추출
export function inferPageSlug(pathname: string): string {
  const trimmed = pathname.replace(/^\/|\/$/g, '');
  if (!trimmed) return 'home';
  // /blog/[slug] → slug
  const parts = trimmed.split('/');
  return parts[parts.length - 1] || 'home';
}

// ── 페이지 메타 객체
export interface PageMeta {
  site: string;
  page_type: string;
  page_slug: string;
  page_url: string;
  page_title: string;
}

export function getPageMeta(pathname?: string): PageMeta {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  return {
    site: SITE_ID,
    page_type: inferPageType(path),
    page_slug: inferPageSlug(path),
    page_url: currentUrl(),
    page_title: typeof document !== 'undefined' ? document.title : '',
  };
}

// ── Cookie 헬퍼 (cross-subdomain: .blinkad.kr 공유)
//    blinkad.kr ↔ blog.blinkad.kr 사이 이동에도 추적 데이터 보존.
//    - max-age 7200초(2시간) — 한 방문 세션 정도, 너무 길지 않게
//    - SameSite=Lax — 서브도메인 간 동일 사이트 컨텍스트 허용
//    - localhost는 domain 옵션 생략 (개발 환경 호환)
const COOKIE_MAX_AGE = 7200; // 2시간

function getCookieDomain(): string {
  if (typeof location === 'undefined') return '';
  const host = location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return '';
  // .blinkad.kr / .aijeong.com 등 — 호스트 끝의 등록도메인 자동 추출
  const parts = host.split('.');
  if (parts.length < 2) return '';
  // 마지막 2칸이 등록도메인 (.co.kr 같은 ccTLD는 더 정교한 처리 필요하지만
  // 우리 환경(blinkad.kr / aijeong.com)은 단순 케이스)
  return '.' + parts.slice(-2).join('.');
}

function ssGet(key: string): string {
  if (typeof document === 'undefined') return '';
  try {
    const m = document.cookie.match(new RegExp('(^|; )' + key + '=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : '';
  } catch {
    return '';
  }
}

function ssSet(key: string, value: string): void {
  if (typeof document === 'undefined') return;
  try {
    const domain = getCookieDomain();
    const domainPart = domain ? `; domain=${domain}` : '';
    const securePart = location.protocol === 'https:' ? '; secure' : '';
    document.cookie =
      `${key}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE}; path=/${domainPart}; SameSite=Lax${securePart}`;
  } catch {
    // 무해
  }
}

// ── 1) 첫 방문 페이지 + referrer 보존
export function initLanding(): void {
  if (typeof window === 'undefined') return;
  if (!ssGet('aj_landing')) {
    ssSet('aj_landing', currentUrl());
    ssSet('aj_referrer', document.referrer || 'direct');
  }
}

// ── 2) UTM 파라미터 보존 (첫 클릭 우선, 새 UTM 들어오면 갱신)
export function captureUtm(): void {
  if (typeof window === 'undefined') return;
  const qp = new URLSearchParams(window.location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => {
    const v = qp.get(k);
    if (v) ssSet('aj_' + k, v);
  });
}

// ── 3) 사이트 내 경로 누적 (최대 10개, 새로고침 중복 방지)
//    /contact는 폼 페이지라 추적에서 제외
export function addToSessionPath(pathname: string): void {
  if (typeof window === 'undefined') return;
  const current = pathname.replace(/^\/|\/$/g, '');
  if (!current || current === 'contact') return;

  const raw = ssGet('aj_session_path');
  const arr = raw ? raw.split('|') : [];
  if (arr[arr.length - 1] === current) return;
  arr.push(current);
  if (arr.length > 10) arr.splice(0, arr.length - 10);
  ssSet('aj_session_path', arr.join('|'));
}

// ── 4) Clarity custom tag — 사이트 진입 시 한 번만 발급, sessionStorage 보존
function getOrCreateClarityTag(): string {
  let tag = ssGet('aj_clarity_tag');
  if (!tag) {
    tag = `${SITE_ID}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    ssSet('aj_clarity_tag', tag);
  }
  // window.clarity 노출되어 있으면 custom tag 박기 (이미 박혀 있어도 무해)
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    try {
      window.clarity('set', 'aj_session', tag);
    } catch {
      // 무시
    }
  }
  return tag;
}

// ── 5) Clarity tag를 GTM lazy load 대응으로 한 번 + 4초 후 재시도
export function tagClarity(): void {
  getOrCreateClarityTag();
  if (typeof window !== 'undefined') {
    setTimeout(() => getOrCreateClarityTag(), 4000);
  }
}

// ── 6) 헤더/푸터 메뉴의 'contact' 링크 자동 표식
//      .aj-cta 클래스가 없는 메뉴 링크도 자동으로 트래킹 대상으로 포함
export function autoTagCtaLinks(): void {
  if (typeof document === 'undefined') return;
  const links = document.querySelectorAll<HTMLAnchorElement>(
    'a[href*="/contact"], a[href$="#contact"], a[href$="#contact-form"]'
  );
  links.forEach((link) => {
    if (link.classList.contains('aj-cta')) return;
    link.classList.add('aj-cta');
    if (!link.dataset.ctaId) {
      const loc = inferLinkLocation(link);
      link.dataset.ctaId = `${SITE_ID}_global_${loc}_auto_v1`;
      link.dataset.ctaLocation = loc;
    }
  });
}

function inferLinkLocation(el: HTMLElement): string {
  if (el.closest('header, nav, [class*="navbar"], [class*="header"]')) return 'header-menu';
  if (el.closest('footer, [class*="footer"]')) return 'footer-menu';
  if (el.closest('[class*="float"], [class*="fixed"]')) return 'floating';
  return 'inline-auto';
}

// ── 7) CTA 클릭 시 origin 기록 (.aj-cta 클래스 + button onClick 양쪽 사용)
export interface CtaClickInfo {
  cta_id: string;
  cta_location: string;
  cta_label?: string;
}

export function recordCtaClick(info: CtaClickInfo): void {
  if (typeof window === 'undefined') return;
  const meta = getPageMeta();
  ssSet('aj_origin_page', meta.page_url);
  ssSet('aj_origin_page_type', meta.page_type);
  ssSet('aj_origin_page_slug', meta.page_slug);
  ssSet('aj_origin_cta_id', info.cta_id);
  ssSet('aj_origin_cta_location', info.cta_location);
  ssSet('aj_origin_cta_label', (info.cta_label || '').slice(0, 80));
}

// .aj-cta 클래스 가진 anchor는 자동 클릭 추적
function attachAutoCtaListener(): void {
  if (typeof document === 'undefined') return;
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>('.aj-cta');
      if (!el) return;
      recordCtaClick({
        cta_id: el.dataset.ctaId || '',
        cta_location: el.dataset.ctaLocation || '',
        cta_label: (el.textContent || '').trim().slice(0, 80),
      });
    },
    true
  );
}

// ── 8) GA4 client_id 추출 (Promise + 1.5초 timeout)
//    GTM이 GA4 로드 → window.gtag('get', ...) 사용 가능
function getGaClientId(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
      return resolve('');
    }
    let resolved = false;
    const finish = (id: string) => {
      if (resolved) return;
      resolved = true;
      resolve(id || '');
    };
    try {
      // GTM 환경에서 GA4 measurement ID는 dataLayer 또는 gtag get으로 가져옴
      // 'GA_MEASUREMENT_ID'는 'default'로도 해석 시도됨
      window.gtag('get', 'default', 'client_id', (id: string) => finish(id));
    } catch {
      finish('');
    }
    setTimeout(() => finish(''), 1500);
  });
}

// ── 9) 트래커 초기화 (Layout 마운트 시 1회)
let initialized = false;
export function initTracker(): void {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;
  initLanding();
  captureUtm();
  tagClarity();
  attachAutoCtaListener();
}

// ── 10) 폼 제출에서 호출할 헬퍼: 트래킹 데이터 객체 반환
export interface TrackingData {
  site: string;
  source_page: string;
  source_page_type: string;
  source_page_slug: string;
  origin_page: string;
  origin_page_type: string;
  origin_page_slug: string;
  cta_id: string;
  cta_location: string;
  cta_label: string;
  referrer: string;
  landing_page: string;
  session_path: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm: string;
  page_title: string;
  clarity_session_url: string;
  clarity_tag: string;
}

export function getTrackingData(): TrackingData {
  const meta = getPageMeta();
  const utm_source = ssGet('aj_utm_source');
  const utm_medium = ssGet('aj_utm_medium');
  const utm_campaign = ssGet('aj_utm_campaign');
  const utm_combined =
    utm_source || utm_medium || utm_campaign
      ? [utm_source || 'direct', utm_medium || 'none', utm_campaign || 'none'].join('/')
      : '';

  // referrer 검증 — 'direct' 같은 비URL 값은 빈 문자열로 (노션 URL 컬럼 보호)
  const rawReferrer = ssGet('aj_referrer');
  const referrer = safeUrl(rawReferrer);

  // Clarity tag 보장
  const clarityTag = getOrCreateClarityTag();
  const clarityUrl = clarityTag
    ? `https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT_ID}/dashboard?date=Last%2030%20days&CustomTag=aj_session=${encodeURIComponent(
        clarityTag
      )}`
    : '';

  return {
    site: meta.site,
    source_page: safeUrl(meta.page_url),
    source_page_type: meta.page_type,
    source_page_slug: meta.page_slug,
    origin_page: safeUrl(ssGet('aj_origin_page') || meta.page_url),
    origin_page_type: ssGet('aj_origin_page_type') || meta.page_type,
    origin_page_slug: ssGet('aj_origin_page_slug') || meta.page_slug,
    cta_id: ssGet('aj_origin_cta_id'),
    cta_location: ssGet('aj_origin_cta_location') || 'direct',
    cta_label: ssGet('aj_origin_cta_label'),
    referrer,
    landing_page: safeUrl(ssGet('aj_landing')),
    session_path: ssGet('aj_session_path'),
    utm_source,
    utm_medium,
    utm_campaign,
    utm: utm_combined,
    page_title: meta.page_title,
    clarity_session_url: clarityUrl,
    clarity_tag: clarityTag,
  };
}

// 비동기 버전: GA4 client_id까지 포함
export interface TrackingDataWithGa extends TrackingData {
  ga_client_id: string;
}

export async function getTrackingDataAsync(): Promise<TrackingDataWithGa> {
  const base = getTrackingData();
  const cid = await getGaClientId();
  return { ...base, ga_client_id: cid };
}
