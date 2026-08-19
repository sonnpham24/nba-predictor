'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Thao tác thất bại');
      }

      if (isLogin) {
        toast.success('🎉 Đăng nhập thành công!');
        router.push('/regular-season');
      } else {
        toast.success('✅ Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-3xl">🏀</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black gradient-text-gold tracking-tight">
            {isLogin ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {isLogin ? 'Chào mừng bạn trở lại với NBA Predictor Hub' : 'Tham gia cộng đồng dự đoán kết quả NBA 2025'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-8 relative z-10">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`py-2.5 rounded-xl text-xs font-extrabold tracking-wider transition duration-300 ${
              isLogin ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            ĐĂNG NHẬP
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`py-2.5 rounded-xl text-xs font-extrabold tracking-wider transition duration-300 ${
              !isLogin ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            ĐĂNG KÝ
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Tên tài khoản (Username)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                👤
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username của bạn..."
                className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Mật khẩu (Password)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                🔒
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition duration-300 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-950 border-t-transparent"></div>
            ) : (
              <span>{isLogin ? 'VÀO HỆ THỐNG →' : 'XÁC NHẬN ĐĂNG KÝ →'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
