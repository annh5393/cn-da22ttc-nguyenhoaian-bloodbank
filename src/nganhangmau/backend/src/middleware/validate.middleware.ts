import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware to validate request body using Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate and parse the request body
      const validated = await schema.parseAsync(req.body);
      
      // Replace req.body with validated data (type-safe and sanitized)
      req.body = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors for better readability
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        res.status(400).json({
          error: 'Dữ liệu không hợp lệ',
          details: errors,
          // Also include flattened errors for easier frontend handling
          fieldErrors: error.flatten().fieldErrors
        });
        return;
      }

      // Handle other errors
      console.error('Validation error:', error);
      res.status(500).json({
        error: 'Lỗi xác thực dữ liệu',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  };
};

/**
 * Middleware to validate request query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        res.status(400).json({
          error: 'Tham số không hợp lệ',
          details: errors,
          fieldErrors: error.flatten().fieldErrors
        });
        return;
      }

      console.error('Query validation error:', error);
      res.status(500).json({
        error: 'Lỗi xác thực tham số',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  };
};

/**
 * Middleware to validate request params
 */
export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        res.status(400).json({
          error: 'Tham số đường dẫn không hợp lệ',
          details: errors,
          fieldErrors: error.flatten().fieldErrors
        });
        return;
      }

      console.error('Params validation error:', error);
      res.status(500).json({
        error: 'Lỗi xác thực tham số đường dẫn',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      return;
    }
  };
};
