import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import cookieParser from 'cookie-parser';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { rateLimit } from 'express-rate-limit';
import hpp from 'hpp';
import morgan from 'morgan';

import { __dirname } from '../path.ts';
import { globalErrorHandler } from './controllers/error-controller.ts';
import { router as reviewRouter } from './routes/review-routes.ts';
import { router as tourRouter } from './routes/tour-routes.ts';
import { router as userRouter } from './routes/user-routes.ts';
import { router as viewRouter } from './routes/view-routes.ts';
import { AppError } from './utils/app-error.ts';

export const app = express();

const isDev = process.env.NODE_ENV === 'development';

// set up view engine and views directory
app.set('view engine', 'pug');
app.set('views', join(__dirname, 'src', 'views'));

if (!isDev) {
  const manifest = JSON.parse(
    readFileSync(join(__dirname, '/public/dist/.vite/manifest.json'), 'utf-8'),
  );
  app.locals.viteManifest = manifest;
  app.locals.isDev = false;
} else app.locals.isDev = true;

// serving static files
app.use(express.static(join(__dirname, 'public')));

// extended qp for expressions in search query like [gte]
// todo: specify for certain routes
app.set('query parser', 'extended');
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// set security http headers
// app.use(helmet());

// query logs
if (isDev) {
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

// cookie parser
app.use(cookieParser());

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

// routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use((request, response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
