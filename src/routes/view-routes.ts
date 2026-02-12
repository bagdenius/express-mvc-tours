import { Router } from 'express';

import { isLoggedIn } from '../controllers/auth-controller.ts';
import {
  getLoginForm,
  getOverview,
  getTour,
} from '../controllers/view-controller.ts';

export const router = Router();

router
  .use(isLoggedIn)
  .get('/', getOverview)
  .get('/tour/:slug', getTour)
  .get('/login', getLoginForm);
