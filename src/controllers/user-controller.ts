import type { NextFunction, Request, Response } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import sharp from 'sharp';

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

const multerStorage = multer.memoryStorage();
const multerFilter = (
  request: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  if (file.mimetype.startsWith('image/')) callback(null, true);
  else callback(new AppError('Not an image. Please upload only images.', 400));
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    if (!request.user || !request.file) return next();
    request.file.filename = `user-${request.user.id}-${Date.now()}.webp`;
    await sharp(request.file.buffer)
      .resize(512, 512)
      .toFormat('webp')
      .webp({ quality: 80 })
      .toFile(`public/img/users/${request.file.filename}`);
    next();
  },
);

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
  if (request.user) request.params.id = request.user.id;
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
  if (request.file)
    Object.assign(filteredBody, { photo: request.file.filename });
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
