'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import toast from 'react-hot-toast';

export default function AuthForm() {
  const { t, locale } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Eye icon password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email verification step states
  const [verifyingEmailStep, setVerifyingEmailStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      if (!email || !email.includes('@')) {
        toast.error(locale === 'en' ? 'Please enter a valid email address' : 'Vui lòng nhập địa chỉ email hợp lệ!');
        return;
      }
      if (password !== confirmPassword) {
        toast.error(locale === 'en' ? 'Passwords do not match!' : 'Mật khẩu xác nhận không khớp!');
        return;
      }
    }

    setLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (locale === 'en' ? 'Operation failed' : 'Thao tác thất bại'));
      }

      if (isLogin) {
        toast.success(locale === 'en' ? '🎉 Signed in successfully!' : '🎉 Đăng nhập thành công!');
        router.push('/regular-season');
        router.refresh();
      } else {
        if (data.requiresEmailVerification) {
          toast.success(
            data.message ||
              (locale === 'en'
                ? '📧 OTP Verification code sent to your email!'
                : '📧 Mã OTP xác thực đã được gửi tới email của bạn!')
          );
          setVerifyingEmailStep(true);
        } else {
          toast.success(locale === 'en' ? '✅ Registration successful! Please sign in.' : '✅ Đăng ký thành công! Vui lòng đăng nhập.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP Verification failed');

      toast.success(data.message || (locale === 'en' ? 'Email verified!' : 'Xác thực email thành công!'));
      setVerifyingEmailStep(false);
      setIsLogin(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-3xl">🏀</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black gradient-text-gold tracking-tight leading-normal break-words">
            {verifyingEmailStep ? t.emailVerifyTitle : isLogin ? t.authSignInTitle : t.authSignUpTitle}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2 font-medium leading-normal break-words">
            {verifyingEmailStep ? `${t.emailVerifySub} ${email}` : isLogin ? t.authSignInSub : t.authSignUpSub}
          </p>
        </div>

        {/* OTP Email Verification Step */}
        {verifyingEmailStep ? (
          <form onSubmit={handleVerifyOtp} className="space-y-5 relative z-10">
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-center text-xs font-semibold text-emerald-400 leading-normal">
              📧 {locale === 'en' ? 'Check your email inbox for the 6-digit OTP code sent from vnbrayvn@gmail.com' : 'Vui lòng kiểm tra hòm thư Email của bạn để lấy mã OTP 6 chữ số được gửi từ vnbrayvn@gmail.com'}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2 leading-normal">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full glass-input text-center text-2xl font-mono tracking-widest py-3 rounded-2xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition duration-300 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-950 border-t-transparent"></div>
              ) : (
                <span>{t.btnVerifyAction}</span>
              )}
            </button>
          </form>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-8 relative z-10">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`py-2.5 rounded-xl text-xs font-extrabold tracking-wider transition duration-300 ${
                  isLogin ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.authSignInTitle}
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`py-2.5 rounded-xl text-xs font-extrabold tracking-wider transition duration-300 ${
                  !isLogin ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.authSignUpTitle}
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2 leading-normal">
                  {t.usernameLabel}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                    👤
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.usernamePlaceholder}
                    className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Email Input Field on Register */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2 leading-normal">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                      📧
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Password Input with Eye Icon Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2 leading-normal">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                    🔒
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full glass-input pl-10 pr-10 py-3 rounded-2xl text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input with Eye Icon Toggle on Register */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2 leading-normal">
                    {t.confirmPasswordLabel}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
                      🔒
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.confirmPasswordPlaceholder}
                      className="w-full glass-input pl-10 pr-10 py-3 rounded-2xl text-sm font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition duration-300 flex items-center justify-center space-x-2 mt-4"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-950 border-t-transparent"></div>
                ) : (
                  <span>{isLogin ? t.btnSignInAction : t.btnSignUpAction}</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
