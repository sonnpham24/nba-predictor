import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

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
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="antialiased bg-[#07090e] bg-stadium-mesh text-slate-100 min-h-screen flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans transition-colors duration-300">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
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
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
