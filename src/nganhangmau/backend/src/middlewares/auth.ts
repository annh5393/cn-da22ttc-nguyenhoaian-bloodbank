import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    manvyt: string;
    vaitro: string;
    userType?: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      vaitro: string;
      userType?: string;
    };

    const normalizeRole = (role?: string) => {
      const r = (role || '').toUpperCase();
      if (r === 'ADMIN') return 'Admin';
      if (r === 'NHAN_VIEN_Y_TE' || r === 'STAFF') return 'Nhân viên y tế';
      if (r === 'NGUOI_HIEN_MAU' || r === 'DONOR') return 'Người hiến máu';
      return role || '';
    };

    // Map id to manvyt for consistency
    req.user = {
      manvyt: decoded.id,
      vaitro: normalizeRole(decoded.vaitro),
      userType: decoded.userType,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.vaitro)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};