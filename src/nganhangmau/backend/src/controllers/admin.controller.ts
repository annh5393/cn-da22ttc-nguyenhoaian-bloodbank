import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middlewares/auth';
import bcrypt from 'bcryptjs';


export const setNguoiHienStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { trangthai } = req.body as { trangthai?: 'HOAT_DONG' | 'NGUNG_HOAT_DONG' };
    
    // Kiểm tra quyền Admin
    if (req.user?.vaitro !== 'Admin') {
      res.status(403).json({ error: 'Chỉ Admin mới có quyền thực hiện' });
      return;
    }

    const nguoihien = await prisma.nguoihienmau.findUnique({
      where: { manguoihien: id },
    });

    if (!nguoihien) {
      res.status(404).json({ error: 'Không tìm thấy người hiến máu' });
      return;
    }

    if (!trangthai || !['HOAT_DONG','NGUNG_HOAT_DONG'].includes(trangthai)) {
      res.status(400).json({ error: 'Thiếu hoặc sai định dạng trường trangthai' });
      return;
    }

    const updated = await prisma.nguoihienmau.update({
      where: { manguoihien: id },
      data: { trangthai },
      select: {
        manguoihien: true,
        hotennguoihien: true,
        sodienthoai: true,
        trangthai: true,
      },
    });

    res.json({ message: 'Cập nhật trạng thái người hiến thành công', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle trạng thái active/inactive của nhân viên y tế
 */
export const setNhanVienStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { trangthai } = req.body as { trangthai?: 'HOAT_DONG' | 'NGUNG_HOAT_DONG' };
    
    if (req.user?.vaitro !== 'Admin') {
      res.status(403).json({ error: 'Chỉ Admin mới có quyền thực hiện' });
      return;
    }

    const nhanvien = await prisma.nhanvienyte.findUnique({
      where: { manvyt: id },
    });

    if (!nhanvien) {
      res.status(404).json({ error: 'Không tìm thấy nhân viên' });
      return;
    }

    // Không cho vô hiệu hóa chính mình
    if (id === req.user?.manvyt && trangthai === 'NGUNG_HOAT_DONG') {
      res.status(400).json({ error: 'Không thể vô hiệu hóa tài khoản của chính mình' });
      return;
    }

    if (!trangthai || !['HOAT_DONG','NGUNG_HOAT_DONG'].includes(trangthai)) {
      res.status(400).json({ error: 'Thiếu hoặc sai định dạng trường trangthai' });
      return;
    }

    const updated = await prisma.nhanvienyte.update({
      where: { manvyt: id },
      data: { trangthai },
      select: {
        manvyt: true,
        hotennvyt: true,
        vaitro: true,
        trangthai: true,
      },
    });

    res.json({ message: 'Cập nhật trạng thái nhân viên thành công', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset mật khẩu người hiến máu về mặc định (123456)
 */
export const resetNguoiHienPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    res.status(405).json({ error: 'Không hỗ trợ reset mật khẩu trên schema hiện tại' });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset mật khẩu nhân viên y tế về mặc định (123456)
 */
export const resetNhanVienPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    res.status(405).json({ error: 'Không hỗ trợ reset mật khẩu trên schema hiện tại' });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách tất cả người hiến (bao gồm cả inactive)
 * Chỉ dành cho Admin
 */
export const getAllNguoiHienForAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.vaitro !== 'Admin') {
      res.status(403).json({ error: 'Chỉ Admin mới có quyền xem' });
      return;
    }

    const nguoihienmau = await prisma.nguoihienmau.findMany({
      select: {
        manguoihien: true,
        hotennguoihien: true,
        sodienthoai: true,
        nhommau: true,
        rhesus: true,
        _count: {
          select: {
            phieuhienmau: true,
            phieukham: true,
          },
        },
      },
      orderBy: { hotennguoihien: 'asc' },
    });

    res.json(nguoihienmau);
  } catch (error) {
    next(error);
  }
};

/**
 * STAFF MANAGEMENT FUNCTIONS
 * Alias từ nhanvienyte controller để tương thích với routes cũ
 */

/**
 * Tạo tài khoản nhân viên mới
 */
export const createStaffAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { manvyt, hotennvyt, ngaysinh, gioitinh, diachi, sodienthoai, vaitro, trangthai, email, password } = req.body;

    // Validate required fields
    if (!manvyt || !hotennvyt || !email || !vaitro) {
      res.status(400).json({ error: 'Thiếu thông tin bắt buộc: manvyt, hotennvyt, email, vaitro' });
      return;
    }

    // Check if staff ID already exists
    const existingStaff = await prisma.nhanvienyte.findUnique({
      where: { manvyt }
    });

    if (existingStaff) {
      res.status(400).json({ error: 'Mã nhân viên đã tồn tại' });
      return;
    }

    // Check if email already exists
    const existingEmail = await prisma.nhanvienyte.findFirst({
      where: { emailnv: email }
    });

    if (existingEmail) {
      res.status(400).json({ error: 'Email đã được sử dụng' });
      return;
    }

    // Generate temporary password if not provided
    const tempPassword = password || `${manvyt}@2024`;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create Staff record with password
    const nhanvien = await prisma.nhanvienyte.create({
      data: {
        manvyt,
        hotennvyt,
        ngaysinhNV: ngaysinh ? new Date(ngaysinh) : null,
        gioitinhNV: gioitinh,
        emailnv: email,
        passwordNV: hashedPassword,
        diachinv: diachi,
        sodienthoainv: sodienthoai,
        vaitro,
        trangthai: trangthai || 'HOAT_DONG',
        ngaytao: new Date(),
      },
    });

    res.status(201).json({ 
      message: 'Tạo tài khoản nhân viên thành công',
      staff: {
        ...nhanvien,
        passwordNV: undefined, // Don't return password
      },
      tempPassword: password ? undefined : tempPassword, // Return temp password only if auto-generated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách tất cả nhân viên
 */
export const getAllStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    const staff = await prisma.nhanvienyte.findMany({
      orderBy: {
        hotennvyt: 'asc',
      },
    });
    res.json(staff);
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin nhân viên
 */
export const updateStaffAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { hotennvyt, ngaysinh, gioitinh, diachi, sodienthoai, vaitro, trangthai, email, password } = req.body;

    const updateData: any = {
      hotennvyt,
      ngaysinhNV: ngaysinh ? new Date(ngaysinh) : undefined,
      gioitinhNV: gioitinh,
      diachinv: diachi,
      sodienthoainv: sodienthoai,
      vaitro,
      trangthai,
    };

    // Update email if provided
    if (email) {
      updateData.emailnv = email;
    }

    // Hash and update password if provided
    if (password) {
      updateData.passwordNV = await bcrypt.hash(password, 10);
    }

    const nhanvien = await prisma.nhanvienyte.update({
      where: { manvyt: id },
      data: updateData,
    });

    res.json({
      ...nhanvien,
      passwordNV: undefined, // Don't return password
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa (soft delete) tài khoản nhân viên
 */
export const deleteStaffAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Không cho xóa chính mình
    const user = (req as AuthRequest).user;
    if (id === user?.manvyt) {
      res.status(400).json({ error: 'Không thể xóa tài khoản của chính mình' });
      return;
    }

    // Soft delete
    const updated = await prisma.nhanvienyte.update({ where: { manvyt: id }, data: { trangthai: 'NGUNG_HOAT_DONG' } });
    res.json({ message: 'Đã chuyển tài khoản nhân viên sang trạng thái NGUNG_HOAT_DONG', data: updated });
  } catch (error) {
    next(error);
  }
};
