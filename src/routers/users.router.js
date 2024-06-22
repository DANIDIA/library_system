import express from 'express';
import { usersController } from '../controllers/index.js';
import { forManagerRule } from '../accessRules/index.js';
import { authenticate, validateScheme } from '../middleware/index.js';
import {
  defaultUsersScheme,
  queryUsersScheme,
  updateUserScheme,
} from '../schemas/users.shemas.js';

export const usersRouter = express.Router();

usersRouter.use(authenticate);
usersRouter.use(forManagerRule('departmentID'));

usersRouter.post(
  '/add',
  validateScheme(defaultUsersScheme),
  usersController.add()
);
usersRouter.get(
  '/get',
  validateScheme(queryUsersScheme),
  usersController.get()
);
usersRouter.put(
  '/update',
  validateScheme(updateUserScheme),
  usersController.update()
);
usersRouter.put('/change_status', usersController.changeStatus());
