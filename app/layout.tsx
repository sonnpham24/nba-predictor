import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";
import KofiFloatingWidget from "@/components/KofiFloatingWidget";
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
      { url: "/buzzerbet-icon.svg?v=2026", type: "image/svg+xml" },
      { url: "/icon.svg?v=2026", type: "image/svg+xml" },
    ],
    shortcut: "/buzzerbet-icon.svg?v=2026",
    apple: "/buzzerbet-icon.svg?v=2026",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <link rel="icon" href="/buzzerbet-icon.svg?v=2026" type="image/svg+xml" sizes="any" />
        <link rel="shortcut icon" href="/buzzerbet-icon.svg?v=2026" />
        <link rel="apple-touch-icon" href="/buzzerbet-icon.svg?v=2026" />
      </head>
      <body className="antialiased bg-[#07090e] bg-stadium-mesh text-slate-100 min-h-screen flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans transition-colors duration-300">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastProvider />
            <KofiFloatingWidget />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
