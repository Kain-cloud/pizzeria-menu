import React from 'react';
import { useTranslation } from 'react-i18next';

export default function OfflineBanner({ stale }) {
  const { t } = useTranslation();

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2 text-[12px] text-amber-800">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
      </svg>
      <p>{stale ? t('offline.stale') : t('offline.noCache')}</p>
    </div>
  );
}
