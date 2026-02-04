import type { NextFunction, Request, Response } from 'express';

import type { AppError } from '../utils/app-error.ts';

function sendErrorDevelopment(error: AppError, response: Response) {
  response.status(error.code).json({
    status: error.status,
    message: error.message,
    error: error,
    stack: error.stack,
  });
}

function sendErrorProduction(error: AppError, response: Response) {
  if (error.isOperational)
    response
      .status(error.code)
      .json({ status: error.status, message: error.message });
  else {
    console.error('ERROR 💥', error);

    response
      .status(500)
      .json({ status: 'error', message: 'Something went wrong!' });
  }
}

export function globalErrorHandler(
  error: AppError,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  error.code = error.code || 500;
  error.status = error.status || 'error';
  if (process.env.NODE_ENV === 'development')
    sendErrorDevelopment(error, response);
  else if (process.env.NODE_ENV === 'production')
    sendErrorProduction(error, response);
}
