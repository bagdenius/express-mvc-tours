import { promisify } from 'node:util';

import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Types } from 'mongoose';

import { User } from '../models/user-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';

const signToken = (id: Types.ObjectId) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });

const verifyToken = (token: string, secret: string): Promise<JwtPayload> =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decoded) => {
      if (error) return reject(error);
      resolve(decoded as JwtPayload);
    });
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
      return next(new AppError('Invalid email or password', 401));
    const token = signToken(user._id);
    response.status(200).json({ status: 'success', token });
  },
);

export const protect = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    let token;
    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('Bearer')
    ) {
      token = request.headers.authorization.split(' ').at(-1);
    }
    if (!token)
      return next(
        new AppError('You are not logged in. Please log in to get access', 401),
      );
    const decodedToken = await verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id);
    if (!user)
      return next(
        new AppError(
          'The user with this authentification token does no longer exist',
          401,
        ),
      );
    if (user.isPasswordChangedAfter(decodedToken.iat!))
      return next(
        new AppError(
          'Your password recently was changed. Please log in again',
          401,
        ),
      );
    request.user = user;
    next();
  },
);

export const restrictTo =
  (...roles: string[]) =>
  (request: Request, response: Response, next: NextFunction) => {
    if (!request.user || !roles.includes(request.user.role))
      return next(
        new AppError('You do not have permission on this action', 403),
      );
    next();
  };
