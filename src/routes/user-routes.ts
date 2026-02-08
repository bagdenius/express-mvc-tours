import { Router } from 'express';

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
  deleteProfile,
  deleteUser,
  getUser,
  getUsers,
  updateInfo,
  updateUser,
} from '../controllers/user-controller.ts';

export const router = Router();

router.post('/signup', signUp);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.patch('/change-password', protect, changePassword);
router.patch('/update-info', protect, updateInfo);
router.delete('/delete-profile', protect, deleteProfile);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
