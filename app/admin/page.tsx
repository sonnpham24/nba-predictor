'use client';

import { useEffect, useState } from 'react';
import { requireAdminClient } from '@/lib/requireAdminClient';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminPage() {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'teams' | 'matchups' | 'custom' | 'users' | 'leaderboard' | 'logs' | 'playoff'>('teams');
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
  const [originalCoach, setOriginalCoach] = useState('');
  const [originalRosterJson, setOriginalRosterJson] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Custom Matchup Form States
  const [customTeamAId, setCustomTeamAId] = useState('');
  const [customTeamBId, setCustomTeamBId] = useState('');
  const [customTeamAName, setCustomTeamAName] = useState('');
  const [customTeamBName, setCustomTeamBName] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [creatingCustom, setCreatingCustom] = useState(false);

  // Custom Settle Inline States
  const [settleScores, setSettleScores] = useState<{ [matchupId: number]: { scoreA: string; scoreB: string; winnerType: 'teamA' | 'teamB' } }>({});
  const [settlingMatchupId, setSettlingMatchupId] = useState<number | null>(null);

  // Admin Score Editor State
  const [scoreAdjustments, setScoreAdjustments] = useState<{ [userId: number]: number }>({});

  // Playoff state
  const [playoffMatchups, setPlayoffMatchups] = useState<any[]>([]);
  const [playoffMatchupId, setPlayoffMatchupId] = useState('');
  const [actualWinner, setActualWinner] = useState('');
  const [actualScore, setActualScore] = useState('');
  const [playoffLockTime, setPlayoffLockTime] = useState('');

  const minDateTimeString = new Date().toISOString().slice(0, 16);

  useEffect(() => {
    requireAdminClient().catch(() => {});
    loadData();
    setCustomStartTime(minDateTimeString);
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
      if (mRes.ok) {
        const matchupData = await mRes.json();
        setMatchups(matchupData);

        const initSettleState: { [mId: number]: { scoreA: string; scoreB: string; winnerType: 'teamA' | 'teamB' } } = {};
        matchupData.forEach((m: any) => {
          if (m.isCustom) {
            initSettleState[m.id] = {
              scoreA: m.scoreA !== null ? String(m.scoreA) : '',
              scoreB: m.scoreB !== null ? String(m.scoreB) : '',
              winnerType: 'teamA',
            };
          }
        });
        setSettleScores(initSettleState);
      }
      if (uRes.ok) {
        const userData = await uRes.json();
        setUsers(userData);
      }
      if (lRes.ok) setLogs(await lRes.json());
      if (rLbRes.ok) {
        const lbData = await rLbRes.json();
        setRegLeaderboard(lbData);
        const initAdjustments: { [userId: number]: number } = {};
        lbData.forEach((u: any) => {
          initAdjustments[u.id] = u.scoreAdjustment || 0;
        });
        setScoreAdjustments(initAdjustments);
      }
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

  const handleCreateCustomMatchup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStartTime) {
      toast.error(locale === 'en' ? 'Please select match start time' : 'Vui lòng chọn thời gian bắt đầu trận đấu');
      return;
    }

    setCreatingCustom(true);
    try {
      const res = await fetch('/api/admin/regular/custom-matchup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamAId: customTeamAId || null,
          teamBId: customTeamBId || null,
          customTeamA: customTeamAName,
          customTeamB: customTeamBName,
          startTime: customStartTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create custom matchup failed');

      toast.success('🎉 Created custom matchup successfully!');
      setCustomTeamAId('');
      setCustomTeamBId('');
      setCustomTeamAName('');
      setCustomTeamBName('');
      setCustomStartTime(minDateTimeString);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingCustom(false);
    }
  };

  const handleSettleCustomInline = async (matchupId: number) => {
    const settleData = settleScores[matchupId];
    if (!settleData || !settleData.scoreA || !settleData.scoreB) {
      toast.error(locale === 'en' ? 'Please enter final scores for both teams' : 'Vui lòng nhập đầy đủ tỉ số của 2 đội');
      return;
    }

    setSettlingMatchupId(matchupId);
    try {
      const res = await fetch('/api/admin/regular/settle-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchupId,
          scoreA: settleData.scoreA,
          scoreB: settleData.scoreB,
          winnerType: settleData.winnerType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Settle failed');

      toast.success(data.message || '🏁 Settled matchup & points distributed!');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSettlingMatchupId(null);
    }
  };

  const handleSelectTeamDetail = async (teamId: number) => {
    try {
      const res = await fetch(`/api/regular/teams/${teamId}`);
      if (!res.ok) throw new Error('Failed to load team details');
      const data = await res.json();
      setSelectedTeam(data);

      const pData = data.pendingData || data.scrapedData || { coach: '', athletes: [] };
      const coachVal = pData.coach || '';
      const rosterVal = JSON.stringify(pData.athletes || [], null, 2);

      setEditCoach(coachVal);
      setEditRosterJson(rosterVal);
      setOriginalCoach(coachVal);
      setOriginalRosterJson(rosterVal);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const isDirty = editCoach !== originalCoach || editRosterJson !== originalRosterJson;

  const handleCloseModal = () => {
    if (isDirty) {
      const confirmClose = window.confirm(
        locale === 'en'
          ? '⚠️ You have unsaved roster edits! Are you sure you want to close without saving?'
          : '⚠️ Bạn có chỉnh sửa Roster chưa lưu! Bạn có chắc muốn đóng mà không lưu không?'
      );
      if (!confirmClose) return;
    }
    setSelectedTeam(null);
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

  const handleToggleDisable = async (userId: number, currentIsDisabled: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isDisabled: !currentIsDisabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(currentIsDisabled ? '✅ Account enabled!' : '🚫 Account disabled!');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveUserScore = async (userId: number) => {
    const adj = scoreAdjustments[userId] || 0;
    try {
      const res = await fetch('/api/admin/users/score', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, scoreAdjustment: adj }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message || '💾 Saved score adjustment!');
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
  const customMatchupsList = matchups.filter((m) => m.isCustom);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-black bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
              COMMAND CENTER 2026-27
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mt-2 leading-normal break-words">
            ⚙️ ADMIN CONTROL DASHBOARD
          </h1>
          <p className="text-slate-400 text-sm mt-1 leading-normal break-words">
            {locale === 'en' ? 'Manage 30 NBA teams, custom matchups, score editor, disable accounts & live scoring' : 'Điều hành toàn bộ dữ liệu 30 đội bóng, Tạo Trận Đấu Tùy Chỉnh, Trình Sửa Điểm, Vô Hiệu Hóa Tài Khoản & Người Dùng'}
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
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-3 mb-8 pl-2 scrollbar-none">
        {[
          { id: 'teams', label: locale === 'en' ? '🏀 Manage 30 NBA Teams' : '🏀 Quản Lý 30 Đội Bóng' },
          { id: 'custom', label: locale === 'en' ? '➕ Create Custom Matchup' : '➕ Tự Tạo Matchup' },
          { id: 'matchups', label: locale === 'en' ? '🗓️ Scraped Matchups' : '🗓️ Matchups Tự Động' },
          { id: 'users', label: locale === 'en' ? '👥 Users & Access' : '👥 Người Dùng & Quyền' },
          { id: 'leaderboard', label: locale === 'en' ? '📊 Standings & Score Editor' : '📊 Sửa Điểm Standings' },
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
                  <button onClick={handleCloseModal} className="text-slate-400 hover:text-white font-bold text-xl">
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
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

                  <div className={`p-5 rounded-2xl border ${
                    selectedTeam.isApproved && !selectedTeam.pendingData
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-amber-950/30 border-amber-500/40'
                  } space-y-4`}>
                    <h4 className={`text-xs font-bold uppercase tracking-wider leading-normal ${
                      selectedTeam.isApproved && !selectedTeam.pendingData ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {selectedTeam.isApproved && !selectedTeam.pendingData
                        ? (locale === 'en' ? '✅ Approved Official Roster & Data' : '✅ Dữ Liệu Roster Chính Thức Đã Duyệt & Công Khai')
                        : (locale === 'en' ? '⚠️ Pending Approval Roster Data Editor' : '⚠️ Dữ Liệu Roster Chờ Duyệt (Pending Data)')}
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
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE & SETTLE CUSTOM MATCHUPS */}
      {activeTab === 'custom' && (
        <div className="space-y-10">
          {/* Create Custom Form */}
          <form onSubmit={handleCreateCustomMatchup} className="glass-card p-8 rounded-3xl border border-amber-500/40 shadow-2xl space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-wider leading-normal">
              {t.customMatchupTitle}
            </h2>
            <p className="text-xs text-slate-400 leading-normal">
              {locale === 'en'
                ? 'Create a custom matchup between 2 existing NBA teams or 2 custom team names. Prediction lock time will be set EXACTLY at match start time.'
                : 'Tự tạo trận đấu mới giữa 2 đội bóng có sẵn hoặc 2 đội tùy chỉnh. Khóa dự đoán ĐÚNG GIỜ BẮT ĐẦU TRẬN ĐẤU (không khóa trước 30m).'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TEAM A */}
              <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  🔴 Team A (Home)
                </label>
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1 font-semibold">Option 1: Choose from 30 NBA Teams</span>
                  <select
                    value={customTeamAId}
                    onChange={(e) => {
                      setCustomTeamAId(e.target.value);
                      if (e.target.value) setCustomTeamAName('');
                    }}
                    className="w-full glass-input p-3 rounded-xl text-xs text-white font-bold"
                  >
                    <option value="" className="bg-slate-900">-- Select from 30 NBA Teams --</option>
                    {teams.map((tm) => (
                      <option key={tm.id} value={tm.id} className="bg-slate-900">
                        {tm.name} ({tm.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>

                {!customTeamAId && (
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1 font-semibold">Option 2: Type Custom Team A Name</span>
                    <input
                      type="text"
                      value={customTeamAName}
                      onChange={(e) => setCustomTeamAName(e.target.value)}
                      placeholder="e.g. All-Star East 2027"
                      className="w-full glass-input p-3 rounded-xl text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* TEAM B */}
              <div className="space-y-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  🔵 Team B (Away)
                </label>
                <div>
                  <span className="block text-[11px] text-slate-400 mb-1 font-semibold">Option 1: Choose from 30 NBA Teams</span>
                  <select
                    value={customTeamBId}
                    onChange={(e) => {
                      setCustomTeamBId(e.target.value);
                      if (e.target.value) setCustomTeamBName('');
                    }}
                    className="w-full glass-input p-3 rounded-xl text-xs text-white font-bold"
                  >
                    <option value="" className="bg-slate-900">-- Select from 30 NBA Teams --</option>
                    {teams.map((tm) => (
                      <option key={tm.id} value={tm.id} className="bg-slate-900">
                        {tm.name} ({tm.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>

                {!customTeamBId && (
                  <div>
                    <span className="block text-[11px] text-slate-400 mb-1 font-semibold">Option 2: Type Custom Team B Name</span>
                    <input
                      type="text"
                      value={customTeamBName}
                      onChange={(e) => setCustomTeamBName(e.target.value)}
                      placeholder="e.g. All-Star West 2027"
                      className="w-full glass-input p-3 rounded-xl text-xs font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* START TIME WITH MIN CONSTRAINT */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                🗓️ Match Start Date & Time (GMT+7) - Minimum: Now
              </label>
              <input
                type="datetime-local"
                required
                min={minDateTimeString}
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="w-full glass-input p-3.5 rounded-2xl text-xs font-bold text-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={creatingCustom}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl hover:scale-[1.01] transition duration-300"
            >
              {creatingCustom ? 'CREATING...' : '➕ CREATE CUSTOM MATCHUP NOW →'}
            </button>
          </form>

          {/* List of Created Custom Matchups */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-wider leading-normal">
              📜 CREATED CUSTOM MATCHUPS LIST
            </h2>
            <p className="text-xs text-slate-400 leading-normal">
              {locale === 'en'
                ? 'Overview of all custom matchups created by Admin.'
                : 'Danh sách tổng hợp tất cả các trận đấu tùy chỉnh do Admin tự tạo.'}
            </p>

            {customMatchupsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-semibold">
                No custom matchups created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs font-black text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Matchup</th>
                      <th className="p-3">Start Time (GMT+7)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    {customMatchupsList.map((m) => {
                      const nameA = m.teamA ? m.teamA.name : m.customTeamA;
                      const nameB = m.teamB ? m.teamB.name : m.customTeamB;
                      return (
                        <tr key={m.id}>
                          <td className="p-3 font-bold text-slate-500">#{m.id}</td>
                          <td className="p-3 font-bold text-white">
                            {nameA} vs {nameB}
                          </td>
                          <td className="p-3 text-slate-300">
                            {new Date(m.startTime).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                          </td>
                          <td className="p-3">
                            {m.isSettled ? (
                              <span className="text-emerald-400 font-bold">FINISHED</span>
                            ) : (
                              <span className="text-amber-400 font-bold">SCHEDULED</span>
                            )}
                          </td>
                          <td className="p-3 text-amber-400 font-bold">
                            {m.actualScore || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Settle Custom Matchups Inline Section */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-wider leading-normal">
              {t.settleCustomTitle}
            </h2>
            <p className="text-xs text-slate-400 leading-normal">
              {locale === 'en'
                ? 'Input final score & select winner for custom games past their start time. +1 point will be AUTOMATICALLY distributed.'
                : 'Chỉ cho phép nhập điểm & Settle đối với các trận đấu ĐÃ QUÁ GIỜ BẮT ĐẦU. Trận chưa tới giờ sẽ bị khóa.'}
            </p>

            {customMatchupsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs font-semibold">
                No custom matchups available to settle.
              </div>
            ) : (
              <div className="space-y-6">
                {customMatchupsList.map((m) => {
                  const nameA = m.teamA ? m.teamA.name : m.customTeamA;
                  const nameB = m.teamB ? m.teamB.name : m.customTeamB;
                  const now = new Date();
                  const hasStarted = now >= new Date(m.startTime);
                  const st = settleScores[m.id] || { scoreA: '', scoreB: '', winnerType: 'teamA' };

                  return (
                    <div
                      key={m.id}
                      className={`p-6 rounded-2xl border transition space-y-4 ${
                        m.isSettled
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : hasStarted
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : 'bg-slate-950/80 border-slate-800 opacity-70'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div>
                          <span className="text-xs font-mono text-slate-400">Match #{m.id}</span>
                          <h3 className="text-base font-black text-white">
                            {nameA} vs {nameB}
                          </h3>
                        </div>

                        <div>
                          {m.isSettled ? (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-xl text-xs font-black uppercase">
                              ✅ SETTLED ({m.actualScore}, Winner: {m.customWinner})
                            </span>
                          ) : hasStarted ? (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-black uppercase animate-pulse">
                              ⚡ MATCH STARTED - READY TO SETTLE
                            </span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-xl text-xs font-bold uppercase">
                              ⏳ NOT STARTED YET (Starts at {new Date(m.startTime).toLocaleTimeString()})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score Input Form for Started & Unsettled Matches */}
                      {!m.isSettled && (
                        <div className="space-y-4 pt-2">
                          {!hasStarted && (
                            <p className="text-xs text-amber-400 font-semibold italic">
                              ⚠️ Trận đấu chưa tới giờ bắt đầu. Ô nhập tỉ số sẽ tự động mở khi qua thời gian khởi tạo ({new Date(m.startTime).toLocaleString()}).
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                                Score {nameA}
                              </label>
                              <input
                                type="number"
                                disabled={!hasStarted}
                                value={st.scoreA}
                                onChange={(e) =>
                                  setSettleScores({
                                    ...settleScores,
                                    [m.id]: { ...st, scoreA: e.target.value },
                                  })
                                }
                                placeholder="108"
                                className="w-full glass-input p-3 rounded-xl text-xs font-bold text-amber-400 disabled:opacity-40"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                                Score {nameB}
                              </label>
                              <input
                                type="number"
                                disabled={!hasStarted}
                                value={st.scoreB}
                                onChange={(e) =>
                                  setSettleScores({
                                    ...settleScores,
                                    [m.id]: { ...st, scoreB: e.target.value },
                                  })
                                }
                                placeholder="102"
                                className="w-full glass-input p-3 rounded-xl text-xs font-bold text-amber-400 disabled:opacity-40"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                                Winner Selection
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  disabled={!hasStarted}
                                  onClick={() =>
                                    setSettleScores({
                                      ...settleScores,
                                      [m.id]: { ...st, winnerType: 'teamA' },
                                    })
                                  }
                                  className={`p-2.5 rounded-xl border text-[11px] font-extrabold uppercase transition ${
                                    st.winnerType === 'teamA'
                                      ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                      : 'border-slate-800 text-slate-400'
                                  } disabled:opacity-40`}
                                >
                                  👑 {nameA}
                                </button>

                                <button
                                  type="button"
                                  disabled={!hasStarted}
                                  onClick={() =>
                                    setSettleScores({
                                      ...settleScores,
                                      [m.id]: { ...st, winnerType: 'teamB' },
                                    })
                                  }
                                  className={`p-2.5 rounded-xl border text-[11px] font-extrabold uppercase transition ${
                                    st.winnerType === 'teamB'
                                      ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                                      : 'border-slate-800 text-slate-400'
                                  } disabled:opacity-40`}
                                >
                                  👑 {nameB}
                                </button>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={!hasStarted || settlingMatchupId === m.id}
                            onClick={() => handleSettleCustomInline(m.id)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-black rounded-xl text-xs uppercase shadow transition"
                          >
                            {settlingMatchupId === m.id
                              ? 'SETTLING...'
                              : '🏁 SETTLE MATCHUP & AUTO-DISTRIBUTE +1 POINT →'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MATCHUPS (SCRAPED) */}
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
                    <th className="p-4 leading-normal">Type</th>
                    <th className="p-4 leading-normal">Status</th>
                    <th className="p-4 leading-normal">Actual Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {matchups.map((m) => {
                    const nameA = m.teamA ? m.teamA.name : m.customTeamA;
                    const nameB = m.teamB ? m.teamB.name : m.customTeamB;
                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4 font-mono text-xs text-slate-500">#{m.id}</td>
                        <td className="p-4 font-bold text-white leading-normal break-words">
                          {nameA} vs {nameB}
                        </td>
                        <td className="p-4 text-xs text-slate-400 leading-normal">
                          {new Date(m.startTime).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                        </td>
                        <td className="p-4 text-xs">
                          {m.isCustom ? (
                            <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">CUSTOM</span>
                          ) : (
                            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">NBA AUTO</span>
                          )}
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: USERS & DISABLE MECHANISM */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-black text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 leading-normal">ID</th>
                <th className="p-4 leading-normal">Username</th>
                <th className="p-4 leading-normal">Email</th>
                <th className="p-4 leading-normal">Email Status</th>
                <th className="p-4 leading-normal">Account Status</th>
                <th className="p-4 leading-normal">Role</th>
                <th className="p-4 leading-normal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className={u.isDisabled ? 'bg-red-950/20' : ''}>
                  <td className="p-4 font-mono text-xs text-slate-500">#{u.id}</td>
                  <td className="p-4 font-bold text-white leading-normal break-words">{u.username}</td>
                  <td className="p-4 text-xs text-slate-400 font-mono">{u.email || '-'}</td>
                  <td className="p-4 text-xs">
                    {u.isAdmin || u.isEmailVerified ? (
                      <span className="text-emerald-400 font-bold">✓ Verified</span>
                    ) : (
                      <span className="text-amber-400 font-bold">⏳ Unverified</span>
                    )}
                  </td>
                  <td className="p-4 text-xs">
                    {u.isDisabled ? (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2.5 py-1 rounded-full font-black uppercase">
                        🚫 DISABLED
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold uppercase">
                        🟢 ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {u.isAdmin ? (
                      <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-black border border-amber-500/30 leading-normal">
                        PRO ADMIN
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold leading-normal">USER</span>
                    )}
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleToggleAdmin(u.id, u.isAdmin)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition leading-normal"
                    >
                      {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>

                    <button
                      onClick={() => handleToggleDisable(u.id, u.isDisabled)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition leading-normal ${
                        u.isDisabled
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-red-600/80 hover:bg-red-600 text-white'
                      }`}
                    >
                      {u.isDisabled ? '✅ Enable' : '🚫 Disable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: LEADERBOARD & MANUAL SCORE EDITOR */}
      {activeTab === 'leaderboard' && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white leading-normal">
                🏆 {locale === 'en' ? 'Standings & Score Editor' : 'Bảng Điểm Standings & Trình Sửa Điểm'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {locale === 'en'
                  ? 'Admin can manually adjust user score adjustment points (+/-) and save to immediately update Leaderboard totals.'
                  : 'Admin có thể tự điều chỉnh số điểm cộng/trừ của từng người chơi và bấm Lưu để cập nhật ngay vào Bảng Xếp Hạng.'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-black text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 leading-normal">Rank</th>
                  <th className="p-3 leading-normal">User</th>
                  <th className="p-3 text-center leading-normal">Regular Pts</th>
                  <th className="p-3 text-center leading-normal">Playoff Pts</th>
                  <th className="p-3 text-center leading-normal">Score Adj (+/-)</th>
                  <th className="p-3 text-right leading-normal">Total Score</th>
                  <th className="p-3 text-center leading-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {regLeaderboard.map((lb, idx) => (
                  <tr key={lb.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-black text-amber-400">#{idx + 1}</td>
                    <td className="p-3 font-bold text-white leading-normal break-words">
                      {lb.username}
                      {lb.isAdmin && <span className="ml-2 text-[10px] text-amber-400 font-mono">(Admin)</span>}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-300">{lb.regularScore}</td>
                    <td className="p-3 text-center font-mono text-slate-300">{lb.playoffScore}</td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={scoreAdjustments[lb.id] !== undefined ? scoreAdjustments[lb.id] : (lb.scoreAdjustment || 0)}
                        onChange={(e) =>
                          setScoreAdjustments({
                            ...scoreAdjustments,
                            [lb.id]: parseInt(e.target.value || '0'),
                          })
                        }
                        className="w-20 glass-input p-1.5 text-center text-xs font-bold text-amber-400 rounded-xl"
                      />
                    </td>
                    <td className="p-3 text-right font-black text-lg text-amber-400 font-mono">
                      {lb.totalScore} pts
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleSaveUserScore(lb.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow"
                      >
                        💾 {locale === 'en' ? 'Save Score' : 'Lưu Điểm'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: LOGS */}
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

      {/* TAB 7: PLAYOFF ADMIN */}
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
