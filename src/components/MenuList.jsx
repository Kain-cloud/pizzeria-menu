import React from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from 'react-i18next';
import DishCard from './DishCard';

export default function MenuList({ visibleItems, isSearching }) {
  const { menuStatus, error, query } = useMenuStore();
  const { t } = useTranslation();

  if (menuStatus === 'loading') {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (menuStatus === 'error') {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">
          {error?.message === 'offline' 
            ? t('offline.noCache') 
            : 'Failed to load menu. Pull down to retry.'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (visibleItems.length === 0 && menuStatus === 'ready') {
    return (
      <div className="text-center p-8 text-gray-500">
        {isSearching 
          ? t('search.noResults', { query })
          : 'No dishes available in this category.'}
      </div>
    );
  }

  return (
    <div>
      {isSearching && (
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          {t('search.resultsFor', { query })}
        </h2>
      )}
      <div className="space-y-4">
        {visibleItems.sort((a, b) => a.sort_order - b.sort_order).map(item => (
          <DishCard key={item.id} item={item} isSearching={isSearching} />
        ))}
      </div>
    </div>
  );
}
