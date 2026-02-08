import type { NextFunction, Request, Response } from 'express';

import { Review } from '../models/review-model.ts';
import { catchAsync } from '../utils/catchAsync.ts';

export const getReviews = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const reviews = await Review.find();
    response
      .status(200)
      .json({ status: 'success', results: reviews.length, data: { reviews } });
  },
);

export const createReview = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const review = await Review.create({
      text: request.body.text,
      rating: request.body.rating,
      tour: request.body.tour,
      author: request.user.id,
    });
    response.status(201).json({ status: 'success', data: { review } });
  },
);
