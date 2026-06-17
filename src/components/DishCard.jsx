import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getItemText } from '../lib/menuFilter';
import { trackView } from '../lib/analytics';

export default function DishCard({ item, isSearching, categoryMap }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const cardRef = useRef(null);
  const trackedRef = useRef(false);

  const name = getItemText(item, lang, 'name');
  const description = getItemText(item, lang, 'description');
  const priceEntries = Object.entries(item.prices || {});
  const fallbackEmoji = categoryMap?.[item.category_id]?.emoji || '🍕';
  const hasVeg = item.tags?.includes('vegetarian');
  const hasSpicy = item.tags?.includes('spicy');
  const allergens = item.allergens?.filter(Boolean) || [];

  // Analytics: track when card becomes visible
  useEffect(() => {
    if (!cardRef.current || trackedRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          trackView(item.id, item.category_id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [item.id, item.category_id]);

  // Reset tracked ref when item changes (e.g. category switch)
  useEffect(() => { trackedRef.current = false; }, [item.id]);

  return (
    <div
      ref={cardRef}
      className={`flex bg-white rounded-xl border border-warm-200 overflow-hidden transition-all hover:shadow-md hover:border-warm-300 animate-fade-in ${
        !item.is_available ? 'opacity-60 grayscale-[25%]' : ''
      }`}
    >
      {/* Image / Emoji */}
      <div className="w-[88px] shrink-0 bg-warm-100 flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-[26px]">{fallbackEmoji}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col justify-between min-h-[88px]">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-[13.5px] font-semibold text-warm-800 leading-tight">{name}</h3>
            <div className="flex gap-1 shrink-0">
              {hasVeg && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 leading-none">Veg</span>}
              {hasSpicy && <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-red-50 text-red-700 leading-none">Hot</span>}
            </div>
          </div>
          {description && (
            <p className="text-[11.5px] text-warm-400 mt-0.5 leading-snug line-clamp-2">{description}</p>
          )}
        </div>

        {/* Prices & Allergens */}
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="flex gap-1.5 flex-wrap">
            {priceEntries.map(([size, price]) => (
              <div key={size} className="flex items-center gap-1 bg-warm-50 border border-warm-200 rounded px-1.5 py-0.5">
                {size !== 'default' && (
                  <span className="text-[9px] uppercase font-semibold text-warm-400 tracking-wide">{size}</span>
                )}
                <span className="text-[12px] font-semibold text-warm-600">{price} L</span>
              </div>
            ))}
          </div>
          {allergens.length > 0 && (
            <span className="text-[10px] text-warm-400 shrink-0" title={allergens.join(', ')}>
              ⚠ {allergens.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
