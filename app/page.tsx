'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import KofiButton from '@/components/KofiButton';

export default function LandingPage() {
  const { t, locale } = useLanguage();
  const [user, setUser] = useState<{ username: string } | null>(null);

  // Interactive Demo Pack States for Landing Page Conversion Teaser
  const [demoPackOpened, setDemoPackOpened] = useState<boolean>(false);
  const [demoShaking, setDemoShaking] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  const handleOpenDemoPack = () => {
    if (demoShaking || demoPackOpened) return;
    setDemoShaking(true);
    setTimeout(() => {
      setDemoShaking(false);
      setDemoPackOpened(true);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20">
      {/* Keyframe animations for demo pack teaser */}
      <style jsx global>{`
        @keyframes sunRaysRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes packShakeIntense {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1.04); }
          10% { transform: translate(-14px, -3px) rotate(-6deg) scale(1.08); }
          20% { transform: translate(14px, 3px) rotate(6deg) scale(1.1); }
          30% { transform: translate(-12px, 3px) rotate(-5deg) scale(1.08); }
          40% { transform: translate(12px, -3px) rotate(5deg) scale(1.1); }
          50% { transform: translate(-10px, -2px) rotate(-4deg) scale(1.06); }
          60% { transform: translate(10px, 2px) rotate(4deg) scale(1.08); }
          70% { transform: translate(-8px, 2px) rotate(-3deg) scale(1.05); }
          80% { transform: translate(8px, -2px) rotate(3deg) scale(1.06); }
          90% { transform: translate(-4px, 1px) rotate(-1.5deg) scale(1.03); }
        }
        .animate-sun-rays-landing {
          animation: sunRaysRotate 10s linear infinite;
        }
        .animate-pack-shake-landing {
          animation: packShakeIntense 0.35s ease infinite !important;
        }
      `}</style>

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 px-5 py-2 rounded-full text-xs font-black text-amber-300 uppercase tracking-widest shadow-lg animate-pulse">
          <span>🔥 MINIGAME HOOPICK DRAFT VỪA RA MẮT — DRAFT 66 ĐỘI BÓNG NBA!</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none uppercase">
          <span className="gradient-text-gold">SẢNH DỰ ĐOÁN NBA</span>
          <br />
          <span className="text-white text-3xl sm:text-5xl font-extrabold mt-2 block">
            & MINIGAME BỐC THẺ HUYỀN THOẠI
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-medium leading-normal">
          {locale === 'en'
            ? 'Predict daily NBA matchups, draft 66 historical NBA rosters in Hoopick Minigame, vote on Yes/No prop bets, and conquer the championship!'
            : 'Dự đoán trận đấu NBA hàng ngày, bốc thẻ 66 đội bóng NBA lịch sử trong Hoopick Draft, tham gia kèo phụ Yes/No và chinh phục Cúp Vô Địch NBA Finals!'}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {user ? (
            <>
              <Link
                href="/hoopick"
                className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 hover:brightness-110 text-white font-black rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-rose-500/30 hover:scale-105 transition duration-300 border border-amber-300"
              >
                🎮 {locale === 'en' ? 'Play Hoopick Draft Now →' : 'Vào Chơi Hoopick Draft Ngay →'}
              </Link>
              <Link
                href="/regular-season"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold rounded-2xl text-sm border border-slate-700 shadow-lg hover:scale-105 transition duration-300"
              >
                🏀 {locale === 'en' ? 'Regular Season Predictor' : 'Vào Sảnh Dự Đoán Vòng Bảng'}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="w-full sm:w-auto px-9 py-4.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 hover:brightness-110 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-amber-500/30 hover:scale-105 transition duration-300"
              >
                🔥 {locale === 'en' ? 'CREATE FREE ACCOUNT (10 SECONDS) →' : 'TẠO TÀI KHOẢN MIỄN PHÍ (10 GIÂY) →'}
              </Link>
              <Link
                href="/auth"
                className="w-full sm:w-auto px-8 py-4.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl text-sm border border-slate-700 shadow-lg hover:scale-105 transition duration-300"
              >
                🔑 {locale === 'en' ? 'Sign In to Account' : 'Đăng Nhập Tài Khoản'}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* INTERACTIVE DEMO PACK TEASER SHOWCASE FOR GUEST CONVERSION */}
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 shadow-2xl text-center space-y-6 relative overflow-hidden">
        <div className="space-y-2">
          <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest">
            ✨ DEMO INTERACTIVE TEASER — BẤM MỞ THỬ GÓI BÀI NGAY TRÊN TRANG CHỦ!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {locale === 'en' ? 'Try Opening an Icon NBA Draft Pack!' : 'Bốc Thử Thẻ Đội Hình NBA Huyền Thoại!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            {locale === 'en'
              ? 'Click the draft pack below to experience the intense shake & Sun Rays hype effect!'
              : 'Bấm trực tiếp vào Gói Bài bên dưới để trải nghiệm hiệu ứng rung lắc & tỏa sáng rực rỡ!'}
          </p>
        </div>

        {/* Clickable Physical Demo Pack Card */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div
            onClick={handleOpenDemoPack}
            className={`w-52 h-68 rounded-3xl cursor-pointer bg-gradient-to-b from-white via-slate-100 to-slate-200 border-4 border-slate-300 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 z-10 ${
              demoShaking ? 'animate-pack-shake-landing' : ''
            } ${demoPackOpened ? 'ring-4 ring-amber-400 shadow-amber-500/50' : ''}`}
          >
            {/* Background Sun Rays Light Beams */}
            {demoShaking && (
              <div className="absolute -inset-32 opacity-70 pointer-events-none flex items-center justify-center overflow-hidden">
                <svg className="w-[700px] h-[700px] animate-sun-rays-landing" viewBox="0 0 200 200">
                  <g fill="url(#demoSunRayGrad)">
                    <path d="M100 0 L108 92 L200 100 L108 108 L100 200 L92 108 L0 100 L92 92 Z" />
                    <path d="M100 0 L108 92 L200 100 L108 108 L100 200 L92 108 L0 100 L92 92 Z" transform="rotate(45 100 100)" />
                  </g>
                  <defs>
                    <linearGradient id="demoSunRayGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}

            {demoPackOpened ? (
              <div className="space-y-3 z-10 px-3 animate-scale-in text-center">
                <span className="bg-gradient-to-r from-amber-400 to-rose-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow">
                  ICON • 99 OVR
                </span>
                <div className="w-16 h-16 rounded-full bg-red-700 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md border-2 border-white">
                  CHI
                </div>
                <div className="font-black text-slate-900 text-base leading-tight uppercase">
                  Michael Jordan
                </div>
                <div className="text-[10px] font-bold text-slate-600 font-mono">
                  '96 Chicago Bulls
                </div>
              </div>
            ) : (
              <div className="space-y-3 z-10 text-slate-900">
                <div className="text-5xl animate-bounce">📦</div>
                <div className="font-black font-mono text-lg tracking-wider">
                  {demoShaking ? '⚡ OPENING PACK...' : 'CLICK TO OPEN'}
                </div>
                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                  1996 BULLS ROSTER
                </p>
              </div>
            )}
          </div>

          {/* Guest CTA Popup upon opening Demo Pack */}
          {demoPackOpened && (
            <div className="mt-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 max-w-md mx-auto space-y-3 animate-fade-in">
              <div className="text-xs font-black text-amber-300 uppercase">
                🎉 BẠN ĐÃ RÚT ĐƯỢC ICON MICHAEL JORDAN (99 OVR)!
              </div>
              <p className="text-xs text-slate-300">
                Đăng ký tài khoản miễn phí chỉ mất 10 giây để giữ cầu thủ này, hoàn thiện đội hình Starting 5 và dẫn dắt đội bóng vô địch NBA!
              </p>
              <Link
                href="/auth"
                className="inline-block px-6 py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition"
              >
                🚀 ĐĂNG KÝ MIỄN PHÍ ĐỂ CHƠI NGAY →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Feature Grid Section (4 Core Features) */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            FEATURE HIGHLIGHTS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {locale === 'en' ? 'Why Join BuzzerBet Community?' : 'Tính Năng Nổi Bật Tại BuzzerBet'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1: Minigame Hoopick Draft */}
          <Link
            href={user ? '/hoopick' : '/auth'}
            className="glass-card p-6 rounded-3xl border border-amber-500/30 hover:border-amber-400 transition duration-300 flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                🎮
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  HOT MINIGAME
                </span>
                <h3 className="text-lg font-black text-white mt-2 mb-2">Hoopick Draft Minigame</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Bốc thẻ 66 đội bóng NBA lịch sử, ghép Starting 5 tối ưu và thi đấu Playoff Best-of-7 với bảng điểm nhảy 80 mốc kịch tính!
                </p>
              </div>
            </div>
            <div className="pt-4 text-xs font-black text-amber-400 group-hover:translate-x-1 transition">
              {user ? 'Chơi Ngay →' : 'Khóa Quyền (Đăng Nhập) →'}
            </div>
          </Link>

          {/* Feature 2: Daily Regular Season Predictions */}
          <Link
            href={user ? '/regular-season' : '/auth'}
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                📅
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-2">{t.landingFeat1Title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.landingFeat1Desc}</p>
              </div>
            </div>
            <div className="pt-4 text-xs font-black text-amber-400 group-hover:translate-x-1 transition">
              {user ? 'Dự Đoán Ngay →' : 'Khóa Quyền (Đăng Nhập) →'}
            </div>
          </Link>

          {/* Feature 3: Yes/No Prop Bets */}
          <Link
            href={user ? '/regular-season' : '/auth'}
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                🎲
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-2">{t.landingFeat2Title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.landingFeat2Desc}</p>
              </div>
            </div>
            <div className="pt-4 text-xs font-black text-blue-400 group-hover:translate-x-1 transition">
              {user ? 'Tham Gia Kèo →' : 'Khóa Quyền (Đăng Nhập) →'}
            </div>
          </Link>

          {/* Feature 4: Global Leaderboard */}
          <Link
            href={user ? '/stats' : '/auth'}
            className="glass-card p-6 rounded-3xl border border-white/10 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between group hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition">
                🏆
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-2">{t.landingFeat3Title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t.landingFeat3Desc}</p>
              </div>
            </div>
            <div className="pt-4 text-xs font-black text-emerald-400 group-hover:translate-x-1 transition">
              {user ? 'Xem Bảng Xếp Hạng →' : 'Khóa Quyền (Đăng Nhập) →'}
            </div>
          </Link>
        </div>
      </div>

      {/* Live Stats Counter Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-3xl font-black text-amber-400">66+</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">Đội NBA Lịch Sử</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-3xl font-black text-orange-400">80</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">Mốc Live Score Ticking</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-3xl font-black text-emerald-400">100%</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">Miễn Phí Tham Gia</div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-3xl font-black text-purple-400">2027</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase">Mùa Giải NBA Hub</div>
        </div>
      </div>

      {/* Ko-fi Support Banner Section */}
      <KofiButton variant="banner" />
    </div>
  );
}
