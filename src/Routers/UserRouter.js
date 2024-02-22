import Router from 'express';
import { userController } from '../index.js';

export const userRouter = new Router();

userRouter.get('/login', userController.login);
userRouter.get('/logout', userController.logout);
