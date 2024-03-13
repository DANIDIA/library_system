import express from 'express';
import { readerController } from '../EndpointsControllers/index.js';
import { authenticate, validateRoles } from '../Helpers/index.js';

export const readerRouter = express.Router();

readerRouter.use(authenticate);

readerRouter.get('/get_one', validateRoles(), readerController.getOne);
readerRouter.get('/get_many', validateRoles(), readerController.getMany);
readerRouter.post('/create', validateRoles(), readerController.create);
readerRouter.put('/change_data', validateRoles(), readerController.changeData);
readerRouter.put('/block', validateRoles(), readerController.block);
readerRouter.put('/unblock', validateRoles(), readerController.unblock);
readerRouter.delete('/delete');
