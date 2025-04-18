# 🏀 NBA Playoff Predictor 2025

Dự án web giúp người chơi dự đoán kết quả các vòng đấu trong NBA Playoffs 2025.  
Điểm số sẽ được tính dựa trên độ chính xác của dự đoán.

---

## 🚀 Tính năng nổi bật

- Đăng ký / Đăng nhập tài khoản người dùng
- Dự đoán đội thắng và tỷ số từng cặp đấu
- Bảng xếp hạng điểm số theo người chơi
- Thống kê toàn giải: độ chính xác, biểu đồ, trận nào nhiều người đoán đúng
- Trang quản trị (Admin) để:
  - Cập nhật kết quả thật từng trận
  - Đặt deadline (lockTime) từng trận
  - Tạo vòng đấu tiếp theo
- Thông báo khi có kết quả mới (toasts)
- Responsive cho mobile & desktop

---

## 💡 Cách tính điểm

- ✅ Đúng đội & đúng tỷ số: `3 điểm`
- ✅ Đúng đội, lệch đúng 1 trận: `2 điểm`
- ✅ Đúng đội, lệch >1 trận: `1 điểm`
- ❌ Sai đội: `0 điểm`

---

## 🛠️ Công nghệ sử dụng

- **Next.js 14** (App Router)
- **Tailwind CSS** + `shadcn/ui` cho UI
- **Prisma + SQLite** (hoặc PostgreSQL) cho DB
- **JWT** để xác thực người dùng
- **Vercel** để deploy
- `recharts` để hiển thị biểu đồ thống kê

---

## ⚙️ Cài đặt local
git clone https://github.com/your-username/nba-predictor.git
cd nba-predictor
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev

- Tạo file .env với nội dung:

DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret"

- Tài khoản mặc định

Username: admin
Password: admin123

- Deploy trên Vercel
Import repo từ GitHub vào https://vercel.com
Set biến môi trường:

DATABASE_URL
JWT_SECRET

Click Deploy

- Demo
(Cập nhật sau khi deploy)
nba-predictor.vercel.app

- Liên hệ
Dev: Son Pham (phamcongson297@gmail.com)

Dự án cá nhân, phi thương mại
