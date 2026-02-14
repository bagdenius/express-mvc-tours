import { Router } from 'express';

import { protect, restrictTo } from '../controllers/auth-controller.ts';
import {
  createReview,
  deleteReview,
  getReview,
  getReviews,
  setUserTourIds,
  updateReview,
} from '../controllers/review-contoller.ts';

export const router = Router({ mergeParams: true });

// protected
router.use(protect);
router
  .route('/')
  .get(getReviews)
  .post(restrictTo('user'), setUserTourIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);
