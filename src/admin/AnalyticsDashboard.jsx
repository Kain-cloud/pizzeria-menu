import React, { useState, useEffect } from 'react';
import { fetchAnalytics } from '../lib/analytics';

export default function AnalyticsDashboard({ categories }) {
  const [data, setData] = useState({ views: [], totalViews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await fetchAnalytics(7);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-warm-500">Loading analytics...</div>;

  // Aggregate by Category
  const catCounts = {};
  data.views.forEach(v => {
    catCounts[v.category_id] = (catCounts[v.category_id] || 0) + 1;
  });

  const catData = Object.entries(catCounts).map(([id, count]) => ({
    id,
    count,
    name: categories.find(c => c.id === id)?.emoji + ' ' + id || id,
    percentage: Math.round((count / Math.max(1, data.totalViews)) * 100)
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-warm-200 p-5 shadow-sm">
          <div className="text-[11px] text-warm-400 uppercase tracking-wider font-semibold">Total Views (7d)</div>
          <div className="text-3xl font-bold text-warm-800 mt-2">{data.totalViews}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-warm-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-warm-800 mb-4">Views by Category</h3>
        {catData.length === 0 ? (
          <div className="text-sm text-warm-400">No data available yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {catData.map(c => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-32 text-sm text-warm-600 truncate capitalize">{c.name}</div>
                <div className="flex-1 h-3 bg-warm-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 bar-animate rounded-full" 
                    style={{ maxWidth: `${c.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right text-xs text-warm-500 font-medium">{c.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
