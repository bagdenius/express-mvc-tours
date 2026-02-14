import { Router } from 'express';

import { protect, restrictTo } from '../controllers/auth-controller.ts';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getDistances,
  getMonthlyPlan,
  getTour,
  getTours,
  getTourStats,
  getToursWithin,
  resizeTourImages,
  updateTour,
  uploadTourImages,
} from '../controllers/tour-controller.ts';
import { router as reviewRouter } from './review-routes.ts';

export const router = Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5').get(aliasTopTours, getTours);
router.route('/stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'guide', 'lead-guide'), getMonthlyPlan);

router.route('/within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);
