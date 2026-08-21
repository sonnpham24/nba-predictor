'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface KofiModalProps {
  isOpen: boolean;
  onClose: () => void;
  kofiUsername?: string;
  kofiUrl?: string;
}

export default function KofiModal({
  isOpen,
  onClose,
  kofiUsername = process.env.NEXT_PUBLIC_KOFI_USERNAME || 'buzzerbet',
  kofiUrl = process.env.NEXT_PUBLIC_KOFI_URL || 'https://ko-fi.com/buzzerbet',
}: KofiModalProps) {
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'kofi' | 'qr'>('kofi');

  if (!isOpen) return null;

  // Official Ko-fi Tip Panel Embed URL (with preview=true & embed=true parameters)
  const officialTipWidgetUrl = `https://ko-fi.com/${kofiUsername}/?hidefeed=true&widget=true&embed=true&preview=true`;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card max-w-xl w-full p-5 sm:p-7 rounded-3xl border border-sky-500/40 shadow-2xl relative overflow-hidden space-y-5 animate-scale-in max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-sky-500/30">
              ☕
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-normal">
                {locale === 'en' ? 'Support NBA Predictor' : 'Ủng Hộ Dự Án NBA Predictor'}
              </h3>
              <p className="text-xs text-slate-400">
                {locale === 'en' ? 'Direct donation via Ko-fi (No login required)' : 'Donate trực tiếp qua Ko-fi (Không cần đăng nhập)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold flex items-center justify-center border border-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Support Type Tabs (Official Ko-fi Tip Panel vs VietQR) */}
        <div className="flex space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('kofi')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center space-x-2 ${
              activeTab === 'kofi'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>☕</span>
            <span>{locale === 'en' ? 'Ko-fi / Card / PayPal' : 'Ko-fi / Thẻ / PayPal'}</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center space-x-2 ${
              activeTab === 'qr'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📱</span>
            <span>{locale === 'en' ? 'VietQR / MoMo (VN)' : 'Quét QR Ngân Hàng / MoMo'}</span>
          </button>
        </div>

        {/* Tab 1: Official Ko-fi Embed Tip Panel */}
        {activeTab === 'kofi' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-white shadow-inner min-h-[580px]">
              <iframe
                id="kofiframe"
                src={officialTipWidgetUrl}
                style={{ border: 'none', width: '100%', minHeight: '580px', background: '#f9f9f9' }}
                title={kofiUsername}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-1">
              <span>
                🔒 {locale === 'en' ? 'Direct donation powered by Ko-fi' : 'Thanh toán trực tiếp bảo mật qua Ko-fi'}
              </span>
              <a
                href={kofiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline font-bold flex items-center space-x-1"
              >
                <span>{locale === 'en' ? 'Open buzzerbet on Ko-fi.com ↗' : 'Mở trang buzzerbet trên Ko-fi.com ↗'}</span>
              </a>
            </div>
          </div>
        )}

        {/* Tab 2: VietQR / Bank QR Code */}
        {activeTab === 'qr' && (
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {locale === 'en' ? 'Scan QR Code with Banking App or MoMo' : 'Quét Mã QR Bằng App Ngân Hàng Hoặc MoMo'}
            </h4>

            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl inline-block">
                <img
                  src={`https://img.vietqr.io/image/MB-0348704207-compact2.png?amount=50000&addInfo=Donate%20NBA%20Predictor&accountName=PHAM%20CONG%20SON`}
                  alt="VietQR Donate"
                  className="w-56 h-56 object-contain"
                />
              </div>
            </div>

            <div className="text-xs text-slate-300 font-mono space-y-1">
              <p>Ngân hàng: <strong className="text-white">MBBank (MB)</strong></p>
              <p>Số tài khoản: <strong className="text-amber-400 font-bold">0348704207</strong></p>
              <p>Chủ tài khoản: <strong className="text-white">PHAM CONG SON</strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
