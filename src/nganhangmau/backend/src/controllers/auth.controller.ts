import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

// (Removed) Unused helper: generateManvyt

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email) {
      res.status(400).json({ error: 'Thiếu email đăng nhập' });
      return;
    }

    // Try staff by emailnv first
    const staff = await prisma.nhanvienyte.findFirst({ where: { emailnv: email } });
    if (staff) {
      if (staff.trangthai === 'NGUNG_HOAT_DONG') {
        res.status(403).json({ error: 'Tài khoản đã ngưng hoạt động' });
        return;
      }

      // Verify password for staff
      if (!password) {
        res.status(400).json({ error: 'Thiếu mật khẩu' });
        return;
      }

      if (!staff.passwordNV) {
        res.status(401).json({ error: 'Tài khoản chưa được thiết lập mật khẩu' });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, staff.passwordNV);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'Mật khẩu không đúng' });
        return;
      }

      const token = jwt.sign(
        {
          id: staff.manvyt,
          vaitro: staff.vaitro || 'Nhân viên y tế',
          userType: 'nhanvien'
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          manvyt: staff.manvyt,
          hotennvyt: staff.hotennvyt,
          email: staff.emailnv,
          vaitro: staff.vaitro || 'Nhân viên y tế',
          ngaysinh: staff.ngaysinhNV,
          gioitinh: staff.gioitinhNV,
          diachi: staff.diachinv,
          sodienthoai: staff.sodienthoainv,
        },
      });
      return;
    }

    // Try donor by email
    const donor = await prisma.nguoihienmau.findFirst({ where: { email } });
    if (!donor) {
      res.status(401).json({ error: 'Email không tồn tại' });
      return;
    }
    if (donor.trangthai === 'NGUNG_HOAT_DONG') {
      res.status(403).json({ error: 'Tài khoản đã ngưng hoạt động' });
      return;
    }

    const token = jwt.sign(
      {
        id: donor.manguoihien,
        vaitro: 'Người hiến máu',
        userType: 'nguoihien'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        manguoihien: donor.manguoihien,
        hotennguoihien: donor.hotennguoihien,
        email: donor.email,
        vaitro: 'Người hiến máu',
        ngaysinh: donor.ngaysinh,
        gioitinh: donor.gioitinh,
        diachi: donor.diachi,
        sodienthoai: donor.sodienthoai,
      },
    });
  } catch (error) {
    next(error);
  }
};

function generateManguoihien(): string {
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `NH${random}`;
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { hotennguoihien, email, ngaysinh, gioitinh, diachi, sodienthoai } = req.body as {
      hotennguoihien?: string; email?: string; ngaysinh?: string | Date; gioitinh?: string; diachi?: string; sodienthoai?: string;
    };

    if (!email) {
      res.status(400).json({ error: 'Thiếu email' });
      return;
    }

    // Prevent duplicate email
    const existing = await prisma.nguoihienmau.findFirst({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email đã tồn tại' });
      return;
    }

    let manguoihien = generateManguoihien();
    // Ensure unique ID
    // eslint-disable-next-line no-constant-condition
    for (let i = 0; i < 5; i++) {
      const dupe = await prisma.nguoihienmau.findUnique({ where: { manguoihien } });
      if (!dupe) break;
      manguoihien = generateManguoihien();
    }

    const created = await prisma.nguoihienmau.create({
      data: {
        manguoihien,
        hotennguoihien: hotennguoihien || null,
        email,
        ngaysinh: ngaysinh ? new Date(ngaysinh) : null,
        gioitinh: gioitinh || null,
        diachi: diachi || null,
        sodienthoai: sodienthoai || null,
        // Blood type must be unknown at registration
        nhommau: null,
        rhesus: null,
        trangthai: 'HOAT_DONG',
      },
    });

    res.status(201).json({
      success: true,
      data: created,
      message: 'Đăng ký thành công',
    });
  } catch (error) {
    next(error);
  }
};
