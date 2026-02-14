import { Router } from 'express';

import { protect, restrictTo } from '../controllers/auth-controller.ts';
import {
  createBooking,
  deleteBooking,
  getBooking,
  getBookings,
  getCheckoutSession,
  updateBooking,
} from '../controllers/booking-controller.ts';

export const router = Router();

// protected
router.use(protect);
router.get('/checkout-session/:tourId', getCheckoutSession);

// restricted
router.use(restrictTo('lead-guide', 'admin'));
router.route('/').get(getBookings).post(createBooking);
router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);
