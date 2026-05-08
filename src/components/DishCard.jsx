import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DishCard({ item, isSearching, categoryMap }) {
  const { t } = useTranslation();
  
  const priceEntries = Object.entries(item.prices || {});
  
  const fallbackEmoji = categoryMap?.[item.category_id]?.emoji || '🍕';
  
  const hasVeg = item.tags?.includes('vegetarian');
  const hasSpicy = item.tags?.includes('spicy');

  return (
    <div className={`flex bg-white rounded-xl border-[0.5px] border-[#e8d9c0] overflow-hidden transition-shadow hover:shadow-[0_2px_12px_rgba(198,40,40,0.08)] hover:border-[rgba(198,40,40,0.25)] ${!item.is_available ? 'opacity-70 grayscale-[30%]' : ''}`}>
      
      {/* Left side: Image or Emoji */}
      <div className="w-[90px] shrink-0 bg-[#f0e8d8] flex items-center justify-center text-[28px]">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={t(`menu.${item.slug}.name`, item.slug)} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{fallbackEmoji}</span>
        )}
      </div>

      {/* Right side: Info */}
      <div className="flex-1 p-[12px_14px] flex flex-col justify-between">
        
        {/* Top: Name & Tags */}
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-[14px] font-medium text-gray-900 leading-tight">
              {t(`menu.${item.slug}.name`, item.slug)}
            </h3>
            <div className="flex gap-1 shrink-0">
              {hasVeg && <span className="text-[10px] px-2 py-[2px] rounded-full font-medium shrink-0 bg-[#dcfce7] text-[#15803d]">Vegetarian</span>}
              {hasSpicy && <span className="text-[10px] px-2 py-[2px] rounded-full font-medium shrink-0 bg-[#fee2e2] text-[#b91c1c]">Spicy</span>}
            </div>
          </div>
          <p className="text-[12px] text-gray-500 mt-1 line-height-[1.5]">
            {t(`menu.${item.slug}.description`, '')}
          </p>
        </div>

        {/* Bottom: Prices & Action */}
        <div className="mt-2.5 flex items-end justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {priceEntries.map(([size, price]) => (
              <div key={size} className="flex items-center gap-1 bg-[#fdf6ec] border-[0.5px] border-[#e8d9c0] rounded-md px-2 py-[3px]">
                {size !== 'default' && (
                  <span className="text-[10px] uppercase font-medium text-[#a0522d]">
                    {t(`dish.sizes.${size}`, size)}
                  </span>
                )}
                <span className="text-[12px] font-medium text-[#7a3a1a]">{price} L</span>
              </div>
            ))}
          </div>
          
          {item.is_available ? (
            <button className="w-[30px] h-[30px] rounded-full bg-[#c62828] text-white flex items-center justify-center shrink-0 text-[18px] leading-none hover:bg-[#a61c1c] active:scale-95 transition-all">
              +
            </button>
          ) : (
            <span className="text-[11px] font-medium text-red-500 bg-red-50 px-2 py-1 rounded-md shrink-0">
              {t('dish.unavailable', 'Currently unavailable')}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
