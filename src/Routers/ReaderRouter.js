import Router from 'express';
import { readerController } from '../EndpointsControllers/index.js';
import { errorDecorator } from '../Helpers/index.js';

export const readerRouter = new Router();

readerRouter.get('/get_one', errorDecorator(readerController.getOne));
readerRouter.get('/get_many', errorDecorator(readerController.getMany));
readerRouter.post('/create', errorDecorator(readerController.create));
readerRouter.put('/change_data', errorDecorator(readerController.changeData));
readerRouter.put('/receive_book');
readerRouter.put('/return_book');
readerRouter.put('/block', errorDecorator(readerController.block));
readerRouter.put('/unblock', errorDecorator(readerController.unblock));
readerRouter.delete('/delete');
