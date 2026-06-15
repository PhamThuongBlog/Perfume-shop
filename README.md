# 🧴 AURA Signature — Hệ Thống Bán Nước Hoa Cao Cấp

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.2-green?logo=mongodb)
![Prisma](https://img.shields.io/badge/Prisma-5.22-purple?logo=prisma)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)
![Playwright](https://img.shields.io/badge/Playwright-30/30_passed-45ba4b?logo=playwright)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![Size](https://img.shields.io/badge/Image-484MB-informational)

**AURA Signature** là nền tảng thương mại điện tử bán nước hoa cao cấp, xây dựng trên Next.js 16 với đầy đủ tính năng: danh mục sản phẩm, giỏ hàng, thanh toán, quản trị, marketing số, và **AI tư vấn nước hoa thông minh**.

> 🎯 **30/30 Playwright tests PASSED** — Hệ thống vận hành ổn định.

---

## ✨ Tính Năng Chính

### 🛍️ Trải Nghiệm Mua Sắm
- **Trang chủ** — Hero banner, danh mục Nữ/Nam/Unisex, Gift Sets, bộ sưu tập nổi bật
- **Cửa hàng** — Danh sách sản phẩm với bộ lọc thông minh (giới tính, giá, dung tích, thương hiệu, danh mục)
- **Chi tiết sản phẩm** — Hình ảnh, biến thể (dung tích/giá), tầng hương, đánh giá, sản phẩm liên quan
- **Giỏ hàng** — Thêm/xóa/cập nhật số lượng, tính giá tự động
- **Thanh toán** — Form đặt hàng + mã giảm giá, validate realtime

### 🤖 Aura AI Advisor — Tư Vấn Nước Hoa Thông Minh
- **2 tầng AI:** Gemini 2.0 Flash (primary) + Local Matching Engine (fallback — không cần API key)
- **Context-aware:** Phân tích lịch sử mua hàng, sở thích, brand yêu thích
- **Intent detection tiếng Việt:** Giới tính, mùa, dịp, nhóm hương, tầm giá, quà tặng...
- **Quick reply buttons:** 6 gợi ý nhanh cho người dùng mới
- **Lưu lịch sử chat** vào MongoDB

### 📊 Dashboard Quản Trị
- **Tổng quan** — Thống kê sản phẩm, đơn hàng, người dùng
- **Quản lý sản phẩm** — CRUD, kéo thả sắp xếp, upload ảnh Cloudinary
- **Quản lý đơn hàng** — Cập nhật trạng thái (PENDING → SHIPPING → SHIPPED → CANCELLED)
- **Thống kê** — Biểu đồ doanh thu, top sản phẩm bán chạy (Recharts)
- **Bộ sưu tập** — Quản lý kệ sản phẩm nổi bật trên trang chủ

### 📈 Marketing Số
- **Mã giảm giá** — CRUD, validate realtime tại checkout, giới hạn lượt dùng/user, phân khúc
- **Chiến dịch** — Email/SMS/Banner, lifecycle (Draft → Active → Paused), metrics
- **Phân khúc khách hàng** — VIP, Mới, Không hoạt động, Chi tiêu cao
- **Analytics** — Doanh thu theo ngày, phễu chuyển đổi, hiệu suất mã giảm giá
- **Event tracking** — VIEW → ADD_TO_CART → CHECKOUT → PURCHASE
- **Abandoned Cart** — Lưu và theo dõi giỏ hàng bỏ quên

---

## 🏗️ Kiến Trúc

```
src/
├── app/
│   ├── admin/                  # Admin Dashboard
│   │   ├── marketing/          #   Module Marketing Số
│   │   │   ├── page.tsx        #     Dashboard KPI
│   │   │   ├── discounts/      #     Quản lý mã giảm giá
│   │   │   └── campaigns/      #     Quản lý chiến dịch
│   │   ├── products/           #   CRUD Sản phẩm
│   │   ├── orders/             #   Quản lý đơn hàng
│   │   ├── stats/              #   Thống kê doanh thu
│   │   └── collections/        #   Bộ sưu tập
│   ├── api/
│   │   ├── auth/               #   NextAuth + JWT
│   │   ├── products/           #   API sản phẩm
│   │   ├── orders/             #   API đơn hàng
│   │   ├── shop/               #   API cửa hàng + filter
│   │   ├── chat/               #   API AI Chat
│   │   ├── collections/        #   API bộ sưu tập
│   │   ├── upload/             #   Upload ảnh Cloudinary
│   │   └── marketing/          #   API Marketing (9 endpoints)
│   ├── shop/                   # Cửa hàng + Bộ lọc
│   ├── product/[id]/           # Chi tiết sản phẩm
│   ├── checkout/               # Thanh toán
│   ├── login/register/profile/ # Auth pages
│   └── components/             # Shared components
│       ├── home/               #   CategorySection, Collection, Hero, ProductCard
│       ├── chat/               #   ChatWidget (AI Advisor)
│       ├── cart/               #   CartDrawer
│       └── layout/             #   Header, Footer, Breadcrumb
├── lib/prisma.ts               # Singleton Prisma client
├── store/cartStore.ts          # Zustand cart state
└── auth.ts                     # NextAuth v5 config
```

---

## 🚀 Hướng Dẫn Chạy Dự Án

### Yêu Cầu Hệ Thống

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** (local hoặc Atlas) — hoặc dùng MongoDB in-memory tích hợp sẵn

### Cài Đặt

```bash
# 1. Clone repository
git clone https://github.com/PhamThuongBlog/Perfume-shop.git
cd Perfume-shop

# 2. Cài đặt dependencies
npm install

# 3. Tạo file .env
cp .env.example .env
```

### Cấu Hình Môi Trường (.env)

```env
# MongoDB (dùng MongoDB Atlas hoặc local)
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster.mongodb.net/perfume-shop"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-me"
NEXTAUTH_URL="http://localhost:3000"

# JWT Secret
JWT_SECRET="your-jwt-secret-change-me"

# Cloudinary (cho upload ảnh — optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Google Gemini AI (cho Aura AI Advisor — optional, local engine vẫn hoạt động nếu không có)
GEMINI_API_KEY=""
```

### Chạy Dự Án

#### Cách 1: Dùng MongoDB In-Memory (nhanh nhất — không cần cài MongoDB)

```bash
# Khởi động MongoDB in-memory + seed dữ liệu + chạy Next.js
npm run dev:local
```

#### Cách 2: Dùng MongoDB Local

```bash
# Đảm bảo MongoDB đang chạy trên port 27017
# Seed database
npm run db:seed

# Chạy dev server
npm run dev
```

#### Cách 3: Dùng MongoDB Atlas

```bash
# Sửa DATABASE_URL trong .env thành URL Atlas của bạn
# Seed database
npx prisma generate
npm run db:seed

# Chạy dev server
npm run dev
```

### 🐳 Chạy Bằng Docker (Khuyên Dùng Cho Production)

Docker image đã được đóng gói sẵn với toàn bộ ứng dụng + MongoDB replica set. **Không cần cài Node.js hay MongoDB riêng.**

#### Yêu cầu

- **Docker** & **Docker Compose** ≥ v2

#### Cách 1: Docker Compose (tự build)

```bash
# Clone repository
git clone https://github.com/PhamThuongBlog/Perfume-shop.git
cd Perfume-shop

# Build và chạy (lần đầu chạy ~2-3 phút)
docker compose up -d

# Xem logs
docker compose logs -f app

# Mở trình duyệt
# http://localhost:3000
```

#### Cách 2: Pull image từ GitHub Container Registry

```bash
# Pull image
docker pull ghcr.io/phamthuongblog/perfume-shop:latest

# Tạo docker-compose.yml đơn giản
cat > docker-compose.yml << 'EOF'
services:
  mongodb:
    image: mongo:8.0
    command: ["mongod", "--replSet", "rs0", "--bind_ip_all"]
    ports: ["27017:27017"]
    volumes: [mongodb_data:/data/db]
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh --quiet localhost:27017/test || exit 1
      interval: 10s; timeout: 5s; retries: 10; start_period: 30s
  mongo-init:
    image: mongo:8.0
    depends_on: { mongodb: { condition: service_healthy } }
    entrypoint: >
      bash -c "mongosh --host mongodb:27017 --eval 'rs.initiate({_id:\"rs0\",members:[{_id:0,host:\"mongodb:27017\"}]})'"
  app:
    image: ghcr.io/phamthuongblog/perfume-shop:latest
    ports: ["3000:3000"]
    environment:
      - DATABASE_URL=mongodb://mongodb:27017/perfume-shop?replicaSet=rs0
      - NEXTAUTH_SECRET=change-me-to-random-secret
      - NEXTAUTH_URL=http://localhost:3000
      - JWT_SECRET=change-me-to-random-jwt-secret
      - FIRST_RUN=true
    depends_on: { mongo-init: { condition: service_completed_successfully } }
volumes:
  mongodb_data:
EOF

# Chạy
docker compose up -d
```

#### Các lệnh Docker hữu ích

```bash
npm run docker:build      # Build Docker image
npm run docker:up         # Chạy containers
npm run docker:down       # Dừng containers
npm run docker:logs       # Xem logs app
npm run docker:first-run  # Chạy + seed database lần đầu
npm run docker:clean      # Xóa containers + volumes + image
```

#### Kiến trúc Docker

```
┌──────────────────────────────────────────┐
│  docker-compose.yml                      │
│                                          │
│  ┌──────────┐  ┌──────────────┐         │
│  │ MongoDB  │  │ AURA App     │         │
│  │ 8.0      │←─│ Next.js 16   │         │
│  │ Replica  │  │ Port :3000   │         │
│  │ Set rs0  │  │              │         │
│  │ :27017   │  │ Entrypoint:  │         │
│  │          │  │  Wait DB →   │         │
│  │Volume:   │  │  Prisma Gen →│         │
│  │mongodb   │  │  Seed →      │         │
│  │_data     │  │  Start App   │         │
│  └──────────┘  └──────────────┘         │
│       ↑              ↑                   │
│  ┌──────────┐                             │
│  │mongo-init│ (one-time setup)           │
│  │rs.init   │                             │
│  └──────────┘                             │
└──────────────────────────────────────────┘
```

### Truy Cập

| URL | Mô tả |
|---|---|
| `http://localhost:3000` | 🏠 Trang chủ |
| `http://localhost:3000/shop` | 🛍️ Cửa hàng |
| `http://localhost:3000/admin` | 👤 Admin Dashboard |
| `http://localhost:3000/admin/marketing` | 📊 Marketing Dashboard |

### Tài Khoản Mặc Định

| Vai trò | Email | Mật khẩu |
|---|---|---|
| **Admin** | `admin@aura.com` | `Admin@123456` |
| **User** | `nguyenvana@test.com` | `Admin@123456` |

---

## 🧪 Chạy Test

```bash
# Chạy tất cả Playwright tests (30 tests)
npx playwright test

# Chạy từng nhóm test
npx playwright test tests/dashboard.spec.ts      # Admin + Marketing
npx playwright test tests/category-sections.spec.ts # Danh mục + Gift Sets
npx playwright test tests/ai-advisor.spec.ts       # AI Advisor

# Xem báo cáo
npx playwright show-report
```

### Kết Quả Test

```
✅ Admin Dashboard:      5/5 passed
✅ Marketing Module:     3/3 passed
✅ Customer View:        5/5 passed
✅ E2E Flows:            2/2 passed
✅ Category Sections:    7/7 passed
✅ AI Advisor:           8/8 passed
─────────────────────────────
   TOTAL:               30/30 passed (100%)
```

---

## 📦 Database

### Schema

Dự án sử dụng **MongoDB** với **Prisma ORM**. Schema gồm 16 models:

| Model | Mô tả |
|---|---|
| `User` | Người dùng (USER/ADMIN) |
| `Category` | Danh mục sản phẩm (Nữ, Nam, Unisex) |
| `Product` | Sản phẩm nước hoa (tầng hương, notes, biến thể...) |
| `ProductVariant` | Biến thể dung tích/giá |
| `Order` / `OrderItem` | Đơn hàng |
| `Review` | Đánh giá sản phẩm |
| `Collection` / `CollectionItem` | Bộ sưu tập nổi bật |
| `ChatSession` / `Message` | Lịch sử chat AI |
| `DiscountCode` / `DiscountUsage` | Mã giảm giá |
| `Campaign` | Chiến dịch marketing |
| `AbandonedCart` | Giỏ hàng bỏ quên |
| `MarketingEvent` | Sự kiện marketing |

### Seed Dữ Liệu

```bash
# Seed cơ bản (4 sản phẩm)
npm run db:seed

# Seed đầy đủ (18 sản phẩm, 6 users, 6 orders, reviews, collections, discounts, campaigns)
npx tsx prisma/seed-full.ts
npx tsx prisma/seed-categories.ts
```

---

## 🔧 Công Nghệ Sử Dụng

| Công nghệ | Mục đích |
|---|---|
| **Next.js 16.2** | Framework (App Router, Turbopack) |
| **React 19.2** | UI Library |
| **TypeScript** | Type safety |
| **MongoDB + Prisma** | Database + ORM |
| **NextAuth v5** | Authentication (Credentials + JWT) |
| **TailwindCSS v4** | Styling |
| **Zustand** | State management (cart) |
| **Recharts** | Biểu đồ thống kê |
| **Lucide React** | Icons |
| **Cloudinary** | Lưu trữ ảnh |
| **Google Gemini** | AI Chat (optional fallback: Local Engine) |
| **Playwright** | E2E Testing |
| **bcryptjs** | Password hashing |
| **jsonwebtoken** | JWT authentication |

---

## 📁 Cấu Trúc Thư Mục

```
Perfume-shop/
├── prisma/
│   ├── schema.prisma         # Database schema (16 models)
│   ├── seed.ts               # Seed cơ bản
│   ├── seed-full.ts           # Seed đầy đủ (18 sp, 6 users, ...)
│   └── seed-categories.ts     # Seed danh mục bổ sung
├── scripts/
│   ├── run-mongo.ts          # MongoDB in-memory replica set
│   └── dev-with-mongo.ts     # Dev server + MongoDB in-memory
├── tests/
│   ├── dashboard.spec.ts     # Admin + Marketing UI tests
│   ├── category-sections.spec.ts # Danh mục + Gift Sets tests
│   └── ai-advisor.spec.ts    # AI Advisor tests
├── src/
│   ├── app/                   # Next.js App Router
│   ├── lib/                   # Prisma client
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript types
├── public/                    # Static files
├── .env.example               # Mẫu biến môi trường
├── package.json               # Dependencies & scripts
├── playwright.config.ts       # Playwright configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.ts             # Next.js configuration
└── README.md                  # Hướng dẫn này
```

---

## 👥 Tác Giả & Đóng Góp

- **Dự án gốc:** [MrShuko24/Perfume-shop](https://github.com/MrShuko24/Perfume-shop)
- **Nâng cấp & Mở rộng:** Module Marketing, AI Advisor, Category Sections, Gift Sets, Testing Suite
- **Tester:** Playwright E2E 30/30 tests

---

## 📝 License

Dự án phục vụ mục đích học tập và nghiên cứu (NCKH 2026-2027).

---

*Cập nhật: Tháng 6/2026*
