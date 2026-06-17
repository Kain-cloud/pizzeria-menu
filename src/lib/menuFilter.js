/**
 * Filter items and categories to only include visible ones.
 */
export function filterVisibleMenu(items, categories) {
  const visibleCats = categories.filter(c => c.is_visible !== false);
  const visibleCatIds = new Set(visibleCats.map(c => c.id));
  const activeItems = items.filter(item => visibleCatIds.has(item.category_id));
  return { items: activeItems, categories: visibleCats };
}

/**
 * Get a translated field from a menu item.
 * Falls back to slug-based display name.
 */
export function getItemText(item, lang, field) {
  return item.translations?.[lang]?.[field]
    || item.translations?.en?.[field]
    || (field === 'name' ? item.slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');
}
