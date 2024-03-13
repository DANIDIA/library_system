import express from 'express';
import { readerController } from '../EndpointsControllers/index.js';
import { errorDecorator, authenticate } from '../Helpers/index.js';
import { validateRoles } from '../Helpers/validateRoles.js';

export const readerRouter = express.Router();

readerRouter.use(authenticate);

readerRouter.get('/get_one', validateRoles(), errorDecorator(readerController.getOne));
readerRouter.get('/get_many', validateRoles(), errorDecorator(readerController.getMany));
readerRouter.post('/create', validateRoles(), errorDecorator(readerController.create));
readerRouter.put('/change_data', validateRoles(), errorDecorator(readerController.changeData));
readerRouter.put('/block', validateRoles(), errorDecorator(readerController.block));
readerRouter.put('/unblock', validateRoles(), errorDecorator(readerController.unblock));
readerRouter.delete('/delete');
