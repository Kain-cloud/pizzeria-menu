import React from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from 'react-i18next';

export default function CategoryNav() {
  const { categories, activeCategory, setCategory } = useMenuStore();
  const { t } = useTranslation();

  return (
    <div className="flex gap-[6px] overflow-x-auto pb-3 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {categories.sort((a, b) => a.sort_order - b.sort_order).map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategory(cat.id)}
          className={`px-[16px] py-[7px] rounded-full text-[13px] font-medium border-[0.5px] whitespace-nowrap transition-colors cursor-pointer ${
            activeCategory === cat.id
              ? 'bg-[#c62828] text-white border-[#c62828]'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-[#f8f7f4] hover:text-[#c62828] hover:border-[#c62828]'
          }`}
        >
          {t(`categories.${cat.id}`, cat.id)}
        </button>
      ))}
    </div>
  );
}
