import { Router } from 'express';

import { protect } from '../controllers/auth-controller.ts';
import { getCheckoutSession } from '../controllers/booking-controller.ts';

export const router = Router();

router.get('/checkout-session/:tourId', protect, getCheckoutSession);
