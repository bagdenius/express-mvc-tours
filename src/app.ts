import express from 'express';
import morgan from 'morgan';

import { router as tourRouter } from './routes/tour-routes.js';
import { router as userRouter } from './routes/user-routes.js';
import { __dirname } from './utils.js';

export const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.set('query parser', 'extended');

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
