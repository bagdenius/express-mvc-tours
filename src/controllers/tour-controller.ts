import type { NextFunction, Request, Response } from 'express';

import { Tour } from '../models/tour-model.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handler-factory.ts';

export function aliasTopTours(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  request.query = {
    ...request.query,
    limit: '5',
    sort: '-averageRating,price',
    fields: 'name,price,averageRating,summary,difficulty',
  };
  next();
}

export const getTours = getAll(Tour);
export const getTour = getOne(Tour, {
  path: 'reviews',
  select: 'text rating createdAt user',
});
export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);

export const getTourStats = catchAsync(
  async (reques: Request, response: Response, next: NextFunction) => {
    const stats = await Tour.aggregate([
      { $match: { averageRating: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          toursCount: { $sum: 1 },
          ratingsCount: { $sum: '$ratingCount' },
          averageRating: { $avg: '$averageRating' },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { averagePrice: 1 } },
    ]);
    response.status(200).json({ status: 'success', data: { stats } });
  },
);

export const getMonthlyPlan = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const year = +request.params.year!;
    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          tourStartsCount: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      { $project: { _id: 0 } },
      { $sort: { month: 1 } },
    ]);
    response.status(200).json({ status: 'success', data: { plan } });
  },
);
