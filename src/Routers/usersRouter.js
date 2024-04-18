import express from 'express';
import { authenticate, validateRoles } from '../Helpers/index.js';

export const usersRouter = express.Router();

usersRouter.use(authenticate);

usersRouter.post('/add', validateRoles());
usersRouter.post('/get', validateRoles());
usersRouter.post('/update', validateRoles());
usersRouter.post('/change_status', validateRoles());
