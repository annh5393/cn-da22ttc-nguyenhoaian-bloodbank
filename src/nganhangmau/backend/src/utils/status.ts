export const PHIEU_HIEN_STATUS = {
  CREATED: 'CREATED',
  COLLECTED: 'COLLECTED',
  STORED: 'STORED',
  CANCELED: 'CANCELED',
} as const;

export function canEditPhieuHien(status?: string | null): boolean {
  return status === PHIEU_HIEN_STATUS.CREATED || status === PHIEU_HIEN_STATUS.COLLECTED;
}

// Phiếu khám không có cột trạng thái trong schema.
// Quy ước: có thể chỉnh sửa khi chưa có kết quả sàng lọc (ketquasangloc is null).
export function canEditPhieuKhamByFields(ketquasangloc?: string | null): boolean {
  return !ketquasangloc;
}

// Trạng thái túi máu theo hạn dùng (không lưu enum cứng trong DB)
export const TUI_MAU_STATUS = {
  CON_HAN: 'CON_HAN',
  SAP_HET_HAN: 'SAP_HET_HAN',
  HET_HAN: 'HET_HAN',
  DA_DUNG: 'DA_DUNG',
  HUY: 'HUY',
} as const;

export function computeTuiMauStatus(hansudung?: Date | null, now: Date = new Date()): string | null {
  if (!hansudung) return null;
  const warn = new Date(hansudung);
  warn.setDate(warn.getDate() - 7); // Sắp hết hạn khi còn 7 ngày
  if (now >= hansudung) return TUI_MAU_STATUS.HET_HAN;
  if (now >= warn) return TUI_MAU_STATUS.SAP_HET_HAN;
  return TUI_MAU_STATUS.CON_HAN;
}
