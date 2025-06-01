'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requireAdminClient } from '@/lib/requireAdminClient';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null); // null = chưa kiểm tra
  const [matchups, setMatchups] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // ✅ Kiểm tra quyền truy cập admin
  useEffect(() => {
    const checkAccess = async () => {
      try {
        await requireAdminClient();
        setAuthorized(true);
      } catch (err) {
        console.error(err);
        setAuthorized(false);
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    };
    checkAccess();
  }, [router]);

  // ✅ Gọi fetchMatchups sau khi authorized
  useEffect(() => {
    if (authorized !== true) return;

    const fetchMatchups = async () => {
      const res = await fetch('/api/matchups');
      const data = await res.json();
      const enriched = data.map((m: any) => ({ ...m, lockSaved: false }));
      setMatchups(enriched);
    };

    fetchMatchups();
  }, [authorized]);

  if (authorized === false) {
    return <div className="text-center text-red-500 p-6">❌ Bạn không có quyền admin — đang quay lại...</div>;
  }

  if (authorized === null) {
    return <p className="text-center text-white p-6">🔐 Đang kiểm tra quyền truy cập...</p>;
  }

  // ✅ Các hàm xử lý còn lại giữ nguyên như cũ
  const handleUpdateResult = async (id: number, winner: string, score: string) => {
    setUpdatingId(id);
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchupId: id, actualWinner: winner, actualScore: score }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Cập nhật kết quả thành công');
      location.reload();
    } else {
      alert(data.error || '❌ Có lỗi xảy ra khi cập nhật kết quả');
    }
    setUpdatingId(null);
  };

  const handleUpdateLockTime = async (id: number, lockTime: string) => {
    if (!lockTime) return alert('⏰ Vui lòng chọn thời gian lock');

    const res = await fetch('/api/admin/locktime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchupId: id, lockTime }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Lock time đã được cập nhật!');
      setMatchups((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, lockTime, lockSaved: true } : m
        )
      );
    } else {
      alert(data.error || '❌ Lỗi khi cập nhật lock time');
    }
  };

  const handleAdvanceRound = async (round: number, conference: 'west' | 'east') => {
    const confirmGo = window.confirm(`Bạn chắc chắn muốn tạo vòng ${round + 1} cho ${conference.toUpperCase()}?`);
    if (!confirmGo) return;

    const res = await fetch('/api/admin/advance-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round, conference }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Đã tạo thành công các matchup vòng tiếp theo!');
      location.reload();
    } else {
      alert(`❌ Thất bại: ${data.error}`);
    }
  };

  const grouped = matchups.reduce((acc: any, m) => {
    const key = `${m.round}-${m.conference}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="p-6 min-h-screen bg-white text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">🛠️ Trang Quản Trị</h1>
      <div className="space-y-10 max-w-5xl mx-auto">

        {/* Thêm nút Tạo Vòng Chung Kết Tổng */}
        <div className="mb-8 text-center">
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={async () => {
              const confirmGo = window.confirm('Bạn chắc chắn muốn tạo vòng Chung Kết Tổng?');
              if (!confirmGo) return;

              const res = await fetch('/api/admin/create-final', { method: 'POST' });
              const data = await res.json();

              if (res.ok) {
                alert('✅ Đã tạo vòng Chung Kết Tổng!');
                location.reload();
              } else {
                alert(`❌ Thất bại: ${data.error}`);
              }
            }}
          >
            🏆 Tạo vòng Chung Kết Tổng
          </Button>
        </div>

        {Object.entries(grouped).map(([key, matches]: any) => {
          const [round, conference] = key.split('-');
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  🎯 Vòng {round} – {conference === 'west' ? 'Western' : 'Eastern'} Conference
                </h2>
                <Button
                  onClick={() => handleAdvanceRound(Number(round), conference as 'west' | 'east')}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  ➕ Tạo vòng {Number(round) + 1}
                </Button>
              </div>

              <div className="space-y-4">
                {matches.map((m: any) => (
                  <div key={m.id} className="p-4 border rounded-xl shadow space-y-2">
                    <h2 className="text-lg font-semibold mb-2">
                      {m.teamA} vs {m.teamB}{' '}
                      {m.actualWinner && `(✅ ${m.actualWinner} thắng ${m.actualScore})`}
                    </h2>

                    {/* Kết quả */}
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                      <select
                        defaultValue={m.actualWinner || ''}
                        className="border p-2 rounded"
                        onChange={(e) => (m.actualWinner = e.target.value)}
                      >
                        <option value="">Chọn đội thắng</option>
                        <option value={m.teamA}>{m.teamA}</option>
                        <option value={m.teamB}>{m.teamB}</option>
                      </select>

                      <input
                        className="border p-2 rounded"
                        defaultValue={m.actualScore || ''}
                        placeholder="Tỷ số (vd: 4-2)"
                        onChange={(e) => (m.actualScore = e.target.value)}
                      />

                      <button
                        onClick={() => handleUpdateResult(m.id, m.actualWinner, m.actualScore)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={updatingId === m.id}
                      >
                        {updatingId === m.id ? 'Đang lưu...' : 'Lưu kết quả'}
                      </button>
                    </div>

                    {/* Lock Time */}
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                      <input
                        type="datetime-local"
                        defaultValue={
                          m.lockTime ? new Date(m.lockTime).toISOString().slice(0, 16) : ''
                        }
                        className={`border p-2 rounded ${
                          m.lockTime && new Date(m.lockTime) < new Date()
                            ? 'border-red-500 bg-red-50 text-red-600 font-semibold'
                            : ''
                        }`}
                        onChange={(e) => (m.newLockTime = e.target.value)}
                        disabled={m.lockSaved}
                      />
                      <button
                        onClick={async () => {
                          await handleUpdateLockTime(m.id, m.newLockTime);
                          m.lockSaved = true;
                          setMatchups([...matchups]);
                        }}
                        className={`px-4 py-2 rounded text-white transition ${
                          m.lockSaved
                            ? 'bg-green-500 cursor-not-allowed'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                        disabled={m.lockSaved}
                      >
                        {m.lockSaved ? '✅ Đã lưu' : 'Cập nhật Lock Time'}
                      </button>
                      {m.lockTime && new Date(m.lockTime) < new Date() && (
                        <span className="text-red-500 text-sm">🚫 Đã quá hạn</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

