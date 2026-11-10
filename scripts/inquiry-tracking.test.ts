import test from 'node:test';
import assert from 'node:assert/strict';
import { getTrackingData, getTrackingDataAsync, inferPageType, recordAcceptedInquiry, recordCtaClick, recordBlogConsultationClick } from '../lib/tracker';
import { getBlogConsultation } from '../lib/blog-consultation';

test('only confirmed receipts count; original and landing article attribution stay separate', async () => {
  const jar = new Map<string, string>();
  const events: unknown[][] = [];
  const clarity: unknown[][] = [];
  const location = new URL('https://www.blinkad.kr/en/contact');
  const doc = { title: 'Contact', referrer: '', documentElement: { lang: 'en' } };
  Object.defineProperty(doc, 'cookie', {
    get: () => [...jar].map(([k, v]) => `${k}=${v}`).join('; '),
    set: (value: string) => { const [pair] = value.split(';'); const i = pair.indexOf('='); jar.set(pair.slice(0, i), pair.slice(i + 1)); },
  });
  const win = { location, gtag: (...args: unknown[]) => events.push(args), clarity: (...args: unknown[]) => clarity.push(args), dataLayer: [] as unknown[] };
  Object.assign(globalThis, { window: win, document: doc, location });
  jar.set('aj_landing', encodeURIComponent('https://www.blinkad.kr/en/blog/first-article'));
  jar.set('_ga', 'GA1.1.123456.789012');
  jar.set('_clck', 'visitor1'); jar.set('_clsk', 'session1');
  win.location = new URL('https://www.blinkad.kr/en/blog/second-article');
  recordCtaClick({ cta_id: 'bl_blog_keywords_v2', cta_location: 'blog-inline' });
  win.location = location;
  const tracking = await getTrackingDataAsync();
  assert.equal(tracking.ga_client_id, '123456.789012');
  assert.equal(tracking.origin_page, 'https://www.blinkad.kr/en/blog/second-article');
  assert.equal(tracking.landing_page, 'https://www.blinkad.kr/en/blog/first-article');
  assert.equal(clarity.some(args => args[1] === 'inquiry_submitted'), false, 'collecting payload must not mark success');
  for (const response of [new Response('{}', { status: 502 }), new Response('{"ok":false}'), new Response('not JSON')]) {
    assert.equal(await recordAcceptedInquiry(response, tracking, 'blog_cta'), false);
  }
  assert.equal(events.length, 0, 'failed and invalid receipts must never count as leads');
  assert.equal(await recordAcceptedInquiry(new Response('{"ok":true}'), tracking, 'blog_cta'), true);
  assert.equal(events.length, 1);
  assert.equal(events[0][0], 'event'); assert.equal(events[0][1], 'generate_lead');
  const params = events[0][2] as Record<string, unknown>;
  assert.equal(params.inquiry_article, 'second-article');
  assert.equal(params.inquiry_landing, 'first-article');
  assert.equal(params.inquiry_language, 'en'); assert.equal(params.send_to, 'G-0BVVKT1DZS');
  assert.equal(Object.keys(params).some(k => /name|phone|email|message/.test(k)), false);
  assert.equal(clarity.filter(args => args[0] === 'event' && args[1] === 'inquiry_submitted').length, 1);
  delete (win as Partial<typeof win>).gtag;
  assert.equal(await recordAcceptedInquiry(new Response('{"ok":true,"fallback":"telegram"}'), tracking, 'contact_form'), true);
  assert.deepEqual(Array.from(win.dataLayer[0] as IArguments).slice(0, 2), ['event', 'generate_lead'], 'GTM-only pages queue a standard Google-tag event');
  win.gtag = () => { throw new Error('blocked'); };
  assert.equal(await recordAcceptedInquiry(new Response('{"ok":true}'), tracking, 'contact_form'), true, 'analytics cannot reject an accepted inquiry');
  for (const language of ['en', 'ja', 'zh']) assert.equal(inferPageType(`/${language}/blog/a`), 'blog');
  assert.equal(getTrackingData().source_page_type, 'lp');
});

test('article questions choose relevant consultation topics and localized copy', () => {
  assert.equal(getBlogConsultation({ id: 'x', title: '구글 비즈니스 프로필 인증 안 될 때' }).topic, 'verification');
  assert.equal(getBlogConsultation({ id: 'homepage-seo-new-customer-keywords', title: '홈페이지 SEO' }).topic, 'keywords');
  assert.equal(getBlogConsultation({ id: 'x', title: 'GEO 마케팅 대행' }).topic, 'ai');
  for (const language of ['en', 'ja', 'zh'] as const) {
    const copy = getBlogConsultation({ id: 'x', title: '홈페이지 제작' }, language);
    assert.ok(copy.heading && copy.description && copy.button);
    assert.equal(/[가-힣]/.test(JSON.stringify(copy)), false);
  }
});

test('blog consultation clicks reach the GTM queue without counting a lead or exposing form values', () => {
  const jar = new Map<string, string>();
  const location = new URL('https://www.blinkad.kr/ja/blog/current-article');
  const doc = { title: 'Article', documentElement: { lang: 'ja' } };
  Object.defineProperty(doc, 'cookie', {
    get: () => [...jar].map(([k, v]) => `${k}=${v}`).join('; '),
    set: (value: string) => { const [pair] = value.split(';'); const i = pair.indexOf('='); jar.set(pair.slice(0, i), pair.slice(i + 1)); },
  });
  const win = { location, dataLayer: [] as unknown[], gtag: undefined as undefined | ((...args: unknown[]) => void) };
  Object.assign(globalThis, { window: win, document: doc, location });
  jar.set('aj_landing', encodeURIComponent('https://www.blinkad.kr/ja/blog/first-article'));
  const info = { cta_id: 'bl_blog_keywords_v2', cta_location: 'blog-inline', cta_label: 'A label is not sent to Analytics' };
  recordBlogConsultationClick(info);
  assert.equal(win.dataLayer.length, 1);
  const command = Array.from(win.dataLayer[0] as IArguments);
  assert.deepEqual(command.slice(0, 2), ['event', 'inquiry_cta_click']);
  assert.deepEqual(command[2], {
    send_to: 'G-0BVVKT1DZS', inquiry_article: 'current-article', inquiry_landing: 'first-article', inquiry_language: 'ja', inquiry_form: 'blog_cta',
  });
  assert.equal(getTrackingData().origin_page, location.origin + location.pathname);
  win.gtag = () => { throw new Error('blocked'); };
  assert.doesNotThrow(() => recordBlogConsultationClick(info));
});
