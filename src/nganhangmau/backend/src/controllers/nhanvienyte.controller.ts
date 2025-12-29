import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import prisma from '../config/prisma';

export const getAllNhanVienYTe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    const nhanvienyte = await prisma.nhanvienyte.findMany();
    res.json(nhanvienyte);
  } catch (error) {
    next(error);
  }
};

export const getNhanVienYTeById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    // Staff can only view own profile; Admin can view any
    const isAdmin = req.user?.vaitro === 'Admin';
    const isSelf = req.user?.manvyt === id;
    if (!isAdmin && !isSelf) {
      res.status(403).json({ error: 'Chỉ được xem hồ sơ của chính mình' });
      return;
    }
    const nhanvienyte = await prisma.nhanvienyte.findUnique({
      where: { manvyt: id },
      include: {
        phieuhienmau: true,
        phieukham: true,
        phutrach: true,
      },
    });

    if (!nhanvienyte) {
      res.status(404).json({ error: `Khong tim thay Nhan vien y te ${id}` });
      return;
    }

    res.json(nhanvienyte);
  } catch (error) {
    next(error);
  }
};

export const createNhanVienYTe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { manvyt, hotennvyt, ngaysinh, gioitinh, diachi, sodienthoai, vaitro } = req.body;

    const nhanvienyte = await prisma.nhanvienyte.create({
      data: {
        manvyt,
        hotennvyt,
        ngaysinh: ngaysinh ? new Date(ngaysinh) : null,
        gioitinh,
        diachi,
        sodienthoai,
        vaitro,
      },
    });

    res.status(201).json(nhanvienyte);
  } catch (error) {
    next(error);
  }
};

export const updateNhanVienYTe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { hotennvyt, ngaysinh, ngaysinhnv, gioitinh, diachi, sodienthoai, vaitro, email } = req.body as any;
    const isAdmin = req.user?.vaitro === 'Admin';
    const isSelf = req.user?.manvyt === id;

    // Only Admin or the owner can update. Staff cannot change role.
    if (!isAdmin && !isSelf) {
      res.status(403).json({ error: 'Chỉ được cập nhật hồ sơ của chính mình' });
      return;
    }

    const effectiveNgaySinh: Date | undefined = (ngaysinhnv || ngaysinh) ? new Date(ngaysinhnv || ngaysinh) : undefined;

    const nhanvienyte = await prisma.nhanvienyte.update({
      where: { manvyt: id },
      data: {
        hotennvyt,
        ngaysinhNV: effectiveNgaySinh,
        gioitinhNV: gioitinh,
        diachinv: diachi,
        sodienthoainv: sodienthoai,
        // Only Admin may update role
        vaitro: isAdmin ? vaitro : undefined,
        emailnv: email,
      },
    });

    res.json(nhanvienyte);
  } catch (error) {
    next(error);
  }
};

export const deleteNhanVienYTe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await prisma.nhanvienyte.update({ where: { manvyt: id }, data: { trangthai: 'NGUNG_HOAT_DONG' } });
    res.json({ message: 'Đã chuyển nhân viên sang trạng thái NGUNG_HOAT_DONG', data: updated });
  } catch (error) {
    next(error);
  }
};
