import { create } from 'zustand';

export const useMenuStore = create((set) => ({
  activeCategory: null,
  lastBrowseCategory: null,
  query: '',
  menuStatus: 'idle',
  items: [],
  categories: [],
  error: null,

  setCategory: (id) => set({
    activeCategory: id,
    lastBrowseCategory: id
  }),

  setQuery: (str) => set({
    query: str
  }),

  clearSearch: () => set((state) => ({
    query: '',
    activeCategory: state.lastBrowseCategory
  })),

  setMenuData: ({ items, categories }) => set({
    items,
    categories,
    menuStatus: 'ready',
    activeCategory: categories.length > 0 ? categories[0].id : null,
    lastBrowseCategory: categories.length > 0 ? categories[0].id : null
  }),

  setMenuStatus: (status) => set({ menuStatus: status }),

  setError: (error) => set({ error })
}));
