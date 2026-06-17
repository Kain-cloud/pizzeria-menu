import { supabase } from './supabase';

/**
 * Subscribe to real-time changes on menu_items and categories.
 * Calls onUpdate() whenever any row changes.
 * Returns a cleanup function.
 */
export function subscribeToMenu(onUpdate) {
  const channel = supabase
    .channel('menu-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'menu_items' },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories' },
      () => onUpdate()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
