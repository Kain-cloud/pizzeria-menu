import React from 'react';
import { supabase } from '../lib/supabase';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-[200px] shrink-0 bg-warm-900 p-6 flex flex-col gap-2 relative">
      <div className="text-[15px] font-medium text-white px-2 pb-5 border-b border-warm-800 mb-2">
        Benvenuto <span className="text-brand-500">Ardi</span>
      </div>
      
      <SidebarItem 
        icon="🍽️" 
        label="Menu Items" 
        isActive={activeTab === 'items'} 
        onClick={() => setActiveTab('items')} 
      />
      <SidebarItem 
        icon="🗂️" 
        label="Categories" 
        isActive={activeTab === 'categories'} 
        onClick={() => setActiveTab('categories')} 
      />
      <SidebarItem 
        icon="📊" 
        label="Analytics" 
        isActive={activeTab === 'analytics'} 
        onClick={() => setActiveTab('analytics')} 
      />
      
      <div className="mt-auto pt-4 border-t border-warm-800">
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full px-2.5 py-2 rounded-lg bg-transparent border border-warm-800 text-warm-400 text-[13px] cursor-pointer flex items-center gap-2 hover:border-brand-500 hover:text-brand-400 transition-all"
        >
          <span>➔</span> Sign out
        </button>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, isActive, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-all cursor-pointer ${
        isActive 
          ? 'bg-brand-500/15 text-brand-400 font-medium' 
          : 'text-warm-400 hover:bg-warm-800 hover:text-warm-200'
      }`}
    >
      <span className="text-[16px] w-5 text-center grayscale opacity-80">{icon}</span> 
      {label}
    </div>
  );
}
