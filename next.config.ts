import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Tắt lỗi ESLint trong quá trình build (Vercel)
  },
  // Bạn có thể thêm config khác ở đây nếu cần
};

export default nextConfig;

