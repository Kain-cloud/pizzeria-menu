import { supabase } from './supabase';

let viewBuffer = [];
let flushTimer = null;
const FLUSH_INTERVAL = 5000;

export function trackView(itemId, categoryId) {
  viewBuffer.push({
    item_id: itemId,
    category_id: categoryId,
    viewed_at: new Date().toISOString(),
  });

  if (!flushTimer) {
    flushTimer = setTimeout(flushViews, FLUSH_INTERVAL);
  }
}

async function flushViews() {
  if (viewBuffer.length === 0) return;
  const batch = [...viewBuffer];
  viewBuffer = [];
  flushTimer = null;

  try {
    await supabase.from('menu_views').insert(batch);
  } catch (err) {
    console.warn('Analytics flush failed:', err);
  }
}

// Flush remaining views on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushViews();
  });
}

/**
 * Fetch analytics data for the admin dashboard.
 * @param {number} days - Number of days to look back
 */
export async function fetchAnalytics(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: views, error } = await supabase
    .from('menu_views')
    .select('item_id, category_id, viewed_at')
    .gte('viewed_at', since)
    .order('viewed_at', { ascending: true });

  if (error) throw error;

  return {
    views: views || [],
    totalViews: views?.length || 0,
  };
}
