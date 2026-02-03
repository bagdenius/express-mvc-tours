import type { Request, Response } from 'express';

import { Tour } from '~/models/tour-model.js';

export async function getTours(request: Request, response: Response) {
  try {
    const { page, sort, limit, fields, ...queryObject } = request.query;
    const searchQuery = JSON.parse(
      JSON.stringify({ ...queryObject }).replaceAll(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`,
      ),
    );

    let query = Tour.find(searchQuery);

    if (sort) {
      const sortBy = sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else query = query.sort('-createdAt');

    const tours = await query;
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
