import express from 'express';
import { userController } from '../index.js';
import { errorDecorator } from '../Helpers/index.js';

export const userRouter = express.Router();

userRouter.get('/login', errorDecorator(userController.login));
userRouter.get('/logout', errorDecorator(userController.logout));
