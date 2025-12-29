import { Request, Response, NextFunction } from 'express';
import reportService from '../services/report.service';
import tuimauService from '../services/tuimau.service';

export const getMonthlyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { year, month } = req.query;

    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;

    const report = await reportService.getComprehensiveMonthlyReport(
      currentYear,
      currentMonth
    );

    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getBloodInventory = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const inventory = await tuimauService.getInventoryByBloodType();
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const getComprehensiveInventory = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const inventory = await tuimauService.getComprehensiveInventory();
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const getExpiringBlood = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const expiringBags = await tuimauService.getExpiringBloodBags(days);

    res.json({
      days,
      count: expiringBags.length,
      bags: expiringBags,
    });
  } catch (error) {
    next(error);
  }
};

export const getExpiredBlood = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const expiredBags = await tuimauService.getExpiredBloodBags();

    res.json({
      count: expiredBags.length,
      bags: expiredBags,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockAlert = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
    const lowStock = await tuimauService.checkLowStock(threshold);

    res.json({
      threshold,
      lowStockTypes: lowStock,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await reportService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getDonorActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate as string) : new Date();

    const report = await reportService.getDonorActivityReport(start, end);
    res.json(report);
  } catch (error) {
    next(error);
  }
};
