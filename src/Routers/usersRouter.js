import express from 'express';
import { authenticate, validateRoles } from '../Helpers/index.js';
import { usersController } from '../EndpointsControllers/index.js';

export const usersRouter = express.Router();

usersRouter.use(authenticate);

usersRouter.post('/add', validateRoles(), usersController.add());
usersRouter.post('/get', validateRoles(), usersController.get());
usersRouter.post('/update', validateRoles(), usersController.update());
usersRouter.post('/change_status', validateRoles(), usersController.changeStatus());
