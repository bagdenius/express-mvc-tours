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

export const router = Router();

router.route('/top-5').get(aliasTopTours, getTours);
router.route('/stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protect, getTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);
