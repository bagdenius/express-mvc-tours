import type { NextFunction, Request, Response } from 'express';

import { User } from '../models/user-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';

export const getUsers = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const users = await User.find();
    response
      .status(200)
      .json({ status: 'success', results: users.length, data: { users } });
  },
);

export const getUser = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const user = await User.findById(request.params.id);
    if (!user) return next(new AppError('User not found', 404));
    response.status(200).json({ status: 'success', data: { user } });
  },
);

export function createUser(request: Request, response: Response) {
  response
    .status(500)
    .json({ status: 'error', message: 'Route is not defined!' });
}

export function updateUser(request: Request, response: Response) {
  response
    .status(500)
    .json({ status: 'error', message: 'Route is not defined!' });
}

export function deleteUser(request: Request, response: Response) {
  response
    .status(500)
    .json({ status: 'error', message: 'Route is not defined!' });
}
