// Substantive rewrite dates, kept outside the Notion-generated post array.
// Do not replace these with build times or incidental CMS edit timestamps.
export const BLOG_REWRITE_DATES: Readonly<Partial<Record<string, string>>> = {
  'oigug-in-goangoanggaeg-tonggyeoa-chui-2026nyeon-oigug-inmaketing-i-jung-yohan-iyu': '2026-10-28',
  'gbp-injeung-an-doil-ttae-ileohge-haegyeolhaseyo': '2026-11-09',
  'gugeul-jidoe-gage-deungloghaessneunde-an-tteubnida-ueon-ingoa-haegyeolbeob-5gaji': '2026-11-09',
};

// An edition published after a Korean rewrite must not acquire an earlier update date.
export function getBlogUpdatedDate(id: string, publishedAt: string): string | undefined {
  const updatedAt = BLOG_REWRITE_DATES[id];
  return updatedAt && updatedAt > publishedAt.slice(0, 10) ? updatedAt : undefined;
}
