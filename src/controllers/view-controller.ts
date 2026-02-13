import type { Request, Response } from 'express';

import { Tour } from '../models/tour-model.ts';
import { User } from '../models/user-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';

export const getOverview = catchAsync(async (_request, response, _next) => {
  const tours = await Tour.find();
  response.status(200).render('overview', { title: 'All tours', tours });
});

export const getTour = catchAsync(async (request, response, next) => {
  const { slug } = request.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'user text rating',
  });
  if (!tour) return next(new AppError('Tour not found', 404));
  response.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

export const getLoginForm = (_request: Request, response: Response) => {
  response.status(200).render('login', { title: 'Log into your account' });
};

export const getProfile = (_request: Request, response: Response) => {
  response.status(200).render('profile', { title: 'Profile' });
};

export const updateUserData = catchAsync(async (request, response, _next) => {
  const { name, email } = request.body;
  const user = await User.findByIdAndUpdate(
    request.user._id,
    { name, email },
    { new: true, runValidators: true },
  );
  response.status(200).render('profile', { title: 'Profile', user });
});
