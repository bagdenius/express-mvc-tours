import type { Request, Response } from 'express';

import { Tour } from '../models/tour-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';

export const getOverview = catchAsync(async (_, response) => {
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

export const getLoginForm = (_: Request, response: Response) => {
  response.status(200).render('login', { title: 'Log into your account' });
};
