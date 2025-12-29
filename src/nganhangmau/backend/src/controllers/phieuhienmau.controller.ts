import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { PHIEU_HIEN_STATUS } from '../utils/status';
import { AuthRequest } from '../middlewares/auth';


// Constants for donation validation
const MINIMUM_DONATION_INTERVAL_WEEKS = 12;
const MINIMUM_DONATION_INTERVAL_DAYS = 84;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// Helper: Validate donation interval (12-week rule)
interface DonationValidationResult {
  isValid: boolean;
  error?: string;
  daysSinceLastDonation?: number;
}

async function validateDonationInterval(
  manguoihien: string,
  ngayhien: Date,
  excludeMaphieuhien?: string
): Promise<DonationValidationResult> {
  const lastDonation = await prisma.phieuhienmau.findFirst({
    where: {
      manguoihien,
      ...(excludeMaphieuhien && { maphieuhien: { not: excludeMaphieuhien } }),
    },
    orderBy: { ngaytaophieuhien: 'desc' },
    select: { ngaytaophieuhien: true },
  });

  // First-time donor - no validation needed
  if (!lastDonation?.ngaytaophieuhien) {
    return { isValid: true };
  }

  const lastDate = new Date(lastDonation.ngaytaophieuhien);
  const newDate = new Date(ngayhien);
  const diffMs = newDate.getTime() - lastDate.getTime();
  const diffDays = diffMs / MILLISECONDS_PER_DAY;

  if (diffDays < MINIMUM_DONATION_INTERVAL_DAYS) {
    return {
      isValid: false,
      error: `Khoảng cách giữa 2 lần hiến máu phải ít nhất ${MINIMUM_DONATION_INTERVAL_WEEKS} tuần (${MINIMUM_DONATION_INTERVAL_DAYS} ngày). Hiện tại mới ${Math.floor(diffDays)} ngày.`,
      daysSinceLastDonation: Math.floor(diffDays),
    };
  }

  return { isValid: true, daysSinceLastDonation: Math.floor(diffDays) };
}

export const getAllPhieuHienMau = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    const { manguoihien } = req.query;

    // Build filter based on role
    let where: any = {};

    // Nếu là Người hiến máu, chỉ lấy lịch sử của chính họ
    if (user?.vaitro === 'Người hiến máu' || user?.vaitro === 'NguoiHienMau') {
      // Với người hiến máu, manvyt trong token chính là manguoihien
      where.manguoihien = user.manvyt;
    } else if (manguoihien) {
      // Admin/Staff có thể filter theo manguoihien cụ thể
      where.manguoihien = manguoihien;
    }
    // Nếu là Admin/Staff và không có filter, lấy tất cả

    const phieuhienmau = await prisma.phieuhienmau.findMany({
      where,
      include: {
        nguoihienmau: true,
        nhanvienyte: true,
      },
      orderBy: {
        ngaytaophieuhien: 'desc', // Sắp xếp theo ngày hiến mới nhất
      },
    });
    // Sanitize blood type visibility based on status
    const sanitized = phieuhienmau.map((p) => {
      const hideBlood = p.trangthai === PHIEU_HIEN_STATUS.CREATED || p.trangthai === 'CANCELLED' || p.trangthai === PHIEU_HIEN_STATUS.CANCELED;
      return {
        ...p,
        nguoihienmau: p.nguoihienmau
          ? {
              ...p.nguoihienmau,
              nhommau: hideBlood ? null : p.nguoihienmau.nhommau,
              rhesus: hideBlood ? null : p.nguoihienmau.rhesus,
            }
          : null,
      };
    });
    res.json(sanitized);
  } catch (error) {
    next(error);
  }
};

