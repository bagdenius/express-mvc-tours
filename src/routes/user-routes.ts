import express from 'express';

import { signUp } from '../controllers/auth-controller.ts';
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../controllers/user-controller.ts';

export const router = express.Router();

router.post('/signup', signUp);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
