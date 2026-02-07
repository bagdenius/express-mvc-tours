import express from 'express';
import { rateLimit } from 'express-rate-limit';
import morgan from 'morgan';

import { globalErrorHandler } from './controllers/error-controller.ts';
import { router as tourRouter } from './routes/tour-routes.ts';
import { router as userRouter } from './routes/user-routes.ts';
import { AppError } from './utils/app-error.ts';
import { __dirname } from './utils/path.ts';

export const app = express();
app.set('query parser', 'extended');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour',
});
app.use('/api', limiter);

app.use((request, result, next) => {
  Object.defineProperty(request, 'query', {
    ...Object.getOwnPropertyDescriptor(request, 'query'),
    value: request.query,
    writable: true,
  });
  next();
});

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.use((request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
