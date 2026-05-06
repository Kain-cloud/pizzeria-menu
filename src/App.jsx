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
        setMenuData({ items: cache.items, categories: cache.categories });
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

          const newData = { items: itemsRes.data, categories: catsRes.data };
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
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-2xl mx-auto shadow-xl relative">
      {isOffline && <OfflineBanner stale={isStale} />}
      
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="flex justify-between items-center p-4">
          <div>
            <h1 className="text-2xl font-bold text-red-600">{t('app.title')}</h1>
            <p className="text-sm text-gray-500">{t('app.subtitle')}</p>
          </div>
          <select 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="border-gray-300 rounded text-sm p-1"
          >
            <option value="en">English</option>
            <option value="it">Italiano</option>
            <option value="es">Español</option>
          </select>
        </div>
        <SearchBar />
        <CategoryNav />
      </header>

      <main className="flex-1 p-4 bg-gray-50 overflow-y-auto">
        <ErrorBoundary>
          <MenuList visibleItems={visibleItems} isSearching={isSearching} />
        </ErrorBoundary>
      </main>

      <footer className="bg-white border-t p-6 text-center text-sm text-gray-500">
        <p className="font-bold mb-1">{t('footer.address')}</p>
        <p className="mb-1">{t('footer.phone')}</p>
        <p>{t('footer.hours')}</p>
      </footer>
    </div>
  );
}

export default App;
