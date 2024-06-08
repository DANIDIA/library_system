import express from 'express';
import { usersController } from '../controllers/index.js';
import { forManagerRule } from '../accessRules/index.js';
import { authenticate } from '../middleware/index.js';

export const usersRouter = express.Router();

usersRouter.use(authenticate);
usersRouter.use(forManagerRule('departmentID'));

usersRouter.post('/add', usersController.add());
usersRouter.get('/get', usersController.get());
usersRouter.put('/update', usersController.update());
usersRouter.put('/change_status', usersController.changeStatus());
