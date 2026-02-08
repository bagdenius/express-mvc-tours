import type { NextFunction, Request, Response } from 'express';

import { Review } from '../models/review-model.ts';
import { catchAsync } from '../utils/catchAsync.ts';

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

export const createReview = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    if (!request.body.tour) request.body.tour = request.params.tourId;
    if (!request.body.user) request.body.user = request.user.id;
    const review = await Review.create({
      text: request.body.text,
      rating: request.body.rating,
      tour: request.body.tour,
      author: request.body.user,
    });
    response.status(201).json({ status: 'success', data: { review } });
  },
);
