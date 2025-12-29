export const ROLES = {
  ADMIN: 'Admin',
  STAFF: 'Nhân viên y tế',
  DONOR: 'Người hiến máu',
} as const;

export const BLOOD_TYPES = ['A', 'B', 'AB', 'O'] as const;

export const RHESUS_FACTORS = ['+', '-'] as const;

export const GENDER = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
} as const;

export const BAG_STATUS = {
  AVAILABLE: 'Có sẵn',
  USED: 'Đã sử dụng',
  EXPIRED: 'Hết hạn',
  QUARANTINE: 'Cách ly',
} as const;

export const DONATION_STATUS = {
  COMPLETED: 'Hoàn thành',
  PENDING: 'Đang xử lý',
  CANCELLED: 'Đã hủy',
} as const;

export const HEALTH_CHECK_RESULT = {
  PASS: 'Đạt',
  FAIL: 'Không đạt',
  PENDING: 'Chờ kết quả',
} as const;

export const WAREHOUSE_STATUS = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngưng hoạt động',
  MAINTENANCE: 'Bảo trì',
} as const;
