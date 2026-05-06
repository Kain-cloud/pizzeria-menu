import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ItemForm from './ItemForm';
import DeleteConfirm from './DeleteConfirm';

export default function AdminPanel({ session }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

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

  const handleDelete = async () => {
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

  if (loading && items.length === 0) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Admin</h1>
        <div className="space-x-4">
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-green-600 text-white px-4 py-2 rounded font-medium"
          >
            Add New Item
          </button>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="underline font-bold">Retry</button>
        </div>
      )}

      {(isCreating || editingItem) && (
        <ItemForm 
          item={editingItem}
          categories={categories}
          onClose={() => { setIsCreating(false); setEditingItem(null); }}
          onSave={() => {
            setIsCreating(false);
            setEditingItem(null);
            loadData();
          }}
        />
      )}

      {deletingItem && (
        <DeleteConfirm 
          count={1}
          onConfirm={handleDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug / Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prices</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map(item => (
                <tr key={item.id} className={!item.is_available ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleToggleAvailable(item)}
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.slug}</div>
                    <div className="text-sm text-gray-500">{item.category_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {Object.entries(item.prices || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setEditingItem(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setDeletingItem(item)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
