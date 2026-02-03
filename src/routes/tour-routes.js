import express from 'express';
import {
  createTour,
  deleteTour,
  getTour,
  getTours,
  updateTour,
} from '../controllers/tour-controller.js';

export const router = express.Router();

router.route('/').get(getTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
