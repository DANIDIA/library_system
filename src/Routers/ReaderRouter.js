import Router from 'express';
import { readerController } from '../EndpointsControllers/index.js';
import { authenticate } from '../Helpers/index.js';

export const readerRouter = new Router();

readerRouter.get('/get_one', authenticate(readerController.getOne));
readerRouter.get('/get_many', authenticate(readerController.getMany));
readerRouter.post('/create', authenticate(readerController.create));
readerRouter.put('/change_data', authenticate(readerController.changeData));
readerRouter.put('/receive_book');
readerRouter.put('/return_book');
readerRouter.put('/block', authenticate(readerController.block));
readerRouter.put('/unblock', authenticate(readerController.unblock));
readerRouter.delete('/delete');
