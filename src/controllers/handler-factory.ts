import type { NextFunction, Request, Response } from 'express';
import type { Model } from 'mongoose';

import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';

export const createOne = <T>(Model: Model<T>) =>
  catchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
      const document = await Model.create(request.body);
      response.status(201).json({
        status: 'success',
        data: { [`${Model.modelName.toLowerCase()}`]: document },
      });
    },
  );

export const updateOne = <T>(Model: Model<T>) =>
  catchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
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
    },
  );

export const deleteOne = <T>(Model: Model<T>) =>
  catchAsync(
    async (request: Request, response: Response, next: NextFunction) => {
      const document = await Model.findByIdAndDelete(request.params.id);
      if (!document) return next(new AppError(`${Model.modelName}`, 404));
      response.status(204).send();
    },
  );
