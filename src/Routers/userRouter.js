import express from 'express';
import { userController } from '../index.js';

export const userRouter = express.Router();

userRouter.get('/login', userController.login);
userRouter.get('/logout', userController.logout);
