import React from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from 'react-i18next';

export default function SearchBar() {
  const { query, setQuery, clearSearch } = useMenuStore();
  const { t } = useTranslation();

  return (
    <div className="relative w-full px-4 py-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('nav.search')}
        className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      {query.length > 0 && (
        <button
          onClick={clearSearch}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 font-bold"
        >
          ×
        </button>
      )}
    </div>
  );
}
