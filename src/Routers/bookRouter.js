import express from 'express';
import { bookController } from '../EndpointsControllers/index.js';
import { authenticate, validateRoles } from '../Helpers/index.js';

export const bookRouter = express.Router();

bookRouter.use(authenticate);

bookRouter.post('/add', validateRoles(), bookController.add());
bookRouter.get('/get', validateRoles(), bookController.get());
bookRouter.get('/given_amount', validateRoles(), bookController.givenAmount());
bookRouter.post('/give_to_reader', validateRoles(), bookController.giveToReader());
bookRouter.put('/update', validateRoles(), bookController.update());
bookRouter.delete('/remove', validateRoles(), bookController.remove());
