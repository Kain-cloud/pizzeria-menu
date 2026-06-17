import React from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from 'react-i18next';

export default function CategoryNav() {
  const { categories, activeCategory, setCategory } = useMenuStore();
  const { t } = useTranslation();

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-3 hide-scrollbar" role="tablist" aria-label="Menu categories">
      {categories.map((cat) => (
        <button
          key={cat.id}
          role="tab"
          aria-selected={activeCategory === cat.id}
          onClick={() => setCategory(cat.id)}
          className={`px-3.5 py-[7px] rounded-full text-[12.5px] font-medium border whitespace-nowrap transition-all cursor-pointer ${
            activeCategory === cat.id
              ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
              : 'bg-white text-warm-500 border-warm-200 hover:text-brand-500 hover:border-brand-200'
          }`}
        >
          {t(`categories.${cat.id}`, cat.id)}
        </button>
      ))}
    </div>
  );
}
