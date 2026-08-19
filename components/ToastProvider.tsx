'use client';

import { Toaster, ToastBar, toast } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: '#0f172a',
          color: '#fff',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          padding: '12px 18px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          fontSize: '14px',
          fontWeight: '600',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-center space-x-3 w-full">
              {icon}
              <div className="flex-1 font-semibold leading-normal">{message}</div>
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  aria-label="Close Toast"
                  className="ml-3 text-slate-400 hover:text-white font-bold bg-slate-800 hover:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs transition border border-slate-700"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
