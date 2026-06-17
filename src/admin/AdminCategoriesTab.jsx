import React from 'react';

export default function AdminCategoriesTab({ 
  categories, 
  itemsCountMap, 
  onToggleStatus, 
  onEdit, 
  onDelete, 
  onReorder 
}) {
  const [draggedId, setDraggedId] = React.useState(null);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] text-warm-500">Drag and drop to reorder categories.</div>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map((cat, idx) => {
          const itemCount = itemsCountMap[cat.id] || 0;
          const isHidden = cat.is_visible === false;
          
          return (
            <div 
              key={cat.id}
              draggable
              onDragStart={(e) => {
                setDraggedId(cat.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId && draggedId !== cat.id) {
                  onReorder(draggedId, cat.id);
                }
                setDraggedId(null);
              }}
              className={`flex items-center bg-white rounded-xl border p-4 transition-all ${
                draggedId === cat.id ? 'opacity-50 scale-[0.99] border-brand-300 shadow-md' : 
                isHidden ? 'opacity-70 border-warm-200 border-dashed bg-warm-50/50' : 
                'border-warm-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="cursor-grab text-warm-400 text-xl px-2 -ml-2 select-none active:cursor-grabbing hover:text-warm-600 transition-colors">
                ⠿
              </div>
              
              <div className="flex items-center justify-center w-11 h-11 bg-warm-100 rounded-full text-2xl mr-4 shrink-0 shadow-inner">
                {cat.emoji || '🍕'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-warm-900 capitalize">{cat.id.replace(/_/g, ' ')}</h3>
                  {isHidden && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-bold tracking-wider">HIDDEN</span>}
                </div>
                <div className="text-[12px] text-warm-500 mt-1 flex gap-3 font-medium">
                  <span>Order: {idx + 1}</span>
                  <span className="text-warm-300">|</span>
                  <span>{itemCount} items</span>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div 
                  className="flex items-center gap-2.5 cursor-pointer group" 
                  onClick={() => onToggleStatus(cat)}
                >
                  <span className="text-[12px] text-warm-500 font-semibold uppercase tracking-wide group-hover:text-warm-700 transition-colors">
                    Visible
                  </span>
                  <div className={`w-9 h-5 rounded-full relative transition-colors toggle-track ${!isHidden ? 'bg-emerald-500' : 'bg-warm-300'}`}>
                    <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm toggle-thumb ${!isHidden ? 'left-[18px]' : 'left-[2px]'}`}></div>
                  </div>
                </div>
                
                <div className="h-6 w-[1px] bg-warm-200"></div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(cat)}
                    className="text-[12px] px-3 py-1.5 rounded-md bg-white border border-warm-200 text-warm-700 font-medium cursor-pointer hover:bg-warm-50 hover:border-warm-300 transition-all shadow-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      if (itemCount > 0) {
                        alert(`Cannot delete — move or delete the ${itemCount} items in this category first.`);
                      } else {
                        onDelete(cat);
                      }
                    }}
                    className={`text-[12px] px-3 py-1.5 rounded-md border font-medium transition-all shadow-sm ${
                      itemCount > 0 
                        ? 'bg-warm-50 border-warm-200 text-warm-400 cursor-not-allowed shadow-none' 
                        : 'bg-white border-red-200 text-red-600 cursor-pointer hover:bg-red-50'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="text-center p-8 text-warm-500 text-sm">No categories found.</div>
        )}
      </div>
    </>
  );
}
