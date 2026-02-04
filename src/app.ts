import express from 'express';
import morgan from 'morgan';

import { router as tourRouter } from './routes/tour-routes.ts';
import { router as userRouter } from './routes/user-routes.ts';
import { __dirname } from './utils.ts';

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
  const error = new Error(`Can't find ${request.originalUrl} on this server!`);
  error.status = 'fail';
  error.code = 404;
  next(error);
});

app.use((error, request, response, next) => {
  error.code = error.code || 500;
  error.status = error.status || 'error';
  response
    .status(error.code)
    .json({ status: error.status, message: error.message });
});
