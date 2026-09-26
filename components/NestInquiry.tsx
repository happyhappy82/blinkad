'use client';

import { useEffect, useId, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { INQUIRY_ENDPOINT } from '@/lib/inquiry-endpoint';
import { NEST_ARTICLES, NEST_PRODUCTS, type NestArticle, type NestProduct } from '@/lib/nest-content';
import { getTrackingDataAsync, markClarityInquiry, recordCtaClick } from '@/lib/tracker';

function track(event: string, article: NestArticle, product: NestProduct, hasArticleContext = true) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, nest_article: hasArticleContext ? article.id : 'direct', nest_product: product });
}

function InquiryForm({ article, titleId, standalone = false, hasArticleContext = true }: { article: NestArticle; titleId: string; standalone?: boolean; hasArticleContext?: boolean }) {
  const Heading = standalone ? 'h1' : 'h2';
  const [product, setProduct] = useState<NestProduct>(article.product);
  const [topic, setTopic] = useState<string>(article.id);
  const [data, setData] = useState({ business: '', name: '', phone: '', channels: '', message: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const busy = useRef(false);
  const started = useRef(false);
  const prefix = useId();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || submitted) return;
    if (!data.business.trim() || !data.name.trim()) {
      setError('사업장명과 담당자명을 입력해 주세요.');
      return;
    }
    if (!/^(01[0-9]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$/.test(data.phone.replace(/\s/g, ''))) {
      setError('회신받을 전화번호를 확인해 주세요.');
      return;
    }
    busy.current = true;
    setPending(true);
    setError('');
    try {
      // Collect attribution without counting a failed request as a completed inquiry.
      const tracking = await getTrackingDataAsync(false);
      const selected = NEST_ARTICLES.find(item => item.id === topic && item.product === product)!;
      const context = [
        `관심 제품: ${NEST_PRODUCTS[product]}`,
        `사업장: ${data.business.trim()}`,
        `관심 업무: ${selected.label}`,
        `현재 상담 채널: ${data.channels.trim() || '미입력'}`,
        `문의 내용: ${data.message.trim() || '미입력'}`,
        hasArticleContext ? `읽은 홈페이지 글: ${article.id} / ${article.title}` : '홈페이지 글: 직접 문의 페이지 방문',
        `외부 유입: ${tracking.utm_source || '미확인'} / ${tracking.utm_content || '미확인'}`,
      ].join('\n');
      const response = await fetch(INQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          ...tracking,
          name: data.name.trim(), phone: data.phone.trim(), message: context,
          source: 'nest_product_inquiry', submittedAt: new Date().toISOString(),
          business_name: data.business.trim(), product, concern: selected.concern,
          homepage_article_id: hasArticleContext ? article.id : 'direct', external_article_id: tracking.utm_content,
          current_channels: data.channels.trim(),
        }),
      });
      if (!response.ok) throw new Error('receiver rejected request');
      setSubmitted(true);
      setData({ business: '', name: '', phone: '', channels: '', message: '' });
      markClarityInquiry();
      track('nest_inquiry_accepted', article, product, hasArticleContext);
    } catch {
      setError('전송 완료를 확인하지 못했습니다. 입력 내용은 남아 있으니 잠시 후 다시 시도해 주세요.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  const inputClass = 'mt-2 w-full rounded-xl border border-white/20 bg-gray-900 px-3 py-3 text-base text-white outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30';
  if (submitted) return (
    <div role="status" className="py-8">
      <Heading id={titleId} className="text-2xl font-bold text-white">도입 상담 요청이 접수됐습니다.</Heading>
      <p className="mt-4 leading-relaxed text-gray-300">남겨주신 내용을 확인한 뒤 연락드리겠습니다.</p>
    </div>
  );

  return (
    <form onSubmit={submit} onFocus={() => {
      if (!started.current) { started.current = true; track('nest_inquiry_started', article, product, hasArticleContext); }
    }} className="space-y-5">
      <div>
        <Heading id={titleId} className="pr-8 text-2xl font-bold text-white">{NEST_PRODUCTS[product]} 도입 상담</Heading>
        <p className="mt-3 break-keep leading-relaxed text-gray-300">지금 쓰는 상담 채널과 불편한 업무를 알려주세요. 필요한 기능과 설정 범위를 확인해 안내드립니다.</p>
      </div>
      <fieldset disabled={pending} className="space-y-4 disabled:opacity-70">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-gray-200">관심 제품
            <select value={product} onChange={event => {
              const next = event.target.value as NestProduct;
              setProduct(next);
              setTopic(NEST_ARTICLES.find(item => item.product === next)!.id);
            }} className={inputClass}>
              <option value="doctornest">닥터네스트</option>
              <option value="beautynest">뷰티네스트</option>
            </select>
          </label>
          <label className="block text-sm text-gray-200">관심 업무
            <select value={topic} onChange={event => setTopic(event.target.value)} className={inputClass}>
              {NEST_ARTICLES.filter(item => item.product === product).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm text-gray-200">사업장명 (필수)
          <input required maxLength={100} autoComplete="organization" value={data.business} onChange={event => setData({ ...data, business: event.target.value })} className={inputClass} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-gray-200">담당자명 (필수)
            <input required maxLength={80} autoComplete="name" value={data.name} onChange={event => setData({ ...data, name: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm text-gray-200">회신 연락처 (필수)
            <input required type="tel" maxLength={24} autoComplete="tel" placeholder="010-1234-5678" value={data.phone} onChange={event => setData({ ...data, phone: event.target.value })} className={inputClass} />
          </label>
        </div>
        <label className="block text-sm text-gray-200">현재 상담 채널 (선택)
          <input maxLength={200} placeholder="예: 카카오톡, 인스타그램 DM, 전화" value={data.channels} onChange={event => setData({ ...data, channels: event.target.value })} className={inputClass} />
        </label>
        <label className="block text-sm text-gray-200">불편한 업무 또는 궁금한 점 (선택)
          <textarea rows={3} maxLength={2000} aria-describedby={`${prefix}-hint`} value={data.message} onChange={event => setData({ ...data, message: event.target.value })} className={inputClass} />
        </label>
        <p id={`${prefix}-hint`} className="text-xs leading-relaxed text-gray-400">환자·손님의 이름이나 연락처 없이 업무 상황만 적어주세요.</p>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="submit" className="w-full rounded-xl bg-brand-blue px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-60">{pending ? '접수 중…' : '도입 상담 요청하기'}</button>
      </fieldset>
    </form>
  );
}

export function NestContactPage({ article, hasArticleContext }: { article: NestArticle; hasArticleContext: boolean }) {
  return (
    <main className="min-h-screen bg-black px-5 pb-20 pt-32">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/15 bg-gray-950 p-5 sm:p-8">
        <InquiryForm article={article} titleId="nest-contact-title" standalone hasArticleContext={hasArticleContext} />
      </div>
    </main>
  );
}

export function NestArticleExperience({ article, children }: { article?: NestArticle; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function show(location: string) {
    if (!article) return;
    recordCtaClick({ cta_id: `nest_${article.id}_${location}`, cta_location: location, cta_label: article.cta });
    track('nest_inquiry_opened', article, article.product);
    setOpen(true);
  }
  function intercept(event: MouseEvent<HTMLDivElement>) {
    if (!article || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href]');
    if (!anchor || anchor.target === '_blank') return;
    const url = new URL(anchor.href);
    if (url.pathname === '/contact' && (url.origin === window.location.origin || url.origin === 'https://www.blinkad.kr') && url.searchParams.get('service') === article.product && url.searchParams.get('topic') === article.id) {
      event.preventDefault();
      show('article_link');
    }
  }
  if (!article) return <>{children}</>;
  return (
    <>
      <div onClick={intercept}>{children}</div>
      <section className="mt-12 rounded-2xl border border-brand-blue/30 bg-brand-blue/10 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-white">{NEST_PRODUCTS[article.product]} 도입 상담</h2>
        <p className="my-4 break-keep leading-relaxed text-gray-300">지금 쓰는 상담 채널과 불편한 업무를 알려주세요. 필요한 기능과 설정 범위를 확인해 안내드립니다.</p>
        <button onClick={() => show('article_footer')} className="rounded-xl bg-brand-blue px-5 py-3 font-semibold text-white hover:brightness-110">{article.cta}</button>
      </section>
      <dialog ref={dialog} aria-labelledby={titleId} onClose={() => setOpen(false)} onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.current?.close();
      }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-gray-950 p-5 text-white backdrop:bg-black/80 sm:p-8">
        <button type="button" aria-label="상담 창 닫기" onClick={() => dialog.current?.close()} className="absolute right-3 top-3 rounded-lg p-2 text-gray-300 hover:bg-white/10"><X size={22} /></button>
        <InquiryForm article={article} titleId={titleId} />
      </dialog>
    </>
  );
}
