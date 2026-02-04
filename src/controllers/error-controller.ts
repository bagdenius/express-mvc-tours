import type { NextFunction, Request, Response } from 'express';

import type { AppError } from '../utils/app-error.ts';

export function globalErrorHandler(
  error: AppError,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  error.code = error.code || 500;
  error.status = error.status || 'error';
  response
    .status(error.code)
    .json({ status: error.status, message: error.message });
}
