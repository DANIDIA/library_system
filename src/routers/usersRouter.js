import express from 'express';
import { authenticate } from '../helpers/index.js';
import { usersController } from '../endpointsControllers/index.js';
import { forManagerRule } from '../accessRules/index.js';

export const usersRouter = express.Router();

usersRouter.use(authenticate);
usersRouter.use(forManagerRule('departmentID'));

usersRouter.post('/add', usersController.add());
usersRouter.post('/get', usersController.get());
usersRouter.put('/update', usersController.update());
usersRouter.put('/change_status', usersController.changeStatus());
