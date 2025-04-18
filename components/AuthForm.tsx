'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || 'Đã xảy ra lỗi');
    } else {
      setMessage(data.message || 'Thành công!');
      if (data.user?.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-black mb-6">
        {isRegister ? 'Đăng ký' : 'Đăng nhập'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="w-full px-3 py-2 border border-gray-300 rounded text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border border-gray-300 rounded text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5"
        >
          {isRegister ? 'Đăng ký' : 'Đăng nhập'}
        </button>
      </form>

      <p className="text-center text-sm mt-4 text-black">
        {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-blue-600 font-semibold underline hover:text-blue-800 transition"
        >
          {isRegister ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </p>

      {message && (
        <div className="mt-4 text-center text-sm text-red-600 font-medium">
          {message}
        </div>
      )}
    </div>
  );
}

