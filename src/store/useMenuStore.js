import { create } from 'zustand';

export const useMenuStore = create((set, get) => ({
  activeCategory: null,
  lastBrowseCategory: null,
  query: '',
  menuStatus: 'idle',
  items: [],
  categories: [],
  error: null,

  setCategory: (id) => set({
    activeCategory: id,
    lastBrowseCategory: id,
  }),

  setQuery: (str) => set({ query: str }),

  clearSearch: () => set((state) => ({
    query: '',
    activeCategory: state.lastBrowseCategory,
  })),

  setMenuData: ({ items, categories }) => {
    const current = get();
    const sortedCats = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    const firstCat = sortedCats.length > 0 ? sortedCats[0].id : null;

    // Preserve active category if it still exists in the new data
    const catIds = new Set(sortedCats.map(c => c.id));
    const keepActive = current.activeCategory && catIds.has(current.activeCategory);

    set({
      items,
      categories: sortedCats,
      menuStatus: 'ready',
      activeCategory: keepActive ? current.activeCategory : firstCat,
      lastBrowseCategory: keepActive ? current.lastBrowseCategory : firstCat,
    });
  },

  setMenuStatus: (status) => set({ menuStatus: status }),
  setError: (error) => set({ error }),
}));
