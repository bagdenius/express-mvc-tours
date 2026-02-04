import express from 'express';
import morgan from 'morgan';

import { router as tourRouter } from './routes/tour-routes.ts';
import { router as userRouter } from './routes/user-routes.ts';
import { __dirname } from './utils.ts';
import { AppError } from './utils/app-error.ts';
import { globalErrorHandler } from './controllers/error-controller.ts';

export const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.set('query parser', 'extended');

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
