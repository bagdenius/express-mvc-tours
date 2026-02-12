import type { Model } from 'mongoose';

import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { QueryBuilder } from '../utils/query-builder.ts';

export const getAll = <T>(Model: Model<T>) =>
  catchAsync(async (request, response, next) => {
    // workaround to allow nested get reviews on tour. FIX IT!
    let filter = {};
    if (request.params.tourId) filter = { tour: request.params.tourId };

    const queryBuilder = new QueryBuilder(Model.find(filter), request.query)
      .filter()
      .sort()
      .selectFields()
      .paginate();
    const documents = await queryBuilder.query;
    response.status(200).json({
      status: 'success',
      results: documents.length,
      data: { [`${Model.modelName.toLowerCase()}s`]: documents },
    });
  });

export const getOne = <T>(
  Model: Model<T>,
  populateOptions?: { path: string; select?: string },
) =>
  catchAsync(async (request, response, next) => {
    let query = Model.findById(request.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const document = await query;
    if (!document)
      return next(new AppError(`${Model.modelName} not found`, 404));
    response.status(200).json({
      status: 'success',
      data: { [`${Model.modelName.toLowerCase()}`]: document },
    });
  });

export const createOne = <T>(Model: Model<T>) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.create(request.body);
    response.status(201).json({
      status: 'success',
      data: { [`${Model.modelName.toLowerCase()}`]: document },
    });
  });

export const updateOne = <T>(Model: Model<T>) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!document)
      return next(new AppError(`${Model.modelName} not found`, 404));
    response.status(200).json({
      status: 'success',
      data: { [`${Model.modelName.toLowerCase()}`]: document },
    });
  });

export const deleteOne = <T>(Model: Model<T>) =>
  catchAsync(async (request, response, next) => {
    const document = await Model.findByIdAndDelete(request.params.id);
    if (!document) return next(new AppError(`${Model.modelName}`, 404));
    response.status(204).send();
  });
