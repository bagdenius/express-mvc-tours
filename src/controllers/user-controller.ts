import type { NextFunction, Request, Response } from 'express';

import { User } from '../models/user-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';

function filterObjectByKeys<T, K extends keyof T>(object: T, ...keys: K[]) {
  const filtered = {} as Pick<T, K>;
  for (const key of keys) filtered[key] = object[key];
  return filtered;
}

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

export const updateInfo = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    if (request.body.password || request.body.confirmPassword)
      return next(
        new AppError(
          'This route is not for password updates. Please use /change-password',
          400,
        ),
      );
    const filteredBody = filterObjectByKeys(request.body, 'name', 'email');
    const user = await User.findByIdAndUpdate(request.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });
    response.status(200).json({ status: 'success', data: { user } });
  },
);

export const deleteProfile = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(request.user.id, { isActive: false });
    response.status(204).json({ status: 'success', data: null });
  },
);
