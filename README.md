# Website Gia Phả & Lịch Kỵ Nhật Dòng Họ (Family Tree App)

Ứng dụng quản lý gia phả dòng họ, xem cây phả hệ trực quan tương tác (Zoom & Pan), tra cứu thành viên và tự động tính toán, nhắc lịch **ngày giỗ (kỵ nhật) âm lịch** quy đổi sang dương lịch hàng năm.

---

## 🚀 Công Nghệ Sử Dụng

- **Framework**: Next.js 14+ (App Router), React 19, TypeScript
- **Styling**: TailwindCSS
- **Database**: SQLite (phát triển local) & Vercel Postgres / Supabase (môi trường production)
- **ORM**: Prisma ORM
- **Xử lý Lịch Âm**: `lunar-typescript` (Thư viện tính lịch âm dương chuẩn xác cho Việt Nam)
- **Icons**: `lucide-react`

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
E:\ngaygio\
├── app/
│   ├── (main)/
│   │   ├── layout.tsx            # Layout chung chứa Navbar, Sidebar và Footer
│   │   ├── page.tsx              # Trang chủ: Thống kê gia tộc, lời tổ tiên dạy, kỵ nhật 30 ngày tới
│   │   ├── tree/
│   │   │   └── page.tsx          # Bản đồ cây gia phả phóng to/thu nhỏ toàn màn hình
│   │   ├── members/
│   │   │   ├── page.tsx          # Tra cứu, tìm kiếm, lọc danh sách thành viên theo chi/đời
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Form thêm thành viên mới vào gia hệ
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Xem hồ sơ chi tiết, gia phả bố mẹ/vợ chồng/con cái & tiểu sử cuộc đời
│   │   │       └── edit/
│   │   │           └── page.tsx  # Chỉnh sửa thông tin thành viên
│   │   └── anniversaries/
│   │       ├── page.tsx          # Lịch kỵ nhật liệt kê theo thứ tự thời gian dương lịch năm nay
│   │       └── calendar/
│   │           └── page.tsx      # Xem ngày giỗ trực quan theo ô lưới lịch tháng
│   ├── api/
│   │   ├── members/              # API GET/POST quản lý thành viên
│   │   │   └── [id]/             # API GET/PUT/DELETE thành viên theo ID
│   │   └── anniversaries/        # API tính toán & xuất danh sách kỵ nhật âm-dương lịch
│   ├── layout.tsx                # Root layout
│   └── globals.css               # CSS & Tailwind configurations
├── components/
│   ├── family-tree/
│   │   └── TreeViewer.tsx        # Trực quan hóa cây bằng SVG tương tác (Zoom/Pan/Collapse/Highlight)
│   ├── MemberActions.tsx         # Component xử lý thao tác xóa/sửa của Client
│   ├── MemberForm.tsx            # Form nhập/sửa thành viên dùng chung
│   ├── Navbar.tsx                # Thanh điều hướng chính responsive
│   └── MembersListClient.tsx     # Bộ lọc tìm kiếm thành viên phía Client
├── lib/
│   ├── prisma.ts                 # Khởi tạo instance kết nối Prisma Client duy nhất
│   ├── lunar.ts                  # Hàm tiện ích quy đổi lịch & tính ngày giỗ sắp tới
│   └── utils.ts                  # Hàm định dạng cơ bản
├── prisma/
│   ├── dev.db                    # Database SQLite phát triển cục bộ
│   ├── schema.prisma             # Định nghĩa cấu trúc bảng (Member, Marriage, DeathAnniversary)
│   └── seed.js                   # Tập lệnh nạp sẵn 4 đời dòng họ Nguyễn Tộc làm mẫu
├── vercel.json                   # File cấu hình deploy Vercel
├── .env.example                  # Khai báo các biến môi trường mẫu
└── package.json
```

---

## 💻 Hướng Dẫn Chạy Dưới Local

Làm theo các bước sau để chạy thử nghiệm dự án trên máy tính cá nhân của bạn:

### 1. Cài đặt các gói phụ thuộc
Mở terminal tại thư mục dự án và chạy:
```bash
npm install
```

### 2. Thiết lập cơ sở dữ liệu SQLite local
Tạo file `.env` từ `.env.example` và thiết lập `DATABASE_URL`:
```env
DATABASE_URL="file:./dev.db"
```

Khởi tạo các bảng dữ liệu trên SQLite bằng Prisma Migrate:
```bash
npx prisma migrate dev --name init
```

### 3. Nạp dữ liệu dòng họ mẫu (Seed)
Nạp dữ liệu phả hệ mẫu gồm 4 đời, đầy đủ quan hệ cha mẹ, vợ chồng và ngày giỗ:
```bash
npx prisma db seed
```

### 4. Khởi chạy máy chủ phát triển
Chạy ứng dụng:
```bash
npm run dev
```
Mở trình duyệt truy cập vào [http://localhost:3000](http://localhost:3000) để trải nghiệm ứng dụng.

---

## ⚙️ Hướng Dẫn Triển Khai (Deploy) Lên Vercel

Để đưa website lên môi trường internet bằng Vercel và kết nối cơ sở dữ liệu PostgreSQL thực tế:

### Bước 1: Tạo Database PostgreSQL
1. Truy cập vào [Vercel Dashboard](https://vercel.com).
2. Chọn dự án hoặc tạo dự án mới, sau đó chuyển đến tab **Storage**.
3. Bấm **Create Database** -> Chọn **Postgres** -> Tạo cơ sở dữ liệu mới.
4. Chờ cơ sở dữ liệu được khởi tạo xong, vào phần **.env.local** trên Vercel để sao chép chuỗi kết nối `POSTGRES_PRISMA_URL` (hoặc `DATABASE_URL`).

### Bước 2: Thiết lập cấu hình Prisma cho PostgreSQL
Khi đưa lên production, Prisma ORM sẽ đọc biến môi trường `DATABASE_URL` là địa chỉ Postgres của Vercel thay thế cho SQLite local. Prisma đã được tối ưu hóa cấu hình để tự động tương thích mà không cần thay đổi file schema.

### Bước 3: Cấu hình biến môi trường trên Vercel
Truy cập **Project Settings** -> **Environment Variables** trên Vercel và thêm 3 biến sau:
1. `DATABASE_URL`: Dán chuỗi kết nối PostgreSQL lấy từ Vercel Storage.
2. `NEXTAUTH_SECRET`: Nhập một chuỗi ngẫu nhiên ký tự bí mật bảo mật.
3. `BLOB_READ_WRITE_TOKEN`: Token đọc ghi ảnh nếu sử dụng Vercel Blob Storage.

### Bước 4: Chạy Migration khởi tạo bảng trên Postgres
Để khởi tạo các bảng vật lý trên cơ sở dữ liệu đám mây PostgreSQL, chạy lệnh sau ở terminal cục bộ (đảm bảo file `.env` local của bạn tạm thời trỏ đến database Postgres đám mây để chạy lệnh, hoặc chạy trực tiếp thông qua Vercel CLI):
```bash
npx prisma migrate deploy
```
Bạn cũng có thể chạy lệnh Seed dữ liệu tương tự để nạp sẵn dữ liệu mẫu lên PostgreSQL:
```bash
npx prisma db seed
```

### Bước 5: Kết nối GitHub và Auto-Deploy
1. Đẩy mã nguồn dự án của bạn lên một repository GitHub cá nhân.
2. Tại Vercel Dashboard, bấm **Add New** -> **Project** -> Chọn Git repository vừa đẩy lên.
3. Bấm **Deploy**. Vercel sẽ tự động tải các gói phụ thuộc, chạy `prisma generate` để sinh mã client và chạy `next build` tạo gói tối ưu. Website sẽ hoạt động trực tiếp sau 1-2 phút.

---

## 📅 Logic Tính Ngày Giỗ Âm - Dương Lịch

Lịch kỵ nhật sử dụng giải thuật âm lịch Việt Nam qua thư viện `lunar-typescript`:
1. **Lưu trữ**: Ngày giỗ của thành viên chỉ lưu trữ 2 số nguyên đơn giản: `lunarMonth` (Tháng âm lịch) và `lunarDay` (Ngày âm lịch).
2. **Quy đổi**: Khi render lịch cho năm dương lịch hiện tại `Y` (ví dụ: 2026), ứng dụng sẽ tính ngày dương lịch tương ứng bằng cách:
   - Khởi tạo thực thể âm lịch: `Lunar.fromYmd(Y, lunarMonth, lunarDay)`
   - Gọi phương thức lấy ngày dương: `.getSolar()`
   - Xuất ra ngày dương lịch tương ứng chính xác (ví dụ: giỗ 15/1 âm lịch năm 2026 rơi vào ngày 09/02/2026 dương lịch).
3. **Nhắc nhở 30 ngày**: Thuật toán quét tất cả các ngày giỗ, quy đổi sang năm dương lịch hiện tại và năm kế tiếp, sau đó lọc ra những ngày rơi vào khoảng `[Hôm nay, Hôm nay + 30 ngày]` để hiển thị cảnh báo đẩy lên Trang chủ.
