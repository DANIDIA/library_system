import express from 'express';
import { authenticate, validateRoles } from '../Helpers/index.js';
import { departmentsController } from '../EndpointsControllers/index.js';

export const departmentsRouter = express.Router();

departmentsRouter.use(authenticate);

departmentsRouter.post('/add', validateRoles(), departmentsController.add());
departmentsRouter.get('/get', validateRoles(), departmentsController.get());
departmentsRouter.put('/update', validateRoles(), departmentsController.update());
departmentsRouter.put('/remove', validateRoles(), departmentsController.remove());
