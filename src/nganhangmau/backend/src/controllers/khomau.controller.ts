import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const getAllKhoMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    void req;
    const khomau = await prisma.khomau.findMany({
      include: {
        tuimau: true,
        phutrach: {
          include: {
            nhanvienyte: true,
          },
        },
      },
    });
    res.json(khomau);
  } catch (error) {
    next(error);
  }
};

export const getKhoMauById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const khomau = await prisma.khomau.findUnique({
      where: { makho: id },
      include: {
        tuimau: true,
        phutrach: {
          include: {
            nhanvienyte: true,
          },
        },
      },
    });

    if (!khomau) {
      res.status(404).json({ error: 'Kho mau not found' });
      return;
    }

    res.json(khomau);
  } catch (error) {
    next(error);
  }
};

export const createKhoMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { makho, tenvitri, nhietdobaoquan } = req.body;

    const khomau = await prisma.khomau.create({
      data: {
        makho,
        tenvitri,
        nhietdobaoquan,
      },
    });

    res.status(201).json(khomau);
  } catch (error) {
    next(error);
  }
};

export const updateKhoMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { tenvitri, nhietdobaoquan } = req.body;

    const khomau = await prisma.khomau.update({
      where: { makho: id },
      data: {
        tenvitri,
        nhietdobaoquan,
      },
    });

    res.json(khomau);
  } catch (error) {
    next(error);
  }
};

export const deleteKhoMau = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.khomau.delete({
      where: { makho: id },
    });

    res.json({ message: 'Kho mau deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Assign staff to warehouse
export const assignStaffToKho = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { makho, manvyt, ngayphutrach } = req.body;

    const phutrach = await prisma.phutrach.create({
      data: {
        makho,
        manvyt,
        ngayphutrach: ngayphutrach ? new Date(ngayphutrach) : new Date(),
      },
    });

    res.status(201).json(phutrach);
  } catch (error) {
    next(error);
  }
};

// Remove staff from warehouse
export const removeStaffFromKho = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { makho, manvyt } = req.body;

    await prisma.phutrach.delete({
      where: {
        manvyt_makho: {
          manvyt,
          makho,
        },
      },
    });

    res.json({ message: 'Staff removed from warehouse successfully' });
  } catch (error) {
    next(error);
  }
};
