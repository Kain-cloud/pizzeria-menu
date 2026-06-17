import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { uploadImage, deleteImage } from '../lib/storage';
import { translateMenuItem, isGeminiConfigured } from '../lib/gemini';

export default function ItemForm({ item, categories, onClose, onSave }) {
  const isEditing = !!item;
  
  const initialDisplayName = isEditing 
    ? item.slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '';

  const [displayName, setDisplayName] = useState(initialDisplayName);

  const initialPrices = item?.prices || { default: 0 };
  const hasSizes = initialPrices.s !== undefined;
  
  const [priceType, setPriceType] = useState(hasSizes ? 'sizes' : 'single');
  const [priceSingle, setPriceSingle] = useState(initialPrices.default || 0);
  const [priceS, setPriceS] = useState(initialPrices.s || 0);
  const [priceM, setPriceM] = useState(initialPrices.m || 0);
  const [priceL, setPriceL] = useState(initialPrices.l || 0);

  const [description, setDescription] = useState(item?.translations?.en?.description || '');

  const [formData, setFormData] = useState({
    slug: item?.slug || '',
    category_id: item?.category_id || (categories[0]?.id || ''),
    image_url: item?.image_url || '',
    allergens: item?.allergens ? item.allergens.join(', ') : '',
    tags: item?.tags || [],
    is_available: item ? item.is_available : true,
    sort_order: item?.sort_order || 0,
    translations: item?.translations || {}
  });

  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleAutoTranslate = async () => {
    if (!displayName) {
      alert("Please enter a display name first.");
      return;
    }
    setTranslating(true);
    try {
      const translations = await translateMenuItem(displayName, description, 'en');
      setFormData(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          en: { name: displayName, description },
          it: translations.it,
          es: translations.es
        }
      }));
    } catch (err) {
      alert("Translation failed: " + err.message);
    } finally {
      setTranslating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      if (formData.image_url) {
        await deleteImage(formData.image_url);
      }
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      alert("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
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
        translations: {
          ...formData.translations,
          en: { name: displayName, description }
        },
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
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
    <div className="fixed inset-0 bg-warm-900/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col font-sans shadow-2xl border border-warm-200">
        
        {/* Header */}
        <div className="p-[20px_24px_16px] border-b border-warm-200 flex items-center justify-between shrink-0 bg-warm-50">
          <div className="text-[16px] font-bold text-warm-900">{isEditing ? 'Edit dish' : 'Add new dish'}</div>
          <button onClick={onClose} className="text-[20px] text-warm-400 hover:text-warm-900 cursor-pointer bg-transparent border-none leading-none">
            ✕
          </button>
        </div>
        
        {/* Body */}
        <div className="p-[20px_24px] flex flex-col gap-5 overflow-y-auto">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Display name (English)</label>
            <input 
              type="text" 
              className="px-3.5 py-2.5 rounded-lg border border-warm-200 text-[13.5px] bg-white text-warm-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              placeholder="e.g. Margherita"
              value={displayName}
              onChange={handleDisplayNameChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Description (English)</label>
            <textarea 
              className="px-3.5 py-2.5 rounded-lg border border-warm-200 text-[13.5px] bg-white text-warm-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all resize-none h-20"
              placeholder="e.g. Tomato sauce, mozzarella, fresh basil"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Translations (Gemini) */}
          <div className="bg-brand-50 rounded-lg p-3 border border-brand-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-brand-600 uppercase tracking-wider">Translations (IT, ES)</span>
              {isGeminiConfigured() && (
                <button 
                  type="button" 
                  onClick={handleAutoTranslate}
                  disabled={translating}
                  className="text-[11px] font-semibold bg-white border border-brand-200 text-brand-600 px-2.5 py-1 rounded-md shadow-sm hover:bg-brand-50 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {translating ? 'Translating...' : '✨ Auto-translate'}
                </button>
              )}
            </div>
            {formData.translations?.it?.name && (
              <div className="text-[12px] text-warm-600">
                <div>🇮🇹 {formData.translations.it.name}</div>
                <div>🇪🇸 {formData.translations.es.name}</div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Slug (auto-generated)</label>
            <input 
              type="text" 
              required
              className="px-3.5 py-2.5 rounded-lg border border-warm-200 text-[13px] bg-warm-50 text-warm-600 font-mono focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              value={formData.slug}
              onChange={e => setFormData({...formData, slug: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Category</label>
            <select 
              className="px-3.5 py-2.5 rounded-lg border border-warm-200 text-[13.5px] bg-white text-warm-900 focus:outline-none focus:border-brand-500 transition-all cursor-pointer"
              value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.emoji || '🍕'} {c.id}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Pricing</label>
            <div className="flex gap-1.5 mb-2">
              <button 
                type="button"
                onClick={() => setPriceType('single')}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer ${
                  priceType === 'single' ? 'bg-warm-900 text-white border-warm-900 shadow-sm' : 'bg-white text-warm-600 border-warm-200 hover:bg-warm-50'
                }`}
              >
                Single price
              </button>
              <button 
                type="button"
                onClick={() => setPriceType('sizes')}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium border transition-colors cursor-pointer ${
                  priceType === 'sizes' ? 'bg-warm-900 text-white border-warm-900 shadow-sm' : 'bg-white text-warm-600 border-warm-200 hover:bg-warm-50'
                }`}
              >
                Small / Medium / Large
              </button>
            </div>

            {priceType === 'single' ? (
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider bg-warm-50 rounded-t-lg px-2 py-1.5 text-center border border-warm-200 border-b-0">Price (L)</div>
                  <input type="number" required min="0" value={priceSingle} onChange={e => setPriceSingle(e.target.value)} className="rounded-b-lg text-center font-medium border border-warm-200 p-2 text-[13.5px] focus:outline-none focus:border-brand-500" />
                </div>
                <div className="flex-1"></div>
                <div className="flex-1"></div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider bg-warm-50 rounded-t-lg px-2 py-1.5 text-center border border-warm-200 border-b-0">S</div>
                  <input type="number" required min="0" value={priceS} onChange={e => setPriceS(e.target.value)} className="rounded-b-lg text-center font-medium border border-warm-200 p-2 text-[13.5px] focus:outline-none focus:border-brand-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider bg-warm-50 rounded-t-lg px-2 py-1.5 text-center border border-warm-200 border-b-0">M</div>
                  <input type="number" required min="0" value={priceM} onChange={e => setPriceM(e.target.value)} className="rounded-b-lg text-center font-medium border border-warm-200 p-2 text-[13.5px] focus:outline-none focus:border-brand-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="text-[10px] font-bold text-warm-400 uppercase tracking-wider bg-warm-50 rounded-t-lg px-2 py-1.5 text-center border border-warm-200 border-b-0">L</div>
                  <input type="number" required min="0" value={priceL} onChange={e => setPriceL(e.target.value)} className="rounded-b-lg text-center font-medium border border-warm-200 p-2 text-[13.5px] focus:outline-none focus:border-brand-500" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Image</label>
            <div className="flex items-center gap-4">
              {formData.image_url ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-warm-200 shadow-sm shrink-0">
                  <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-1 right-1 bg-white/80 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer border-none shadow-sm hover:bg-white">✕</button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-warm-50 border border-warm-200 border-dashed flex items-center justify-center text-warm-400 shrink-0">
                  🖼️
                </div>
              )}
              <div className="flex-1">
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-warm-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                />
                {uploading && <div className="text-[11px] text-brand-600 mt-1 font-medium animate-pulse">Uploading image...</div>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Tags</label>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => toggleTag('vegetarian')}
                className={`text-[12px] px-3.5 py-1.5 rounded-full font-semibold border transition-colors cursor-pointer ${
                  formData.tags.includes('vegetarian') ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' : 'bg-white text-warm-500 border-warm-200 hover:bg-warm-50'
                }`}
              >
                {formData.tags.includes('vegetarian') ? '✓ Vegetarian' : '+ Vegetarian'}
              </button>
              <button 
                type="button" 
                onClick={() => toggleTag('spicy')}
                className={`text-[12px] px-3.5 py-1.5 rounded-full font-semibold border transition-colors cursor-pointer ${
                  formData.tags.includes('spicy') ? 'bg-red-50 text-red-700 border-red-200 shadow-sm' : 'bg-white text-warm-500 border-warm-200 hover:bg-warm-50'
                }`}
              >
                {formData.tags.includes('spicy') ? '✓ Spicy' : '+ Spicy'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Allergens</label>
            <input 
              type="text" 
              className="px-3.5 py-2.5 rounded-lg border border-warm-200 text-[13.5px] bg-white text-warm-900 focus:outline-none focus:border-brand-500 transition-all"
              placeholder="gluten, dairy, nuts"
              value={formData.allergens}
              onChange={e => setFormData({...formData, allergens: e.target.value})}
            />
          </div>

          <div className="flex gap-6 items-end mt-2">
            <div className="flex flex-col gap-1.5 w-[100px]">
              <label className="text-[12px] font-semibold text-warm-500 uppercase tracking-wider">Sort order</label>
              <input 
                type="number" 
                className="px-3.5 py-2.5 rounded-lg border border-warm-200 text-[13.5px] bg-white text-warm-900 focus:outline-none focus:border-brand-500 transition-all"
                placeholder="0"
                value={formData.sort_order}
                onChange={e => setFormData({...formData, sort_order: e.target.value})}
              />
            </div>

            <div className="flex items-center gap-3 pb-2.5 cursor-pointer group" onClick={() => setFormData({...formData, is_available: !formData.is_available})}>
              <div className={`w-10 h-5.5 rounded-full relative transition-colors shadow-inner ${formData.is_available ? 'bg-emerald-500' : 'bg-warm-300'}`}>
                <div className={`absolute top-[2px] w-4.5 h-4.5 rounded-full bg-white transition-all shadow-sm ${formData.is_available ? 'left-[20px]' : 'left-[2px]'}`}></div>
              </div>
              <span className="text-[13px] text-warm-800 font-semibold select-none group-hover:text-warm-900 transition-colors">Available to customers</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-[16px_24px] border-t border-warm-200 flex justify-end gap-3 shrink-0 bg-warm-50 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-warm-300 bg-white text-[13.5px] font-medium text-warm-700 cursor-pointer hover:bg-warm-100 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={saving || uploading || translating}
            className="px-6 py-2 rounded-lg border-none bg-brand-500 text-white text-[13.5px] font-semibold cursor-pointer hover:bg-brand-600 disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? 'Saving...' : 'Save dish'}
          </button>
        </div>
      </div>
    </div>
  );
}
