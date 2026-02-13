import type { NextFunction, Request, Response } from 'express';
import { Error } from 'mongoose';

import { AppError } from '../utils/app-error.ts';

function handleCastErrorDB(error: Error.CastError) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(error: any) {
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/).at(0);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
}

function handleValidationErrorDB(error: Error.ValidationError) {
  const errors = Object.values(error.errors).map(
    (err, i) => `${i + 1}) ${err.message}`,
  );
  const message = `Invalid input data: ${errors.join('; ')}`;
  return new AppError(message, 400);
}

const handleJsonWebTokenError = () =>
  new AppError('Invalid authorization token. Please log in again', 401);

const handleTokenExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401);

function sendErrorDevelopment(
  error: any,
  request: Request,
  response: Response,
) {
  // api
  if (request.originalUrl.startsWith('/api'))
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: error,
      stack: error.stack,
    });
  // view
  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong...',
    message: error.message,
  });
}

// warn: kinda unreadable
function sendErrorProduction(error: any, request: Request, response: Response) {
  // api
  if (request.originalUrl.startsWith('/api')) {
    if (error.isOperational)
      return response
        .status(error.statusCode)
        .json({ status: error.status, message: error.message });
    console.error('ERROR 💥', error);
    return response
      .status(500)
      .json({ status: 'error', message: 'Something went wrong!' });
  }
  // view
  if (error.isOperational)
    return response.status(error.statusCode).render('error', {
      title: 'Something went wrong...',
      message: error.message,
    });
  console.error('ERROR 💥', error);
  return response.status(error.statusCode).render('error', {
    title: 'Something went wrong...',
    message: 'Please try again later',
  });
}

export function globalErrorHandler(
  err: any,
  request: Request,
  response: Response,
  _next: NextFunction,
) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development')
    return sendErrorDevelopment(err, request, response);
  if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'MongoServerError' && error.code === 11000)
      error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();
    sendErrorProduction(error, request, response);
  }
}
