'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import KofiButton from '@/components/KofiButton';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'history' | 'password'>('profile');
  const [teams, setTeams] = useState<any[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteTeamId, setFavoriteTeamId] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar Upload States
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // History Tab States
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory(historyPage);
    }
  }, [activeTab, historyPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([
        fetch('/api/me/profile'),
        fetch('/api/regular/teams'),
      ]);

      if (uRes.ok) {
        const uData = await uRes.json();
        setUser(uData);
        setDisplayName(uData.displayName || '');
        setBio(uData.bio || '');
        setFavoriteTeamId(uData.favoriteTeamId ? String(uData.favoriteTeamId) : '');
      }

      if (tRes.ok) {
        const tData = await tRes.json();
        setTeams(tData);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading settings data');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (page: number) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/me/predictions?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data.predictions || []);
        setHistoryTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      toast.error('Error loading prediction history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          bio,
          favoriteTeamId: favoriteTeamId ? parseInt(favoriteTeamId) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      toast.success(locale === 'en' ? '✅ Profile updated successfully!' : '✅ Cập nhật thông tin thành công!');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(locale === 'en' ? 'Image file size must be less than 5MB' : 'Kích thước ảnh phải nhỏ hơn 5MB');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) {
      toast.error(locale === 'en' ? 'Please select an image file first' : 'Vui lòng chọn 1 tệp ảnh');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const res = await fetch('/api/me/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload avatar');

      toast.success(locale === 'en' ? '✅ Avatar uploaded successfully!' : '✅ Tải ảnh đại diện thành công!');
      setAvatarFile(null);
      setAvatarPreview(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error(locale === 'en' ? 'New passwords do not match' : 'Mật khẩu mới không trùng khớp');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch('/api/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      toast.success(locale === 'en' ? '✅ Password changed successfully!' : '✅ Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest mb-3">
          <span>⚙️ ACCOUNT PREFERENCES</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white leading-normal break-words">
          {t.settingsTitle}
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium leading-normal break-words">
          {t.settingsSub}
        </p>
      </div>

      {/* Profile Overview Card */}
      {user && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 shadow-xl">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-2xl flex items-center justify-center border-2 border-amber-400 shadow-lg">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h2 className="text-xl font-black text-white leading-normal break-words">
                {user.displayName || user.username}
              </h2>
              {user.isAdmin && (
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                  {t.proAdmin}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">@{user.username} • {user.email || 'No email'}</p>
            {user.favoriteTeam && (
              <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
                <img src={user.favoriteTeam.logo} alt={user.favoriteTeam.name} className="w-5 h-5 object-contain" />
                <span className="text-xs font-bold text-amber-400">{user.favoriteTeam.name}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-3 scrollbar-none">
        {[
          { id: 'profile', label: t.tabProfile },
          { id: 'avatar', label: t.tabAvatar },
          { id: 'history', label: t.tabHistory },
          { id: 'password', label: t.tabPassword },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE & SUPPORTED TEAM */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 leading-normal">
              {t.displayNameLabel}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.displayNamePlaceholder}
              className="w-full glass-input p-3.5 rounded-2xl text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 leading-normal">
              {t.favoriteTeamLabel}
            </label>
            <select
              value={favoriteTeamId}
              onChange={(e) => setFavoriteTeamId(e.target.value)}
              className="w-full glass-input p-3.5 rounded-2xl text-sm font-semibold text-white"
            >
              <option value="" className="bg-slate-900">{t.selectFavoriteTeam}</option>
              {teams.map((tm) => (
                <option key={tm.id} value={tm.id} className="bg-slate-900">
                  {tm.name} ({tm.abbreviation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 leading-normal">
              {t.bioLabel}
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t.bioPlaceholder}
              className="w-full glass-input p-3.5 rounded-2xl text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl hover:scale-[1.02] transition duration-300 leading-normal"
          >
            {savingProfile ? 'SAVING...' : t.btnSaveProfile}
          </button>
        </form>
      )}

      {/* TAB 2: AVATAR UPLOAD */}
      {activeTab === 'avatar' && (
        <form onSubmit={handleUploadAvatar} className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Preview"
                className="w-32 h-32 rounded-3xl object-cover border-4 border-amber-500 shadow-2xl"
              />
            ) : user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-amber-500/50 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-4xl flex items-center justify-center border-4 border-amber-400 shadow-xl">
                {user?.username?.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <label className="inline-block px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black cursor-pointer border border-slate-700 transition">
                <span>📁 Select Image File (PNG, JPG, WEBP &lt; 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploadingAvatar || !avatarFile}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 disabled:opacity-40 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl hover:scale-[1.02] transition duration-300 leading-normal"
          >
            {uploadingAvatar ? 'UPLOADING...' : t.btnUploadAvatar}
          </button>
        </form>
      )}

      {/* TAB 3: PREDICTION HISTORY & PAGINATION */}
      {activeTab === 'history' && (
        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white leading-normal">
              {t.historyTitle}
            </h2>
          </div>

          {loadingHistory ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : historyList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm font-medium">
              {t.noPredictionsYet}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                {historyList.map((p) => {
                  const teamA = p.matchup.teamA ? p.matchup.teamA.name : (p.matchup.customTeamA || 'Team A');
                  const teamB = p.matchup.teamB ? p.matchup.teamB.name : (p.matchup.customTeamB || 'Team B');
                  const predictedName = p.predictedWinner ? p.predictedWinner.name : (p.customPredictedWinner || 'N/A');
                  const actualWinnerName = p.matchup.actualWinner ? p.matchup.actualWinner.name : (p.matchup.customWinner || null);

                  const isFinished = p.matchup.status === 'FINISHED';
                  const isCorrect = isFinished && actualWinnerName && actualWinnerName.toLowerCase() === predictedName.toLowerCase();

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                    >
                      <div className="space-y-1">
                        <span className="text-slate-500 text-[10px]">
                          Match #{p.matchup.id} • {new Date(p.matchup.startTime).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}
                        </span>
                        <div className="font-bold text-white text-sm font-sans">
                          {teamA} vs {teamB}
                        </div>
                        <div className="text-slate-300">
                          Your Pick: <strong className="text-amber-400">{predictedName}</strong>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {isFinished ? (
                          isCorrect ? (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-xl font-black text-xs">
                              ✅ CORRECT (+1 PT)
                            </span>
                          ) : (
                            <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-xl font-black text-xs">
                              ❌ INCORRECT (0 PT)
                            </span>
                          )
                        ) : (
                          <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-xl font-bold text-xs">
                            ⏳ PENDING RESULT
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {historyTotalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-mono">
                    {t.pageOf} {historyPage} / {historyTotalPages}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
                    >
                      {t.prevPage}
                    </button>
                    <button
                      disabled={historyPage >= historyTotalPages}
                      onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
                    >
                      {t.nextPage}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PASSWORD CHANGE */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 leading-normal">
              {t.oldPasswordLabel}
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input p-3.5 rounded-2xl text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 leading-normal">
              {t.newPasswordLabel}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input p-3.5 rounded-2xl text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 leading-normal">
              {t.confirmNewPasswordLabel}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full glass-input p-3.5 rounded-2xl text-sm font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl hover:scale-[1.02] transition duration-300 leading-normal mt-4"
          >
            {updatingPassword ? 'UPDATING...' : t.btnChangePassword}
          </button>
        </form>
      )}

      {/* KO-FI SUPPORT BANNER */}
      <KofiButton variant="banner" />
    </div>
  );
}
