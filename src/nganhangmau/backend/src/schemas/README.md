# Zod Validation Schemas

## 📚 Tổng quan

Thư mục này chứa các Zod schemas để validate dữ liệu đầu vào cho API. Zod giúp:
- ✅ Validate dữ liệu tự động
- ✅ Type-safe với TypeScript
- ✅ Error messages rõ ràng
- ✅ Reusable schemas
- ✅ Transform data (string → Date, number, etc.)

## 📁 Cấu trúc

```
schemas/
├── common.schema.ts      # Schemas dùng chung (email, phone, blood type, etc.)
├── nguoihien.schema.ts   # Schemas cho người hiến máu
├── phieuhien.schema.ts   # Schemas cho phiếu hiến máu
├── phieukham.schema.ts   # Schemas cho phiếu khám
├── tuimau.schema.ts      # Schemas cho túi máu
└── README.md             # File này
```

## 🚀 Cách sử dụng

### 1. Import schema và middleware

```typescript
import { validateBody } from '../middleware/validate.middleware';
import { CreatePhieuHienSchema } from '../schemas/phieuhien.schema';
```

### 2. Thêm vào route

```typescript
router.post(
  '/phieu-hien',
  authenticate,
  validateBody(CreatePhieuHienSchema), // <-- Thêm middleware này
  createPhieuHienController
);
```

### 3. Sử dụng trong controller

```typescript
export const createPhieuHienController = async (req: Request, res: Response) => {
  // req.body đã được validate và type-safe!
  const { manguoihien, maphieukham, luongmauhien } = req.body;
  
  // Không cần validate nữa, Zod đã làm rồi
  // TypeScript biết chính xác type của từng field
  
  // Business logic...
};
```

## 📖 Ví dụ chi tiết

### Ví dụ 1: Tạo người hiến máu

```typescript
import { CreateNguoiHienSchema } from './schemas/nguoihien.schema';

// Input data
const data = {
  hotennguoihien: "Nguyễn Văn A",
  ngaysinh: "2000-01-01",
  gioitinh: "Nam",
  email: "nguyenvana@example.com",
  sodienthoai: "0123456789",
  diachi: "123 Đường ABC, TP.HCM"
};

// Validate
const result = CreateNguoiHienSchema.safeParse(data);

if (result.success) {
  console.log(result.data); // Type-safe data
  // {
  //   hotennguoihien: "Nguyễn Văn A",
  //   ngaysinh: Date object,
  //   gioitinh: "Nam",
  //   ...
  // }
} else {
  console.log(result.error.flatten());
  // {
  //   fieldErrors: {
  //     email: ["Email không hợp lệ"],
  //     sodienthoai: ["Số điện thoại phải có 10 chữ số"]
  //   }
  // }
}
```

### Ví dụ 2: Tạo phiếu hiến máu

```typescript
import { CreatePhieuHienSchema } from './schemas/phieuhien.schema';

const data = {
  manguoihien: "NH001",
  maphieukham: "PK001",
  ngaytaophieuhien: "2024-12-20",
  luongmauhien: 350
};

const result = CreatePhieuHienSchema.safeParse(data);

if (result.success) {
  // ✅ Validated:
  // - manguoihien: format NH + số
  // - maphieukham: format PK + số
  // - ngaytaophieuhien: converted to Date
  // - luongmauhien: 200-500, bội số 50
  console.log(result.data);
} else {
  console.log(result.error.errors);
}
```

### Ví dụ 3: Validation errors

```typescript
const badData = {
  manguoihien: "INVALID", // ❌ Phải bắt đầu bằng NH
  luongmauhien: 175       // ❌ Phải là bội số 50
};

const result = CreatePhieuHienSchema.safeParse(badData);

console.log(result.error.flatten());
// {
//   fieldErrors: {
//     manguoihien: ["Mã người hiến phải bắt đầu bằng NH theo sau là số"],
//     luongmauhien: ["Lượng máu phải là bội số của 50ml"],
//     maphieukham: ["Required"]
//   }
// }
```

## 🎯 Validation Rules

### Người hiến máu (nguoihien.schema.ts)

- `hotennguoihien`: 2-100 ký tự, chỉ chữ cái
- `ngaysinh`: Phải trong quá khứ, >= 18 tuổi
- `email`: Format email hợp lệ
- `sodienthoai`: 10 chữ số, bắt đầu bằng 0
- `nhommau`: A, B, O, AB (optional)
- `rhesus`: Dương/Âm hoặc +/- (optional)
- **Rule**: Nếu có nhommau thì phải có rhesus và ngược lại

### Phiếu hiến máu (phieuhien.schema.ts)

- `manguoihien`: Format NH + số
- `maphieukham`: Format PK + số
- `luongmauhien`: 200-500ml, bội số 50
- `ngaytaophieuhien`: Không được trong tương lai
- `diadiem`: Max 200 ký tự (optional)
- `ghichu`: Max 500 ký tự (optional)

### Túi máu (tuimau.schema.ts)

- `matuimau`: Format TM + số
- `makho`: Format KHO + số
- `thetich`: 200-500ml, bội số 50
- `hansudung`: Phải trong tương lai, >= 7 ngày từ hôm nay
- `trangthai`: CON_HAN, SAP_HET_HAN, HET_HAN, DA_DUNG, HUY

### Phiếu khám (phieukham.schema.ts)

- `maphieukham`: Format PK + số
- `manguoihien`: Format NH + số
- `manvyt`: Format NV + số
- `ngaykham`: Không được trong tương lai
- `ketquasangloc`: Đạt/Không đạt (optional)

## 🔧 Custom Validation

Bạn có thể thêm custom validation rules:

```typescript
const CustomSchema = z.object({
  field: z.string()
}).refine(
  (data) => {
    // Custom logic
    return data.field.length > 5;
  },
  {
    message: "Field phải dài hơn 5 ký tự",
    path: ["field"]
  }
);
```

## 🌐 Sử dụng ở Frontend

Schemas có thể dùng chung cho frontend:

```typescript
// Copy schemas sang frontend hoặc tạo shared package
import { CreatePhieuHienSchema } from '@/schemas/phieuhien.schema';

// Validate form data trước khi gửi API
const handleSubmit = (formData) => {
  const result = CreatePhieuHienSchema.safeParse(formData);
  
  if (!result.success) {
    // Hiển thị lỗi cho user
    setErrors(result.error.flatten().fieldErrors);
    return;
  }
  
  // Gửi API
  api.createPhieuHien(result.data);
};
```

## 📝 Best Practices

1. **Luôn dùng `.safeParse()`** thay vì `.parse()` để tránh throw error
2. **Dùng `.flatten()`** để lấy errors dễ hiển thị
3. **Tạo schemas nhỏ, reusable** (như BloodTypeSchema, EmailSchema)
4. **Dùng `.refine()`** cho business logic phức tạp
5. **Transform data** với `.coerce` hoặc `.transform()`
6. **Type inference** với `z.infer<typeof Schema>`

## 🔗 Tài liệu

- [Zod Documentation](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)

## 🎓 Học thêm

Xem file `phieuhien-zod.example.ts` để biết cách áp dụng vào routes thực tế.
