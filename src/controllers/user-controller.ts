import type { NextFunction, Request, Response } from 'express';

import { User } from '../models/user-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handler-factory.ts';

function filterObjectByKeys<T, K extends keyof T>(object: T, ...keys: K[]) {
  const filtered = {} as Pick<T, K>;
  for (const key of keys) filtered[key] = object[key];
  return filtered;
}

export const getUsers = getAll(User);
export const getUser = getOne(User);
export const createUser = createOne(User);
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);

export const setCurrentUser = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  request.params.id = request.user.id;
  next();
};

export const updateProfile = catchAsync(async (request, response, next) => {
  if (request.body.password || request.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for password updates. Please use /change-password',
        400,
      ),
    );
  const filteredBody = filterObjectByKeys(request.body, 'name', 'email');
  const user = await User.findByIdAndUpdate(request.user!.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  response.status(200).json({ status: 'success', data: { user } });
});

export const deleteProfile = catchAsync(async (request, response, _next) => {
  await User.findByIdAndUpdate(request.user!.id, { isActive: false });
  response.status(204).json({ status: 'success', data: null });
});
