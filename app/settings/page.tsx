'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'password'>('profile');
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([
        fetch('/api/me/profile'),
        fetch('/api/regular/teams'),
      ]);

      if (uRes.ok) {
        const userData = await uRes.json();
        setUser(userData);
        setDisplayName(userData.displayName || '');
        setBio(userData.bio || '');
        setFavoriteTeamId(userData.favoriteTeamId ? userData.favoriteTeamId.toString() : '');
        setAvatarPreview(userData.avatar || null);
      }
      if (tRes.ok) {
        setTeams(await tRes.json());
      }
    } catch (err: any) {
      toast.error('Error loading settings');
    } finally {
      setLoading(false);
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
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      toast.success(locale === 'en' ? '✅ Profile updated successfully!' : '✅ Đã lưu thông tin hồ sơ thành công!');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) {
      toast.error(locale === 'en' ? 'Please select an image file first' : 'Vui lòng chọn 1 file ảnh trước!');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', avatarFile);

    try {
      const res = await fetch('/api/me/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Avatar upload failed');

      toast.success(locale === 'en' ? '🖼️ Avatar uploaded successfully!' : '🖼️ Tải ảnh đại diện thành công!');
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
      toast.error(locale === 'en' ? 'New passwords do not match!' : 'Mật khẩu mới xác nhận không khớp!');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await fetch('/api/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword, confirmNewPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      toast.success(data.message || (locale === 'en' ? 'Password updated!' : 'Đã đổi mật khẩu thành công!'));
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
      <div className="max-w-4xl mx-auto py-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-black text-amber-400 uppercase tracking-widest mb-3">
          <span>⚙️ ACCOUNT SETTINGS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black gradient-text-gold tracking-tight uppercase leading-normal break-words">
          {t.settingsTitle}
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-medium leading-normal break-words">
          {t.settingsSub}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800 pb-3 mb-8 scrollbar-none justify-center">
        {[
          { id: 'profile', label: t.tabProfile },
          { id: 'avatar', label: t.tabAvatar },
          { id: 'password', label: t.tabPassword },
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

      {/* TAB 1: PROFILE & FAVORITE TEAM */}
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
              {t.bioLabel}
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t.bioPlaceholder}
              className="w-full glass-input p-3.5 rounded-2xl text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 leading-normal">
              🏀 {t.favoriteTeamLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-2 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <div
                onClick={() => setFavoriteTeamId('')}
                className={`p-3 rounded-xl cursor-pointer transition border text-center flex flex-col items-center justify-center ${
                  favoriteTeamId === ''
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold'
                    : 'border-slate-800 text-slate-500 hover:bg-slate-900'
                }`}
              >
                <span className="text-xs">{t.noSupportedTeam}</span>
              </div>
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setFavoriteTeamId(team.id.toString())}
                  className={`p-3 rounded-xl cursor-pointer transition border text-center flex flex-col items-center justify-between ${
                    favoriteTeamId === team.id.toString()
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400 font-bold shadow-lg scale-105'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain mb-1 drop-shadow" />
                  <span className="text-[11px] font-bold leading-normal break-words">{team.name}</span>
                </div>
              ))}
            </div>
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
          <div className="relative inline-block">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-36 h-36 rounded-full object-cover border-4 border-amber-500 shadow-2xl bg-slate-950 mx-auto"
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-4xl flex items-center justify-center border-4 border-amber-400 shadow-2xl mx-auto">
                {user?.username?.substring(0, 2).toUpperCase() || 'NB'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 leading-normal">
              Select Avatar Image File (PNG, JPG, WEBP)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full max-w-sm mx-auto glass-input p-3 rounded-2xl text-xs text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={uploadingAvatar || !avatarFile}
            className="w-full max-w-sm mx-auto py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase shadow-xl hover:scale-[1.02] transition duration-300 leading-normal"
          >
            {uploadingAvatar ? 'UPLOADING...' : t.btnUploadAvatar}
          </button>
        </form>
      )}

      {/* TAB 3: PASSWORD CHANGE */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-5 max-w-md mx-auto">
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
    </div>
  );
}
