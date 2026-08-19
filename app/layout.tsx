import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "NBA Predictor 2025 - Ultimate Sports Experience",
  description: "Dự đoán kết quả NBA Regular Season và Playoffs đẳng cấp hàng đầu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-[#07090e] bg-stadium-mesh text-slate-100 min-h-screen flex flex-col selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#fff',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '12px 20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            },
          }}
        />
      </body>
    </html>
  );
}
