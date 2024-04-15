import express from 'express';
import { readersController } from '../EndpointsControllers/index.js';
import { authenticate, validateRoles } from '../Helpers/index.js';

export const readersRouter = express.Router();

readersRouter.use(authenticate);

readersRouter.post('/add', validateRoles());
readersRouter.post('/return_book', validateRoles());
readersRouter.get('/get', validateRoles());
readersRouter.put('/update', validateRoles());
readersRouter.put('/block', validateRoles());
readersRouter.put('/unblock', validateRoles());
readersRouter.delete('/delete', validateRoles());
