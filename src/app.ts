import express, { urlencoded } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import { xss } from 'express-xss-sanitizer';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

import { globalErrorHandler } from './controllers/error-controller.ts';
import { router as reviewRouter } from './routes/review-routes.ts';
import { router as tourRouter } from './routes/tour-routes.ts';
import { router as userRouter } from './routes/user-routes.ts';
import { AppError } from './utils/app-error.ts';
import { __dirname } from './utils/path.ts';

export const app = express();

// extended qp for expressions in search query like [gte]
// todo: specify for certain routes
app.set('query parser', 'extended');
app.use(urlencoded({ extended: true }));

// set security http headers
app.use(helmet());

// query logs
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limit
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour',
});
app.use('/api', limiter);

// make request.query writable
// warn: kinda workaround, should to look up on this
// should try Object.assign
app.use((request, result, next) => {
  Object.defineProperty(request, 'query', {
    ...Object.getOwnPropertyDescriptor(request, 'query'),
    value: request.query,
    writable: true,
  });
  next();
});

// body parser with json in request.body
app.use(express.json({ limit: '10kb' }));

// data sanitization (noSQL query injection)
app.use(mongoSanitize());

// data sanitization (XSS)
// app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'averageRating',
      'ratingCount',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// serving static files
app.use(express.static(`${__dirname}/public`));

// routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use((request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
