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
