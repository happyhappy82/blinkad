// Substantive rewrite dates, kept outside the Notion-generated post array.
// Do not replace these with build times or incidental CMS edit timestamps.
export const BLOG_REWRITE_DATES: Readonly<Partial<Record<string, string>>> = {
  'oigug-in-goangoanggaeg-tonggyeoa-chui-2026nyeon-oigug-inmaketing-i-jung-yohan-iyu': '2026-10-28',
  'gbp-injeung-an-doil-ttae-ileohge-haegyeolhaseyo': '2026-11-09',
  'gugeul-jidoe-gage-deungloghaessneunde-an-tteubnida-ueon-ingoa-haegyeolbeob-5gaji': '2026-11-09',
  'how-foreign-customers-find-korean-restaurants': '2026-11-10',
  'google-jidoeneun-naoneunde-mun-euiga-eobsdamyeon-eodibuteo-bolkka': '2026-11-10',
  'gbp-un-yeong-daehaeng-eotteon-eobchee-matgyeoya-halkka-2026': '2026-11-10',
  'gugeul-peulopil-goanli-oae-gamanhi-iss-eumyeon-andoilkka': '2026-11-10',
  'byeong-ueon-maketing-euilyobeob-jaju-geollineun-8gaji-uiban-salyeneun': '2026-11-11',
  'gugeul-goanggo-biyong-ueol-eolmamyeon-hyogoa-bol-su-iss-eulkka-eobjongbyeol-hyeonsil-jeongli': '2026-11-11',
  'gugeul-jido-libyu-vs-neibeo-peulleiseu-libyu-eodiga-maechul-e-doumdoilkka': '2026-11-11',
  '2026-byeong-ueon-beullogeu-jalsseuneunbeob-ai-geomsaeg-e-in-yongdoineun-5munjang-dabbyeon-gujo': '2026-11-11',
};

// An edition published after a Korean rewrite must not acquire an earlier update date.
export function getBlogUpdatedDate(id: string, publishedAt: string): string | undefined {
  const updatedAt = BLOG_REWRITE_DATES[id];
  return updatedAt && updatedAt > publishedAt.slice(0, 10) ? updatedAt : undefined;
}
