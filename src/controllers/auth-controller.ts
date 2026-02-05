import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';

import { User } from '../models/user-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';

const signToken = (id: Types.ObjectId) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });

export const signUp = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const user = await User.create({
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
      confirmPassword: request.body.confirmPassword,
    });
    const token = signToken(user._id);
    response.status(201).json({ status: 'success', token, data: { user } });
  },
);

export const login = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const { email, password } = request.body;
    if (!email || !password)
      return next(new AppError('Please enter email and password', 400));
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.isCorrectPassword(password, user.password)))
      return next(new AppError('Invalid credentials', 401));
    const token = signToken(user._id);
    response.status(200).json({ status: 'success', token });
  },
);
