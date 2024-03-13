import express from 'express';
import { bookController } from '../EndpointsControllers/index.js';
import { authenticate, validateRoles } from '../Helpers/index.js';

export const bookRouter = express.Router();

bookRouter.use(authenticate);

bookRouter.get('/get_one', validateRoles(), async (req, res) => await bookController.getOne(req, res));
bookRouter.get('/get_many', validateRoles(), async (req, res) => await bookController.getMany(req, res));
bookRouter.post('/add', validateRoles(), bookController.create);
bookRouter.post('/receive', validateRoles(), bookController.receive);
bookRouter.post('/return', validateRoles(), bookController.return);
bookRouter.put('/change_data', validateRoles(), bookController.changeData);
bookRouter.delete('/delete');
