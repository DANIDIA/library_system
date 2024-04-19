import express from 'express';
import { booksController } from '../EndpointsControllers/index.js';
import { authenticate } from '../Helpers/index.js';

export const booksRouter = express.Router();

booksRouter.use(authenticate);

booksRouter.post('/add', booksController.add());
booksRouter.get('/get', booksController.get());
booksRouter.get('/given_amount', booksController.givenAmount());
booksRouter.post('/give_to_reader', booksController.giveToReader());
booksRouter.put('/update', booksController.update());
booksRouter.delete('/remove', booksController.remove());
