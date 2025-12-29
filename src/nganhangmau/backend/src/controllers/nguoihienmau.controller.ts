import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

// Get all nguoihienmau
export const getAllNguoiHienMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, blood, status, page = '1', pageSize = '10' } = req.query as Record<string, string>;

    const where: any = {};

    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { hotennguoihien: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { sodienthoai: { contains: term } },
      ];
    }

    if (status && status.trim()) {
      where.trangthai = status.trim();
    }

    if (blood && blood.trim()) {
      const b = blood.trim();
      if (b.toLowerCase() === 'unknown') {
        where.AND = [...(where.AND || []), { nhommau: null }, { rhesus: null }];
      } else {
        const match = b.match(/^(O|A|B|AB)([+-])$/);
        if (!match) {
          res.status(400).json({ error: 'Định dạng bộ lọc nhóm máu không hợp lệ. Ví dụ: A+, O-, AB+, hoặc unknown' });
          return;
        }
        const [, abo, rh] = match;
        where.AND = [...(where.AND || []), { nhommau: abo }, { rhesus: rh }];
      }
    }

    const take = Math.max(1, Math.min(100, Number(pageSize) || 10));
    const currentPage = Math.max(1, Number(page) || 1);
    const skip = (currentPage - 1) * take;

    const total = await prisma.nguoihienmau.count({ where });
    const donorsRaw = await prisma.nguoihienmau.findMany({
      where,
      include: {
        phieuhienmau: true,
        phieukham: true,
        tuimau: true,
      },
      orderBy: { hotennguoihien: 'asc' },
      skip,
      take,
    });

    // Hide blood unless donor has confirmed donation
    const donors = donorsRaw.map((d) => {
      const hasConfirmedDonation = d.phieuhienmau?.some((p) => ['COLLECTED', 'STORED'].includes(p.trangthai || ''));
      return {
        ...d,
        nhommau: hasConfirmedDonation ? d.nhommau : null,
        rhesus: hasConfirmedDonation ? d.rhesus : null,
      };
    });

    res.json({
      data: donors,
      pagination: {
        page: currentPage,
        limit: take,
        total,
        totalPages: Math.max(1, Math.ceil(total / take)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get nguoihienmau by ID
export const getNguoiHienMauById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    // Donor can only view their own profile
    if (req.user?.vaitro === 'Người hiến máu' && req.user.manvyt !== id) {
      res.status(403).json({ error: 'Không có quyền xem thông tin người khác' });
      return;
    }
    const nguoihienmau = await prisma.nguoihienmau.findUnique({
      where: { manguoihien: id },
      include: {
        phieuhienmau: true,
        phieukham: true,
        tuimau: true,
      },
    });

    if (!nguoihienmau) {
      res.status(404).json({ error: 'Không tìm thấy người hiến máu nào với ID '+ id });
      return;
    }
    // Hide blood unless confirmed donation exists
    const hasConfirmedDonation = nguoihienmau.phieuhienmau?.some((p) => ['COLLECTED', 'STORED'].includes(p.trangthai || ''));
    const sanitized = {
      ...nguoihienmau,
      nhommau: hasConfirmedDonation ? nguoihienmau.nhommau : null,
      rhesus: hasConfirmedDonation ? nguoihienmau.rhesus : null,
    };

    res.json(sanitized);
  } catch (error) {
    next(error);
  }
};

// Create nguoihienmau
export const createNguoiHienMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { manguoihien, hotennguoihien, email, ngaysinh, gioitinh, diachi, sodienthoai, trangthai } = req.body;

    const nguoihienmau = await prisma.nguoihienmau.create({
      data: {
        manguoihien,
        hotennguoihien,
        email: email || null,
        ngaysinh: ngaysinh ? new Date(ngaysinh) : null,
        gioitinh,
        diachi,
        sodienthoai,
        // Blood type must be unknown at creation
        nhommau: null,
        rhesus: null,
        trangthai: trangthai || 'HOẠT ĐỘNG',
      },
    });
    res.status(201).json(nguoihienmau);
  } catch (error) {
    next(error);
  }
};

// Update nguoihienmau
export const updateNguoiHienMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { hotennguoihien, ngaysinh, gioitinh, diachi, sodienthoai, email, nhommau, rhesus, trangthai } = req.body;

    // Business rule: blood type is only updated via lab-confirmation on a valid donation
    if (typeof nhommau !== 'undefined' || typeof rhesus !== 'undefined') {
      res.status(400).json({ error: 'Không cập nhật nhóm máu/Rh tại đây. Vui lòng xác nhận xét nghiệm qua phiếu hiến hợp lệ.' });
      return;
    }

    const nguoihienmau = await prisma.nguoihienmau.update({
      where: { manguoihien: id },
      data: {
        hotennguoihien,
        ngaysinh: ngaysinh ? new Date(ngaysinh) : undefined,
        gioitinh,
        diachi,
        sodienthoai,
        email: typeof email === 'string' ? email : undefined,
        trangthai,
      },
    });

    res.json(nguoihienmau);
  } catch (error) {
    next(error);
  }
};

// Delete nguoihienmau
export const deleteNguoiHienMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.nguoihienmau.update({
      where: { manguoihien: id },
      data: { trangthai: 'NGƯNG HOẠT ĐỘNG' },
    });
    res.json({ message: 'Đã chuyển sang trạng thái NGƯNG HOẠT ĐỘNG', data: updated });
  } catch (error) {
    next(error);
  }
};
