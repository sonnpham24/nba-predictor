'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    // Clear cookie by calling logout or redirect
    document.cookie = 'token=; Max-Age=0; path=/;';
    setUser(null);
    router.push('/auth');
  };

  const navLinks = [
    { href: '/regular-season', label: '🏀 Regular Season' },
    { href: '/predict', label: '🏆 Playoffs Predictor' },
    { href: '/stats', label: '📊 Bảng Xếp Hạng' },
  ];

  if (user?.isAdmin) {
    navLinks.push({ href: '/admin', label: '⚙️ Admin Panel' });
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link href="/regular-season" className="flex items-center space-x-2">
              <span className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                NBA Predictor
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs sm:text-sm font-medium text-slate-300">
                  👤 <strong className="text-amber-400">{user.username}</strong>
                  {user.isAdmin && <span className="ml-1 text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Admin</span>}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 text-xs sm:text-sm font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu nav */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-1 border-t border-slate-800">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 whitespace-nowrap rounded-md text-xs font-semibold ${
                  isActive ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
