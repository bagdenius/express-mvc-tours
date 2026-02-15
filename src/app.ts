import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expressMongoSanitize } from '@exortek/express-mongo-sanitize';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { xss } from 'express-xss-sanitizer';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

import { __dirname } from '../path.ts';
import { globalErrorHandler } from './controllers/error-controller.ts';
import { router as bookingRouter } from './routes/booking-routes.ts';
import { router as reviewRouter } from './routes/review-routes.ts';
import { router as tourRouter } from './routes/tour-routes.ts';
import { router as userRouter } from './routes/user-routes.ts';
import { router as viewRouter } from './routes/view-routes.ts';
import { AppError } from './utils/app-error.ts';

const isDev = process.env.NODE_ENV === 'development';

export const app = express();
app.enable('trust proxy');

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

// requests compression
app.use(compression());

// set http headers security
if (isDev) app.use(helmet({ contentSecurityPolicy: false }));
else
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          workerSrc: ["'self'", 'blob:'],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://api.mapbox.com',
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: [
            "'self'",
            'data:',
            'blob:',
            'https://api.mapbox.com',
            'https://*.tiles.mapbox.com',
            'https://*.mapbox.com',
          ],
          connectSrc: [
            "'self'",
            'https://api.mapbox.com',
            'https://events.mapbox.com',
          ],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    }),
  );

// query logs
if (isDev) {
  app.use(morgan('dev'));
}

// cookie parser
app.use(cookieParser());

// rate limit
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour',
});
app.use('/api', limiter);

// extended qp for expressions in search query like [gte]
app.set('query parser', 'extended');

// body parser with json in request.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// data sanitization (noSQL query injection)
app.use(expressMongoSanitize());

// data sanitization (XSS)
app.use(xss());

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
app.use('/api/v1/bookings', bookingRouter);
app.use((request, _response, next) => {
  next(new AppError(`Can't find ${request.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