export const getPhieuHienMauById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const phieuhienmau = await prisma.phieuhienmau.findFirst({
      where: { 
        maphieuhien: id,
      },
      include: {
        nguoihienmau: true,
        nhanvienyte: true,
      },
    });

    if (!phieuhienmau) {
      res.status(404).json({ error: 'Phiếu hiến máu không tồn tại hoặc đã bị xóa' });
      return;
    }

    const hideBlood = phieuhienmau.trangthai === PHIEU_HIEN_STATUS.CREATED || phieuhienmau.trangthai === 'CANCELLED' || phieuhienmau.trangthai === PHIEU_HIEN_STATUS.CANCELED;
    const sanitized = {
      ...phieuhienmau,
      nguoihienmau: phieuhienmau.nguoihienmau
        ? {
            ...phieuhienmau.nguoihienmau,
            nhommau: hideBlood ? null : phieuhienmau.nguoihienmau.nhommau,
            rhesus: hideBlood ? null : phieuhienmau.nguoihienmau.rhesus,
          }
        : null,
    };
    res.json(sanitized);
  } catch (error) {
    next(error);
  }
};

// Helper: generate unique maphieuhien (max 10 chars)
async function generateMaPhieuHien(): Promise<string> {
  const count = await prisma.phieuhienmau.count();
  return 'PH' + String(count + 1).padStart(7, '0'); // PH0000001 (9 chars)
}

