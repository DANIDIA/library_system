import * as express from 'express';
import { booksController } from '../controllers/index.js';
import { authenticate } from '../helpers/index.js';

/**
 * @swagger
 *
 * components:
 *  schemas:
 *    book:
 *      properties:
 *        id:
 *          type: number
 */

export const booksRouter = express.Router();

booksRouter.use(authenticate);

booksRouter.post('/add', booksController.add());
booksRouter.get('/get', booksController.get());
booksRouter.get('/given_amount', booksController.givenAmount());
booksRouter.post('/give_to_reader', booksController.giveToReader());
booksRouter.put('/update', booksController.update());
booksRouter.delete('/remove', booksController.remove());
