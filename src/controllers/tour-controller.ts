import type { NextFunction, Request, Response } from 'express';

import { Tour } from '../models/tour-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { QueryBuilder } from '../utils/query-builder.ts';
import { deleteOne } from './handler-factory.ts';

export function aliasTopTours(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  request.query = {
    ...request.query,
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };
  next();
}

export const getTours = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const queryBuilder = new QueryBuilder(Tour.find(), request.query)
      .filter()
      .sort()
      .selectFields()
      .paginate();
    const tours = await queryBuilder.query;
    response
      .status(200)
      .json({ status: 'success', results: tours.length, data: { tours } });
  },
);

export const getTour = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const tour = await Tour.findById(request.params.id).populate({
      path: 'reviews',
      select: 'text',
    });
    if (!tour) return next(new AppError('Tour not found', 404));
    response.status(200).json({ status: 'success', data: { tour } });
  },
);

export const createTour = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const tour = await Tour.create(request.body);
    response.status(201).json({ status: 'success', data: { tour } });
  },
);

export const updateTour = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) return next(new AppError('Tour not found', 404));
    response.status(200).json({ status: 'success', data: { tour } });
  },
);

export const deleteTour = deleteOne(Tour);

export const getTourStats = catchAsync(
  async (reques: Request, response: Response, next: NextFunction) => {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          toursCount: { $sum: 1 },
          ratingsCount: { $sum: '$ratingsQuantity' },
          averageRating: { $avg: '$ratingsAverage' },
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
