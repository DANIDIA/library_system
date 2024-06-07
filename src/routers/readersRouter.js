import express from 'express';
import { readersController } from '../controllers/index.js';
import { authenticate } from '../helpers/index.js';

export const readersRouter = express.Router();

readersRouter.use(authenticate);

readersRouter.post('/add', readersController.add());
readersRouter.post('/return_book', readersController.returnBook());
readersRouter.get('/get', readersController.get());
readersRouter.put('/update', readersController.update());
readersRouter.put('/change_status', readersController.changeStatus());
readersRouter.delete('/remove', readersController.remove());
