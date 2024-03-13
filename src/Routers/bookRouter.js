import express from 'express';
import { bookController } from '../EndpointsControllers/index.js';
import { errorDecorator, authenticate } from '../Helpers/index.js';
import { validateRoles } from '../Helpers/validateRoles.js';

export const bookRouter = express.Router();

bookRouter.use(authenticate);

bookRouter.get('/get_one', validateRoles(), errorDecorator(bookController.getOne));
bookRouter.get('/get_many', validateRoles(), errorDecorator(bookController.getMany));
bookRouter.post('/add', validateRoles(), errorDecorator(bookController.create));
bookRouter.post('/receive', validateRoles(), errorDecorator(bookController.receive));
bookRouter.post('/return', validateRoles(), errorDecorator(bookController.return));
bookRouter.put('/change_data', validateRoles(), errorDecorator(bookController.changeData));
bookRouter.delete('/delete');
