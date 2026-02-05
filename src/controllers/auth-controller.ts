import type { NextFunction, Request, Response } from 'express';

import { User } from '../models/user-model.ts';
import { catchAsync } from '../utils/catchAsync.ts';

export const signUp = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const user = await User.create(request.body);
    response.status(201).json({ status: 'success', data: { user } });
  },
);
