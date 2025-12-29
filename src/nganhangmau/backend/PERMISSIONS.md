# Phân Quyền Hệ Thống Ngân Hàng Máu

## 🎯 Vai Trò (Roles)

### 1. 👤 Người hiến máu
- Chỉ xem thông tin cá nhân
- Lịch sử hiến máu của bản thân
- Không có quyền truy cập hệ thống quản lý

### 2. 👨‍⚕️ Nhân viên y tế
**3 Nhiệm vụ chính:**
1. **Lập phiếu khám & phiếu hiến**
   - Tạo và cập nhật phiếu khám sàng lọc
   - Tạo và cập nhật phiếu hiến máu
   
2. **Lấy máu và nhập thông tin**
   - Tạo túi máu mới sau khi lấy máu
   - Nhập/cập nhật thông tin túi máu vào hệ thống
   
3. **Quản lý kho máu**
   - Tạo và quản lý kho máu
   - Phân công nhân viên phụ trách kho
   - Theo dõi tồn kho

### 3. 👑 Admin
- Toàn quyền trên hệ thống
- Xóa dữ liệu
- Xem báo cáo tổng hợp tháng


---

## 🔑 API Endpoints theo Vai Trò

### Người hiến máu
```
GET /api/nguoihienmau/:id          - Xem thông tin bản thân
GET /api/phieuhienmau?manguoihien  - Xem lịch sử hiến máu
GET /api/phieukham?manguoihien     - Xem lịch sử khám
```

### Nhân viên y tế
**1. Lập phiếu:**
```
POST /api/phieukham                - Tạo phiếu khám
PUT  /api/phieukham/:id            - Sửa phiếu khám
POST /api/phieuhienmau             - Tạo phiếu hiến
PUT  /api/phieuhienmau/:id         - Sửa phiếu hiến
```

**2. Lấy máu & nhập dữ liệu:**
```
POST /api/tuimau                   - Tạo túi máu
PUT  /api/tuimau/:id               - Cập nhật túi máu
GET  /api/tuimau                   - Xem danh sách túi máu
```

**3. Quản lý kho:**
```
POST /api/khomau                   - Tạo kho máu
PUT  /api/khomau/:id               - Cập nhật kho
POST /api/khomau/assign            - Phân công nhân viên
DELETE /api/khomau/assign          - Gỡ phân công
```

**Báo cáo:**
```
GET /api/reports/dashboard         - Tổng quan
GET /api/reports/inventory         - Tồn kho
GET /api/reports/inventory/expiring - Sắp hết hạn
GET /api/reports/inventory/expired  - Đã hết hạn
GET /api/reports/inventory/low-stock - Thiếu hụt
GET /api/reports/donors/activity   - Hoạt động người hiến
```

### Admin
- Tất cả quyền của Nhân viên y tế
- **Thêm:** DELETE endpoints (xóa dữ liệu)
- **Thêm:** `GET /api/reports/monthly` - Báo cáo tổng hợp tháng

---
