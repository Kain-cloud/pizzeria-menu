import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ItemForm({ item, categories, onClose, onSave }) {
  const isEditing = !!item;
  
  const [formData, setFormData] = useState({
    slug: item?.slug || '',
    category_id: item?.category_id || (categories[0]?.id || ''),
    prices: item?.prices ? JSON.stringify(item.prices) : '{"default": 0}',
    image_url: item?.image_url || '',
    allergens: item?.allergens ? item.allergens.join(', ') : '',
    is_available: item ? item.is_available : true,
    sort_order: item?.sort_order || 0
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let parsedPrices;
      try {
        parsedPrices = JSON.parse(formData.prices);
      } catch (err) {
        throw new Error('Prices must be valid JSON');
      }

      const payload = {
        slug: formData.slug,
        category_id: formData.category_id,
        prices: parsedPrices,
        image_url: formData.image_url || null,
        allergens: formData.allergens.split(',').map(s => s.trim()).filter(Boolean),
        is_available: formData.is_available,
        sort_order: parseInt(formData.sort_order, 10) || 0,
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        // Concurrency check
        const { data: current, error: fetchErr } = await supabase
          .from('menu_items')
          .select('updated_at')
          .eq('id', item.id)
          .single();

        if (fetchErr) throw fetchErr;

        if (current.updated_at !== item.updated_at) {
          alert('This item was modified elsewhere. Reload before saving.');
          setSaving(false);
          return;
        }

        const { error } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', item.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([payload]);
          
        if (error) throw error;
      }

      onSave();
    } catch (err) {
      alert(`Save failed: ${err.message}`);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Item' : 'New Item'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Slug</label>
            <input 
              type="text" 
              required
              className="w-full border p-2 rounded" 
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Category</label>
            <select 
              className="w-full border p-2 rounded"
              value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Prices (JSON)</label>
            <textarea 
              required
              rows={3}
              className="w-full border p-2 rounded font-mono text-sm" 
              value={formData.prices}
              onChange={e => setFormData({...formData, prices: e.target.value})}
              placeholder={'{"s": 250, "m": 400, "l": 600} or {"default": 350}'}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Image URL</label>
            <input 
              type="url" 
              className="w-full border p-2 rounded" 
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Allergens (comma separated)</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded" 
              value={formData.allergens}
              onChange={e => setFormData({...formData, allergens: e.target.value})}
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1">Sort Order</label>
              <input 
                type="number" 
                className="w-full border p-2 rounded" 
                value={formData.sort_order}
                onChange={e => setFormData({...formData, sort_order: e.target.value})}
              />
            </div>
            <div className="flex-1 flex items-center mt-6">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={formData.is_available}
                  onChange={e => setFormData({...formData, is_available: e.target.checked})}
                />
                <span className="font-bold">Is Available</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border rounded font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
