import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from './lib/supabase';
import { saveCache, loadCache, isCacheFresh } from './lib/cache';
import { normalize } from './lib/normalize';
import { useMenuStore } from './store/useMenuStore';
import SearchBar from './components/SearchBar';
import CategoryNav from './components/CategoryNav';
import MenuList from './components/MenuList';
import OfflineBanner from './components/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLogin from './admin/AdminLogin';
import AdminPanel from './admin/AdminPanel';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [session, setSession] = useState(null);

  const { t, i18n } = useTranslation();
  const { items, categories, menuStatus, setMenuData, setMenuStatus, setError, query, activeCategory } = useMenuStore();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    if (currentPath.startsWith('/admin')) return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentPath]);

  useEffect(() => {
    if (currentPath.startsWith('/admin')) return;

    async function loadData() {
      setMenuStatus('loading');
      
      const cache = loadCache();
      let hasRenderedCache = false;

      if (cache) {
        const visibleCats = cache.categories.filter(c => c.is_visible !== false);
        const visibleCatIds = new Set(visibleCats.map(c => c.id));
        const activeItems = cache.items.filter(item => visibleCatIds.has(item.category_id));

        setMenuData({ items: activeItems, categories: visibleCats });
        hasRenderedCache = true;
        if (!isCacheFresh(cache) && !navigator.onLine) {
          setIsStale(true);
        }
      } else if (!navigator.onLine) {
        setMenuStatus('error');
        setError(new Error('offline'));
        return;
      }

      if (navigator.onLine) {
        try {
          const [itemsRes, catsRes] = await Promise.all([
            supabase.from('menu_items').select('*'),
            supabase.from('categories').select('*')
          ]);

          if (itemsRes.error) throw itemsRes.error;
          if (catsRes.error) throw catsRes.error;

          const visibleCats = catsRes.data.filter(c => c.is_visible !== false);
          const visibleCatIds = new Set(visibleCats.map(c => c.id));
          const activeItems = itemsRes.data.filter(item => visibleCatIds.has(item.category_id));

          const newData = { items: activeItems, categories: visibleCats };
          saveCache(newData);
          setMenuData(newData);
          setIsStale(false);
        } catch (err) {
          console.error(err);
          if (!hasRenderedCache) {
            setMenuStatus('error');
            setError(err);
          } else {
            setIsStale(true);
          }
        }
      }
    }

    loadData();
  }, [currentPath, setMenuData, setMenuStatus, setError]);

  const searchIndex = useMemo(() => {
    return items.map(item => ({
      ...item,
      searchText: normalize(
        t(`menu.${item.slug}.name`, '') + ' ' +
        t(`menu.${item.slug}.description`, '')
      ),
    }));
  }, [items, i18n.language]);

  const isSearching = query.trim().length > 0;

  const visibleItems = isSearching
    ? searchIndex.filter(item => item.searchText.includes(normalize(query)))
    : searchIndex.filter(item => item.category_id === activeCategory && item.is_available);

  // Simple Router
  if (currentPath.startsWith('/admin')) {
    return (
      <ErrorBoundary>
        {!session ? <AdminLogin onLogin={setSession} /> : <AdminPanel session={session} />}
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6ec] font-sans flex flex-col max-w-2xl mx-auto shadow-xl relative overflow-hidden border-[0.5px] border-[#e8d9c0] sm:my-4 sm:rounded-xl sm:min-h-[calc(100vh-2rem)]">
      {isOffline && <OfflineBanner stale={isStale} />}
      
      <header className="bg-white px-5 pt-3.5 border-b-[0.5px] border-[#e8d9c0] sticky top-0 z-10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-[22px] font-medium text-[#c62828] tracking-tight">{t('app.title', 'Benvenuto')}</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">{t('app.subtitle', 'Pizzeria Ardi · Durrës')}</p>
          </div>
          <div className="flex items-center gap-1 bg-[#f8f7f4] rounded-full p-1">
            {['en', 'it', 'es'].map(lang => (
              <button
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  i18n.language === lang || (lang === 'en' && !i18n.language)
                    ? 'bg-white text-[#c62828] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                    : 'bg-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="pb-2.5">
          <SearchBar />
        </div>
        <CategoryNav />
      </header>

      <main className="flex-1 p-[16px_20px_20px] flex flex-col gap-2.5 bg-[#fdf6ec] overflow-y-auto">
        <ErrorBoundary>
          <MenuList visibleItems={visibleItems} isSearching={isSearching} />
        </ErrorBoundary>
      </main>

      <footer className="border-t-[0.5px] border-[#e8d9c0] p-[14px_20px] bg-[#1a1008] flex flex-col gap-1 text-center text-[12px] text-white/50">
        <p><strong className="text-white/80 font-medium">{t('footer.address', 'Lagja 4, Rr. "EGNATIA", Durrës')}</strong></p>
        <p>067 26 06 767 &nbsp;&middot;&nbsp; Open daily 10:00–24:00</p>
      </footer>
    </div>
  );
}

export default App;
