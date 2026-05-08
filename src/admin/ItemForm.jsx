import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ItemForm({ item, categories, onClose, onSave }) {
  const isEditing = !!item;
  
  // Convert slug to Display Name
  const initialDisplayName = isEditing 
    ? item.slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '';

  const [displayName, setDisplayName] = useState(initialDisplayName);

  // Parse prices for UI
  const initialPrices = item?.prices || { default: 0 };
  const hasSizes = initialPrices.s !== undefined;
  
  const [priceType, setPriceType] = useState(hasSizes ? 'sizes' : 'single');
  const [priceSingle, setPriceSingle] = useState(initialPrices.default || 0);
  const [priceS, setPriceS] = useState(initialPrices.s || 0);
  const [priceM, setPriceM] = useState(initialPrices.m || 0);
  const [priceL, setPriceL] = useState(initialPrices.l || 0);

  const [formData, setFormData] = useState({
    slug: item?.slug || '',
    category_id: item?.category_id || (categories[0]?.id || ''),
    image_url: item?.image_url || '',
    allergens: item?.allergens ? item.allergens.join(', ') : '',
    tags: item?.tags || [],
    is_available: item ? item.is_available : true,
    sort_order: item?.sort_order || 0
  });

  const [saving, setSaving] = useState(false);

  // Auto-generate slug when display name changes (if not explicitly overridden)
  const handleDisplayNameChange = (e) => {
    const val = e.target.value;
    setDisplayName(val);
    const autoSlug = val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    setFormData(prev => ({ ...prev, slug: autoSlug }));
  };

  const toggleTag = (tag) => {
    setFormData(prev => {
      const tags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const finalPrices = priceType === 'single' 
        ? { default: Number(priceSingle) }
        : { s: Number(priceS), m: Number(priceM), l: Number(priceL) };

      const payload = {
        slug: formData.slug,
        category_id: formData.category_id,
        prices: finalPrices,
        image_url: formData.image_url || null,
        allergens: formData.allergens.split(',').map(s => s.trim()).filter(Boolean),
        tags: formData.tags,
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
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto border-[0.5px] border-gray-200 flex flex-col font-sans shadow-2xl">
        
        {/* Header */}
        <div className="p-[20px_24px_16px] border-b-[0.5px] border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-[15px] font-medium text-gray-900">{isEditing ? 'Edit dish' : 'Add new dish'}</div>
          <button onClick={onClose} className="text-[18px] text-gray-400 hover:text-gray-900 cursor-pointer bg-transparent border-none leading-none">
            &times;
          </button>
        </div>
        
        {/* Body */}
        <div className="p-[20px_24px] flex flex-col gap-4 overflow-y-auto">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Display name</label>
            <input 
              type="text" 
              className="px-3 py-2 rounded-md border-[0.5px] border-gray-300 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-red-600 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.08)]"
              placeholder="e.g. Margherita"
              value={displayName}
              onChange={handleDisplayNameChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Slug (auto-generated)</label>
            <input 
              type="text" 
              required
              className="px-3 py-2 rounded-md border-[0.5px] border-gray-300 text-[13px] bg-gray-50 text-gray-600 font-mono focus:outline-none focus:border-red-600 focus:bg-white"
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
            />
            <span className="text-[11px] text-gray-400">Lowercase, no spaces. Used to link translations. Example: "four_seasons"</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Category</label>
            <select 
              className="px-3 py-2 rounded-md border-[0.5px] border-gray-300 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-red-600"
              value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.emoji || '🍕'} {c.id}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Pricing</label>
            <div className="flex gap-1.5 mb-1">
              <button 
                type="button"
                onClick={() => setPriceType('single')}
                className={`px-3.5 py-1.5 rounded-full text-[12px] border-[0.5px] cursor-pointer transition-colors ${
                  priceType === 'single' ? 'bg-[#dc2626] text-white border-[#dc2626]' : 'bg-transparent text-gray-500 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Single price
              </button>
              <button 
                type="button"
                onClick={() => setPriceType('sizes')}
                className={`px-3.5 py-1.5 rounded-full text-[12px] border-[0.5px] cursor-pointer transition-colors ${
                  priceType === 'sizes' ? 'bg-[#dc2626] text-white border-[#dc2626]' : 'bg-transparent text-gray-500 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Small / Medium / Large
              </button>
            </div>

            {priceType === 'single' ? (
              <div className="flex gap-2.5">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide bg-[#f8f7f4] rounded-t-md px-2 py-1 text-center border-[0.5px] border-gray-200 border-b-0">Price (L)</div>
                  <input type="number" required min="0" value={priceSingle} onChange={e => setPriceSingle(e.target.value)} className="rounded-b-md text-center font-medium border-[0.5px] border-gray-300 p-2 text-[13px] focus:outline-none focus:border-red-600" />
                </div>
                <div className="flex-1"></div>
                <div className="flex-1"></div>
              </div>
            ) : (
              <div className="flex gap-2.5">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide bg-[#f8f7f4] rounded-t-md px-2 py-1 text-center border-[0.5px] border-gray-200 border-b-0">S</div>
                  <input type="number" required min="0" value={priceS} onChange={e => setPriceS(e.target.value)} className="rounded-b-md text-center font-medium border-[0.5px] border-gray-300 p-2 text-[13px] focus:outline-none focus:border-red-600" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide bg-[#f8f7f4] rounded-t-md px-2 py-1 text-center border-[0.5px] border-gray-200 border-b-0">M</div>
                  <input type="number" required min="0" value={priceM} onChange={e => setPriceM(e.target.value)} className="rounded-b-md text-center font-medium border-[0.5px] border-gray-300 p-2 text-[13px] focus:outline-none focus:border-red-600" />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wide bg-[#f8f7f4] rounded-t-md px-2 py-1 text-center border-[0.5px] border-gray-200 border-b-0">L</div>
                  <input type="number" required min="0" value={priceL} onChange={e => setPriceL(e.target.value)} className="rounded-b-md text-center font-medium border-[0.5px] border-gray-300 p-2 text-[13px] focus:outline-none focus:border-red-600" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Image URL</label>
            <input 
              type="url" 
              className="px-3 py-2 rounded-md border-[0.5px] border-gray-300 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-red-600"
              placeholder="https://..."
              value={formData.image_url}
              onChange={e => setFormData({...formData, image_url: e.target.value})}
            />
            <span className="text-[11px] text-gray-400">Paste a direct link to the dish photo (optional)</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Tags</label>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => toggleTag('vegetarian')}
                className={`text-[12px] px-3 py-1 rounded-full font-medium border-[0.5px] cursor-pointer transition-colors ${
                  formData.tags.includes('vegetarian') ? 'bg-[#dcfce7] text-[#15803d] border-[#15803d]/20' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {formData.tags.includes('vegetarian') ? '✓ Vegetarian' : '+ Vegetarian'}
              </button>
              <button 
                type="button" 
                onClick={() => toggleTag('spicy')}
                className={`text-[12px] px-3 py-1 rounded-full font-medium border-[0.5px] cursor-pointer transition-colors ${
                  formData.tags.includes('spicy') ? 'bg-[#fee2e2] text-[#b91c1c] border-[#b91c1c]/20' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {formData.tags.includes('spicy') ? '✓ Spicy' : '+ Spicy'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Allergens</label>
            <input 
              type="text" 
              className="px-3 py-2 rounded-md border-[0.5px] border-gray-300 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-red-600"
              placeholder="gluten, dairy, nuts"
              value={formData.allergens}
              onChange={e => setFormData({...formData, allergens: e.target.value})}
            />
            <span className="text-[11px] text-gray-400">Comma-separated. Leave blank if none.</span>
          </div>

          <div className="flex gap-4 items-end mt-2">
            <div className="flex flex-col gap-1.5 w-[100px]">
              <label className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Sort order</label>
              <input 
                type="number" 
                className="px-3 py-2 rounded-md border-[0.5px] border-gray-300 text-[13px] bg-white text-gray-900 focus:outline-none focus:border-red-600"
                placeholder="0"
                value={formData.sort_order}
                onChange={e => setFormData({...formData, sort_order: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-2.5 pb-2 ml-4 cursor-pointer" onClick={() => setFormData({...formData, is_available: !formData.is_available})}>
              <div className={`w-[36px] h-[20px] rounded-full relative transition-colors ${formData.is_available ? 'bg-green-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white transition-all shadow-sm ${formData.is_available ? 'left-[18px]' : 'left-[2px]'}`}></div>
              </div>
              <span className="text-[13px] text-gray-900 font-medium select-none">Available to customers</span>
            </div>
          </div>

        </div>

        {/* Footer */}
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
            {saving ? 'Saving...' : 'Save dish'}
          </button>
        </div>
      </div>
    </div>
  );
}
