import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import ItemForm from './ItemForm';
import CategoryForm from './CategoryForm';
import DeleteConfirm from './DeleteConfirm';

export default function AdminPanel({ session }) {
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'categories'
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editingItem, setEditingItem] = useState(null);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const [editingCat, setEditingCat] = useState(null);
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [deletingCat, setDeletingCat] = useState(null);

  const [filterCat, setFilterCat] = useState('All');
  const [filterAvail, setFilterAvail] = useState('All'); // 'All', 'Available', 'Hidden'

  const [draggedCatId, setDraggedCatId] = useState(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        supabase.from('menu_items').select('*').order('sort_order'),
        supabase.from('categories').select('*').order('sort_order')
      ]);
      
      if (itemsRes.error) throw itemsRes.error;
      if (catsRes.error) throw catsRes.error;
      
      setItems(itemsRes.data);
      setCategories(catsRes.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailable = async (item) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ 
        is_available: !item.is_available,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);
      
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setItems(items.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', deletingItem.id);
      
    if (error) {
      alert(`Error deleting: ${error.message}`);
    } else {
      setItems(items.filter(i => i.id !== deletingItem.id));
      setDeletingItem(null);
    }
  };

  const handleToggleCatAvailable = async (cat) => {
    const newVis = cat.is_visible === false ? true : false;
    setCategories(categories.map(c => c.id === cat.id ? { ...c, is_visible: newVis } : c));
    const { error } = await supabase.from('categories').update({ is_visible: newVis }).eq('id', cat.id);
    if (error) {
      alert(`Error: ${error.message}`);
      loadData();
    }
  };

  const handleDeleteCat = async () => {
    if (!deletingCat) return;
    const { error } = await supabase.from('categories').delete().eq('id', deletingCat.id);
    if (error) {
      alert(`Error deleting: ${error.message}`);
    } else {
      setCategories(categories.filter(c => c.id !== deletingCat.id));
      setDeletingCat(null);
    }
  };

  const itemsCountMap = useMemo(() => {
    const map = {};
    items.forEach(item => {
      map[item.category_id] = (map[item.category_id] || 0) + 1;
    });
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchCat = filterCat === 'All' || item.category_id === filterCat;
      const matchAvail = 
        filterAvail === 'All' ? true :
        filterAvail === 'Available' ? item.is_available :
        !item.is_available;
      return matchCat && matchAvail;
    });
  }, [items, filterCat, filterAvail]);

  const stats = useMemo(() => {
    const total = items.length;
    const avail = items.filter(i => i.is_available).length;
    const cats = categories.length;
    return { total, avail, hidden: total - avail, cats };
  }, [items, categories]);

  const handleDragStart = (e, id) => {
    setDraggedCatId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    if (draggedCatId === targetId || !draggedCatId) return;

    const newCats = [...categories];
    const draggedIndex = newCats.findIndex(c => c.id === draggedCatId);
    const targetIndex = newCats.findIndex(c => c.id === targetId);
    
    const [draggedItem] = newCats.splice(draggedIndex, 1);
    newCats.splice(targetIndex, 0, draggedItem);
    
    setCategories(newCats);
    setDraggedCatId(null);
    
    setIsSavingOrder(true);
    try {
      const updates = newCats.map((cat, i) => supabase.from('categories').update({ sort_order: i }).eq('id', cat.id));
      await Promise.all(updates);
    } catch (err) {
      alert('Error saving order: ' + err.message);
      loadData();
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (loading && items.length === 0) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="flex h-screen bg-[#1a1a2e] font-sans">
      {/* Sidebar */}
      <div className="w-[200px] shrink-0 bg-[#1c1410] p-[24px_16px] flex flex-col gap-2 relative">
        <div className="text-[15px] font-medium text-white px-2 pb-5 border-b-[0.5px] border-white/10 mb-2">
          Benvenuto <span className="text-[#f87171]">Ardi</span>
        </div>
        <div 
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors cursor-pointer ${activeTab === 'items' ? 'bg-[rgba(248,113,113,0.15)] text-[#fca5a5]' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}
        >
          <span className="text-[15px] w-[18px] text-center">🍽️</span> Menu Items
        </div>
        <div 
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors cursor-pointer ${activeTab === 'categories' ? 'bg-[rgba(248,113,113,0.15)] text-[#fca5a5]' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}
        >
          <span className="text-[15px] w-[18px] text-center">🗂️</span> Categories
        </div>
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors text-white/50 hover:bg-white/5 hover:text-white/80 cursor-pointer">
          <span className="text-[15px] w-[18px] text-center">⚙</span> Settings
        </div>
        <div className="mt-auto">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="w-full px-2.5 py-2 rounded-md bg-transparent border-[0.5px] border-white/10 text-white/40 text-[13px] cursor-pointer flex items-center gap-2 hover:border-[#f87171]/40 hover:text-[#fca5a5] transition-colors"
          >
            <span>➔</span> Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#f8f7f4] flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b-[0.5px] border-[#e8d9c0] p-[16px_24px] flex items-center justify-between shrink-0">
          <div>
            <div className="text-[15px] font-medium text-gray-900">{activeTab === 'items' ? 'Menu Items' : 'Categories'}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">{activeTab === 'items' ? 'Manage dishes shown to customers' : 'Manage menu categories and ordering'}</div>
          </div>
          <button 
            onClick={() => activeTab === 'items' ? setIsCreatingItem(true) : setIsCreatingCat(true)}
            className="bg-[#dc2626] hover:bg-[#b91c1c] text-white border-none px-4 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-colors"
          >
            + Add New {activeTab === 'items' ? 'Item' : 'Category'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 m-4 mb-0 rounded flex justify-between shrink-0 text-sm">
            <span>{error}</span>
            <button onClick={loadData} className="underline font-bold">Retry</button>
          </div>
        )}

        <div className="p-[20px_24px] flex-1 overflow-y-auto">
          {activeTab === 'items' ? (
            <>
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-5 shrink-0">
                <div className="bg-white rounded-xl border-[0.5px] border-[#e8d9c0] p-4">
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide">Total dishes</div>
                  <div className="text-[22px] font-medium text-gray-900 mt-1">{stats.total}</div>
                  <span className="inline-block text-[11px] px-2 py-0.5 rounded-full mt-1.5 bg-[#dcfce7] text-[#15803d]">{stats.cats} categories</span>
                </div>
                <div className="bg-white rounded-xl border-[0.5px] border-[#e8d9c0] p-4">
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide">Available now</div>
                  <div className="text-[22px] font-medium text-gray-900 mt-1">{stats.avail}</div>
                  <span className="inline-block text-[11px] px-2 py-0.5 rounded-full mt-1.5 bg-[#fef9c3] text-[#a16207]">{stats.hidden} hidden</span>
                </div>
                <div className="bg-white rounded-xl border-[0.5px] border-[#e8d9c0] p-4">
                  <div className="text-[11px] text-gray-500 uppercase tracking-wide">Last updated</div>
                  <div className="text-[15px] font-medium text-gray-900 mt-[6px]">Today</div>
                  <span className="inline-block text-[11px] px-2 py-0.5 rounded-full mt-1.5 bg-[#dcfce7] text-[#15803d]">Live Sync</span>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-4 space-y-2">
                {/* Category Filter */}
                <div className="flex gap-2 items-center text-[13px] flex-wrap">
                  <span className="text-gray-500 w-[80px]">Category:</span>
                  {['All', ...categories.map(c => c.id)].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCat(cat)}
                      className={`px-3 py-1 rounded-full border-[0.5px] transition-colors ${filterCat === cat ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Availability Filter */}
                <div className="flex gap-2 items-center text-[13px]">
                  <span className="text-gray-500 w-[80px]">Status:</span>
                  {['All', 'Available', 'Hidden'].map(av => (
                    <button
                      key={av}
                      onClick={() => setFilterAvail(av)}
                      className={`px-3 py-1 rounded-full border-[0.5px] transition-colors ${filterAvail === av ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-medium text-gray-900">Filtered dishes ({filteredItems.length})</div>
              </div>

              {/* Table List */}
              <div className="bg-white rounded-xl border-[0.5px] border-[#e8d9c0] overflow-hidden">
                <div className="grid grid-cols-[80px_1fr_140px_160px_120px] p-[10px_16px] bg-[#f8f7f4] border-b-[0.5px] border-[#e8d9c0] text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  <span>Status</span>
                  <span>Dish</span>
                  <span>Category</span>
                  <span>Prices</span>
                  <span className="text-right">Actions</span>
                </div>
                
                <div className="divide-y divide-[#e8d9c0]">
                  {filteredItems.map(item => (
                    <div key={item.id} className="grid grid-cols-[80px_1fr_140px_160px_120px] p-[12px_16px] items-center text-[13px] hover:bg-[#fafaf9] transition-colors">
                      {/* Status Toggle */}
                      <div className="flex items-center">
                        <button onClick={() => handleToggleAvailable(item)} className="cursor-pointer bg-transparent border-none p-0 flex items-center">
                          <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${item.is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </button>
                      </div>
                      
                      {/* Dish Name & Slug */}
                      <div className="pr-2">
                        <div className="font-medium text-gray-900 truncate">{item.slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5 font-mono">{item.slug}</div>
                      </div>

                      {/* Category Pill */}
                      <div>
                        <span className="inline-flex items-center text-[12px] px-2.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700 capitalize">
                          {categories.find(c => c.id === item.category_id)?.emoji} {item.category_id}
                        </span>
                      </div>

                      {/* Prices */}
                      <div className="text-gray-700 truncate pr-2 text-[12px]">
                        {Object.entries(item.prices || {}).map(([k, v]) => `${k==='default'?'':k.toUpperCase()+' '}${v}`).join(' / ')}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 justify-end">
                        <button 
                          onClick={() => setEditingItem(item)}
                          className="text-[12px] px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border-none cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeletingItem(item)}
                          className="text-[12px] px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border-none cursor-pointer hover:bg-rose-100 transition-colors"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-sm text-gray-500">No items match the selected filters.</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Categories Tab */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] text-gray-500">Drag and drop to reorder categories.</div>
                {isSavingOrder && <span className="text-[12px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md transition-opacity">Saving order...</span>}
              </div>

              <div className="flex flex-col gap-3">
                {categories.map((cat, idx) => {
                  const itemCount = itemsCountMap[cat.id] || 0;
                  const isHidden = cat.is_visible === false;
                  return (
                    <div 
                      key={cat.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cat.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, cat.id)}
                      className={`flex items-center bg-white rounded-xl border-[0.5px] p-4 transition-all ${draggedCatId === cat.id ? 'opacity-50 scale-[0.99]' : 'opacity-100'} ${isHidden ? 'opacity-60 border-dashed border-gray-300' : 'border-[#e8d9c0] shadow-sm hover:shadow-md'}`}
                    >
                      {/* Drag Handle */}
                      <div className="cursor-grab hover:text-gray-900 text-gray-400 text-xl px-2 -ml-2 select-none active:cursor-grabbing">
                        ⠿
                      </div>
                      
                      <div className="flex items-center justify-center w-10 h-10 bg-[#f8f7f4] rounded-full text-xl mr-4 shrink-0">
                        {cat.emoji || '🍕'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-medium text-gray-900 capitalize">{cat.id.replace(/_/g, ' ')}</h3>
                          {isHidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium tracking-wide">HIDDEN</span>}
                        </div>
                        <div className="text-[12px] text-gray-500 mt-0.5 flex gap-3">
                          <span>Order: {idx + 1}</span>
                          <span className="text-gray-300">|</span>
                          <span className="font-medium">{itemCount} items</span>
                        </div>
                      </div>

                      {/* Toggles and Actions */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleToggleCatAvailable(cat)}>
                          <span className="text-[12px] text-gray-500 font-medium">Visible</span>
                          <div className={`w-[36px] h-[20px] rounded-full relative transition-colors ${!isHidden ? 'bg-green-500' : 'bg-gray-200'}`}>
                            <div className={`absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white transition-all shadow-sm ${!isHidden ? 'left-[18px]' : 'left-[2px]'}`}></div>
                          </div>
                        </div>
                        
                        <div className="h-6 w-[1px] bg-gray-200"></div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingCat(cat)}
                            className="text-[12px] px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 border-none cursor-pointer hover:bg-blue-100 transition-colors font-medium"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              if (itemCount > 0) {
                                alert(`Cannot delete — move or delete the ${itemCount} items in this category first.`);
                              } else {
                                setDeletingCat(cat);
                              }
                            }}
                            className={`text-[12px] px-3 py-1.5 rounded-md border-none font-medium transition-colors ${itemCount > 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-rose-50 text-rose-700 cursor-pointer hover:bg-rose-100'}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <div className="text-center p-8 text-gray-500">No categories found.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {(isCreatingItem || editingItem) && (
        <ItemForm 
          item={editingItem}
          categories={categories}
          onClose={() => { setIsCreatingItem(false); setEditingItem(null); }}
          onSave={() => {
            setIsCreatingItem(false);
            setEditingItem(null);
            loadData();
          }}
        />
      )}

      {deletingItem && (
        <DeleteConfirm 
          count={1}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeletingItem(null)}
        />
      )}

      {(isCreatingCat || editingCat) && (
        <CategoryForm 
          category={editingCat}
          onClose={() => { setIsCreatingCat(false); setEditingCat(null); }}
          onSave={() => {
            setIsCreatingCat(false);
            setEditingCat(null);
            loadData();
          }}
        />
      )}

      {deletingCat && (
        <DeleteConfirm 
          count={1}
          onConfirm={handleDeleteCat}
          onCancel={() => setDeletingCat(null)}
        />
      )}
    </div>
  );
}
