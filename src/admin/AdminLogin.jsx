import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onLogin(data.session);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4 font-sans">
      <div className="max-w-[400px] w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-warm-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-warm-900 tracking-tight">{t('admin.login', 'Admin Login')}</h2>
          <p className="text-warm-500 text-sm mt-1">Pizzeria Ardi Management</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-[13px] font-medium border border-red-100 flex items-center gap-2">
            <span className="text-base">⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-600 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-warm-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-warm-900 text-[14px]"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-warm-600 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-warm-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-warm-900 text-[14px]"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 transition-all shadow-sm mt-2 border-none cursor-pointer"
          >
            {loading ? 'Authenticating...' : t('admin.login', 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
}