export const createPhieuHienMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Received phieu hien mau request:', req.body);
    // Accept both legacy and schema-aligned field names
    const {
      maphieuhien,
      manguoihien,
      maphieukham,
      ngayhien,
      ngaytaophieuhien,
      luongmau,
      luongmauhien,
      hienlan,
    } = req.body;

    console.log(' luong input values:', { luongmau, luongmauhien, typeLuongmau: typeof luongmau, typeLuongmauhien: typeof luongmauhien });

    // Phân quyền: chỉ Nhân viên y tế được phép lập phiếu
    const user = (req as any).user;
    if (user?.vaitro !== 'Nhân viên y tế') {
      res.status(403).json({
        error: 'Chỉ Nhân viên y tế được phép lập phiếu hiến máu',
      });
      return;
    }

    // Validate required fields
    if (!manguoihien) {
      res.status(400).json({ error: 'Thiếu thông tin bắt buộc: manguoihien' });
      return;
    }

    // VALIDATION: Kiểm tra phiếu khám đạt - MẠNH TAY
    console.log('DEBUG: Kiểm tra phiếu khám cho người hiến:', manguoihien);
    
    // Log tất cả phiếu khám của người hiến này để debug
    const allPhieuKham = await prisma.phieukham.findMany({
      where: { manguoihien },
      select: { 
        maphieukham: true, 
        ketquasangloc: true, 
        ngaykham: true
      },
      orderBy: { ngaykham: 'desc' }
    });
    console.log('📋 Tất cả phiếu khám của người hiến:', JSON.stringify(allPhieuKham, null, 2));
    
    // Chuẩn hóa chuỗi để so sánh (bỏ dấu, trim, uppercase)
    const normalizeString = (str: string | null | undefined): string => {
      if (!str) return '';
      return str
        .toString()
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
        .replace(/Đ/g, 'D')              // Đ -> D
        .replace(/đ/g, 'D');             // đ -> D
    };
    
    // Kiểm tra xem chuỗi có phải là "Đạt" không (nhiều biến thể)
    const isDat = (str: string | null | undefined): boolean => {
      const normalized = normalizeString(str);
      return normalized === 'DAT' || normalized === 'PASS' || normalized === 'OK';
    };
    
    // Lấy phiếu khám MỚI NHẤT có kết quả ĐẠT
    // Lọc trong code thay vì dùng Prisma where (để linh hoạt hơn)
    const phieuKhamDat = allPhieuKham.find(pk => isDat(pk.ketquasangloc));
    
    console.log('✅ Phiếu khám đạt tìm được:', phieuKhamDat ? JSON.stringify(phieuKhamDat, null, 2) : 'KHÔNG TÌM THẤY');

    if (!phieuKhamDat) {
      console.log('❌ KHÔNG tìm thấy phiếu khám đạt cho người hiến:', manguoihien);
      console.log('❌ Chi tiết các kết quả:', allPhieuKham.map(pk => `${pk.maphieukham}: "${pk.ketquasangloc}" -> normalized: "${normalizeString(pk.ketquasangloc)}"`));
      
      res.status(400).json({
        error: 'Không tìm thấy phiếu khám sàng lọc đạt cho người hiến này. Vui lòng thực hiện khám sàng lọc và đảm bảo kết quả là "Đạt".',
        debug: {
          manguoihien,
          totalPhieuKham: allPhieuKham.length,
          allResults: allPhieuKham.map(pk => ({
            ma: pk.maphieukham,
            ketqua: pk.ketquasangloc,
            normalized: normalizeString(pk.ketquasangloc),
            isDat: isDat(pk.ketquasangloc),
            ngay: pk.ngaykham
          }))
        }
      });
      return;
    }

    console.log('✅ Cho phép tạo phiếu hiến với phiếu khám:', phieuKhamDat.maphieukham);

    // manvyt lấy từ người dùng đăng nhập (nhân viên y tế)
    const manvyt = (req as any).user?.manvyt;
    if (!manvyt) {
      res.status(400).json({ error: 'Thiếu thông tin nhân viên y tế (manvyt)' });
      return;
    }

    // Generate unique ID if not provided
    const finalMaphieuhien = maphieuhien || await generateMaPhieuHien();

    // Enforce 12-week cooldown between donations
    // Prefer schema field `ngaytaophieuhien`, fallback to `ngayhien`
    const donationDate = (ngaytaophieuhien ? new Date(ngaytaophieuhien) : (ngayhien ? new Date(ngayhien) : new Date()));
    const validationResult = await validateDonationInterval(manguoihien, donationDate);
    
    if (!validationResult.isValid) {
      res.status(400).json({ error: validationResult.error });
      return;
    }

    // Calculate hienlan (donation count for this donor based on date order)
    // Get all existing donations for this donor, sorted by date
    const existingDonations = await prisma.phieuhienmau.findMany({
      where: { 
        manguoihien,
      },
      orderBy: { ngaytaophieuhien: 'asc' },
      select: { ngaytaophieuhien: true }
    });
    
    // Count how many donations happened before this date
    let donationCount = 0;
    for (const donation of existingDonations) {
      if (donation.ngaytaophieuhien && donationDate >= donation.ngaytaophieuhien) {
        donationCount++;
      }
    }
    
    const finalHienlan = String(donationCount + 1);

    // Convert luongmau to number properly
    // Prefer schema field `luongmauhien`, fallback to `luongmau`
    let luongmauhienValue: number | null = null;
    if (luongmauhien !== undefined && luongmauhien !== null) {
      luongmauhienValue = typeof luongmauhien === 'number' ? luongmauhien : parseFloat(String(luongmauhien));
    } else if (luongmau !== undefined && luongmau !== null) {
      luongmauhienValue = typeof luongmau === 'number' ? luongmau : parseFloat(String(luongmau));
    }
    console.log('Final luongmauhien value (parsed):', luongmauhienValue);

    const phieuhienmau = await prisma.phieuhienmau.create({
      data: {
        maphieuhien: finalMaphieuhien,
        manvyt,
        manguoihien,
        ngaytaophieuhien: donationDate,
        luongmauhien: luongmauhienValue,
        trangthai: PHIEU_HIEN_STATUS.CREATED, // luôn mặc định CREATED khi tạo
        hienlan: hienlan || finalHienlan,
      },
      include: {
        nguoihienmau: true,
        nhanvienyte: true,
      },
    });

    res.status(201).json(phieuhienmau);
  } catch (error) {
    console.error('Lỗi khi tạo phiếu hiến máu:', error);
    next(error);
  }
};

