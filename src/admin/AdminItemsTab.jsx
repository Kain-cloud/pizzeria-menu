import React, { useMemo, useState } from 'react';

export default function AdminItemsTab({ items, categories, onToggleStatus, onEdit, onDelete }) {
  const [filterCat, setFilterCat] = useState('All');
  const [filterAvail, setFilterAvail] = useState('All');

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

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-6 shrink-0">
        <StatCard title="Total dishes" value={stats.total} sub={`${stats.cats} categories`} />
        <StatCard title="Available now" value={stats.avail} sub={`${stats.hidden} hidden`} />
        <StatCard title="Status" value="Live" sub="Syncing" />
      </div>

      <div className="mb-5 space-y-3">
        <div className="flex gap-2 items-center text-[13px] flex-wrap">
          <span className="text-warm-500 w-[70px] font-medium">Category:</span>
          {['All', ...categories.map(c => c.id)].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${filterCat === cat ? 'bg-warm-800 text-white border-warm-800' : 'bg-white text-warm-600 border-warm-200 hover:bg-warm-50 hover:border-warm-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center text-[13px]">
          <span className="text-warm-500 w-[70px] font-medium">Status:</span>
          {['All', 'Available', 'Hidden'].map(av => (
            <button
              key={av}
              onClick={() => setFilterAvail(av)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${filterAvail === av ? 'bg-warm-800 text-white border-warm-800' : 'bg-white text-warm-600 border-warm-200 hover:bg-warm-50 hover:border-warm-300'}`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-warm-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-[60px_1fr_140px_160px_140px] p-[12px_16px] bg-warm-50 border-b border-warm-200 text-[11px] font-semibold text-warm-500 uppercase tracking-wider">
          <span>Status</span>
          <span>Dish</span>
          <span>Category</span>
          <span>Prices</span>
          <span className="text-right">Actions</span>
        </div>
        
        <div className="divide-y divide-warm-100">
          {filteredItems.map(item => (
            <div key={item.id} className="grid grid-cols-[60px_1fr_140px_160px_140px] p-[12px_16px] items-center text-[13px] hover:bg-warm-50/50 transition-colors">
              <div className="flex items-center">
                <button onClick={() => onToggleStatus(item)} className="cursor-pointer bg-transparent border-none p-1 flex items-center hover:scale-110 transition-transform">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${item.is_available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}></span>
                </button>
              </div>
              
              <div className="pr-2 flex items-center gap-3">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-8 h-8 rounded object-cover border border-warm-200" />
                ) : (
                  <div className="w-8 h-8 rounded bg-warm-100 flex items-center justify-center text-sm">
                    {categories.find(c => c.id === item.category_id)?.emoji || '🍽️'}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-warm-900 truncate">{item.slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                  <div className="text-[11px] text-warm-400 mt-0.5 font-mono">{item.slug}</div>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center text-[11.5px] px-2 py-0.5 rounded bg-warm-100 text-warm-600 capitalize font-medium">
                  {categories.find(c => c.id === item.category_id)?.emoji} {item.category_id}
                </span>
              </div>

              <div className="text-warm-600 truncate pr-2 text-[12px] font-medium">
                {Object.entries(item.prices || {}).map(([k, v]) => `${k==='default'?'':k.toUpperCase()+' '}${v}`).join(' / ')}
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => onEdit(item)}
                  className="text-[12px] px-3 py-1.5 rounded-md bg-white border border-warm-200 text-warm-700 font-medium cursor-pointer hover:bg-warm-50 hover:border-warm-300 transition-all shadow-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(item)}
                  className="text-[12px] px-3 py-1.5 rounded-md bg-white border border-red-200 text-red-600 font-medium cursor-pointer hover:bg-red-50 transition-all shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-sm text-warm-500">No items match the selected filters.</div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-warm-200 p-4 shadow-sm">
      <div className="text-[11px] text-warm-400 uppercase tracking-wider font-semibold">{title}</div>
      <div className="text-2xl font-bold text-warm-800 mt-1">{value}</div>
      <span className="inline-block text-[11px] px-2 py-0.5 rounded mt-2 bg-warm-100 text-warm-600 font-medium">{sub}</span>
    </div>
  );
}
