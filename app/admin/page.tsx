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

  const pendingApprovalsCount = teams.filter((t) => !t.isApproved && t.pendingData).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-black bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
              COMMAND CENTER
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2">⚙️ ADMIN CONTROL DASHBOARD</h1>
          <p className="text-slate-400 text-sm mt-1">
            Điều hành toàn bộ dữ liệu 30 đội bóng, Scraper, Duyệt Roster, Matchups Live & Người Dùng
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-2xl text-xs font-black border border-slate-700 shadow-lg transition flex items-center justify-center space-x-2"
        >
          <span>🔄</span>
          <span>{loading ? 'ĐANG LÀM MỚI...' : 'LÀM MỚI DỮ LIỆU'}</span>
        </button>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase">TỔNG ĐỘI BÓNG</span>
          <span className="text-2xl font-black text-white mt-1">{teams.length} / 30</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase">CHỜ ADMIN DUYỆT</span>
          <span className="text-2xl font-black text-amber-400 mt-1">{pendingApprovalsCount} Đội</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase">TRẬN REGULAR SEASON</span>
          <span className="text-2xl font-black text-blue-400 mt-1">{matchups.length} Trận</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase">NGƯỜI DÙNG HỆ THỐNG</span>
          <span className="text-2xl font-black text-emerald-400 mt-1">{users.length} Mở</span>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-3 mb-8 scrollbar-none">
        {[
          { id: 'teams', label: '🏀 Quản Lý 30 Đội Bóng' },
          { id: 'matchups', label: '🗓️ Regular Matchups' },
          { id: 'users', label: '👥 Người Dùng & Quyền' },
          { id: 'leaderboard', label: '📊 Bảng Điểm Regular' },
          { id: 'logs', label: '📜 Nhật Ký System Logs' },
          { id: 'playoff', label: '🏆 Playoff Admin' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-105'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: TEAMS MANAGEMENT */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">30 Đội Bóng NBA Chính Thức</h2>
              <p className="text-xs text-slate-400 mt-1">Cào Tên + Logo trực tiếp, thông tin Roster lưu ở dạng Chờ Duyệt (Pending Data).</p>
            </div>
            <button
              onClick={handleScrapeTeams}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl shadow-amber-500/20 hover:scale-105 transition duration-300"
            >
              🚀 CÀO DỮ LIỆU 30 ĐỘI BÓNG
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teams.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTeamDetail(t.id)}
                className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-between text-center border ${
                  t.isApproved
                    ? 'border-emerald-500/40 hover:border-emerald-400 hover:shadow-emerald-500/10'
                    : 'border-amber-500/40 hover:border-amber-400 hover:shadow-amber-500/10'
                }`}
              >
                <img src={t.logo} alt={t.name} className="w-16 h-16 object-contain mb-3 drop-shadow-md" />
                <span className="text-xs font-bold text-slate-200 line-clamp-1">{t.name}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{t.abbreviation}</span>
                <div className="mt-3">
                  {t.isApproved ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      ✓ Đã duyệt
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
                      ⏳ Chờ duyệt
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Inspection Modal */}
          {selectedTeam && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="glass-card max-w-3xl w-full p-8 rounded-3xl border border-amber-500/40 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-14 h-14 object-contain" />
                    <div>
                      <h3 className="text-2xl font-black text-white">{selectedTeam.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">ID: {selectedTeam.id} | {selectedTeam.abbreviation}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeam(null)} className="text-slate-400 hover:text-white font-bold text-xl">
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleScrapeRoster(selectedTeam.id)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition shadow-lg"
                    >
                      🔄 Cào lại Roster (Roster Changes)
                    </button>
                    {selectedTeam.pendingData && (
                      <button
                        onClick={() => handleApproveTeamData(selectedTeam.id)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-lg"
                      >
                        ✅ Duyệt dữ liệu (Approve Data)
                      </button>
                    )}
                  </div>

                  {selectedTeam.pendingData && (
                    <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                        ⚠️ Dữ liệu mới cào được (Pending Approval) - {selectedTeam.pendingData.athleteCount} cầu thủ
                      </h4>
                      <p className="text-xs text-slate-300">Coach: {selectedTeam.pendingData.coach}</p>
                      <div className="max-h-48 overflow-y-auto mt-3 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl font-mono">
                        {JSON.stringify(selectedTeam.pendingData.athletes?.slice(0, 5), null, 2)}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      ✅ Dữ liệu hiện tại đang công khai (Approved Live Data)
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

      {/* TAB 2: MATCHUPS */}
      {activeTab === 'matchups' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white">Quản Lý Trận Đấu & Live Sync</h2>
              <p className="text-xs text-slate-400 mt-1">Kích hoạt cào lịch thi đấu 7 ngày và đồng bộ tỉ số Live kèm tự động chấm điểm.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleFetchSchedule}
                disabled={loading}
                className="px-4 py-2.5 bg-amber-500 text-slate-950 font-black rounded-2xl text-xs uppercase shadow hover:bg-amber-400 transition"
              >
                🗓️ Cào lịch 7 ngày
              </button>
              <button
                onClick={handleLiveSync}
                disabled={loading}
                className="px-4 py-2.5 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase shadow hover:bg-emerald-500 transition"
              >
                ⚡ Live Sync & Tự động Chấm Điểm
              </button>
            </div>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs font-black text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Matchup</th>
                    <th className="p-4">Giờ thi đấu (GMT+7)</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4">Tỉ số Real</th>
                    <th className="p-4">Khóa đoán (-30m)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {matchups.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-xs text-slate-500">#{m.id}</td>
                      <td className="p-4 font-bold text-white">
                        {m.teamA.name} vs {m.teamB.name}
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(m.startTime).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                      </td>
                      <td className="p-4 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-bold ${
                          m.status === 'FINISHED' ? 'bg-emerald-500/20 text-emerald-400' :
                          m.status === 'IN_PROGRESS' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black text-amber-400">
                        {m.actualScore || (m.scoreA !== null ? `${m.scoreA} - ${m.scoreB}` : '-')}
                      </td>
                      <td className="p-4 text-xs text-slate-400 font-mono">
                        {new Date(m.lockTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-black text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Tài khoản</th>
                <th className="p-4">Lượt đoán Playoff</th>
                <th className="p-4">Lượt đoán Regular</th>
                <th className="p-4">Quyền Admin</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-4 font-mono text-xs text-slate-500">#{u.id}</td>
                  <td className="p-4 font-bold text-white">{u.username}</td>
                  <td className="p-4 font-mono">{u._count.predictions}</td>
                  <td className="p-4 font-mono">{u._count.regularPredictions}</td>
                  <td className="p-4">
                    {u.isAdmin ? (
                      <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-black border border-amber-500/30">
                        PRO ADMIN
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold">USER</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition"
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

      {/* TAB 4: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="glass-card p-6 rounded-3xl border border-white/10">
          <h2 className="text-lg font-black text-white mb-4">🏆 Bảng Điểm Regular Season (+1 điểm/trận)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-black text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Hạng</th>
                  <th className="p-3">Người dùng</th>
                  <th className="p-3 text-center">Tổng lượt đoán</th>
                  <th className="p-3 text-center">Đoán đúng</th>
                  <th className="p-3 text-right">Tổng điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {regLeaderboard.map((lb, idx) => (
                  <tr key={lb.id}>
                    <td className="p-3 font-black text-amber-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-white">{lb.username}</td>
                    <td className="p-3 text-center font-mono">{lb.totalPredictions}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{lb.correctPredictions}</td>
                    <td className="p-3 text-right font-black text-lg text-amber-400">{lb.score} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: LOGS */}
      {activeTab === 'logs' && (
        <div className="glass-card p-6 rounded-3xl border border-white/10">
          <h2 className="text-lg font-black text-white mb-4">📜 System Log Stream</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className={`font-black ${log.level === 'ERROR' ? 'text-red-400' : 'text-amber-400'}`}>
                    [{log.level}] {log.action}
                  </span>
                  <span className="text-slate-500">
                    {new Date(log.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                  </span>
                </div>
                <p className="text-slate-300">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PLAYOFF ADMIN */}
      {activeTab === 'playoff' && (
        <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-lg font-black text-white">🏆 Playoff Admin Controls</h2>

          <form onSubmit={handleUpdatePlayoffResult} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Chọn Matchup Playoff</label>
              <select
                value={playoffMatchupId}
                onChange={(e) => setPlayoffMatchupId(e.target.value)}
                className="w-full glass-input p-3 rounded-2xl text-sm text-white font-bold"
              >
                <option value="" className="bg-slate-900">-- Chọn trận --</option>
                {playoffMatchups.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900">
                    Round {m.round}: {m.teamA} vs {m.teamB}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Đội thắng thật</label>
                <input
                  type="text"
                  value={actualWinner}
                  onChange={(e) => setActualWinner(e.target.value)}
                  placeholder="VD: LAL"
                  className="w-full glass-input p-3 rounded-2xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Tỷ số thật</label>
                <input
                  type="text"
                  value={actualScore}
                  onChange={(e) => setActualScore(e.target.value)}
                  placeholder="VD: 4-2"
                  className="w-full glass-input p-3 rounded-2xl text-sm font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-lg shadow-amber-500/20 hover:scale-105 transition duration-300"
            >
              Cập nhật kết quả Playoff
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
