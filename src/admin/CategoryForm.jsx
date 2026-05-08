import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const PRESET_EMOJIS = ['🍕', '🍝', '🥗', '🍰', '🥤', '🍖', '🍣', '🥙', '☕', '🍷'];

export default function CategoryForm({ category, onClose, onSave }) {
  const isEditing = !!category;
  
  const initialDisplayName = isEditing 
    ? category.id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '';

  const [displayName, setDisplayName] = useState(initialDisplayName);

  const [formData, setFormData] = useState({
    id: category?.id || '',
    emoji: category?.emoji || '🍕',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleDisplayNameChange = (e) => {
    const val = e.target.value;
    setDisplayName(val);
    if (!isEditing) {
      const autoId = val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      setFormData(prev => ({ ...prev, id: autoId }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.id.trim()) throw new Error('Category ID cannot be empty');

      const payload = {
        id: formData.id,
        emoji: formData.emoji,
      };

      if (isEditing) {
        const { error: updateErr } = await supabase
          .from('categories')
          .update({ emoji: payload.emoji }) // We only update emoji here, not ID (PK)
          .eq('id', category.id);
          
        if (updateErr) throw updateErr;
      } else {
        // Need to find max sort_order
        const { data, error: countErr } = await supabase
          .from('categories')
          .select('sort_order')
          .order('sort_order', { ascending: false })
          .limit(1);
          
        if (countErr) throw countErr;
        
        payload.sort_order = data && data.length > 0 ? data[0].sort_order + 1 : 0;
        payload.is_visible = true;

        const { error: insertErr } = await supabase
          .from('categories')
          .insert([payload]);
          
        if (insertErr) throw insertErr;
      }

      onSave();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[400px] border-[0.5px] border-gray-200 flex flex-col font-sans shadow-2xl">
        
        <div className="p-[20px_24px_16px] border-b-[0.5px] border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-[15px] font-medium text-gray-900">{isEditing ? 'Edit category' : 'Add new category'}</div>
          <button onClick={onClose} className="text-[18px] text-gray-400 hover:text-gray-900 cursor-pointer bg-transparent border-none leading-none">
            &times;
          </button>
        </div>
        
        <div className="p-[20px_24px] flex flex-col gap-4 overflow-y-auto">
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Display name</label>
            <input 
              type="text" 
              className="px-3 py-2 rounded-md border-[0.5px] border-gray-300 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-red-600"
              placeholder="e.g. Pasta & Risotto"
              value={displayName}
              onChange={handleDisplayNameChange}
              disabled={isEditing}
            />
            {isEditing && <span className="text-[11px] text-gray-400">Category name cannot be changed once created.</span>}
          </div>

          {!isEditing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Category ID</label>
              <input 
                type="text" 
                required
                className="px-3 py-2 rounded-md border-[0.5px] border-gray-300 text-[13px] bg-gray-50 text-gray-600 font-mono focus:outline-none focus:border-red-600 focus:bg-white"
                value={formData.id}
                onChange={e => setFormData({...formData, id: e.target.value})}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Emoji Icon</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_EMOJIS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setFormData({...formData, emoji: em})}
                  className={`w-8 h-8 rounded-full text-lg flex items-center justify-center transition-colors cursor-pointer border ${formData.emoji === em ? 'bg-red-50 border-red-200' : 'bg-transparent border-transparent hover:bg-gray-100'}`}
                >
                  {em}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-gray-500">Custom:</span>
              <input 
                type="text" 
                maxLength="2"
                className="w-12 px-2 py-1 text-center rounded-md border-[0.5px] border-gray-300 text-[16px] bg-white text-gray-900 focus:outline-none focus:border-red-600"
                value={formData.emoji}
                onChange={e => setFormData({...formData, emoji: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="p-[16px_24px] border-t-[0.5px] border-gray-200 flex justify-end gap-2 shrink-0 bg-[#f8f7f4] rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-md border-[0.5px] border-gray-300 bg-transparent text-[13px] text-gray-700 cursor-pointer hover:bg-gray-100"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 rounded-md border-none bg-[#dc2626] text-white text-[13px] font-medium cursor-pointer hover:bg-[#b91c1c] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save category'}
          </button>
        </div>
      </div>
    </div>
  );
}
