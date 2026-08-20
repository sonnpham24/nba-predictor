import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BuzzerBet 2026-27 - NBA Prediction Hub",
  description: "Dự đoán kết quả NBA Regular Season, Playoffs và Yes/No prop bets cùng cộng đồng BuzzerBet.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=bb2", sizes: "any" },
      { url: "/favicon-32x32.png?v=bb2", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png?v=bb2", type: "image/png", sizes: "16x16" },
      { url: "/buzzerbet-icon.svg?v=bb2", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=bb2",
    apple: "/apple-touch-icon.png?v=bb2",
  },
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
            <ToastProvider />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
