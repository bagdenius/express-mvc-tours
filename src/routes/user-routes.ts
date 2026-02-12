import { Router } from 'express';

import {
  changePassword,
  forgotPassword,
  login,
  logout,
  protect,
  resetPassword,
  restrictTo,
  signUp,
} from '../controllers/auth-controller.ts';
import {
  createUser,
  deleteProfile,
  deleteUser,
  getUser,
  getUsers,
  setCurrentUser,
  updateProfile,
  updateUser,
} from '../controllers/user-controller.ts';

export const router = Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

// protected
router.use(protect);
router.get('/profile', setCurrentUser, getUser);
router.patch('/change-password', changePassword);
router.patch('/update-profile', updateProfile);
router.delete('/delete-profile', deleteProfile);

// restricted
router.use(restrictTo('admin'));
router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
