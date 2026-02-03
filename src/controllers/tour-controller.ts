import type { NextFunction, Request, Response } from 'express';

import { Tour } from '~/models/tour-model.js';
import { QueryBuilder } from '~/utils/query-builder.js';

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

export async function getTours(request: Request, response: Response) {
  try {
    const queryBuilder = new QueryBuilder(Tour.find(), request.query)
      .filter()
      .sort()
      .selectFields()
      .paginate();
    const tours = await queryBuilder.query;
    response
      .status(200)
      .json({ status: 'success', results: tours.length, data: { tours } });
  } catch (error) {
    response.status(404).json({ status: 'fail', message: error });
  }
}

export async function getTour(request: Request, response: Response) {
  try {
    const tour = await Tour.findById(request.params.id);
    response.status(200).json({ status: 'success', data: { tour } });
  } catch (error) {
    response.status(404).json({ status: 'fail', message: error });
  }
}

export async function createTour(request: Request, response: Response) {
  try {
    const tour = await Tour.create(request.body);
    response.status(201).json({ status: 'success', data: { tour } });
  } catch (error) {
    response.status(400).json({ status: 'fail', message: error });
  }
}

export async function updateTour(request: Request, response: Response) {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });
    response.status(200).json({ status: 'success', data: { tour } });
  } catch (error) {
    response.status(404).json({ status: 'fail', message: error });
  }
}

export async function deleteTour(request: Request, response: Response) {
  try {
    await Tour.findByIdAndDelete(request.params.id);
    response.status(204).send();
  } catch (error) {
    response.status(404).json({ status: 'fail', message: error });
  }
}

export async function getTourStats(reques: Request, response: Response) {
  try {
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
  } catch (error) {
    response.status(404).json({ status: 'fail', message: error });
  }
}

export async function getMonthlyPlan(request: Request, response: Response) {
  try {
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
  } catch (error) {
    response.status(404).json({ status: 'fail', message: error });
  }
}
