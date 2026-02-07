import express from 'express';

import {
  changePassword,
  forgotPassword,
  login,
  protect,
  resetPassword,
  signUp,
} from '../controllers/auth-controller.ts';
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

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.patch('/change-password', protect, changePassword);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
