import express from 'express';
import { readersController } from '../EndpointsControllers/index.js';
import { authenticate, validateRoles } from '../Helpers/index.js';

export const readersRouter = express.Router();

readersRouter.use(authenticate);

readersRouter.post('/add', validateRoles(), readersController.add());
readersRouter.post('/return_book', validateRoles());
readersRouter.get('/get', validateRoles(), readersController.get());
readersRouter.put('/update', validateRoles(), readersController.update());
readersRouter.put('/changeStatus', validateRoles(), readersController.changeStatus());
readersRouter.delete('/remove', validateRoles(), readersController.remove());
