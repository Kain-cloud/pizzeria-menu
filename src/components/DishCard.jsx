import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DishCard({ item, isSearching }) {
  const { t } = useTranslation();
  
  const priceEntries = Object.entries(item.prices || {});
  
  return (
    <div className={`flex bg-white rounded-lg shadow-sm border p-4 mb-4 ${!item.is_available ? 'opacity-60' : ''}`}>
      {item.image_url && (
        <img 
          src={item.image_url} 
          alt={t(`menu.${item.slug}.name`, item.slug)} 
          className="w-24 h-24 object-cover rounded-md mr-4"
        />
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900">
            {t(`menu.${item.slug}.name`, item.slug)}
          </h3>
          {isSearching && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2">
              {t(`categories.${item.category_id}`, item.category_id)}
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {t(`menu.${item.slug}.description`, '')}
        </p>

        {item.allergens && item.allergens.length > 0 && (
          <div className="mt-2 text-xs text-amber-600">
            {t('dish.allergens')}: {item.allergens.join(', ')}
          </div>
        )}
        
        <div className="mt-3 flex flex-wrap gap-3">
          {priceEntries.map(([size, price]) => (
            <div key={size} className="flex items-center">
              {size !== 'default' && (
                <span className="text-xs font-semibold text-gray-500 mr-1 uppercase">
                  {t(`dish.sizes.${size}`, size)}:
                </span>
              )}
              <span className="font-bold text-gray-900">{price} L</span>
            </div>
          ))}
        </div>
        
        {!item.is_available && (
          <div className="mt-2 text-sm text-red-600 font-medium">
            {t('dish.unavailable')}
          </div>
        )}
      </div>
    </div>
  );
}
