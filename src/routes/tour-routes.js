import express from 'express';
import {
  aliasTopTours,
  createTour,
  deleteTour,
  getTour,
  getTours,
  updateTour,
} from '../controllers/tour-controller.js';

export const router = express.Router();

router.route('/top-5').get(aliasTopTours, getTours);

router.route('/').get(getTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
