import { Router } from 'express';

import { protect, restrictTo } from '../controllers/auth-controller.ts';
import { createReview, getReviews } from '../controllers/review-contoller.ts';

export const router = Router();

router
  .route('/')
  .get(getReviews)
  .post(protect, restrictTo('user'), createReview);
