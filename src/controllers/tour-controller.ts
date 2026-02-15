import type { NextFunction, Request, Response } from 'express';
import multer, { type FileFilterCallback } from 'multer';
import sharp from 'sharp';

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
export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeTourImages = catchAsync(async (request, response, next) => {
  const files = request.files as {
    imageCover?: Express.Multer.File[];
    images?: Express.Multer.File[];
  };
  const imageCover = files.imageCover;
  const images = files.images;
  if (!imageCover || !images) return next();
  const timestamp = Date.now();
  const outputDirectory = 'public/img/tours';
  // cover image
  request.body.imageCover = `tour-${request.params.id}-${timestamp}-cover.webp`;
  await sharp(imageCover[0].buffer)
    .resize(1920, 1280)
    .toFormat('webp')
    .webp({ quality: 80 })
    .toFile(`${outputDirectory}/${request.body.imageCover}`);
  // other images
  request.body.images = [];
  await Promise.all(
    images.map(async (file, i) => {
      const filename = `tour-${request.params.id}-${timestamp}-${i + 1}.webp`;
      await sharp(file.buffer)
        .resize(1920, 1280)
        .toFormat('webp')
        .webp({ quality: 80 })
        .toFile(`${outputDirectory}/${filename}`);
      request.body.images.push(filename);
    }),
  );
  next();
});

export function aliasTopTours(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  Object.assign(request.query, {
    limit: '5',
    sort: '-averageRating,price',
    fields: 'name,price,averageRating,summary,difficulty',
  });
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

export const getTourStats = catchAsync(async (request, response, _next) => {
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

export const getMonthlyPlan = catchAsync(async (request, response, _next) => {
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
