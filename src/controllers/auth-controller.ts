import { createHash } from 'node:crypto';

import type { CookieOptions, NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Types } from 'mongoose';

import { User, type UserDocument } from '../models/user-model.ts';
import { AppError } from '../utils/app-error.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { sendEmail } from '../utils/email.ts';

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

const createSendToken = (
  user: UserDocument,
  statusCode: number,
  response: Response,
) => {
  const token = signToken(user._id);
  user.password = undefined!;
  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() + +process.env.JWT_EXPIRES_IN_COOKIE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  response
    .cookie('jwt', token, cookieOptions)
    .status(statusCode)
    .json({ status: 'success', token, data: { user } });
};

export const signUp = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const user = await User.create({
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
      confirmPassword: request.body.confirmPassword,
    });
    createSendToken(user, 201, response);
  },
);

export const login = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const { email, password } = request.body;
    console.log(email, password);

    if (!email || !password)
      return next(new AppError('Please enter email and password', 400));
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await User.isCorrectPassword(password, user.password)))
      return next(new AppError('Invalid email or password', 401));
    createSendToken(user, 200, response);
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
    } else if (request.cookies.jwt) token = request.cookies.jwt;
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

export const isLoggedIn = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const token = request.cookies.jwt;
    if (!token) return next();
    const decodedToken = await verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.id);
    if (!user) return next();
    if (user.isPasswordChangedAfter(decodedToken.iat!)) return next();
    response.locals.user = user;
    next();
  },
);

export const restrictTo =
  (...roles: ('user' | 'guide' | 'lead-guide' | 'admin')[]) =>
  (request: Request, response: Response, next: NextFunction) => {
    if (!request.user || !roles.includes(request.user.role))
      return next(
        new AppError('You do not have permission on this action', 403),
      );
    next();
  };

export const forgotPassword = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const user = await User.findOne({ email: request.body.email });
    if (!user)
      return next(new AppError('No user found with provided email', 404));
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `${request.protocol}://${request.get('host')}/api/v1/users/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password please ignore this message.`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });
    } catch (_) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          'An error occured while sending the email. Try again later',
          500,
        ),
      );
    }
    response
      .status(200)
      .json({ status: 'success', message: 'Token sent to email' });
  },
);

export const resetPassword = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const passwordResetToken = createHash('sha256')
      .update(request.params.token as string)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user)
      return next(
        new AppError('Password reset token is invalid or has expired', 400),
      );
    user.password = request.body.password;
    user.confirmPassword = request.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(user, 200, response);
  },
);

export const changePassword = catchAsync(
  async (request: Request, response: Response, next: NextFunction) => {
    const user = await User.findById(request.user!.id).select('+password');
    if (
      !user ||
      !(await User.isCorrectPassword(
        request.body.currentPassword,
        user.password,
      ))
    )
      return next(new AppError('Wrong current password', 401));
    user.password = request.body.password;
    user.confirmPassword = request.body.confirmPassword;
    await user.save();
    createSendToken(user, 200, response);
  },
);
