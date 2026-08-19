'use client';

import { useEffect, useState } from 'react';
import { requireAdminClient } from '@/lib/requireAdminClient';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminPage() {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'teams' | 'matchups' | 'users' | 'leaderboard' | 'logs' | 'playoff'>('teams');
  const [teams, setTeams] = useState<any[]>([]);
  const [matchups, setMatchups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [regLeaderboard, setRegLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);

  // Roster Editor State in Modal
  const [editCoach, setEditCoach] = useState('');
  const [editRosterJson, setEditRosterJson] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

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
      toast.error(locale === 'en' ? 'Error loading Admin data' : 'Lỗi khi tải dữ liệu Admin');
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/regular/teams', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scrape failed');
      toast.success(`✅ Scraped ${data.count} NBA teams!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/regular/fetch-schedule', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Schedule fetch failed');
      toast.success(`✅ Scraped ${data.count} Regular Season matchups!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleLiveSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cron/live-sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Live sync failed');
      toast.success(`✅ Updated ${data.liveSync?.updatedCount || 0} live matches & settled ${data.liveSync?.settledCount || 0} matches!`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeamDetail = async (teamId: number) => {
    try {
      const res = await fetch(`/api/regular/teams/${teamId}`);
      if (!res.ok) throw new Error('Failed to load team details');
      const data = await res.json();
      setSelectedTeam(data);

      const pData = data.pendingData || data.scrapedData || { coach: '', athletes: [] };
      setEditCoach(pData.coach || '');
      setEditRosterJson(JSON.stringify(pData.athletes || [], null, 2));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleScrapeRoster = async (teamId: number) => {
    try {
      toast.loading('Scraping roster from ESPN API...', { id: 'scrapeRoster' });
      const res = await fetch(`/api/regular/teams/${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scrape' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Roster scrape failed');

      toast.success(`✅ Scraped new roster (${data.athleteCount} players). Pending approval!`, { id: 'scrapeRoster' });
      handleSelectTeamDetail(teamId);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error', { id: 'scrapeRoster' });
    }
  };

  const handleSavePendingEdits = async (teamId: number) => {
    setSavingEdit(true);
    try {
      let parsedAthletes = [];
      try {
        parsedAthletes = JSON.parse(editRosterJson);
      } catch {
        throw new Error(locale === 'en' ? 'Invalid JSON format for athletes roster' : 'Cú pháp JSON Roster không hợp lệ');
      }

      const pendingObject = {
        coach: editCoach,
        athleteCount: parsedAthletes.length,
        athletes: parsedAthletes,
        updatedAt: new Date().toISOString(),
      };

      const res = await fetch(`/api/regular/teams/${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_pending', pendingData: pendingObject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      toast.success('💾 Saved roster edits to Pending Data!');
      handleSelectTeamDetail(teamId);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingEdit(false);
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
      if (!res.ok) throw new Error(data.error || 'Approval failed');

      toast.success('✅ Approved and published roster data successfully!');
      handleSelectTeamDetail(teamId);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Error');
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
      toast.success('✅ Updated user admin rights');
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
      toast.success('✅ Updated Playoff result successfully');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const pendingApprovalsCount = teams.filter((t) => !t.isApproved || t.pendingData !== null).length;

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
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2 leading-normal break-words">
            ⚙️ ADMIN CONTROL DASHBOARD
          </h1>
          <p className="text-slate-400 text-sm mt-1 leading-normal break-words">
            {locale === 'en' ? 'Manage 30 NBA teams, scrapers, roster edits & approvals, live matchups & user access' : 'Điều hành toàn bộ dữ liệu 30 đội bóng, Scraper, Sửa & Duyệt Roster, Matchups Live & Người Dùng'}
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-2xl text-xs font-black border border-slate-700 shadow-lg transition flex items-center justify-center space-x-2 leading-normal"
        >
          <span>🔄</span>
          <span>{loading ? (locale === 'en' ? 'REFRESHING...' : 'ĐANG LÀM MỚI...') : (locale === 'en' ? 'REFRESH DATA' : 'LÀM MỚI DỮ LIỆU')}</span>
        </button>
      </div>

      {/* Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase leading-normal">
            {locale === 'en' ? 'TOTAL TEAMS' : 'TỔNG ĐỘI BÓNG'}
          </span>
          <span className="text-2xl font-black text-white mt-1 font-mono">{teams.length} / 30</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase leading-normal">
            {locale === 'en' ? 'PENDING APPROVALS' : 'CHỜ ADMIN DUYỆT'}
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 font-mono">{pendingApprovalsCount}</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase leading-normal">
            {locale === 'en' ? 'REGULAR MATCHUPS' : 'TRẬN REGULAR SEASON'}
          </span>
          <span className="text-2xl font-black text-blue-400 mt-1 font-mono">{matchups.length}</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10 flex flex-col">
          <span className="text-xs font-bold text-slate-400 uppercase leading-normal">
            {locale === 'en' ? 'SYSTEM USERS' : 'NGƯỜI DÙNG HỆ THỐNG'}
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 font-mono">{users.length}</span>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-3 mb-8 scrollbar-none">
        {[
          { id: 'teams', label: locale === 'en' ? '🏀 Manage 30 NBA Teams' : '🏀 Quản Lý 30 Đội Bóng' },
          { id: 'matchups', label: locale === 'en' ? '🗓️ Regular Matchups' : '🗓️ Regular Matchups' },
          { id: 'users', label: locale === 'en' ? '👥 Users & Access' : '👥 Người Dùng & Quyền' },
          { id: 'leaderboard', label: locale === 'en' ? '📊 Standings' : '📊 Bảng Điểm Regular' },
          { id: 'logs', label: locale === 'en' ? '📜 System Log Stream' : '📜 Nhật Ký System Logs' },
          { id: 'playoff', label: locale === 'en' ? '🏆 Playoff Admin' : '🏆 Playoff Admin' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg scale-105'
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
              <h2 className="text-lg font-black text-white leading-normal">
                {locale === 'en' ? '30 Official NBA Teams' : '30 Đội Bóng NBA Chính Thức'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-normal break-words">
                {locale === 'en' ? 'Scrape names & logos directly. Player rosters are saved as Pending Approval for Admin review.' : 'Cào Tên + Logo trực tiếp, thông tin Roster lưu ở dạng Chờ Duyệt (Pending Data).'}
              </p>
            </div>
            <button
              onClick={handleScrapeTeams}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl hover:scale-105 transition duration-300 leading-normal"
            >
              🚀 {locale === 'en' ? 'SCRAPE 30 NBA TEAMS' : 'CÀO DỮ LIỆU 30 ĐỘI BÓNG'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teams.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTeamDetail(t.id)}
                className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-between text-center border ${
                  t.isApproved
                    ? 'border-emerald-500/40 hover:border-emerald-400'
                    : 'border-amber-500/40 hover:border-amber-400'
                }`}
              >
                <img src={t.logo} alt={t.name} className="w-16 h-16 object-contain mb-3 drop-shadow-md" />
                <span className="text-xs font-bold text-slate-200 leading-normal break-words">{t.name}</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{t.abbreviation}</span>
                <div className="mt-3">
                  {t.isApproved ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 leading-normal">
                      ✓ {locale === 'en' ? 'Approved' : 'Đã duyệt'}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30 leading-normal">
                      ⏳ {locale === 'en' ? 'Pending' : 'Chờ duyệt'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Inspection & Editing Modal */}
          {selectedTeam && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="glass-card max-w-3xl w-full p-8 rounded-3xl border border-amber-500/40 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <img src={selectedTeam.logo} alt={selectedTeam.name} className="w-14 h-14 object-contain" />
                    <div>
                      <h3 className="text-2xl font-black text-white leading-normal break-words">{selectedTeam.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">ID: {selectedTeam.id} | {selectedTeam.abbreviation}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTeam(null)} className="text-slate-400 hover:text-white font-bold text-xl">
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Action Buttons Header */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleScrapeRoster(selectedTeam.id)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition shadow-lg leading-normal"
                    >
                      🚀 {locale === 'en' ? 'Scrape Roster from ESPN' : 'Cào Dữ Liệu Roster Mới (ESPN)'}
                    </button>
                    <button
                      onClick={() => handleSavePendingEdits(selectedTeam.id)}
                      disabled={savingEdit}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-black transition shadow-lg leading-normal"
                    >
                      💾 {locale === 'en' ? 'Save Edits' : 'Lưu Chỉnh Sửa'}
                    </button>
                    <button
                      onClick={() => handleApproveTeamData(selectedTeam.id)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition shadow-lg leading-normal"
                    >
                      ✅ {locale === 'en' ? 'Approve & Publish' : 'Duyệt & Công Khai (Approve)'}
                    </button>
                  </div>

                  {/* Roster Edit Form (Pending Data) */}
                  <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider leading-normal">
                      ⚠️ {locale === 'en' ? 'Pending Approval Data Editor' : 'Chỉnh Sửa Dữ Liệu Roster Chờ Duyệt'}
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        {locale === 'en' ? 'Head Coach Name:' : 'Tên Huấn Luyện Viên (Head Coach):'}
                      </label>
                      <input
                        type="text"
                        value={editCoach}
                        onChange={(e) => setEditCoach(e.target.value)}
                        placeholder="e.g. Erik Spoelstra"
                        className="w-full glass-input p-3 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        {locale === 'en' ? 'Athletes Roster (JSON Array):' : 'Danh Sách Cầu Thủ (Dạng Mảng JSON):'}
                      </label>
                      <textarea
                        rows={8}
                        value={editRosterJson}
                        onChange={(e) => setEditRosterJson(e.target.value)}
                        className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Currently Approved Data Display */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 leading-normal">
                      ✅ {locale === 'en' ? 'Approved Public Data' : 'Dữ liệu hiện tại đang công khai'}
                    </h4>
                    {selectedTeam.scrapedData ? (
                      <div>
                        <p className="text-xs text-slate-300 leading-normal">Coach: {selectedTeam.scrapedData.coach}</p>
                        <p className="text-xs text-slate-400 mt-1 leading-normal">Total Athletes: {selectedTeam.scrapedData.athleteCount}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 leading-normal">No roster data approved yet.</p>
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
              <h2 className="text-lg font-black text-white leading-normal">
                {locale === 'en' ? 'Matchups & Live Sync' : 'Quản Lý Trận Đấu & Live Sync'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-normal break-words">
                {locale === 'en' ? 'Fetch 7-day schedule and trigger real-time score sync + auto settlement.' : 'Kích hoạt cào lịch thi đấu 7 ngày và đồng bộ tỉ số Live kèm tự động chấm điểm.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleFetchSchedule}
                disabled={loading}
                className="px-4 py-2.5 bg-amber-500 text-slate-950 font-black rounded-2xl text-xs uppercase shadow transition leading-normal"
              >
                🗓️ {locale === 'en' ? 'Fetch 7-Day Schedule' : 'Cào lịch 7 ngày'}
              </button>
              <button
                onClick={handleLiveSync}
                disabled={loading}
                className="px-4 py-2.5 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase shadow transition leading-normal"
              >
                ⚡ {locale === 'en' ? 'Live Sync & Auto-Settle' : 'Live Sync & Tự động Chấm Điểm'}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs font-black text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4 leading-normal">ID</th>
                    <th className="p-4 leading-normal">Matchup</th>
                    <th className="p-4 leading-normal">Time (GMT+7)</th>
                    <th className="p-4 leading-normal">Status</th>
                    <th className="p-4 leading-normal">Actual Score</th>
                    <th className="p-4 leading-normal">Lock (-30m)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {matchups.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-xs text-slate-500">#{m.id}</td>
                      <td className="p-4 font-bold text-white leading-normal break-words">
                        {m.teamA.name} vs {m.teamB.name}
                      </td>
                      <td className="p-4 text-xs text-slate-400 leading-normal">
                        {new Date(m.startTime).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                      </td>
                      <td className="p-4 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-bold leading-normal ${
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
                        {new Date(m.lockTime).toLocaleTimeString(locale === 'en' ? 'en-US' : 'vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })}
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
                <th className="p-4 leading-normal">ID</th>
                <th className="p-4 leading-normal">Username</th>
                <th className="p-4 leading-normal">Playoff Picks</th>
                <th className="p-4 leading-normal">Regular Picks</th>
                <th className="p-4 leading-normal">Role</th>
                <th className="p-4 leading-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-4 font-mono text-xs text-slate-500">#{u.id}</td>
                  <td className="p-4 font-bold text-white leading-normal break-words">{u.username}</td>
                  <td className="p-4 font-mono">{u._count.predictions}</td>
                  <td className="p-4 font-mono">{u._count.regularPredictions}</td>
                  <td className="p-4">
                    {u.isAdmin ? (
                      <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-black border border-amber-500/30 leading-normal">
                        PRO ADMIN
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold leading-normal">USER</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition leading-normal"
                    >
                      {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
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
          <h2 className="text-lg font-black text-white mb-4 leading-normal">
            🏆 {locale === 'en' ? 'Regular Season Standings (+1 pt/game)' : 'Bảng Điểm Regular Season (+1 điểm/trận)'}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-black text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 leading-normal">Rank</th>
                  <th className="p-3 leading-normal">User</th>
                  <th className="p-3 text-center leading-normal">Total Picks</th>
                  <th className="p-3 text-center leading-normal">Correct</th>
                  <th className="p-3 text-right leading-normal">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {regLeaderboard.map((lb, idx) => (
                  <tr key={lb.id}>
                    <td className="p-3 font-black text-amber-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-white leading-normal break-words">{lb.username}</td>
                    <td className="p-3 text-center font-mono">{lb.totalPredictions}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{lb.correctPredictions}</td>
                    <td className="p-3 text-right font-black text-lg text-amber-400 font-mono">{lb.totalScore} pts</td>
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
          <h2 className="text-lg font-black text-white mb-4 leading-normal">📜 System Log Stream</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <span className={`font-black ${log.level === 'ERROR' ? 'text-red-400' : 'text-amber-400'}`}>
                    [{log.level}] {log.action}
                  </span>
                  <span className="text-slate-500">
                    {new Date(log.createdAt).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                  </span>
                </div>
                <p className="text-slate-300 leading-normal break-words">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PLAYOFF ADMIN */}
      {activeTab === 'playoff' && (
        <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
          <h2 className="text-lg font-black text-white leading-normal">🏆 Playoff Admin Controls</h2>

          <form onSubmit={handleUpdatePlayoffResult} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2 leading-normal">Select Playoff Matchup</label>
              <select
                value={playoffMatchupId}
                onChange={(e) => setPlayoffMatchupId(e.target.value)}
                className="w-full glass-input p-3 rounded-2xl text-sm text-white font-bold"
              >
                <option value="" className="bg-slate-900">-- Select matchup --</option>
                {playoffMatchups.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900">
                    Round {m.round}: {m.teamA} vs {m.teamB}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2 leading-normal">Actual Winner</label>
                <input
                  type="text"
                  value={actualWinner}
                  onChange={(e) => setActualWinner(e.target.value)}
                  placeholder="e.g. LAL"
                  className="w-full glass-input p-3 rounded-2xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2 leading-normal">Actual Series Score</label>
                <input
                  type="text"
                  value={actualScore}
                  onChange={(e) => setActualScore(e.target.value)}
                  placeholder="e.g. 4-2"
                  className="w-full glass-input p-3 rounded-2xl text-sm font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-2xl text-xs uppercase shadow hover:scale-105 transition duration-300 leading-normal"
            >
              Update Playoff Result
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
