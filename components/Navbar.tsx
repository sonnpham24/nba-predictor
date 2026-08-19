'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale, setLocale } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<{ id: number; username: string; displayName?: string; avatar?: string; isAdmin: boolean } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          // Fetch full user profile
          fetch('/api/me/profile')
            .then((r) => (r.ok ? r.json() : null))
            .then((prof) => {
              if (prof) setUser({ ...data.user, ...prof });
              else setUser(data.user);
            })
            .catch(() => setUser(data.user));
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      toast.success(locale === 'en' ? 'Logged out successfully' : 'Đã đăng xuất thành công');
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Logout error');
    }
  };

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'vi' : 'en';
    setLocale(nextLocale);
    toast.success(nextLocale === 'en' ? 'Switched language to English' : 'Đã chuyển sang Tiếng Việt');
  };

  const navLinks = [
    { href: '/regular-season', label: t.navRegular },
    { href: '/standings', label: t.navStandings },
    { href: '/teams', label: t.navTeams },
    { href: '/stats', label: t.navLeaderboard },
    { href: '/settings', label: t.navSettings },
  ];

  if (user?.isAdmin) {
    navLinks.push({ href: '/admin', label: t.navAdmin });
  }

  return (
    <header className="sticky top-0 z-50 glass-navbar transition-colors duration-300">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href={user ? '/regular-season' : '/'} className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition duration-300">
              <span className="text-2xl">🏀</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider gradient-text-gold uppercase drop-shadow">
                {t.navBrand}
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase -mt-1">
                {t.navSub}
              </span>
            </div>
          </Link>

          {/* Right Action Controls: Language, Theme, User Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-700/60 light:border-slate-300 text-xs font-black text-slate-200 dark:text-slate-200 light:text-slate-800 hover:border-amber-500 transition flex items-center space-x-1.5 shadow-sm"
            >
              <span>🌐</span>
              <span>{locale === 'en' ? 'EN' : 'VI'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-700/60 light:border-slate-300 text-xs font-black text-slate-200 dark:text-slate-200 light:text-slate-800 hover:border-amber-500 transition shadow-sm"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>

            {/* User Account / Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800 light:border-slate-300 p-1.5 pl-3 rounded-2xl shadow-sm">
                <Link href="/settings" className="flex items-center space-x-2 group">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-xl object-cover border border-amber-500/40 group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs group-hover:scale-105 transition">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-extrabold text-white dark:text-white light:text-slate-900 whitespace-nowrap group-hover:text-amber-400 transition">
                        {user.displayName || user.username}
                      </span>
                      {user.isAdmin && <span title="Verified Admin" className="text-[10px]">☑️</span>}
                    </div>
                    {user.isAdmin && (
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest -mt-0.5">PRO ADMIN</span>
                    )}
                  </div>
                </Link>

                <Link
                  href="/settings"
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition text-xs"
                  title="Account Settings"
                >
                  ⚙️
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-extrabold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition whitespace-nowrap"
                >
                  {t.navLogout}
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-5 py-2.5 text-xs font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl shadow-lg hover:scale-105 transition duration-300"
              >
                {t.navLogin}
              </Link>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
            >
              {locale === 'en' ? 'EN' : 'VI'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CENTERED Sub-bar Nav Links (ONLY SHOWN FOR LOGGED-IN USERS) */}
      {user && (
        <div className="border-t border-slate-800/60 light:border-slate-300/80 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-100/90 py-2.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden md:flex items-center justify-center space-x-3">
              <Link
                href="/regular-season"
                className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center space-x-2 ${
                  pathname === '/regular-season' || pathname.startsWith('/regular-season')
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-amber-400'
                }`}
              >
                <span>{t.navRegular}</span>
              </Link>

              <Link
                href="/standings"
                className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center space-x-2 ${
                  pathname === '/standings'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-amber-400'
                }`}
              >
                <span>{t.navStandings}</span>
              </Link>

              <Link
                href="/teams"
                className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center space-x-2 ${
                  pathname === '/teams' || pathname.startsWith('/team/')
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-amber-400'
                }`}
              >
                <span>{t.navTeams}</span>
              </Link>

              {/* Playoff Disabled Tab */}
              <div className="relative group cursor-not-allowed opacity-60 px-4 py-2 rounded-xl text-xs font-extrabold text-slate-400 flex items-center space-x-2 bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-200">
                <span>{t.navPlayoffs}</span>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  {t.navPlayoffsLocked}
                </span>
                <div className="absolute top-11 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl whitespace-nowrap z-50">
                  {t.navPlayoffsLockedTooltip}
                </div>
              </div>

              <Link
                href="/stats"
                className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center space-x-2 ${
                  pathname === '/stats'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-amber-400'
                }`}
              >
                <span>{t.navLeaderboard}</span>
              </Link>

              <Link
                href="/settings"
                className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center space-x-2 ${
                  pathname === '/settings'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-amber-400'
                }`}
              >
                <span>{t.navSettings}</span>
              </Link>

              {user.isAdmin && (
                <Link
                  href="/admin"
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center space-x-2 ${
                    pathname === '/admin'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-105'
                      : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-amber-400'
                  }`}
                >
                  <span>{t.navAdmin}</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && user && (
        <div className="md:hidden py-4 border-t border-slate-800 space-y-2 px-4 bg-slate-950">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-900"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between px-2">
            <span className="text-xs font-bold text-amber-400">👤 {user.username}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 rounded-lg"
            >
              {t.navLogout}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
