import { Router } from 'express';

import { protect, restrictTo } from '../controllers/auth-controller.ts';
import {
  createReview,
  deleteReview,
  getReviews,
} from '../controllers/review-contoller.ts';

export const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, restrictTo('user'), createReview);

router.route('/:id').delete(deleteReview);
