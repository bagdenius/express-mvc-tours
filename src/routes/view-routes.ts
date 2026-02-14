import { Router } from 'express';

import { isLoggedIn, protect } from '../controllers/auth-controller.ts';
import { createBookingCheckout } from '../controllers/booking-controller.ts';
import {
  getLoginForm,
  getOverview,
  getProfile,
  getProfileBookings,
  getTour,
  updateUserData,
} from '../controllers/view-controller.ts';

export const router = Router();

router
  .get('/profile', protect, getProfile)
  .get('/profile/bookings', protect, getProfileBookings)
  .post('/submit-user-data', protect, updateUserData);

router
  .use(isLoggedIn)
  .get('/', createBookingCheckout, getOverview)
  .get('/tour/:slug', getTour)
  .get('/login', getLoginForm);
