import React from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from 'react-i18next';

export default function CategoryNav() {
  const { categories, activeCategory, setCategory } = useMenuStore();
  const { t } = useTranslation();

  return (
    <div className="w-full overflow-x-auto whitespace-nowrap bg-white border-b px-4 py-3 hide-scrollbar">
      {categories.sort((a, b) => a.sort_order - b.sort_order).map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategory(cat.id)}
          className={`inline-block px-4 py-2 mr-2 rounded-full font-medium transition-colors ${
            activeCategory === cat.id
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {t(`categories.${cat.id}`, cat.id)}
        </button>
      ))}
    </div>
  );
}
