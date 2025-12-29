import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        manvyt: string;
        vaitro: string;
      };
    }
  }
}
