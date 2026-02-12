import type { NextFunction, Request, Response } from 'express';

import { Tour } from '../models/tour-model.ts';
import { AppError } from '../utils/app-error.ts';
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
  _: Response,
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

export const getTourStats = catchAsync(async (_, response) => {
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
});

export const getMonthlyPlan = catchAsync(async (request, response) => {
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
});

export const getToursWithin = catchAsync(async (request, response, next) => {
  const { distance, latlng, unit } = request.params;
  const [lat, lng] = (latlng as string).split(',');
  const radius = unit === 'mi' ? +distance / 3963.2 : +distance / 6378.1;
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lng,lng.',
        400,
      ),
    );
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  response
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

export const getDistances = catchAsync(async (request, response, next) => {
  const { latlng, unit } = request.params;
  const [lat, lng] = (latlng as string).split(',');
  const distanceMultiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lng,lng.',
        400,
      ),
    );
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [+lng, +lat] },
        distanceField: 'distance',
        distanceMultiplier,
      },
    },
    { $project: { distance: 1, name: 1 } },
  ]);
  response.status(200).json({ status: 'success', data: { distances } });
});
