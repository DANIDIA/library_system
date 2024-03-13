import express from 'express';
import { readerController } from '../EndpointsControllers/index.js';
import { errorDecorator, authenticate } from '../Helpers/index.js';

export const readerRouter = express.Router();

readerRouter.use(authenticate);

readerRouter.get('/get_one', errorDecorator(readerController.getOne));
readerRouter.get('/get_many', errorDecorator(readerController.getMany));
readerRouter.post('/create', errorDecorator(readerController.create));
readerRouter.put('/change_data', errorDecorator(readerController.changeData));
readerRouter.put('/block', errorDecorator(readerController.block));
readerRouter.put('/unblock', errorDecorator(readerController.unblock));
readerRouter.delete('/delete');
