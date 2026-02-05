import express from 'express';

import { login, signUp } from '../controllers/auth-controller.ts';
import {
  createUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../controllers/user-controller.ts';

export const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
