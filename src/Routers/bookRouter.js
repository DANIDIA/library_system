import express from 'express';
import { bookController } from '../EndpointsControllers/index.js';
import { errorDecorator, authenticate } from '../Helpers/index.js';

export const bookRouter = express.Router();

bookRouter.use(authenticate);

bookRouter.get('/get_one', errorDecorator(bookController.getOne));
bookRouter.get('/get_many', errorDecorator(bookController.getMany));
bookRouter.post('/add', errorDecorator(bookController.create));
bookRouter.post('/receive', errorDecorator(bookController.receive));
bookRouter.post('/return', errorDecorator(bookController.return));
bookRouter.put('/change_data', errorDecorator(bookController.changeData));
bookRouter.delete('/delete');
