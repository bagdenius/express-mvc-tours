import type { NextFunction, Request, Response } from 'express';

import { Review } from '../models/review-model.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { createOne, deleteOne, updateOne } from './handler-factory.ts';

export const getReviews = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    let filter = {};
    if (request.params.tourId) filter = { tour: request.params.tourId };
    const reviews = await Review.find(filter);
    response
      .status(200)
      .json({ status: 'success', results: reviews.length, data: { reviews } });
  },
);

export const setTourUserIds = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (!request.body.tour) request.body.tour = request.params.tourId;
  if (!request.body.user) request.body.user = request.user.id;
  next();
};

export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);
