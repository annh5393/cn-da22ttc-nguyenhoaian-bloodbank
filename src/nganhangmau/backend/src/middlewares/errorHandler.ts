import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        res.status(409).json({
          error: 'Duplicate entry',
          details: `${err.meta?.target} already exists`,
        });
        return;
      case 'P2025':
        res.status(404).json({
          error: 'Record not found',
        });
        return;
      case 'P2003':
        res.status(400).json({
          error: 'Foreign key constraint failed',
        });
        return;
      default:
        res.status(400).json({
          error: 'Database error',
          code: err.code,
        });
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.message,
    });
    return;
  }

  // Default error
  console.error('Detailed error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

export default errorHandler;