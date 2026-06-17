import React from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from 'react-i18next';

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function SearchBar() {
  const { query, setQuery, clearSearch } = useMenuStore();
  const { t } = useTranslation();

  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('nav.search', 'Search dishes…')}
        aria-label={t('nav.search', 'Search dishes')}
        className="w-full py-2.5 pr-3 pl-9 rounded-xl border border-warm-200 text-[13px] bg-warm-50 text-warm-800 transition-all focus:outline-none focus:border-brand-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(155,44,44,0.06)] placeholder:text-warm-400"
      />
      {query.length > 0 && (
        <button
          onClick={clearSearch}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 cursor-pointer bg-transparent border-none text-sm font-bold"
        >
          ✕
        </button>
      )}
    </div>
  );
}
