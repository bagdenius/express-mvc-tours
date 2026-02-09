import { Router } from 'express';

import { protect, restrictTo } from '../controllers/auth-controller.ts';
import {
  createReview,
  deleteReview,
  getReview,
  getReviews,
  setTourUserIds,
  updateReview,
} from '../controllers/review-contoller.ts';

export const router = Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router.route('/:id').get(getReview).patch(updateReview).delete(deleteReview);
