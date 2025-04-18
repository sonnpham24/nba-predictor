'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function StatsPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [topMatches, setTopMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
      setTopMatches(
        [...data]
          .filter((m) => m.correct > 0)
          .sort((a, b) => b.correct - a.correct)
          .slice(0, 3)
      );      
    };
    fetchStats();
  }, []);

  const roundStats = [1, 2, 3, 4].map((round) => {
    const roundMatches = stats.filter((m) => m.round === round);
    const total = roundMatches.length;
    const avgAccuracy = total === 0
      ? 0
      : Math.round(roundMatches.reduce((acc, m) => acc + m.accuracy, 0) / total);
    return { name: `Vòng ${round}`, value: avgAccuracy };
  });

  const conferenceStats = ['west', 'east'].map((conf) => {
    const matches = stats.filter((m) => m.conference === conf);
    const avg = matches.length === 0
      ? 0
      : Math.round(matches.reduce((acc, m) => acc + m.accuracy, 0) / matches.length);
    return { name: conf === 'west' ? 'Western' : 'Eastern', value: avg };
  });

  return (
    <div className="min-h-screen bg-gradient-animate text-black p-4 sm:p-6">
      <div className="starry-background"></div>
      <h1 className="text-2xl sm:text-3xl text-white font-bold text-center mb-6">📊 Thống kê toàn giải đấu</h1>

      {/* TOP MATCHES */}
      <section className="bg-white p-4 rounded-xl shadow max-w-5xl mx-auto mb-10 text-sm sm:text-base">
        <h2 className="text-lg font-bold text-blue-700 mb-2">🏆 Top 3 trận có nhiều người đoán đúng nhất</h2>
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          {topMatches.length === 0 ? (
            <p>Không có dữ liệu.</p>
          ) : (
            <ul className="space-y-1">
              {topMatches.map((m, i) => (
                <li key={m.id}>
                  <strong>{i + 1}. {m.label}</strong> – {m.correct} người đoán đúng ({m.accuracy}%)
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* BAR CHART */}
      <section className="bg-white p-4 rounded-xl shadow max-w-5xl mx-auto mb-10">
        <h2 className="text-xl font-semibold mb-4">🔥 Độ chính xác dự đoán từng trận</h2>
        <div className="h-[350px] sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <XAxis dataKey="label" hide />
              <YAxis />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border border-gray-300 p-2 rounded text-xs sm:text-sm">
                        <p><strong>{data.label}</strong></p>
                        <p>🎯 Độ chính xác: {data.accuracy}%</p>
                        <p>👥 Tổng lượt đoán: {data.total}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="accuracy"
                fill="#4ade80"
                onClick={(data) => window.location.href = `/matchup/${data.id}`}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* PIE CHARTS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">📅 Trung bình đúng theo vòng</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={roundStats} dataKey="value" nameKey="name" label>
                <Cell fill="#4ade80" />
                <Cell fill="#60a5fa" />
                <Cell fill="#facc15" />
                <Cell fill="#f87171" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">🌍 Tỷ lệ đúng theo miền</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={conferenceStats} dataKey="value" nameKey="name" label>
                <Cell fill="#60a5fa" />
                <Cell fill="#fbbf24" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="text-center text-sm text-white opacity-60 mt-10">
        {/* Footer spacing for mobile scroll */}
        Copyright © NBA Predict 2025 - by Son Pham phamcongson297@gmail.com
      </div>
    </div>
  );
}
