import type { NextFunction, Request, Response } from 'express';

import { Tour } from '../models/tour-model.ts';
import { catchAsync } from '../utils/catchAsync.ts';

export const getOverview = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const tours = await Tour.find();
    response.status(200).render('overview', { title: 'All tours', tours });
  },
);

export const getTour = (request: Request, response: Response) => {
  response.status(200).render('tour', { title: 'Tour name placeholder' });
};
