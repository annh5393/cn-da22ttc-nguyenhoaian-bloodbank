### Đề tài: Xây dựng hệ thống quản lý ngân hàng máu và hiến máu tình nguyện của một bệnh viện

---

**Giảng viên hướng dẫn:** ThS. Phan Thị Phương Nam

**Sinh viên thực hiện:** Nguyễn Hoài An

---

### Mô tả
Hệ thống hỗ trợ bệnh viện quản lý toàn bộ vòng đời của ngân hàng máu và hoạt động hiến máu tình nguyện. Ứng dụng cung cấp các chức năng chính:

- Quản lý người hiến máu: lưu trữ hồ sơ cá nhân, ngày sinh, giới tính, nhóm máu, liên hệ, lịch sử hiến.
- Quản lý phiếu khám (`phieukham`): tạo và cập nhật thông tin khám sàng lọc, ngày khám, kết quả sàng lọc, ghi chú.
- Quản lý phiếu hiến (`phieuhienmau`): ghi nhận lần hiến, khối lượng/ thể tích hiến, ngày hiến, trạng thái; liên kết người hiến và nhân viên y tế.
- Quản lý túi máu (`tuimau`): theo dõi thể tích, ngày nhập kho, hạn sử dụng, trạng thái; liên kết vị trí kho và người hiến.
- Quản lý kho máu (`khomau`) và phụ trách kho (`phutrach`): cấu trúc kho, nhiệt độ bảo quản, nhân viên phụ trách.
- Báo cáo và thống kê: tổng hợp dữ liệu hiến, tồn kho, hạn sử dụng; hỗ trợ trực quan trên frontend.
- Phân quyền và bảo vệ tuyến (RBAC): vai trò Admin, Nhân viên y tế, Người hiến; xác thực JWT và kiểm tra quyền trên API.

Kiến trúc triển khai:
- Backend: Node.js + Express + TypeScript, ORM Prisma kết nối PostgreSQL, kiểm tra health qua `GET /health`, bộ định tuyến REST dưới tiền tố `/api`.
- Frontend: Next.js 16 + React 19 + Tailwind CSS, tích hợp gọi API qua Axios, bảo vệ tuyến theo hướng dẫn đính kèm.
- Database: PostgreSQL, quan hệ và ràng buộc mô hình hóa bởi Prisma (xem `backend/prisma/schema.prisma`).

Mục tiêu: tối ưu quy trình quản lý hiến máu, nâng cao độ chính xác dữ liệu, giảm sai sót vận hành và cung cấp báo cáo kịp thời cho công tác chuyên môn.


# 🩸 Hướng Dẫn Triển Khai Hệ Thống Quản Lý Ngân Hàng Máu

> *Một hành trình từ con số 0 đến ứng dụng hoàn chỉnh - Dành cho người mới bắt đầu*

---

