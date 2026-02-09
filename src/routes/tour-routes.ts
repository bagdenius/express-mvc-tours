import { Router } from 'express';

import { protect, restrictTo } from '../controllers/auth-controller.ts';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getMonthlyPlan,
  getTour,
  getTours,
  getTourStats,
  updateTour,
} from '../controllers/tour-controller.ts';
import { router as reviewRouter } from './review-routes.ts';

export const router = Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5').get(aliasTopTours, getTours);
router.route('/stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'guide', 'lead-guide'), getMonthlyPlan);

router
  .route('/')
  .get(getTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);
