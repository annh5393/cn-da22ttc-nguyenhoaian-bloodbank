import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { canEditPhieuKhamByFields } from '../utils/status';

export const getAllPhieuKham = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    // Chỉ lấy phiếu khám đang active (chưa bị xóa)
    const phieukham = await prisma.phieukham.findMany({
      include: {
        nguoihienmau: true,
        nhanvienyte: true,
      },
      orderBy: {
        ngaykham: 'desc',
      },
    });
    res.json(phieukham);
  } catch (error) {
    next(error);
  }
};

export const getPhieuKhamById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const phieukham = await prisma.phieukham.findFirst({
      where: { 
        maphieukham: id,
      },
      include: {
        nguoihienmau: true,
        nhanvienyte: true,
      },
    });

    if (!phieukham) {
      res.status(404).json({ error: 'Phiếu khám không tồn tại hoặc đã bị xóa' });
      return;
    }

    res.json(phieukham);
  } catch (error) {
    next(error);
  }
};

// Helper: generate unique maphieukham
async function generateMaPhieuKham(): Promise<string> {
  const count = await prisma.phieukham.count();
  return 'PK' + String(count + 1).padStart(4, '0');
}

export const createPhieuKham = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('📝 Received request body:', req.body);
    const { manguoihien, manvyt, ghichu, ngaykham, ketquasangloc } = req.body;

    // VALIDATION: Admin không được lập phiếu trực tiếp
    // Theo yêu cầu: "Admin không trực tiếp lập phiếu khám, phiếu hiến, nhập kho"
    const user = (req as any).user;
    if (user?.vaitro === 'Admin') {
      res.status(403).json({ 
        error: 'Admin không được phép lập phiếu khám trực tiếp',
        note: 'Chỉ Nhân viên y tế mới có quyền lập phiếu khám'
      });
      return;
    }

    // Validate required fields
    if (!manguoihien || !manvyt) {
      console.log('❌ Validation failed:', { manguoihien, manvyt });
      res.status(400).json({ 
        error: 'Thiếu thông tin bắt buộc: manguoihien, manvyt',
        received: { manguoihien, manvyt }
      });
      return;
    }

    // Generate unique ID
    const maphieukham = await generateMaPhieuKham();

    const phieukham = await prisma.phieukham.create({
      data: {
        maphieukham,
        manguoihien,
        manvyt,
        ghichu: ghichu || null,
        ngaytaophieukham: new Date(),
        ngaykham: ngaykham ? new Date(ngaykham) : null,
        ketquasangloc: ketquasangloc || null,
      },
      include: {
        nguoihienmau: true,
        nhanvienyte: true,
      },
    });

    res.status(201).json(phieukham);
  } catch (error) {
    next(error);
  }
};

export const updatePhieuKham = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { ghichu, ngaykham, ketquasangloc } = req.body;

    // Kiểm tra phiếu khám có tồn tại và đang active không
    const existing = await prisma.phieukham.findUnique({
      where: { maphieukham: id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Phiếu khám không tồn tại hoặc đã bị xóa' });
      return;
    }

    // Kiểm tra quyền sửa: chỉ cho phép sửa khi chưa có kết quả sàng lọc
    if (!canEditPhieuKhamByFields(existing.ketquasangloc)) {
      res.status(403).json({ 
        error: 'Không thể sửa phiếu khám đã có kết quả sàng lọc',
      });
      return;
    }

    const phieukham = await prisma.phieukham.update({
      where: { maphieukham: id },
      data: {
        ghichu,
        ngaykham: ngaykham ? new Date(ngaykham) : undefined,
        ketquasangloc,
      },
      include: {
        nguoihienmau: true,
        nhanvienyte: true,
      },
    });

    res.json(phieukham);
  } catch (error) {
    next(error);
  }
};

export const deletePhieuKham = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    res.status(405).json({ error: 'Không cho phép xóa phiếu khám theo quy định nghiệp vụ' });
  } catch (error) {
    next(error);
  }
};
