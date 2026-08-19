'use client';

import { useEffect, useState } from 'react';
import { requireAdminClient } from '@/lib/requireAdminClient';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'teams' | 'matchups' | 'users' | 'leaderboard' | 'logs' | 'playoff'>('teams');
  const [teams, setTeams] = useState<any[]>([]);
  const [matchups, setMatchups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [regLeaderboard, setRegLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);

  // Playoff state
  const [playoffMatchups, setPlayoffMatchups] = useState<any[]>([]);
  const [playoffMatchupId, setPlayoffMatchupId] = useState('');
  const [actualWinner, setActualWinner] = useState('');
  const [actualScore, setActualScore] = useState('');
  const [playoffLockTime, setPlayoffLockTime] = useState('');

  useEffect(() => {
    requireAdminClient().catch(() => {});
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, mRes, uRes, lRes, rLbRes, pMRes] = await Promise.all([
        fetch('/api/regular/teams'),
        fetch('/api/regular/matchups?days=14'),
        fetch('/api/admin/users'),
        fetch('/api/admin/logs'),
        fetch('/api/regular/leaderboard'),
        fetch('/api/matchups'),
      ]);

      if (tRes.ok) setTeams(await tRes.json());
      if (mRes.ok) setMatchups(await mRes.json());
      if (uRes.ok) setUsers(await uRes.json());
      if (lRes.ok) setLogs(await lRes.json());
      if (rLbRes.ok) setRegLeaderboard(await rLbRes.json());
      if (pMRes.ok) setPlayoffMatchups(await pMRes.json());
    } catch (err: any) {
      toast.error('Lỗi khi tải dữ liệu Admin');
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/regular/teams', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cào dữ liệu');
      toast.success(`✅ Đã cào thông tin ${data.count} đội bóng!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/regular/fetch-schedule', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cào lịch thi đấu');
      toast.success(`✅ Đã cào ${data.count} trận đấu Regular Season!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleLiveSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cron/live-sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi đồng bộ Live');
      toast.success(`✅ Đã cập nhật ${data.liveSync?.updatedCount || 0} trận Live và tự động chấm ${data.liveSync?.settledCount || 0} trận!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeamDetail = async (teamId: number) => {
    try {
      const res = await fetch(`/api/regular/teams/${teamId}`);
      if (!res.ok) throw new Error('Không thể tải chi tiết đội bóng');
      const data = await res.json();
      setSelectedTeam(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleScrapeRoster = async (teamId: number) => {
    try {
      toast.loading('Đang cào Roster từ web...', { id: 'scrapeRoster' });
      const res = await fetch(`/api/regular/teams/${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scrape' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cào Roster');

      toast.success(`✅ Đã cào Roster mới (${data.athleteCount} cầu thủ). Đang chờ duyệt!`, { id: 'scrapeRoster' });
      handleSelectTeamDetail(teamId);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cào Roster', { id: 'scrapeRoster' });
    }
  };

  const handleApproveTeamData = async (teamId: number) => {
    try {
      const res = await fetch(`/api/regular/teams/${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi duyệt dữ liệu');

      toast.success('✅ Đã duyệt thông tin đội bóng thành công!');
      handleSelectTeamDetail(teamId);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Thất bại');
    }
  };

  const handleToggleAdmin = async (userId: number, currentIsAdmin: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin: !currentIsAdmin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('✅ Đã cập nhật quyền người dùng');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Playoff action handlers
  const handleUpdatePlayoffResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchupId: parseInt(playoffMatchupId),
          actualWinner,
          actualScore,
          lockTime: playoffLockTime || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('✅ Cập nhật kết quả Playoff thành công');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">⚙️ Admin Control Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý đội bóng, cào dữ liệu, duyệt Roster, quản lý người dùng & logs hệ thống</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
        >
          🔄 Làm mới dữ liệu
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-3 mb-8">
        {[
          { id: 'teams', label: '🏀 Quản Lý Đội Bóng' },
          { id: 'matchups', label: '🗓️ Regular Matchups' },
          { id: 'users', label: '👥 Người Dùng' },
          { id: 'leaderboard', label: '📊 Bảng Điểm' },
          { id: 'logs', label: '📜 System Logs' },
          { id: 'playoff', label: '🏆 Playoff Admin' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Teams Management */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Quản lý 30 đội NBA chính thức</h2>
              <p className="text-xs text-slate-400 mt-1">Cào dữ liệu đội bóng từ ESPN API, tên + logo được lưu trực tiếp, Roster lưu ở trạng thái Chờ duyệt.</p>
            </div>
            <button
              onClick={handleScrapeTeams}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg hover:brightness-110 transition"
            >
              🚀 Cào dữ liệu 30 Đội Bóng
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {teams.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTeamDetail(t.id)}
                className={`bg-slate-900 border p-4 rounded-2xl cursor-pointer transition flex flex-col items-center justify-between text-center ${
                  t.isApproved ? 'border-emerald-500/40 hover:border-emerald-400' : 'border-amber-500/40 hover:border-amber-400'
                }`}
              >
                <img src={t.logo} alt={t.name} className="w-14 h-14 object-contain mb-2" />
                <span className="text-xs font-bold text-slate-200 line-clamp-1">{t.name}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-1">{t.abbreviation}</span>
                <div className="mt-2">
                  {t.isApproved ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Đã duyệt
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Chờ duyệt
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Modal / Team Inspection */}
          {selectedTeam && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-12 h-12 object-contain" />
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedTeam.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">ID: {selectedTeam.id} | {selectedTeam.abbreviation}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeam(null)} className="text-slate-400 hover:text-white font-bold text-lg">
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleScrapeRoster(selectedTeam.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
                    >
                      🔄 Cào lại Roster (Roster Changes)
                    </button>
                    {selectedTeam.pendingData && (
                      <button
                        onClick={() => handleApproveTeamData(selectedTeam.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
                      >
                        ✅ Duyệt thông tin (Approve)
                      </button>
                    )}
                  </div>

                  {/* Pending Data Preview */}
                  {selectedTeam.pendingData && (
                    <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                        ⚠️ Dữ liệu mới cào được (Pending Approval) - {selectedTeam.pendingData.athleteCount} cầu thủ
                      </h4>
                      <p className="text-xs text-slate-300">Coach: {selectedTeam.pendingData.coach}</p>
                      <div className="max-h-40 overflow-y-auto mt-2 text-xs text-slate-400 bg-slate-950 p-2 rounded-lg font-mono">
                        {JSON.stringify(selectedTeam.pendingData.athletes?.slice(0, 5), null, 2)}
                      </div>
                    </div>
                  )}

                  {/* Scraped / Approved Data Preview */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      ✅ Dữ liệu hiện tại đã được duyệt (Approved Live Data)
                    </h4>
                    {selectedTeam.scrapedData ? (
                      <div>
                        <p className="text-xs text-slate-300">Coach: {selectedTeam.scrapedData.coach}</p>
                        <p className="text-xs text-slate-400 mt-1">Tổng cầu thủ: {selectedTeam.scrapedData.athleteCount}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Chưa có dữ liệu Roster nào được duyệt.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Regular Matchups */}
      {activeTab === 'matchups' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white">Quản lý Lịch thi đấu & Live Score</h2>
              <p className="text-xs text-slate-400 mt-1">Cào lịch thi đấu 7 ngày tới và kích hoạt đồng bộ Live score + tự động chấm điểm.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleFetchSchedule}
                disabled={loading}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow hover:bg-amber-400 transition"
              >
                🗓️ Cào lịch thi đấu 7 ngày
              </button>
              <button
                onClick={handleLiveSync}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow hover:bg-emerald-500 transition"
              >
                ⚡ Live Sync & Tự động chấm điểm
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Matchup</th>
                  <th className="p-3">Giờ thi đấu (GMT+7)</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Tỉ số / Kết quả</th>
                  <th className="p-3">Khóa đoán (-30m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {matchups.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-xs">{m.id}</td>
                    <td className="p-3 font-bold text-white">
                      {m.teamA.name} vs {m.teamB.name}
                    </td>
                    <td className="p-3 text-xs text-slate-400">
                      {new Date(m.startTime).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                    </td>
                    <td className="p-3 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        m.status === 'FINISHED' ? 'bg-emerald-500/20 text-emerald-400' :
                        m.status === 'IN_PROGRESS' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {m.actualScore || (m.scoreA !== null ? `${m.scoreA} - ${m.scoreB}` : '-')}
                    </td>
                    <td className="p-3 text-xs text-slate-400">
                      {new Date(m.lockTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Tài khoản</th>
                <th className="p-4">Lượt đoán Playoff</th>
                <th className="p-4">Lượt đoán Regular</th>
                <th className="p-4">Quyền Admin</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-4 font-mono text-xs">{u.id}</td>
                  <td className="p-4 font-bold text-white">{u.username}</td>
                  <td className="p-4">{u._count.predictions}</td>
                  <td className="p-4">{u._count.regularPredictions}</td>
                  <td className="p-4">
                    {u.isAdmin ? (
                      <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs font-bold border border-amber-500/30">
                        Admin
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-xs">User</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg transition"
                    >
                      {u.isAdmin ? 'Gỡ Admin' : 'Cấp Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Leaderboards */}
      {activeTab === 'leaderboard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">🏆 Bảng Xếp Hạng Regular Season (+1 điểm/trận)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Thứ hạng</th>
                  <th className="p-3">Người dùng</th>
                  <th className="p-3">Tổng lượt đoán</th>
                  <th className="p-3">Đoán đúng</th>
                  <th className="p-3">Tổng điểm (+1)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {regLeaderboard.map((lb, idx) => (
                  <tr key={lb.id}>
                    <td className="p-3 font-bold text-amber-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-white">{lb.username}</td>
                    <td className="p-3">{lb.totalPredictions}</td>
                    <td className="p-3 text-emerald-400 font-bold">{lb.correctPredictions}</td>
                    <td className="p-3 text-lg font-black text-amber-400">{lb.score} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">📜 Nhật Ký Hệ Thống (System Logs)</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${log.level === 'ERROR' ? 'text-red-400' : 'text-amber-400'}`}>
                    [{log.level}] {log.action}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                  </span>
                </div>
                <p className="text-slate-300 font-mono">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Playoff Admin */}
      {activeTab === 'playoff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white">🏆 Quản lý Playoff Predictor (Tính năng cũ)</h2>

          <form onSubmit={handleUpdatePlayoffResult} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Chọn Matchup Playoff</label>
              <select
                value={playoffMatchupId}
                onChange={(e) => setPlayoffMatchupId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
              >
                <option value="">-- Chọn trận --</option>
                {playoffMatchups.map((m) => (
                  <option key={m.id} value={m.id}>
                    Round {m.round}: {m.teamA} vs {m.teamB}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Đội thắng thật</label>
                <input
                  type="text"
                  value={actualWinner}
                  onChange={(e) => setActualWinner(e.target.value)}
                  placeholder="VD: LAL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tỷ số thật</label>
                <input
                  type="text"
                  value={actualScore}
                  onChange={(e) => setActualScore(e.target.value)}
                  placeholder="VD: 4-2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow hover:bg-amber-400 transition"
            >
              Cập nhật kết quả Playoff
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