## 📖 Mục Lục
1. [Giới thiệu](#giới-thiệu)
2. [Hướng dẫn khởi chạy dự án (Windows)](#hướng-dẫn-khởi-chạy-dự-án-windows)
   - [Tổng quan](#tổng-quan)
   - [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
   - [Chuẩn bị cơ sở dữ liệu](#chuẩn-bị-cơ-sở-dữ-liệu)
   - [Biến môi trường](#biến-môi-trường)
   - [Cài đặt dependencies](#cài-đặt-dependencies)
   - [Thiết lập Prisma và database schema (Backend)](#thiết-lập-prisma-và-database-schema-backend)
     - [Kết nối Prisma tới PostgreSQL đã có sẵn (pgAdmin4) và "pull" schema](#kết-nối-prisma-tới-postgresql-đã-có-sẵn-pgadmin4-và-pull-schema)
   - [Khởi chạy trong chế độ Development](#khởi-chạy-trong-chế-độ-development)
   - [Cấu trúc đường dẫn API](#cấu-trúc-đường-dẫn-api)
   - [Build & chạy Production](#build--chạy-production)
   - [Ghi chú về bảo mật và quyền truy cập](#ghi-chú-về-bảo-mật-và-quyền-truy-cập)
   - [Khắc phục sự cố (Troubleshooting)](#khắc-phục-sự-cố-troubleshooting)
   - [Lệnh nhanh (tóm tắt)](#lệnh-nhanh-tóm-tắt)

---


# Hướng dẫn khởi chạy dự án (Windows)

Dự án gồm 2 phần: Backend (Express + Prisma + PostgreSQL) và Frontend (Next.js). Tài liệu này hướng dẫn thiết lập môi trường, cấu hình, chạy development, build và deploy.

## Tổng quan
- Backend chạy mặc định ở `http://localhost:2000`.
- Frontend chạy mặc định ở `http://localhost:2004`.
- Frontend gọi API qua `NEXT_PUBLIC_API_URL` (mặc định `http://localhost:2000/api`).
- CSDL: PostgreSQL, cấu hình qua biến môi trường `DATABASE_URL`.

## Yêu cầu hệ thống
- Node.js 20 LTS (khuyến nghị) và npm đi kèm.
- PostgreSQL 14+ (có thể dùng Docker Desktop nếu không muốn cài trực tiếp).
- Git (tuỳ chọn).

## Chuẩn bị cơ sở dữ liệu

1) Cài PostgreSQL local và tạo database:
- Tạo DB ví dụ: `yourdatabase_name`
- Ghi nhớ user/password để cấu hình `DATABASE_URL`


## Biến môi trường
Tạo file `.env` cho Backend và `.env.local` cho Frontend.

Backend: tạo file `backend/.env`
```
# Chuỗi kết nối PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yourdatabase_name?schema=public"

# Cổng server (tuỳ chọn, mặc định 2000)
PORT=2000

# JWT dùng cho xác thực
JWT_SECRET="your-jwt"
```

Frontend: tạo file `frontend/.env.local`
```
# Base URL của API backend
NEXT_PUBLIC_API_URL="http://localhost:2000/api"
```

## Cài đặt dependencies
Chạy riêng cho mỗi phần:
```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Thiết lập Prisma và database schema (Backend)
Thực hiện các bước sau trong thư mục `backend`:
```powershell
cd backend

# Sinh client Prisma (cần sau mỗi lần thay đổi schema)
npx prisma generate

# Tạo và áp dụng migration vào DB (môi trường dev)
npx prisma migrate dev

# (Tuỳ chọn) Xem ERD/schema bằng các công cụ phụ nếu cần
```

### Kết nối Prisma tới PostgreSQL đã có sẵn (pgAdmin4) và "pull" schema
Nếu bạn đã có cơ sở dữ liệu PostgreSQL (quản lý bằng pgAdmin4) và muốn dự án này dùng lại schema hiện có, hãy làm theo các bước sau thay vì chạy `migrate dev`:

1) Lấy thông tin kết nối từ pgAdmin4 (hoặc từ người quản trị DB):
  - Host: ví dụ `localhost`
  - Port: mặc định `5432`
  - Database: tên DB, ví dụ `yourdatabase_name`
  - User/Password: tài khoản truy cập DB

2) Tạo/ghi `DATABASE_URL` trong file [backend/.env](backend/.env) theo định dạng:
```
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"
```
Ví dụ máy cục bộ:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nganhangmau?schema=public"
```
Nếu DB yêu cầu SSL (cloud/RDS), thêm tuỳ chọn:
```
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public&sslmode=require"
```

3) Chạy lệnh Prisma để "pull" schema hiện có từ DB:
```powershell
cd backend
npx prisma db pull        # đọc schema từ DB và cập nhật file schema.prisma
npx prisma generate       # sinh lại Prisma Client
```

4) (Tuỳ chọn) Mở Prisma Studio để xem dữ liệu trực quan:
```powershell
npx prisma studio
```

5) Khởi chạy backend dùng chính DB đó:
```powershell
npm run dev
```

Lưu ý quan trọng:
- Không chạy `npx prisma migrate dev` trên cơ sở dữ liệu sản xuất/đang dùng, vì có thể tạo/đổi cấu trúc bảng. Chỉ dùng `db pull` nếu mục tiêu là tái sử dụng schema hiện có.
- Nếu muốn đẩy cấu trúc từ dự án sang DB mới (trống), khi đó dùng `migrate dev` hoặc `db push` trên môi trường dev.
- Biến `NEXT_PUBLIC_API_URL` ở Frontend phải trỏ tới backend đang chạy (mặc định `http://localhost:2000/api`).

Seed dữ liệu (vị trí các nhóm máu, người dùng, v.v.):
```powershell
# Seed vị trí
npm run seed:positions

# Seed người dùng (nếu cần)
npm run seed
```


## Khởi chạy trong chế độ Development
Chạy Backend và Frontend song song.

Backend (port 2000):
```powershell
cd backend
npm run dev
```

Frontend (port 2004):
```powershell
cd frontend
npm run dev
```

- API health check: mở `http://localhost:2000/health` (Thông báo xuất hiện phải là `{ status: "OK" }`).
- Frontend: mở `http://localhost:2004`.

## Cấu trúc đường dẫn API
- Các route backend được mount dưới `/api/*`, ví dụ:
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `GET /api/nguoihienmau` ...

Xem thêm trong:
- [backend/src/app.ts](backend/src/app.ts)
- [backend/src/index.ts](backend/src/index.ts)
- Thư mục routes: [backend/src/routes](backend/src/routes)

## Build & chạy Production
Backend:
```powershell
cd backend
npm run build
npm run start  # chạy dist/index.js
```

Frontend:
```powershell
cd frontend
npm run build
npm run start  # chạy Next.js trên port 2004
```


## Ghi chú về bảo mật và quyền truy cập
- Hãy đặt `JWT_SECRET` đủ mạnh trong môi trường thực.
- Kiểm soát CORS nếu triển khai đa domain (middleware `cors()` hiện chấp nhận mặc định).
- Tài liệu quyền hạn chi tiết: [backend/PERMISSIONS.md](backend/PERMISSIONS.md)
- Hướng dẫn bảo vệ route phía frontend: [frontend/ROUTE_PROTECTION_GUIDE.md](frontend/ROUTE_PROTECTION_GUIDE.md), [frontend/ROUTE_PROTECTION_SUMMARY.md](frontend/ROUTE_PROTECTION_SUMMARY.md)

## Khắc phục sự cố (Troubleshooting)
- Không thể kết nối DB: kiểm tra `DATABASE_URL`, cổng `5432`, trạng thái container (nếu Docker).
- Lỗi JWT: chắc chắn đã đặt `JWT_SECRET` và token lưu ở localStorage hợp lệ.
- API 401/403 từ Frontend: kiểm tra interceptor axios tại [frontend/src/lib/axios.ts](frontend/src/lib/axios.ts) và quyền người dùng.
- Xung đột cổng: thay `PORT` (backend) hoặc `-p` trong script Next (frontend).

## Lệnh nhanh (tóm tắt)
```powershell
# Cài đặt
cd backend; npm i; cd ../frontend; npm i

# Backend: Prisma + migrate + seed
cd backend
npx prisma generate
npx prisma migrate dev
npm run seed:positions

# Chạy dev
npm run dev    # trong backend
cd ../frontend
npm run dev    # trong frontend
```

### Thông tin liên hệ

- **Email**: [annguyen12900@gmail.com](mailto:annguyen12900@gmail.com)
- **Số điện thoại**: 0939588312