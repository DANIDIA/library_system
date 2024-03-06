import Router from 'express';
import { bookController } from '../EndpointsControllers/index.js';
import { errorDecorator, allowedRolesDecorator } from '../Helpers/index.js';

export const bookRouter = new Router();

bookRouter.get('/get_one', errorDecorator(allowedRolesDecorator(bookController.getOne)));
bookRouter.get('/get_many', errorDecorator(allowedRolesDecorator(bookController.getMany)));
bookRouter.post('/add', errorDecorator(allowedRolesDecorator(bookController.create)));
bookRouter.put('/change_data', errorDecorator(allowedRolesDecorator(bookController.changeData)));
bookRouter.put('/receive');
bookRouter.put('/return');
bookRouter.delete('/delete');
