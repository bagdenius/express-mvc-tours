import type { NextFunction, Request, Response } from 'express';

import { Tour } from '~/models/tour-model.js';

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
    const {
      page: queryPage,
      sort: querySort,
      limit: queryLimit,
      fields: queryFields,
      ...queryObject
    } = request.query;

    // filter
    const searchQuery = JSON.parse(
      JSON.stringify({ ...queryObject }).replaceAll(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`,
      ),
    );
    let query = Tour.find(searchQuery);

    // sorting
    if (querySort) {
      const sortBy = querySort.split(',').join(' ');
      query = query.sort(sortBy);
    } else query = query.sort('-createdAt name');

    // fields select
    if (queryFields) {
      const fields = queryFields.split(',').join(' ');
      query = query.select(fields);
    } else query = query.select('-__v');

    // pagination
    const page = +queryPage || 1;
    const limit = +queryLimit || 20;
    const skip = (page - 1) * limit;
    if (queryPage) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist!');
    }
    query = query.skip(skip).limit(limit);

    // execute query
    const tours = await query;

    // send response
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
