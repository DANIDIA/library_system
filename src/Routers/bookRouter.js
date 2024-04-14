import express from 'express';
import { bookController } from '../EndpointsControllers/index.js';
import { authenticate, validateRoles } from '../Helpers/index.js';

export const bookRouter = express.Router();

bookRouter.use(authenticate);

bookRouter.post('/add', validateRoles());
bookRouter.get('/get', validateRoles());
bookRouter.post('/give_to_reader', validateRoles());
bookRouter.post('/given_amount', validateRoles());
bookRouter.put('/update', validateRoles());
bookRouter.delete('/delete', validateRoles());
