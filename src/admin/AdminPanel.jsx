import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import AdminSidebar from './AdminSidebar';
import AdminItemsTab from './AdminItemsTab';
import AdminCategoriesTab from './AdminCategoriesTab';
import AnalyticsDashboard from './AnalyticsDashboard';
import ItemForm from './ItemForm';
import CategoryForm from './CategoryForm';
import DeleteConfirm from './DeleteConfirm';

export default function AdminPanel({ session }) {
  const [activeTab, setActiveTab] = useState('items'); // 'items', 'categories', 'analytics'
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

  useEffect(() => { loadData(); }, []);

  const handleToggleItemAvailable = async (item) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !item.is_available, updated_at: new Date().toISOString() })
      .eq('id', item.id);
    if (!error) {
      setItems(items.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', deletingItem.id);
    if (!error) {
      setItems(items.filter(i => i.id !== deletingItem.id));
      setDeletingItem(null);
    }
  };

  const handleToggleCatAvailable = async (cat) => {
    const newVis = cat.is_visible === false ? true : false;
    setCategories(categories.map(c => c.id === cat.id ? { ...c, is_visible: newVis } : c));
    await supabase.from('categories').update({ is_visible: newVis }).eq('id', cat.id);
  };

  const handleDeleteCat = async () => {
    if (!deletingCat) return;
    const { error } = await supabase.from('categories').delete().eq('id', deletingCat.id);
    if (!error) {
      setCategories(categories.filter(c => c.id !== deletingCat.id));
      setDeletingCat(null);
    }
  };

  const itemsCountMap = useMemo(() => {
    const map = {};
    items.forEach(item => { map[item.category_id] = (map[item.category_id] || 0) + 1; });
    return map;
  }, [items]);

  const handleReorderCategory = async (draggedId, targetId) => {
    const newCats = [...categories];
    const draggedIndex = newCats.findIndex(c => c.id === draggedId);
    const targetIndex = newCats.findIndex(c => c.id === targetId);
    
    const [draggedItem] = newCats.splice(draggedIndex, 1);
    newCats.splice(targetIndex, 0, draggedItem);
    
    setCategories(newCats);
    setIsSavingOrder(true);
    try {
      await Promise.all(newCats.map((cat, i) => 
        supabase.from('categories').update({ sort_order: i }).eq('id', cat.id)
      ));
    } finally {
      setIsSavingOrder(false);
    }
  };

  if (loading && items.length === 0) return <div className="p-8 text-warm-800">Loading admin panel...</div>;

  return (
    <div className="flex h-screen bg-warm-50 font-sans">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-warm-200 p-[16px_24px] flex items-center justify-between shrink-0 shadow-sm z-10">
          <div>
            <div className="text-[16px] font-bold text-warm-900 capitalize">{activeTab.replace('-', ' ')}</div>
            <div className="text-[12px] text-warm-500 font-medium mt-0.5">
              {activeTab === 'items' && 'Manage dishes shown to customers'}
              {activeTab === 'categories' && 'Manage menu categories and ordering'}
              {activeTab === 'analytics' && 'Track dish views and performance'}
            </div>
          </div>
          {activeTab !== 'analytics' && (
            <div className="flex items-center gap-3">
              {isSavingOrder && <span className="text-[12px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md animate-pulse">Saving changes...</span>}
              <button 
                onClick={() => activeTab === 'items' ? setIsCreatingItem(true) : setIsCreatingCat(true)}
                className="bg-brand-500 hover:bg-brand-600 text-white border-none px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-colors shadow-sm"
              >
                + Add New {activeTab === 'items' ? 'Item' : 'Category'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 m-4 mb-0 rounded-lg flex justify-between shrink-0 text-sm font-medium">
            <span>{error}</span>
            <button onClick={loadData} className="underline font-bold bg-transparent border-none text-red-700 cursor-pointer">Retry</button>
          </div>
        )}

        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'items' && (
            <AdminItemsTab 
              items={items} categories={categories} 
              onToggleStatus={handleToggleItemAvailable} onEdit={setEditingItem} onDelete={setDeletingItem} 
            />
          )}
          {activeTab === 'categories' && (
            <AdminCategoriesTab 
              categories={categories} itemsCountMap={itemsCountMap} 
              onToggleStatus={handleToggleCatAvailable} onEdit={setEditingCat} onDelete={setDeletingCat} onReorder={handleReorderCategory}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsDashboard categories={categories} />
          )}
        </div>
      </div>

      {(isCreatingItem || editingItem) && (
        <ItemForm 
          item={editingItem} categories={categories} 
          onClose={() => { setIsCreatingItem(false); setEditingItem(null); }}
          onSave={() => { setIsCreatingItem(false); setEditingItem(null); loadData(); }}
        />
      )}

      {deletingItem && (
        <DeleteConfirm 
          count={1} onConfirm={handleDeleteItem} onCancel={() => setDeletingItem(null)}
        />
      )}

      {(isCreatingCat || editingCat) && (
        <CategoryForm 
          category={editingCat} 
          onClose={() => { setIsCreatingCat(false); setEditingCat(null); }}
          onSave={() => { setIsCreatingCat(false); setEditingCat(null); loadData(); }}
        />
      )}

      {deletingCat && (
        <DeleteConfirm 
          count={1} onConfirm={handleDeleteCat} onCancel={() => setDeletingCat(null)}
        />
      )}
    </div>
  );
}
