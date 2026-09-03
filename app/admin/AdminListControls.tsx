'use client';
import React, { useMemo, useState } from 'react';

/**
 * Client-side search + pagination for an admin list panel. Filtering and
 * paging both happen in-memory since these lists are small (tens of
 * records) — no point adding server-side query params for this scale.
 */
export function useSearchPage<T>(
  list: T[],
  matcher: (item: T, query: string) => boolean,
  pageSize = 8
) {
  const [query, setQueryRaw] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? list.filter(item => matcher(item, q)) : list;
  }, [list, query]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const setQuery = (q: string) => { setQueryRaw(q); setPage(0); };

  return { query, setQuery, page: safePage, setPage, pageCount, paged, total: filtered.length };
}

export function AdminSearchBar({
  value, onChange, placeholder,
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      className="adm-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || 'Search…'}
      style={{ marginBottom: 14, maxWidth: 320 }}
    />
  );
}

export function AdminPager({
  page, pageCount, total, onChange,
}: { page: number; pageCount: number; total: number; onChange: (p: number) => void }) {
  if (pageCount <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, fontSize: 11, color: 'var(--tx4)' }}>
      <button type="button" className="adm-action" disabled={page === 0} onClick={() => onChange(page - 1)}>← Prev</button>
      <span>Page {page + 1} of {pageCount} · {total} total</span>
      <button type="button" className="adm-action" disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  );
}
