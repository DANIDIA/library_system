import express from 'express';
import {
  createUserController,
  queryUsersController,
  updateUserController,
} from '../controllers/index.js';
import { forManagerRule } from '../accessRules/index.js';
import { authenticate, validateScheme } from '../middleware/index.js';
import {
  defaultUsersScheme,
  queryUsersScheme,
  updateUserScheme,
} from '../schemas/users.shemas.js';

export const usersRouter = express.Router();

usersRouter.use(authenticate);

usersRouter.post(
  '/',
  forManagerRule('departmentID'),
  validateScheme(defaultUsersScheme),
  createUserController
);

usersRouter.get('/', validateScheme(queryUsersScheme), queryUsersController);

usersRouter.put(
  '/:id',
  forManagerRule('departmentID'),
  validateScheme(updateUserScheme),
  updateUserController
);
