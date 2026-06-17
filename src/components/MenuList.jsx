import React, { useMemo } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from 'react-i18next';
import DishCard from './DishCard';
import LoadingSkeleton from './LoadingSkeleton';

export default function MenuList({ visibleItems, isSearching }) {
  const { categories, menuStatus, error, query } = useMenuStore();
  const { t } = useTranslation();

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {});
  }, [categories]);

  if (menuStatus === 'loading') {
    return <LoadingSkeleton />;
  }

  if (menuStatus === 'error') {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-brand-500 text-sm mb-4">
          {error?.message === 'offline'
            ? t('offline.noCache')
            : 'Failed to load menu. Please try again.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-500 text-white text-sm rounded-lg hover:bg-brand-600 transition-colors cursor-pointer border-none"
        >
          Retry
        </button>
      </div>
    );
  }

  const sorted = [...visibleItems].sort((a, b) => a.sort_order - b.sort_order);

  if (sorted.length === 0 && menuStatus === 'ready') {
    return (
      <div className="text-center py-12 text-warm-400 text-[13px]">
        {isSearching
          ? t('search.noResults', { query })
          : t('empty.category')}
      </div>
    );
  }

  return (
    <div>
      {isSearching && (
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-warm-400 mb-2">
          {t('search.resultsFor', { query })}
        </h2>
      )}
      <div className="flex flex-col gap-2.5">
        {sorted.map(item => (
          <DishCard key={item.id} item={item} isSearching={isSearching} categoryMap={categoryMap} />
        ))}
      </div>
    </div>
  );
}
