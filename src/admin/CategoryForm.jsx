import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const PRESET_EMOJIS = ['🍕', '🍝', '🥗', '🍰', '🥤', '🍖', '🍣', '🥙', '☕', '🍷', '🍺', '🥞', '🍚', '🥖', '🍨'];

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
          .update({ emoji: payload.emoji })
          .eq('id', category.id);
          
        if (updateErr) throw updateErr;
      } else {
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
    <div className="fixed inset-0 bg-warm-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-[400px] border border-warm-200 flex flex-col font-sans shadow-2xl overflow-hidden">
        
        <div className="p-[20px_24px_16px] border-b border-warm-200 flex items-center justify-between shrink-0 bg-warm-50">
          <div className="text-[16px] font-bold text-warm-900">{isEditing ? 'Edit category' : 'Add new category'}</div>
          <button onClick={onClose} className="text-[20px] text-warm-400 hover:text-warm-900 cursor-pointer bg-transparent border-none leading-none">
            ✕
          </button>
        </div>
        
        <div className="p-[20px_24px] flex flex-col gap-5 overflow-y-auto">
          {error && <div className="text-red-600 text-[13px] font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Display name</label>
            <input 
              type="text" 
              className="px-3.5 py-2.5 rounded-lg border border-warm-200 text-[13.5px] bg-white text-warm-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              placeholder="e.g. Pasta & Risotto"
              value={displayName}
              onChange={handleDisplayNameChange}
              disabled={isEditing}
            />
            {isEditing && <span className="text-[11px] text-warm-400 mt-1">Category name cannot be changed once created.</span>}
          </div>

          {!isEditing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Category ID</label>
              <input 
                type="text" 
                required
                className="px-3.5 py-2.5 rounded-lg border border-warm-200 text-[13px] bg-warm-50 text-warm-600 font-mono focus:outline-none focus:border-brand-500 transition-all"
                value={formData.id}
                onChange={e => setFormData({...formData, id: e.target.value})}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Emoji Icon</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_EMOJIS.map(em => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setFormData({...formData, emoji: em})}
                  className={`w-9 h-9 rounded-full text-xl flex items-center justify-center transition-all cursor-pointer border shadow-sm ${formData.emoji === em ? 'bg-brand-50 border-brand-200 scale-110' : 'bg-white border-warm-200 hover:bg-warm-50 hover:border-warm-300'}`}
                >
                  {em}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[13px] text-warm-500 font-medium">Custom:</span>
              <input 
                type="text" 
                maxLength="2"
                className="w-14 px-2 py-1.5 text-center rounded-lg border border-warm-200 text-[18px] bg-white text-warm-900 focus:outline-none focus:border-brand-500 transition-all shadow-sm"
                value={formData.emoji}
                onChange={e => setFormData({...formData, emoji: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="p-[16px_24px] border-t border-warm-200 flex justify-end gap-3 shrink-0 bg-warm-50 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-warm-300 bg-white text-[13.5px] text-warm-700 font-medium cursor-pointer hover:bg-warm-100 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 rounded-lg border-none bg-brand-500 text-white text-[13.5px] font-semibold cursor-pointer hover:bg-brand-600 disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? 'Saving...' : 'Save category'}
          </button>
        </div>
      </div>
    </div>
  );
}
