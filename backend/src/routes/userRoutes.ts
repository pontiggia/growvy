import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { protect, restrictTo } from '../middlewares/auth';

export const userRoutes = Router();

userRoutes.use(protect);

userRoutes.get('/me', UserController.getMe);
userRoutes.patch('/updateMe', UserController.updateMe);

userRoutes.use(restrictTo('superadmin'));

userRoutes
  .route('/')
  .get(UserController.getUsers)
  .post(UserController.createUser);

userRoutes
  .route('/:id')
  .get(UserController.getUserById)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);
