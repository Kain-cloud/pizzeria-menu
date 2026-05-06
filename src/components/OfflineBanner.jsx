import React from 'react';
import { useTranslation } from 'react-i18next';

export default function OfflineBanner({ stale }) {
  const { t } = useTranslation();
  
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 text-sm">
      <p>{stale ? t('offline.stale') : t('offline.noCache')}</p>
    </div>
  );
}
