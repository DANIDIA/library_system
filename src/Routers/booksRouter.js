import express from 'express';
import { booksController } from '../EndpointsControllers/index.js';
import { authenticate, validateRoles } from '../Helpers/index.js';

export const booksRouter = express.Router();

booksRouter.use(authenticate);

booksRouter.post('/add', validateRoles(), booksController.add());
booksRouter.get('/get', validateRoles(), booksController.get());
booksRouter.get('/given_amount', validateRoles(), booksController.givenAmount());
booksRouter.post('/give_to_reader', validateRoles(), booksController.giveToReader());
booksRouter.put('/update', validateRoles(), booksController.update());
booksRouter.delete('/remove', validateRoles(), booksController.remove());
