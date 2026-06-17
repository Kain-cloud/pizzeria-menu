import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from './lib/supabase';
import { saveCache, loadCache, isCacheFresh } from './lib/cache';
import { subscribeToMenu } from './lib/realtime';
import { filterVisibleMenu } from './lib/menuFilter';
import { useMenuStore } from './store/useMenuStore';

import SearchBar from './components/SearchBar';
import CategoryNav from './components/CategoryNav';
import MenuList from './components/MenuList';
import OfflineBanner from './components/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary';
import ChatBot from './components/ChatBot';

import AdminLogin from './admin/AdminLogin';
import AdminPanel from './admin/AdminPanel';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [session, setSession] = useState(null);

  const { t, i18n } = useTranslation();
  const { items, categories, setMenuData, setMenuStatus, setError, query, activeCategory } = useMenuStore();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    
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

  const loadData = async () => {
    setMenuStatus('loading');
    
    const cache = loadCache();
    let hasRenderedCache = false;

    if (cache) {
      const visibleData = filterVisibleMenu(cache.items, cache.categories);
      setMenuData(visibleData);
      hasRenderedCache = true;
      if (!isCacheFresh(cache) && !navigator.onLine) setIsStale(true);
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

        saveCache({ items: itemsRes.data, categories: catsRes.data });
        
        const visibleData = filterVisibleMenu(itemsRes.data, catsRes.data);
        setMenuData(visibleData);
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
  };

  useEffect(() => {
    if (currentPath.startsWith('/admin')) return;
    loadData();

    // Subscribe to real-time changes
    const cleanupRealtime = subscribeToMenu(() => {
      if (navigator.onLine) loadData(); // Reload silently on background change
    });

    return cleanupRealtime;
  }, [currentPath, setMenuData, setMenuStatus, setError]);

  const isSearching = query.trim().length > 0;
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const visibleItems = isSearching
    ? items.filter(item => {
        const lang = i18n.language;
        const name = (item.translations?.[lang]?.name || item.slug.replace(/_/g, ' ')).toLowerCase();
        const desc = (item.translations?.[lang]?.description || '').toLowerCase();
        const searchText = (name + ' ' + desc).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return searchText.includes(normalizedQuery);
      })
    : items.filter(item => item.category_id === activeCategory);

  // Simple Router
  if (currentPath.startsWith('/admin')) {
    return (
      <ErrorBoundary>
        {!session ? <AdminLogin onLogin={setSession} /> : <AdminPanel session={session} />}
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 font-sans flex flex-col max-w-2xl mx-auto relative overflow-hidden sm:border-x border-warm-200 sm:shadow-2xl selection:bg-brand-500/20">
      {isOffline && <OfflineBanner stale={isStale} />}
      
      <header className="bg-white px-5 pt-4 pb-2 border-b border-warm-200 sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-[24px] font-bold text-brand-500 tracking-tight leading-none">{t('app.title', 'Benvenuto')}</h1>
            <p className="text-[13px] font-medium text-warm-400 mt-1.5">{t('app.subtitle', 'Pizzeria Ardi · Durrës')}</p>
          </div>
          <div className="flex items-center gap-1 bg-warm-100 rounded-full p-1 shadow-inner border border-warm-200/50">
            {['en', 'it', 'es'].map(lang => (
              <button
                key={lang}
                onClick={() => i18n.changeLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wider cursor-pointer transition-all border-none ${
                  i18n.language === lang || (lang === 'en' && !i18n.language)
                    ? 'bg-white text-brand-500 shadow-sm'
                    : 'bg-transparent text-warm-500 hover:text-warm-700 hover:bg-warm-200/50'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="pb-3">
          <SearchBar />
        </div>
        <CategoryNav />
      </header>

      <main className="flex-1 p-[20px_20px_24px] flex flex-col gap-3 bg-warm-50 overflow-y-auto">
        <ErrorBoundary>
          <MenuList visibleItems={visibleItems} isSearching={isSearching} />
        </ErrorBoundary>
      </main>

      <footer className="border-t border-warm-200 p-[16px_20px] bg-warm-900 flex flex-col gap-1.5 text-center text-[12.5px] text-warm-400 font-medium z-10">
        <p><strong className="text-white tracking-wide">{t('footer.address')}</strong></p>
        <p className="text-warm-300 tracking-wide">{t('footer.phone')} &nbsp;&middot;&nbsp; {t('footer.hours')}</p>
      </footer>

      <ChatBot />
    </div>
  );
}

export default App;
