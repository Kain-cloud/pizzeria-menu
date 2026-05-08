import React from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from 'react-i18next';

export default function SearchBar() {
  const { query, setQuery, clearSearch } = useMenuStore();
  const { t } = useTranslation();

  return (
    <div className="relative w-full pb-1">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
        🔍
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('nav.search', 'Search dishes...')}
        className="w-full py-[9px] pr-[12px] pl-[36px] rounded-full border-[0.5px] border-gray-200 text-[13px] bg-[#f8f7f4] text-gray-900 transition-all focus:outline-none focus:border-[#c62828] focus:bg-white focus:shadow-[0_0_0_3px_rgba(198,40,40,0.08)] placeholder-gray-400"
      />
      {query.length > 0 && (
        <button
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
}
