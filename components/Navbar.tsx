'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    document.cookie = 'token=; Max-Age=0; path=/;';
    setUser(null);
    router.push('/auth');
  };

  const navLinks = [
    { href: '/regular-season', label: '🏀 Regular Season', icon: '🏀' },
    { href: '/predict', label: '🏆 Playoffs', icon: '🏆' },
    { href: '/stats', label: '📊 Bảng Xếp Hạng', icon: '📊' },
  ];

  if (user?.isAdmin) {
    navLinks.push({ href: '/admin', label: '⚙️ Admin Panel', icon: '⚙️' });
  }

  return (
    <header className="sticky top-0 z-50 glass-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/regular-season" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 group-hover:shadow-amber-500/40 transition duration-300">
              <span className="text-2xl">🏀</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider gradient-text-gold uppercase drop-shadow">
                NBA PREDICTOR
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase -mt-1">
                2025 SEASON HUB
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold tracking-wide transition-all duration-300 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 p-1.5 pl-4 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{user.username}</span>
                    {user.isAdmin && (
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">PRO ADMIN</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-extrabold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-6 py-2.5 text-xs font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition duration-300"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/80 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-bold transition ${
                    isActive ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user ? (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between px-2">
                <span className="text-xs font-bold text-amber-400">👤 {user.username} {user.isAdmin && '(Admin)'}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-bold text-red-400 bg-red-500/10 rounded-lg"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 bg-amber-500 text-slate-950 font-black rounded-xl text-sm mt-2"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