export const updatePhieuHienMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { ngayhien, ngaytaophieuhien, luongmauhien, trangthai, hienlan, manguoihien } = req.body;

    // Kiểm tra phiếu hiến có tồn tại và đang active không
    const existing = await prisma.phieuhienmau.findUnique({
      where: { maphieuhien: id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Phiếu hiến máu không tồn tại hoặc đã bị xóa' });
      return;
    }

    // Phân quyền: chỉ Nhân viên y tế được phép cập nhật
    const user = (req as any).user;
    if (user?.vaitro !== 'Nhân viên y tế') {
      res.status(403).json({ error: 'Chỉ Nhân viên y tế được phép cập nhật phiếu hiến' });
      return;
    }

    // Chỉ cho phép sửa khi trạng thái hiện tại là CREATED
    if (existing.trangthai !== PHIEU_HIEN_STATUS.CREATED) {
      res.status(403).json({ 
        error: 'Chỉ được phép sửa phiếu khi đang ở trạng thái CREATED',
        currentStatus: existing.trangthai,
      });
      return;
    }

    // If updating the donation date, enforce the 12-week rule as well
    const dateInput = ngaytaophieuhien || ngayhien;
    if (dateInput && (manguoihien || existing.manguoihien)) {
      const donationDate = new Date(dateInput);
      const validationResult = await validateDonationInterval(
        manguoihien || existing.manguoihien, 
        donationDate, 
        id
      );
      
      if (!validationResult.isValid) {
        res.status(400).json({ error: validationResult.error });
        return;
      }
    }

    // Parse luongmauhien to number if provided
    const parsedVolume = (luongmauhien !== undefined && luongmauhien !== null)
      ? (typeof luongmauhien === 'number' ? luongmauhien : parseFloat(String(luongmauhien)))
      : undefined;

    // Chuẩn bị dữ liệu cập nhật phiếu hiến
    const updated = await prisma.phieuhienmau.update({
      where: { maphieuhien: id },
      data: {
        ngaytaophieuhien: dateInput ? new Date(dateInput) : undefined,
        luongmauhien: parsedVolume,
        trangthai,
        hienlan,
      },
      include: {
        nguoihienmau: true,
        nhanvienyte: true,
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Xác nhận kết quả xét nghiệm cho phiếu hiến
export const confirmXetNghiem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { nhommau, rhesus } = req.body as { nhommau?: string; rhesus?: string };

    // Phân quyền: chỉ Nhân viên y tế được phép xác nhận xét nghiệm
    const user = (req as any).user;
    if (user?.vaitro !== 'Nhân viên y tế') {
      res.status(403).json({ error: 'Chỉ Nhân viên y tế được phép xác nhận kết quả xét nghiệm' });
      return;
    }

    // Validate payload
    const ABO = new Set(['O', 'A', 'B', 'AB']);
    const RH = new Set(['+', '-']);
    if (!nhommau || !ABO.has(nhommau)) {
      res.status(400).json({ error: 'Nhóm máu không hợp lệ (A, B, AB, O)' });
      return;
    }
    if (!rhesus || !RH.has(rhesus)) {
      res.status(400).json({ error: 'Giá trị Rh không hợp lệ (+ hoặc -)' });
      return;
    }

    const phieu = await prisma.phieuhienmau.findUnique({ where: { maphieuhien: id } });
    if (!phieu) {
      res.status(404).json({ error: 'Phiếu hiến máu không tồn tại' });
      return;
    }
    if (phieu.trangthai !== PHIEU_HIEN_STATUS.CREATED) {
      res.status(400).json({ error: 'Chỉ phiếu ở trạng thái CREATED mới được nhập kết quả xét nghiệm' });
      return;
    }

    // Cập nhật nhóm máu cho người hiến nếu chưa có
    const donor = await prisma.nguoihienmau.findUnique({ where: { manguoihien: phieu.manguoihien }, select: { nhommau: true, rhesus: true } });
    if (!donor?.nhommau || !donor?.rhesus) {
      await prisma.nguoihienmau.update({ where: { manguoihien: phieu.manguoihien }, data: { nhommau, rhesus } });
    }

    // Cập nhật trạng thái phiếu hiến sang COLLECTED (đã có kết quả xét nghiệm)
    const updated = await prisma.phieuhienmau.update({
      where: { maphieuhien: id },
      data: { trangthai: PHIEU_HIEN_STATUS.COLLECTED },
      include: { nguoihienmau: true, nhanvienyte: true },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePhieuHienMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    res.status(405).json({ error: 'Không cho phép xóa phiếu hiến theo quy định nghiệp vụ' });
  } catch (error) {
    next(error);
  }
};
