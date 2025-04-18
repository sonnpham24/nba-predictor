'use client';

import { requireLoginClient } from '@/lib/requireLoginClient';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  requireLoginClient();
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const [resScore, resLeaderboard] = await Promise.all([
        fetch('/api/me/score'),
        fetch('/api/leaderboard'),
      ]);
      const scoreData = await resScore.json();
      const leaderboardData = await resLeaderboard.json();
  
      setScore(scoreData.score);
      setLeaderboard(leaderboardData);
    };
  
    fetchAll();
  
    const interval = setInterval(fetchAll, 30000); // Cập nhật mỗi 30 giây
    return () => clearInterval(interval);
  }, []);  

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/auth'); // Nếu có lỗi, chuyển về login
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    // Xóa cookie bằng cách set max-age=0
    document.cookie = 'token=; path=/; max-age=0';
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-animate px-4 py-6 md:py-10 text-white">
      <div className="starry-background" />
  
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Dashboard</h1>
          {user ? (
            <>
              <p className="mb-4 text-base">
                Xin chào, <strong>{user.username}</strong>! 👋
              </p>
              <p>Chào mừng đến với Trang Dự Đoán NBA Playoff 🏀</p>
              <p className="mt-2">🎯 Bắt đầu dự đoán hoặc xem lại kết quả của bạn.</p>
  
              {score !== null && (
                <div className="text-lg md:text-xl font-semibold text-green-400 text-center mt-4">
                  Tổng điểm của bạn: {score} điểm
                </div>
              )}
  
              <div className="space-y-3 mt-6">
                <Link href="/predict">
                  <button className="w-full px-4 py-2 font-semibold rounded-lg text-white bg-blue-600
                    shadow-[0_0_15px_rgba(0,102,255,0.6)]
                    transition-all duration-200
                    hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(0,102,255,0.9)]
                    hover:bg-blue-700">
                    Tạo dự đoán mới
                  </button>
                </Link>
                <br></br>
                <br></br>
  
                <Link href="/my-predictions">
                  <button className="w-full px-4 py-2 font-semibold rounded-lg text-white
                    bg-green-600 shadow-[0_0_15px_rgba(0,255,0,0.5)]
                    transition-all duration-200
                    hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(0,255,0,0.8)]
                    hover:bg-green-700">
                    📋 Xem lại dự đoán
                  </button>
                </Link>
                <br></br>
                <br></br>
  
                <Link href="/all-predictions">
                  <button className="w-full px-4 py-2 font-semibold rounded-lg text-white
                    bg-purple-600 shadow-[0_0_15px_rgba(128,0,255,0.5)]
                    transition-all duration-200
                    hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(128,0,255,0.8)]
                    hover:bg-purple-700">
                    🔎 Xem dự đoán của mọi người
                  </button>
                </Link>
                <br></br>
                <br></br>
  
                <Link href="/stats">
                  <button className="w-full px-4 py-2 font-semibold rounded-lg text-white
                    bg-orange-500 shadow-[0_0_15px_rgba(255,165,0,0.5)]
                    transition-all duration-200
                    hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,165,0,0.8)]
                    hover:bg-orange-600">
                    📊 Thống kê toàn giải đấu
                  </button>
                </Link>
                <br></br>
                <br></br>
  
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 font-semibold rounded-lg text-white
                    bg-red-600 shadow-[0_0_15px_rgba(255,0,0,0.6)]
                    transition-all duration-200
                    hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(255,0,0,0.9)]
                    hover:bg-red-700"
                >
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <p>Đang tải thông tin người dùng...</p>
          )}
        </div>
  
        <div className="p-4 md:p-6 bg-white/10 backdrop-blur-md rounded-xl shadow border border-white/20">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">🏆 Bảng xếp hạng</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm md:text-base text-white border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Người chơi</th>
                  <th className="p-2 text-left">Điểm</th>
                </tr>
              </thead>
              <tbody>
              {leaderboard.map((user: any, index: number) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                return (
                  <tr key={index} className="border-t">
                    <td className="p-2 text-white font-semibold">
                      {index + 1} {medal}
                    </td>
                    <td className="p-2 text-white">{user.username}</td>
                    <td className="p-2 font-semibold text-white">{user.score}</td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-center text-sm text-white opacity-60 mt-10">
          {/* Footer spacing for mobile scroll */}
          Copyright © NBA Predict 2025 - by Son Pham phamcongson297@gmail.com
        </div>
      </div>
    </div>
  );
}
