import Router from 'express';
import { readerController } from '../EndpointsControllers/index.js';
import { errorDecorator } from '../Helpers/index.js';
import { allowedRolesDecorator } from '../Helpers/allowedRolesDecorator.js';

export const readerRouter = new Router();

readerRouter.get('/get_one', errorDecorator(allowedRolesDecorator(readerController.getOne)));
readerRouter.get('/get_many', errorDecorator(allowedRolesDecorator(readerController.getMany)));
readerRouter.post('/create', errorDecorator(allowedRolesDecorator(readerController.create)));
readerRouter.put('/change_data', errorDecorator(allowedRolesDecorator(readerController.changeData)));
readerRouter.put('/receive_book');
readerRouter.put('/return_book');
readerRouter.put('/block', errorDecorator(allowedRolesDecorator(readerController.block)));
readerRouter.put('/unblock', errorDecorator(allowedRolesDecorator(readerController.unblock)));
readerRouter.delete('/delete');
