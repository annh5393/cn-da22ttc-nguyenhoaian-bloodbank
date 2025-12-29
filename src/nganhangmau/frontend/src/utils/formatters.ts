import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

/**
 * Format date to Vietnamese format (DD/MM/YYYY)
 */
export function formatDate(date: Date | string | undefined): string {
  if (!date) return '';
  return dayjs(date).format('DD/MM/YYYY');
}

/**
 * Format datetime to Vietnamese format (DD/MM/YYYY HH:mm)
 */
export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

/**
 * Format date relative to now (e.g., "2 ngày trước")
 */
export function formatRelative(date: Date | string | undefined): string {
  if (!date) return '';
  return dayjs(date).fromNow();
}

/**
 * Check if date is expired
 */
export function isExpired(date: Date | string | undefined): boolean {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
}

/**
 * Get days until expiry
 */
export function daysUntilExpiry(date: Date | string | undefined): number {
  if (!date) return 0;
  return dayjs(date).diff(dayjs(), 'day');
}

/**
 * Format Rhesus to symbol (+ or -)
 */
export function formatRhesus(rhesus?: string): string {
  if (!rhesus) return '';
  
  // Normalize rhesus value
  const normalized = rhesus.toLowerCase().trim();
  
  // Check for positive
  if (normalized === 'dương' || normalized === 'duong' || normalized === '+' || normalized === 'positive') {
    return '+';
  }
  
  // Check for negative
  if (normalized === 'âm' || normalized === 'am' || normalized === '-' || normalized === 'negative') {
    return '-';
  }
  
  // Default: return as is
  return rhesus;
}

/**
 * Format blood type with Rhesus
 */
export function formatBloodType(nhommau?: string, rhesus?: string): string {
  if (!nhommau) return '';
  const rhSymbol = formatRhesus(rhesus);
  return `${nhommau}${rhSymbol}`;
}

/**
 * Format phone number (0xxx xxx xxx)
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
}

/**
 * Format volume (ml)
 */
export function formatVolume(volume?: number): string {
  if (!volume) return '';
  return `${volume.toLocaleString('vi-VN')} ml`;
}

/**
 * Format number with Vietnamese locale
 */
export function formatNumber(num?: number): string {
  if (num === undefined || num === null) return '';
  return num.toLocaleString('vi-VN');
}

/**
 * Convert various status codes/labels to Vietnamese display labels
 */
export function formatStatus(status?: string): string {
  if (!status) return '';
  const key = status.toString().trim().toUpperCase();

  const map: Record<string, string> = {
    // Generic active/inactive
    'HOAT_DONG': 'Hoạt động',
    'ACTIVE': 'Hoạt động',
    'KHONG_HOAT_DONG': 'Không hoạt động',
    'NGUNG_HOAT_DONG': 'Không hoạt động',
    'INACTIVE': 'Không hoạt động',

    // Donation tickets
    'HOAN_THANH': 'Hoàn thành',
    'DANG_XU_LY': 'Đang xử lý',
    'DA_HUY': 'Đã hủy',
    'PENDING': 'Chờ kết quả',
    'CHO_KET_QUA': 'Chờ kết quả',

    // Blood bag status
    'AVAILABLE': 'Có sẵn',
    'CO_SAN': 'Có sẵn',
    'USED': 'Đã sử dụng',
    'DA_SU_DUNG': 'Đã sử dụng',
    'EXPIRED': 'Hết hạn',
    'HET_HAN': 'Hết hạn',
    'QUARANTINE': 'Cách ly',
    'CACH_LY': 'Cách ly',
    'SAN_SANG_SU_DUNG': 'Sẵn sàng sử dụng',
    'DANG_KIEM_TRA': 'Đang kiểm tra',

    // Warehouse
    'MAINTENANCE': 'Bảo trì',
  };

  return map[key] || status;
}
