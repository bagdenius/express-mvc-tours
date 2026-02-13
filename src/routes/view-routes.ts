import { Router } from 'express';

import { isLoggedIn, protect } from '../controllers/auth-controller.ts';
import {
  getLoginForm,
  getOverview,
  getProfile,
  getTour,
} from '../controllers/view-controller.ts';

export const router = Router();

router.get('/profile', protect, getProfile);

router
  .use(isLoggedIn)
  .get('/', getOverview)
  .get('/tour/:slug', getTour)
  .get('/login', getLoginForm);
