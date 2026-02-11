import { Router } from 'express';

import { getOverview, getTour } from '../controllers/view-controller.ts';

export const router = Router();

router.get('/', getOverview).get('/tour', getTour);
