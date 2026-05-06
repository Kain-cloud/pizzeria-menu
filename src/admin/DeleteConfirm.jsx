import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DeleteConfirm({ count, onConfirm, onCancel }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  
  const needsTyping = count >= 4;
  const canConfirm = !needsTyping || input === 'DELETE';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-red-600 mb-2">Confirm Deletion</h3>
        
        <p className="mb-4 text-gray-700">
          {needsTyping 
            ? t('admin.confirmDeleteMany', { count }) 
            : 'Are you sure you want to delete this item?'}
        </p>

        {needsTyping && (
          <input
            type="text"
            className="w-full border border-gray-300 p-2 rounded mb-4"
            placeholder="DELETE"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded font-medium disabled:opacity-50"
          >
            {t('admin.delete', 'Delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
