'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { GlossaryList as ListConfig } from '@/lib/glossary'

const compact = (value: string) => value.toLocaleLowerCase('ko-KR').replace(/\s+/g, '')
const initials = (value: string) => [...value].map(char => {
  const code = char.charCodeAt(0) - 0xac00
  return code >= 0 && code <= 11171 ? 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[Math.floor(code / 588)] : char
}).join('')

export default function GlossaryList({ config, categoriesHTML }: { config: ListConfig; categoriesHTML: string }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(config.page)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setQuery(params.get('q') || '')
    setSort(params.get('sort') === 'ko' ? 'ko' : 'default')
    const oldAnchor = /^#term-(\d+)$/.exec(window.location.hash)
    const target = oldAnchor && config.allTerms.find(term => term.id === Number(oldAnchor[1]))
    if (target) window.location.replace(target.url)
  }, [config])

  const rows = useMemo(() => {
    const needle = compact(query.trim())
    const found = config.terms.filter(term => !needle || compact(term.search).includes(needle) || (/^[ㄱ-ㅎ]+$/.test(needle) && compact(initials(term.name)).includes(needle)))
    const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' })
    return sort === 'ko' ? [...found].sort((a, b) => collator.compare(a.name, b.name)) : found
  }, [config, query, sort])
  const pageCount = Math.max(1, Math.ceil(rows.length / config.pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageURL = (number: number, text = query, order = sort) => {
    const params = new URLSearchParams()
    if (text.trim()) params.set('q', text.trim())
    if (order !== 'default') params.set('sort', order)
    return `${config.basePath}${number > 1 ? `/page/${number}` : ''}${params.size ? `?${params}` : ''}`
  }
  const edit = (text: string, order: string) => {
    setQuery(text); setSort(order); setPage(1)
    // Keep the selected static list URL valid while persisting its search state.
    const params = new URLSearchParams()
    if (text.trim()) params.set('q', text.trim())
    if (order !== 'default') params.set('sort', order)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`)
  }
  const visible = rows.slice((currentPage - 1) * config.pageSize, currentPage * config.pageSize)
  const pageLink = (number: number, label: string) => <a key={label} href={pageURL(number)} aria-current={number === currentPage && /^\d+$/.test(label) ? 'page' : undefined}>{label}</a>

  return <>
    <div className="dictionary-toolbar">
      <div className="dictionary-tools">
        <label className="dictionary-search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
          <span className="sound-only">용어 검색</span>
          <input id="search" ref={input} type="search" placeholder="용어 검색 (초성 가능)" autoComplete="off" value={query} onChange={event => edit(event.target.value, sort)} />
          {query && <button id="clear" type="button" onClick={() => { edit('', sort); input.current?.focus() }}>지우기</button>}
        </label>
        <label className="dictionary-sort"><span className="sound-only">정렬</span><select id="sort" value={sort} onChange={event => edit(query, event.target.value)}><option value="default">기본순</option><option value="ko">가나다순</option></select></label>
      </div>
      <p className="dictionary-count" aria-live="polite">{query.trim() ? '검색 결과' : config.categoryName} {rows.length}개 용어{pageCount > 1 ? ` · ${currentPage}/${pageCount} 페이지` : ''}</p>
    </div>
    <div dangerouslySetInnerHTML={{ __html: categoriesHTML }} />
    <ul className="term-grid">
      {visible.map(term => <li key={term.id} className="term-card"><a href={term.url}>
        {!config.category && <span className="term-card-category">{term.categoryName}</span>}
        <h2>{term.name}</h2><p className="term-card-english" lang="en">{term.english}</p><p className="term-card-definition">{term.definition}</p><span className="term-card-more">자세히 보기 <span aria-hidden="true">→</span></span>
      </a></li>)}
    </ul>
    {!rows.length && <p className="empty">일치하는 용어가 없습니다. 다른 단어나 초성으로 찾아보세요.</p>}
    {pageCount > 1 && <nav className="dictionary-pagination" aria-label="목록 페이지">
      {currentPage > 1 && pageLink(currentPage - 1, '이전')}
      {Array.from({ length: pageCount }, (_, i) => pageLink(i + 1, String(i + 1)))}
      {currentPage < pageCount && pageLink(currentPage + 1, '다음')}
    </nav>}
  </>
}
